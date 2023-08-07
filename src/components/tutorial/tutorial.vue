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
<template>
    <section
        class="tutorial"
        @click="nextSlide()"
    >
        <div class="tutorial__wrapper">
            <h3 v-t="'tutorial.tutorial'" class="tutorial__title"></h3>
            <span
                v-t="`tutorial.${tutorialKeys[ activeSlide ]}`"
                class="tutorial__message"
                :class="{
                    'tutorial__message--fade-in': !fadeOut,
                    'tutorial__message--fade-out': fadeOut
                }"
            ></span>
            <span
                v-t="'tutorial.skip'"
                role="button"
                class="tutorial__skip"
                :class="{ 'tutorial__skip--visible': activeSlide > 0 }"
                @click="close()"
            ></span>
        </div>
    </section>
</template>

<script lang="ts">
const SLIDE_TIMEOUT = 3000;
const FADE_OUT_TIMEOUT = 1500;

export default {
    props: {
        touchscreen: {
            type: Boolean,
            default: false,
        },
    },
    data: () => ({
        activeSlide: 0,
        totalSlides: 0,
        fadeOut: false,
    }),
    computed: {
        tutorialKeys(): string[] {
            let keys: string[];

            if ( this.touchscreen ) {
                keys = [ "flippersTouchL", "flippersTouchR", "bumpTouch" ];
            } else {
                keys = [ "flippersKeysL", "flippersKeysR", "bumpKeys" ];
            }
            return [ ...keys, "bumpWarning1", "bumpWarning2", "haveFun" ];
        },
    },
    created(): void {
        this.totalSlides = this.tutorialKeys.length;
        this.runSlides();

        const INSTANT_SWITCH_KEYS = [ 13, 32 ];
        this.keyHandler = ( e: KeyboardEvent ): void => {
            if ( e.key === "Escape" ) {
                this.close();
            } else {
                this.nextSlide( !INSTANT_SWITCH_KEYS.includes( e.keyCode ) );
            }
        };
        document.addEventListener( "keyup", this.keyHandler );
    },
    beforeUnmount(): void {
        document.removeEventListener( "keyup", this.keyHandler, false );
    },
    methods: {
        runSlides(): void {
            this.slideTimeout = setTimeout(() => {
                this.nextSlide();
            }, SLIDE_TIMEOUT );
        },
        nextSlide( animate = true ): void {
            clearTimeout( this.slideTimeout );
            clearTimeout( this.fadeTimeout );

            const nextSlide = this.activeSlide + 1;

            if ( nextSlide === this.totalSlides ) {
                this.close();
            } else {
                if ( !animate ) {
                    this.fadeOut = false;
                    ++this.activeSlide;
                    this.runSlides();
                } else {
                    this.fadeOut = true;
                    this.fadeTimeout = setTimeout(() => {
                        ++this.activeSlide;
                        this.runSlides();

                        this.fadeOut = false;
                    }, FADE_OUT_TIMEOUT );
                }
            }
        },
        close(): void {
            this.$emit( "completed" );
        },
    },
};
</script>

<style lang="scss" scoped>
@import "@/styles/_mixins";
@import "@/styles/_typography";

@keyframes fadein {
    0% { background-color: rgba(0,0,0,.95); }
    50% { background-color: rgba(0,0,0,.85); }
    100% { background-color: rgba(0,0,0,.95); }
}

.tutorial {
    @include noSelect();
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    animation: fadein 3s infinite;

    &__wrapper {
        @include center();
        height: 80%;
        text-align: center;
    }

    &__title {
        @include titleFontGradient();
        color: #FFF;
    }

    &__message {
        @include titleFont( 24px );
        cursor: pointer;
        line-height: 2;
        color: $color-text-alt;
        transition: opacity 2s;

        &--fade-in {
            opacity: 1;
        }

        &--fade-out {
            opacity: 0;
        }
    }

    &__skip {
        @include titleFont( 16px );
        cursor: pointer;
        color: #FFF;
        position: fixed;
        bottom: 0;
        left: 50%;
        transform: translateX( -50% );
        transition: opacity 3.5s;
        opacity: 0;

        &--visible {
            opacity: 1;
        }

        &:hover {
            color: $color-anchors;
        }
    }
}
</style>
