// Servidor estático mínimo para os testes (rota desconhecida cai no index.html).
// Uso: node e2e/serve.mjs <pasta> <porta>
import { createServer } from "http";
import { readFile } from "fs/promises";
import { extname, join, normalize } from "path";

const [dir, port] = [process.argv[2], Number(process.argv[3])];
const TYPES = { ".html": "text/html", ".js": "text/javascript", ".css": "text/css", ".json": "application/json", ".png": "image/png", ".ico": "image/x-icon", ".ttf": "font/ttf" };

createServer(async (req, res) => {
  const path = normalize(decodeURIComponent(new URL(req.url, "http://x").pathname)).replace(/^[/\\]+/, "");
  if (path.split(/[/\\]/).includes("..")) return res.writeHead(400).end();
  for (const file of [join(dir, path), join(dir, "index.html")]) {
    try {
      const body = await readFile(file);
      res.writeHead(200, { "Content-Type": TYPES[extname(file)] ?? "application/octet-stream" });
      return res.end(body);
    } catch {}
  }
  res.writeHead(404).end();
}).listen(port, () => console.log(`servindo ${dir} em http://localhost:${port}`));
