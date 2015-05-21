/// <reference path="../../../typings/common.d.ts" />
"use strict";

import * as React from "react";
import {DescriptionNode as DNode} from "../models/DescriptionNode";

module Description {
    export interface Props {
        description: DNode[];
    }
    export interface State {}
}

class Description extends React.Component<Description.Props, Description.State> {
    static defaultProps = <Description.Props> {
        description: null
    };
    static propTypes = <React.ValidationMap<Description.Props>> {
        description: React.PropTypes.arrayOf(React.PropTypes.oneOfType([React.PropTypes.string, React.PropTypes.object])).isRequired
    };

    render() {
        const RD = React.DOM;
        return RD.div(
            {className: "description"},
            ...this.props.description.map((node: DNode) => node.render())
        );
    }
}

export default Description;
