/// <reference path="../../../typings/common.d.ts" />
"use strict";

import NicopediaIcon, {Type as NicopediaIconType} from "./NicopediaIcon";

import * as React from "react";

module Title {
    export interface Props {
        title: string;
        watchUrl: string;
        videoId: string;
        nicopediaRegistered: boolean;
    }
    export interface State {}
}

class Title extends React.Component<Title.Props, Title.State> {
    static defaultProps = <Title.Props> {
        title: undefined,
        watchUrl: undefined,
        videoId: undefined,
        nicopediaRegistered: undefined
    };
    static propsTypes = <React.ValidationMap<Title.Props>> {
        title: React.PropTypes.string.isRequired,
        watchUrl: React.PropTypes.string.isRequired,
        videoId: React.PropTypes.string.isRequired,
        nicopediaRegistered: React.PropTypes.bool.isRequired
    };

    render() {
        const RD = React.DOM;

        let {title, watchUrl, videoId, nicopediaRegistered} = this.props;
        if (title === undefined) {
            title = `(タイトル不明: ${this.props.videoId})`;
        }

        let anchor: React.ReactNode;
        if (watchUrl === undefined) {
            anchor = title;
        } else {
            anchor = RD.a({href: watchUrl}, title);
        }

        let pedia = React.createElement(NicopediaIcon, {
            type: NicopediaIconType.Video,
            name: title,
            id: videoId,
            registered: nicopediaRegistered
        });

        return RD.h1({className: "title"}, anchor, pedia);
    }
}

export default Title;
