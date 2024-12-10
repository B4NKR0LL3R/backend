const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const { Pool } = require('pg');

const app = express();
const PORT = process.env.PORT || 5000;

// PostgreSQL database configuration
const pool = new Pool({
  connectionString: 'postgresql://postgres:Database@localhost:5432/pokertracker',
});

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Validate poker site function
const validateSite = (site) => {
  const validSites = [
    'Olybet', 'Tigergaming', 'Optibet', 'Unibet', 'Pokerstars', 'WPTGlobal',
    '888Poker', 'ClubGG', 'Winamax', 'ACR', 'Betsafe', 'Coinpoker',
  ];
  return validSites.includes(site);
};

// API Endpoints

// 1. Add a Tournament
app.post('/api/tournaments', async (req, res) => {
  const { name, type, buy_in, prize, itm, site, date } = req.body;

  // Debugging: Log the request body
  console.log("Request Body:", req.body);

  // Validate poker site
  if (!validateSite(site)) {
    console.error("Invalid poker site:", site);
    return res.status(400).json({ error: 'Invalid poker site' });
  }

  // Validate required fields
  if (!name || !type || !buy_in || !prize || !date) {
    console.error("Missing required fields:", { name, type, buy_in, prize, date });
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    const result = await pool.query(
      'INSERT INTO tournaments2 (name, type, buy_in, prize, itm, site, date) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
      [name, type, parseFloat(buy_in), parseFloat(prize), itm, site, date]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Database Error:', error);
    res.status(500).json({ error: 'Database error' });
  }
});

// 2. Get All Tournaments
app.get('/api/tournaments', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM tournaments2 ORDER BY date DESC');
    res.json(result.rows);
  } catch (error) {
    console.error('Database Error:', error);
    res.status(500).json({ error: 'Database error' });
  }
});

// 3. Delete a Tournament
app.delete('/api/tournaments/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query('DELETE FROM tournaments2 WHERE id = $1 RETURNING *', [id]);
    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Tournament not found' });
    }
    res.status(200).json(result.rows[0]);
  } catch (error) {
    console.error('Database Error:', error);
    res.status(500).json({ error: 'Database error' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
