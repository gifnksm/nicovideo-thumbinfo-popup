/// <reference path="../../../typings/common.d.ts" />
"use strict";

import {DataSource} from "./constants";
import VideoKey from "./VideoKey";
import VideoData from "./VideoData";
import RawVideoData from "./RawVideoData";
import GetThumbinfoFetcher from "./GetThumbinfoFetcher";

import NicoThumbinfoAction from "../actions/NicoThumbinfoAction";
import UrlFetchAction from "../actions/UrlFetchAction";

export default class VideoDataOrganizer {
    private _key: VideoKey;
    private _videoData: VideoData;
    private _getThumbinfoFetcher: GetThumbinfoFetcher;

    constructor(key: VideoKey) {
        this._key = key;
        this._videoData = new VideoData(key);
        this._getThumbinfoFetcher = new GetThumbinfoFetcher(key);
    }

    handleAction(action: NicoThumbinfoAction): boolean {
        if (action instanceof UrlFetchAction) {
            switch (action.source) {
            case DataSource.GetThumbinfo:
                if (this._getThumbinfoFetcher.handleAction(action)) {
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
    }
}

