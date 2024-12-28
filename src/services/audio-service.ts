/**
 * The MIT License (MIT)
 *
 * Igor Zinken 2023-2024 - https://www.igorski.nl
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
import { GameSounds } from "@/definitions/game";
import { STORED_MUTED_FX_SETTING, STORED_MUTED_MUSIC_SETTING } from "@/definitions/settings";
import { getFromStorage, setInStorage } from "@/utils/local-storage";

let inited  = false;
let playing = false;
let fxMuted = getFromStorage( STORED_MUTED_FX_SETTING ) === "true";
let musicMuted = getFromStorage( STORED_MUTED_MUSIC_SETTING ) === "true";
let queuedTrackId: string | null = null;
let playingTrackId: string | null = null;
let scheduledFrequency = 0;

let audioContext: AudioContext;
let filter: BiquadFilterNode;
let effectsBus: BiquadFilterNode;
let masterBus: AudioNode;
let sound: HTMLMediaElement | undefined;
let acSound: MediaElementAudioSourceNode | undefined;

/**
 * Dec 2024 : we could use the SoundCloud API to stream music
 * directly from there, but all old tokens were invalidated and until
 * further notice, new API tokens cannot be requested... fall back to local.
 */
type MusicSourceType = "soundcloud" | "local";
const MUSIC_SOURCE = "local" as MusicSourceType;

const SOUND_FX_PATH = "./assets/audio/";
const SOUND_EFFECTS = [
    { key: GameSounds.BALL_OUT,  file: "sfx_ball_out.mp3" },
    { key: GameSounds.BUMP,      file: "sfx_bump.mp3" },
    { key: GameSounds.BUMPER,    file: "sfx_bumper.mp3" },
    { key: GameSounds.EVENT,     file: "sfx_event.mp3" },
    { key: GameSounds.FLIPPER,   file: "sfx_flipper.mp3" },
    { key: GameSounds.POPPER,    file: "sfx_popper.mp3" },
    { key: GameSounds.TRIGGER,   file: "sfx_trigger.mp3" },
];

const soundEffects: Map<GameSounds, HTMLMediaElement> = new Map();

/**
 * Must be called on user interaction to prevent locked AudioContext
 */
export const init = (): void => {
    if ( inited ) {
        return;
    }
    inited = true;

    setupWebAudioAPI();

    if ( !fxMuted ) {
        loadSoundEffects();
    }

    // enqueue the first track for playback
    if ( queuedTrackId !== null ) {
        enqueueTrack( queuedTrackId );
    }
};

export const playSoundEffect = ( effect: GameSounds ): void => {
    if ( !inited || fxMuted ) {
        return;
    }

    if ( soundEffects.size === 0 ) {
        loadSoundEffects();
    }

    const soundEffect = soundEffects.get( effect );
    if ( soundEffect ) {
        _playSoundFX( soundEffect );
    }
};

/**
 * enqueue a track from the available pool for playing
 */
export const enqueueTrack = async( trackId: string ): Promise<void> => {
    if ( !inited || musicMuted ) {
        queuedTrackId = trackId;
        return;
    }

    queuedTrackId = null;

    if ( playingTrackId === trackId ) {
        setFrequency();
        return;
    }

    stop();

    if ( MUSIC_SOURCE === "soundcloud" ) {
        // prepare the stream from SoundCloud, we create an inline <audio> tag instead
        // of using SC stream to overcome silence on mobile devices (looking at you, Apple!)
        // this will not actually play the track yet (see playEnqueuedTrack())

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
    } else {
        sound = createAudioElement( `${SOUND_FX_PATH}music_${trackId}.mp3`, true, masterBus );
        _startPlayingEnqueuedTrack( trackId );
    }
};

export const stop = (): void => {
    if ( sound ) {
        if ( audioContext ) {
            acSound?.disconnect();
            acSound = undefined;
        }
        sound.pause();
        sound = undefined;
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

export const getFxMuted = (): boolean => {
    return fxMuted;
};

export const setFxMuted = ( value: boolean ): void => {
    fxMuted = value;
    setInStorage( STORED_MUTED_FX_SETTING, fxMuted.toString() );
};

export const getMusicMuted = (): boolean => {
    return musicMuted;
};

export const setMusicMuted = ( value: boolean ): void => {
    musicMuted = value;
    setInStorage( STORED_MUTED_MUSIC_SETTING, musicMuted.toString() );

    if ( musicMuted && playing ) {
        stop();
    } else if ( !musicMuted && playing && queuedTrackId ) {
        enqueueTrack( queuedTrackId );
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

function loadSoundEffects(): void {
    SOUND_EFFECTS.forEach( mapping => {
        soundEffects.set( mapping.key, createAudioElement( `${SOUND_FX_PATH}${mapping.file}`, false, effectsBus ));
    });
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
    if ( audioElement.currentTime > 0 && !audioElement.ended ) {
        return;
    }
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
