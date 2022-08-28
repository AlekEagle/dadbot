export class DentInChairError extends Error {
  public constructor() {
    super('My chair has a dent in it! How Could you!?');
    Object.setPrototypeOf(this, DentInChairError.prototype);
    this.name = 'DentInChairError';
  }
}
