/// <reference path="../typings/common.d.ts" />
"use strict";

import * as React from "react";
import NicoThumbinfo from "./nico_thumbinfo/components/Base";
import VideoKey from "./nico_thumbinfo/stores/VideoKey";
import AppDispatcher from "./dispatcher/AppDispatcher";

console.log(AppDispatcher.isDispatching());

let key = VideoKey.fromUrl("http://www.nicovideo.jp/watch/sm9").unwrap();
React.render(React.createElement(NicoThumbinfo, { videoKey: key }), document.body);
