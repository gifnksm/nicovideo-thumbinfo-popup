/// <reference path="../../../typings/common.d.ts" />
"use strict";

import VideoKey from "../stores/VideoKey";
import {DataSource} from "../stores/constants";
import {ErrorCode, ErrorInfo} from "../stores/GetThumbinfoFetcher";
import RawVideoData from "../stores/RawVideoData";
import UrlFetchAction from "./UrlFetchAction";
import UrlFetcher, {Request, Response} from "../../util/UrlFetcher";

export default class GetThumbinfoFetchAction extends UrlFetchAction {
    private _payload: RawVideoData|ErrorInfo;

    constructor(key: VideoKey, request: Request, source: DataSource,
                payload: RawVideoData|ErrorInfo) {
        super(key, request, source);
        this._payload = payload;
    }

    get payload() { return this._payload; }
}
