use image::GrayImage;
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

// Генерация маски с 4x MSAA (сглаживанием)
fn create_arc_mask(size: u32, r0: f32, r1: f32, sa: f32, ea: f32) -> GrayImage {
    let mut img = GrayImage::new(size, size);
    let cx = size as f32 / 2.0;
    let cy = size as f32 / 2.0;

    let start_a = (sa + 90.0).min(ea + 90.0);
    let end_a = (sa + 90.0).max(ea + 90.0);

    for y in 0..size {
        for x in 0..size {
            let mut hits = 0;
            for sy in 0..4 {
                for sx in 0..4 {
                    let px = x as f32 + (sx as f32 + 0.5) / 4.0;
                    let py = y as f32 + (sy as f32 + 0.5) / 4.0;
                    let dx = px - cx;
                    let dy = py - cy;
                    let d = (dx * dx + dy * dy).sqrt();

                    if d >= r0 && d <= r1 {
                        let mut a = dy.atan2(dx).to_degrees();
                        if a < 0.0 {
                            a += 360.0;
                        }

                        let a_variants = [a - 360.0, a, a + 360.0, a + 720.0];
                        for av in a_variants {
                            if av >= start_a && av <= end_a {
                                hits += 1;
                                break;
                            }
                        }
                    }
                }
            }
            if hits > 0 {
                img.put_pixel(x, y, image::Luma([(hits * 255 / 16) as u8]));
            }
        }
    }
    img
}

pub fn build_arc_binaries(
    image_path: &str,
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

    // Делаем исходник квадратным (как в Python: Image.new("L", (src.width, src.width)))
    let smpl_w = img.width().max(img.height());
    let mut smpl = GrayImage::new(smpl_w, smpl_w);
    for y in 0..img.height() {
        for x in 0..img.width() {
            let p = img.get_pixel(x, y);
            let alpha = p[3] as f32 / 255.0;
            let luma = (0.299 * p[0] as f32 + 0.587 * p[1] as f32 + 0.114 * p[2] as f32) * alpha;
            smpl.put_pixel(x, y, image::Luma([luma as u8]));
        }
    }

    writeln!(header_file, "\n#define  ARR_NUM_{}  {}", id_upper, frames).unwrap();
    writeln!(header_file, "\n#define  ARR_TAB_{} \\", id_upper).unwrap();

    let mask_size = (r1 * 2) as u32;
    let pos_x = (smpl_w.saturating_sub(mask_size)) / 2;
    let pos_y = pos_x;

    // МНОГОПОТОЧНЫЙ РЕНДЕР
    let frames_data: Vec<FrameData> = (0..=frames)
        .into_par_iter()
        .map(|i| {
            let step = (d1 as f32 - d0 as f32) / frames as f32;
            let angle_end = if i == 0 {
                d0 as f32 + step
            } else {
                d0 as f32 + i as f32 * step
            };
            let angle_start = if i == 0 {
                d0 as f32
            } else {
                d0 as f32 + (i as f32 - 1.0) * step
            };

            let positive_mask =
                create_arc_mask(mask_size, r0 as f32, r1 as f32, d0 as f32, angle_end);
            let diff_mask =
                create_arc_mask(mask_size, r0 as f32, r1 as f32, angle_start, angle_end);

            let mut min_x = mask_size;
            let mut min_y = mask_size;
            let mut max_x = 0;
            let mut max_y = 0;
            let mut has_pixels = false;

            for (x, y, p) in diff_mask.enumerate_pixels() {
                if p[0] > 0 {
                    min_x = min_x.min(x);
                    min_y = min_y.min(y);
                    max_x = max_x.max(x);
                    max_y = max_y.max(y);
                    has_pixels = true;
                }
            }

            let (bx, by, mut bw, bh) = if has_pixels {
                (min_x, min_y, max_x - min_x + 1, max_y - min_y + 1)
            } else {
                (mask_size / 2, mask_size / 2, 1, 1)
            };

            if bw % 2 == 1 {
                bw += 1;
            } // GUI requires even width

            let mut raw_pixels = Vec::with_capacity((bw * bh) as usize);
            for y in by..(by + bh) {
                for x in bx..(bx + bw) {
                    if i == 0 {
                        raw_pixels.push(0); // 0-й кадр всегда пустой (стирает)
                    } else {
                        let m = positive_mask.get_pixel(x, y)[0] as f32 / 255.0;
                        let s_x = x as i32 + pos_x as i32;
                        let s_y = y as i32 + pos_y as i32;
                        let s =
                            if s_x >= 0 && s_x < smpl_w as i32 && s_y >= 0 && s_y < smpl_w as i32 {
                                smpl.get_pixel(s_x as u32, s_y as u32)[0] as f32
                            } else {
                                0.0
                            };
                        raw_pixels.push((s * m) as u8);
                    }
                }
            }

            FrameData {
                index: i,
                raw_pixels,
                screen_left: bx as i32 + pos_x as i32 + cx as i32 - (smpl_w as i32 / 2),
                screen_top: by as i32 + pos_y as i32 + cy as i32 - (smpl_w as i32 / 2),
                bw,
                bh,
            }
        })
        .collect();

    // ПОСЛЕДОВАТЕЛЬНАЯ ЗАПИСЬ
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
