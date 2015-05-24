/// <reference path="../../../typings/common.d.ts" />
"use strict";

import NicoThumbinfoAction from "./NicoThumbinfoAction";

import VideoKey from "../models/VideoKey";

import UrlFetcher, {Request} from "../../util/UrlFetcher";

export const enum SourceType {
    GetThumbinfo, V3VideoArray
}

export class Source {
    private _sourceType: SourceType;
    private _key: VideoKey;

    constructor(sourceType: SourceType, key: VideoKey) {
        this._sourceType = sourceType;
        this._key = key;
    }

    get sourceType() { return this._sourceType; }
    get key() { return this._key; }
}

export default class UrlFetchAction extends NicoThumbinfoAction {
    private _request: Request;
    private _source: Source;

    constructor(source: Source, request: Request) {
        super(source.key);
        this._request = request;
        this._source = source;
    }

    get request() { return this._request; }
    get source() { return this._source; }
}
