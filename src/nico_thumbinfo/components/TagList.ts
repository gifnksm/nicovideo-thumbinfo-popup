/// <reference path="../../../typings/common.d.ts" />

import * as React from "react";
import {Tag as TagData} from "../stores/VideoData";
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
        return RD.div(
            null,
            RD.strong(null, `タグ(${this.props.tags.length}): `),
            this.props.tags.map((tag) => {
                return [" ", React.createElement(Tag, {tag: tag, key: tag.name})];
            })
       );
    }
}

export default TagList;