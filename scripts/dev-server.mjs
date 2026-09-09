import { createServer as createHttpServer } from 'node:http';
import { createServer as createViteServer } from 'vite';
import { handleApiRequest } from '../backend/api.js';

const PORT = Number(process.env.STORYLINE_PORT || 3000);
const httpServer = createHttpServer();
const vite = await createViteServer({
  server: {
    middlewareMode: true,
    allowedHosts: true,
    ws: { server: httpServer },
  },
  appType: 'spa',
});

httpServer.on('request', async (req, res) => {
  if (req.url === '/api' || req.url?.startsWith('/api/')) {
    await handleApiRequest(req, res);
    return;
  }

  vite.middlewares(req, res, (error) => {
    if (error) {
      console.error(error);
      if (!res.headersSent) {
        res.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' });
        res.end('Development server error');
      }
    }
  });
});

httpServer.listen(PORT, '0.0.0.0', () => {
  console.log(`Open Storyline CMS: http://127.0.0.1:${PORT}`);
  console.log(`Server listening on all interfaces at port ${PORT}; frontend and REST API share this port.`);
});

async function shutdown() {
  await vite.close();
  httpServer.close(() => process.exit(0));
}

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
