/// <reference path="../../../typings/bundle.d.ts" />
"use strict";

import UrlFetchAction, {Source} from "./UrlFetchAction";

import ErrorInfo, {ErrorCode} from "../models/ErrorInfo";
import RawVideoData from "../models/RawVideoData";

export default class GetThumbinfoFetchAction extends UrlFetchAction {
    private _payload: RawVideoData|ErrorInfo;

    constructor(source: Source, payload: RawVideoData|ErrorInfo) {
        super(source);
        this._payload = payload;
    }

    get payload() { return this._payload; }
}
