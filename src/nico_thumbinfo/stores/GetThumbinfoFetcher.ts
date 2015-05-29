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

const enum FetchType {
    FirstTime,
    RetryOptionalThreadId,
    RetryVideoId
}

export default class GetThumbinfoFetcher {
    private _key: VideoKey;
    private _source: Source;

    private _errorInfo: Option<ErrorInfo> = new None<ErrorInfo>();
    private _savedErrorInfo: Option<ErrorInfo> = new None<ErrorInfo>();
    private _videoData: Option<RawVideoData> = new None<RawVideoData>();
    private _videoId: Option<string> = new None<string>();
    private _fetchType: FetchType;
    private _retryVideoIdTriggered: boolean;

    get errorInfo() { return this._errorInfo; }
    get videoData() { return this._videoData; }
    get isCompleted() { return this._videoData.isSome }
    get isErrored() { return this._errorInfo.isSome }
    get isStopped() { return this.isCompleted || this.isErrored }

    constructor(key: VideoKey) {
        this._key = key;
        this._source = new Source(SourceType.GetThumbinfo, this._key);

        this._fetchGetThumbinfo(this._key, FetchType.FirstTime);
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

    setVideoId(videoId: string) {
        if (this._videoId.isSome) {
            return;
        }
        this._videoId = new Some(videoId);
        this._triggerFetchRetry();
    }

    private _fetchGetThumbinfo(reqKey: VideoKey, fetchType: FetchType) {
        this._fetchType = fetchType;
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
            if (this._fetchType === FetchType.RetryVideoId ||
                this._fetchType === FetchType.RetryOptionalThreadId) {
                // 再実行の場合、異なるIDで動画を取得しているため、
                // 誤った情報になっている可能性がある項目については上書きする
                // 具体的には、スレッドごとに紐づく情報 (コメント関連)
                payload.commentCounter = new None<number>();
                payload.lastResBody = new None<string>();
            }
            this._videoData = new Some(payload);
            this._fetchNicopedia();
            return true;
        }

        if (payload instanceof ErrorInfo) {
            if (this._fetchType === FetchType.RetryVideoId) {
                // 2度目の取得だった場合、これ以上繰り返しても失敗するため、
                // エラー情報を保存しておいたものに戻して終了する
                this._errorInfo = this._savedErrorInfo;
                this._savedErrorInfo = new None<ErrorInfo>();
                return true;
            }

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
                this._triggerFetchRetry();
            }

            return true;
        }

        console.warn("Unknown result: ", payload);
        this._errorInfo = new Some(new ErrorInfo(ErrorCode.Unknown));
        this._triggerFetchRetry();
        return true;
    }

    private _handleGetFlvFetchAction(action: GetFlvFetchAction): boolean {
        let payload = action.payload;

        if (payload instanceof VideoKey) {
            this._fetchGetThumbinfo(payload, FetchType.RetryOptionalThreadId);
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
            this._triggerFetchRetry();
            return true;
        }

        console.warn("Invalid getflv data:", action);
        // エラーコードは初回の getthumbinfo 時に設定されたものを設定する
        this._errorInfo = this._savedErrorInfo;
        this._savedErrorInfo = new None<ErrorInfo>();
        this._triggerFetchRetry();
        return true;
    }

    private _handleNicopediaFetchAction(action: NicopediaFetchAction): boolean {
        if (this._videoData.isNone) {
            console.warn("this._videoData.isNone", this);
            return false;
        }
        return NicopediaFetcher.handleAction(action, this._videoData.unwrap());
    }

    private _triggerFetchRetry() {
        // スレッドIDで取得が失敗した動画について、videoID で再取得に挑戦してみる
        // 非ログイン状態だと getflv が失敗するため、コミュニティ動画の場合にうまくいくケースがある
        if (this._retryVideoIdTriggered ||
            !this.isErrored ||
            this._videoId.isNone ||
            this._key.type === VideoKey.Type.VideoId) {
            return;
        }

        console.log("trigger", this);

        this._retryVideoIdTriggered = true;
        this._savedErrorInfo = this._errorInfo;
        this._errorInfo = new None<ErrorInfo>();
        let key = VideoKey.fromVideoId(this._videoId.unwrap());
        this._fetchGetThumbinfo(key, FetchType.RetryVideoId);
   }
}
