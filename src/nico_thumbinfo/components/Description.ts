/// <reference path="../../../typings/common.d.ts" />
"use strict";

import {DescriptionNode as DNode} from "../models/DescriptionNode";

import * as React from "react";
import {Option, Some, None} from "option-t";

module Description {
    export interface Props {
        description: Option<DNode[]>;
    }
    export interface State {}
}

class Description extends React.Component<Description.Props, Description.State> {
    static defaultProps = <Description.Props> {
        description: null
    };
    static propTypes = <React.ValidationMap<Description.Props>> {
        description: React.PropTypes.object.isRequired
    };

    render() {
        const RD = React.DOM;
        return this.props.description.map(description => {
            return RD.div(
                {className: "description"},
                ...description.map((node: DNode) => node.render())
            );
        }).unwrapOr(null);
    }
}

export default Description;
