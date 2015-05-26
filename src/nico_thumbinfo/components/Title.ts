/// <reference path="../../../typings/common.d.ts" />
"use strict";

import NicopediaIcon, {Type as NicopediaIconType} from "./NicopediaIcon";

import * as React from "react";
import {Option, Some, None} from "option-t";

module Title {
    export interface Props {
        title: Option<string>;
        watchUrl: string;
        id: string;
        nicopediaRegistered: Option<boolean>;
    }
    export interface State {}
}

class Title extends React.Component<Title.Props, Title.State> {
    static defaultProps = <Title.Props> {
        title: undefined,
        watchUrl: undefined,
        id: undefined,
        nicopediaRegistered: undefined
    };
    static propsTypes = <React.ValidationMap<Title.Props>> {
        title: React.PropTypes.string.isRequired,
        watchUrl: React.PropTypes.string.isRequired,
        id: React.PropTypes.string.isRequired,
        nicopediaRegistered: React.PropTypes.bool.isRequired
    };

    render() {
        const RD = React.DOM;

        let title = this.props.title.unwrapOr(`(タイトル不明: ${this.props.id})`);
        let anchor = RD.a({href: this.props.watchUrl}, title);
        let pedia = React.createElement(NicopediaIcon, {
            type: NicopediaIconType.Video,
            name: title,
            id: this.props.id,
            registered: this.props.nicopediaRegistered
        });

        return RD.h1({className: "title"}, anchor, pedia);
    }
}

export default Title;
