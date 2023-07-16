import { defineConfig } from "vite";
import path from "path";
import vue from "@vitejs/plugin-vue";
import { viteStaticCopy } from "vite-plugin-static-copy";

const dirSrc    = `${__dirname}/src`;
const dirAssets = `${dirSrc}/assets`;
const dest      = `${__dirname}/dist`;

// https://vitejs.dev/config/
export default defineConfig({
    base: "./",
    plugins: [
        vue(),
        // viteStaticCopy({
        //     targets: [{
        //         src: dirAssets,
        //         dest: path.resolve( dest ),
        //     }]
        // }),
    ],
    resolve: {
        alias: {
            "@": path.resolve( __dirname, "./src" ),
        },
    },
});
