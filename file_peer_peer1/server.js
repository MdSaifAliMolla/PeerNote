const express = require('express');
const cors = require('cors');
const multer = require('multer');
const axios = require('axios');
const fs = require('fs');
const path = require('path');
const os = require('os');

const PORT = process.env.PORT ? Number(process.env.PORT) : 8080;
const UPLOADS_DIR = process.env.UPLOAD_DIR || path.join(__dirname, 'uploads');

if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

const app = express();
app.use(cors());
app.use(express.json({ limit: '100mb' }));

const upload = multer({ storage: multer.memoryStorage() });

function getInternalIp() {
  const ifaces = os.networkInterfaces();
  for (const name of Object.keys(ifaces)) {
    const entries = ifaces[name] || [];
    for (const entry of entries) {
      if (entry && entry.family === 'IPv4' && !entry.internal) {
        return entry.address;
      }
    }
  }
  return null;
}

app.get('/ip', (req, res) => {
  const ip = getInternalIp();
  res.status(200).send(ip ?? '');
});

app.get('/files', (req, res) => {
  try {
    const files = fs.readdirSync(UPLOADS_DIR);
    const names = files.map((f) => {
      const idx = f.indexOf('_');
      return idx >= 0 ? f.slice(idx + 1) : f;
    });
    res.status(200).json({ files: names });
  } catch (e) {
    res.status(500).json({ error: 'Failed to list files' });
  }
});

app.post('/copy-file', upload.single('file'), (req, res) => {
  try {
    const fileId = req.body.file_id;
    if (!fileId) {
      return res.status(400).send('file_id must be sent in request');
    }
    if (!req.file) {
      return res.status(400).send('File must be sent in request');
    }

    const filename = String(req.file.originalname || '').replace(/\s/g, '_');
    const destPath = path.join(UPLOADS_DIR, `${fileId}_${filename}`);

    if (fs.existsSync(destPath)) {
      return res.status(200).send('File with name already exists');
    }

    fs.writeFileSync(destPath, req.file.buffer);
    return res.status(200).send('File Moved successfully');
  } catch (e) {
    return res.status(400).send('An error occured');
  }
});

app.get('/send', (req, res) => {
  const fileId = req.query.id;
  const filename = req.query.filename;
  if (!fileId || !filename) {
    return res.status(400).send('id and filename are required');
  }

  const safeFilename = String(filename).replace(/\s/g, '_');
  const filePath = path.join(UPLOADS_DIR, `${fileId}_${safeFilename}`);

  if (!fs.existsSync(filePath)) {
    return res.status(404).send('File not found');
  }

  return res.download(filePath, `${fileId}_${safeFilename}`);
});

app.post('/request', async (req, res) => {
  try {
    const { id, filename, ip } = req.body || {};
    if (!id || !filename || !ip) {
      return res.status(400).send('id, filename, and ip are required');
    }

    const safeFilename = String(filename).replace(/\s/g, '_');
    const destPath = path.join(UPLOADS_DIR, `${id}_${safeFilename}`);

    if (fs.existsSync(destPath)) {
      return res.status(200).send('File with name already exists');
    }

    const url = `http://${ip}:8080/send`;

    const response = await axios.get(url, {
      params: { id, filename: safeFilename },
      responseType: 'arraybuffer',
      timeout: 30000,
      validateStatus: () => true,
    });

    if (response.status !== 200) {
      const text = Buffer.isBuffer(response.data)
        ? response.data.toString('utf8')
        : String(response.data ?? '');
      return res.status(response.status).send(text);
    }

    fs.writeFileSync(destPath, Buffer.from(response.data));
    return res.status(200).send(`File Downloaded to location ${destPath}`);
  } catch (e) {
    return res.status(500).send('An error occured');
  }
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`file_peer (node) listening on port ${PORT}`);
});
