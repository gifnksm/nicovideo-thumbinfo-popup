/// <reference path="../../../typings/common.d.ts" />

import * as React from "react";
import {Tag} from "../model/VideoData";

module TagList {
    export interface Props {
        tags: Tag[];
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
            RD.strong(null, `タグ(${this.props.tags.length}): `)
        );
    }
}

export default TagList;
