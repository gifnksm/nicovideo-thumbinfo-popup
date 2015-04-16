/// <reference path="../../../typings/common.d.ts" />

import {Option, Some, None} from "option-t";
import Key from "VideoKey";

enum Source {
    Merge = 0,
    WatchPage = 1,
    V3VideoArray = 2,
    GetThumbinfo = 3
}

export class Tag {
    isCategory: boolean;
    isLocked: boolean;
    name: string;
}

interface Uploader {
    id: string;
    name: string;
    iconUrl: string;
    url: string;
}

export class User implements Uploader {
    id: string;
    name: string;
    iconUrl: string;
    get url(): string {
        return "http://www.nicovideo.jp/user/" + this.id
    }
}

export class Channel implements Uploader {
    id: string;
    name: string;
    iconUrl: string;
    get url(): string {
        return "http://ch.nicovideo.jp/channel/ch" + this.id;
    }
}

export class RawData {
    _key: Key;
    _source: Source;

    thumbType: string;
    videoId: string;
    threadId: string;

    title: string;
    description: string;
    thumbnailUrl: string;
    postedAt: string;
    length: string;

    viewCounter: string;
    commentCounter: string;
    mylistCounter: string;
    lastResBody: string;

    tags: {[index: string]: Tag};
    uploader: Uploader;

    constructor(key: Key, source: Source) {
        this._key = key;
        this._source = source;
    }

    static createWatchPage(key: Key): RawData {
        return new RawData(key, Source.WatchPage);
    }

    static createV3VideoArray(key: Key): RawData {
        return new RawData(key, Source.V3VideoArray);
    }

    static createGetThumbinfo(key: Key): RawData {
        return new RawData(key, Source.GetThumbinfo);
    }

    get key(): Key { return this._key; }
    get source(): Source { return this._source; }

    merge(rawData: RawData) {
        // key と source はマージしない
        if (this.thumbType === undefined) { this.thumbType = rawData.thumbType; }
        if (this.videoId === undefined) { this.videoId = rawData.videoId; }
        if (this.threadId === undefined) { this.threadId = rawData.threadId; }

        if (this.title === undefined) { this.title = rawData.title; }
        if (this.description === undefined) { this.description = rawData.description; }
        if (this.thumbnailUrl === undefined) { this.thumbnailUrl = rawData.thumbnailUrl; }
        if (this.postedAt === undefined) { this.postedAt = rawData.postedAt; }
        if (this.length === undefined) { this.length = rawData.length; }

        if (this.viewCounter === undefined) { this.viewCounter = rawData.viewCounter; }
        if (this.commentCounter === undefined) { this.commentCounter = rawData.commentCounter; }
        if (this.mylistCounter === undefined) { this.mylistCounter = rawData.mylistCounter; }
        if (this.lastResBody === undefined) { this.lastResBody = rawData.lastResBody; }
        if (this.tags === undefined) { this.tags = rawData.tags; }
        if (this.uploader === undefined) { this.uploader = rawData.uploader; }
    }
}

export class Data {
    private _key: Key;
    private _primaryData: Option<RawData>;

    private _rawData: RawData[] = [];

    constructor(key: Key) {
        this._key = key;
    }

    private _updatePrimaryData() {
        if (this._primaryData.isSome) {
            return;
        }

        let data = new RawData(this._key, Source.Merge);
        for (let rawData of this._rawData) {
            data.merge(rawData);
        }
        this._primaryData = new Some(data);
    }

    private _getPrimaryData() {
        if (!this._primaryData.isSome) {
            this._updatePrimaryData();
        }
        return this._primaryData.unwrap();
    }

    pushRawData(raw: RawData) {
        this._rawData.push(raw);
        this._rawData.sort((a, b) => a.source - b.source);
        this._primaryData = new None<RawData>();
    }

    get key(): Key { return this._key; }
    get thumbType() { return this._getPrimaryData().thumbType; }
    get videoId() { return this._getPrimaryData().videoId; }
    get title() { return this._getPrimaryData().title; }
    get description() { return this._getPrimaryData().description; }
    get thumbnailUrl() { return this._getPrimaryData().thumbnailUrl; }
    get postedAt() { return this._getPrimaryData().postedAt; }
    get length() { return this._getPrimaryData().length; }
    get viewCounter() { return this._getPrimaryData().viewCounter; }
    get commentCounter() { return this._getPrimaryData().commentCounter; }
    get mylistCounter() { return this._getPrimaryData().mylistCounter; }
    get lastResBody() { return this._getPrimaryData().lastResBody; }
    get tags() { return this._getPrimaryData().tags; }
    get uploader() { return this._getPrimaryData().uploader; }

    get watchUrl(): string {
        return `http://www.nicovideo.jp/watch/${this._key.id}`;
    }
    get isEmpty(): boolean {
        return this._rawData.length == 0;
    }
}
