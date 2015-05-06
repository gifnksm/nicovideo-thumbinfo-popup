/// <reference path="../../../typings/common.d.ts" />
"use strict";

import AppDispatcher from "../../../src/dispatcher/AppDispatcher";
import {PayloadSources} from "../../../src/dispatcher/constants";

describe("dispatcher/AppDispatcher", () => {
    it("should be able to register and to unregister callback.", () => {
        let id = AppDispatcher.register(() => {});
        AppDispatcher.unregister(id);
    });

    it("should not call unregisterd callback.", () => {
        let called = 0;
        let id = AppDispatcher.register((payload) => { called += 1; });
        AppDispatcher.unregister(id);
        AppDispatcher.handleViewEvent(null);
        assert(called === 0);
    });

    it("should dispatch action with appropriate source when callback is registered.", () => {
        let called = 0;
        let expected: PayloadSources = null;
        let id = AppDispatcher.register((payload) => { called += 1; assert(expected === payload.source); });

        expected = PayloadSources.View;
        AppDispatcher.handleViewEvent(null);

        expected = PayloadSources.Store;
        AppDispatcher.handleStoreEvent(null);

        expected = PayloadSources.Server;
        AppDispatcher.handleServerEvent(null);

        AppDispatcher.unregister(id);
        assert(called);
    });
});
