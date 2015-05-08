/// <reference path="../../../typings/common.d.ts" />
"use strict";

import * as React from "react";

module Thumbnail {
    export interface Props {
        url: string;
        deleted: boolean;
    }
    export interface State {
        loadFailed: boolean;
    }
}

class Thumbnail extends React.Component<Thumbnail.Props, Thumbnail.State> {
    static defaultProps = <Thumbnail.Props> {
        url: undefined,
        deleted: undefined
    };
    static propsTypes = <React.ValidationMap<Thumbnail.Props>> {
        url: React.PropTypes.string.isRequired,
        deleted: React.PropTypes.bool.isRequired
    };

    private _onError(ev: Event) {
        if ((<HTMLImageElement>ev.target).width === 1) {
            this.setState({loadFailed: true});
        }
    }

    state = <Thumbnail.State> {
        loadFailed: false
    };

    render() {
        const RD = React.DOM;
        let attr: any = {className: "thumbnail"};

        if (this.state.loadFailed) {
            if (this.props.deleted) {
                attr.src = "http://res.nicovideo.jp/img/common/video_deleted.jpg";
            } else {
                attr.style = {width: 0, height: 0};
            }
        } else {
            attr.src = this.props.url;
        }
        return RD.img(attr);
    }
}

export default Thumbnail;
