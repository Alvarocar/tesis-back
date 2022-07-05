interface Opts {
  message?: string;
}

export function responseWithData<T>(data: T, opts: Opts = {}) {
  return { data, ...opts };
}
