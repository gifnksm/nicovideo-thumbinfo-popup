/// <reference path="../../../typings/common.d.ts" />
"use strict";

import * as React from "react";
import {DescriptionElement as DescElem} from "../stores/RawVideoData";


module Description {
    export interface Props {
        description: DescElem[];
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

    private _renderElement(elem: DescElem): React.ReactNode {
        const RD = React.DOM;

        if (typeof elem === "string") {
            return elem;
        } else {
            return React.createElement(elem.name, elem.attr, elem.children.map((elem: DescElem) => this._renderElement(elem)));
        }
    }

    render() {
        const RD = React.DOM;
        return RD.div(null, ...this.props.description.map((elem: DescElem) => this._renderElement(elem)));
    }
}

export default Description;
