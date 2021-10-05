<template>
    <p v-if="loading">Loading...</p>
    <PinballTable v-else />
</template>

<script>
import { preloadAssets } from "@/services/asset-preloader";
import PinballTable from "./components/pinball-table/pinball-table";

export default {
    components: {
        PinballTable
    },
    data: () => ({
        loading: true,
    }),
    async mounted() {
        await preloadAssets();
        this.loading = false;
    }
};
</script>

<style>
body {
    margin: 0;
    padding: 0;
    overflow: hidden;
}
</style>
