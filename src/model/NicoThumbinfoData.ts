/// <reference path="../../typings/common.d.ts" />

import {Option, Some, None} from "option-t";
import Key from "NicoThumbinfoKey";

class Thread {
    id: string;
    numRes: string;
}

class Tag {
    isCategory: boolean;
    isLocked: boolean;
}

interface Uploader {
    id: string;
    name: string;
    iconUrl: string;
    url: string;
}

class User implements Uploader {
    id: string;
    name: string;
    iconUrl: string;
    get url(): string {
        return "http://www.nicovideo.jp/user/" + this.id
    }
}

class Channel implements Uploader {
    id: string;
    name: string;
    iconUrl: string;
    get url(): string {
        return "http://ch.nicovideo.jp/channel/ch" + this.id;
    }
}

enum Source {
    WatchPage = 0,
    V3VideoArray = 1,
    GetThumbinfo = 2
}

export class RawThumbData {
    key: Key;
    source: Source;

    thumbType: string;
    videoId: string;
    threadId: string;

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

    merge(rawData: RawThumbData) {
        // key と source はマージしない
        if (this.thumbType === undefined) { this.thumbType = rawData.thumbType; }
        if (this.videoId === undefined) { this.videoId = rawData.videoId; }
        if (this.threadId === undefined) { this.threadId = rawData.threadId; }

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

class ThumbData {
    private _key: Key;
    private _primaryData: Option<RawThumbData>;

    private _rawData: RawThumbData[] = [];

    constructor(key: Key) {
        this._key = key;
    }

    private _updatePrimaryData() {
        if (this._primaryData.isSome) {
            return;
        }

        let data = new RawThumbData();
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

    pushRawData(raw: RawThumbData) {
        this._rawData.push(raw);
        this._rawData.sort((a, b) => a.source - b.source);
        this._primaryData = new None<RawThumbData>();
    }

    get key(): Key { return this._key; }
    get thumbType() { return this._getPrimaryData().thumbType; }
    get videoId() { return this._getPrimaryData().videoId; }
    get description() { return this._getPrimaryData().description; }
    get thumbnailUrl() { return this._getPrimaryData().thumbnailUrl; }
    get postedAt() { return this._getPrimaryData().postedAt; }
    get length() { return this._getPrimaryData().length; }
    get viewCounter() { return this._getPrimaryData().viewCounter; }
    get commentCounter() { return this._getPrimaryData().commentCounter; }
    get mylistCounter() { return this._getPrimaryData().mylistCounter; }

    get watchUrl(): string {
        return `http://www.nicovideo.jp/watch/${this._key.id}`;
    }
}

export default ThumbData;
