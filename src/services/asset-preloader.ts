/**
 * The MIT License (MIT)
 *
 * Igor Zinken 2021 - https://www.igorski.nl
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
import { loader }  from "zcanvas";
import SpriteCache from "@/utils/sprite-cache";

const assetRoot = `./assets/sprites/`;
const queue = [
    { src: `${assetRoot}background.png`,    target: SpriteCache.BACKGROUND },
    { src: `${assetRoot}ball.png`,          target: SpriteCache.BALL },
    { src: `${assetRoot}flipper_left.png`,  target: SpriteCache.FLIPPER_LEFT },
    { src: `${assetRoot}flipper_right.png`, target: SpriteCache.FLIPPER_RIGHT },
];
let _loadContainer;

export const preloadAssets = (): Promise<void> =>
{
    console.log( "PRELOAD ASSETS" );

    // we create a container (positioned off-screen) to append the images to, this is to
    // overcome mobile browsers not actually loading the Images until they are inside the DOM and
    // no, we cannot add it to a display:none; -container !

    _loadContainer = document.createElement( "div" );

    const { style } = _loadContainer;
    style.position  = "absolute";
    style.left      = "-9999px";
    style.top       = "0";

    document.body.appendChild( _loadContainer );

    return new Promise(( resolve, reject ) => {
        const processQueue = async () => {
            if ( queue.length === 0 ) {
                // queue complete, remove temporary container and complete excution
                document.body.removeChild( _loadContainer );
                resolve();
            } else {
                const asset = queue.shift();
                const image = asset.target;

                image.crossOrigin = "anonymous";
                _loadContainer.appendChild( image );

                try {
                    await loader.loadImage( asset.src, image );
                } catch( e ) {
                    console.error( e, asset.src );
                }
                processQueue();
            }
        }
        processQueue();
    });
};
