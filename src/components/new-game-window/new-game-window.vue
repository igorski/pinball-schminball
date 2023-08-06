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
        class="ps-fieldset"
        @keydown.enter="startGame()"
        @keyup.left="previousTable()"
        @keyup.right="nextTable()"
    >
        <div class="title">
            <div class="title__wrapper">
                <img src="@@/sprites/title_upper.png" class="title__upper" />
                <img src="@@/sprites/title_lower.png" class="title__lower" />
            </div>
        </div>
        <div class="ps-input-wrapper">
            <label
                v-t="'ui.yourName'"
                for="nameInput"
                class="ps-input-wrapper__label"
            ></label>
            <input
                id="nameInput"
                ref="nameInput"
                v-model="internalValue.playerName"
                class="ps-input-wrapper__input"
                :placeholder="$t( 'ui.playerName' )"
            />
        </div>
        <div
            v-if="canSelectTable"
            class="ps-input-wrapper"
        >
            <label
                v-t="'ui.table'"
                for="nameInput"
                class="ps-input-wrapper__label"
            ></label>
            <div class="ps-input-wrapper__nav">
                <button
                    type="button"
                    :title="$t('ui.selectPrevious')"
                    class="ps-input-wrapper__nav-button"
                    @click="previousTable()"
                >{{ "<" }}</button>
                <span class="ps-input-wrapper__nav-item">{{ internalValue.tableName }}</span>
                <button
                    type="button"
                    :title="$t('ui.selectNext')"
                    class="ps-input-wrapper__nav-button"
                    @click="nextTable()"
                >{{ ">" }}</button>
            </div>
        </div>
        <div class="ps-button-wrapper">
            <button
                v-t="'ui.newGame'"
                type="button"
                class="ps-button-wrapper__button"
                :disabled="!isValid"
                @click="startGame()"
            ></button>
        </div>
        <!-- <span
            v-t="'ui.nameExplanation'"
            class="ps-input-explanation"
        ></span> -->
    </fieldset>
</template>

<script lang="ts">
import { PropType } from "vue";
import Tables from "@/definitions/tables";
import { STORED_PLAYER_NAME } from "@/definitions/settings";
import { getFromStorage, setInStorage } from "@/utils/local-storage";

export type NewGameProps = {
    playerName: string;
    table: number;
    tableName: string;
};

export default {
    props: {
        modelValue: {
            type: Object as PropType<NewGameProps>,
            required: true,
        },
    },
    computed: {
        internalValue: {
            get(): NewGameProps {
                return this.modelValue;
            },
            set( value: NewGameProps ): void {
                this.$emit( "update:modelValue", value );
            }
        },
        isValid(): boolean {
            if ( this.modelValue.playerName.length === 0 ) {
                return true;
            }
            const { playerName } = this.modelValue;
            return playerName.trim( "" ).length > 0;
        },
        canSelectTable(): boolean {
            return Tables.length > 1;
        },
    },
    watch: {
        "internalValue.table": {
            immediate: true,
            handler( value: number ): void {
                this.internalValue.tableName = Tables[ value ].name;
            },
        },
    },
    mounted(): void {
        this.internalValue.playerName = getFromStorage( STORED_PLAYER_NAME ) || "";

        this.$refs.nameInput.focus();
    },
    beforeUnmount(): void {
        setInStorage( STORED_PLAYER_NAME, this.internalValue.playerName );
    },
    methods: {
        startGame(): void {
            if ( !this.isValid ) {
                return;
            }
            this.$emit( "start" );
        },
        previousTable(): void {
            let previous = this.internalValue.table - 1;
            if ( previous < 0 ) {
                previous = Tables.length - 1;
            }
            this.internalValue.table = previous;
        },
        nextTable(): void {
            let next = this.internalValue.table + 1;
            if ( next > Tables.length - 1 ) {
                next = 0;
            }
            this.internalValue.table = next;
        },
    },
};
</script>


<style lang="scss" scoped>
@import "@/styles/_variables";
@import "@/styles/_forms";
@import "@/styles/_typography";

.title {
    text-align: center;
    padding-top: $spacing-medium;

    &__wrapper {
        width: 75%;
        max-width: 400px;
        margin: $spacing-medium auto 0;
    }

    img {
        width: inherit;
    }

    &__lower {
        transform: scale(0.77);
        margin: -23px 0 0 -8px;
    }
}

.ps-input-wrapper {
    &__nav {
        display: flex;
        justify-content: space-between;
        align-items: center;
        width: 100%;

        &-button {
            @include titleFont();
            cursor: pointer;
            background: none;
            border: none;
            color: #FFF;

            &:hover {
                color: $color-anchors;
            }
        }

        &-item {
            @include titleFont( 24px );
            color: $color-anchors;
        }
    }

    @include large() {
        &__label {
            width: 170px;
        }

        &__nav {
            width: calc(100% - 170px);
        }
    }
}
</style>
