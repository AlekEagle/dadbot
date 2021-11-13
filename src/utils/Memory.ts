export default class Memory {
  private memory: number;

  constructor(memory: number = process.memoryUsage().rss) {
    this.memory = memory;
  }

  raw() {
    return this.memory;
  }

  stringify() {
    if (this.memory / 1024 / 1024 / 1024 > 1024)
      return `${(this.memory / 1024 / 1024 / 1024 / 1024)
        .toString()
        .slice(
          0,
          (this.memory / 1024 / 1024 / 1024 / 1024).toString().indexOf('.') + 3
        )}TB`;
    else if (this.memory / 1024 / 1024 > 1024)
      return `${(this.memory / 1024 / 1024 / 1024)
        .toString()
        .slice(
          0,
          (this.memory / 1024 / 1024 / 1024).toString().indexOf('.') + 3
        )}GB`;
    else if (this.memory / 1024 > 1024)
      return `${(this.memory / 1024 / 1024)
        .toString()
        .slice(0, (this.memory / 1024 / 1024).toString().indexOf('.') + 3)}MB`;
    else if (this.memory > 1024)
      return `${(this.memory / 1024)
        .toString()
        .slice(0, (this.memory / 1024).toString().indexOf('.') + 3)}KB`;
    else return `${this.memory}B`;
  }
}
