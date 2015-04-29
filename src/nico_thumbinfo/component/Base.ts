/// <reference path="../../../typings/common.d.ts" />

import * as React from "react";
import VideoKey from "../model/VideoKey";
import {Data as VideoData} from "../model/VideoData";
import VideoDataStore, {VideoDataStoreInterface} from "../store/VideoDataStore";
import TagList from "./TagList";

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

        let mylist_url = `http://www.nicovideo.jp/openlist/${data.key.id}`;

        return RD.div(
            null,
            RD.img({ src: data.thumbnailUrl }),

            RD.div(
                null,
                RD.span(null, `${date2str(data.postedAt)}投稿 `),
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
                RD.span(null, ` 再生: `),
                RD.strong(null, data.viewCounter.toLocaleString()),
                RD.span(null, ` コメント: `),
                RD.strong(null, data.commentCounter.toLocaleString()),
                RD.span(null, ` マイリスト: `),
                RD.strong(null, RD.a({href: mylist_url},
                                     data.mylistCounter.toLocaleString()))
            ),

            React.createElement(TagList, {tags: data.tags})
            // RD.div(
            //     null,
            //     RD.strong(null, `タグ(${data.tags}): `)
            // )
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
