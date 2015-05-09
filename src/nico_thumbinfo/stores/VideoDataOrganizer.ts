/// <reference path="../../../typings/common.d.ts" />
"use strict";

import VideoKey from "./VideoKey";
import VideoData from "./VideoData";
import NicoThumbinfoAction from "../actions/NicoThumbinfoAction";

export default class VideoDataOrganizer {
    private _key: VideoKey;
    private _videoData: VideoData;

    constructor(key: VideoKey) {
        this._key = key;
        this._videoData = new VideoData(key);
        // TODO: Create Action here (getthumbinfo)
    }

    handleAction(action: NicoThumbinfoAction): boolean {
        // TODO: implements
        return false;
    }

    get key() { return this._key; }
    get videoData() { return this._videoData; }
}

