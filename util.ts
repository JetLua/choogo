export function ok<T>(result: T): [T, null] {
  return [result, null]
}

export function error(err: Error): [null, Error] {
  return [null, err]
}
