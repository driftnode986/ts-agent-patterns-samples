// src/types/result.ts
type Success<T> = { ok: true; value: T };
type Failure<E> = { ok: false; error: E };
type Result<T, E = Error> = Success<T> | Failure<E>;

function success<T>(value: T): Success<T> {
  return { ok: true, value };
}

function failure<E>(error: E): Failure<E> {
  return { ok: false, error };
}
