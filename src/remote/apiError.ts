class APIError {
  public error: string;

  constructor(message: string) {
    this.error = message;
  }
}

class HTTPError extends APIError {
  public readonly http = true;
  public readonly network = false;
  public readonly ok = false;
  public readonly err = true;
  public status: number;

  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

class NetworkError extends APIError {
  public readonly http = false;
  public readonly network = true;
  public readonly ok = false;
  public readonly err = true;

  constructor(message = "Unexpected network error") {
    super(message);
  }
}

class APIResponse<T> {
  public readonly ok = true;
  public readonly err = false;
  public data: T;
  public status: number;

  constructor(data: T, status: number) {
    this.data = data;
    this.status = status;
  }
}

type APIFetchResponse<T> = HTTPError | NetworkError | APIResponse<T>;

export { APIError, HTTPError, NetworkError, APIResponse };
export type { APIFetchResponse };
