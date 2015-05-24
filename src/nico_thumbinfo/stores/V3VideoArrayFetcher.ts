/// <reference path="../../../typings/common.d.ts" />
"use strict";

import ErrorInfo, {ErrorCode} from "../models/ErrorInfo";
import VideoKey from "../models/VideoKey";
import RawVideoData from "../models/RawVideoData";

import NicoThumbinfoActionCreator from "../actions/NicoThumbinfoActionCreator";
import UrlFetchAction, {Source, SourceType} from "../actions/UrlFetchAction";
import V3VideoArrayFetchAction from "../actions/V3VideoArrayFetchAction";
import GetFlvFetchAction from "../actions/GetFlvFetchAction";
import NicopediaFetchAction, {NicopediaInfo, Type as NicopediaType} from "../actions/NicopediaFetchAction";

import * as querystring from "querystring";

export const enum State {
    Initial, Loading, Completed, Error
}

export default class V3VideoArrayFetcher {
    private _state: State = State.Initial;
    private _errorInfo: ErrorInfo = undefined;
    private _key: VideoKey;
    private _videoData: RawVideoData = null;
    private _source: Source;

    get state() { return this._state; }
    get errorInfo() { return this._errorInfo; }
    get videoData() { return this._videoData; }

    constructor(key: VideoKey) {
        this._key = key;
        this._source = new Source(SourceType.V3VideoArray, this._key);

        this._fetchV3VideoArray(this._key);
        this._state = State.Loading;
    }

    handleAction(action: UrlFetchAction): boolean {
        if (action instanceof V3VideoArrayFetchAction) {
            return this._handleV3VideoArrayFetchAction(action);
        }

        if (action instanceof NicopediaFetchAction) {
            return this._handleNicopediaFetchAction(action);
        }

        console.warn("Fetch response does not handled: ", action);
        return false;
    }

    private _fetchV3VideoArray(reqKey: VideoKey) {
        NicoThumbinfoActionCreator.createV3VideoArrayFetchAction(this._source, reqKey);
    }

    private _fetchNicopediaVideo() {
        if (this._videoData === null) {
            console.warn("this._videoData === null", this);
            return;
        }

        NicoThumbinfoActionCreator.createNicopediaFetchAction(
            this._source, NicopediaType.Video, this._videoData.videoId);
    }

    private _fetchNicopediaTag() {
        if (this._videoData === null) {
            console.warn("this._videoData === null", this);
            return;
        }

        for (let tag of this._videoData.tags) {
            NicoThumbinfoActionCreator.createNicopediaFetchAction(
                this._source, NicopediaType.Article, tag.name);
        };
    }

    private _handleV3VideoArrayFetchAction(action: V3VideoArrayFetchAction): boolean {
        let payload = action.payload;

        if (payload instanceof RawVideoData) {
            this._videoData = payload;
            this._state = State.Completed;
            this._fetchNicopediaVideo();
            this._fetchNicopediaTag();
            return true;
        }

        if (payload instanceof ErrorInfo) {
            this._errorInfo = payload;
            this._state = State.Error;

            return true;
        }

        console.warn("Unknown result: ", payload);
        this._state = State.Error;
        return true;
    }

    private _handleNicopediaFetchAction(action: NicopediaFetchAction): boolean {
        let payload = action.payload;

        if (payload instanceof NicopediaInfo) {
            if (this._videoData === null) {
                console.warn("this._videoData === null.", this);
                return false;
            }

            switch (payload.type) {
            case NicopediaType.Article:
                let found = false;
                for (let tag of this._videoData.tags) {
                    if (tag.name === payload.name) {
                        tag.nicopediaRegistered = payload.registered;
                        found = true;
                    }
                }
                if (!found) {
                    console.warn("Not found tag: ", payload.name, action);
                }

                return found;

            case NicopediaType.Video:
                this._videoData.nicopediaRegistered = payload.registered;
                return false;

            default:
                console.warn("Invalid nicopedia type:", payload.type, action);
                return false;
            }
        }

        if (payload instanceof ErrorInfo) {
            // Ignore errors
            return false;
        }

        console.warn("Invalid nicopedia data:", action);
        return false;
    }
}
