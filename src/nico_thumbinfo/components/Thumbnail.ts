/// <reference path="../../../typings/bundle.d.ts" />
"use strict";

import * as React from "react";
import {Option, Some, None} from "option-t";

namespace Thumbnail {
    export interface Props {
        url: Option<string>;
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
        url: React.PropTypes.object.isRequired,
        deleted: React.PropTypes.bool.isRequired
    };

    private _onError(ev: Event) {
        this.setState({loadFailed: true});
    }

    state = <Thumbnail.State> {
        loadFailed: false
    };

    render() {
        const RD = React.DOM;
        let attr: any = {className: "thumbnail", onError: this._onError.bind(this) };

        if (this.props.deleted) {
            if (this.state.loadFailed || this.props.url.isNone) {
                attr.src = "http://res.nimg.jp/img/common/video_deleted.jpg";
            } else {
                attr.src = this.props.url.unwrap();
            }
        } else {
            if (this.props.url.isNone || this.state.loadFailed) {
                return null;
            }
            attr.src = this.props.url.unwrap();
        }

        return RD.img(attr);
    }
}

export default Thumbnail;

