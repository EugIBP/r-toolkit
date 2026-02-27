// Глобальный кеш загруженных изображений.
// Ключ — src URL. Повторные запросы на тот же src получают тот же Promise.

interface CacheEntry {
  size: { width: number; height: number };
}

const cache = new Map<string, Promise<CacheEntry>>();

export function loadImage(src: string): Promise<CacheEntry> {
  if (cache.has(src)) return cache.get(src)!;

  const promise = new Promise<CacheEntry>((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve({ size: { width: img.naturalWidth, height: img.naturalHeight } });
    img.onerror = reject;
    img.src = src;
  });

  cache.set(src, promise);
  return promise;
}

export function getCachedSize(src: string): { width: number; height: number } | null {
  // Синхронная проверка — возможна только если promise уже зарезолвился.
  // Используем внутренний трюк: храним resolved значения отдельно.
  return resolvedSizes.get(src) ?? null;
}

const resolvedSizes = new Map<string, { width: number; height: number }>();

export function loadImageCached(
  src: string,
  onLoad: (size: { width: number; height: number }) => void,
): void {
  // Если уже в кеше resolved — отдаём немедленно (через microtask чтобы не ломать хуки)
  const cached = resolvedSizes.get(src);
  if (cached) {
    Promise.resolve().then(() => onLoad(cached));
    return;
  }

  loadImage(src).then((entry) => {
    resolvedSizes.set(src, entry.size);
    onLoad(entry.size);
  }).catch(() => {});
}
