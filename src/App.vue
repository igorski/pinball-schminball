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
        <PinballTable
            v-model="game"
            :use-vhs="config.useVHS"
        />
        <Tutorial
            v-if="showTutorial"
            :touchscreen="hasTouchScreen"
            @completed="onTutorialCompleted()"
        />
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
                v-model="newGameProps"
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
import type { NewGameProps } from "@/components/new-game-window/new-game-window.vue";
import type { GameDef } from "@/definitions/game";
import { START_TABLE_INDEX } from "@/definitions/tables";
import { STORED_FULLSCREEN, STORED_HAS_VIEWED_TUTORIAL, STORED_DISABLE_VHS_EFFECT } from "@/definitions/settings";
import { preloadAssets } from "@/services/asset-preloader";
import { init } from "@/services/audio-service";
import { isSupported, startGame, stopGame } from "@/services/high-scores-service";
import { getFromStorage, setInStorage } from "@/utils/local-storage";
import { isFullscreen, toggleFullscreen } from "@/utils/fullscreen-util";

interface ComponentData {
    loading: boolean;
    activeScreen: string;
    hasPlayed: boolean;
    startPending: boolean;
    hasTouchScreen: boolean;
    showTutorial: boolean;
    config: {
        useVHS: boolean;
    };
    newGameProps: NewGameProps;
    game: Partial<GameDef>;
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
        Tutorial: defineAsyncComponent(() => {
            return import( "./components/tutorial/tutorial.vue" );
        }),
    },
    data: () => ({
        loading: true,
        activeScreen: "",
        hasPlayed: false,
        startPending: false,
        hasTouchScreen: false,
        showTutorial: false,
        config: {
            useVHS: getFromStorage( STORED_DISABLE_VHS_EFFECT ) !== "true"
        },
        newGameProps: {
            playerName: "",
            table: START_TABLE_INDEX,
            tableName: "",
        },
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
            return isSupported() && this.newGameProps.playerName.length > 0;
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
            if ( !value && prevValue && this.canUseHighScores && this.game.score > 0 ) {
                stopGame( this.game.id, this.game.score, this.newGameProps.playerName, this.newGameProps.tableName );
            }
        },
        activeScreen( value: string | null, lastValue?: string | null  ): void {
            this.game.paused = !!value;
            if ( !value && lastValue === "settings" ) {
                this.config.useVHS = getFromStorage( STORED_DISABLE_VHS_EFFECT ) !== "true";
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

        const touchHandler = ( e: Event ): void => {
            this.hasTouchScreen = true;
            document.removeEventListener( "touchstart", touchHandler, false );
        };
        document.addEventListener( "click", handler );
        document.addEventListener( "keydown", handler );
        document.addEventListener( "touchstart", touchHandler );
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
                const id = this.canUseHighScores ? await startGame() : null;
                this.showTutorial = getFromStorage( STORED_HAS_VIEWED_TUTORIAL ) !== "true";
                this.game = {
                    id: id ?? Math.random().toString(),
                    active: false,
                    paused: this.showTutorial,
                    table: this.newGameProps.table,
                    score: 0,
                    balls: 3,
                    multiplier: 1,
                    underworld: false,
                };
            } catch {
                this.startPending = false;
            }
        },
        onTutorialCompleted(): void {
            this.showTutorial = false;
            this.game.paused = false;

            setInStorage( STORED_HAS_VIEWED_TUTORIAL, "true" );
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
