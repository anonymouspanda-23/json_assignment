export class NotFoundError extends Error {
  public statusCode: number;

  constructor(message: string) {
    super(message);

    this.name = 'NotFoundError';
    this.statusCode = 404;

    Object.setPrototypeOf(this, NotFoundError.prototype);
  }
}