/// <reference path="../../../typings/bundle.d.ts" />
"use strict";

import NicopediaFetcher from "./NicopediaFetcher";

import ErrorInfo, {ErrorCode} from "../models/ErrorInfo";
import VideoKey from "../models/VideoKey";
import RawVideoData from "../models/RawVideoData";

import NicoThumbinfoActionCreator from "../actions/NicoThumbinfoActionCreator";
import NicoThumbinfoAction from "../actions/NicoThumbinfoAction";
import UrlFetchAction, {Source, SourceType} from "../actions/UrlFetchAction";
import V3VideoArrayFetchAction from "../actions/V3VideoArrayFetchAction";
import NicopediaFetchAction from "../actions/NicopediaFetchAction";

import {Option, Some, None} from "option-t";

export default class V3VideoArrayFetcher {
    private _key: VideoKey;
    private _source: Source;

    private _errorInfo: Option<ErrorInfo> = new None<ErrorInfo>();
    private _videoData: Option<RawVideoData> = new None<RawVideoData>();

    get errorInfo() { return this._errorInfo; }
    get videoData() { return this._videoData; }
    get isCompleted() { return this._videoData.isSome }
    get isErrored() { return this._errorInfo.isSome }
    get isStopped() { return this.isCompleted || this.isErrored }

    constructor(key: VideoKey) {
        this._key = key;
        this._source = new Source(SourceType.V3VideoArray, this._key);

        this._fetchV3VideoArray(this._key);
    }

    handleAction(action: NicoThumbinfoAction): boolean {
        if (!(action instanceof UrlFetchAction) ||
            action.source.sourceType !== this._source.sourceType) {
            return false;
        }

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
            this._fetchNicopedia();
            return true;
        }

        if (payload instanceof ErrorInfo) {
            this._errorInfo = new Some(payload);
            return true;
        }

        console.warn("Unknown result: ", payload);
        this._errorInfo = new Some(new ErrorInfo(ErrorCode.Unknown));
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
