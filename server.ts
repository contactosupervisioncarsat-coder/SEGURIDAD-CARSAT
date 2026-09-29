import express from 'express';
import { createServer as createViteServer } from 'vite';
import { createClient } from '@supabase/supabase-js';
import path from 'path';

const isProduction = process.env.NODE_ENV === 'production';
const PORT = Number(process.env.PORT) || 3000;

// Configuración de Supabase tomada de variables de entorno (Render / .env)
const SUPABASE_URL = process.env.SUPABASE_URL || '';
const SUPABASE_KEY = process.env.SUPABASE_KEY || '';

const supabase = (SUPABASE_URL && SUPABASE_KEY) 
  ? createClient(SUPABASE_URL, SUPABASE_KEY) 
  : null;

async function startServer() {
  const app = express();
  app.use(express.json({ limit: '50mb' }));

  // Comprobación del estado de la API
  app.get('/api/health', (req, res) => {
    res.json({
      status: 'ok',
      service: 'CARSAT CCTV Base de Datos',
      timestamp: new Date().toISOString(),
      supervisorEmail: 'contacto.supervision.carsat@gmail.com',
      storageType: 'Supabase Cloud Database (PostgreSQL)',
    });
  });

  // 1. Obtener la base de datos completa desde Supabase
  app.get('/api/database', async (req, res) => {
    try {
      if (!supabase) {
        console.error('Supabase no está configurado (faltan variables SUPABASE_URL o SUPABASE_KEY).');
        return res.status(500).json({ error: 'Supabase no está configurado correctamente.' });
      }

      const { data, error } = await supabase
        .from('carsat_data')
        .select('content')
        .eq('id', 'main_db')
        .single();

      if (error) {
        // Si no existe la fila inicial, devolvemos null
        if (error.code === 'PGRST116') {
          return res.json(null);
        }
        throw error;
      }

      return res.json(data ? data.content : null);
    } catch (err) {
      console.error('Error al leer desde Supabase:', err);
      return res.status(500).json({ error: 'Error al leer la base de datos central.' });
    }
  });

  // 2. Guardar / Sincronizar la base de datos completa en Supabase
  app.post('/api/database', async (req, res) => {
    try {
      if (!supabase) {
        return res.status(500).json({ error: 'Supabase no está configurado correctamente.' });
      }

      const payload = {
        ...req.body,
        updatedAt: new Date().toISOString(),
      };

      const { error } = await supabase
        .from('carsat_data')
        .upsert({ 
          id: 'main_db', 
          content: payload, 
          updated_at: new Date().toISOString() 
        });

      if (error) throw error;

      return res.json({ success: true, timestamp: payload.updatedAt });
    } catch (err) {
      console.error('Error al guardar en Supabase:', err);
      return res.status(500).json({ error: 'Error al persistir la base de datos central.' });
    }
  });

  // 3. Eliminar Administrador
  app.delete('/api/administradores/:id', async (req, res) => {
    try {
      if (!supabase) {
        return res.status(500).json({ error: 'Supabase no está configurado correctamente.' });
      }

      const { id } = req.params;

      // Obtener el contenido actual
      const { data, error: fetchError } = await supabase
        .from('carsat_data')
        .select('content')
        .eq('id', 'main_db')
        .single();

      if (fetchError || !data) {
        return res.status(404).json({ error: 'Base de datos no encontrada.' });
      }

      const db = data.content;

      if (db && db.administrators) {
        db.administrators = db.administrators.filter((adm: any) => adm.id !== id);
        db.updatedAt = new Date().toISOString();

        // Guardar lista actualizada
        const { error: updateError } = await supabase
          .from('carsat_data')
          .upsert({ 
            id: 'main_db', 
            content: db, 
            updated_at: new Date().toISOString() 
          });

        if (updateError) throw updateError;

        return res.json({ success: true, message: 'Administrador eliminado correctamente.' });
      }

      return res.status(400).json({ error: 'Estructura de administradores no válida.' });
    } catch (err) {
      console.error('Error al borrar administrador:', err);
      return res.status(500).json({ error: 'Error al eliminar administrador.' });
    }
  });

  // 4. Verificación de Supervisor
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

    // Clave de seguridad de supervisor
    const validPin = '0099';
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

  // Configuración de Vite o estáticos en producción
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
    console.log(`[CARSAT CCTV] Servidor central corriendo en puerto ${PORT}`);
  });
}

startServer();