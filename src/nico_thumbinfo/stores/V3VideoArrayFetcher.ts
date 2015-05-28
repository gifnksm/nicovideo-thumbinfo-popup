/// <reference path="../../../typings/bundle.d.ts" />
"use strict";

import NicopediaFetcher from "./NicopediaFetcher";

import ErrorInfo, {ErrorCode} from "../models/ErrorInfo";
import VideoKey from "../models/VideoKey";
import RawVideoData from "../models/RawVideoData";

import NicoThumbinfoActionCreator from "../actions/NicoThumbinfoActionCreator";
import UrlFetchAction, {Source, SourceType} from "../actions/UrlFetchAction";
import V3VideoArrayFetchAction from "../actions/V3VideoArrayFetchAction";
import NicopediaFetchAction from "../actions/NicopediaFetchAction";

import {Option, Some, None} from "option-t";

export const enum State {
    Initial, Loading, Completed, Error
}

export default class V3VideoArrayFetcher {
    private _key: VideoKey;
    private _source: Source;

    private _state: State = State.Initial;
    private _errorInfo: Option<ErrorInfo> = new None<ErrorInfo>();
    private _videoData: Option<RawVideoData> = new None<RawVideoData>();

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

    private _fetchNicopedia() {
        if (this._videoData.isNone) {
            console.warn("this._videoData.isNone", this);
            return;
        }

        NicopediaFetcher.fetch(this._videoData.unwrap(), this._source);
    }

    private _handleV3VideoArrayFetchAction(action: V3VideoArrayFetchAction): boolean {
        let payload = action.payload;

        if (payload instanceof RawVideoData) {
            this._videoData = new Some(payload);
            this._state = State.Completed;
            this._fetchNicopedia();
            return true;
        }

        if (payload instanceof ErrorInfo) {
            this._errorInfo = new Some(payload);
            this._state = State.Error;

            return true;
        }

        console.warn("Unknown result: ", payload);
        this._state = State.Error;
        return true;
    }

    private _handleNicopediaFetchAction(action: NicopediaFetchAction): boolean {
        if (this._videoData.isNone) {
            console.warn("this._videoData.isNone", this);
            return false;
        }
        return NicopediaFetcher.handleAction(action, this._videoData.unwrap());
    }
}
