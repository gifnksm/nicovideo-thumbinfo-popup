/// <reference path="../../../typings/common.d.ts" />
"use strict";

import {DataSource, ThumbType} from "./constants";
import VideoKey from "./VideoKey";
import TagData from "./TagData";
import TagListData from "./TagListData";
import Uploader from "./Uploader";

export type DescriptionElement = string | { name: string, attr: any, children: DescriptionElement[] };

export default class RawVideoData {
    _key: VideoKey;
    _dataSource: DataSource;

    thumbType: ThumbType = undefined;
    videoId: string = undefined;

    title: string = undefined;
    description: DescriptionElement[] = undefined;
    thumbnailUrl: string = undefined;
    postedAt: Date = undefined;
    lengthInSeconds: number = undefined;

    viewCounter: number = undefined;
    commentCounter: number = undefined;
    mylistCounter: number = undefined;
    lastResBody: string = undefined;

    private _tags: TagListData = new TagListData();

    uploader: Uploader = undefined;

    constructor(key: VideoKey, source: DataSource) {
        this._key = key;
        this._dataSource = source;
    }

    static createWatchPage(key: VideoKey): RawVideoData {
        return new RawVideoData(key, DataSource.WatchPage);
    }

    static createV3VideoArray(key: VideoKey): RawVideoData {
        return new RawVideoData(key, DataSource.V3VideoArray);
    }

    static createGetThumbinfo(key: VideoKey): RawVideoData {
        return new RawVideoData(key, DataSource.GetThumbinfo);
    }

    get key() { return this._key; }
    get dataSource() { return this._dataSource; }
    get tags() { return this._tags.tags; }

    merge(rawData: RawVideoData) {
        // key と source はマージしない
        if (this.thumbType === undefined) { this.thumbType = rawData.thumbType; }
        if (this.videoId === undefined) { this.videoId = rawData.videoId; }

        if (this.title === undefined) { this.title = rawData.title; }
        if (this.description === undefined) { this.description = rawData.description; }
        if (this.thumbnailUrl === undefined) { this.thumbnailUrl = rawData.thumbnailUrl; }
        if (this.postedAt === undefined) { this.postedAt = rawData.postedAt; }
        if (this.lengthInSeconds === undefined) { this.lengthInSeconds = rawData.lengthInSeconds; }

        if (this.viewCounter === undefined) { this.viewCounter = rawData.viewCounter; }
        if (this.commentCounter === undefined) { this.commentCounter = rawData.commentCounter; }
        if (this.mylistCounter === undefined) { this.mylistCounter = rawData.mylistCounter; }
        if (this.lastResBody === undefined) { this.lastResBody = rawData.lastResBody; }

        this._tags.merge(rawData._tags);

        if (this.uploader === undefined) { this.uploader = rawData.uploader; }
    }
}
