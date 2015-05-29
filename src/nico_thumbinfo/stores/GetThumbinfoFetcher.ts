/// <reference path="../../../typings/bundle.d.ts" />
"use strict";

import NicopediaFetcher from "./NicopediaFetcher";

import ErrorInfo, {ErrorCode} from "../models/ErrorInfo";
import VideoKey from "../models/VideoKey";
import RawVideoData from "../models/RawVideoData";

import NicoThumbinfoActionCreator from "../actions/NicoThumbinfoActionCreator";
import NicoThumbinfoAction from "../actions/NicoThumbinfoAction";
import UrlFetchAction, {Source, SourceType} from "../actions/UrlFetchAction";
import GetThumbinfoFetchAction from "../actions/GetThumbinfoFetchAction";
import GetFlvFetchAction from "../actions/GetFlvFetchAction";
import NicopediaFetchAction from "../actions/NicopediaFetchAction";

import {Option, Some, None} from "option-t";
import * as querystring from "querystring";

export default class GetThumbinfoFetcher {
    private _key: VideoKey;
    private _source: Source;

    private _errorInfo: Option<ErrorInfo> = new None<ErrorInfo>();
    private _savedErrorInfo: Option<ErrorInfo> = new None<ErrorInfo>();
    private _videoData: Option<RawVideoData> = new None<RawVideoData>();

    get errorInfo() { return this._errorInfo; }
    get videoData() { return this._videoData; }
    get isCompleted() { return this._videoData.isSome }
    get isErrored() { return this._errorInfo.isSome }
    get isStopped() { return this.isCompleted || this.isErrored }

    constructor(key: VideoKey) {
        this._key = key;
        this._source = new Source(SourceType.GetThumbinfo, this._key);

        this._fetchGetThumbinfo(this._key);
    }

    handleAction(action: NicoThumbinfoAction): boolean {
        if (!(action instanceof UrlFetchAction) ||
            action.source.sourceType !== this._source.sourceType) {
            return false;
        }

        if (action instanceof GetThumbinfoFetchAction) {
            return this._handleGetThumbinfoFetchAction(action);
        }

        if (action instanceof GetFlvFetchAction) {
            return this._handleGetFlvFetchAction(action);
        }

        if (action instanceof NicopediaFetchAction) {
            return this._handleNicopediaFetchAction(action);
        }

        console.warn("Fetch response does not handled: ", action);
        return false;
    }

    private _fetchGetThumbinfo(reqKey: VideoKey) {
        NicoThumbinfoActionCreator.createGetThumbinfoFetchAction(this._source, reqKey);
    }

    private _fetchGetFlv(reqKey: VideoKey) {
        NicoThumbinfoActionCreator.createGetFlvFetchAction(this._source, reqKey);
    }

    private _fetchNicopedia() {
        if (this._videoData.isNone) {
            console.warn("this._videoData.isNone", this);
            return;
        }

        NicopediaFetcher.fetch(this._videoData.unwrap(), this._source);
    }

    private _handleGetThumbinfoFetchAction(action: GetThumbinfoFetchAction): boolean {
        let payload = action.payload;

        if (payload instanceof RawVideoData) {
            this._videoData = new Some(payload);
            this._fetchNicopedia();
            return true;
        }

        if (payload instanceof ErrorInfo) {
            if (payload.errorCode === ErrorCode.CommunitySubThread ||
                payload.errorCode === ErrorCode.Deleted) {
                // コミュニティ動画の場合、getflv の optional_thread_id により、
                // 元動画の情報を取得できる可能性がある
                // 削除済み動画の場合、getflv の deleted/error により、
                // 詳細な削除理由が取得できる可能性がある
                this._savedErrorInfo = new Some(payload);
                this._fetchGetFlv(this._key);
            } else {
                this._errorInfo = new Some(payload);
            }

            return true;
        }

        console.warn("Unknown result: ", payload);
        this._errorInfo = new Some(new ErrorInfo(ErrorCode.Unknown));
        return true;
    }

    private _handleGetFlvFetchAction(action: GetFlvFetchAction): boolean {
        let payload = action.payload;

        if (payload instanceof VideoKey) {
            this._fetchGetThumbinfo(payload);
            return true;
        }

        if (payload instanceof ErrorInfo) {
            if (payload.errorCode !== ErrorCode.Unknown) {
                this._errorInfo = new Some(payload);
            } else {
                console.warn("Unknown getflv error:", action);
                // エラーコードは初回の getthumbinfo 時に設定されたものを設定する
                this._errorInfo = this._savedErrorInfo;
                this._savedErrorInfo = new None<ErrorInfo>();
            }
            return true;
        }

        console.warn("Invalid getflv data:", action);
        // エラーコードは初回の getthumbinfo 時に設定されたものを設定する
        this._errorInfo = this._savedErrorInfo;
        this._savedErrorInfo = new None<ErrorInfo>();
        return true;
    }

    private _handleNicopediaFetchAction(action: NicopediaFetchAction): boolean {
        if (this._videoData.isNone) {
            console.warn("this._videoData.isNone", this);
            return false;
        }
        return NicopediaFetcher.handleAction(action, this._videoData.unwrap());
    }
}
