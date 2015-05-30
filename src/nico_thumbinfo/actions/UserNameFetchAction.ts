/// <reference path="../../../typings/bundle.d.ts" />
"use strict";

import UrlFetchAction, {Source} from "./UrlFetchAction";

import ErrorInfo, {ErrorCode} from "../models/ErrorInfo";

export default class UserNameFetchAction extends UrlFetchAction {
    private _payload: string|ErrorInfo;

    constructor(source: Source, payload: string|ErrorInfo) {
        super(source);
        this._payload = payload;
    }

    get payload() { return this._payload; }
}
