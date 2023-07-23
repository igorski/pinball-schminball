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
        <header-menu
            :collapsable="game.active"
            @open="activeScreen = $event"
        />
        <PinballTable v-model="game" />
    </template>
    <modal
        v-if="hasScreen"
        :title="$t(`menu.${activeScreen}`)"
        @close="activeScreen = null"
    >
        <ScreenHighScores v-if="activeScreen === 'highScores'" />
        <ScreenSettings v-if="activeScreen === 'settings'" />
        <ScreenCredits v-if="activeScreen === 'credits'" />
    </modal>
    <div v-else-if="!game.active" class="overlay">
        <h3
            v-if="hasPlayed"
            v-t="'messages.gameOver'"
        ></h3>
        <new-game-window
            v-model="playerName"
            @start="initGame()"
        />
    </div>
</template>

<script lang="ts">
import { defineAsyncComponent } from "vue";
import type { Component } from "vue";
import type { GameDef } from "@/definitions/game";
import { preloadAssets } from "@/services/asset-preloader";
import { init } from "@/services/audio-service";
import { isSupported, startGame, stopGame } from "@/services/high-scores-service";
import HeaderMenu from "./components/header-menu/header-menu.vue";
import Loader from "@/components/loader/loader.vue";
import Modal from "@/components/modal/modal.vue";
import NewGameWindow from "@/components/new-game-window/new-game-window.vue";

interface ComponentData {
    loading: boolean;
    activeScreen: string;
    playerName: string;
    game: GameDef;
    hasPlayed: boolean;
};

export default {
    components: {
        HeaderMenu,
        Loader,
        Modal,
        NewGameWindow,
        PinballTable: defineAsyncComponent(() => {
            return import( "./components/pinball-table/pinball-table.vue" );
        }),
        ScreenHighScores: defineAsyncComponent(() => {
            return import( "./components/high-scores/high-scores.vue" );
        }),
        ScreenSettings: defineAsyncComponent(() => {
            return import( "./components/settings/settings.vue" );
        }),
        ScreenCredits: defineAsyncComponent(() => {
            return import( "./components/credits/credits.vue" );
        }),
    },
    data: () => ({
        loading: true,
        activeScreen: "",
        playerName: "",
        hasPlayed: false,
        game: {
            active: false,
            table: 0,
            score: 0,
            balls: 3,
            multiplier: 1,
        },
    }),
    computed: {
        hasScreen(): boolean {
            return !!this.activeScreen;
        },
        canUseHighScores(): boolean {
            return isSupported() && !!this.playerName;
        },
    },
    watch: {
        'game.active'( value: boolean, prevValue: boolean ): void {
            if ( !value && prevValue && this.game.id ) {
                stopGame( this.game.id, this.game.score, this.playerName );
            }
        },
    },
    async mounted(): Promise<void> {
        await preloadAssets();
        this.loading = false;

        // unlock the AudioContext as soon as we receive a user interaction event
        const handler = ( e: Event ): void => {
            if ( e.type === "keydown" && ( e as KeyboardEvent ).keyCode === 27 ) {
                return; // hitting escape will not actually unlock the AudioContext
            }
            document.removeEventListener( "click",   handler, false );
            document.removeEventListener( "keydown", handler, false );

            init();
        };
        document.addEventListener( "click", handler );
        document.addEventListener( "keydown", handler );
    },
    methods: {
        async initGame(): Promise<void> {
            const id = this.canUseHighScores ? await startGame() : null;
            this.game = {
                id,
                active: true,
                table: 0,
                score: 0,
                balls: 3,
                multiplier: 1,
            };
            this.hasPlayed = true;
        },
    },
};
</script>

<style lang="scss">
html, body {
    overscroll-behavior-x: none; /* disable navigation back/forward swipe on Chrome */
}

body {
    width: 100%;
    height: 100%;
    overflow: hidden;
    margin: 0;
    padding: 0;
    overflow: hidden;
    background-color: #222;
}
</style>

<style lang="scss" scoped>
@import "@/styles/_variables";

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
</style>
