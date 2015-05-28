/// <reference path="../../../typings/bundle.d.ts" />
"use strict";

import UrlFetchAction, {Source} from "./UrlFetchAction";

import ErrorInfo, {ErrorCode} from "../models/ErrorInfo";

import {Request} from "../../util/UrlFetcher";

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

    constructor(source: Source, request: Request, payload: NicopediaInfo|ErrorInfo) {
        super(source, request);
        this._payload = payload;
    }

    get payload() { return this._payload; }
}
