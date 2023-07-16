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
<template>
    <div
        ref="canvasContainer"
        class="canvas-container"
        :class="{'canvas-container--active': game.active}"
        @touchstart="handleTouch"
        @touchend="handleTouch"
        @touchcancel="handleTouch"
    ></div>
    <div v-if="!game.active" class="overlay">
        GAME OVER
        <button @click="initGame()">New game</button>
    </div>
    <div class="status-display">
        <div class="score-display__score">{{ game.score }} pts.</div>
        <div class="score-display__balls">{{ game.balls }} balls</div>
    </div>
</template>

<script lang="ts">
import { canvas } from "zcanvas";
import type { GameDef } from "@/definitions/game";
import { ActorTypes } from "@/model/actor";
import { init, scaleCanvas, setFlipperState, bumpTable, update } from "@/model/game";

let leftTouchId = -1;
let rightTouchId = -1;
let touch;

interface ComponentData {
    game: GameDef;
};

export default {
    data: (): ComponentData => ({
        game: {
            active: false,
            table: 0,
            score: 0,
            balls: 3,
        },
    }),
    mounted(): void {
        this.canvas = new canvas({
            width       : 600,
            height      : 800,
            animate     : true,
            onUpdate    : update,
            backgroundColor: "#000" // TODO can be removed when sprite is used for bg
        });
        this.canvas.insertInPage( this.$refs.canvasContainer );

        this.keyListener = this.handleKey.bind( this );

        window.addEventListener( "keydown", this.keyListener );
        window.addEventListener( "keyup",   this.keyListener );
        window.addEventListener( "resize",  this.handleResize );

        this.initGame();
        this.handleResize();
    },
    unmounted(): void {
        window.removeEventListener( "keydown", this.keyListener );
        window.removeEventListener( "keyup",   this.keyListener );
        window.removeEventListener( "resize",  this.handleResize );
    },
    methods: {
        initGame(): void {
            this.game = {
                active: true,
                table: 0,
                score: 0,
                balls: 3,
            };
            init( this.canvas, this.game );
        },
        handleResize(): void {
            const { clientWidth, clientHeight } = document.documentElement;
            scaleCanvas( clientWidth, clientHeight );
            this.halfWidth = clientWidth / 2;
        },
        handleTouch( event: Event ): void {
            switch ( event.type ) {
                // touch cancel, end
                default:
                    const eventTouches = [ ...event.touches ];
                    if ( leftTouchId >= 0 && !eventTouches.includes( leftTouchId )) {
                        setFlipperState( ActorTypes.LEFT_FLIPPER, false );
                        leftTouchId = -1;
                    }
                    if ( rightTouchId >= 0 && !eventTouches.includes( rightTouchId )) {
                        setFlipperState( ActorTypes.RIGHT_FLIPPER, false );
                        rightTouchId = -1;
                    }
                    break;
                // touch start
                case "touchstart":
                    for ( touch of event.touches ) {
                        if ( touch.pageX < this.halfWidth ) {
                            setFlipperState( ActorTypes.LEFT_FLIPPER, true );
                            leftTouchId = touch.identifier;
                        } else {
                            setFlipperState( ActorTypes.RIGHT_FLIPPER, true );
                            rightTouchId = touch.identifier;
                        }
                    }
                    break;
            }
        },
        handleKey( event: Event ): void {
            const { type, keyCode } = event;
            switch ( keyCode ) {
                default:
                    return;
                case 32:
                    bumpTable();
                    event.preventDefault();
                    break;
                case 37:
                    setFlipperState( ActorTypes.LEFT_FLIPPER, type === "keydown" );
                    event.preventDefault();
                    break;
                case 39:
                    setFlipperState( ActorTypes.RIGHT_FLIPPER, type === "keydown" );
                    event.preventDefault();
                    break;
            }
        },
    }
};
</script>

<style lang="scss" scoped>
.canvas-container {
    overflow: hidden;
    text-align: center;

    &--active {
        cursor: none;
    }
}

.overlay {
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    border-radius: 7px;
    border: 3px solid #000;
    background-color: #FFF;
    padding: 16px;
}

.status-display {
    position: fixed;
    top: 16px;
    left: 16px;
    border-radius: 7px;
    background-color: #FFF;
    border: 2px solid #000;
    width: 200px;
    padding: 7px;
}
</style>
