import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '15mb' }));

  // In-memory / server cloud database storage for scans and profiles
  const cloudDb = {
    syncedScans: [] as any[],
    registeredProfiles: [] as any[],
    lastSyncTimestamp: new Date().toISOString()
  };

  // API Routes FIRST

  // Health check
  app.get('/api/health', (req, res) => {
    res.json({
      status: 'ok',
      service: 'Codigo Vida Cloud Sync Service',
      timestamp: new Date().toISOString()
    });
  });

  // Cloud Sync Endpoint: Receives batch of offline scans from clients and persists to cloud
  app.post('/api/cloud-sync', (req, res) => {
    try {
      const { scans, clientTimestamp } = req.body;
      if (!Array.isArray(scans)) {
        return res.status(400).json({ error: 'Formato inválido: se esperaba array de scans' });
      }

      const syncedIds: string[] = [];
      const serverTimestamp = new Date().toISOString();

      scans.forEach((incomingScan: any) => {
        if (!incomingScan || !incomingScan.id) return;

        const existingIndex = cloudDb.syncedScans.findIndex(s => s.id === incomingScan.id);
        const record = {
          ...incomingScan,
          syncStatus: 'synced',
          syncedAt: serverTimestamp,
          cloudServerReceivedAt: serverTimestamp
        };

        if (existingIndex >= 0) {
          cloudDb.syncedScans[existingIndex] = record;
        } else {
          cloudDb.syncedScans.unshift(record);
        }

        syncedIds.push(incomingScan.id);
      });

      cloudDb.lastSyncTimestamp = serverTimestamp;

      console.log(`[CloudSync] Sincronizados ${syncedIds.length} registros con la nube a las ${serverTimestamp}`);

      return res.json({
        success: true,
        message: 'Registros sincronizados exitosamente con la nube de Código Vida',
        syncedIds,
        serverTimestamp,
        totalCloudRecords: cloudDb.syncedScans.length
      });
    } catch (err: any) {
      console.error('[CloudSync Error]', err);
      return res.status(500).json({ error: 'Error interno en el servidor de la nube' });
    }
  });

  // Get Cloud Scans
  app.get('/api/scans', (req, res) => {
    res.json({
      success: true,
      scans: cloudDb.syncedScans,
      count: cloudDb.syncedScans.length,
      lastSyncTimestamp: cloudDb.lastSyncTimestamp
    });
  });

  // Save/Upload new profile to cloud
  app.post('/api/profiles', (req, res) => {
    const profile = req.body;
    if (!profile || !profile.fullName) {
      return res.status(400).json({ error: 'Datos de perfil incompletos' });
    }
    cloudDb.registeredProfiles.unshift(profile);
    res.json({ success: true, profile });
  });

  // Vite middleware for development vs static build in production
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Código Vida Cloud Server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();
