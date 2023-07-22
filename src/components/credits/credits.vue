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
        <span v-t="'credits.introduction'"></span>
        <a href="https://www.igorski.nl" target="_blank" title="igorski.nl website">igorski</a>.<br />
    </p>
    <p v-for="( credit, index ) in credits" :key="`c_${index}`">
        {{ credit.type }} <a :href="credit.url" target="_blank">"{{ credit.title }}"</a> <span v-t="'by'"></span> {{ credit.author }}
    </p>
</template>

<script lang="ts">
export default {
    created(): void {
        this.credits = [
            {
                title: "Loader",
                author: "Nikhil Krishnan",
                type: this.$t( "credits.animation" ),
                url: "https://codepen.io/nikhil8krishnan/pen/rVoXJa",
            },
            {
                title: "Clubland",
                author: "Joseph Gibson",
                type: this.$t( "credits.font" ),
                url: "https://www.dafont.com/clubland.font",
            }
        ];
    },
};
</script>
