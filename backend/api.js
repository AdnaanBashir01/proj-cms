import { readFile, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { randomUUID } from 'node:crypto';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DB_PATH = join(__dirname, 'db.json');

function send(res, status, payload) {
  res.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET,POST,PUT,PATCH,DELETE,OPTIONS',
  });
  res.end(payload === null ? '' : JSON.stringify(payload));
}

async function readDb() {
  return JSON.parse(await readFile(DB_PATH, 'utf8'));
}

async function saveDb(db) {
  await writeFile(DB_PATH, `${JSON.stringify(db, null, 2)}\n`, 'utf8');
}

async function readBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', (chunk) => {
      body += chunk;
      if (body.length > 8_000_000) {
        reject(new Error('Payload is too large'));
        req.destroy();
      }
    });
    req.on('end', () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch {
        reject(new Error('Invalid JSON body'));
      }
    });
    req.on('error', reject);
  });
}

/**
 * Browser-safe REST handler shared by the standalone API and the one-port
 * Vite development server. Every /api request is completed here.
 */
export async function handleApiRequest(req, res) {
  if (req.method === 'OPTIONS') {
    send(res, 204, null);
    return;
  }

  const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);

  if (url.pathname === '/api/health') {
    send(res, 200, { status: 'ok', service: 'storyline-api' });
    return;
  }

  const match = url.pathname.match(/^\/api\/articles(?:\/([^/]+))?$/);
  if (!match) {
    send(res, 404, { message: 'Endpoint not found' });
    return;
  }

  try {
    const db = await readDb();
    const id = match[1] ? decodeURIComponent(match[1]) : null;

    if (req.method === 'GET' && !id) {
      const articles = [...db.articles].sort(
        (a, b) => new Date(b.updatedAt) - new Date(a.updatedAt),
      );
      send(res, 200, articles);
      return;
    }

    if (req.method === 'GET' && id) {
      const article = db.articles.find((item) => item.id === id);
      send(res, article ? 200 : 404, article || { message: 'Article not found' });
      return;
    }

    if (req.method === 'POST' && !id) {
      const input = await readBody(req);
      if (!input.title?.trim() || !input.body?.trim()) {
        send(res, 400, { message: 'Title and content are required' });
        return;
      }
      const now = new Date().toISOString();
      const article = {
        ...input,
        id: `art-${randomUUID().slice(0, 8)}`,
        createdAt: now,
        updatedAt: now,
      };
      db.articles.unshift(article);
      await saveDb(db);
      send(res, 201, article);
      return;
    }

    const index = db.articles.findIndex((item) => item.id === id);
    if (index === -1) {
      send(res, 404, { message: 'Article not found' });
      return;
    }

    if (req.method === 'PUT') {
      const input = await readBody(req);
      if (!input.title?.trim() || !input.body?.trim()) {
        send(res, 400, { message: 'Title and content are required' });
        return;
      }
      db.articles[index] = {
        ...db.articles[index],
        ...input,
        id,
        createdAt: db.articles[index].createdAt,
        updatedAt: new Date().toISOString(),
      };
      await saveDb(db);
      send(res, 200, db.articles[index]);
      return;
    }

    if (req.method === 'PATCH') {
      const input = await readBody(req);
      db.articles[index] = {
        ...db.articles[index],
        ...input,
        id,
        createdAt: db.articles[index].createdAt,
        updatedAt: new Date().toISOString(),
      };
      await saveDb(db);
      send(res, 200, db.articles[index]);
      return;
    }

    if (req.method === 'DELETE') {
      db.articles.splice(index, 1);
      await saveDb(db);
      send(res, 204, null);
      return;
    }

    send(res, 405, { message: 'Method not allowed' });
  } catch (error) {
    console.error(error);
    if (!res.headersSent) {
      send(res, error.message === 'Payload is too large' ? 413 : 500, {
        message: error.message || 'Internal server error',
      });
    }
  }
}
