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
    <div class="round-results">
        <div class="round-results__content">
            <h3
                v-t="'ui.roundUp'"
                class="round-results__content-title"
            ></h3>
            <div class="round-results__pair">
                <span v-t="'ui.totalPoints'"></span>
                <span>{{ score }}</span>
            </div>
            <div class="round-results__pair">
                <span v-t="'ui.remainingBalls'"></span>
                <span>{{ remainingBalls }}</span>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
export default {
    props: {
        score: {
            type: Number,
            required: true,
        },
        remainingBalls: {
            type: Number,
            required: true,
        },
    }
};
</script>

<style lang="scss" scoped>
@import "@/styles/_animation";
@import "@/styles/_mixins";
@import "@/styles/_typography";
@import "@/styles/_variables";

.round-results {
    @include noSelect();
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, .75);

    &__content {
        @include displayFont();
        @include center();
        width: 100%;
        color: #FFF;

        &-title {
            @include animationBlink( 0.5s );
            text-align: center;
            font-size: 48px;
            font-weight: normal;
        }

        @include large() {
            width: 400px;
        }
    }

    &__pair {
        @include animationFadeIn();
        display: flex;
        justify-content: space-between;
        font-size: 24px;
        margin-bottom: $spacing-medium;

        @include mobile() {
            padding: 0 $spacing-large;
            font-size: 16px;
        }
    }
}
</style>
