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
    <p v-if="loading">Loading...</p>
    <template v-else>
        <header-menu @open="activeScreen = $event"/>
        <PinballTable />
    </template>
    <modal
        v-if="hasScreen"
        :title="$t(`menu.${activeScreen}`)"
        @close="activeScreen = null"
    >
        <ScreenCredits v-if="activeScreen === 'credits'" />
        <ScreenSettings v-else-if="activeScreen === 'settings'" />
    </modal>
</template>

<script lang="ts">
import { defineAsyncComponent } from "vue";
import type { Component } from "vue";
import { preloadAssets } from "@/services/asset-preloader";
import { init } from "@/services/audio-service";
import HeaderMenu from "./components/header-menu/header-menu.vue";
import Modal from "@/components/modal/modal.vue";

export default {
    components: {
        HeaderMenu,
        Modal,
        PinballTable: defineAsyncComponent(() => {
            return import( "./components/pinball-table/pinball-table.vue" );
        }),
        ScreenCredits: defineAsyncComponent(() => {
            return import( "./components/credits/credits.vue" );
        }),
        ScreenSettings: defineAsyncComponent(() => {
            return import( "./components/settings/settings.vue" );
        }),
    },
    data: () => ({
        loading: true,
        activeScreen: "",
    }),
    computed: {
        hasScreen(): boolean {
            return !!this.activeScreen;
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
}
</style>
