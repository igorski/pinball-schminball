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
    <loader v-if="loading" />
    <template v-else>
        <p
            v-if="!isSupported">
            High scores are not supported in this environment.
        </p>
        <div v-else>
            <div
                v-for="( entry, index ) in formattedScores"
                :key="`c_${index}`"
                class="highscores-entry"
            >
                <span class="highscores-entry__name">{{ entry.name }}</span>
                <span class="highscores-entry__score">
                    <span
                        v-for="( number, idx ) in entry.score"
                        :key="`s_${idx}`"
                        :class="`highscores-entry__score-number-${number}`"
                    >
                        {{ number }}
                    </span>
                </span>
            </div>
        </div>
    </template>
</template>

<script lang="ts">
import Loader from "@/components/loader/loader.vue";
import type { HighScoreDef } from "@/services/high-scores-service";
import { isSupported, getHighScores } from "@/services/high-scores-service";

// our fancy font has some challenges for our presentation purposes
// for one, it does not support diacritics, fallback to the unaccented character
// for the other, the number "1" is not equally spaced, split the characters so
// we can space them individually (at the expensive of DOM pollution, but meh...)

const replaceDiacritics = ( def: HighScoreDef ): HighScoreDef => ({
    score: def.score.toString().split( "" ),
    name: def.name.normalize( "NFKD" ).replace( /[^\w\s.-_\/]/g, "" ),
});

interface ComponentData {
    isSupported: boolean;
    loading: boolean;
    scores: HighScoreDef[];
};

export default {
    components: {
        Loader,
    },
    data: (): ComponentData => ({
        isSupported: false,
        loading: true,
        scores: [],
    }),
    computed: {
        formattedScores(): HighScoreDef[] {
            const filteredScores = this.scores.filter(({ score }) => score > 0 );
            if ( filteredScores.length > 0 ) {
                return filteredScores.map( replaceDiacritics );
            }
            const names = "JIHGFEDCBA";
            const scores = [];
            for ( let i = scores.length; i < 10; ++i ) {
                scores.push({ name: new Array( 4 ).fill( names[ i ] ).join( "" ), score: 1000 * ( i + 1 ) });
            }
            return scores.reverse().map( replaceDiacritics );
        },
    },
    async mounted(): Promise<void> {
        this.isSupported = isSupported();

        if ( this.isSupported ) {
            this.scores = await getHighScores();
        }
        this.loading = false;
    },
};
</script>

<style lang="scss" scoped>
@import "@/styles/_variables";
@import "@/styles/_mixins";
@import "@/styles/_typography";

.highscores-entry {
    display: flex;
    justify-content: space-between;

    &__name {
        @include titleFont();
        color: $color-titles;
        text-overflow: ellipsis;
        overflow: hidden;
        white-space: nowrap;
    }

    &__score {
        @include titleFont();
        max-width: 200px;
        text-align: right;
        color: magenta;

        &-number-1 {
            letter-spacing: 0.1em;
        }
    }

    @include mobile() {
        &__name,
        &__score {
            font-size: 24px;
        }
    }
}
</style>
