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
    <fieldset class="ps-fieldset">
        <div class="settings-wrapper">
            <label v-t="'settings.sound'"></label>
            <Toggle v-model="playSound" />
        </div>
        <div class="settings-wrapper">
            <label v-t="'settings.useThrottling'"></label>
            <Toggle v-model="useThrottling" />
        </div>
    </fieldset>
</template>

<script lang="ts">
import Toggle from "@vueform/toggle";
import { STORED_DISABLE_THROTTLING } from "@/definitions/settings";
import { getMuted, setMuted } from "@/services/audio-service";
import { getFromStorage, setInStorage } from "@/utils/local-storage";

export default {
    components: {
        Toggle,
    },
    data: () => ({
        useThrottling: getFromStorage( STORED_DISABLE_THROTTLING ) !== "false",
        playSound: !getMuted(),
    }),
    watch: {
        useThrottling( value: boolean ): void {
            setInStorage( STORED_DISABLE_THROTTLING, value.toString() );
        },
        playSound( value: boolean ): void {
            setMuted( !value );
        },
    },
};
</script>

<style src="@vueform/toggle/themes/default.css"></style>

<style lang="scss" scoped>
@import "@/styles/_variables";
@import "@/styles/_forms";

.settings-wrapper {
    display: flex;
    justify-content: space-between;
    margin-bottom: $spacing-medium;
}
</style>

<style lang="scss">
@import "@/styles/_variables";

.toggle-off {
    background-color: $color-titles;
    border-color: $color-titles;
}
</style>
