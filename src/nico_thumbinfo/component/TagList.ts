/// <reference path="../../../typings/common.d.ts" />

import * as React from "react";
import {Tag} from "../model/VideoData";

module TagList {
    export interface Props {
        tags: {[index: string]: Tag[]};
        homeDomain?: string;
        initialExpandForeignTags?: boolean;
        foreignTagExpandLimit?: number;
    }
    export interface State {
        expandForeignTags?: boolean;
        homeTags?: Tag[];
        foreignTags?: { domain: string, tags: Tag[]}[];
        foreignTagsCount?: number;
    }
}

class TagList extends React.Component<TagList.Props, TagList.State> {
    static defaultProps = <TagList.Props> {
        tags: null,
        homeDomain: "jp",
        initialExpandForeignTags: false,
        foreignTagExpandLimit: 15
    };
    static propTypes = <React.ValidationMap<TagList.Props>> {
        tags: React.PropTypes.object.isRequired,
        homeDomain: React.PropTypes.string,
        initialExpandForeignTags: React.PropTypes.bool,
        foreignTagExpandLimit: React.PropTypes.number
    };

    constructor(props: TagList.Props) {
        super(props);

        let homeTags: Tag[] = [];
        let foreignCount = 0;
        let foreignTags: {domain: string, tags: Tag[]}[] = [];

        for (let domain in this.props.tags) {
            if (!this.props.tags.hasOwnProperty(domain)) {
                continue;
            }
            let tags = this.props.tags[domain];

            if (domain === this.props.homeDomain) {
                homeTags = homeTags.concat(tags);
            } else {
                foreignTags.push({domain: domain, tags: tags});
                foreignCount += tags.length;
            }
        }

        this.state = {
            expandForeignTags: (this.props.initialExpandForeignTags ||
                                foreignCount <= this.props.foreignTagExpandLimit),
            homeTags: homeTags,
            foreignTags: foreignTags,
            foreignTagsCount: foreignCount
        };
    }

    private _onclick(ev: MouseEvent) {
        this.setState({ expandForeignTags: !this.state.expandForeignTags });
    }

    private _renderLabel() {
        const RD = React.DOM;

        if (this.state.foreignTagsCount === 0) {
            return RD.strong(null, `タグ(${this.state.homeTags.length}): `);
        }

        return RD.strong(
            null,
            `タグ(${this.state.homeTags.length} + `,
            RD.a({ onClick: this._onclick.bind(this), href: "javascript: void(0);" },
                 this.state.foreignTagsCount),
            "): ");
    }

    render() {
        const RD = React.DOM;
        return RD.div(
            null,
            this._renderLabel()
        );
    }
}

export default TagList;
