/// <reference path="../../../typings/bundle.d.ts" />
"use strict";

import UrlFetchAction, {Source} from "./UrlFetchAction";

import ErrorInfo, {ErrorCode} from "../models/ErrorInfo";
import RawVideoData from "../models/RawVideoData";

import {Request} from "../../util/UrlFetcher";

export default class GetThumbinfoFetchAction extends UrlFetchAction {
    private _payload: RawVideoData|ErrorInfo;

    constructor(source: Source, request: Request, payload: RawVideoData|ErrorInfo) {
        super(source, request);
        this._payload = payload;
    }

    get payload() { return this._payload; }
}
