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
    <div class="modal">
        <div class="modal__header">
            <h2
                v-if="title"
                class="modal__header-title"
            >{{ title }}</h2>
            <button
                v-if="dismissible"
                type="button"
                class="close-button"
                :title="$t('ui.closeWindow')"
                @click="close()"
            >x</button>
        </div>
        <div class="modal__content">
            <slot></slot>
        </div>
    </div>
</template>

<script lang="ts">
export default {
    props: {
        title: {
            type: String,
            default: null,
        },
        dismissible: {
            type: Boolean,
            default: true,
        },
    },
    created(): void {
        this._keyHandler = this.handleKeys.bind( this );
        window.addEventListener( "keyup", this._keyHandler );
    },
    destroyed(): void {
        window.removeEventListener( "keyup", this._keyHandler );
    },
    methods: {
        handleKeys({ keyCode }): void {
            if ( this.dismissible && keyCode === 27 ) {
                this.close();
            }
        },
        close(): void {
            this.$emit( "close" );
        }
    },
};
</script>

<style lang="scss" scoped>
@use "sass:math";

@import "@/styles/_mixins";
@import "@/styles/_variables";
@import "@/styles/_typography";

.modal {
    position: absolute;
    width: 100%;
    overflow: hidden;
    left: 0;
    z-index: $z-index-modal;
    box-sizing: border-box;
    padding: 0 $spacing-medium;
    background-color: $color-modal-bg;
    font-family: Helvetica, sans-serif;
    line-height: 1.5;
    color: $color-text;

    &__header-title {
        @include titleFontGradient();
        margin: 0 0 $spacing-small;
    }

    &__content {
        @include noSelect();
        @include scrollableWindow();
        padding-bottom: $spacing-large;
        color: #e2e2e2;
    }

    @include large() {
        @include center();
        padding: $spacing-medium $spacing-large 0 $spacing-xlarge;
        margin-top: math.div( $menu-height, 2 );
        max-width: 600px;
        border: 3px solid $color-outlines;
        border-radius: $spacing-large;
        box-shadow:
           0 0 15px 7.5px #fff,  /* inner white */
           0 0 25px 15px #0000ff; /* middle magenta */
           // 0 0 37.5px 22.5px #0ff; /* outer cyan */

       &__content {
            max-height: 55vh;
            padding-right: $spacing-large;
       }
    }

    @include mobile() {
        display: flex;
        flex-direction: column;
        top: $menu-height;
        height: calc( 100% - $menu-height );

        &__header-title {
            font-size: 36px;
            margin-top: 14px;
        }
    }
}

.close-button {
    @include button();
    display: flex;
    align-items: center;
    background: transparent;
    border: 3px solid $color-titles;
    color: $color-titles;
    border-radius: 50%;
    width: 48px;
    height: 48px;
    position: absolute;
    top: $spacing-large;
    right: $spacing-large;
    font-size: 150%;

    &:hover {
        background: transparent;
        border-color: $color-anchors;
    }

    @include mobile() {
        top: $spacing-medium;
        right: $spacing-medium;
        transform: scale(0.85);
    }
}
</style>
