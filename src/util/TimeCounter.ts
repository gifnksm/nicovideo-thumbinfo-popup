export default class TimeCounter {
    private _startTime: number = NaN;
    private _timeout: number;

    constructor(timeout: number) {
        this._timeout = timeout;
    }

    start(now: number) { this._startTime = now; }
    reset() { this._startTime = NaN; }
    isTimeout(now: number): boolean { return this.getTimeLeft(now) <= 0; }
    getTimeLeft(now: number): number { return this._timeout + this._startTime - now; }
}
