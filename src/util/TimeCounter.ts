export default class TimeCounter {
    private startTime: number = NaN;
    private timeout: number;

    constructor(timeout: number) {
        this.timeout = timeout;
    }

    start(now: number) { this.startTime = now; }
    reset() { this.startTime = NaN; }
    isTimeout(now: number): boolean { return this.getTimeLeft(now) <= 0; }
    getTimeLeft(now: number): number { return this.timeout + this.startTime - now; }
}
