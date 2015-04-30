/// <reference path="../../../typings/common.d.ts" />
"use strict";

interface Uploader {
    id: string;
    name: string;
    iconUrl: string;
    url: string;
}

export default Uploader;

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
