/// <reference path="../../../typings/bundle.d.ts" />
"use strict";

import {DataAttributeName} from "../../components/constants";

import {ThumbType} from "../models/constants";
import ErrorInfo, {ErrorCode} from "../models/ErrorInfo";
import VideoKey from "../models/VideoKey";

import VideoData from "../stores/VideoData";
import VideoDataStore,
    {VideoDataStoreInterface, VideoDataOrganizerInterface}
    from "../stores/VideoDataStore";

import {DataAttributeValue} from "./constants";
import Thumbnail from "./Thumbnail";
import Title from "./Title";
import CounterList from "./CounterList";
import HeaderList from "./HeaderList";
import TagList from "./TagList";
import Description from "./Description";
import LastResBody from "./LastResBody";

import {Option, Some, None} from "option-t";
import * as React from "react";

module Base {
    export interface Props {
        videoKey: VideoKey
        store?: VideoDataStoreInterface
    }
    export interface State {
        organizer?: VideoDataOrganizerInterface
    }
}

class Base extends React.Component<Base.Props, Base.State> {
    static defaultProps = <Base.Props> {
        videoKey: null,
        store: VideoDataStore
    };
    static propTypes = <React.ValidationMap<Base.Props>> {
        videoKey: React.PropTypes.instanceOf(VideoKey).isRequired,
        store: React.PropTypes.object.isRequired
    };

    state = <Base.State> {
        organizer: this.props.store.getVideoDataOrganizerByKey(this.props.videoKey)
    };

    private _onChange(key: VideoKey) {
        if (key.valueOf() !== this.props.videoKey.valueOf()) {
            return;
        }
        this.setState({organizer: this.props.store.getVideoDataOrganizerByKey(this.props.videoKey)});
    }

    componentDidMount() {
        this.props.store.addChangeListener(this._onChange.bind(this));
    }
    componentWillUnmount() {
        this.props.store.removeChangeListener(this._onChange.bind(this));
    }

    private _renderThumbnail(videoData: VideoData): React.ReactNode {
        let deleted = videoData.thumbType.map(type => {
            switch (type) {
            case ThumbType.Deleted:
            case ThumbType.DeletedByAdmin:
            case ThumbType.DeletedAsPrivate:
            case ThumbType.DeletedByUploader:
            case ThumbType.DeletedByContentHolder:
                return true;
            }
            return false;
        }).unwrapOr(false);

        return React.createElement(Thumbnail,
                                   {url: videoData.thumbnailUrl,
                                    deleted: deleted})
    }

    private _renderLoadingMessage(videoData: VideoData): React.ReactNode {
        const RD = React.DOM;
        return RD.div({className: "loading-message"},
                      this._renderThumbnail(videoData),
                      RD.h1({className: "title"},
                            "取得中: \"",
                            RD.a({href: videoData.watchUrl}, videoData.key.id),
                            "\"..."));
    }

    private _renderVideoData(videoData: VideoData): React.ReactNode {
        const RD = React.DOM;

        return RD.div(
            {className: "video-data"},
            this._renderThumbnail(videoData),
            React.createElement(HeaderList, {videoData: videoData}),
            React.createElement(Title, {title: videoData.title,
                                        watchUrl: videoData.watchUrl,
                                        id: videoData.key.id,
                                        nicopediaRegistered: videoData.nicopediaRegistered}),
            React.createElement(CounterList, {videoData: videoData}),
            React.createElement(TagList, {tags: videoData.tags}),
            React.createElement(Description, {description: videoData.description}),
            React.createElement(LastResBody, {value: videoData.lastResBody}));
    }

    private _renderErrorMessage(videoData: VideoData, errors: ErrorInfo[]): React.ReactNode {
        const RD = React.DOM;
        return RD.div({className: "error-message"},
                      this._renderThumbnail(videoData),
                      RD.h1({className: "title"},
                            "取得失敗: \"",
                            RD.a({href: videoData.watchUrl}, videoData.key.id),
                            "\""),
                      this._renderErrorSummary(errors));
    }

    private _errorCode2Summary(code: ErrorCode): string {
        switch (code) {
        case ErrorCode.UrlFetch:
            return "APIの呼び出しに失敗";
        case ErrorCode.HttpStatus:
            return "APIのレスポンスコードが異常";
        case ErrorCode.ServerMaintenance:
            return "メンテナンスまたはサーバダウン";
        case ErrorCode.Invalid:
            return "APIのレスポンス内容が異常";
        case ErrorCode.Deleted:
            return "削除済み";
        case ErrorCode.DeletedByUploader:
            return "投稿者削除";
        case ErrorCode.DeletedByAdmin:
            return "利用規約違反削除";
        case ErrorCode.DeletedByContentHolder:
            return "権利者削除";
        case ErrorCode.DeletedAsPrivate:
            return "非表示";
        case ErrorCode.AccessLocked:
            return "APIアクセス過多";
        case ErrorCode.Community:
            return "コミュニティー動画"
        case ErrorCode.CommunitySubThread:
            return "コミュニティー動画(サブスレッド)"
        case ErrorCode.NotFound:
            return "動画が見つかりません";
        case ErrorCode.NotLoggedIn:
            return "ログインしていません";
        case ErrorCode.Unknown:
            return "未知のエラー";
        default:
            return "バグ";
        }
    }

    private _renderErrorSummary(errors: ErrorInfo[]): React.ReactNode {
        const RD = React.DOM;
        let map = new Map<ErrorCode, ErrorInfo[]>();
        for (let e of errors) {
            let es = map.get(e.code);
            if (es === undefined) {
                es = [];
                map.set(e.code, es);
            }
            es.push(e);
        }

        let list: string[] = [];
        map.forEach((es, code) => {
            let msg = this._errorCode2Summary(code);
            let detail: string[] = [];
            for (let e of es) {
                if (e.detail !== undefined) {
                    detail.push(e.detail);
                }
            }
            if (detail.length !== 0) {
                msg = `${msg} (${detail.join(", ")})`;
            }
            list.push(msg)
        })

        return RD.ul({className: "error-summary"},
                     list.map(msg => RD.li(null, msg)));
    }

    render() {
        const RD = React.DOM;
        let organizer = this.state.organizer;
        let content: React.ReactNode = null;

        if (organizer.numStopped === 0) {
            content = this._renderLoadingMessage(organizer.videoData);
        } else {
            if (organizer.numCompleted === 0) {
                content = this._renderErrorMessage(organizer.videoData,
                                                   organizer.getErrors());
            } else {
                content = this._renderVideoData(organizer.videoData);
            }
        }

        return RD.div(
            {
                [DataAttributeName.PopupContent]: DataAttributeValue.PopupContent,
                className: "content"
            },
            content
        );
    }
}

export default Base;
