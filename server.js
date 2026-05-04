require('dotenv').config()
const express = require('express')
const cors    = require('cors')
const sql     = require('mssql')

const app  = express()
app.use(cors())
app.use(express.json())
app.use(express.static(__dirname))

// ─────────────────────────────────────────────────
// DATABASE CONFIG
// Reads from your .env file — never hardcode these
// ─────────────────────────────────────────────────
const dbConfig = {
  server:   process.env.DB_SERVER,
  database: process.env.DB_DATABASE,
  user:     process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  port:     parseInt(process.env.DB_PORT) || 1433,
  options: {
    encrypt:                true,
    trustServerCertificate: true,
    enableArithAbort:       true,
    connectTimeout:         30000
  },
  pool: {
    max:               10,
    min:               0,
    idleTimeoutMillis: 30000
  }
}

// ─────────────────────────────────────────────────
// DB CONNECTION POOL
// ─────────────────────────────────────────────────
async function getPool() {
  return await new sql.ConnectionPool(dbConfig).connect()
}

// ─────────────────────────────────────────────────
// HEALTH CHECK
// Visit http://localhost:3000/ to confirm server is running
// ─────────────────────────────────────────────────
app.get('/', (req, res) => {
  res.json({ status: 'NCWI Quiz API is running' })
})

// =============================================================
// TRUE / FALSE ENDPOINTS (Easy)
// =============================================================

// GET /api/tf/countrybirth
// Returns a woman + real country, plus one wrong country
app.get('/api/tf/countrybirth', async (req, res) => {
  try {
    const db = await getPool()

    const real = await db.request().query(`
      SELECT TOP 1 w.FirstName, w.LastName, w.CountryBirth
      FROM Woman2 w
      WHERE w.CountryBirth IS NOT NULL
      ORDER BY NEWID()
    `)
    const woman = real.recordset[0]

    const distractor = await db.request()
      .input('real', sql.NVarChar, woman.CountryBirth)
      .query(`
        SELECT TOP 1 CountryBirth
        FROM Woman2
        WHERE CountryBirth != @real
          AND CountryBirth IS NOT NULL
        ORDER BY NEWID()
      `)

    res.json({
      firstName:    woman.FirstName,
      lastName:     woman.LastName,
      realValue:    woman.CountryBirth,
      wrongValue:   distractor.recordset[0].CountryBirth
    })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// GET /api/tf/fieldstudy
app.get('/api/tf/fieldstudy', async (req, res) => {
  try {
    const db = await getPool()

    const real = await db.request().query(`
      SELECT TOP 1 w.FirstName, w.LastName, w.FieldStudy
      FROM Woman2 w
      WHERE w.FieldStudy IS NOT NULL
      ORDER BY NEWID()
    `)
    const woman = real.recordset[0]

    const distractor = await db.request()
      .input('real', sql.NVarChar, woman.FieldStudy)
      .query(`
        SELECT TOP 1 FieldStudy
        FROM Woman2
        WHERE FieldStudy != @real
          AND FieldStudy IS NOT NULL
        ORDER BY NEWID()
      `)

    res.json({
      firstName:  woman.FirstName,
      lastName:   woman.LastName,
      realValue:  woman.FieldStudy,
      wrongValue: distractor.recordset[0].FieldStudy
    })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// GET /api/tf/innovationcategory
app.get('/api/tf/innovationcategory', async (req, res) => {
  try {
    const db = await getPool()

    const real = await db.request().query(`
      SELECT TOP 1 i.InnovationName, i.Category
      FROM Innovation2 i
      WHERE i.Category IS NOT NULL
      ORDER BY NEWID()
    `)
    const innovation = real.recordset[0]

    const distractor = await db.request()
      .input('real', sql.NVarChar, innovation.Category)
      .query(`
        SELECT TOP 1 Category
        FROM Innovation2
        WHERE Category != @real
          AND Category IS NOT NULL
        ORDER BY NEWID()
      `)

    res.json({
      innovationName: innovation.InnovationName,
      realValue:      innovation.Category,
      wrongValue:     distractor.recordset[0].Category
    })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// GET /api/tf/birthyear
app.get('/api/tf/birthyear', async (req, res) => {
  try {
    const db = await getPool()

    const real = await db.request().query(`
      SELECT TOP 1 w.FirstName, w.LastName, w.BirthYear
      FROM Woman2 w
      WHERE w.BirthYear IS NOT NULL
      ORDER BY NEWID()
    `)
    const woman = real.recordset[0]

    const distractor = await db.request()
      .input('real', sql.NVarChar, woman.BirthYear)
      .query(`
        SELECT TOP 1 BirthYear
        FROM Woman2
        WHERE BirthYear != @real
          AND BirthYear IS NOT NULL
        ORDER BY NEWID()
      `)

    res.json({
      firstName:  woman.FirstName,
      lastName:   woman.LastName,
      realValue:  woman.BirthYear,
      wrongValue: distractor.recordset[0].BirthYear
    })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// GET /api/tf/nationality
app.get('/api/tf/nationality', async (req, res) => {
  try {
    const db = await getPool()

    const real = await db.request().query(`
      SELECT TOP 1 w.FirstName, w.LastName, w.Nationality
      FROM Woman2 w
      WHERE w.Nationality IS NOT NULL
      ORDER BY NEWID()
    `)
    const woman = real.recordset[0]

    const distractor = await db.request()
      .input('real', sql.NVarChar, woman.Nationality)
      .query(`
        SELECT TOP 1 Nationality
        FROM Woman2
        WHERE Nationality != @real
          AND Nationality IS NOT NULL
        ORDER BY NEWID()
      `)

    res.json({
      firstName:  woman.FirstName,
      lastName:   woman.LastName,
      realValue:  woman.Nationality,
      wrongValue: distractor.recordset[0].Nationality
    })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})


// =============================================================
// MULTIPLE CHOICE ENDPOINTS (Medium)
// =============================================================

// GET /api/mc/fieldstudy
app.get('/api/mc/fieldstudy', async (req, res) => {
  try {
    const db = await getPool()

    const real = await db.request().query(`
      SELECT TOP 1 w.FirstName, w.LastName, w.FieldStudy
      FROM Woman2 w
      WHERE w.FieldStudy IS NOT NULL
      ORDER BY NEWID()
    `)
    const woman = real.recordset[0]

    const distractors = await db.request()
      .input('real', sql.NVarChar, woman.FieldStudy)
      .query(`
        SELECT TOP 3 FieldStudy
        FROM Woman2
        WHERE FieldStudy != @real
          AND FieldStudy IS NOT NULL
        ORDER BY NEWID()
      `)

    res.json({
      firstName:   woman.FirstName,
      lastName:    woman.LastName,
      correctAnswer: woman.FieldStudy,
      distractors: distractors.recordset.map(r => r.FieldStudy)
    })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// GET /api/mc/countrybirth
app.get('/api/mc/countrybirth', async (req, res) => {
  try {
    const db = await getPool()

    const real = await db.request().query(`
      SELECT TOP 1 w.FirstName, w.LastName, w.CountryBirth
      FROM Woman2 w
      WHERE w.CountryBirth IS NOT NULL
      ORDER BY NEWID()
    `)
    const woman = real.recordset[0]

    const distractors = await db.request()
      .input('real', sql.NVarChar, woman.CountryBirth)
      .query(`
        SELECT TOP 3 CountryBirth
        FROM Woman2
        WHERE CountryBirth != @real
          AND CountryBirth IS NOT NULL
        ORDER BY NEWID()
      `)

    res.json({
      firstName:     woman.FirstName,
      lastName:      woman.LastName,
      correctAnswer: woman.CountryBirth,
      distractors:   distractors.recordset.map(r => r.CountryBirth)
    })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// GET /api/mc/innovationcategory
app.get('/api/mc/innovationcategory', async (req, res) => {
  try {
    const db = await getPool()

    const real = await db.request().query(`
      SELECT TOP 1 i.InnovationName, i.Category
      FROM Innovation2 i
      WHERE i.Category IS NOT NULL
      ORDER BY NEWID()
    `)
    const innovation = real.recordset[0]

    const distractors = await db.request()
      .input('real', sql.NVarChar, innovation.Category)
      .query(`
        SELECT TOP 3 Category
        FROM Innovation2
        WHERE Category != @real
          AND Category IS NOT NULL
        ORDER BY NEWID()
      `)

    res.json({
      innovationName: innovation.InnovationName,
      correctAnswer:  innovation.Category,
      distractors:    distractors.recordset.map(r => r.Category)
    })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// GET /api/mc/institution
app.get('/api/mc/institution', async (req, res) => {
  try {
    const db = await getPool()

    const real = await db.request().query(`
      SELECT TOP 1 w.FirstName, w.LastName, w.InstitutionCorporation
      FROM Woman2 w
      WHERE w.InstitutionCorporation IS NOT NULL
      ORDER BY NEWID()
    `)
    const woman = real.recordset[0]

    const distractors = await db.request()
      .input('real', sql.NVarChar, woman.InstitutionCorporation)
      .query(`
        SELECT TOP 3 InstitutionCorporation
        FROM Woman2
        WHERE InstitutionCorporation != @real
          AND InstitutionCorporation IS NOT NULL
        ORDER BY NEWID()
      `)

    res.json({
      firstName:     woman.FirstName,
      lastName:      woman.LastName,
      correctAnswer: woman.InstitutionCorporation,
      distractors:   distractors.recordset.map(r => r.InstitutionCorporation)
    })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// GET /api/mc/birthyear
app.get('/api/mc/birthyear', async (req, res) => {
  try {
    const db = await getPool()

    const real = await db.request().query(`
      SELECT TOP 1 w.FirstName, w.LastName, w.BirthYear
      FROM Woman2 w
      WHERE w.BirthYear IS NOT NULL
      ORDER BY NEWID()
    `)
    const woman = real.recordset[0]

    const distractors = await db.request()
      .input('real', sql.NVarChar, woman.BirthYear)
      .query(`
        SELECT TOP 3 BirthYear
        FROM Woman2
        WHERE BirthYear != @real
          AND BirthYear IS NOT NULL
        ORDER BY NEWID()
      `)

    res.json({
      firstName:     woman.FirstName,
      lastName:      woman.LastName,
      correctAnswer: woman.BirthYear,
      distractors:   distractors.recordset.map(r => r.BirthYear)
    })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// GET /api/mc/nationality
app.get('/api/mc/nationality', async (req, res) => {
  try {
    const db = await getPool()

    const real = await db.request().query(`
      SELECT TOP 1 w.FirstName, w.LastName, w.Nationality
      FROM Woman2 w
      WHERE w.Nationality IS NOT NULL
      ORDER BY NEWID()
    `)
    const woman = real.recordset[0]

    const distractors = await db.request()
      .input('real', sql.NVarChar, woman.Nationality)
      .query(`
        SELECT TOP 3 Nationality
        FROM Woman2
        WHERE Nationality != @real
          AND Nationality IS NOT NULL
        ORDER BY NEWID()
      `)

    res.json({
      firstName:     woman.FirstName,
      lastName:      woman.LastName,
      correctAnswer: woman.Nationality,
      distractors:   distractors.recordset.map(r => r.Nationality)
    })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// GET /api/mc/whoinvented
app.get('/api/mc/whoinvented', async (req, res) => {
  try {
    const db = await getPool()

    const real = await db.request().query(`
      SELECT TOP 1 i.InnovationName, w.FirstName, w.LastName, w.WomanID
      FROM Innovation2 i
      JOIN Woman2 w ON w.WomanID = i.ConnectedWoman
      WHERE i.InnovationName IS NOT NULL
      ORDER BY NEWID()
    `)
    const row = real.recordset[0]

    const distractors = await db.request()
      .input('realId', sql.Int, row.WomanID)
      .query(`
        SELECT TOP 3 FirstName, LastName
        FROM Woman2
        WHERE WomanID != @realId
          AND FirstName IS NOT NULL
        ORDER BY NEWID()
      `)

    res.json({
      innovationName: row.InnovationName,
      correctAnswer:  `${row.FirstName} ${row.LastName}`,
      distractors:    distractors.recordset.map(r => `${r.FirstName} ${r.LastName}`)
    })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// GET /api/mc/whatdidsheinvent
app.get('/api/mc/whatdidsheinvent', async (req, res) => {
  try {
    const db = await getPool()

    const real = await db.request().query(`
      SELECT TOP 1 w.FirstName, w.LastName, w.WomanID, i.InnovationName
      FROM Woman2 w
      JOIN Innovation2 i ON w.WomanID = i.ConnectedWoman
      WHERE i.InnovationName IS NOT NULL
      ORDER BY NEWID()
    `)
    const row = real.recordset[0]

    const distractors = await db.request()
      .input('realId', sql.Int, row.WomanID)
      .query(`
        SELECT TOP 3 InnovationName
        FROM Innovation2
        WHERE ConnectedWoman != @realId
          AND InnovationName IS NOT NULL
        ORDER BY NEWID()
      `)

    res.json({
      firstName:      row.FirstName,
      lastName:       row.LastName,
      correctAnswer:  row.InnovationName,
      distractors:    distractors.recordset.map(r => r.InnovationName)
    })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// GET /api/mc/nationalitycontribution
app.get('/api/mc/nationalitycontribution', async (req, res) => {
  try {
    const db = await getPool()

    const real = await db.request().query(`
      SELECT TOP 1 w.FirstName, w.LastName, w.Nationality, w.WomanID, i.Category
      FROM Woman2 w
      JOIN Innovation2 i ON w.WomanID = i.ConnectedWoman
      WHERE w.Nationality IS NOT NULL
        AND i.Category IS NOT NULL
      ORDER BY NEWID()
    `)
    const row = real.recordset[0]

    const distractors = await db.request()
      .input('realId', sql.Int, row.WomanID)
      .input('realNat', sql.NVarChar, row.Nationality)
      .query(`
        SELECT TOP 3 FirstName, LastName
        FROM Woman2
        WHERE WomanID != @realId
          AND Nationality != @realNat
          AND FirstName IS NOT NULL
        ORDER BY NEWID()
      `)

    res.json({
      nationality:   row.Nationality,
      category:      row.Category,
      correctAnswer: `${row.FirstName} ${row.LastName}`,
      distractors:   distractors.recordset.map(r => `${r.FirstName} ${r.LastName}`)
    })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// GET /api/mc/innovationcategoryjoin
app.get('/api/mc/innovationcategoryjoin', async (req, res) => {
  try {
    const db = await getPool()

    const real = await db.request().query(`
      SELECT TOP 1 w.FirstName, w.LastName, i.Category
      FROM Woman2 w
      JOIN Innovation2 i ON w.WomanID = i.ConnectedWoman
      WHERE i.Category IS NOT NULL
      ORDER BY NEWID()
    `)
    const row = real.recordset[0]

    const distractors = await db.request()
      .input('real', sql.NVarChar, row.Category)
      .query(`
        SELECT TOP 3 Category
        FROM (SELECT DISTINCT Category FROM Innovation2
        WHERE Category != @real AND Category IS NOT NULL) AS cats
        ORDER BY NEWID()
      `)

    res.json({
      firstName:     row.FirstName,
      lastName:      row.LastName,
      correctAnswer: row.Category,
      distractors:   distractors.recordset.map(r => r.Category)
    })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})


// =============================================================
// FILL IN THE BLANK ENDPOINTS (Hard)
// =============================================================

// GET /api/fitb/countrybirth
app.get('/api/fitb/countrybirth', async (req, res) => {
  try {
    const db = await getPool()
    const result = await db.request().query(`
      SELECT TOP 1 w.FirstName, w.LastName, w.CountryBirth
      FROM Woman2 w
      WHERE w.CountryBirth IS NOT NULL
      ORDER BY NEWID()
    `)
    const w = result.recordset[0]
    res.json({ firstName: w.FirstName, lastName: w.LastName, correctAnswer: w.CountryBirth })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// GET /api/fitb/fieldstudy
app.get('/api/fitb/fieldstudy', async (req, res) => {
  try {
    const db = await getPool()
    const result = await db.request().query(`
      SELECT TOP 1 w.FirstName, w.LastName, w.FieldStudy
      FROM Woman2 w
      WHERE w.FieldStudy IS NOT NULL
      ORDER BY NEWID()
    `)
    const w = result.recordset[0]
    res.json({ firstName: w.FirstName, lastName: w.LastName, correctAnswer: w.FieldStudy })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// GET /api/fitb/birthyear
app.get('/api/fitb/birthyear', async (req, res) => {
  try {
    const db = await getPool()
    const result = await db.request().query(`
      SELECT TOP 1 w.FirstName, w.LastName, w.BirthYear
      FROM Woman2 w
      WHERE w.BirthYear IS NOT NULL
      ORDER BY NEWID()
    `)
    const w = result.recordset[0]
    res.json({ firstName: w.FirstName, lastName: w.LastName, correctAnswer: w.BirthYear })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// GET /api/fitb/nationality
app.get('/api/fitb/nationality', async (req, res) => {
  try {
    const db = await getPool()
    const result = await db.request().query(`
      SELECT TOP 1 w.FirstName, w.LastName, w.Nationality
      FROM Woman2 w
      WHERE w.Nationality IS NOT NULL
      ORDER BY NEWID()
    `)
    const w = result.recordset[0]
    res.json({ firstName: w.FirstName, lastName: w.LastName, correctAnswer: w.Nationality })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// GET /api/fitb/institution
app.get('/api/fitb/institution', async (req, res) => {
  try {
    const db = await getPool()
    const result = await db.request().query(`
      SELECT TOP 1 w.FirstName, w.LastName, w.InstitutionCorporation
      FROM Woman2 w
      WHERE w.InstitutionCorporation IS NOT NULL
      ORDER BY NEWID()
    `)
    const w = result.recordset[0]
    res.json({ firstName: w.FirstName, lastName: w.LastName, correctAnswer: w.InstitutionCorporation })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// GET /api/fitb/whatdidsheinvent
app.get('/api/fitb/whatdidsheinvent', async (req, res) => {
  try {
    const db = await getPool()
    const result = await db.request().query(`
      SELECT TOP 1 w.FirstName, w.LastName, i.InnovationName
      FROM Woman2 w
      JOIN Innovation2 i ON w.WomanID = i.ConnectedWoman
      WHERE i.InnovationName IS NOT NULL
      ORDER BY NEWID()
    `)
    const r = result.recordset[0]
    res.json({ firstName: r.FirstName, lastName: r.LastName, correctAnswer: r.InnovationName })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// GET /api/fitb/whoinvented
app.get('/api/fitb/whoinvented', async (req, res) => {
  try {
    const db = await getPool()
    const result = await db.request().query(`
      SELECT TOP 1 w.FirstName, w.LastName, i.InnovationName
      FROM Woman2 w
      JOIN Innovation2 i ON w.WomanID = i.ConnectedWoman
      WHERE i.InnovationName IS NOT NULL
      ORDER BY NEWID()
    `)
    const r = result.recordset[0]
    res.json({
      innovationName: r.InnovationName,
      correctAnswer:  `${r.FirstName} ${r.LastName}`
    })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// GET /api/fitb/innovationcategory
app.get('/api/fitb/innovationcategory', async (req, res) => {
  try {
    const db = await getPool()
    const result = await db.request().query(`
      SELECT TOP 1 i.InnovationName, i.Category
      FROM Innovation2 i
      WHERE i.Category IS NOT NULL
      ORDER BY NEWID()
    `)
    const r = result.recordset[0]
    res.json({ innovationName: r.InnovationName, correctAnswer: r.Category })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// GET /api/fitb/coinventor
app.get('/api/fitb/coinventor', async (req, res) => {
  try {
    const db = await getPool()
    const result = await db.request().query(`
      SELECT TOP 1 i.InnovationName, i.CoInventor
      FROM Innovation2 i
      WHERE i.CoInventor IS NOT NULL
        AND i.CoInventor != ''
      ORDER BY NEWID()
    `)
    const r = result.recordset[0]
    res.json({ innovationName: r.InnovationName, correctAnswer: r.CoInventor })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})


// =============================================================
// START SERVER
// =============================================================
const PORT = process.env.PORT || 3000

app.listen(PORT, () => {
  console.log(`NCWI Quiz API running at http://localhost:${PORT}`)
  console.log(`Test it: http://localhost:${PORT}/`)
})