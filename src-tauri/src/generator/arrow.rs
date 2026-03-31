use image::{DynamicImage, Rgb, RgbImage};
use imageproc::geometric_transformations::{rotate_about_center, Interpolation};
use std::fs::{self, File};
use std::io::Write;
use std::path::Path;
// Подключаем Rayon для многопоточности
use rayon::prelude::*;

// Вспомогательная структура для хранения отрендеренного кадра в памяти
struct FrameData {
    index: u16,
    raw_pixels: Vec<u8>,
    screen_left: i32,
    screen_top: i32,
    bw: u32,
    bh: u32,
}

pub fn build_arrow_binaries(
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
    // 1. Читаем исходную картинку
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

    // 2. Подготовка холста
    let scale_factor = img.height() as f32 / (r1 - r0) as f32;
    let mut side = (r1 as f32 * 2.0 * scale_factor) as u32;
    if side % 2 == 1 {
        side += 1;
    }

    let mut canvas = RgbImage::new(side, side);
    let paste_x = (side.saturating_sub(img.width())) / 2;

    for y in 0..img.height() {
        for x in 0..img.width() {
            let pixel = img.get_pixel(x, y);
            let alpha = pixel[3] as f32 / 255.0;
            if alpha > 0.0 {
                let bg_pixel = canvas.get_pixel_mut(paste_x + x, y);
                bg_pixel[0] = (pixel[0] as f32 * alpha) as u8;
                bg_pixel[1] = (pixel[1] as f32 * alpha) as u8;
                bg_pixel[2] = (pixel[2] as f32 * alpha) as u8;
            }
        }
    }

    writeln!(header_file, "\n#define  ARR_NUM_{}  {}", id_upper, frames).unwrap();
    writeln!(header_file, "\n#define  ARR_TAB_{}", id_upper).unwrap();

    let target_side = (r1 * 2) as u32;

    // 3. МНОГОПОТОЧНЫЙ РЕНДЕР (Тяжелая математика)
    // into_par_iter() разобьет задачу на все доступные ядра процессора,
    // а collect() соберет их обратно СТРОГО в правильном порядке!
    let frames_data: Vec<FrameData> = (0..=frames)
        .into_par_iter()
        .map(|i| {
            let progress = if frames == 0 {
                0.0
            } else {
                i as f32 / frames as f32
            };
            let angle_deg = 180.0 - (d0 as f32 + (d1 as f32 - d0 as f32) * progress);
            let angle_rad = -angle_deg.to_radians();

            // Тяжелые операции: поворот и ресайз
            let rotated =
                rotate_about_center(&canvas, angle_rad, Interpolation::Bicubic, Rgb([0, 0, 0]));
            let resized = image::imageops::resize(
                &rotated,
                target_side,
                target_side,
                image::imageops::FilterType::Lanczos3,
            );
            let luma = DynamicImage::ImageRgb8(resized).into_luma8();

            let mut min_x = target_side;
            let mut min_y = target_side;
            let mut max_x = 0;
            let mut max_y = 0;
            let mut has_pixels = false;

            for (x, y, pixel) in luma.enumerate_pixels() {
                if pixel[0] > 0 {
                    min_x = min_x.min(x);
                    min_y = min_y.min(y);
                    max_x = max_x.max(x);
                    max_y = max_y.max(y);
                    has_pixels = true;
                }
            }

            let (bx, by, bw, bh) = if has_pixels {
                (min_x, min_y, max_x - min_x + 1, max_y - min_y + 1)
            } else {
                (target_side / 2, target_side / 2, 1, 1)
            };

            // Кроп и сохранение в вектор байтов
            let cropped = image::imageops::crop_imm(&luma, bx, by, bw, bh).to_image();

            FrameData {
                index: i,
                raw_pixels: cropped.into_raw(),
                screen_left: bx as i32 + cx as i32 - r1 as i32,
                screen_top: by as i32 + cy as i32 - r1 as i32,
                bw,
                bh,
            }
        })
        .collect();

    // 4. ПОСЛЕДОВАТЕЛЬНАЯ ЗАПИСЬ (Быстрый I/O)
    // Проходим по уже готовым кадрам и пишем в файлы с правильным offset
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

    // 5. Концовка header файла
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
