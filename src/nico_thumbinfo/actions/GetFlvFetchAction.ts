/// <reference path="../../../typings/bundle.d.ts" />
"use strict";

import UrlFetchAction, {Source} from "./UrlFetchAction";

import VideoKey from "../models/VideoKey";
import ErrorInfo, {ErrorCode} from "../models/ErrorInfo";

export default class GetFlvFetchAction extends UrlFetchAction {
    private _payload: VideoKey|ErrorInfo;

    constructor(source: Source, payload: VideoKey|ErrorInfo) {
        super(source);
        this._payload = payload;
    }

    get payload() { return this._payload; }
}
