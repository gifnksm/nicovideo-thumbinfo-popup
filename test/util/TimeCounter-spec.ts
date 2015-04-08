/// <reference path="../..//target/typings/tsd.d.ts" />

import TimeCounter from "../../src/util/TimeCounter";
import * as assert from "power-assert";

describe("TimeCounter", () => {
    context("when timeout is finite positive number", () => {
        const Timeout = 100;
        const Now = [ -Infinity, -100, 0, 100, 109, 110, Infinity, NaN];

        context("when not started", () => {
            let tc: TimeCounter;
            beforeEach(() => {
                tc = new TimeCounter(Timeout);
            });

            it("should not timeout.", () => {
                for (let now of Now) {
                    assert(!tc.isTimeout(now));
                }
            });
            it("should have NaN left time.", () => {
                for (let now of Now) {
                    assert(isNaN(tc.getTimeLeft(now)));
                }
            });
        });

        context("when after started", () => {
            const Start: number = 10;
            let tc: TimeCounter;
            beforeEach(() => {
                tc = new TimeCounter(Timeout);
                tc.start(Start);
            });

            context("if (now - Start) < Timeout", () => {
                const FiltNow = Now.filter((t) => (t - Start) < Timeout);

                it("should not timeout.", () => {
                    for (let now of FiltNow) {
                        assert(!tc.isTimeout(now));
                    }
                });
                it("should have positive left time.", () => {
                    for (let now of FiltNow) {
                        assert(tc.getTimeLeft(now) > 0);
                    }
                });
            });

            context("if (now - Start) = Timeout", () => {
                const FiltNow = Now.filter((t) => (t - Start) == Timeout);
                it("should timeout.", () => {
                    for (let now of FiltNow) {
                        assert(tc.isTimeout(now));
                    }
                });
                it("should have zero left time.", () => {
                    for (let now of FiltNow) {
                        assert(tc.getTimeLeft(now) == 0);
                    }
                });
            });

            context("if (now - Start) > Timeout", () => {
                const FiltNow = Now.filter((t) => (t - Start) > Timeout);
                it("should timeout.", () => {
                    for (let now of FiltNow) {
                        assert(tc.isTimeout(now));
                    }
                });
                it("should have negative left time.", () => {
                    for (let now of FiltNow) {
                        assert(tc.getTimeLeft(now) < 0);
                    }
                });
            });

            context("if now is NaN", () => {
                it("should not timeout.", () => {
                    assert(!tc.isTimeout(NaN));
                });
                it("should have NaN left time.", () => {
                    assert(isNaN(tc.getTimeLeft(NaN)));
                });
            });
        });

        context("when after reset", () => {
            const Start: number = 10;
            let tc: TimeCounter;
            beforeEach(() => {
                tc = new TimeCounter(Timeout);
                tc.start(Start);
                tc.reset();
            });

            it("should not timeout.", () => {
                for (let now of Now) {
                    assert(!tc.isTimeout(now));
                }
            });
            it("should have NaN left time.", () => {
                for (let now of Now) {
                    assert(isNaN(tc.getTimeLeft(now)));
                }
            });
        });
    });
});
