/// <reference path="../../../typings/bundle.d.ts" />
"use strict";

import {ThumbType} from "../models/constants";
import Uploader from "../models/Uploader";
import VideoData from "../stores/VideoData";
import HatebuIcon, {Size as HatebuIconSize} from "../../hatebu_icon/components/HatebuIcon";

import * as React from "react";
import {Option, Some, None} from "option-t";

namespace HeaderList {
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

    private _renderThumbType(optThumbType: Option<ThumbType>, optVideoId: Option<string>): React.ReactNode[] {
        const RD = React.DOM;

        return optThumbType.mapOrElse(() => [], thumbType => {
            switch (thumbType) {
            case ThumbType.Video:
                return [];
            case ThumbType.MyMemory:
            case ThumbType.Community:
                let [className, label] = thumbType === ThumbType.MyMemory
                    ? ["mymemory", "マイメモリー"]
                    : ["community", "コミュニティー"];
                let link = optVideoId.mapOr(null, videoId => {
                    return RD.li(
                        {className: "original-video"},
                        RD.a({href: "http://www.nicovideo.jp/watch/" + videoId},
                             "\u00bb元動画")
                    );
                });

                return [RD.li({className: "thumb-type " + className}, label), link];
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
        });
    }

    private _renderPostedAt(optPostedAt: Option<Date>): React.ReactNode {
        const RD = React.DOM;

        let text = optPostedAt.mapOr("投稿日不明",
                                     postedAt => `${date2str(postedAt)}投稿 `);
        return RD.li({className: "posted-at"}, text);
    }

    private _renderUploaderName(optUploader: Option<Uploader>): React.ReactNode {
        const RD = React.DOM;

        let name = optUploader
            .andThen(uploader => uploader.name)
            .unwrapOr("不明な投稿者");

        let text = optUploader.andThen<React.ReactNode>(uploader => {
            return uploader.url.map(url => RD.a({href: url}, name));
        }).unwrapOr(name);

        return RD.li({className: "uploader-name"}, text);
    }

    private _renderHatebuIcon(watchUrl: string): React.ReactNode {
        const RD = React.DOM;
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
