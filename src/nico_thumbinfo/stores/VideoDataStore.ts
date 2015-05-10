/// <reference path="../../../typings/common.d.ts" />
"use strict";

import {EventEmitter} from "events";
import VideoKey from "./VideoKey";
import VideoData from "./VideoData";
import VideoDataOrganizer from "./VideoDataOrganizer";
import AppDispatcher, {AppDispatcherInterface} from "../../dispatcher/AppDispatcher";
import Payload from "../../dispatcher/Payload";
import NicoThumbinfoAction from "../actions/NicoThumbinfoAction";

const CHANGE_EVENT = "change";

export interface VideoDataStoreInterface {
    addChangeListener(callback: (key: VideoKey) => void): void;
    removeChangeListener(callback: (key: VideoKey) => void): void;
    getVideoDataByKey(key: VideoKey): VideoData;
}

class VideoDataStore implements VideoDataStoreInterface {
    private _emitter = new EventEmitter();
    private _organizerMap = new Map<string, VideoDataOrganizer>();
    private _dispatcher: AppDispatcherInterface;
    private _dispatchToken: string;

    constructor(dispatcher: AppDispatcherInterface) {
        this._dispatcher = dispatcher;
        this._dispatchToken = this._dispatcher.register(this._dispatchListener);
    }

    private _emitChange(key: VideoKey) {
        this._emitter.emit(CHANGE_EVENT, key);
    }

    addChangeListener(callback: (key: VideoKey) => void) {
        this._emitter.addListener(CHANGE_EVENT, callback);
    }
    removeChangeListener(callback: (key: VideoKey) => void) {
        this._emitter.removeListener(CHANGE_EVENT, callback);
    }

    getVideoDataByKey(videoKey: VideoKey): VideoData {
        let key = videoKey.valueOf();

        let organizer = this._organizerMap.get(key);
        if (organizer === undefined) {
            organizer = new VideoDataOrganizer(videoKey);
            this._organizerMap.set(key, organizer);
        }

        return organizer.videoData;
    }

    private _dispatchListener(payload: Payload) {
        let action = payload.action;
        if (action instanceof NicoThumbinfoAction) {
            this._handleNicoThumbinfoAction(action);
        }
    }

    private _handleNicoThumbinfoAction(action: NicoThumbinfoAction) {
        let key = action.key;
        let organizer = this._organizerMap.get(key.valueOf());
        if (organizer === undefined) {
            return;
        }

        let callback = () => this._emitChange(key);
        if (organizer.handleAction(action, callback)) {
            this._emitChange(key);
        }
    }
}

const store = new VideoDataStore(AppDispatcher);
export default store;
