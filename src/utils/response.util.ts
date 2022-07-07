interface Opts {
  message?: string;
}

export function responseWithData<T>(data: T, opts: Opts = {}) {
  return { data, ...opts };
}

export function responseWithToken<T>(payload: T, token: string) {
  return { ...payload, token };
}
