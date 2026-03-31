use image::{GrayImage, Luma};
use rayon::prelude::*;
use std::fs::{self, File};
use std::io::Write;
use std::path::Path;

struct FrameData {
    index: u16,
    raw_pixels: Vec<u8>,
    screen_left: i32,
    screen_top: i32,
    bw: u32,
    bh: u32,
}

fn get_mask_value(x: i32, y: u32, offset: i32, positive_mask: &GrayImage, is_l2r: bool) -> u8 {
    let mask_x = x - offset;
    if mask_x < 0 {
        if is_l2r {
            255
        } else {
            0
        }
    } else if mask_x >= positive_mask.width() as i32 {
        if is_l2r {
            0
        } else {
            255
        }
    } else {
        positive_mask.get_pixel(mask_x as u32, y)[0]
    }
}

pub fn build_slider_binaries(
    image_path: &str,
    mask_path: &str,
    out_dir: &str,
    id_name: &str,
    cx: u16,
    cy: u16,
    r0: i16,
    r1: i16,
    d0: i16,
    d1: i16,
    min_val: i32,
    max_val: i32,
    frames: u16,
) -> Result<(), String> {
    let img = image::open(image_path)
        .map_err(|e| format!("Failed to open image: {}", e))?
        .to_rgba8();

    let w = img.width();
    let h = img.height();

    // 1. Загружаем маску, если она указана
    let mut ext_mask = None;
    if !mask_path.is_empty() && Path::new(mask_path).exists() {
        if let Ok(m) = image::open(mask_path) {
            ext_mask = Some(m.into_luma8());
        }
    }

    let assets_dir = Path::new(out_dir).join("assets");
    let headers_dir = Path::new(out_dir).join("headers");
    fs::create_dir_all(&assets_dir).map_err(|e| e.to_string())?;
    fs::create_dir_all(&headers_dir).map_err(|e| e.to_string())?;

    let id_lower = id_name.to_lowercase();
    let id_upper = id_name.to_uppercase();

    let mut img_bin = File::create(assets_dir.join(format!("img_{}.bin", id_lower)))
        .map_err(|e| e.to_string())?;
    let mut tab_bin = File::create(assets_dir.join(format!("tab_{}.bin", id_lower)))
        .map_err(|e| e.to_string())?;
    let mut header_file =
        File::create(headers_dir.join(format!("arr_{}.h", id_lower))).map_err(|e| e.to_string())?;

    // 2. Создаем ЧБ копию, накладывая внешнюю МАСКУ сразу на альфа-канал!
    let mut smpl = GrayImage::new(w, h);
    for y in 0..h {
        for x in 0..w {
            let p = img.get_pixel(x, y);
            let mut alpha = p[3] as f32 / 255.0;

            // Если есть маска, умножаем прозрачность на ее значение
            if let Some(ref m) = ext_mask {
                if x < m.width() && y < m.height() {
                    alpha *= m.get_pixel(x, y)[0] as f32 / 255.0;
                }
            }

            let luma = (0.299 * p[0] as f32 + 0.587 * p[1] as f32 + 0.114 * p[2] as f32) * alpha;
            smpl.put_pixel(x, y, Luma([luma as u8]));
        }
    }

    let is_l2r = r0 < r1;

    // 3. Создаем позитивную маску со скошенным углом
    let draw_w = w * 2;
    let draw_h = h * 2;
    let mut draw_mask = GrayImage::new(draw_w, draw_h);

    let d0_rad = (90.0 - d0 as f32).to_radians();
    let x_slant = if d0_rad.abs() < 0.001 || d0_rad.tan().abs() < 0.001 {
        0.0
    } else {
        (draw_h as f32 - 1.0) / d0_rad.tan()
    };

    // Отрисовка полигона маски в зависимости от направления слайдера
    if is_l2r {
        let p1 = imageproc::point::Point::new(0, 0);
        let p2 = imageproc::point::Point::new(0, draw_h as i32 - 1);
        let p3 = imageproc::point::Point::new(0, draw_h as i32 - 1);
        let p4 = imageproc::point::Point::new(x_slant as i32, 0);
        imageproc::drawing::draw_polygon_mut(&mut draw_mask, &[p1, p2, p3, p4], Luma([255]));
    } else {
        let p1 = imageproc::point::Point::new(x_slant as i32, 0);
        let p2 = imageproc::point::Point::new(0, draw_h as i32 - 1);
        let p3 = imageproc::point::Point::new(draw_w as i32 - 1, draw_h as i32 - 1);
        let p4 = imageproc::point::Point::new(draw_w as i32 - 1, 0);
        imageproc::drawing::draw_polygon_mut(&mut draw_mask, &[p1, p2, p3, p4], Luma([255]));
    }

    let positive_mask =
        image::imageops::resize(&draw_mask, w, h, image::imageops::FilterType::Lanczos3);

    writeln!(header_file, "\n#define  ARR_NUM_{}  {}", id_upper, frames).unwrap();
    writeln!(header_file, "\n#define  ARR_TAB_{} \\", id_upper).unwrap();

    // 4. Многопоточный рендер (Рассчитываем Bounding Box и пиксели)
    let frames_data: Vec<FrameData> = (0..=frames)
        .into_par_iter()
        .map(|i| {
            let offset_curr = r0 as f32 - (i as f32 * (r0 as f32 - r1 as f32) / frames as f32);
            let offset_prev = if i == 0 {
                if is_l2r {
                    r0 as f32 - (w as f32 * 2.0)
                } else {
                    r0 as f32 + (w as f32 * 2.0)
                }
            } else {
                r0 as f32 - ((i - 1) as f32 * (r0 as f32 - r1 as f32) / frames as f32)
            };

            let mut min_x1 = w;
            let mut min_y1 = h;
            let mut max_x1 = 0;
            let mut max_y1 = 0;
            let mut has_pixels1 = false;

            for y in 0..h {
                for x in 0..w {
                    let m_curr =
                        get_mask_value(x as i32, y, offset_curr as i32, &positive_mask, is_l2r);
                    let m_prev = if i == 0 {
                        0
                    } else {
                        get_mask_value(x as i32, y, offset_prev as i32, &positive_mask, is_l2r)
                    };

                    // Дельта (разница) между текущим и предыдущим кадром
                    let diff_m = m_curr.saturating_sub(m_prev) as f32 / 255.0;

                    if diff_m > 0.001 {
                        let smpl_val = smpl.get_pixel(x, y)[0] as f32;
                        let val = (smpl_val * diff_m) as u8;
                        if val > 0 {
                            min_x1 = min_x1.min(x);
                            min_y1 = min_y1.min(y);
                            max_x1 = max_x1.max(x);
                            max_y1 = max_y1.max(y);
                            has_pixels1 = true;
                        }
                    }
                }
            }

            let bx = if has_pixels1 { min_x1 } else { 0 };
            let by = if has_pixels1 { min_y1 } else { 0 };
            let mut bw = if has_pixels1 { max_x1 - bx + 1 } else { 1 };
            let bh = if has_pixels1 { max_y1 - min_y1 + 1 } else { 1 };

            if bw % 2 == 1 {
                bw += 1;
            } // Ширина должна быть четной

            let mut raw_pixels = Vec::with_capacity((bw * bh) as usize);
            for cy in by..(by + bh) {
                for cx in bx..(bx + bw) {
                    if cx < w && cy < h {
                        let m_curr = get_mask_value(
                            cx as i32,
                            cy,
                            offset_curr as i32,
                            &positive_mask,
                            is_l2r,
                        ) as f32
                            / 255.0;
                        let smpl_val = smpl.get_pixel(cx, cy)[0] as f32;
                        raw_pixels.push((smpl_val * m_curr) as u8);
                    } else {
                        raw_pixels.push(0);
                    }
                }
            }

            FrameData {
                index: i,
                raw_pixels,
                screen_left: bx as i32 + cx as i32,
                screen_top: by as i32 + cy as i32,
                bw,
                bh,
            }
        })
        .collect();

    // 5. Последовательная запись в бинарники
    let mut current_offset: u32 = 0;
    for frame in frames_data {
        img_bin
            .write_all(&frame.raw_pixels)
            .map_err(|e| e.to_string())?;

        tab_bin.write_all(&current_offset.to_le_bytes()).unwrap();
        tab_bin
            .write_all(&(frame.screen_left as i16).to_le_bytes())
            .unwrap();
        tab_bin
            .write_all(&(frame.screen_top as i16).to_le_bytes())
            .unwrap();
        tab_bin.write_all(&(frame.bw as u16).to_le_bytes()).unwrap();
        tab_bin.write_all(&(frame.bh as u16).to_le_bytes()).unwrap();

        let end_char = if frame.index == frames { "" } else { " \\" };
        writeln!(
            header_file,
            "  /* {:<3} */  {{ {:>7},  {:>3},  {:>3},  {:>3},  {:>3} }},{}",
            frame.index,
            current_offset,
            frame.screen_left,
            frame.screen_top,
            frame.bw,
            frame.bh,
            end_char
        )
        .unwrap();

        current_offset += (frame.bw * frame.bh) as u32;
    }

    let arr_tab_name = format!("arr_tab_{}", id_lower);
    let variable_def = format!("ARROW_TABLE {}[ARR_NUM_{} + 1]", arr_tab_name, id_upper);

    writeln!(header_file, "\n\n  extern {};", variable_def).unwrap();
    writeln!(header_file, "  // APP_Arrow.c:").unwrap();
    writeln!(
        header_file,
        "  // {} = {{ARR_TAB_{}}};",
        variable_def, id_upper
    )
    .unwrap();
    writeln!(header_file, "  // app_arrow.h:").unwrap();
    writeln!(header_file, "  // #include  \"arr_{}.h\"", id_lower).unwrap();

    let arr_def = format!("ID_ARROW_{}", id_upper);
    writeln!(header_file, "  // #define {}  id_me", arr_def).unwrap();
    writeln!(header_file, "  //  ARROW_DEFINE_DEFAULT").unwrap();

    let padded_def = format!("{},", arr_def);
    writeln!(header_file, "  // {{ {:<17} _ON,  IC_RED, AT_EXT,{:>4},{:>4},{:>4},{:>4},   0,   0,{:>4},{:>4},{:>5},{:>6},{:>5} }}, \\",
        padded_def, cx, cy, r0, r1, d0, d1, min_val, max_val, frames
    ).unwrap();

    Ok(())
}
