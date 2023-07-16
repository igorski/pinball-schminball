<template>
    <p v-if="loading">Loading...</p>
    <PinballTable v-else />
</template>

<script lang="ts">
import { preloadAssets } from "@/services/asset-preloader";
import { init } from "@/services/audio-service";
import PinballTable from "./components/pinball-table/pinball-table.vue";

export default {
    components: {
        PinballTable
    },
    data: () => ({
        loading: true,
    }),
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

<style>
body {
    margin: 0;
    padding: 0;
    overflow: hidden;
}
</style>
