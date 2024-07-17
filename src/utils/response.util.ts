interface Opts {
  message?: string;
}

export function responseWithData<T>(data: T, opts: Opts = {}) {
  return { data, ...opts };
}

export function responseWithToken<T>(payload: T, token: string, message?: string) {
  return { data: { ...payload, token }, message };
}
