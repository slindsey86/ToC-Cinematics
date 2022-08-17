export class EnchantmentCallbacksList<T extends (...rest: any[]) => unknown = () => unknown> {
  private cbs?: T[];
  private cbsLen: number = 0;

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

  public popAndCallAll($this: any, ...args: Parameters<T>) {
    if (this.cbs) {
      const cbs = [...this.cbs];
      const cbsLen = this.cbsLen;
      this.cbsLen = this.cbs.length = 0;
      for (let i = 0; i < cbsLen; i++) {
        cbs[i].apply($this, args);
      }
    }
  }

  public callAll($this: any, ...args: Parameters<T>) {
    if (this.cbs) {
      const cbs = [...this.cbs];
      const cbsLen = this.cbsLen;
      for (let i = 0; i < cbsLen; i++) {
        cbs[i].apply($this, args);
      }
    }
  }

  clear() {
    if (this.cbs) {
      this.cbs.length = this.cbsLen = 0;
    }
  }
}
