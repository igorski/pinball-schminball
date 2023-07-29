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
import type { GameDef } from "@/definitions/game";
import { GameMessages } from "@/definitions/game";
import { i18n } from "../../i18n";

export const i18nForMessage = ( message: GameMessages, game: GameDef ): string => {
    let key: string = "";
    let optData: any;

    switch ( message ) {
        default:
            break
        case GameMessages.GOT_LUCKY:
            key = "gotLucky";
            break;
        case GameMessages.TILT:
            key = "tilt";
            break;
        case GameMessages.MULTIBALL:
            key = "multiball";
            break;
        case GameMessages.MULTIPLIER:
            key = "multiplier";
            optData = { count: game.multiplier };
            break;
        case GameMessages.LOOP:
            key = "loop";
            optData = { count: game.multiplier };
            break;
        case GameMessages.TRICK_SHOT:
            key = "trickShot";
            optData = { count: game.multiplier };
            break;
    }
    // @ts-expect-error Type instantiation is excessively deep and possibly infinite.
    return i18n.t( `messages.${key}`, optData );
};
