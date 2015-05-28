/// <reference path="../../../typings/bundle.d.ts" />
"use strict";

import * as React from "react";

export const enum Size {
    Normal, Small, Large
}

module HatebuIcon {
    export interface Props {
        url: string;
        size?: Size;
    }
    export interface State {
        isZeroUser: boolean
    }
}

class HatebuIcon extends React.Component<HatebuIcon.Props, HatebuIcon.State> {
    static defaultProps = <HatebuIcon.Props> {
        url: undefined,
        size: Size.Normal
    };
    static propsTypes = <React.ValidationMap<HatebuIcon.Props>> {
        url: React.PropTypes.string.isRequired,
        size: React.PropTypes.oneOf([Size.Normal, Size.Small, Size.Large])
    };

    private _onLoad(ev: Event) {
        if ((<HTMLImageElement>ev.target).width === 1) { // 0 user
            this.setState({isZeroUser: true});
        }
    }

    state = <HatebuIcon.State> {
        isZeroUser: undefined
    };

    render() {
        const RD = React.DOM;
        let linkApi = "http://b.hatena.ne.jp/entry/";
        let imgApi = "http://b.hatena.ne.jp/entry/image/";

        switch (this.props.size) {
        case Size.Normal:
            break;
        case Size.Small:
            imgApi += "small/";
            break;
        case Size.Large:
            imgApi += "large/";
            break;
        }

        let child: React.ReactNode = null;
        if (this.state.isZeroUser) {
            child = "0 user";
        } else {
            child = RD.img({src: imgApi + this.props.url, onLoad: this._onLoad.bind(this)});
        }
        return RD.a({href: linkApi + this.props.url}, child);
    }
}

export default HatebuIcon;
