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
            <h3>{{ title }}</h3>
            <button
                v-if="dismissible"
                type="button"
                class="close-button"
                :title="$t('ui.closeWindow')"
                @click="close()"
            >&times;</button>
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
            required: true,
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
@import "@/styles/_variables";

.modal {
    position: absolute;
    width: 100%;
    left: 0;
    z-index: $z-index-modal;
    box-sizing: border-box;
    padding: 0 $spacing-large;
    background-color: #FF0099;

    &__content {
        padding-bottom: $spacing-large;
    }

    @include large() {
        max-width: 600px;
        max-height: 75%;
        padding-top: $spacing-medium;
        @include center();
    }

    @include mobile() {
        display: flex;
        flex-direction: column;
        top: $menu-height;
        height: calc(100% - $menu-height);

        &__content {
            @include scrollableWindow();
        }
    }
}

.close-button {
    position: absolute;
    top: $spacing-medium;
    right: $spacing-medium;
    cursor: pointer;
    background: none;
    border: 0;
    font-size: 150%;
}
</style>
