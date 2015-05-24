/// <reference path="../../../typings/common.d.ts" />
"use strict";

interface Uploader {
    id: string;
    name: string;
    iconUrl: string;
    url: string;
    merge: (other: Uploader) => void;
}

export default Uploader;

export class User implements Uploader {
    id: string;
    name: string;
    iconUrl: string;
    get url(): string {
        return "http://www.nicovideo.jp/user/" + this.id
    }
    merge(other: Uploader) {
        if (!(other instanceof User)) {
            return;
        }

        if (this.id === undefined) { this.id = other.id; }
        if (this.name === undefined) { this.name = other.name; }
        if (this.iconUrl === undefined) { this.iconUrl = other.iconUrl; }
    }
}

export class Channel implements Uploader {
    id: string;
    name: string;
    iconUrl: string;
    get url(): string {
        return "http://ch.nicovideo.jp/channel/ch" + this.id;
    }
    merge(other: Uploader) {
        if (!(other instanceof Channel)) {
            return;
        }

        if (this.id === undefined) { this.id = other.id; }
        if (this.name === undefined) { this.name = other.name; }
        if (this.iconUrl === undefined) { this.iconUrl = other.iconUrl; }
    }
}
