import express from 'express';
import { createServer as createViteServer } from 'vite';
import fs from 'fs';
import path from 'path';

const isProduction = process.env.NODE_ENV === 'production';
const PORT = Number(process.env.PORT) || 3000;

async function startServer() {
  const app = express();
  app.use(express.json({ limit: '50mb' }));

  const DATA_DIR = path.resolve(process.cwd(), 'data');
  const DB_PATH = path.join(DATA_DIR, 'carsat_db.json');

  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }

  // API status check
  app.get('/api/health', (req, res) => {
    res.json({
      status: 'ok',
      service: 'CARSAT CCTV Base de Datos',
      timestamp: new Date().toISOString(),
      supervisorEmail: 'contacto.supervision.carsat@gmail.com',
      storageType: 'Central Cloud JSON File Server + Local Storage Cache',
    });
  });

  // Get full database
  app.get('/api/database', (req, res) => {
    try {
      if (fs.existsSync(DB_PATH)) {
        const fileContent = fs.readFileSync(DB_PATH, 'utf-8');
        return res.json(JSON.parse(fileContent));
      }
      return res.json(null);
    } catch (err) {
      console.error('Error reading carsat_db.json:', err);
      return res.status(500).json({ error: 'Error al leer la base de datos central.' });
    }
  });

  // Save / Sync full database
  app.post('/api/database', (req, res) => {
    // Eliminar Administrador
  app.delete('/api/administradores/:id', (req, res) => {
    try {
      const { id } = req.params;
      if (!fs.existsSync(DB_PATH)) {
        return res.status(404).json({ error: 'Base de datos no encontrada.' });
      }

      const fileContent = fs.readFileSync(DB_PATH, 'utf-8');
      const db = JSON.parse(fileContent);

      if (db.administrators) {
        db.administrators = db.administrators.filter((adm: any) => adm.id !== id);
        db.updatedAt = new Date().toISOString();
        fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2), 'utf-8');
        return res.json({ success: true, message: 'Administrador eliminado correctamente.' });
      }

      return res.status(400).json({ error: 'Estructura de administradores no válida.' });
    } catch (err) {
      console.error('Error al borrar administrador:', err);
      return res.status(500).json({ error: 'Error al eliminar administrador.' });
    }
  });
    try {
      const payload = {
        ...req.body,
        updatedAt: new Date().toISOString(),
      };
      fs.writeFileSync(DB_PATH, JSON.stringify(payload, null, 2), 'utf-8');
      return res.json({ success: true, timestamp: payload.updatedAt });
    } catch (err) {
      console.error('Error writing carsat_db.json:', err);
      return res.status(500).json({ error: 'Error al persistir la base de datos central.' });
    }
  });

  // Supervisor auth check endpoint
  app.post('/api/auth/supervisor', (req, res) => {
    const { email, pin } = req.body || {};
    const supervisorEmail = 'contacto.supervision.carsat@gmail.com';
    const normalizedInputEmail = (email || '').trim().toLowerCase();

    if (normalizedInputEmail !== supervisorEmail) {
      return res.status(403).json({
        success: false,
        error: 'Acceso denegado: Únicamente la cuenta autorizada (contacto.supervision.carsat@gmail.com) puede ingresar al Modo Supervisor.',
      });
    }

    // Clave de seguridad privada para Supervisor
    const validPin = 'C4r54t@2026'; // <-- Reemplaza con tu nueva contraseña
    if (pin && pin !== validPin) {
      return res.status(401).json({
        success: false,
        error: 'Clave de seguridad de supervisor incorrecta.',
      });
    }

    return res.json({
      success: true,
      email: supervisorEmail,
      role: 'SUPERVISOR',
      token: 'supervisor-token-' + Date.now(),
    });
  });

  // Vite middleware in dev or static files in production
  if (!isProduction) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[CARSAT CCTV] Servidor central corriendo en http://0.0.0.0:${PORT}`);
  });
}

startServer();
