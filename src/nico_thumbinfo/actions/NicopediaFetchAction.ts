/// <reference path="../../../typings/common.d.ts" />
"use strict";

import VideoKey from "../stores/VideoKey";
import {DataSource} from "../stores/constants";
import {ErrorCode, ErrorInfo} from "../stores/GetThumbinfoFetcher";
import RawVideoData from "../stores/RawVideoData";
import UrlFetchAction from "./UrlFetchAction";
import UrlFetcher, {Request, Response} from "../../util/UrlFetcher";

export const enum Type {
    Article, Video
}

export class NicopediaInfo {
    _type: Type;
    _name: string;
    _registered: boolean;

    constructor(type: Type, name: string, registered: boolean) {
        this._type = type;
        this._name = name;
        this._registered = registered;
    }

    get type() { return this._type; }
    get name() { return this._name; }
    get registered() { return this._registered; }
}

export default class NicopediaFetchAction extends UrlFetchAction {
    private _payload: NicopediaInfo|ErrorInfo;

    constructor(key: VideoKey, request: Request, source: DataSource,
                payload: NicopediaInfo|ErrorInfo) {
        super(key, request, source);
        this._payload = payload;
    }

    get payload() { return this._payload; }
}
