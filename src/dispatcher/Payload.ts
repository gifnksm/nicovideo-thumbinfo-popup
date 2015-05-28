/// <reference path="../../typings/bundle.d.ts" />
"use strict";

import Action from "../actions/Action";

import {PayloadSources} from "./constants";

interface Payload {
    source: PayloadSources,
    action: Action
}

export default Payload;
