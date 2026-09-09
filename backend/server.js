import { createServer } from 'node:http';
import { handleApiRequest } from './api.js';

const PORT = process.env.API_PORT || 4001;
const server = createServer((req, res) => handleApiRequest(req, res));

server.listen(PORT, '0.0.0.0', () => {
  console.log(`Storyline API ready on http://0.0.0.0:${PORT}`);
});
