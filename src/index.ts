/// <reference path="../typings/common.d.ts" />

import * as React from "react";
import NicoThumbinfo from "./nico_thumbinfo/component/Base";
import VideoKey from "./nico_thumbinfo/model/VideoKey";

let key = VideoKey.fromUrl("http://www.nicovideo.jp/watch/sm9").unwrap();
React.render(React.createElement(NicoThumbinfo, { videoKey: key }), document.body);
