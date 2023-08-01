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
let hasListener = false;
let _isFullscreen = false;

export const isFullscreen = (): boolean => {
    return _isFullscreen;
};

export const toggleFullscreen = (): void => {
    if ( !hasListener ) {
        prepareFullscreen();
        hasListener = true;
    }
    const d = window.document;
    let requestMethod: () => void;
    let element: any;

    // @ts-expect-error vendor specific prefixes
    if ( d.fullscreenElement || d.webkitFullscreenElement ) {
        // @ts-expect-error vendor specific prefixes
        requestMethod = d.exitFullscreen || d.webkitExitFullscreen || d.mozCancelFullScreen || d.msExitFullscreen;
        element = d;
    } else {
        // @ts-expect-error vendor specific prefixes
        requestMethod = d.body.requestFullScreen || d.body.webkitRequestFullScreen || d.body.mozRequestFullScreen || d.body.msRequestFullscreen;
        element = d.body;
    }
    if ( requestMethod ) {
        requestMethod.call( element );
    }
};

/* internal methods */

function prepareFullscreen(): void {
    [
        "webkitfullscreenchange",
        "mozfullscreenchange",
        "fullscreenchange",
        "MSFullscreenChange",
    ]
    .forEach( event => {
        window.document.addEventListener( event, handleFullscreenChange, false )
    });
}

function handleFullscreenChange(): void {
    // @ts-expect-error vendor specific prefixes
    _isFullscreen = ( document.webkitIsFullScreen || document.mozFullScreen || document.msFullscreenElement === true );
}
