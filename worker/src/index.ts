/**
 * Cloudflare Worker API for Zero-Knowledge Vault
 * Handles R2 storage operations for encrypted data
 *
 * This worker only stores encrypted ciphertext - it never has access to:
 * - User passphrases
 * - Encryption keys
 * - Decrypted data
 */

export interface Env {
  VAULT_DATA: R2Bucket;
  ALLOWED_ORIGINS?: string;
}

// CORS headers for client requests
const CORS_HEADERS = {
  'Access-Control-Allow-Methods': 'GET, PUT, DELETE, HEAD, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Max-Age': '86400',
};

function corsHeaders(origin: string, allowedOrigins: string): HeadersInit {
  const allowed = allowedOrigins.split(',').map(o => o.trim());
  const isAllowed = allowed.includes(origin) || allowed.includes('*');

  return {
    ...CORS_HEADERS,
    'Access-Control-Allow-Origin': isAllowed ? origin : allowed[0],
  };
}

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);
    const origin = request.headers.get('Origin') || '';
    const allowedOrigins = env.ALLOWED_ORIGINS || 'http://localhost:3000';

    // Handle CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        status: 204,
        headers: corsHeaders(origin, allowedOrigins),
      });
    }

    try {
      // Health check endpoint
      if (url.pathname === '/health') {
        return new Response(
          JSON.stringify({
            status: 'ok',
            timestamp: new Date().toISOString(),
            version: '1.0.0',
          }),
          {
            headers: {
              'Content-Type': 'application/json',
              ...corsHeaders(origin, allowedOrigins),
            },
          }
        );
      }

      // R2 list endpoint
      if (url.pathname === '/r2/list' && request.method === 'GET') {
        const prefix = url.searchParams.get('prefix') || '';
        const limit = parseInt(url.searchParams.get('limit') || '1000', 10);
        const cursor = url.searchParams.get('cursor') || undefined;

        const listed = await env.VAULT_DATA.list({
          prefix,
          limit,
          cursor,
        });

        return new Response(
          JSON.stringify({
            objects: listed.objects.map(obj => ({
              key: obj.key,
              size: obj.size,
              etag: obj.etag,
              uploaded: obj.uploaded.toISOString(),
            })),
            truncated: listed.truncated,
            cursor: listed.cursor,
          }),
          {
            headers: {
              'Content-Type': 'application/json',
              ...corsHeaders(origin, allowedOrigins),
            },
          }
        );
      }

      // R2 object operations: /r2/{userId}/{itemId}/{version}.bin
      const r2Match = url.pathname.match(/^\/r2\/(.+)$/);
      if (r2Match) {
        const key = r2Match[1];

        // Validate key format (basic security check)
        if (!key.match(/^[a-zA-Z0-9@._\-\/]+\.bin$/)) {
          return new Response(
            JSON.stringify({ error: 'Invalid key format' }),
            {
              status: 400,
              headers: {
                'Content-Type': 'application/json',
                ...corsHeaders(origin, allowedOrigins),
              },
            }
          );
        }

        // GET - Download encrypted object
        if (request.method === 'GET') {
          const object = await env.VAULT_DATA.get(key);

          if (!object) {
            return new Response(
              JSON.stringify({ error: 'Object not found' }),
              {
                status: 404,
                headers: {
                  'Content-Type': 'application/json',
                  ...corsHeaders(origin, allowedOrigins),
                },
              }
            );
          }

          return new Response(object.body, {
            headers: {
              'Content-Type': 'application/octet-stream',
              'Content-Length': object.size.toString(),
              'ETag': object.etag,
              'Last-Modified': object.uploaded.toUTCString(),
              ...corsHeaders(origin, allowedOrigins),
            },
          });
        }

        // HEAD - Get object metadata
        if (request.method === 'HEAD') {
          const object = await env.VAULT_DATA.head(key);

          if (!object) {
            return new Response(null, {
              status: 404,
              headers: corsHeaders(origin, allowedOrigins),
            });
          }

          return new Response(null, {
            headers: {
              'Content-Type': 'application/octet-stream',
              'Content-Length': object.size.toString(),
              'ETag': object.etag,
              'Last-Modified': object.uploaded.toUTCString(),
              ...corsHeaders(origin, allowedOrigins),
            },
          });
        }

        // PUT - Upload encrypted object
        if (request.method === 'PUT') {
          const body = await request.arrayBuffer();

          if (!body || body.byteLength === 0) {
            return new Response(
              JSON.stringify({ error: 'Empty body' }),
              {
                status: 400,
                headers: {
                  'Content-Type': 'application/json',
                  ...corsHeaders(origin, allowedOrigins),
                },
              }
            );
          }

          const object = await env.VAULT_DATA.put(key, body, {
            httpMetadata: {
              contentType: 'application/octet-stream',
            },
          });

          return new Response(
            JSON.stringify({
              key,
              size: body.byteLength,
              etag: object.etag,
            }),
            {
              headers: {
                'Content-Type': 'application/json',
                ...corsHeaders(origin, allowedOrigins),
              },
            }
          );
        }

        // DELETE - Delete object
        if (request.method === 'DELETE') {
          await env.VAULT_DATA.delete(key);

          return new Response(
            JSON.stringify({ success: true }),
            {
              headers: {
                'Content-Type': 'application/json',
                ...corsHeaders(origin, allowedOrigins),
              },
            }
          );
        }
      }

      // 404 for unknown routes
      return new Response(
        JSON.stringify({ error: 'Not found' }),
        {
          status: 404,
          headers: {
            'Content-Type': 'application/json',
            ...corsHeaders(origin, allowedOrigins),
          },
        }
      );
    } catch (error) {
      console.error('Worker error:', error);
      return new Response(
        JSON.stringify({
          error: 'Internal server error',
          message: error instanceof Error ? error.message : 'Unknown error',
        }),
        {
          status: 500,
          headers: {
            'Content-Type': 'application/json',
            ...corsHeaders(origin, allowedOrigins),
          },
        }
      );
    }
  },
};
