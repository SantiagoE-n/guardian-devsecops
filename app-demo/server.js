// App demo de Guardian.
// Su unico proposito es estar viva para poder tumbarla y ver como reacciona
// el Flujo 2. Usa axios 0.21.0 a proposito: ese CVE ya esta registrado en
// Qdrant desde el Flujo 1, lo que permite demostrar la correlacion real.

const express = require('express');
const axios = require('axios');

const app = express();
const PORT = 3000;
const INICIO = new Date();

app.get('/', (req, res) => {
  res.json({
    servicio: 'guardian-app-demo',
    estado: 'operativo',
    arriba_desde: INICIO.toISOString()
  });
});

// Endpoint que Docker usa como healthcheck
app.get('/health', (req, res) => {
  res.json({ ok: true, uptime_segundos: Math.floor(process.uptime()) });
});

// Endpoint que usa axios (la dependencia vulnerable) para que aparezca
// en los logs y el agente pueda relacionarlo con el CVE guardado
app.get('/fetch', async (req, res) => {
  try {
    console.log('[app] petición saliente con axios 0.21.0');
    const r = await axios.get('https://api.github.com/zen', { timeout: 5000 });
    res.json({ ok: true, dato: r.data });
  } catch (err) {
    console.error('[app] error en la petición con axios:', err.message);
    res.status(502).json({ ok: false, error: err.message });
  }
});

// FALLO CONTROLADO — esto es lo que disparas en la demo.
// Simula un crash por consumo de memoria en la ruta que usa axios.
app.get('/crash', (req, res) => {
  console.error('[app] FATAL: heap out of memory al procesar respuesta de axios@0.21.0');
  console.error('[app] stack: at processResponse (node_modules/axios/lib/adapters/http.js:284)');
  console.error('[app] el proceso terminará con código 1');
  res.status(500).json({ ok: false, error: 'crash provocado' });
  // Salimos con codigo distinto de 0 para que Docker lo marque como fallo
  setTimeout(() => process.exit(1), 200);
});

app.listen(PORT, () => {
  console.log(`[app] guardian-app-demo escuchando en el puerto ${PORT}`);
  console.log(`[app] dependencias: express@4.17.1, axios@0.21.0`);
});
