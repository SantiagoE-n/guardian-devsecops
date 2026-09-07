// clean-service — PRUEBA DE CONTROL.
//
// Este servicio NO tiene dependencias externas, por lo tanto no tiene
// ninguna vulnerabilidad registrada en Qdrant.
//
// Cuando falle, el post-mortem debe decir que NO encontro vulnerabilidades
// relacionadas. Esa es la prueba de que Guardian discrimina: correlaciona
// cuando hay relacion real y se abstiene cuando no la hay.

const http = require('http');
const PORT = 3002;

const server = http.createServer((req, res) => {
  res.setHeader('Content-Type', 'application/json');

  if (req.url === '/health') {
    res.writeHead(200);
    return res.end(JSON.stringify({ ok: true, uptime: Math.floor(process.uptime()) }));
  }

  if (req.url === '/crash') {
    console.error('[clean] error de configuracion: variable DB_HOST no definida');
    console.error('[clean] no se puede establecer conexion con la base de datos');
    console.error('[clean] terminando el proceso con codigo 1');
    res.writeHead(500);
    res.end(JSON.stringify({ ok: false, error: 'fallo de configuracion' }));
    return setTimeout(() => process.exit(1), 200);
  }

  res.writeHead(200);
  res.end(JSON.stringify({ servicio: 'clean-service', dependencias: 'ninguna' }));
});

server.listen(PORT, () => {
  console.log(`[clean] guardian-clean-service escuchando en el puerto ${PORT}`);
  console.log(`[clean] sin dependencias externas - sin superficie de ataque conocida`);
});
