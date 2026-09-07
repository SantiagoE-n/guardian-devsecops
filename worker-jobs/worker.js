// worker-jobs — procesador de tareas en segundo plano.
// Falla por AGOTAMIENTO DE MEMORIA, no por un error de codigo.
// Docker lo mata con SIGKILL y el contenedor sale con codigo 137.
//
// Usa minimist@1.2.0, que tiene CVE-2021-44906 (prototype pollution).
// Ese CVE queda registrado por el Flujo 1, asi que el post-mortem
// podra correlacionarlo.

const express = require('express');
const minimist = require('minimist');

const app = express();
const PORT = 3001;
const cola = [];

app.get('/', (req, res) => {
  res.json({ servicio: 'worker-jobs', tareas_en_cola: cola.length });
});

app.get('/health', (req, res) => {
  const mb = Math.round(process.memoryUsage().heapUsed / 1024 / 1024);
  res.json({ ok: true, memoria_mb: mb, cola: cola.length });
});

// Procesa un "job" usando minimist para parsear sus argumentos
app.get('/job', (req, res) => {
  const args = minimist(String(req.query.args ?? '--tipo=normal').split(' '));
  console.log(`[worker] procesando job con minimist@1.2.0: ${JSON.stringify(args)}`);
  res.json({ ok: true, args });
});

// FALLO CONTROLADO: fuga de memoria.
// El contenedor tiene un limite de 96 MB; al superarlo, Docker lo mata.
app.get('/leak', (req, res) => {
  console.error('[worker] ALERTA: la cola de trabajos crece sin control');
  console.error('[worker] cada job retiene su payload en memoria - posible fuga');
  res.json({ ok: false, mensaje: 'fuga de memoria iniciada' });

  const bomba = setInterval(() => {
    cola.push(Buffer.alloc(5 * 1024 * 1024, 'x'));
    const mb = Math.round(process.memoryUsage().heapUsed / 1024 / 1024);
    console.error(`[worker] heap en ${mb} MB - cola con ${cola.length} elementos sin liberar`);
    if (cola.length > 200) clearInterval(bomba);
  }, 150);
});

app.listen(PORT, () => {
  console.log(`[worker] guardian-worker-jobs escuchando en el puerto ${PORT}`);
  console.log(`[worker] dependencias: express@4.17.1, minimist@1.2.0`);
  console.log(`[worker] limite de memoria del contenedor: 96 MB`);
});
