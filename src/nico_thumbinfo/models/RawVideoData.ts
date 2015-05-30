/// <reference path="../../../typings/bundle.d.ts" />
"use strict";

import {DataSource, ThumbType} from "./constants";
import VideoKey from "./VideoKey";
import TagData from "./TagData";
import TagListData from "./TagListData";
import Uploader from "./Uploader";
import {DescriptionNode} from "./DescriptionNode";

import {Option, Some, None} from "option-t";

export default class RawVideoData {
    _key: VideoKey;
    _dataSource: DataSource;

    thumbType: Option<ThumbType> = new None<ThumbType>();
    videoId: Option<string> = new None<string>();

    title: Option<string> = new None<string>();
    description: Option<DescriptionNode[]> = new None<DescriptionNode[]>();
    thumbnailUrl: Option<string> = new None<string>();
    postedAt: Option<Date> = new None<Date>();
    lengthInSeconds: Option<number> = new None<number>();

    viewCounter: Option<number> = new None<number>();
    commentCounter: Option<number> = new None<number>();
    mylistCounter: Option<number> = new None<number>();
    lastResBody: Option<string> = new None<string>();

    nicopediaRegistered: Option<boolean> = new None<boolean>();

    private _tags: TagListData = new TagListData();

    uploader: Option<Uploader> = new None<Uploader>();

    constructor(key: VideoKey, source: DataSource) {
        this._key = key;
        this._dataSource = source;
    }

    static createV3VideoArray(key: VideoKey): RawVideoData {
        return new RawVideoData(key, DataSource.V3VideoArray);
    }
    static createGetThumbinfo(key: VideoKey): RawVideoData {
        return new RawVideoData(key, DataSource.GetThumbinfo);
    }
    static createInitialDummy(key: VideoKey): RawVideoData {
        return new RawVideoData(key, DataSource.InitialDummy);
    }

    get key() { return this._key; }
    get dataSource() { return this._dataSource; }
    get tags() { return this._tags.tags; }

    merge(other: RawVideoData) {
        // key と source はマージしない
        this.thumbType = this.thumbType.or(other.thumbType);
        this.videoId = this.videoId.or(other.videoId);

        this.title = this.title.or(other.title);
        this.description = this.description.or(other.description);
        this.thumbnailUrl = this.thumbnailUrl.or(other.thumbnailUrl);
        this.postedAt = this.postedAt.or(other.postedAt);
        this.lengthInSeconds = this.lengthInSeconds.or(other.lengthInSeconds);

        this.viewCounter = this.viewCounter.or(other.viewCounter);
        this.commentCounter = this.commentCounter.or(other.commentCounter);
        this.mylistCounter = this.mylistCounter.or(other.mylistCounter);
        this.lastResBody = this.lastResBody.or(other.lastResBody);

        this.nicopediaRegistered = this.nicopediaRegistered.or(other.nicopediaRegistered);

        this._tags.merge(other._tags);

        this.uploader = this.uploader.map(self => {
            return other.uploader.mapOr(self, other => {
                self.merge(other);
                return self;
            });
        }).or(other.uploader);
    }

    shallowClone(): RawVideoData {
        let data = new RawVideoData(this._key, this._dataSource);
        data.merge(this);
        return data;
    }
}
