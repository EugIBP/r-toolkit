// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]
mod generator;

use image::open;
use rayon::prelude::*;
use std::path::Path;
use std::time::Instant;
use tauri::{Emitter, Window};
use walkdir::WalkDir;

const BAYER_MATRIX: [[f32; 4]; 4] = [
    [
        0.0 / 16.0 - 0.5,
        8.0 / 16.0 - 0.5,
        2.0 / 16.0 - 0.5,
        10.0 / 16.0 - 0.5,
    ],
    [
        12.0 / 16.0 - 0.5,
        4.0 / 16.0 - 0.5,
        14.0 / 16.0 - 0.5,
        6.0 / 16.0 - 0.5,
    ],
    [
        3.0 / 16.0 - 0.5,
        11.0 / 16.0 - 0.5,
        1.0 / 16.0 - 0.5,
        9.0 / 16.0 - 0.5,
    ],
    [
        15.0 / 16.0 - 0.5,
        7.0 / 16.0 - 0.5,
        13.0 / 16.0 - 0.5,
        5.0 / 16.0 - 0.5,
    ],
];

fn apply_dither(val: u8, bits: u8, bayer_val: f32) -> u8 {
    let max_val = ((1 << bits) - 1) as f32;
    let norm = (val as f32) / 255.0;
    let dithered = norm + bayer_val * (1.0 / max_val);
    let clamped = dithered.clamp(0.0, 1.0);
    ((clamped * max_val).round() * (255.0 / max_val)) as u8
}

#[tauri::command]
fn load_project(file_path: String) -> Result<String, String> {
    std::fs::read_to_string(&file_path).map_err(|e| e.to_string())
}

#[tauri::command]
fn save_text_file(path: String, content: String) -> Result<(), String> {
    if let Some(parent) = std::path::Path::new(&path).parent() {
        std::fs::create_dir_all(parent).map_err(|e| format!("Failed to create dirs: {}", e))?;
    }
    std::fs::write(&path, content).map_err(|e| format!("OS Write Error: {}", e))
}

#[tauri::command]
fn copy_asset_file(source: String, destination: String) -> Result<(), String> {
    if let Some(parent) = std::path::Path::new(&destination).parent() {
        std::fs::create_dir_all(parent).map_err(|e| format!("Failed to create dirs: {}", e))?;
    }
    std::fs::copy(&source, &destination).map_err(|e| format!("Copy Error: {}", e))?;
    Ok(())
}

// НОВАЯ ФУНКЦИЯ ДЛЯ ОТКРЫТИЯ ПАПКИ В ПРОВОДНИКЕ
#[tauri::command]
fn open_folder(path: String) -> Result<(), String> {
    #[cfg(target_os = "windows")]
    std::process::Command::new("explorer")
        .arg(&path)
        .spawn()
        .map_err(|e| e.to_string())?;

    #[cfg(target_os = "macos")]
    std::process::Command::new("open")
        .arg(&path)
        .spawn()
        .map_err(|e| e.to_string())?;

    #[cfg(target_os = "linux")]
    std::process::Command::new("xdg-open")
        .arg(&path)
        .spawn()
        .map_err(|e| e.to_string())?;

    Ok(())
}

#[derive(serde::Serialize)]
struct ScannedAsset {
    path: String,
    dir: String,
    asset_type: String,
}

fn get_asset_type(dir_name: &str) -> String {
    let dir_lower = dir_name.to_lowercase();
    if dir_lower.contains("background") {
        "bin".to_string()
    } else if dir_lower.contains("pal") {
        "pal".to_string()
    } else {
        "ico".to_string()
    }
}

#[tauri::command]
fn scan_project_assets(base_dir: String) -> Result<Vec<ScannedAsset>, String> {
    let mut assets = Vec::new();
    let base_path = std::path::Path::new(&base_dir);

    if !base_path.exists() {
        return Ok(assets);
    }

    let walker = WalkDir::new(base_path).into_iter().filter_entry(|e| {
        let name = e.file_name().to_string_lossy();
        !name.starts_with('.') && !name.starts_with('_')
    });

    for entry in walker.flatten() {
        if entry.file_type().is_file() {
            let path = entry.path();
            let path_str = path.to_string_lossy().to_lowercase();

            if path_str.ends_with(".png") || path_str.ends_with(".jpg") {
                if let Ok(rel_path) = path.strip_prefix(base_path) {
                    let dir_name = rel_path
                        .parent()
                        .map(|p| p.to_string_lossy().to_string())
                        .unwrap_or_default();

                    if dir_name.is_empty() {
                        continue;
                    }

                    let asset_type = get_asset_type(&dir_name);

                    assets.push(ScannedAsset {
                        path: rel_path.to_string_lossy().replace("/", "\\"),
                        dir: dir_name.replace("/", "\\"),
                        asset_type,
                    });
                }
            }
        }
    }

    Ok(assets)
}

#[tauri::command]
fn delete_project_file(path: String) -> Result<(), String> {
    std::fs::remove_file(path).map_err(|e| e.to_string())
}

#[tauri::command]
fn create_project(
    base_path: String,
    folders: Vec<String>,
    width: u32,
    height: u32,
) -> Result<String, String> {
    let project_path = Path::new(&base_path);

    std::fs::create_dir_all(&project_path)
        .map_err(|e| format!("Failed to create project folder: {}", e))?;

    for folder in &folders {
        let folder_path = project_path.join(folder);
        std::fs::create_dir_all(&folder_path)
            .map_err(|e| format!("Failed to create folder {}: {}", folder, e))?;
    }

    let rtoolkit_path = project_path.join(".rtoolkit");
    std::fs::create_dir_all(&rtoolkit_path)
        .map_err(|e| format!("Failed to create .rtoolkit: {}", e))?;

    let canvas_json = rtoolkit_path.join("canvas.json");
    std::fs::write(&canvas_json, r#"{"spriteAssets":{}}"#)
        .map_err(|e| format!("Failed to write canvas.json: {}", e))?;

    let description_json = project_path.join("description.json");
    let content = format!(
        r###"{{
  "Version": 0.1,
  "DisplayWidth": {},
  "DisplayHeight": {},
  "Width": "{}",
  "Height": "{}",
  "Settings": {{
    "AppendRawToBinary": true,
    "BinaryCode": "53535301",
    "FixedPriorityAssetsSize": 4194304
  }},
  "Objects": [],
  "Colors": {{
    "PURE_BLACK": "#00000000",
    "PURE_BLANK": "#00fe00fe",
    "PURE_BLUE": "#000000ff",
    "PURE_GREEN": "#0000ff00",
    "PURE_ORANGE": "#00ffae00",
    "PURE_PURPLE": "#00ff00ff",
    "PURE_RED": "#00ff0000",
    "PURE_WHITE": "#00ffffff",
    "PURE_YELLOW": "#00ffff00"
  }},
  "FlashMode": {{
    "None": 0,
    "Half": 1,
    "1Hz": 2,
    "2Hz": 3,
    "3Hz": 4
  }},
  "Screens": [
    {{
      "Name": "SCREEN_DEFAULT",
      "Background": "",
      "Icons": []
    }}
  ],
  "PriorityAssets": ["assets\\FF000000.BIN"],
  "Assets": []
}}"###,
        width, height, width, height
    );

    std::fs::write(&description_json, content)
        .map_err(|e| format!("Failed to write description.json: {}", e))?;

    description_json
        .to_str()
        .map(|s| s.to_string())
        .ok_or_else(|| "Failed to convert path".to_string())
}

#[tauri::command]
fn process_images(
    window: Window,
    in_dir: String,
    out_dir: String,
    mode: String,
) -> Result<String, String> {
    let start_time = Instant::now();
    let entries: Vec<_> = WalkDir::new(&in_dir)
        .into_iter()
        .filter_map(|e| e.ok())
        .filter(|e| {
            let path = e.path().to_string_lossy().to_lowercase();
            path.ends_with(".png")
                || path.ends_with(".jpg")
                || path.ends_with(".jpeg")
                || path.ends_with(".bmp")
        })
        .collect();

    let total = entries.len();
    if total == 0 {
        return Err("No images found".into());
    }
    std::fs::create_dir_all(&out_dir).map_err(|e| e.to_string())?;

    entries.par_iter().enumerate().for_each(|(idx, entry)| {
        let path = entry.path();
        let file_name = path.file_name().unwrap().to_string_lossy();
        let out_path = Path::new(&out_dir).join(file_name.as_ref());

        if idx % 5 == 0 || idx == total - 1 {
            let progress = ((idx as f32 / total as f32) * 100.0) as u32;
            let _ = window.emit("dither-progress", progress);
            let _ = window.emit("dither-status", format!("Processing: {}", file_name));
        }

        if let Ok(img) = open(path) {
            let mut rgba_img = img.to_rgba8();
            let width = rgba_img.width() as usize;
            rgba_img
                .as_mut()
                .chunks_exact_mut(4)
                .enumerate()
                .for_each(|(i, pixel)| {
                    let x = i % width;
                    let y = i / width;
                    let bayer_val = BAYER_MATRIX[y % 4][x % 4];
                    match mode.as_str() {
                        "4444" => {
                            pixel[0] = apply_dither(pixel[0], 4, bayer_val);
                            pixel[1] = apply_dither(pixel[1], 4, bayer_val);
                            pixel[2] = apply_dither(pixel[2], 4, bayer_val);
                            pixel[3] = apply_dither(pixel[3], 4, bayer_val);
                        }
                        "1555" => {
                            pixel[0] = apply_dither(pixel[0], 5, bayer_val);
                            pixel[1] = apply_dither(pixel[1], 5, bayer_val);
                            pixel[2] = apply_dither(pixel[2], 5, bayer_val);
                            pixel[3] = if pixel[3] > 127 { 255 } else { 0 };
                        }
                        _ => {
                            pixel[0] = apply_dither(pixel[0], 5, bayer_val);
                            pixel[1] = apply_dither(pixel[1], 6, bayer_val);
                            pixel[2] = apply_dither(pixel[2], 5, bayer_val);
                        }
                    }
                });
            if mode == "565" {
                let rgb_img = image::DynamicImage::ImageRgba8(rgba_img).into_rgb8();
                let _ = rgb_img.save_with_format(out_path, image::ImageFormat::Png);
            } else {
                let _ = rgba_img.save_with_format(out_path, image::ImageFormat::Png);
            }
        }
    });

    let elapsed = start_time.elapsed();
    let final_msg = format!(
        "Done! Processed {} files in {:.2}s",
        total,
        elapsed.as_secs_f32()
    );
    let _ = window.emit("dither-progress", 100);
    let _ = window.emit("dither-status", final_msg.clone());
    Ok(final_msg)
}

#[tauri::command]
fn generate_widget_arrow(
    image_path: String,
    out_dir: String,
    id_name: String,
    cx: u16,
    cy: u16,
    r0: i16,
    r1: i16,
    d0: i16,
    d1: i16,
    min_val: i32,
    max_val: i32,
    frames: u16,
) -> Result<String, String> {
    generator::arrow::build_arrow_binaries(
        &image_path,
        &out_dir,
        &id_name,
        cx,
        cy,
        r0,
        r1,
        d0,
        d1,
        min_val,
        max_val,
        frames,
    )?;
    Ok(format!("Generated successfully for {}", id_name))
}

#[tauri::command]
fn generate_widget_arc(
    image_path: String,
    out_dir: String,
    id_name: String,
    cx: u16,
    cy: u16,
    r0: i16,
    r1: i16,
    d0: i16,
    d1: i16,
    min_val: i32,
    max_val: i32,
    frames: u16,
) -> Result<String, String> {
    generator::arc::build_arc_binaries(
        &image_path,
        &out_dir,
        &id_name,
        cx,
        cy,
        r0,
        r1,
        d0,
        d1,
        min_val,
        max_val,
        frames,
    )?;
    Ok(format!("Generated successfully for {}", id_name))
}

#[tauri::command]
fn generate_widget_slider(
    image_path: String,
    mask_path: String,
    out_dir: String,
    id_name: String,
    cx: u16,
    cy: u16,
    r0: i16,
    r1: i16,
    d0: i16,
    d1: i16,
    min_val: i32,
    max_val: i32,
    frames: u16,
) -> Result<String, String> {
    generator::slider::build_slider_binaries(
        &image_path,
        &mask_path,
        &out_dir,
        &id_name,
        cx,
        cy,
        r0,
        r1,
        d0,
        d1,
        min_val,
        max_val,
        frames,
    )?;
    Ok(format!("Generated successfully for {}", id_name))
}

fn main() {
    tauri::Builder::default()
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_store::Builder::default().build())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_updater::Builder::new().build())
        .plugin(tauri_plugin_process::init())
        .invoke_handler(tauri::generate_handler![
            load_project,
            save_text_file,
            copy_asset_file,
            scan_project_assets,
            delete_project_file,
            process_images,
            create_project,
            open_folder,
            generate_widget_arrow,
            generate_widget_arc,
            generate_widget_slider
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
