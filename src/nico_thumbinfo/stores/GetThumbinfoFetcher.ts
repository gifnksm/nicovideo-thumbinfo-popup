/// <reference path="../../../typings/common.d.ts" />
"use strict";

import {DataSource} from "./constants";
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
    Community,
    CommunitySubThread,
    NotFound
}

const GetThumbinfoApiPrefix = "http://ext.nicovideo.jp/api/getthumbinfo/";
const GetFlvApiPrefix = "http://www.nicovideo.jp/api/getflv/";

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
        if (this._state !== State.Initial && this._loadingUrl !== action.request.url) {
            console.warn("status does not match", this._state, action);
            return false;
        }

        if (action instanceof UrlFetchErrorAction) {
            return this._handleErrorResponse(action, callback);
        }

        if (action instanceof UrlFetchResponseAction) {
            if (action.request.url.indexOf(GetThumbinfoApiPrefix) === 0) {
                return this._handleGetThumbinfoResponse(action, callback);
            }

            if (action.request.url.indexOf(GetFlvApiPrefix) === 0) {
                return this._handleGetFlvResponse(action, callback);
            }

            console.warn("Response does not handled: ", action);
            return false;
        }

        console.warn("Fetch response does not handled: ", action);
        return false;
    }

    private _fetchGetThumbinfo(reqKey: VideoKey) {
        this._fetchUrl(reqKey, GetThumbinfoApiPrefix + reqKey.id);
    }

    private _fetchGetFlv(reqKey: VideoKey) {
        this._fetchUrl(reqKey, GetFlvApiPrefix + reqKey.id);
    }

    private _fetchUrl(reqKey: VideoKey, url: string) {
        let req = Request.get(url);
        NicoThumbinfoActionCreator.createUrlFetchAction(
            this._key, req, reqKey, DataSource.GetThumbinfo);
        this._loadingUrl = url;
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
