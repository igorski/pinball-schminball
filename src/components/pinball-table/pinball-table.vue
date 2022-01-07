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
<template>
    <div
        ref="canvasContainer"
        class="canvas-container"
        @touchstart="handleTouch"
        @touchend="handleTouch"
        @touchcancel="handleTouch"
    ></div>
</template>

<script>
import { canvas } from "zcanvas";
import { init, scaleCanvas, setFlipperState, bumpTable, setBallSpeed, update } from "@/model/game";

let leftTouchId = -1, rightTouchId = -1, touch;

export default {
    mounted() {
        this.canvas = new canvas({
            width       : 600,
            height      : 800,
            animate     : true,
            interactive : false,
            onUpdate    : update,
        });
        this.canvas.insertInPage( this.$refs.canvasContainer );

        this.keyListener = this.handleKey.bind( this );

        window.addEventListener( "keydown", this.keyListener );
        window.addEventListener( "keyup",   this.keyListener );
        window.addEventListener( "resize",  this.handleResize );

        this.initGame();
        this.handleResize();
    },
    unmounted() {
        window.removeEventListener( "keydown", this.keyListener );
        window.removeEventListener( "keyup",   this.keyListener );
        window.removeEventListener( "resize",  this.handleResize );
    },
    methods: {
        initGame() {
            init( this.canvas );
        },
        handleResize() {
            const { clientWidth, clientHeight } = document.documentElement;
            scaleCanvas( clientWidth, clientHeight );
            this.halfWidth = clientWidth / 2;
        },
        handleTouch( event ) {
            switch ( event.type ) {
                // touch cancel, end
                default:
                    const eventTouches = [ ...event.touches ];
                    if ( leftTouchId >= 0 && !eventTouches.includes( leftTouchId )) {
                        setFlipperState( "left", false );
                        leftTouchId = -1;
                    }
                    if ( rightTouchId >= 0 && !eventTouches.includes( rightTouchId )) {
                        setFlipperState( "right", false );
                        rightTouchId = -1;
                    }
                    break;
                // touch start
                case "touchstart":
                    for ( touch of event.touches ) {
                        if ( touch.pageX < this.halfWidth ) {
                            setFlipperState( "left", true );
                            leftTouchId = touch.identifier;
                        } else {
                            setFlipperState( "right", true );
                            rightTouchId = touch.identifier;
                        }
                    }
                    break;
            }
        },
        handleKey( event ) {
            const { type, keyCode } = event;
            switch ( keyCode ) {
                default:
                    if ( process.env.NODE_ENV !== "production" ) {
                        if ( keyCode === 83 ) { // S
                            setBallSpeed( 0.5 ); // slow down ball
                        }
                    }
                    return;
                case 32:
                    bumpTable();
                    event.preventDefault();
                    break;
                case 37:
                    setFlipperState( "left", type === "keydown" );
                    event.preventDefault();
                    break;
                case 39:
                    setFlipperState( "right", type === "keydown" );
                    event.preventDefault();
                    break;
            }
        },
    }
};
</script>

<style scoped>
.canvas-container {
    overflow: hidden;
    text-align: center;
}
</style>
