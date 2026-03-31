import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import type { ProjectData, AssetObject } from "@/types/project";
import { convertFileSrc } from "@tauri-apps/api/core";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const requestIdleCallbackCompat: typeof requestIdleCallback = (
  cb,
  options,
) => {
  if (typeof requestIdleCallback !== "undefined") {
    return requestIdleCallback(cb, options);
  }
  const start = Date.now();
  return setTimeout(() => {
    cb({
      didTimeout: false,
      timeRemaining: () =>
        Math.max(0, (options?.timeout || 0) - (Date.now() - start)),
    });
  }, 1) as unknown as ReturnType<typeof requestIdleCallback>;
};

export const cancelIdleCallbackCompat: typeof cancelIdleCallback = (id) => {
  if (typeof cancelIdleCallback !== "undefined") {
    cancelIdleCallback(id);
  } else {
    clearTimeout(id as unknown as number);
  }
};

export function normalizePath(path: string | { Path?: string }): string {
  if (typeof path === "string") {
    return path.replace(/\//g, "\\");
  }
  if (path && typeof path === "object" && path.Path) {
    return path.Path.replace(/\//g, "\\");
  }
  return "";
}

export function normalizeProjectPaths(data: ProjectData): ProjectData {
  if (!data || typeof data !== "object") return data;

  const normalized: ProjectData = { ...data };

  if (Array.isArray(normalized.Objects)) {
    normalized.Objects = normalized.Objects.map((obj: AssetObject) => ({
      ...obj,
      Path: normalizePath(obj.Path || ""),
    }));
  }

  // Если в будущем появятся PriorityAssets или Assets
  const anyData = normalized as any;
  if (Array.isArray(anyData.PriorityAssets)) {
    anyData.PriorityAssets = anyData.PriorityAssets.map((p: any) =>
      normalizePath(p),
    );
  }
  if (Array.isArray(anyData.Assets)) {
    anyData.Assets = anyData.Assets.map((a: any) => normalizePath(a));
  }

  return normalized;
}

export function formatRelativeTime(timestamp: number): string {
  if (!timestamp) return "";

  const now = new Date();
  const past = new Date(timestamp);
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const pastDate = new Date(
    past.getFullYear(),
    past.getMonth(),
    past.getDate(),
  );

  if (pastDate.getTime() === today.getTime()) {
    const diffHours = Math.floor(
      (now.getTime() - past.getTime()) / (1000 * 60 * 60),
    );
    if (diffHours === 0) {
      const diffMinutes = Math.floor(
        (now.getTime() - past.getTime()) / (1000 * 60),
      );
      if (diffMinutes === 0) return "Just now";
      return diffMinutes === 1 ? "1 minute ago" : `${diffMinutes} minutes ago`;
    }
    return diffHours === 1 ? "1 hour ago" : `${diffHours} hours ago`;
  }

  if (pastDate.getTime() === yesterday.getTime()) return "Yesterday";

  const diffDays = Math.floor(
    (today.getTime() - pastDate.getTime()) / (1000 * 60 * 60 * 24),
  );
  if (diffDays < 7)
    return diffDays === 1 ? "1 day ago" : `${diffDays} days ago`;

  if (diffDays < 30) {
    const weeks = Math.floor(diffDays / 7);
    return weeks === 1 ? "1 week ago" : `${weeks} weeks ago`;
  }

  const diffMonths =
    pastDate.getMonth() -
    today.getMonth() +
    12 * (pastDate.getFullYear() - today.getFullYear());
  if (diffMonths < 12) {
    const months = Math.abs(diffMonths);
    return months === 1 ? "Last month" : `${months} months ago`;
  }

  const diffYears = pastDate.getFullYear() - today.getFullYear();
  const years = Math.abs(diffYears);
  return years === 1 ? "Last year" : `${years} years ago`;
}

export function resolveAssetPath(
  projectPath: string | null,
  assetName: string | undefined,
): string | null {
  if (!projectPath || !assetName) return null;

  const lastIdx = Math.max(
    projectPath.lastIndexOf("/"),
    projectPath.lastIndexOf("\\"),
  );
  if (lastIdx === -1) return null;

  const baseDir = projectPath.substring(0, lastIdx);

  const cleanAssetName = assetName.replace(/^[/\\]+/, "");

  const separator = projectPath.includes("\\") ? "\\" : "/";

  const fullPath = `${baseDir}${separator}${cleanAssetName}`;

  return convertFileSrc(fullPath);
}
