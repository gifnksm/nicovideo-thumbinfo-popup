/// <reference path="../../../typings/bundle.d.ts" />
"use strict";

import TagData from "../models/TagData";
import NicopediaIcon, {Type as NicopediaIconType} from "./NicopediaIcon";

import * as React from "react";
import {Option, Some, None} from "option-t";

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

    renderStar() {
        return React.DOM.span({style: {color: "#F90"}}, "★");
    }
    renderBracket(child: React.ReactNode) {
        return React.DOM.span({style: {color: "#F30"}}, "[", child, "]");
    }

    render() {
        const RD = React.DOM;
        let tag = this.props.tag;

        let marker: React.ReactNode = null;
        if (tag.isCategory.unwrapOr(false)) {
            if (tag.isLocked.unwrapOr(false)) {
                marker = this.renderBracket(this.renderStar());
            } else {
                marker = this.renderBracket("C");
            }
        } else {
            if (tag.isLocked.unwrapOr(false)) {
                marker = this.renderStar();
            } else {
                marker = null;
            }
        }

        return RD.dd(
            {className: "tag"},
            marker,
            RD.a({href: "http://www.nicovideo.jp/tag/" + encodeURIComponent(tag.name)},
                 tag.name),
            React.createElement(NicopediaIcon, {
                type: NicopediaIconType.Tag,
                name: tag.name,
                id: encodeURIComponent(tag.name),
                registered: tag.nicopediaRegistered
            }));
    }
}

export default Tag;
