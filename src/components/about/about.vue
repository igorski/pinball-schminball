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
    <p>
        <span v-t="'about.introduction'"></span>
        &nbsp;<a href="https://www.igorski.nl" target="_blank" title="igorski.nl website">igorski</a>.<br />
    </p>
    <p>
        <span v-t="'about.opensource'"></span>
        &nbsp;<a href="https://www.github.com/igorski/pinball-schminball" target="_blank" noopener>GitHub</a>.
    </p>
    <h3
        v-t="'about.credits'"
        class="title-header"
    ></h3>
    <p
        v-for="( credit, index ) in credits"
        :key="`c_${index}`"
        class="credit-entry"
    >
        {{ credit.type }} <a :href="credit.url" target="_blank">"{{ credit.title }}"</a> <span v-t="'about.by'"></span> {{ credit.author }}
    </p>
</template>

<script lang="ts">
export default {
    created(): void {
        this.credits = [
            {
                title: "Loader",
                author: "Nikhil Krishnan",
                type: this.$t( "about.animation" ),
                url: "https://codepen.io/nikhil8krishnan/pen/rVoXJa",
            },
            {
                title: "Neon overdrive",
                author: "Darrell Flood",
                type: this.$t( "about.font" ),
                url: "https://www.dafont.com/neon-overdrive.font",
            },
            {
                title: "Clubland",
                author: "Joseph Gibson",
                type: this.$t( "about.font" ),
                url: "https://www.dafont.com/clubland.font",
            },
            {
                title: "Rollerball",
                author: "HAL Laboratory",
                type: this.$t( "about.tableDesign" ),
                url: "https://en.wikipedia.org/wiki/Rollerball_(video_game)",
            }
        ];
    },
};
</script>

<style lang="scss" scoped>
@import "@/styles/_typography";

.credit-entry {
    margin: $spacing-small 0;
}

.title-header {
    @include titleFont( 24px );
    color: $color-titles-sub;
    letter-spacing: 0.2em;
}
</style>
