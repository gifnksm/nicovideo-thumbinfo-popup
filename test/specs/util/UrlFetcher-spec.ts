/// <reference path="../../../typings/bundle.d.ts" />
"use strict";

import UrlFetcher, {Request} from "../../../src/util/UrlFetcher";

context("util/UrlFetcher", () => {
    it("should be able to send request.", () => {
        let fetcher = UrlFetcher.getInstance();
        let req = Request.get("/not_exist_url");
        return fetcher.fetch(req).then(resp => {
            assert(resp.status === 404);
        });
    });
});
