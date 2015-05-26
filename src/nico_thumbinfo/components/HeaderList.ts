/// <reference path="../../../typings/common.d.ts" />
"use strict";

import * as React from "react";

import {ThumbType} from "../models/constants";
import Uploader from "../models/Uploader";
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

    private _renderThumbType(thumbType: ThumbType, videoId: string): React.ReactNode[] {
        const RD = React.DOM;

        if (thumbType === undefined) {
            return [];
        }

        switch (thumbType) {
        case ThumbType.Video:
            break;
        case ThumbType.MyMemory:
        case ThumbType.Community:
            let [className, label] = thumbType === ThumbType.MyMemory
                ? ["mymemory", "マイメモリー"]
                : ["community", "コミュニティー"];

            return [
                RD.li({className: "thumb-type " + className}, label),
                RD.li(
                    {className: "original-video"},
                    RD.a({href: "http://www.nicovideo.jp/watch/" + videoId},
                         "\u00bb元動画")
                )
            ];
        case ThumbType.CommunityOnly:
            return [RD.li({className: "thumb-type community"}, "コミュニティー限定動画")];
        case ThumbType.Deleted:
            return [RD.li({className: "thumb-type deleted"}, "削除済み")];
        case ThumbType.DeletedByUploader:
            return [RD.li({className: "thumb-type deleted"}, "投稿者削除")];
        case ThumbType.DeletedByAdmin:
            return [RD.li({className: "thumb-type deleted"}, "利用規約違反削除")];
        case ThumbType.DeletedByContentHolder:
            return [RD.li({className: "thumb-type deleted"}, "権利者削除")];
        case ThumbType.DeletedAsPrivate:
            return [RD.li({className: "thumb-type deleted"}, "非表示")];
        default:
            console.warn("Unknown thumbType: ", thumbType);
            break;
        }

        return [];
    }

    private _renderPostedAt(postedAt: Date): React.ReactNode {
        const RD = React.DOM;

        if (postedAt === undefined) {
            return RD.li({className: "posted-at"}, "投稿日不明");
        }
        return RD.li({className: "posted-at"}, `${date2str(postedAt)}投稿 `);
    }

    private _renderUploaderName(uploader: Uploader): React.ReactNode {
        const RD = React.DOM;

        let name = uploader.name;
        if (name === undefined) {
            name = "loading...";
        }

        return RD.li({className: "uploader-name"},
                     RD.a({href: uploader.url}, name));
    }

    private _renderHatebuIcon(watchUrl: string): React.ReactNode {
        const RD = React.DOM;

        if (watchUrl === undefined) {
            return null;
        }
        return RD.li({className: "hatebu-icon"},
                     React.createElement(HatebuIcon, {url: watchUrl}));
    }


    render() {
        const RD = React.DOM;
        let data = this.props.videoData;

        return RD.ul(
            {className: "header"},
            this._renderPostedAt(data.postedAt),
            ...this._renderThumbType(data.thumbType, data.videoId),
            this._renderUploaderName(data.uploader),
            this._renderHatebuIcon(data.watchUrl)
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
