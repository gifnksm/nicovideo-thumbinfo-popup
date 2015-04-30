/// <reference path="../../../typings/common.d.ts" />
"use strict";

import * as React from "react";
import {ThumbType} from "../stores/constants";
import VideoKey from "../stores/VideoKey";
import VideoData from "../stores/VideoData";
import VideoDataStore, {VideoDataStoreInterface} from "../stores/VideoDataStore";
import TagList from "./TagList";
import Description from "./Description";

module Base {
    export interface Props {
        videoKey: VideoKey
        store?: VideoDataStoreInterface
    }
    export interface State {
        videoData?: VideoData
    }
}

class Base extends React.Component<Base.Props, Base.State> {
    static defaultProps = <Base.Props> {
        videoKey: null,
        store: VideoDataStore
    };
    static propTypes = <React.ValidationMap<Base.Props>> {
        videoKey: React.PropTypes.instanceOf(VideoKey).isRequired,
        store: React.PropTypes.shape({
            addChangeListener: React.PropTypes.func.isRequired,
            removeChangeListener: React.PropTypes.func.isRequired,
            getVideoDataByKey: React.PropTypes.func.isRequired
        })
    };

    state = <Base.State> {
        videoData: this.props.store.getVideoDataByKey(this.props.videoKey)
    };

    private _onChange(key: VideoKey) {
        if (key.valueOf() !== this.props.videoKey.valueOf()) {
            return;
        }

        this.setState({videoData: this.props.store.getVideoDataByKey(this.props.videoKey)});
    }

    componentDidMount() {
        this.props.store.addChangeListener(this._onChange.bind(this));
    }
    componentWillUnmount() {
        this.props.store.removeChangeListener(this._onChange.bind(this));
    }

    render() {
        const RD = React.DOM;
        let data = this.state.videoData;

        if (data.isEmpty) {
            return RD.div(null);
        }

        let mylistURL = `http://www.nicovideo.jp/openlist/${data.key.id}`;
        let thumbType: React.ReactNode = null;
        switch (data.thumbType) {
        case ThumbType.Video:
            break;
        case ThumbType.MyMemory:
        case ThumbType.Community:
            thumbType = [RD.strong(null,
                                   data.thumbType === ThumbType.MyMemory
                                   ? "マイメモリー"
                                   : "コミュニティー" ),
                         " ",
                         RD.a({href: "http://www.nicovideo.jp/watch/" + data.watchUrl},
                             "\u00bb元動画")];
            break;
        case ThumbType.CommunityOnly:
            thumbType = RD.strong(null, "コミュニティー限定動画");
            break;
        case ThumbType.Deleted:
            thumbType = RD.strong({style: {color: "red"}}, "削除済み");
            break;
        default:
            console.warn("Unknown thumbType: ", data.thumbType);
            break;
        }

        return RD.div(
            null,
            RD.img({ src: data.thumbnailUrl }),

            RD.div(
                null,
                RD.span(null, `${date2str(data.postedAt)}投稿 `),
                " ",
                thumbType,
                " ",
                RD.span(null, "[up:"),
                RD.a({href: data.uploader.url}, data.uploader.name),
                RD.span(null, "]")
            ),

            RD.h1(
                null,
                RD.a({href: data.watchUrl}, data.title)
            ),

            RD.div(
                null,
                RD.span(null, `再生時間: `),
                RD.strong(null, length2str(data.lengthInSeconds)),
                " ",
                RD.span(null, `再生: `),
                RD.strong(null, data.viewCounter.toLocaleString()),
                " ",
                RD.span(null, `コメント: `),
                RD.strong(null, data.commentCounter.toLocaleString()),
                " ",
                RD.span(null, `マイリスト: `),
                RD.strong(null, RD.a({href: mylistURL},
                                     data.mylistCounter.toLocaleString()))
            ),

            React.createElement(TagList, {tags: data.tags}),
            React.createElement(Description, {description: data.description}),
            RD.div(null, data.lastResBody)
        );
    }
}

function fillZero(n: number, width: number): string {
    let s = n.toString();
    for (let i = s.length; i < width; i++) {
        s = '0' + s;
    }
    return s;
}

function date2str(date: Date): string {
    let year = fillZero(date.getFullYear(), 4);
    let month = fillZero(date.getMonth() + 1, 2);
    let day = fillZero(date.getDate(), 2);
    let hour = fillZero(date.getHours(), 2);
    let min = fillZero(date.getMinutes(), 2);
    let sec = fillZero(date.getSeconds(), 2);
    return `${year}年${month}月${day}日 ${hour}:${min}:${sec}`
}

function length2str(len: number): string {
    let min = Math.floor(len / 60);
    let sec = fillZero(len % 60, 2);
    return `${min}分${sec}秒`;
}

export default Base;
