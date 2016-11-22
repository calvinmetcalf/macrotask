let perf;

export class Deadline {
  constructor(limit = 10) {
    this.limit = limit;
    this.performance = Deadline.getPerformance();
    this.now = this.getTime();
  }
  getTime() {
    return this.performance ? global.performance.now() : Date.now();
  }
  timeRemaining() {
    const out = this.limit  - (this.getTime() - this.now);
    if (out > 0) {
      return out;
    }
    return 0;
  }
  static getPerformance() {
    if (perf === undefined) {
      perf = !!(global.performance && global.performance.now && typeof global.performance.now === 'function')
    }
    return perf;
  }

}
