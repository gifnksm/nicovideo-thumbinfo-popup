/// <reference path="../../../typings/bundle.d.ts" />
"use strict";

import {Option, Some, None} from "option-t";

import * as React from "react";

export const enum Type {
    Tag, Video
}

module NicopediaIcon {
    export interface Props {
        type: Type,
        id: string,
        name: string,
        registered: Option<boolean>
    }
    export interface State {}
}

class NicopediaIcon extends React.Component<NicopediaIcon.Props, NicopediaIcon.State> {
    static defaultProps = <NicopediaIcon.Props> {
        type: undefined,
        id: undefined,
        name: undefined,
        registered: undefined
    };
    static propTypes = <React.ValidationMap<NicopediaIcon.Props>> {
        type: React.PropTypes.oneOf([Type.Tag, Type.Video]).isRequired,
        id: React.PropTypes.string.isRequired,
        name: React.PropTypes.string.isRequired,
        registered: React.PropTypes.object.isRequired
    };

    render() {
        const RD = React.DOM;

        if (this.props.registered.isNone) {
            return null;
        }

        let image: React.ReactNode = null;
        let href: string;
        let src: string;
        let alt: string;
        let title: string;

        if (this.props.registered) {
            src = "http://res.nimg.jp/img/common/icon/dic_on.png";
            alt = "百";
            title = `大百科で「${this.props.name}」の記事を読む`;
        } else {
            src = "http://res.nimg.jp/img/common/icon/dic_off.png";
            alt = "？";
            title = `大百科で「${this.props.name}」の記事を書く`;
        }
        switch (this.props.type) {
        case Type.Video:
            href = "http://dic.nicovideo.jp/v/" + this.props.id;
            break;
        case Type.Tag:
            href = "http://dic.nicovideo.jp/a/" + this.props.id;
            break;
        }

        return RD.a({href: href, className: "nicopedia"},
                    RD.img({src: src, alt: alt, title: title}));
    }
}

export default NicopediaIcon;
