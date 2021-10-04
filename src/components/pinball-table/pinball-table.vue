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
    <div ref="canvasContainer"></div>
</template>

<script>
import { canvas } from "zcanvas";
import { init, setFlipperState, setBallSpeed, update } from "@/model/game";

export default {
    mounted() {
        this.canvas = new canvas({
            width  : 600,
            height : 800,
            backgroundColor: "#000",
            onUpdate : this.runGameTick.bind( this ),
            animate: true,
            interactive: false
        });
        this.canvas.insertInPage( this.$refs.canvasContainer );

        this.keyListener = this.handleKey.bind( this );
        window.addEventListener( "keydown", this.keyListener );
        window.addEventListener( "keyup",   this.keyListener );

        this.initGame();
    },
    unmounted() {
        window.removeEventListener( "keydown", this.keyListener );
        window.removeEventListener( "keyup",   this.keyListener );
    },
    methods: {
        initGame() {
            init( this.canvas );
        },
        runGameTick() {
            update();
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
