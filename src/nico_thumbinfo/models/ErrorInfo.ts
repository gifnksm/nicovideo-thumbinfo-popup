/// <reference path="../../../typings/bundle.d.ts" />
"use strict";

export const enum ErrorCode {
    UrlFetch,
    HttpStatus,
    ServerMaintenance,
    Invalid,
    Deleted,
    DeletedByUploader,
    DeletedByAdmin,
    DeletedByContentHolder,
    DeletedAsPrivate,
    AccessLocked,
    Community,
    CommunitySubThread,
    NotFound,
    NotLoggedIn,
    Unknown
}

export default class ErrorInfo {
    private _code: ErrorCode;
    private _detail: string;

    constructor(code: ErrorCode, detail?: string) {
        this._code = code;
        this._detail = detail;
    }

    get code() { return this._code; }
    get detail() { return this._detail; }
}
