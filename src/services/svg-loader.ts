/**
 * The MIT License (MIT)
 *
 * Igor Zinken 2023 - https://www.igorski.nl
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
import Matter from "matter-js";
import type { Vector } from "matter-js";
// @ts-expect-error no type definitions for poly-decomp
import PolyDecomp from "poly-decomp";

// note pathseg polyfill should also be provided onto window as SVGPathSeg
Matter.Common.setDecomp( PolyDecomp );

// SVG parsing can be expensive, maintain a cache for previously parsed files
const vertexCache: Map<string, Vector[][]> = new Map();

export const loadVertices = async ( filePath: string ): Promise<Vector[][]> => {
    if ( vertexCache.has( filePath )) {
        return vertexCache.get( filePath );
    }
    const svg = await loadSVG( filePath );
    const vertices = selectPaths( svg, "path" ).map( path => Matter.Svg.pathToVertices( path, 30 ));

    vertexCache.set( filePath, vertices );

    return vertices;
};

/* internal methods */

function loadSVG( url: string ): Promise<XMLDocument> {
    return fetch( url )
        .then( response => response.text() )
        .then( raw => (new window.DOMParser()).parseFromString( raw, "image/svg+xml") );
}

function selectPaths( document: XMLDocument, selector: string ): SVGPathElement[] {
    return Array.prototype.slice.call( document.querySelectorAll( selector ));
}
