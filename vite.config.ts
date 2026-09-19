import { defineConfig, Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import fs from 'fs';
import path from 'path';

function lanSyncPlugin(): Plugin {
  const dbPath = path.resolve(__dirname, 'local_bakery_db.json');
  const songsDbPath = path.resolve(__dirname, 'local_bakery_songs.json');
  const uploadsAudioDir = path.resolve(__dirname, 'public/uploads/songs');
  const uploadsProductDir = path.resolve(__dirname, 'public/uploads/products');

  // Ensure directories and files exist
  if (!fs.existsSync(uploadsAudioDir)) {
    fs.mkdirSync(uploadsAudioDir, { recursive: true });
  }
  if (!fs.existsSync(uploadsProductDir)) {
    fs.mkdirSync(uploadsProductDir, { recursive: true });
  }
  if (!fs.existsSync(songsDbPath)) {
    fs.writeFileSync(songsDbPath, '[]', 'utf-8');
  }

  const clients = new Set<any>();

  // Safe JSON write to avoid Windows renameSync file lock errors
  const safeWrite = (filePath: string, jsonString: string) => {
    try {
      fs.writeFileSync(filePath, jsonString, 'utf-8');
    } catch (err) {
      console.error('Error writing file synchronously:', filePath, err);
      try {
        const tmpPath = `${filePath}.tmp`;
        fs.writeFileSync(tmpPath, jsonString, 'utf-8');
        fs.copyFileSync(tmpPath, filePath);
        fs.unlinkSync(tmpPath);
      } catch (fallbackErr) {
        console.error('Fallback file write failed:', fallbackErr);
      }
    }
  };

  const getDbData = () => {
    try {
      if (fs.existsSync(dbPath)) {
        const raw = fs.readFileSync(dbPath, 'utf-8');
        if (raw && raw.trim().length > 0 && !raw.startsWith('\0')) {
          return JSON.parse(raw);
        }
      }
    } catch (e) {
      console.warn('Error reading local_bakery_db.json:', e);
    }
    return null;
  };

  const getSongsData = (): any[] => {
    try {
      if (fs.existsSync(songsDbPath)) {
        const raw = fs.readFileSync(songsDbPath, 'utf-8');
        if (raw && raw.trim().length > 0 && !raw.startsWith('\0')) {
          const parsed = JSON.parse(raw);
          return Array.isArray(parsed) ? parsed : [];
        }
      }
    } catch (e) {
      console.warn('Error reading local_bakery_songs.json:', e);
    }
    return [];
  };

  const broadcastEvent = (eventType: string, extraData: any = {}) => {
    const message = `data: ${JSON.stringify({ type: eventType, ...extraData })}\n\n`;
    for (const client of clients) {
      try {
        client.write(message);
      } catch (e) {
        clients.delete(client);
      }
    }
  };

  return {
    name: 'lan-sync-plugin',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        // Allow CORS for all API calls
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, DELETE');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

        if (req.method === 'OPTIONS') {
          res.writeHead(204);
          res.end();
          return;
        }

        // SSE Events stream for instant LAN updates
        if (req.url === '/api/lan-events') {
          res.writeHead(200, {
            'Content-Type': 'text/event-stream',
            'Cache-Control': 'no-cache',
            'Connection': 'keep-alive',
          });
          res.write('data: {"type":"CONNECTED"}\n\n');
          clients.add(res);
          req.on('close', () => clients.delete(res));
          return;
        }

        // GET local DB
        if (req.url === '/api/lan-sync' && req.method === 'GET') {
          res.writeHead(200, { 'Content-Type': 'application/json' });
          const dbData = getDbData();
          if (dbData) {
            dbData.customSongs = getSongsData();
            res.end(JSON.stringify(dbData));
          } else {
            res.end(JSON.stringify({ exists: false, customSongs: getSongsData() }));
          }
          return;
        }

        // POST local DB (Smart Merge by ID to prevent race condition overwrites)
        if (req.url === '/api/lan-sync' && req.method === 'POST') {
          let body = '';
          req.on('data', (chunk) => {
            body += chunk;
          });
          req.on('end', () => {
            try {
              const incoming = JSON.parse(body);
              const currentDb = getDbData() || {};

              // 1. Merge sales by id so sales never get deleted by a sync push!
              const salesMap = new Map();
              (currentDb.sales || []).forEach((s: any) => { if (s && s.id) salesMap.set(s.id, s); });
              (incoming.sales || []).forEach((s: any) => { if (s && s.id) salesMap.set(s.id, s); });
              const mergedSales = Array.from(salesMap.values()).sort(
                (a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
              );

              // 2. Merge expenses by id
              const expensesMap = new Map();
              (currentDb.expenses || []).forEach((e: any) => { if (e && e.id) expensesMap.set(e.id, e); });
              (incoming.expenses || []).forEach((e: any) => { if (e && e.id) expensesMap.set(e.id, e); });
              const mergedExpenses = Array.from(expensesMap.values()).sort(
                (a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
              );

              // 3. Merge customOrders by id
              const ordersMap = new Map();
              (currentDb.customOrders || []).forEach((o: any) => { if (o && o.id) ordersMap.set(o.id, o); });
              (incoming.customOrders || []).forEach((o: any) => { if (o && o.id) ordersMap.set(o.id, o); });
              const mergedOrders = Array.from(ordersMap.values()).sort(
                (a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
              );

              // 4. Merge products
              const productsMap = new Map();
              (currentDb.products || []).forEach((p: any) => { if (p && p.id) productsMap.set(p.id, p); });
              (incoming.products || []).forEach((p: any) => { if (p && p.id) productsMap.set(p.id, p); });
              const mergedProducts = Array.from(productsMap.values());

              const mergedDb = {
                ...currentDb,
                ...incoming,
                products: mergedProducts.length > 0 ? mergedProducts : incoming.products || currentDb.products || [],
                sales: mergedSales,
                expenses: mergedExpenses,
                customOrders: mergedOrders,
                storeInfo: incoming.storeInfo
                  ? {
                      ...(currentDb.storeInfo || {}),
                      ...incoming.storeInfo,
                      logoUrl: (incoming.storeInfo.logoUrl !== undefined && incoming.storeInfo.logoUrl !== '')
                        ? incoming.storeInfo.logoUrl
                        : (currentDb.storeInfo?.logoUrl || ''),
                      khqrQrImage: (incoming.storeInfo.khqrQrImage !== undefined && incoming.storeInfo.khqrQrImage !== '')
                        ? incoming.storeInfo.khqrQrImage
                        : (currentDb.storeInfo?.khqrQrImage || ''),
                    }
                  : currentDb.storeInfo,
                flavors: Array.isArray(incoming.flavors) && incoming.flavors.length > 0 ? incoming.flavors : currentDb.flavors,
              };

              safeWrite(dbPath, JSON.stringify(mergedDb, null, 2));

              res.writeHead(200, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify({ success: true, salesCount: mergedSales.length }));

              // Broadcast update to all connected phones/PCs
              broadcastEvent('SYNC_UPDATE');
            } catch (err: any) {
              res.writeHead(500, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify({ error: err.message }));
            }
          });
          return;
        }

        // POST Delete Single Expense (Atomic)
        if (req.url === '/api/delete-expense' && req.method === 'POST') {
          let body = '';
          req.on('data', (chunk) => { body += chunk; });
          req.on('end', () => {
            try {
              const { id } = JSON.parse(body);
              const dbData = getDbData() || {};
              if (Array.isArray(dbData.expenses)) {
                dbData.expenses = dbData.expenses.filter((e: any) => e.id !== id);
              }
              safeWrite(dbPath, JSON.stringify(dbData, null, 2));
              res.writeHead(200, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify({ success: true, deletedId: id }));
              broadcastEvent('SYNC_UPDATE');
            } catch (err: any) {
              res.writeHead(500, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify({ error: err.message }));
            }
          });
          return;
        }

        // POST Clear All Expenses
        if (req.url === '/api/clear-all-expenses' && req.method === 'POST') {
          try {
            const dbData = getDbData() || {};
            dbData.expenses = [];
            safeWrite(dbPath, JSON.stringify(dbData, null, 2));
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ success: true }));
            broadcastEvent('SYNC_UPDATE');
          } catch (err: any) {
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: err.message }));
          }
          return;
        }

        // POST Delete Single Sale (Atomic)
        if (req.url === '/api/delete-sale' && req.method === 'POST') {
          let body = '';
          req.on('data', (chunk) => { body += chunk; });
          req.on('end', () => {
            try {
              const { id } = JSON.parse(body);
              const dbData = getDbData() || {};
              if (Array.isArray(dbData.sales)) {
                dbData.sales = dbData.sales.filter((s: any) => s.id !== id);
              }
              safeWrite(dbPath, JSON.stringify(dbData, null, 2));
              res.writeHead(200, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify({ success: true, deletedId: id }));
              broadcastEvent('SYNC_UPDATE');
            } catch (err: any) {
              res.writeHead(500, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify({ error: err.message }));
            }
          });
          return;
        }

        // POST Clear All Sales
        if (req.url === '/api/clear-all-sales' && req.method === 'POST') {
          try {
            const dbData = getDbData() || {};
            dbData.sales = [];
            safeWrite(dbPath, JSON.stringify(dbData, null, 2));
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ success: true }));
            broadcastEvent('SYNC_UPDATE');
          } catch (err: any) {
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: err.message }));
          }
          return;
        }

        // POST Save Single Sale (Atomic & Instant)
        if (req.url === '/api/save-sale' && req.method === 'POST') {
          let body = '';
          req.on('data', (chunk) => { body += chunk; });
          req.on('end', () => {
            try {
              const { sale, updatedProducts } = JSON.parse(body);
              if (!sale) {
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'Missing sale object' }));
                return;
              }
              const dbData = getDbData() || {};
              if (!Array.isArray(dbData.sales)) dbData.sales = [];
              dbData.sales = [sale, ...dbData.sales.filter((s: any) => s.id !== sale.id)];

              if (Array.isArray(updatedProducts) && updatedProducts.length > 0) {
                dbData.products = updatedProducts;
              }

              safeWrite(dbPath, JSON.stringify(dbData, null, 2));
              res.writeHead(200, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify({ success: true, saleId: sale.id }));
              broadcastEvent('SYNC_UPDATE');
            } catch (err: any) {
              res.writeHead(500, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify({ error: err.message }));
            }
          });
          return;
        }

        // POST Save Single Expense (Atomic & Instant)
        if (req.url === '/api/save-expense' && req.method === 'POST') {
          let body = '';
          req.on('data', (chunk) => { body += chunk; });
          req.on('end', () => {
            try {
              const { expense } = JSON.parse(body);
              if (!expense) {
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'Missing expense object' }));
                return;
              }
              const dbData = getDbData() || {};
              if (!Array.isArray(dbData.expenses)) dbData.expenses = [];
              dbData.expenses = [expense, ...dbData.expenses.filter((e: any) => e.id !== expense.id)];
              safeWrite(dbPath, JSON.stringify(dbData, null, 2));
              res.writeHead(200, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify({ success: true, expenseId: expense.id }));
              broadcastEvent('SYNC_UPDATE');
            } catch (err: any) {
              res.writeHead(500, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify({ error: err.message }));
            }
          });
          return;
        }

        // POST Save Single Product (Atomic & Instant)
        if (req.url === '/api/save-product' && req.method === 'POST') {
          let body = '';
          req.on('data', (chunk) => { body += chunk; });
          req.on('end', () => {
            try {
              const { product } = JSON.parse(body);
              if (!product || !product.id) {
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'Missing product object or product.id' }));
                return;
              }
              const dbData = getDbData() || {};
              if (!Array.isArray(dbData.products)) dbData.products = [];
              dbData.products = [product, ...dbData.products.filter((p: any) => p.id !== product.id)];
              safeWrite(dbPath, JSON.stringify(dbData, null, 2));
              res.writeHead(200, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify({ success: true, productId: product.id }));
              broadcastEvent('SYNC_UPDATE');
            } catch (err: any) {
              res.writeHead(500, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify({ error: err.message }));
            }
          });
          return;
        }

        // POST Delete Single Product (Atomic)
        if (req.url === '/api/delete-product' && req.method === 'POST') {
          let body = '';
          req.on('data', (chunk) => { body += chunk; });
          req.on('end', () => {
            try {
              const { id } = JSON.parse(body);
              const dbData = getDbData() || {};
              if (Array.isArray(dbData.products)) {
                dbData.products = dbData.products.filter((p: any) => p.id !== id);
              }
              safeWrite(dbPath, JSON.stringify(dbData, null, 2));
              res.writeHead(200, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify({ success: true, deletedId: id }));
              broadcastEvent('SYNC_UPDATE');
            } catch (err: any) {
              res.writeHead(500, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify({ error: err.message }));
            }
          });
          return;
        }

        // POST Save Store Info & Exchange Rate (Atomic & Instant)
        if (req.url === '/api/save-store-info' && req.method === 'POST') {
          let body = '';
          req.on('data', (chunk) => { body += chunk; });
          req.on('end', () => {
            try {
              const { storeInfo, exchangeRate } = JSON.parse(body);
              const dbData = getDbData() || {};
              if (storeInfo && typeof storeInfo === 'object') {
                dbData.storeInfo = {
                  ...(dbData.storeInfo || {}),
                  ...storeInfo,
                  addressKh: storeInfo.address || storeInfo.addressKh || (dbData.storeInfo && dbData.storeInfo.addressKh) || '',
                };
              }
              if (exchangeRate && Number(exchangeRate) > 0) {
                dbData.exchangeRate = Number(exchangeRate);
              }
              safeWrite(dbPath, JSON.stringify(dbData, null, 2));
              res.writeHead(200, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify({ success: true, storeInfo: dbData.storeInfo, exchangeRate: dbData.exchangeRate }));
              broadcastEvent('SYNC_UPDATE');
            } catch (err: any) {
              res.writeHead(500, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify({ error: err.message }));
            }
          });
          return;
        }

        // GET Songs List
        if (req.url === '/api/songs' && req.method === 'GET') {
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify(getSongsData()));
          return;
        }

        // POST Upload Audio File
        if (req.url === '/api/upload-audio' && req.method === 'POST') {
          let body = '';
          req.on('data', (chunk) => {
            body += chunk;
          });
          req.on('end', () => {
            try {
              const { title, artist, filename, audioBase64, duration } = JSON.parse(body);
              if (!audioBase64 || !filename) {
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'Missing audio data or filename' }));
                return;
              }

              // Clean filename and write to disk
              const safeExt = path.extname(filename) || '.mp3';
              const cleanBase = path.basename(filename, safeExt).replace(/[^a-zA-Z0-9_\u1780-\u17FF-]/g, '_');
              const uniqueFilename = `${Date.now()}_${cleanBase}${safeExt}`;
              const filePath = path.join(uploadsAudioDir, uniqueFilename);

              // Strip base64 data url prefix if present
              const base64Data = audioBase64.replace(/^data:audio\/\w+;base64,/, '');
              fs.writeFileSync(filePath, Buffer.from(base64Data, 'base64'));

              const publicUrl = `/uploads/songs/${uniqueFilename}`;
              const trackId = `song-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;

              const newTrack = {
                id: trackId,
                title: title || cleanBase,
                artist: artist || 'បទចម្រៀងផ្ទាល់ខ្លួន 🎵',
                url: publicUrl,
                filename: uniqueFilename,
                duration: duration || 180,
                isCustom: true,
                category: 'custom',
                dateAdded: new Date().toISOString().slice(0, 10),
              };

              // Save to local_bakery_songs.json
              const currentSongs = getSongsData();
              currentSongs.push(newTrack);
              safeWrite(songsDbPath, JSON.stringify(currentSongs, null, 2));

              res.writeHead(200, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify({ success: true, track: newTrack }));

              // Broadcast update to all connected phones/PCs
              broadcastEvent('SONGS_UPDATED', { track: newTrack });
            } catch (err: any) {
              res.writeHead(500, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify({ error: err.message }));
            }
          });
          return;
        }

        // DELETE Audio File
        if (req.url === '/api/delete-audio' && req.method === 'POST') {
          let body = '';
          req.on('data', (chunk) => {
            body += chunk;
          });
          req.on('end', () => {
            try {
              const { id } = JSON.parse(body);
              let currentSongs = getSongsData();
              const target = currentSongs.find((t: any) => t.id === id);
              if (target && target.filename) {
                const filePath = path.join(uploadsAudioDir, target.filename);
                if (fs.existsSync(filePath)) {
                  try { fs.unlinkSync(filePath); } catch (e) {}
                }
              }
              currentSongs = currentSongs.filter((t: any) => t.id !== id);
              safeWrite(songsDbPath, JSON.stringify(currentSongs, null, 2));

              res.writeHead(200, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify({ success: true }));

              broadcastEvent('SONGS_UPDATED');
            } catch (err: any) {
              res.writeHead(500, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify({ error: err.message }));
            }
          });
          return;
        }

        // POST Upload Product Image
        if (req.url === '/api/upload-image' && req.method === 'POST') {
          let body = '';
          req.on('data', (chunk) => {
            body += chunk;
          });
          req.on('end', () => {
            try {
              const { imageBase64, filename } = JSON.parse(body);
              if (!imageBase64) {
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'Missing imageBase64' }));
                return;
              }

              const ext = (filename && path.extname(filename)) || '.jpg';
              const uniqueFilename = `prod_${Date.now()}_${Math.random().toString(36).substring(2, 6)}${ext}`;
              const filePath = path.join(uploadsProductDir, uniqueFilename);

              const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, '');
              fs.writeFileSync(filePath, Buffer.from(base64Data, 'base64'));

              const publicUrl = `/uploads/products/${uniqueFilename}`;
              res.writeHead(200, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify({ success: true, url: publicUrl }));
            } catch (err: any) {
              res.writeHead(500, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify({ error: err.message }));
            }
          });
          return;
        }

        next();
      });
    },
  };
}

// https://vitejs.dev/config/
export default defineConfig({
  base: './',
  plugins: [react(), lanSyncPlugin()],
  server: {
    host: true, // Expose to local network (0.0.0.0) for phone connections
    port: 3000,
    open: false,
    allowedHosts: true, // Allow tunnel domains (Cloudflare, localtunnel)
  },
});
