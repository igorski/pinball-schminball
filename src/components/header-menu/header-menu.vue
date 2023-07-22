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
    <header
        class="header"
        :class="{
            'header--expanded': menuOpened,
            'header--collapsable': collapsable
        }"
    >
        <nav class="menu">
            <div class="menu__toggle"
                 @click="toggleMenu"
             >
                <span>&#9776;</span>
            </div>
            <ul class="menu__items">
                <li>
                    <button
                        v-t="'menu.settings'"
                        type="button"
                        :title="$t('menu.settings')"
                        @click="openScreen('settings')"
                    ></button>
                </li>
                <li>
                    <button
                        v-t="'menu.credits'"
                        type="button"
                        :title="$t('menu.credits')"
                        @click="openScreen('credits')"
                    >
                    </button>
                </li>
            </ul>
        </nav>
    </header>
</template>

<script lang="ts">
export default {
    props: {
        collapsable: {
            type: Boolean,
            default: false
        }
    },
    data: () => ({
        menuOpened: false,
    }),
    methods: {
        toggleMenu(): void {
            this.menuOpened = !this.menuOpened;
        },
        openScreen( target: string ): void {
            this.$emit( "open", target );
            this.menuOpened = false;
        },
    }
};
</script>

<style lang="scss" scoped>
@import "@/styles/_variables";

.header {
    position: fixed;
    left: 0;
    top: 0;
    z-index: $z-index-header;
    background-color: #000;
    width: 100%;
    height: $menu-height;
    padding: 0;

    @include mobile() {
        width: 100%;
        background-color: #000;

        &--expanded {
            height: 100%;
        }
    }

    @include large() {
        &--collapsable {
            top: -( $menu-height - $spacing-small );
            transition: top 0.35s ease-in-out;

            &:hover {
                top: 0;
            }
        }
    }
}

// menu is horizontal bar aligned to the top of the screen on resolutions above mobile width

.menu {
    @include noSelect();
    width: 100%;
    height: 100%;
    box-sizing: border-box;

    &__toggle {
        position: absolute;
        display: none;
        top: 0;
        left: 0;
        cursor: pointer;
        width: $menu-toggle-width;
        height: $menu-height;
        background-color: #0e1417;
        color: #FFF;

        span {
            display: block;
            font-size: 150%;
            margin: 12px;
        }
    }

    ul {
        padding: 0;
        box-sizing: border-box;
        list-style-type: none;
    }

    .menu__items {
        width: 100%;
        line-height: $menu-height;
        vertical-align: middle;
        margin: 0 auto;
        display: block;

        &__sub {
            li button {
                display: block;
                margin: $spacing-medium 0;
            }
        }

        @include large() {
            text-align: left;

            &__sub {
                padding-top: $menu-height;
                background-color: transparent;

                li button {
                    background-color: #000;
                }
            }
        }
    }

    li {
        display: inline;
        padding: 0;
        margin: 0 $spacing-medium;

        button, a {
            cursor: pointer;
            border: 0;
            background: none;
            color: #FFF;
            font-size: 100%;
            text-decoration: none;
            padding: 0 $spacing-small;

            &:hover {
                color: #FF6600;
            }
        }
    }

    &--expanded {
        position: absolute;
    }

    @include large() {
        max-width: $app-width;
        margin: 0 auto;
    }

    // on resolution below the mobile threshold the menu is fullscreen and vertically stacked

    @include mobile() {
        position: fixed;
        overflow: hidden;
        width: 100%;
        height: inherit;
        top: 0;
        left: 0;

        .menu__items {
            margin: $menu-height auto 0;
            background-color: #000;
            height: calc(100% - #{$menu-height});
            overflow: hidden;
            overflow-y: auto;

            li {
                display: block;
                margin: 0;
                width: 100%;
                line-height: $spacing-xlarge;
                padding: 0 $spacing-medium;
                box-sizing: border-box;
            }
        }

        &__toggle {
            display: block; // only visible in mobile view
            height: $menu-height;
        }
    }
}
</style>
