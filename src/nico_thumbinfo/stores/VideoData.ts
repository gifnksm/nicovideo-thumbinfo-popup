/// <reference path="../../../typings/common.d.ts" />
"use strict";

import Key from "VideoKey";

enum Source {
    Merge,
    WatchPage,
    V3VideoArray,
    GetThumbinfo
}

export enum ThumbType {
    Unknown,
    Video,
    MyMemory,
    Community,
    CommunityOnly,
    Deleted
}

export class Tag {
    isCategory: boolean;
    isLocked: boolean;
    nicopediaRegistered: boolean;
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

export type DescriptionElement = string | { name: string, attr: any, children: DescriptionElement[] };

export class RawData {
    _key: Key;
    _source: Source;

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

    tags: Tag[] = undefined;
    uploader: Uploader = undefined;

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

        if (this.title === undefined) { this.title = rawData.title; }
        if (this.description === undefined) { this.description = rawData.description; }
        if (this.thumbnailUrl === undefined) { this.thumbnailUrl = rawData.thumbnailUrl; }
        if (this.postedAt === undefined) { this.postedAt = rawData.postedAt; }
        if (this.lengthInSeconds === undefined) { this.lengthInSeconds = rawData.lengthInSeconds; }

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
    private _mergedData: RawData = null;

    private _rawData: RawData[] = [];

    constructor(key: Key) {
        this._key = key;
    }

    private _mergeData() {
        if (this._mergedData !== null) {
            return;
        }

        let data = new RawData(this._key, Source.Merge);
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

    pushRawData(raw: RawData) {
        this._rawData.push(raw);
        this._rawData.sort((a, b) => a.source - b.source);
        this._mergedData = null;
    }

    get key(): Key { return this._key; }
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
    get tags() { return this._getMergedData().tags; }
    get uploader() { return this._getMergedData().uploader; }

    get watchUrl(): string {
        return `http://www.nicovideo.jp/watch/${this._key.id}`;
    }
    get isEmpty(): boolean {
        return this._rawData.length == 0;
    }
}
