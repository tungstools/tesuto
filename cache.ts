import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { verbose } from "./cli.output";
import { digestStr } from "./utils";
import { CACHE_MAP_FILE, CACHE_FOLDER } from "./constants";
import path from "node:path";

function tryMakeCacheFolder() {
    if (!existsSync(CACHE_FOLDER)) { mkdirSync(CACHE_FOLDER); }
    if (!existsSync(`${CACHE_FOLDER}/partial`)) { mkdirSync(`${CACHE_FOLDER}/partial`) };
    if (!existsSync(`${CACHE_FOLDER}/bundled`)) { mkdirSync(`${CACHE_FOLDER}/bundled`) };

}

function clearCacheFolder() {
    rmSync(CACHE_FOLDER, { recursive: true, force: true });
    tryMakeCacheFolder();
}

function getFileCacheHash(file: { originalPath: string, content: string }) {
    return (digestStr(file.originalPath + file.content) >>> 0).toString(16);
}

function getFileCacheName(file: { originalPath: string, content: string }) {
    return `${path.basename(file.originalPath)}.${getFileCacheHash(file)}.js`;
}

function createCacheMap() {
    writeFileSync(CACHE_MAP_FILE, "{}");
}

function deleteCacheMap() {
    rmSync(CACHE_MAP_FILE);
}

function writeToCacheMap(item: { originalPath: string, hash: string } | Map<string, string>) {
    if (!existsSync(CACHE_MAP_FILE)) {
        createCacheMap();
    }
    if (item instanceof Map) {
        let cacheMap = JSON.parse(readFileSync(CACHE_MAP_FILE, "utf-8"));
        item.forEach((value, key) => {
            cacheMap[key] = value;
        });
        writeFileSync(CACHE_MAP_FILE, JSON.stringify(cacheMap));
        return;
    } else {
        let cacheMap = JSON.parse(readFileSync(CACHE_MAP_FILE, "utf-8"));
        cacheMap[item.originalPath] = item.hash;
        writeFileSync(CACHE_MAP_FILE, JSON.stringify(cacheMap));
    }
}

function readFromCacheMap() {
    if (!existsSync(CACHE_MAP_FILE)) {
        createCacheMap();
    }
    return JSON.parse(readFileSync(CACHE_MAP_FILE, "utf-8"));
}

export {
    tryMakeCacheFolder, clearCacheFolder, getFileCacheName, getFileCacheHash,
    createCacheMap, deleteCacheMap, writeToCacheMap, readFromCacheMap
}
