import { BaseTexture, Texture } from "@pixi/core";
import { Loader, LoaderResource } from "@pixi/loaders";
import { Sprite } from "@pixi/sprite";
import { TextureCache } from "@pixi/utils";
import { LiteralUnion } from "type-fest/source/literal-union";
import { populateAlternativeTextureCacheIds } from "./populateAlternativeTextureCacheIds";


const PREFIX_ATLAS = "./assets/atlases-webp/";
const PREFIX_IMG = "./assets/images-webp/";

export const assetsNamed = {
  Font_ToC_Icons: "./assets/fonts/ToC_Icons.ttf",
  Font_CaviarDreams: "./assets/fonts/CaviarDreams.ttf",
  Font_CaviarDreams_Bold: "./assets/fonts/CaviarDreams_Bold.ttf",
  Font_Croogla: "./assets/fonts/croogla.otf",
  Font_DanielBlack: "./assets/fonts/DanielBlack_Fixed.ttf",
  Font_Story: "./assets/fonts/Story.ttf",

  BitmapFont_Celestial: "./assets/fonts-bitmap/Celestial Bitmap.fnt",

  vortexBackground: PREFIX_IMG + "/cinematics/timeline-vortex.webp",
 
  windowGrunge: PREFIX_IMG + "/ui-windows/grunge.webp",
  windowFrame: PREFIX_IMG + "/ui-windows/frame.webp",
  thomasIntro: PREFIX_IMG + "/cinematics/thomas-intro.webp",

  // __pikachu: "https://upload.wikimedia.org/wikipedia/en/a/a6/Pok%C3%A9mon_Pikachu_art.png",
};

export const assetsUnnamed = [
  PREFIX_ATLAS + "atlas-npc-encounters-mysterious-stranger.json",
  PREFIX_ATLAS + "atlas-npc-encounters-otto.json",
  PREFIX_ATLAS + "atlas-npc-encounters-otto-intro.json",
  PREFIX_ATLAS + "atlas-npc-encounters-thomas.json",
  PREFIX_ATLAS + "atlas-npc-encounters-the-culprit.json",
  PREFIX_ATLAS + "atlas-npc-encounters-story-chapter-01.json",
];

export const assetsAudio = {
  ottoCinematicRiser: "./assets/audio/sfx/npc-cinematic-otto/transition-riser.wav",
  ottoCinematicWarp: "./assets/audio/sfx/npc-cinematic-otto/transition-warp.wav",
  thomasCinematicRunning: "./assets/audio/sfx/npc-cinematic-thomas/running.wav",
  culpritCinematicMmm: "./assets/audio/sfx/npc-cinematic-culprit/culprit-mmm.wav",
  mechanicCinematicSigh: "./assets/audio/sfx/npc-cinematic-mechanic/sigh.wav",
  mechanicCinematicSteps: "./assets/audio/sfx/npc-cinematic-mechanic/footsteps.wav",
  mechanicCinematicRepair: "./assets/audio/sfx/npc-cinematic-mechanic/repair_fx.wav",

  newStory: "./assets/audio/sfx/npc-cinematic-stories/new-story.wav",
  ticking: "./assets/audio/sfx/npc-cinematic-stories/ticking.wav",
};

function isTasksMapAndNotArray(tasks: any): tasks is Record<string, string> {
  return typeof tasks === "object" && !Array.isArray(tasks);
}

export class AssetsManager {
  public readonly textures = { white: Texture.WHITE } as { [key: string]: Texture };
  public readonly resources = {} as { [name: string]: LoaderResource };

  private __alreadyLoaded__ = new Set<string>();

  load(tasks: Record<string, string> | string[], loader: Loader = new Loader()) {
    return new Promise<Loader["resources"]>(resolve => {
      const addTask = isTasksMapAndNotArray(tasks)
        ? (assetName: keyof typeof tasks) => loader.add(assetName, tasks[assetName])
        : (index: any) => loader.add(tasks[index]);

      for (const key in tasks) {
        const path = tasks[key as keyof typeof tasks] as string;
        if (this.__alreadyLoaded__.has(path)) continue;
        addTask(key);
        this.__alreadyLoaded__.add(path);
      }

      loader.load(async () => {
        Object.assign(this.resources, loader.resources);
        //// Update asset maps with references loaded textures
        for (const [key, resource] of Object.entries(loader.resources)) {
          if (resource.textures) {
            Object.assign(this.textures, resource.textures);
          } else if (resource.texture) {
            this.textures[key] = resource.texture;
          }
        }

        populateAlternativeTextureCacheIds();

        resolve(this.resources);
      });
    });
  }

  async assureTextureLoaded(nameAndPath: string | [string, string], options: Partial<BaseTexture> = {}) {
    const [name, path] = typeof nameAndPath === "string" ? [nameAndPath, nameAndPath] : nameAndPath;

    const texture = this.textures[name] ?? TextureCache[path] ?? (await Texture.fromURL(path));
    this.textures[name] = texture;
    Object.assign(texture.baseTexture, options);
    return texture;
  }

  async assureTexturesLoaded(tasks: string[]): Promise<Texture[]>;
  async assureTexturesLoaded(tasks: Record<string, string>): Promise<Record<string, Texture>>;
  async assureTexturesLoaded(tasks: Record<string, string> | string[]) {
    if (Array.isArray(tasks)) {
      return Promise.all(tasks.map(task => this.assureTextureLoaded(task)));
    } else {
      const pairs = await Promise.all(
        Object.entries(tasks).map(([name, path]) => [name, this.assureTextureLoaded([name, path])] as const)
      );
      const result = {} as { [key: string]: Texture };
      for (const [key, texturePromise] of pairs) {
        result[key] = await texturePromise;
      }
      return result;
    }
  }

  /**
   * @param input Can be either name of a resource containing multiple textures (e.g. an atlas) or a list of texture ids
   */
  getTextures(input: string[] | string) {
    if (typeof input == "string") {
      const resourceTextureMap = this.resources[input].textures;
      return resourceTextureMap
        ? [...Object.values(resourceTextureMap)].sort(compareTexturesByFirstCacheId)
        : [this.getTexture(input)];
    }

    if (Array.isArray(input)) {
      return input.map(name => this.getTexture(name));
    }

    throw new Error(`Unknown input type: ${typeof input}`);
  }

  getTexture(name: string) {
    return this.textures[name] ?? Texture.from(name) ?? Texture.from("assets/images/" + name);
  }

  mapTextures<T extends Record<string, string>>(map: T) {
    const result = {} as { [key: string]: Texture };
    for (const [key, name] of Object.entries(map)) {
      result[key] = this.getTexture(name);
    }
    return result as Record<LiteralUnion<keyof T, string>, Texture>;
  }

  makeSprite<T extends {}>(textureName: string, mods?: T): Sprite & T {
    return Object.assign(new Sprite(this.getTexture(textureName)), mods);
  }
}

function compareTexturesByFirstCacheId(a: Texture, b: Texture) {
  return a.textureCacheIds[0] > b.textureCacheIds[0] ? 1 : -1;
}
