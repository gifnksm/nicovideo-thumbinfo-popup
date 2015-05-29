/// <reference path="../../../typings/bundle.d.ts" />
"use strict";

import {EventEmitter} from "events";
import VideoData from "./VideoData";
import VideoDataOrganizer from "./VideoDataOrganizer";

import NicoThumbinfoAction from "../actions/NicoThumbinfoAction";

import ErrorInfo from "../models/ErrorInfo";
import VideoKey from "../models/VideoKey";

import AppDispatcher, {AppDispatcherInterface} from "../../dispatcher/AppDispatcher";
import Payload from "../../dispatcher/Payload";

const CHANGE_EVENT = "change";

export interface VideoDataStoreInterface {
    addChangeListener(callback: (key: VideoKey) => void): void;
    removeChangeListener(callback: (key: VideoKey) => void): void;
    getVideoDataOrganizerByKey(key: VideoKey): VideoDataOrganizerInterface;
}

export interface VideoDataOrganizerInterface {
    videoData: VideoData;
    getErrors(): ErrorInfo[];
}

class VideoDataStore implements VideoDataStoreInterface {
    private _emitter = new EventEmitter();
    private _organizerMap = new Map<string, VideoDataOrganizer>();
    private _dispatcher: AppDispatcherInterface;
    private _dispatchToken: string;

    constructor(dispatcher: AppDispatcherInterface) {
        this._dispatcher = dispatcher;
        this._dispatchToken = this._dispatcher.register(this._dispatchListener.bind(this));
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

    getVideoDataOrganizerByKey(videoKey: VideoKey): VideoDataOrganizerInterface {
        let key = videoKey.valueOf();

        let organizer = this._organizerMap.get(key);
        if (organizer === undefined) {
            organizer = new VideoDataOrganizer(videoKey);
            this._organizerMap.set(key, organizer);
        }

        return organizer;
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

        if (organizer.handleAction(action)) {
            this._emitChange(key);
        }
    }
}

const store = new VideoDataStore(AppDispatcher);
export default store;
