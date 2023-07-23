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
import axios from "axios";

/**
 * URLs to REST endpoint.
 * All URLs should end in trailing slashes.
 */
type HighScoreServiceConfiguration = {
    list: string;
    start: string;
    stop: string;
};

export type HighScoreDef = {
    name: string;
    score: number;
    duration: number;
};

export const isSupported = (): boolean => {
    return !!getConfiguration();
};

/**
 * Invoke when starting a new game so it can be registered in the remote service
 * Returns string id identifying the game or null when game could not be registered.
 */
export const startGame = async (): Promise<string | null> => {
    const startEndpoint = getConfiguration()?.start;
    if ( !startEndpoint ) {
        return null;
    }
    const { data } = await axios.get( startEndpoint );
    if ( data?.success === true && typeof data.id === "string" ) {
        return data.id;
    }
    return null;
};

export const stopGame = async ( gameId: string, score: number, playerName?: string ): Promise<HighScoreDef[]> => {
    const stopEndpoint = getConfiguration()?.stop;
    if ( !stopEndpoint ) {
        return [];
    }
    const { data } = await axios.post( `${stopEndpoint}${gameId}`, {
        score,
        name: playerName,
    });
    return data?.scores ?? [];
};

export const getHighScores = async (): Promise<HighScoreDef[]> => {
    const listEndpoint = getConfiguration()?.list;
    if ( !listEndpoint ) {
        return null;
    }
    const { data } = await axios.get( listEndpoint );
    return data?.scores ?? [];
};

/* internal methods */

function getConfiguration(): HighScoreServiceConfiguration | undefined {
    // @ts-expect-error Property 'psConf' does not exist on type 'Window & typeof globalThis'.
    if ( window.psConf ) return window.psConf;

    // @ts-expect-error Property 'env' does not exist on type 'ImportMeta', Vite takes care of it
    if ( import.meta.env.MODE !== "production" ) {
        // in local dev mode we allow custom overrides
        try {
            const localSettings = window.localStorage.getItem( "psConf" );
            return JSON.parse( localSettings );
        } catch {}
    }
}
