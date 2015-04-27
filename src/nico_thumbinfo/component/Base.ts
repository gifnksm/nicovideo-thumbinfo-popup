/// <reference path="../../../typings/common.d.ts" />

import * as React from "react";
import VideoKey from "../model/VideoKey";
import {Data as VideoData} from "../model/VideoData";
import VideoDataStore, {VideoDataStoreInterface} from "../store/VideoDataStore";

module Component {
    export interface Props {
        videoKey: VideoKey
        store?: VideoDataStoreInterface
    }
    export interface State {
        videoData: VideoData
    }
}

class Component extends React.Component<Component.Props, Component.State> {
    static defaultProps = <Component.Props> {
        videoKey: null,
        store: VideoDataStore
    };
    state = <Component.State> {
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

    public render() {
        let children: React.ReactNode[] = [];
        let data = this.state.videoData;

        if (!data.isEmpty) {
            children.push(React.DOM.img({src: data.thumbnailUrl}));
            children.push(React.DOM.div(
                null,
                React.DOM.span(null, `${date2str(data.postedAt)}投稿 `),
                React.DOM.span(null, "[up:"),
                React.DOM.a({href: data.uploader.url}, data.uploader.name),
                React.DOM.span(null, "]")));
            children.push(React.DOM.h1(
                null,
                React.DOM.a({href: data.watchUrl},
                            data.title)
            ));
            let mylist_url = `http://www.nicovideo.jp/openlist/${data.key.id}`;
            children.push(React.DOM.div(
                null,
                React.DOM.span(null, `再生時間: `),
                React.DOM.strong(null, length2str(data.lengthInSeconds)),
                React.DOM.span(null, ` 再生: `),
                React.DOM.strong(null, data.viewCounter.toLocaleString()),
                React.DOM.span(null, ` コメント: `),
                React.DOM.strong(null, data.commentCounter.toLocaleString()),
                React.DOM.span(null, ` マイリスト: `),
                React.DOM.strong(null, React.DOM.a({href: mylist_url},
                                                   data.mylistCounter.toLocaleString()))
            ));
        }
        return React.DOM.div(null, ...children);
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

export default Component;
