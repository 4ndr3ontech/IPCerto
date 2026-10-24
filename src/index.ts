import { handleIpRequest } from './api/routes/ip';

export default {
  async fetch(request: Request, env: any, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);

    // Rota da API para consulta de IP
    if (url.pathname === '/api/ip' || url.pathname === '/api/ip/') {
      return handleIpRequest(request);
    }

    // Resposta padrão para rotas não encontradas na API
    if (url.pathname.startsWith('/api/')) {
      return new Response(JSON.stringify({ error: 'Endpoint não encontrado' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json;charset=UTF-8' }
      });
    }

    // Para arquivos estáticos, o Cloudflare Pages cuida diretamente
    return new Response('IPCerto Backend Running', { status: 200 });
  }
};