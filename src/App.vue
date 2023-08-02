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
        <modal
            v-if="hasScreen"
            :title="$t(`menu.${activeScreen}`)"
            @close="activeScreen = null"
        >
            <component :is="modalComponent" />
        </modal>
        <modal
            v-else-if="!game.active"
            :dismissible="false"
        >
            <new-game-window
                v-model="playerName"
                @start="initGame()"
            />
        </modal>
    </template>
</template>

<script lang="ts">
import { defineAsyncComponent } from "vue";
import type { Component } from "vue";
import HeaderMenu from "./components/header-menu/header-menu.vue";
import Loader from "@/components/loader/loader.vue";
import Modal from "@/components/modal/modal.vue";
import NewGameWindow from "@/components/new-game-window/new-game-window.vue";
import type { GameDef } from "@/definitions/game";
import { START_TABLE_INDEX } from "@/definitions/tables";
import { STORED_FULLSCREEN } from "@/definitions/settings";
import { preloadAssets } from "@/services/asset-preloader";
import { init } from "@/services/audio-service";
import { isSupported, startGame, stopGame } from "@/services/high-scores-service";
import { getFromStorage } from "@/utils/local-storage";
import { isFullscreen, toggleFullscreen } from "@/utils/fullscreen-util";

interface ComponentData {
    loading: boolean;
    activeScreen: string;
    playerName: string;
    game: Partial<GameDef>;
    hasPlayed: boolean;
    startPending: boolean;
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
    },
    data: () => ({
        loading: true,
        activeScreen: "",
        playerName: "",
        hasPlayed: false,
        startPending: false,
        game: {
            active: false,
        },
    }),
    computed: {
        hasScreen(): boolean {
            return !!this.activeScreen;
        },
        modalComponent(): Component | null {
            switch ( this.activeScreen ) {
                default:
                    return null;
                case "highScores":
                    return defineAsyncComponent({
                        loader: () => import( "./components/high-scores/high-scores.vue" )
                    });
                case "settings":
                    return defineAsyncComponent({
                        loader: () => import( "./components/settings/settings.vue" )
                    });
                case "howToPlay":
                    return defineAsyncComponent({
                        loader: () => import( "./components/how-to-play/how-to-play.vue" )
                    });
                case "about":
                    return defineAsyncComponent({
                        loader: () => import( "./components/about/about.vue" )
                    });
            }
        },
        canUseHighScores(): boolean {
            return isSupported() && !!this.playerName;
        },
    },
    watch: {
        "game.active"( value: boolean, prevValue: boolean ): void {
            if ( value ) {
                this.startPending = false;
                if ( !this.hasPlayed ) {
                    this.hasPlayed = true;
                }
            }
            if ( !value && prevValue && this.canUseHighScores ) {
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
            if ( this.startPending ) {
                return;
            }
            if ( getFromStorage( STORED_FULLSCREEN ) === "true" && !isFullscreen() ) {
                toggleFullscreen();
            }
            this.startPending = true;
            try {
                const id = this.canUseHighScores && this.playerName.length > 0 ? await startGame() : null;
                this.game = {
                    id: id ?? Math.random().toString(),
                    active: false,
                    table: START_TABLE_INDEX,
                    score: 0,
                    balls: 3,
                    multiplier: 1,
                    underworld: false,
                };
            } catch {
                this.startPending = false;
            }
        },
    },
};
</script>

<style lang="scss">
@import "@/styles/_variables";
@import "@/styles/_typography";

html, body {
    overscroll-behavior-x: none; /* disable navigation back/forward swipe on Chrome */
}

body {
    width: 100%;
    height: 100%;
    margin: 0;
    padding: 0;
    overflow: hidden;
    background-color: $color-bg;
}
</style>
