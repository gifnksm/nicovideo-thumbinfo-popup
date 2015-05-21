/// <reference path="../../../typings/common.d.ts" />
"use strict";

import UrlFetchAction, {Source} from "./UrlFetchAction";

import VideoKey from "../models/VideoKey";
import ErrorInfo, {ErrorCode} from "../models/ErrorInfo";

import {Request} from "../../util/UrlFetcher";

export default class GetFlvFetchAction extends UrlFetchAction {
    private _payload: VideoKey|ErrorInfo;

    constructor(source: Source, request: Request, payload: VideoKey|ErrorInfo) {
        super(source, request);
        this._payload = payload;
    }

    get payload() { return this._payload; }
}
