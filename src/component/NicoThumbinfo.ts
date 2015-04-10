/// <reference path="../..//target/typings/tsd.d.ts" />

import * as React from "react";

interface Props {}
interface State {}

export class Component extends React.Component<Props, State> {
    public render() {
        return React.DOM.div(null, "Hello, This is thumbinfo!");
    }
}
