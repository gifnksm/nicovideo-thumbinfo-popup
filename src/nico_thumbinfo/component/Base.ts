/// <reference path="../../../typings/common.d.ts" />

import * as React from "react";

module Component {
    export interface Props {}
    export interface State {}
}

class Component extends React.Component<Component.Props, Component.State> {
    public render() {
        return React.DOM.div(null, "Hello, This is thumbinfo!");
    }
}

export default Component;
