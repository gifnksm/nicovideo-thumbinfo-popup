/// <reference path="../../../typings/common.d.ts" />
"use strict";

import * as React from "react";
import TagData from "../stores/TagData";

module Tag {
    export interface Props {
        tag: TagData;
    }
    export interface State {}
}

class Tag extends React.Component<Tag.Props, Tag.State> {
    static defaultProps = <Tag.Props> {
        tag: null
    };
    static propTypes = <React.ValidationMap<Tag.Props>> {
        tag: React.PropTypes.instanceOf(TagData).isRequired
    };

    render() {
        const RD = React.DOM;
        let tag = this.props.tag;

        let link = RD.a({href: "http://www.nicovideo.jp/tag/" + encodeURIComponent(tag.name)},
                        tag.name);
        let bracket = (child: React.ReactNode) => {
            return RD.span({style: {color: "#F30"}}, "[", child, "]");
        };
        let star = () => RD.span({style: {color: "#F90"}}, "★");

        if (tag.isCategory && tag.isLocked) {
            return RD.span(null, bracket(star()), link);
        }
        if (tag.isCategory) {
            return RD.span(null, bracket("C"), link);
        }
        if (tag.isLocked) {
            return RD.span(null, star(), link);
        }
        return RD.span(null, link);
    }
}

export default Tag;
