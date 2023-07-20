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
    <div
        ref="statusDisplay"
        class="status-display"
    >
        <div class="status-display__container">
            <div v-if="message" class="status-display__message">
                {{ message }}
            </div>
            <template v-else>
                <div class="status-display__game-details">
                    <div class="status-display__balls">BALLS: {{ game.balls }}</div>
                    <div class="status-display__multiplier">MULTIPLIER: {{ game.multiplier }}x</div>
                </div>
                <div class="status-display__score">{{ game.score }}</div>
            </template>
        </div>
    </div>
    <div v-if="!game.active" class="overlay">
        GAME OVER
        <button @click="initGame()">New game</button>
    </div>
</template>

<script lang="ts">
import { canvas } from "zcanvas";
import type { GameDef } from "@/definitions/game";
import { GameMessages, ActorTypes } from "@/definitions/game";
import { init, scaleCanvas, setFlipperState, bumpTable, update } from "@/model/game";
import { i18n } from "../../i18n";

let leftTouchId = -1;
let rightTouchId = -1;
let touch;

interface ComponentData {
    game: GameDef;
    message: string;
};

export default {
    data: (): ComponentData => ({
        game: {
            active: false,
            table: 0,
            score: 0,
            balls: 3,
            multiplier: 1,
            underworld: false,
        },
        message: "",
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
                multiplier: 1,
            };
            init( this.canvas, this.game, this.flashMessage.bind( this ));
        },
        handleResize(): void {
            const { clientWidth, clientHeight } = document.documentElement;
            const statusHeight = this.$refs.statusDisplay.offsetHeight;
            scaleCanvas( clientWidth, clientHeight - ( 58 /* is $menu-height */ + statusHeight ));
            this.halfWidth = clientWidth / 2;
        },
        handleTouch( event: TouchEvent ): void {
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
        handleKey( event: KeyboardEvent ): void {
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
        flashMessage( message: GameMessages | null, optTimeout = 2000 ): void {
            this.clearMessage();

            if ( message !== null ) {
                this.message = this.i18nForMessage( message );
                this.messageTimeout = window.setTimeout(() => {
                    this.clearMessage();
                }, optTimeout );
            }
        },
        clearMessage(): void {
            if ( !this.messageTimeout ) {
                return;
            }
            clearTimeout( this.messageTimeout );
            this.messageTimeout = null;
            this.message = null;
        },
        i18nForMessage( message: GameMessages ): string {
            let key: string = "";
            let optData: any;
            switch ( message ) {
                default:
                    break
                case GameMessages.TILT:
                    key = "tilt";
                    break;
                case GameMessages.MULTIBALL:
                    key = "multiball";
                    break;
                case GameMessages.MULTIPLIER:
                    key = "multiplier";
                    optData = { count: this.game.multiplier };
                    break;
            }
            return i18n.t( `messages.${key}`, optData );
        },
    }
};
</script>

<style lang="scss" scoped>
@import "@/styles/_animation";
@import "@/styles/_typography";
@import "@/styles/_variables";

.canvas-container {
    overflow: hidden;
    text-align: center;
    margin-top: $menu-height;

    &--active {
        cursor: none;
    }
}

.overlay {
    position: fixed;
    z-index: $z-index-on-top;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    border-radius: 7px;
    border: 3px solid #000;
    background-color: #FFF;
    padding: 16px;
}

.status-display {
    @include displayFont();
    width: 100%;
    height: 100px;
    background-color: #000;
    color: #FFF;

    &__container {
        max-width: 800px;
        margin: 0 auto;
        height: inherit;
        display: flex;
        justify-content: space-around;
        align-items: center;
    }

    &__game-details {
        display: flex;
        justify-content: space-around;
        flex-direction: column;
        width: 40%;
        height: 60%;
        font-size: 18px;
    }

    &__score {
        max-width: 350px;
        font-size: 64px;
    }

    &__message {
        @include animationBlink( 0.25s );
        text-transform: uppercase;
        font-size: 64px;
    }
}
</style>
