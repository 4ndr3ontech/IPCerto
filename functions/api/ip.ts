export interface IpResponse {
  ip: string;
  version: 'IPv4' | 'IPv6' | 'Unknown';
  timestamp: string;
}

export const onRequest: PagesFunction = async (context) => {
  const request = context.request;
  
  const cfConnectingIp = request.headers.get('cf-connecting-ip');
  const xForwardedFor = request.headers.get('x-forwarded-for');
  const xRealIp = request.headers.get('x-real-ip');

  let clientIp = cfConnectingIp || xRealIp || (xForwardedFor ? xForwardedFor.split(',')[0].trim() : null) || '127.0.0.1';
  clientIp = clientIp.replace(/[^a-zA-Z0-9.:]/g, '').slice(0, 45);

  let version: 'IPv4' | 'IPv6' | 'Unknown' = 'Unknown';
  if (clientIp.includes(':')) {
    version = 'IPv6';
  } else if (clientIp.includes('.')) {
    version = 'IPv4';
  }

  const responseData: IpResponse = {
    ip: clientIp,
    version,
    timestamp: new Date().toISOString()
  };

  const securityHeaders = {
    'Content-Type': 'application/json;charset=UTF-8',
    'Access-Control-Allow-Origin': '*',
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'X-XSS-Protection': '1; mode=block',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Content-Security-Policy': "default-src 'self'; script-src 'self' 'unsafe-inline'; object-src 'none';"
  };

  return new Response(JSON.stringify(responseData, null, 2), {
    status: 200,
    headers: securityHeaders
  });
};