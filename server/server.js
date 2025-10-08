import express from 'express'
import cors from 'cors'
import { v4 as uuidv4 } from 'uuid'
import fs from 'fs/promises'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const app = express()
const PORT = process.env.PORT || 3001
const DATA_DIR = process.env.DATA_DIR || path.join(__dirname, 'data')
const DATA_FILE = path.join(DATA_DIR, 'scripts.json')

// Middleware
app.use(cors())
app.use(express.json())

// Ensure data directory exists
async function ensureDataDir() {
  try {
    await fs.access(DATA_DIR)
  } catch {
    await fs.mkdir(DATA_DIR, { recursive: true })
  }
}

// Read scripts from file
async function readScripts() {
  try {
    await fs.access(DATA_FILE)
    const data = await fs.readFile(DATA_FILE, 'utf8')
    return JSON.parse(data)
  } catch {
    return { scripts: [], activeId: null }
  }
}

// Write scripts to file
async function writeScripts(data) {
  await ensureDataDir()
  await fs.writeFile(DATA_FILE, JSON.stringify(data, null, 2))
}

// API Routes

// Get all scripts
app.get('/api/scripts', async (req, res) => {
  try {
    const data = await readScripts()
    res.json(data.scripts)
  } catch (error) {
    console.error('Error reading scripts:', error)
    res.status(500).json({ error: 'Failed to read scripts' })
  }
})

// Get active script ID
app.get('/api/scripts/active', async (req, res) => {
  try {
    const data = await readScripts()
    res.json({ activeId: data.activeId })
  } catch (error) {
    console.error('Error reading active script:', error)
    res.status(500).json({ error: 'Failed to read active script' })
  }
})

// Get specific script
app.get('/api/scripts/:id', async (req, res) => {
  try {
    const data = await readScripts()
    const script = data.scripts.find(s => s.id === req.params.id)
    if (!script) {
      return res.status(404).json({ error: 'Script not found' })
    }
    res.json(script)
  } catch (error) {
    console.error('Error reading script:', error)
    res.status(500).json({ error: 'Failed to read script' })
  }
})

// Save script
app.post('/api/scripts', async (req, res) => {
  try {
    const { name, groups, makeActive } = req.body
    
    if (!name || !groups) {
      return res.status(400).json({ error: 'Name and groups are required' })
    }

    const data = await readScripts()
    const script = {
      id: uuidv4(),
      name: name.trim() || 'Untitled Script',
      createdAt: new Date().toISOString(),
      groups
    }

    data.scripts.push(script)
    
    if (makeActive) {
      data.activeId = script.id
    }

    await writeScripts(data)
    res.json(script)
  } catch (error) {
    console.error('Error saving script:', error)
    res.status(500).json({ error: 'Failed to save script' })
  }
})

// Update script
app.put('/api/scripts/:id', async (req, res) => {
  try {
    const { name, groups, makeActive } = req.body
    const scriptId = req.params.id

    if (!name || !groups) {
      return res.status(400).json({ error: 'Name and groups are required' })
    }

    const data = await readScripts()
    const scriptIndex = data.scripts.findIndex(s => s.id === scriptId)
    
    if (scriptIndex === -1) {
      return res.status(404).json({ error: 'Script not found' })
    }

    const script = {
      ...data.scripts[scriptIndex],
      name: name.trim() || 'Untitled Script',
      groups,
      updatedAt: new Date().toISOString()
    }

    data.scripts[scriptIndex] = script
    
    if (makeActive) {
      data.activeId = script.id
    }

    await writeScripts(data)
    res.json(script)
  } catch (error) {
    console.error('Error updating script:', error)
    res.status(500).json({ error: 'Failed to update script' })
  }
})

// Delete script
app.delete('/api/scripts/:id', async (req, res) => {
  try {
    const scriptId = req.params.id
    const data = await readScripts()
    
    const scriptIndex = data.scripts.findIndex(s => s.id === scriptId)
    if (scriptIndex === -1) {
      return res.status(404).json({ error: 'Script not found' })
    }

    data.scripts.splice(scriptIndex, 1)
    
    if (data.activeId === scriptId) {
      data.activeId = null
    }

    await writeScripts(data)
    res.json({ success: true })
  } catch (error) {
    console.error('Error deleting script:', error)
    res.status(500).json({ error: 'Failed to delete script' })
  }
})

// Set active script
app.post('/api/scripts/:id/active', async (req, res) => {
  try {
    const scriptId = req.params.id
    const data = await readScripts()
    
    const script = data.scripts.find(s => s.id === scriptId)
    if (!script) {
      return res.status(404).json({ error: 'Script not found' })
    }

    data.activeId = scriptId
    await writeScripts(data)
    res.json({ success: true })
  } catch (error) {
    console.error('Error setting active script:', error)
    res.status(500).json({ error: 'Failed to set active script' })
  }
})

// Clear active script
app.delete('/api/scripts/active', async (req, res) => {
  try {
    const data = await readScripts()
    data.activeId = null
    await writeScripts(data)
    res.json({ success: true })
  } catch (error) {
    console.error('Error clearing active script:', error)
    res.status(500).json({ error: 'Failed to clear active script' })
  }
})

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

// Serve static files from the dist directory, but only for non-API routes
app.use((req, res, next) => {
  if (req.path.startsWith('/api/')) {
    return next() // Skip static file serving for API routes
  }
  express.static(path.join(__dirname, '..', 'dist'))(req, res, next)
})

// Catch-all handler: send back React's index.html file for any non-API routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'dist', 'index.html'))
})

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`)
})
