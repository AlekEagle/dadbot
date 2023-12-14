export default class ReadableTime {
  private __milliseconds: number = 0;
  private __seconds: number = 0;
  private __minutes: number = 0;
  private __hours: number = 0;
  private __days: number = 0;

  get milliseconds(): number {
    return this.__milliseconds;
  }

  get seconds(): number {
    return this.__seconds;
  }

  get minutes(): number {
    return this.__minutes;
  }

  get hours(): number {
    return this.__hours;
  }

  get days(): number {
    return this.__days;
  }

  constructor(milliseconds: number) {
    milliseconds = Math.floor(milliseconds);
    this.__seconds = Math.floor(milliseconds / 1000);
    this.__milliseconds = milliseconds % 1000;
    this.__minutes = Math.floor(this.__seconds / 60);
    this.__seconds = this.__seconds % 60;
    this.__hours = Math.floor(this.__minutes / 60);
    this.__minutes = this.__minutes % 60;
    this.__days = Math.floor(this.__hours / 24);
    this.__hours = this.__hours % 24;
  }

  private doubleDigits(val: number): string {
    if (val < 10) return '0' + val;
    else return '' + val;
  }

  private quadDigits(val: number): string {
    if (val < 10) return '000' + val;
    else if (val < 100) return '00' + val;
    else if (val < 1000) return '0' + val;
    else return '' + val;
  }

  public toShorthand(): string {
    return `${this.days > 0 ? `${this.days} days ` : ''}${this.doubleDigits(
      this.hours,
    )}:${this.doubleDigits(this.minutes)}:${this.doubleDigits(
      this.seconds,
    )}.${this.quadDigits(this.milliseconds)}`;
  }

  public toLonghand(): string {
    return `${this.days > 0 ? `${this.days} days ` : ''}${
      this.hours > 0 ? `${this.hours} hours ` : ''
    }${this.minutes > 0 ? `${this.minutes} minutes ` : ''}${
      this.seconds > 0 ? `${this.seconds} seconds ` : ''
    }${this.milliseconds > 0 ? `${this.milliseconds} milliseconds ` : ''}`;
  }
}
