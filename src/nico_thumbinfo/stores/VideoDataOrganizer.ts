/// <reference path="../../../typings/common.d.ts" />
"use strict";


import VideoData from "./VideoData";
import GetThumbinfoFetcher from "./GetThumbinfoFetcher";
import V3VideoArrayFetcher from "./V3VideoArrayFetcher";

import NicoThumbinfoAction from "../actions/NicoThumbinfoAction";
import UrlFetchAction, {SourceType} from "../actions/UrlFetchAction";

import VideoKey from "../models/VideoKey";

export default class VideoDataOrganizer {
    private _key: VideoKey;
    private _videoData: VideoData;
    private _getThumbinfoFetcher: GetThumbinfoFetcher;
    private _v3VideoArrayFetcher: V3VideoArrayFetcher;

    constructor(key: VideoKey) {
        this._key = key;
        this._videoData = new VideoData(key);
        this._getThumbinfoFetcher = new GetThumbinfoFetcher(key);
        this._v3VideoArrayFetcher = new V3VideoArrayFetcher(key);
    }

    handleAction(action: NicoThumbinfoAction): boolean {
        if (action instanceof UrlFetchAction) {
            switch (action.source.sourceType) {
            case SourceType.GetThumbinfo:
                if (this._getThumbinfoFetcher.handleAction(action)) {
                    this._updateVideoData();
                    return true;
                }
                return false;

            case SourceType.V3VideoArray:
                if (this._v3VideoArrayFetcher.handleAction(action)) {
                    this._updateVideoData();
                    return true;
                }
                return false;
            }
        }

        return false;
    }

    get key() { return this._key; }
    get videoData() { return this._videoData; }

    // TODO: implements
    // get state() { return this._state.state; }
    // get errorCode() { return this._errorCode; }
    // get errorDetail() { return this._errorDetail; }

    private _updateVideoData() {
        this._videoData.clear();

        if (this._getThumbinfoFetcher.videoData !== null) {
            this._videoData.pushRawVideoData(this._getThumbinfoFetcher.videoData);
        }
        if (this._v3VideoArrayFetcher.videoData !== null) {
            this._videoData.pushRawVideoData(this._v3VideoArrayFetcher.videoData);
        }
    }
}

