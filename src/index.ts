/// <reference path="../typings/common.d.ts" />
"use strict";

import * as React from "react";
import NicoThumbinfo from "./nico_thumbinfo/components/Base";
import VideoKey from "./nico_thumbinfo/stores/VideoKey";

function render(key: VideoKey, parent: Element) {
    let div = document.createElement("div");
    React.render(React.createElement(NicoThumbinfo, { videoKey: key }), div);
    parent.appendChild(div);
}

GM_addStyle(GM_getResourceText("style"));

render(VideoKey.fromUrl("http://www.nicovideo.jp/watch/sm9").unwrap(), document.body);
render(VideoKey.fromUrl("http://www.nicovideo.jp/watch/1340979099").unwrap(), document.body);
render(VideoKey.fromUrl("http://www.nicovideo.jp/watch/1406548974").unwrap(), document.body);
