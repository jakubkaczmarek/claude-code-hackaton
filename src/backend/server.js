const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

const DATA_DIR = path.join(__dirname, '../../legacy/data');
const APP_DIR = path.join(__dirname, '../../legacy/app');

app.use(cors());
app.use(express.static(APP_DIR));

function readJSON(filename) {
  return JSON.parse(fs.readFileSync(path.join(DATA_DIR, filename), 'utf8'));
}

// GET /api/properties
// Optional query params: type, status, location, bedroomsMin, priceMin, priceMax
app.get('/api/properties', (req, res) => {
  let properties = readJSON('properties.json');
  const { type, status, location, bedroomsMin, priceMin, priceMax } = req.query;

  if (type) properties = properties.filter(p => p.type === type);
  if (status) properties = properties.filter(p => p.status === status);
  if (location) properties = properties.filter(p => p.location === location);
  if (bedroomsMin) properties = properties.filter(p => p.bedrooms >= Number(bedroomsMin));
  if (priceMin) properties = properties.filter(p => p.price >= Number(priceMin));
  if (priceMax) properties = properties.filter(p => p.price <= Number(priceMax));

  res.json(properties);
});

// GET /api/properties/:id
app.get('/api/properties/:id', (req, res) => {
  const properties = readJSON('properties.json');
  const property = properties.find(p => p.id === req.params.id);
  if (!property) return res.status(404).json({ error: 'Property not found' });
  res.json(property);
});

// GET /api/agents
app.get('/api/agents', (req, res) => {
  res.json(readJSON('agents.json'));
});

// GET /api/agents/:id
app.get('/api/agents/:id', (req, res) => {
  const agents = readJSON('agents.json');
  const agent = agents.find(a => a.id === req.params.id);
  if (!agent) return res.status(404).json({ error: 'Agent not found' });
  res.json(agent);
});

// GET /api/locations
app.get('/api/locations', (req, res) => {
  res.json(readJSON('locations.json'));
});

// Catch-all: serve index.html for any non-API route (supports browser refresh on deep links)
app.get('*', (req, res) => {
  const indexPath = path.join(APP_DIR, 'index.html');
  if (fs.existsSync(indexPath)) {
    res.sendFile(indexPath);
  } else {
    res.status(503).send('Frontend not yet built. Place the AngularJS app in /legacy/app/.');
  }
});

app.listen(PORT, () => {
  console.log(`Real Estate Board server running at http://localhost:${PORT}`);
  console.log(`  Data directory : ${DATA_DIR}`);
  console.log(`  App directory  : ${APP_DIR}`);
});
