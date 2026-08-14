abstract class BaseError extends Error {
  constructor(message: string) {
    super(message);
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export class AuthenticationError extends BaseError {
  constructor(message: string = "User is not authenticated.") {
    super(message);
    this.name = "AuthenticationError";
  }
}

export class API_Error extends BaseError {
  constructor(status: number) {
    super(`API request failed: ${status}`);
    this.name = "API_Error";
  }
}

export class ClientArgumentError extends BaseError {
  constructor(field: string) {
    super(`Invalid argument provided for ${field}`);
    this.name = "ClientArgumentError";
  }
}
