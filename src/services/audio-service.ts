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
import Config from "@/config/config";

let inited  = false;
let playing = false;
// @ts-expect-error Property 'env' does not exist on type 'ImportMeta', Vite takes care of it
let muted   = import.meta.env.MODE !== "production";
let queuedTrackId: string | null = null;
let playingTrackId: string | null = null;
let scheduledFrequency = 0;

let audioContext: AudioContext;
let filter: BiquadFilterNode;
let effectsBus: BiquadFilterNode;
let masterBus: AudioNode;
let sound: HTMLMediaElement;
let acSound: MediaElementAudioSourceNode;

/**
 * Must be called on user interaction to prevent locked AudioContext
 */
export const init = (): void => {
    if ( inited ) {
        return;
    }
    inited = true;

    setupWebAudioAPI();

    // prepare the sound effects
    //effect = createAudioElement( Assets.AUDIO.AU_EXPLOSION, false, effectsBus );

    // enqueue the first track for playback
    if ( queuedTrackId !== null ) {
        enqueueTrack( queuedTrackId );
    }
};

export const playSoundFX = ( effect: string ): void => {
    if ( inited && !muted ) {
        switch ( effect ) {
            default:
                break;
            // case Assets.AUDIO.AU_EXPLOSION:
            //     _playSoundFX( explosion );
            //     break;
        }
    }
};

/**
 * enqueue a track from the available pool for playing
 */
export const enqueueTrack = async( trackId: string ): Promise<void> => {
    if ( !inited || muted ) {
        queuedTrackId = trackId;
        return;
    }

    queuedTrackId = null;

    if ( playingTrackId === trackId ) {
        setFrequency();
        return;
    }

    // prepare the stream from SoundCloud, we create an inline <audio> tag instead
    // of using SC stream to overcome silence on mobile devices (looking at you, Apple!)
    // this will not actually play the track yet (see playEnqueuedTrack())

    stop();

    const requestData = {
        headers: {
            "Content-Type"  : "application/json; charset=utf-8",
            "Authorization" : `OAuth ${Config.getSoundCloudClientId()}`
        }
    };

    let { data } = await axios.get( `https://api.soundcloud.com/tracks/${trackId}`, requestData );
    if ( data?.access === "playable" && data.stream_url ) {
        //trackMeta = data;
        // data.stream_url should be the way to go but this leads to CORS errors when following
        // a redirect... for now use the /streams endpoint
        ({ data } = await axios.get( `https://api.soundcloud.com/tracks/${trackId}/streams`, requestData ));
        if ( data?.http_mp3_128_url ) {
            sound = createAudioElement( data.http_mp3_128_url, true, masterBus );
            _startPlayingEnqueuedTrack( trackId );
        }
    }
};

export const stop = (): void => {
    if ( sound ) {
        if ( audioContext ) {
            acSound.disconnect();
            acSound = null;
        }
        sound.pause();
        sound = null;
        playingTrackId = null;
    }
    playing = false;
};

export const setFrequency = ( value = 22050 ): void => {
    if ( scheduledFrequency === value ) {
        return;
    }
    if ( audioContext ) {
        scheduledFrequency = value;

        filter.frequency.cancelScheduledValues( audioContext.currentTime );
        filter.frequency.linearRampToValueAtTime( scheduledFrequency, audioContext.currentTime + 1.5 )
    }
};

/* internal methods */

function _startPlayingEnqueuedTrack( trackId: string ): void {
    if ( !sound ) {
        return;
    }
    try {
        sound.play();
        playingTrackId = trackId;
    } catch ( e ) {
        // no supported sources
        return;
    }
    playing = true;
}

function createAudioElement( source: string, loop = false, bus?: AudioNode ): HTMLMediaElement {
    const element = document.createElement( "audio" );
    element.crossOrigin = "anonymous";
    element.setAttribute( "src", source );

    if ( loop ) {
        element.setAttribute( "loop", "loop" );
    }

    // connect sound to AudioContext when supported
    if ( bus ) {
        acSound = audioContext.createMediaElementSource( element );
        acSound.connect( bus );
    }
    return element;
}

function _playSoundFX( audioElement: HTMLMediaElement ): void {
    audioElement.currentTime = 0;
    // randomize pitch to prevent BOREDOM
    if ( effectsBus ) {
        effectsBus.detune.value = -1200 + ( Math.random() * 2400 ); // in -1200 to +1200 range
    }
    if ( !audioElement.paused || audioElement.currentTime ) {
        audioElement.currentTime = 0; // audio was paused/stopped
    } else {
        audioElement.play();
    }
}

function setupWebAudioAPI(): void {
    // @ts-expect-error Property 'webkitAudioContext' does not exist on type 'Window & typeof globalThis'
    const acConstructor = window.AudioContext || window.webkitAudioContext;
    if ( typeof acConstructor !== "undefined" ) {
        audioContext = new acConstructor();
        // a "channel strip" to connect all audio nodes to
        masterBus = audioContext.createGain();
        // a bus for all sound effects (biquad filter allows detuning)
        effectsBus = audioContext.createBiquadFilter();
        effectsBus.connect( masterBus );
        // a low-pass filter to apply onto the master bus
        filter = audioContext.createBiquadFilter();
        filter.type = "lowpass";
        masterBus.connect( filter );
        // filter connects to the output so we can actually hear stuff
        filter.connect( audioContext.destination );
        // set default frequency of filter
        setFrequency();
    }
}
