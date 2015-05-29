/// <reference path="../../../typings/bundle.d.ts" />
"use strict";

import VideoData from "./VideoData";
import GetThumbinfoFetcher from "./GetThumbinfoFetcher";
import V3VideoArrayFetcher from "./V3VideoArrayFetcher";

import NicoThumbinfoAction from "../actions/NicoThumbinfoAction";

import ErrorInfo from "../models/ErrorInfo";
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
        let updated = false;

        if (this._getThumbinfoFetcher.handleAction(action)) {
            updated = true;
        }
        if (this._v3VideoArrayFetcher.handleAction(action)) {
            updated = true;
        }

        if (updated) {
            this._updateVideoData();
        }

        return updated;
    }

    get key() { return this._key; }
    get videoData() { return this._videoData; }

    getErrors() {
        let errors: ErrorInfo[] = [];
        this._getThumbinfoFetcher.errorInfo.map(e => errors.push(e));
        this._v3VideoArrayFetcher.errorInfo.map(e => errors.push(e));
        return errors;
    }

    private _updateVideoData() {
        this._videoData.clear();

        this._getThumbinfoFetcher.videoData.map(videoData => {
            this._videoData.pushRawVideoData(videoData);
        });
        this._v3VideoArrayFetcher.videoData.map(videoData => {
            this._videoData.pushRawVideoData(videoData);
        });

        this._videoData.videoId.map(videoId => {
            this._getThumbinfoFetcher.setVideoId(videoId);
        });
    }
}
