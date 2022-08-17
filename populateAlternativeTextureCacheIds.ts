import { Texture } from "@pixi/core";
import { TextureCache } from "@pixi/utils";

export function populateAlternativeTextureCacheIds() {
  const x = /^assets\/images\//;
  for (const cacheId in TextureCache) {
    if (cacheId.startsWith("assets/images/")) {
      const altCacheId = cacheId.replace(x, "");
      if (!TextureCache[altCacheId]) {
        const texture = TextureCache[cacheId];
        Texture.addToCache(texture, altCacheId);
      }
    }
  }
}
