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
    <fieldset
        class="new-game-fieldset"
        @keydown.enter="startGame()"
    >
        <div class="new-game-input-wrapper">
            <label v-t="'ui.yourName'" for="nameInput"></label>
            <input
                id="nameInput"
                ref="nameInput"
                v-model="internalValue"
                :placeholder="$t( 'ui.playerName' )"
                :class="{ 'invalid': !isValid }"
            />
        </div>
        <span v-t="'ui.nameExplanation'" class="name-explanation"></span>
        <div class="new-game-input-wrapper">
            <label></label>
            <button
                v-t="'ui.newGame'"
                type="button"
                class="start-game-button"
                :disabled="!isValid"
                @click="startGame()"
            ></button>
        </div>
    </fieldset>
</template>

<script lang="ts">
import { getFromStorage, setInStorage } from "@/utils/local-storage";

const STORED_PLAYER_NAME = "ps_player_name";

export default {
    props: {
        modelValue: {
            type: String,
            required: true,
        },
    },
    computed: {
        internalValue: {
            get(): string {
                return this.modelValue;
            },
            set( value: string ): void {
                this.$emit( "update:modelValue", value );
            }
        },
        isValid(): boolean {
            if ( this.modelValue.length === 0 ) {
                return true;
            }
            return this.modelValue.trim( "" ).length > 0;
        },
    },
    mounted(): void {
        this.internalValue = getFromStorage( STORED_PLAYER_NAME ) || "";

        this.$refs.nameInput.focus();
    },
    beforeUnmount(): void {
        setInStorage( STORED_PLAYER_NAME, this.internalValue );
    },
    methods: {
        startGame(): void {
            if ( !this.isValid ) {
                return;
            }
            this.$emit( "start" );
        }
    },
};
</script>


<style lang="scss" scoped>
@import "@/styles/_variables";

.new-game-fieldset {
    border: none;
    padding: 0;
}

.new-game-input-wrapper {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin: $spacing-medium 0;
}

#nameInput {
    width: 200px;
    padding: $spacing-medium;
    border-radius: 7px;
    border: none;

    &.invalid {
        background-color: red;
        color: #000;
    }
}

.name-explanation {
    font-style: italic;
    font-size: 75%;
}

.start-game-button {
    cursor: pointer;
    padding: $spacing-medium;
    border-radius: 14px;
    background-color: transparent;
    border: 3px solid #000;
    text-transform: uppercase;

    &:hover {
        background-color: #000;
        color: #FFF;
    }
}
</style>
