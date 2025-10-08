// Script to update API URL for production deployment
import fs from 'fs'

const API_URL = process.env.API_URL || 'http://localhost:3001/api'

// Read the current API service file
const apiServicePath = './src/services/api.js'
let content = fs.readFileSync(apiServicePath, 'utf8')

// Replace the API_BASE_URL
content = content.replace(
  "const API_BASE_URL = 'http://localhost:3001/api'",
  `const API_BASE_URL = '${API_URL}'`
)

// Write back the updated content
fs.writeFileSync(apiServicePath, content)

console.log(`✅ Updated API URL to: ${API_URL}`)
