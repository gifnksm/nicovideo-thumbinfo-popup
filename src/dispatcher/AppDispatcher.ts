/// <reference path="../../typings/bundle.d.ts" />
"use strict";

import {Dispatcher} from "flux";

import Action from "../actions/Action";

import Payload from "./Payload";
import {PayloadSources} from "./constants";

export interface AppDispatcherInterface {
    handleViewEvent(action: Action): void;
    handleStoreEvent(action: Action): void;
    handleServerEvent(action: Action): void;

    register(callback: (payload: Payload) => void): string;
    unregister(id: string): void;
    waitFor(ids: string[]): void;
    isDispatching(): boolean;
}

class AppDispatcher implements AppDispatcherInterface {
    private _dispatcher: Dispatcher<Payload> = new Dispatcher<Payload>();

    private _handleEvent(source: PayloadSources, action: Action) {
        this._dispatcher.dispatch({source: source, action: action});
    }

    handleViewEvent(action: Action) {
        this._handleEvent(PayloadSources.View, action);
    }
    handleStoreEvent(action: Action) {
        this._handleEvent(PayloadSources.Store, action);
    }
    handleServerEvent(action: Action) {
        this._handleEvent(PayloadSources.Server, action);
    }

    register(callback: (payload: Payload) => void) {
        return this._dispatcher.register(callback);
    }

    unregister(id: string) {
        return this._dispatcher.unregister(id);
    }

    waitFor(ids: string[]) {
        return this._dispatcher.waitFor(ids);
    }

    isDispatching() {
        return this._dispatcher.isDispatching();
    }
}

const dispatcher = new AppDispatcher();
export default dispatcher;
