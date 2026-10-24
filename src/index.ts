import { handleIpRequest } from './api/routes/ip';

export default {
  async fetch(request: Request, env: unknown, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);

    // Rota da API de IP
    if (url.pathname === '/api/ip' || url.pathname === '/api/ip/') {
      return handleIpRequest(request);
    }

    // Para qualquer outra rota, o Pages serve os ficheiros estáticos por defeito
    return new Response('Not Found', { status: 404 });
  },
};