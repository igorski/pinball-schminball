/**
 * The MIT License (MIT)
 *
 * Igor Zinken 2021-2023 - https://www.igorski.nl
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of
 * this software and associated documentation files (the "Software"), to deal in
 * the Software without restriction, including without limitation the rights to
 * use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of
 * the Software, and to permit persons to whom the Software is furnished to do so,
 * subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS
 * FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR
 * COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER
 * IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
 * CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */
import loadScript from "tiny-script-loader/loadScriptPromised";
import { Loader } from "zcanvas";
import Tables from "@/definitions/tables";
import SpriteCache, { type CachedImageType } from "@/utils/sprite-cache";

type QueueEntry = {
    src: string;
    type: "image" | "bitmap";
    cache?: CachedImageType;
}

const assetRoot = `./assets/sprites/`;
const queue = [
    { src: `${assetRoot}ball.png`,          type: "bitmap", cache: SpriteCache.BALL },
    { src: `${assetRoot}flipper_left.png`,  type: "bitmap", cache: SpriteCache.FLIPPER_LEFT },
    { src: `${assetRoot}flipper_right.png`, type: "bitmap", cache: SpriteCache.FLIPPER_RIGHT },
] as QueueEntry[];
const loadContainer: HTMLElement = document.createElement( "div" );

export const preloadAssets = async (): Promise<void> =>
{
    // load PathSeg library for use with importing SVG as collision paths
    await loadScript( "./pathseg.js" );

    // harvest all assets from the available tables

    for ( const table of Tables ) {
        addToQueueWhenExisting( table.background );
        addToQueueWhenExisting( table.body?.source );
        table.reflectors?.map( reflector => addToQueueWhenExisting( reflector.source ));
    }

    return new Promise( resolve => {
        const processQueue = async () => {
            if ( queue.length === 0 ) {
                resolve();
            } else {
                const asset = queue.shift();           
                try {
                    if ( asset.type === "bitmap" ) {
                        const bitmap = await Loader.loadBitmap( asset.src );
                        asset.cache.bitmap = bitmap;
                    } else {
                        await Loader.loadImage( asset.src );
                    }
                } catch( e ) {
                    console.error( e, asset.src );
                }
                processQueue();
            }
        }
        processQueue();
    });
};

/* internal methods */

function addToQueueWhenExisting( assetPath: string | undefined ): void {
    if ( assetPath && assetPath.length > 0 ) {
        queue.push({ src: assetPath, type: "image" });
    }
}
