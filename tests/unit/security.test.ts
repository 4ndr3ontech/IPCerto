import { describe, it, expect } from 'vitest';
import { handleIpRequest } from '../../src/api/routes/ip';

describe('Módulo de Segurança - Testes Unitários', () => {
  it('Deve retornar os cabeçalhos de segurança HTTP obrigatórios', () => {
    const request = new Request('https://ipcerto.com/api/ip', {
      headers: {
        'cf-connecting-ip': '200.100.50.25'
      }
    });

    const response = handleIpRequest(request);
    
    expect(response.headers.get('X-Content-Type-Options')).toBe('nosniff');
    expect(response.headers.get('X-Frame-Options')).toBe('DENY');
    expect(response.headers.get('Referrer-Policy')).toBe('strict-origin-when-cross-origin');
  });

  it('Deve sanitizar caracteres indesejados nos cabeçalhos de IP', () => {
    const request = new Request('https://ipcerto.com/api/ip', {
      headers: {
        'cf-connecting-ip': '<script>alert(1)</script>192.168.1.1'
      }
    });

    const response = handleIpRequest(request);
    expect(response.status).toBe(200);
  });
});