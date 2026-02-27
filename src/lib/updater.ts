import { check, Update } from "@tauri-apps/plugin-updater";
import { relaunch } from "@tauri-apps/plugin-process";

export interface UpdateInfo {
  version: string;
  body: string;
  date: string;
  update: Update;
}

export async function checkForUpdates(): Promise<UpdateInfo | null> {
  try {
    const update = await check();
    if (!update) return null;

    return {
      version: update.version,
      body: update.body || "No release notes available",
      date: update.date || "",
      update,
    };
  } catch (error) {
    console.error("Failed to check for updates:", error);
    return null;
  }
}

export async function downloadAndInstall(
  update: Update,
  onProgress?: (progress: number) => void
): Promise<void> {
  try {
    await update.downloadAndInstall((event) => {
      if (event.event === "Progress") {
        const data = event.data as { chunkLength?: number; contentLength?: number };
        if (data.contentLength && data.chunkLength) {
          const progress = Math.round(
            (data.chunkLength / data.contentLength) * 100
          );
          onProgress?.(progress);
        }
      }
    });
    await relaunch();
  } catch (error) {
    console.error("Failed to install update:", error);
    throw error;
  }
}

export async function scheduleUpdate(update: Update): Promise<void> {
  const pendingUpdate = {
    version: update.version,
    body: update.body,
    date: update.date,
  };
  localStorage.setItem("pendingUpdate", JSON.stringify(pendingUpdate));
}

export function getScheduledUpdate(): UpdateInfo | null {
  try {
    const stored = localStorage.getItem("pendingUpdate");
    if (!stored) return null;
    return JSON.parse(stored);
  } catch {
    return null;
  }
}

export function clearScheduledUpdate(): void {
  localStorage.removeItem("pendingUpdate");
}
