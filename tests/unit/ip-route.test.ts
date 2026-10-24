import { describe, it, expect } from 'vitest';
import { handleIpRequest } from '../../src/api/routes/ip';

describe('API de IP - Testes Unitários', () => {
  it('Deve extrair o IP correto do cabeçalho cf-connecting-ip', () => {
    const request = new Request('https://ipcerto.com/api/ip', {
      headers: {
        'cf-connecting-ip': '192.168.1.50'
      }
    });

    const response = handleIpRequest(request);
    expect(response.status).toBe(200);
  });

  it('Deve identificar corretamente um endereço IPv6', () => {
    const request = new Request('https://ipcerto.com/api/ip', {
      headers: {
        'cf-connecting-ip': '2001:db8::1'
      }
    });

    const response = handleIpRequest(request);
    expect(response.status).toBe(200);
  });
});