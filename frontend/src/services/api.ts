/** Cliente compartilhado para os futuros endpoints da API. */
export async function apiRequest<T>(path: string, options?: RequestInit): Promise<T> {
 const headers = new Headers(options?.headers);
 const token = sessionStorage.getItem('pep_token');
 if (token) headers.set('Authorization', `Bearer ${token}`);
 const response = await fetch(`/api/${path.replace(/^\//, '')}`, {...options, headers});
 if (!response.ok) throw new Error(`Não foi possível concluir a solicitação (${response.status}).`);
 return response.json() as Promise<T>;
}
