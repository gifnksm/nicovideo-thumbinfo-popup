/// <reference path="../../../typings/common.d.ts" />
"use strict";

import NicopediaIcon, {Type as NicopediaIconType} from "./NicopediaIcon";

import * as React from "react";

module LastResBody {
    export interface Props {
        value: string;
    }
    export interface State {}
}

class LastResBody extends React.Component<LastResBody.Props, LastResBody.State> {
    static defaultProps = <LastResBody.Props> {
        value: undefined
    };
    static propsTypes = <React.ValidationMap<LastResBody.Props>> {
        value: React.PropTypes.string.isRequired
    };

    render() {
        const RD = React.DOM;

        let value = this.props.value;
        if (value === undefined) {
            return null;
        }

        return RD.div({className: "last-res-body"}, value);
    }
}

export default LastResBody;
