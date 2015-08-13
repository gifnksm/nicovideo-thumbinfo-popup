/// <reference path="../../../typings/bundle.d.ts" />
"use strict";

import VideoData from "../stores/VideoData";

import * as React from "react";
import {Option, Some, None} from "option-t";

namespace CounterList {
    export interface Props {
        videoData: VideoData;
    }
    export interface State {}
}

class CounterList extends React.Component<CounterList.Props, CounterList.State> {
    static defaultProps = <CounterList.Props> {
        videoData: null
    };
    static propTypes = <React.ValidationMap<CounterList.Props>> {
        videoData: React.PropTypes.instanceOf(VideoData).isRequired
    };

    private _renderLength(length: Option<number>): string {
        return length.map(length2str).unwrapOr("???");
    }

    private _renderCounter(viewCounter: Option<number>): string {
        return viewCounter.map(counter => counter.toLocaleString()).unwrapOr("???");
    }

    render() {
        const RD = React.DOM;
        let data = this.props.videoData;
        let mylistURL = `http://www.nicovideo.jp/openlist/${data.key.id}`;

        return RD.dl(
            {className: "counter-list"},
            RD.dt(null, "再生時間:"),
            RD.dd(null, this._renderLength(data.lengthInSeconds)),
            RD.dt(null, "再生:"),
            RD.dd(null, this._renderCounter(data.viewCounter)),
            RD.dt(null, "コメント:"),
            RD.dd(null, this._renderCounter(data.commentCounter)),
            RD.dt(null, "マイリスト:"),
            RD.dd(null, RD.a({href: mylistURL},
                             this._renderCounter(data.viewCounter)))
        );
    }
}

function length2str(len: number): string {
    let min = Math.floor(len / 60);
    let sec = len % 60;
    if (sec < 10) {
        return `${min}分0${sec}秒`;
    }
    return `${min}分${sec}秒`;
}

export default CounterList;
