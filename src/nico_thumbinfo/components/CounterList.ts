/// <reference path="../../../typings/common.d.ts" />
"use strict";

import * as React from "react";
import VideoData from "../stores/VideoData";

module CounterList {
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

    render() {
        const RD = React.DOM;
        let data = this.props.videoData;
        let mylistURL = `http://www.nicovideo.jp/openlist/${data.key.id}`;

        return RD.dl(
            {className: "counter-list"},
            RD.dt(null, "再生時間:"),
            RD.dd(null, length2str(data.lengthInSeconds)),
            RD.dt(null, "再生:"),
            RD.dd(null, data.viewCounter.toLocaleString()),
            RD.dt(null, "コメント:"),
            RD.dd(null, data.commentCounter.toLocaleString()),
            RD.dt(null, "マイリスト:"),
            RD.dd(null, RD.a({href: mylistURL},
                             data.mylistCounter.toLocaleString()))
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
