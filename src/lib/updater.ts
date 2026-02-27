import { check, Update } from "@tauri-apps/plugin-updater";
import { relaunch } from "@tauri-apps/plugin-process";

const SKIPPED_KEY = "skippedUpdate";
const SKIP_DURATION_MS = 24 * 60 * 60 * 1000; // 24 hours

export interface UpdateInfo {
  version: string;
  body: string;
  date: string;
  update: Update;
}

export interface SkippedUpdate {
  version: string;
  skippedAt: number;
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

export function saveSkippedUpdate(version: string): void {
  const skipped: SkippedUpdate = {
    version,
    skippedAt: Date.now(),
  };
  localStorage.setItem(SKIPPED_KEY, JSON.stringify(skipped));
}

export function getSkippedUpdate(): SkippedUpdate | null {
  try {
    const stored = localStorage.getItem(SKIPPED_KEY);
    if (!stored) return null;
    
    const skipped: SkippedUpdate = JSON.parse(stored);
    const isExpired = Date.now() - skipped.skippedAt > SKIP_DURATION_MS;
    
    if (isExpired) {
      localStorage.removeItem(SKIPPED_KEY);
      return null;
    }
    
    return skipped;
  } catch {
    return null;
  }
}

export function clearSkippedUpdate(): void {
  localStorage.removeItem(SKIPPED_KEY);
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
