/// <reference path="../../typings/common.d.ts" />

import {Option, Some, None} from "option-t";
import Key from "NicoThumbinfoKey";

class Tag {
    category: boolean;
    lock: boolean;
}

class ThumbData {
    private _key: Key;

    thumbType: string;

    videoId: string;
    title: string;
    description: string;
    thumbnailUrl: string;
    firstRetrieve: string;
    length: string;

    viewCounter: string;
    commentCounter: string;
    mylistCounter: string;
    lastResBody: string;

    embeddable: boolean;
    livePlay: boolean;

    tags: {[index: string]: Tag};

    userId: string;
    userNickname: string;
    userIconUrl: string;

    chId: string;
    chName: string;
    chIconUrl: string;

    constructor(key: Key) {
        this._key = key;
    }

    get key(): Key {
        return this._key;
    }

    get watchUrl(): string {
        return `http://www.nicovideo.jp/watch/${this._key.id}`;
    }
}

export default ThumbData;
