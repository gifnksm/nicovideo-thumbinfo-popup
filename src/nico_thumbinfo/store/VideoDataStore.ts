/// <reference path="../../../typings/common.d.ts" />

import {EventEmitter} from "events";
import VideoKey from "../model/VideoKey"
import {Data as VideoData} from "../model/VideoData"

const CHANGE_EVENT = "change";

export interface VideoDataStoreInterface {
    addChangeListener(callback: (key: VideoKey) => void): void;
    removeChangeListener(callback: (key: VideoKey) => void): void;
    getVideoDataByKey(key: VideoKey): VideoData;
}

class VideoDataStore implements VideoDataStoreInterface {
    private _emitter: EventEmitter = new EventEmitter();

    private _emitChange(key: VideoKey) {
        this._emitter.emit(CHANGE_EVENT, key);
    }

    addChangeListener(callback: (key: VideoKey) => void) {
        this._emitter.addListener(CHANGE_EVENT, callback);
    }
    removeChangeListener(callback: (key: VideoKey) => void) {
        this._emitter.removeListener(CHANGE_EVENT, callback);
    }
    getVideoDataByKey(key: VideoKey): VideoData {
        return new VideoData(key);
    }
}

const store = new VideoDataStore();
export default store;
