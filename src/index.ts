/// <reference path="../typings/common.d.ts" />

import * as React from "react";
import NicoThumbinfo from "./nico_thumbinfo/component/Base";
import VideoKey from "./nico_thumbinfo/model/VideoKey";

console.log(VideoKey.fromUrl("http://www.nicovideo.jp/watch/sm9"));
React.render(React.createElement(NicoThumbinfo,{}), document.body);
