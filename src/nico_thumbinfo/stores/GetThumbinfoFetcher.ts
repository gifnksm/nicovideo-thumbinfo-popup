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

class ErrorStack {
    private _value: Option<ErrorInfo> = new None<ErrorInfo>();
    private _savedValue: Option<ErrorInfo> = new None<ErrorInfo>();

    get value(): Option<ErrorInfo> { return this._value; }

    set(errorInfo: ErrorInfo) {
        this._value = new Some(errorInfo);
        this._savedValue = new None<ErrorInfo>();
    }

    backup() {
        this._savedValue.map(info => {
            console.warn("savedValue is overwritten", info);
        });

        this._savedValue = this._value;
        this._value = new None<ErrorInfo>();
    }

    restore() {
        this._value.map(info => {
            console.warn("value is overwritten", info);
        });

        this._value = this._savedValue;
        this._savedValue = new None<ErrorInfo>();
    }
}

export default class GetThumbinfoFetcher {
    private _key: VideoKey;
    private _source: Source;

    private _errorStack = new ErrorStack();
    private _videoData: Option<RawVideoData> = new None<RawVideoData>();
    private _videoId: Option<string> = new None<string>();
    private _fetchType: FetchType;
    private _retryGetFlvTriggered: boolean = false;
    private _retryVideoIdTriggered: boolean = false;

    get errorInfo() { return this._errorStack.value; }
    get videoData() { return this._videoData; }
    get isCompleted() { return this._videoData.isSome }
    get isErrored() { return this.errorInfo.isSome }
    get isStopped() { return this.isCompleted || this.isErrored }

    constructor(key: VideoKey) {
        this._key = key;
        this._source = new Source(SourceType.GetThumbinfo, this._key);

        if (key.type === VideoKey.Type.VideoId) {
            this.setVideoId(key.id);
        }

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

        throw new Error("BUG: unreachable");
    }

    setVideoId(videoId: string) {
        if (this._videoId.isSome) {
            return;
        }
        this._videoId = new Some(videoId);
        this._triggerRetryVideoId();
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

                // UrlFetchAction の payload は、NicoThumbinfoActionCreate で作成されるキャッシュを
                // 使いまわしており、書き換えると同じURLを参照する他の thumbinfo に影響があるため、
                // コピーを作成して書き換える
                let clonedPayload = payload.shallowClone();
                clonedPayload.commentCounter = new None<number>();
                clonedPayload.lastResBody = new None<string>();
                this._videoData = new Some(clonedPayload);
            } else {
                this._videoData = new Some(payload);
            }
            this._fetchNicopedia();
            return true;
        }

        if (payload instanceof ErrorInfo) {
            if (this._fetchType === FetchType.RetryVideoId) {
                // 2度目の取得だった場合、これ以上繰り返しても失敗するため、
                // エラー情報を保存しておいたものに戻して終了する
                this._errorStack.restore();
                return true;
            }

            this._errorStack.set(payload);

            if (payload.code === ErrorCode.CommunitySubThread ||
                payload.code === ErrorCode.Deleted) {
                // コミュニティ動画の場合、getflv の optional_thread_id により、
                // 元動画の情報を取得できる可能性がある
                // 削除済み動画の場合、getflv の deleted/error により、
                // 詳細な削除理由が取得できる可能性がある
                this._triggerRetryGetFlv();
            } else {
                // V3VideoArray の取得情報などにより videoId が設定されていた場合に発火するはず
                this._triggerRetryVideoId();
            }

            return true;
        }

        throw new Error("BUG: unreachable");
    }

    private _handleGetFlvFetchAction(action: GetFlvFetchAction): boolean {
        let payload = action.payload;

        if (payload instanceof VideoKey) {
            this._fetchGetThumbinfo(payload, FetchType.RetryOptionalThreadId);
            return true;
        }

        if (payload instanceof ErrorInfo) {
            if (payload.code !== ErrorCode.Unknown) {
                this._errorStack.set(payload);
            } else {
                console.warn("Unknown getflv error:", action);
                // エラーコードは初回の getthumbinfo 時に設定されたものを設定する
                this._errorStack.restore();
            }
            this._triggerRetryVideoId();
            return true;
        }

        throw new Error("BUG: unreachable");
    }

    private _handleNicopediaFetchAction(action: NicopediaFetchAction): boolean {
        if (this._videoData.isNone) {
            console.warn("this._videoData.isNone", this);
            return false;
        }
        return NicopediaFetcher.handleAction(action, this._videoData.unwrap());
    }

    private _triggerRetryGetFlv() {
        if (this._retryGetFlvTriggered ||
            !this.isErrored ||
            this._key.type !== VideoKey.Type.ThreadId) {
            return;
        }

        this._retryGetFlvTriggered = true;
        this._errorStack.backup();
        this._fetchGetFlv(this._key);
    }

    private _triggerRetryVideoId() {
        // スレッドIDで取得が失敗した動画について、videoID で再取得に挑戦してみる
        // 非ログイン状態だと getflv が失敗するため、コミュニティ動画の場合にうまくいくケースがある
        if (this._retryVideoIdTriggered ||
            !this.isErrored ||
            this._videoId.isNone ||
            this._key.type === VideoKey.Type.VideoId) {
            return;
        }

        this._retryVideoIdTriggered = true;
        this._errorStack.backup();
        let key = VideoKey.fromVideoId(this._videoId.unwrap());
        this._fetchGetThumbinfo(key, FetchType.RetryVideoId);
   }
}
