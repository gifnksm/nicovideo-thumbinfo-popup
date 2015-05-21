/// <reference path="../../../typings/common.d.ts" />
"use strict";

import * as React from "react";
import TagData from "../models/TagData";
import Tag from "./Tag"

module TagList {
    export interface Props {
        tags: TagData[];
    }
    export interface State {}
}

class TagList extends React.Component<TagList.Props, TagList.State> {
    static defaultProps = <TagList.Props> {
        tags: null
    };
    static propTypes = <React.ValidationMap<TagList.Props>> {
        tags: React.PropTypes.array.isRequired
    };

    render() {
        const RD = React.DOM;
        return RD.dl(
            {className: "tag-list"},
            RD.dt(null, `タグ (${this.props.tags.length}): `),
            this.props.tags.map(tag => React.createElement(Tag, {tag: tag, key: tag.name}))
       );
    }
}

export default TagList;
