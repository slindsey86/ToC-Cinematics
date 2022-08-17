export class CallbackList<T extends (...rest: any[]) => unknown = () => unknown> {
  private cbs?: T[];
  private cbsLen: number = 0;

  public get callbacks() {
    return this.cbs;
  }

  constructor(...cbs: T[]) {
    cbs?.length && this.push(...cbs);
  }

  public add(...cbs: T[]) {
    this.push(...cbs);

    return () => {
      this.remove(...cbs);
    };
  }

  public remove(...cbs: T[]) {
    if (this.cbs) {
      for (const cb of cbs) {
        const i = this.cbs.indexOf(cb);
        if (i !== -1) {
          this.cbs.splice(i, 1);
          this.cbsLen--;
        }
      }
    }
  }

  public push(...cbs: T[]) {
    if (this.cbs === undefined) {
      this.cbs = [];
    }
    return (this.cbsLen = this.cbs.push(...cbs));
  }

  public callAllAndClear(...args: Parameters<T>) {
    if (this.cbs) {
      const cbs = [...this.cbs];
      const cbsLen = this.cbsLen;
      this.cbsLen = this.cbs.length = 0;
      for (let i = 0; i < cbsLen; i++) {
        cbs[i].apply(null, args);
      }
    }
  }

  public reverseCallAllAndClear(...args: Parameters<T>) {
    if (this.cbs) {
      const cbs = [...this.cbs];
      const cbsLen = this.cbsLen;
      this.cbsLen = this.cbs.length = 0;
      for (let i = cbsLen - 1; i >= 0; i--) {
        cbs[i].apply(null, args);
      }
    }
  }

  public callAll(...args: Parameters<T>) {
    if (this.cbs) {
      const cbs = [...this.cbs];
      const cbsLen = this.cbsLen;
      for (let i = 0; i < cbsLen; i++) {
        cbs[i].apply(null, args);
      }
    }
  }

  clear() {
    if (this.cbs) {
      this.cbs.length = this.cbsLen = 0;
    }
  }

  [Symbol.iterator]() {
    return this.cbs?.values() ?? [];
  }
}
