/// <reference path="../../../typings/bundle.d.ts" />
"use strict";

import NicopediaIcon, {Type as NicopediaIconType} from "./NicopediaIcon";

import * as React from "react";
import {Option, Some, None} from "option-t";

namespace LastResBody {
    export interface Props {
        value: Option<string>;
    }
    export interface State {}
}

class LastResBody extends React.Component<LastResBody.Props, LastResBody.State> {
    static defaultProps = <LastResBody.Props> {
        value: undefined
    };
    static propsTypes = <React.ValidationMap<LastResBody.Props>> {
        value: React.PropTypes.object.isRequired
    };

    render() {
        const RD = React.DOM;

        return this.props.value.map(value => {
            return RD.div({className: "last-res-body"}, value);
        }).unwrapOr(null);
    }
}

export default LastResBody;
