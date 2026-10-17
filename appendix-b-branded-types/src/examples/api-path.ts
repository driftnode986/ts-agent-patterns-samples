// #region api-path
type ApiVersion = 'v1' | 'v2';
type Resource = 'users' | 'threads' | 'messages';
type ApiPath = `/api/${ApiVersion}/${Resource}`;

function callApi(
  path: ApiPath,
  options?: RequestInit
): Promise<Response> {
  return fetch(`https://api.example.com${path}`, options);
}

callApi('/api/v1/users');     // OK
// @ts-expect-error 'v3' は ApiVersion に含まれないのでコンパイルエラー
callApi('/api/v3/threads');
// #endregion

export { callApi, type ApiPath };
