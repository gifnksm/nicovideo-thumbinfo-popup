/// <reference path="../../../typings/bundle.d.ts" />
"use strict";

import {DataSource} from "../models/constants";
import VideoKey from "../models/VideoKey";
import RawVideoData from "../models/RawVideoData";

export default class VideoData {
    private _key: VideoKey;
    private _mergedData: RawVideoData = null;

    private _rawData: RawVideoData[] = [];

    constructor(key: VideoKey) {
        this._key = key;
    }

    private _mergeData() {
        if (this._mergedData !== null) {
            return;
        }

        let data = new RawVideoData(this._key, DataSource.Merge);
        for (let rawData of this._rawData) {
            data.merge(rawData);
        }
        this._mergedData = data;
    }

    private _getMergedData() {
        if (this._mergedData === null) {
            this._mergeData();
        }
        return this._mergedData;
    }

    pushRawVideoData(raw: RawVideoData) {
        this._rawData.push(raw);
        this._rawData.sort((a, b) => a.dataSource - b.dataSource);
        this.invalidate();
    }

    clear() {
        this._rawData = [];
        this.invalidate();
    }

    invalidate() {
        this._mergedData = null;
    }

    get key() { return this._key; }
    get thumbType() { return this._getMergedData().thumbType; }
    get videoId() { return this._getMergedData().videoId; }
    get title() { return this._getMergedData().title; }
    get description() { return this._getMergedData().description; }
    get thumbnailUrl() { return this._getMergedData().thumbnailUrl; }
    get postedAt() { return this._getMergedData().postedAt; }
    get lengthInSeconds() { return this._getMergedData().lengthInSeconds; }
    get viewCounter() { return this._getMergedData().viewCounter; }
    get commentCounter() { return this._getMergedData().commentCounter; }
    get mylistCounter() { return this._getMergedData().mylistCounter; }
    get lastResBody() { return this._getMergedData().lastResBody; }
    get nicopediaRegistered() { return this._getMergedData().nicopediaRegistered; }
    get tags() { return this._getMergedData().tags; }
    get uploader() { return this._getMergedData().uploader; }

    get watchUrl(): string {
        return `http://www.nicovideo.jp/watch/${this._key.id}`;
    }
    get isEmpty(): boolean {
        return this._rawData.length == 0;
    }
}
