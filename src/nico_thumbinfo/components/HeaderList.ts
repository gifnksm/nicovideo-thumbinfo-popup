/// <reference path="../../../typings/common.d.ts" />
"use strict";

import * as React from "react";

import {ThumbType} from "../stores/constants";
import VideoData from "../stores/VideoData";
import HatebuIcon, {Size as HatebuIconSize} from "../../hatebu_icon/components/HatebuIcon";

module HeaderList {
    export interface Props {
        videoData: VideoData;
    }
    export interface State {}
}

class HeaderList extends React.Component<HeaderList.Props, HeaderList.State> {
    static defaultProps = <HeaderList.Props> {
        videoData: null
    };
    static propTypes = <React.ValidationMap<HeaderList.Props>> {
        videoData: React.PropTypes.instanceOf(VideoData).isRequired
    };

    render() {
        const RD = React.DOM;
        let data = this.props.videoData;

        let thumbType: React.ReactNode[] = [];
        switch (data.thumbType) {
        case ThumbType.Video:
            break;
        case ThumbType.MyMemory:
        case ThumbType.Community:
            let [className, label] = data.thumbType === ThumbType.MyMemory
                ? ["mymemory", "マイメモリー"]
                : ["community", "コミュニティー"];

            thumbType = [
                RD.li({className: "thumb-type " + className}, label),
                RD.li(
                    {className: "original-video"},
                    RD.a({href: "http://www.nicovideo.jp/watch/" + data.videoId},
                         "\u00bb元動画")
                )
            ];
            break;
        case ThumbType.CommunityOnly:
            thumbType = [RD.li({className: "thumb-type community"}, "コミュニティー限定動画")];
            break;
        case ThumbType.Deleted:
            thumbType = [RD.li({className: "thumb-type deleted"}, "削除済み")];
            break;
        default:
            console.warn("Unknown thumbType: ", data.thumbType);
            break;
        }

        return RD.ul(
            {className: "header"},
            RD.li({className: "posted-at"}, `${date2str(data.postedAt)}投稿 `),
            ...thumbType,
            RD.li({className: "uploader-name"}, RD.a({href: data.uploader.url}, data.uploader.name)),
            RD.li({className: "hatebu-icon"}, React.createElement(HatebuIcon, {url: data.watchUrl}))
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

export default HeaderList;
