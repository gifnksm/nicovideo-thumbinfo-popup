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

export default class GetThumbinfoFetcher {
    private _state: State = State.Initial;
    private _loadingUrl: string;
    private _errorCode: ErrorCode = undefined;
    private _errorDetail: string = undefined;
    private _key: VideoKey;
    private _optionalKey: VideoKey = undefined;
    private _videoData: RawVideoData = null;

    get state() { return this._state; }
    get errorCode() { return this._errorCode; }
    get errorDetail() { return this._errorDetail; }
    get videoData() { return this._videoData; }

    constructor(key: VideoKey) {
        this._key = key;

        this._fetchGetThumbinfo(this._key);
        this._state = State.Loading;
    }

    handleAction(action: UrlFetchAction, callback: () => void): boolean {
        if (action instanceof UrlFetchErrorAction) {
            switch (action.target) {
            case FetchTarget.GetThumbinfo:
            case FetchTarget.GetFlv:
                return this._handleErrorResponse(action, callback);
            default:
                console.warn("Unknown target: ", action);
                return false;
            }
        }

        if (action instanceof UrlFetchResponseAction) {
            switch (action.target) {
            case FetchTarget.GetThumbinfo:
                return this._handleGetThumbinfoResponse(action, callback);
            case FetchTarget.GetFlv:
                return this._handleGetFlvResponse(action, callback);
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

    private _handleErrorResponse(
        action: UrlFetchErrorAction,
        callback: () => void
    ): boolean {
        this._errorCode = ErrorCode.UrlFetch;
        this._errorDetail = action.error;
        this._state = State.Error;
        return true;
    }

    private _handleGetThumbinfoResponse(
        action: UrlFetchResponseAction,
        callback: () => void
    ): boolean {
        GetThumbinfoResponseHandler
            .handle(action)
            .then(
                videoData => {
                    this._videoData = videoData;
                    this._state = State.Completed;
                },
                data => {
                    this._errorCode = data.errorCode;
                    this._errorDetail = data.errorDetail;

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
                }
            ).then(callback);
        return false;
    }

    private _handleGetFlvResponse(
        action: UrlFetchResponseAction,
        callback: () => void
    ): boolean {
        let data = querystring.parse(action.response.responseText);

        if (data.hasOwnProperty("error")) {
            switch (data.error) {
            case "invalid_v1":
                this._errorCode = ErrorCode.Deleted;
                this._errorDetail = undefined;
                break;
            case "invalid_v2":
                this._errorCode = ErrorCode.DeletedAsPrivate;
                this._errorDetail = undefined;
                break;
            case "invalid_v3":
                this._errorCode = ErrorCode.DeletedByContentHolder;
                this._errorDetail = undefined;
                break;
            case "invalid_thread":
                this._errorCode = ErrorCode.NotFound;
                this._errorDetail = undefined;
                break;
            case "cant_get_detail":
                this._errorCode = ErrorCode.Deleted;
                this._errorDetail = undefined;
                break;
            case "access_locked":
                this._errorCode = ErrorCode.AccessLocked;
                this._errorDetail = undefined;
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
                this._errorCode = ErrorCode.DeletedByUploader;
                this._errorDetail = undefined;
                break;
            case 2:
                this._errorCode = ErrorCode.DeletedByAdmin;
                this._errorDetail = undefined;
                break;
            case 3:
                this._errorCode = ErrorCode.DeletedByContentHolder;
                this._errorDetail = undefined;
                break;
            case 8:
                this._errorCode = ErrorCode.DeletedAsPrivate;
                this._errorDetail = undefined;
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
