/// <reference path="../../../typings/common.d.ts" />
"use strict";

import {DataSource, FetchTarget} from "./constants";
import VideoKey from "./VideoKey";
import RawVideoData from "./RawVideoData";
import GetThumbinfoResponseHandler from "./GetThumbinfoResponseHandler";

import NicoThumbinfoActionCreator from "../actions/NicoThumbinfoActionCreator";
import UrlFetchAction from "../actions/UrlFetchAction";
import UrlFetchResponseAction from "../actions/UrlFetchResponseAction";
import UrlFetchErrorAction from "../actions/UrlFetchErrorAction";
import {Request, Response} from "../../util/UrlFetcher";

import * as querystring from "querystring";

export const enum State {
    Initial, Loading, Completed, Error
}

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
    NotFound
}

export class ErrorInfo {
    private _errorCode: ErrorCode;
    private _errorDetail: string;

    constructor(errorCode: ErrorCode, errorDetail?: string) {
        this._errorCode = errorCode;
        this._errorDetail = errorDetail;
    }

    get errorCode() { return this._errorCode; }
    get errorDetail() { return this._errorDetail; }
}

export default class GetThumbinfoFetcher {
    private _state: State = State.Initial;
    private _loadingUrl: string;
    private _errorInfo: ErrorInfo = undefined;
    private _key: VideoKey;
    private _optionalKey: VideoKey = undefined;
    private _videoData: RawVideoData = null;

    get state() { return this._state; }
    get errorInfo() { return this._errorInfo; }
    get videoData() { return this._videoData; }

    constructor(key: VideoKey) {
        this._key = key;

        this._fetchGetThumbinfo(this._key);
        this._state = State.Loading;
    }

    handleAction(action: UrlFetchAction): boolean {
        if (action instanceof UrlFetchErrorAction) {
            switch (action.target) {
            case FetchTarget.GetThumbinfo:
            case FetchTarget.GetFlv:
                return this._handleErrorResponse(action);
            default:
                console.warn("Unknown target: ", action);
                return false;
            }
        }

        if (action instanceof UrlFetchResponseAction) {
            switch (action.target) {
            case FetchTarget.GetThumbinfo:
                return this._handleGetThumbinfoResponse(action);
            case FetchTarget.GetFlv:
                return this._handleGetFlvResponse(action);
            default:
                console.warn("Unknown target: ", action);
                return false;
            }
        }

        console.warn("Fetch response does not handled: ", action);
        return false;
    }

    private _fetchGetThumbinfo(reqKey: VideoKey) {
        NicoThumbinfoActionCreator.createGetThumbinfoFetchAction(
            this._key, reqKey, DataSource.GetThumbinfo);
    }

    private _fetchGetFlv(reqKey: VideoKey) {
        NicoThumbinfoActionCreator.createGetFlvFetchAction(
            this._key, reqKey, DataSource.GetThumbinfo);
    }

    private _handleErrorResponse(action: UrlFetchErrorAction): boolean {
        this._errorInfo = new ErrorInfo(ErrorCode.UrlFetch, action.error);
        this._state = State.Error;
        return true;
    }

    private _handleGetThumbinfoResponse(action: UrlFetchResponseAction): boolean {
        let data = GetThumbinfoResponseHandler.handle(action);

        if (data instanceof RawVideoData) {
            this._videoData = data;
            this._state = State.Completed;
            return true;
        }

        if (data instanceof ErrorInfo) {
            this._errorInfo = data;

            if (data.errorCode === ErrorCode.CommunitySubThread ||
                data.errorCode === ErrorCode.Deleted) {
                // コミュニティ動画の場合、getflv の optional_thread_id により、
                // 元動画の情報を取得できる可能性がある
                // 削除済み動画の場合、getflv の deleted/error により、
                // 詳細な削除理由が取得できる可能性がある
                this._fetchGetFlv(this._key);
                this._state = State.Loading;
            } else {
                this._state = State.Error;
            }

            return true;
        }

        console.warn("Unknown result: ", data);
        return false;
    }

    private _handleGetFlvResponse(action: UrlFetchResponseAction): boolean {
        // TODO: Check HTTP status
        let data = querystring.parse(action.response.responseText);

        if (data.hasOwnProperty("error")) {
            switch (data.error) {
            case "invalid_v1":
                this._errorInfo = new ErrorInfo(ErrorCode.Deleted);
                break;
            case "invalid_v2":
                this._errorInfo = new ErrorInfo(ErrorCode.DeletedAsPrivate);
                break;
            case "invalid_v3":
                this._errorInfo = new ErrorInfo(ErrorCode.DeletedByContentHolder);
                break;
            case "invalid_thread":
                this._errorInfo = new ErrorInfo(ErrorCode.NotFound);
                break;
            case "cant_get_detail":
                this._errorInfo = new ErrorInfo(ErrorCode.Deleted);
                break;
            case "access_locked":
                this._errorInfo = new ErrorInfo(ErrorCode.AccessLocked);
                break;
            default:
                console.warn("Unknown getflv error:", data.error, action);
                // エラーコードは初回の getthumbinfo 時に設定されたもののままにする
                break;
            }

            this._state = State.Error;
            return true;
        }

        if (data.hasOwnProperty("deleted")) {
            switch (data.deleted) {
            case 1:
                this._errorInfo = new ErrorInfo(ErrorCode.DeletedByUploader);
                break;
            case 2:
                this._errorInfo = new ErrorInfo(ErrorCode.DeletedByAdmin);
                break;
            case 3:
                this._errorInfo = new ErrorInfo(ErrorCode.DeletedByContentHolder);
                break;
            case 8:
                this._errorInfo = new ErrorInfo(ErrorCode.DeletedAsPrivate);
                break;
            default:
                console.warn("Unknown getflv deleted:", data.error, action);
                // エラーコードは初回の getthumbinfo 時に設定されたもののままにする
                break;
            }

            this._state = State.Error;
            return true;
        }

        if (data.hasOwnProperty("optional_thread_id")) {
            let key = VideoKey.fromOptionalThreadId(data.optional_thread_id);
            this._fetchGetThumbinfo(key);
            this._state = State.Loading;
            return true;
        }

        if (data.hasOwnProperty("closed")) {
            console.warn("Not logged in");
        }

        console.warn("Invalid getflv data:", data, action);
        // エラーコードは初回の getthumbinfo 時に設定されたもののままにする
        this._state = State.Error;

        return false;
    }
}
