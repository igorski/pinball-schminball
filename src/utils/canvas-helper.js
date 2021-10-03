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
import { loader } from "zcanvas";

export const createCanvas = ( width, height ) => {
    const cvs  = document.createElement( "canvas" );
    cvs.width  = width;
    cvs.height = height;

    return {
        cvs, ctx: cvs.getContext( "2d" )
    }
};

export const getTransparentPixelsForImage = async image => {
    await loader.onReady( image );
    const { width, height } = image;

    const { cvs, ctx } = createCanvas( width, height );
    ctx.drawImage( image, 0, 0 );

    const imageData = ctx.getImageData( 0, 0, width, height ).data;
    const out = [];
    // we increment by 4 as each pixel is represented by R, G, B and A values
    for ( let i = 0, l = imageData.length; i < l; i += 4 ) {
        const r = imageData[ i ];
        const g = imageData[ i + 1 ];
        const b = imageData[ i + 2 ];
        const a = imageData[ i + 3 ];

        out.push( a === 0 || ( r === 0 && g === 0 && b === 0 ));
    }
    return out;
};
