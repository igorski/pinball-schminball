/**
 * The MIT License (MIT)
 *
 * Igor Zinken 2021-2024 - https://www.igorski.nl
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
    <div>
        <div
            v-show="gameActive"
            ref="canvasContainer"
            class="canvas-container"
            :class="{
                'canvas-container--active': modelValue.active,
                'canvas-container--centered': centerTable,
            }"
        ></div>
        <round-results
            v-if="activeRound.ended"
            :score="activeRound.total"
            :remaining-balls="Math.max( 0, modelValue.balls - 1 )"
        />
        <div
            v-if="inited"
            ref="statusDisplay"
            class="status-display"
        >
            <div class="status-display__container">
                <div v-if="message" class="status-display__message">
                    {{ message }}
                </div>
                <template v-else>
                    <div class="status-display__game-details">
                        <div class="status-display__balls">BALLS: {{ modelValue.balls }}</div>
                        <div class="status-display__multiplier">MULTIPLIER: {{ modelValue.multiplier }}x</div>
                    </div>
                    <div class="status-display__score">{{ modelValue.score }}</div>
                </template>
            </div>
        </div>
        <div
            class="touch-area touch-area--left"
            @touchstart="handleTouch( $event, true )"
            @touchend="handleTouch( $event, true )"
            @touchcancel="handleTouch( $event, true )"
        ></div>
        <div
            class="touch-area touch-area--right"
            @touchstart="handleTouch( $event, false )"
            @touchend="handleTouch( $event, false )"
            @touchcancel="handleTouch( $event, false )"
        ></div>
        <div
            v-if="useVhs"
            ref="vhsOverlay"
            class="vhs-overlay"
        ></div>
    </div>
</template>

<script lang="ts">
import { PropType } from "vue";
import throttle from "lodash/throttle";
import { Canvas } from "zcanvas";
import type { GameDef, GameMessages} from "@/definitions/game";
import { ActorTypes, FRAME_RATE } from "@/definitions/game";
import { init, scaleCanvas, setFlipperState, bumpTable, update, panViewport, setPaused } from "@/model/game";
import SpriteCache from "@/utils/sprite-cache";
import RoundResults from "./round-results.vue";
import { i18nForMessage } from "./message-localizer";

const touchStart = {
    y: 0,
    time: 0
};
let changeTimeout = null;
let touch;

interface ComponentData {
    message: string;
    inited: boolean;
    centerTable: boolean;
    activeRound: {
        balls: number;
        score: number;
        total: number;
        ended: boolean;
        tableHeight: number;
    }
};

export default {
    components: {
        RoundResults,
    },
    props: {
        modelValue: {
            type: Object as PropType<GameDef>,
            required: true,
        },
        gameActive: {
            type: Boolean,
            required: true,
        },
        useVhs: {
            type: Boolean,
            default: false,
        },
    },
    data: (): ComponentData => ({
        message: "",
        inited: false,
        centerTable: false,
        activeRound: {
            balls: 0,
            score: 0,
            total: 0,
            ended: false,
            tableHeight: 0,
        },
    }),
    watch: {
        "modelValue.id"( gameId: string, prevGameId?: string ): void {
            if ( gameId !== prevGameId ) {
                this.initGame();
            }
        },
        "modelValue.paused"( isPaused: boolean ): void {
            setPaused( isPaused );
        }
    },
    mounted(): void {
        this.canvas = new Canvas({
            width    : 600,
            height   : 800,
            animate  : true,
            fps      : FRAME_RATE,
            autoSize : false,
            onUpdate : update,
            backgroundColor: "#000", // disables alpha blending of DOM element
            // debug    : import.meta.env.MODE !== "production",
        });
        this.canvas.pause( this.modelValue.paused );
        this.canvas.insertInPage( this.$refs.canvasContainer );

        [
            SpriteCache.BALL, SpriteCache.FLIPPER_LEFT, SpriteCache.FLIPPER_RIGHT,
        ].forEach( entry => {
            this.canvas.loadResource( entry.resourceId, entry.bitmap );
        });

        this.bumpHandler = throttle((): void => {
            bumpTable( this.modelValue );
        }, 150 );

        this.keyListener = this.handleKey.bind( this );
    },
    beforeUnmount(): void {
        this.removeListeners();
    },
    methods: {
        async initGame(): Promise<void> {
            const { height } = await init(
                this.canvas, this.modelValue,
                this.handleRoundEnd.bind( this ), this.flashMessage.bind( this )
            );
            this.activeRound = {
                balls: this.modelValue.balls,
                score: 0,
                total: 0,
                ended: false,
                tableHeight: height,
            };
            this.addListeners();
            await this.$nextTick();
            this.handleResize();
        },
        addListeners(): void {
            window.addEventListener( "keydown", this.keyListener );
            window.addEventListener( "keyup",   this.keyListener );
            window.addEventListener( "resize",  this.handleResize );

            this.inited = true;
        },
        removeListeners(): void {
            window.removeEventListener( "keydown", this.keyListener );
            window.removeEventListener( "keyup",   this.keyListener );
            window.removeEventListener( "resize",  this.handleResize );

            this.inited = false;
        },
        handleResize(): void {
            if ( !this.inited ) {
                return;
            }
            const { clientWidth, clientHeight } = document.documentElement;
            const statusHeight = this.$refs.statusDisplay.offsetHeight;
            const isMobileView = clientWidth <= 685; // see _variables.scss
            const uiHeight     = isMobileView ? 58 /* is $menu-height */ + statusHeight : statusHeight;
            const canvasHeight = Math.min( this.activeRound.tableHeight, clientHeight ) - uiHeight;

            scaleCanvas( clientWidth, canvasHeight );

            this.centerTable = clientHeight > this.activeRound.tableHeight;

            const { vhsOverlay } = this.$refs;
            if ( vhsOverlay ) {
                vhsOverlay.style.height = `${canvasHeight + statusHeight}px`;
            }
        },
        handleTouch( event: TouchEvent, isLeft: boolean ): void {
            switch ( event.type ) {
                default: // touch(cancel|end)
                    setFlipperState( isLeft ? ActorTypes.LEFT_FLIPPER : ActorTypes.RIGHT_FLIPPER, false );
                    if ( event.type === "touchend" && ( window.performance.now() - touchStart.time ) < 400 ) {
                        const movedBy = event.changedTouches[ 0 ]?.pageY - touchStart.y;
                        if ( movedBy < -100 ) {
                            this.bumpHandler();
                        }
                    }
                    break;
                case "touchstart":
                    setFlipperState( isLeft ? ActorTypes.LEFT_FLIPPER : ActorTypes.RIGHT_FLIPPER, true );
                    for ( touch of event.touches ) {
                        touchStart.y = touch.pageY;
                        touchStart.time = window.performance.now();
                    }
                    break;
            }
            event.preventDefault();
            event.stopPropagation();
        },
        handleKey( event: KeyboardEvent ): void {
            const { type, keyCode } = event;
            switch ( keyCode ) {
                default:
                    // @ts-expect-error Property 'env' does not exist on type 'ImportMeta', Vite takes care of it
                    if ( import.meta.env.MODE !== "production" ) {
                        if ( type === "keyup" ) {
                            return;
                        }
                        // some debug interactions
                        switch ( keyCode ) {
                            case 80: // P
                                this.modelValue.paused = !this.modelValue.paused;
                                break;
                            case 38: // up
                                panViewport( -25 );
                                break;
                            case 40: // down
                                panViewport( 25 );
                                break;
                        }
                    }
                    return;
                case 32:
                    if ( type === "keydown" ) {
                        this.bumpHandler();
                    }
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
        handleRoundEnd( readyCallback: () => void, timeout: number ): void {
            if ( changeTimeout !== null ) {
                return; // existing round end pending (e.g.: ball fell after tilt triggered round end)
            }
            this.activeRound.total = this.modelValue.score - this.activeRound.score;
            this.activeRound.ended = true;

            changeTimeout = setTimeout(() => {
                readyCallback();

                this.activeRound.ended = false;
                this.activeRound.balls = this.modelValue.balls;
                this.activeRound.score = this.modelValue.score;

                if ( this.activeRound.balls === 0 ) {
                    this.removeListeners();
                }
                changeTimeout = null;
            }, timeout );
        },
        flashMessage( message: GameMessages | null, optTimeout = 2000 ): void {
            this.clearMessage();

            if ( message !== null ) {
                this.message = i18nForMessage( message, this.modelValue );
                this.messageTimeout = window.setTimeout(() => {
                    this.clearMessage();
                }, optTimeout );
            }
        },
        clearMessage(): void {
            clearTimeout( this.messageTimeout );
            this.messageTimeout = null;
            this.message = null;
        },
    }
};
</script>

<style lang="scss" scoped>
@import "@/styles/_animation";
@import "@/styles/_mixins";
@import "@/styles/_typography";
@import "@/styles/_variables";

.canvas-container {
    overflow: hidden;
    text-align: center;

    &--active {
        cursor: none;
    }

    &--centered {
        @include center();
    }

    @include mobile() {
        margin-top: $menu-height;
    }
}

.status-display {
    @include displayFont();
    @include noSelect();
    @include noEvents();
    position: fixed;
    left: 0;
    bottom: 0;
    width: 100%;
    background-color: #000;
    color: #FFF;
    height: 79px;

    @include large() {
        height: 100px;
    }

    &__container {
        max-width: 800px;
        margin: 0 auto;
        height: inherit;
        display: flex;
        justify-content: space-around;
        align-items: center;

        @include mobile() {
            flex-direction: column;
        }
    }

    &__game-details {
        display: flex;
        justify-content: space-around;
        width: 100%;
        font-size: 18px;
        padding-top: $spacing-small;

        @include large() {
            flex-direction: column;
            height: 60%;
            padding: 0;
        }
    }

    &__score {
        max-width: 350px;
        font-size: 48px;

        @include large() {
            font-size: 64px;
        }
    }

    &__message {
        @include animationBlink( 0.25s );
        text-transform: uppercase;
        font-size: 36px;

        @include large() {
            font-size: 64px;
        }
    }
}

.touch-area {
    position: fixed;
    top: 0;
    left: 0;
    width: 50%;
    height: 100%;
    overscroll-behavior: contain;

    &--right {
        left: 50%;
    }
}

.vhs-overlay {
    @include noEvents();
    position: fixed;
    width: 100%;
    height: 100%; // will be calculated dynamically
    top: 0;
    left: 0;
    background-image: linear-gradient(
        rgba( 17, 20, 53, 0.03 ),
        rgba( 118, 255, 241, 0.03 )
    );
    background-repeat: repeat;
    background-size: 100vw 10vh;
    animation: bgscroll 2s linear infinite, glitch .5s infinite;

    @include mobile() {
        top: $menu-height;
    }
}

@keyframes glitch {
    0% {
        transform: rotate(0deg) translate(.11rem) rotate(0deg);
    }
    100% {
        transform: rotate(360deg) translate(.11rem)  rotate(-360deg);
    }
}
@keyframes bgscroll {
    100% {
        background-position: 0% 100%;
    }
}
</style>
