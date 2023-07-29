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
    <p v-if="!isSupported">
        High scores are not supported in this environment.
    </p>
    <div v-else>
        <p v-for="( entry, index ) in formattedScores" :key="`c_${index}`">
            {{ index + 1 }}: {{ entry.score }} {{ entry.name }}
        </p>
    </div>
</template>

<script lang="ts">
import type { HighScoreDef } from "@/services/high-scores-service";
import { isSupported, getHighScores } from "@/services/high-scores-service";

interface ComponentData {
    isSupported: boolean;
    scores: HighScoreDef[];
};

export default {
    data: (): ComponentData => ({
        isSupported: false,
        scores: []
    }),
    computed: {
        formattedScores(): HighScoreDef[] {
            if ( this.scores.length > 0 ) {
                return this.scores;
            }
            const names = "JIHGFEDCBA";
            const scores = [];
            for ( let i = scores.length; i < 10; ++i ) {
                scores.push({ name: new Array( 4 ).fill( names[ i ] ).join( "" ), score: 1000 * ( i + 1 ) });
            }
            return scores.reverse();
        },
    },
    async mounted(): Promise<void> {
        this.isSupported = isSupported();

        if ( this.isSupported ) {
            this.scores = await getHighScores();
        }
    },
};
</script>