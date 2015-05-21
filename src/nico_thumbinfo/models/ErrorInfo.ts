/// <reference path="../../../typings/common.d.ts" />
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
    Unknown
}

export default class ErrorInfo {
    private _errorCode: ErrorCode;
    private _errorDetail: string;

    constructor(errorCode: ErrorCode, errorDetail?: string) {
        this._errorCode = errorCode;
        this._errorDetail = errorDetail;
    }

    get errorCode() { return this._errorCode; }
    get errorDetail() { return this._errorDetail; }
}
