/** Cliente compartilhado para os futuros endpoints da API. */
export async function apiRequest<T>(path: string, options?: RequestInit): Promise<T> {
 const response = await fetch(`/api/${path.replace(/^\//, '')}`, options);
 if (!response.ok) throw new Error(`Não foi possível concluir a solicitação (${response.status}).`);
 return response.json() as Promise<T>;
}
