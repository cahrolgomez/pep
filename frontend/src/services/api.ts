/** Cliente compartilhado para a API do PEP. */
export async function apiRequest<T>(path: string, options?: RequestInit): Promise<T> {
 const headers = new Headers(options?.headers);
 const token = sessionStorage.getItem('pep_token');
 if (token) headers.set('Authorization', `Bearer ${token}`);
 const response = await fetch(`/api/${path.replace(/^\//, '')}`, {...options, headers});
 if (!response.ok) {
  const error = await response.json().catch(() => null);
  const detail = error?.detail;
  throw new Error(typeof detail === "string" ? detail : response.status === 422
   ? "Confira os campos informados e tente novamente."
   : `Não foi possível concluir a solicitação (${response.status}).`);
 }
 if (response.status === 204) return undefined as T;
 return response.json() as Promise<T>;
}
