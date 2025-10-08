// Use relative URL for production, localhost for development
const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? '/api' 
  : 'http://localhost:3001/api'

class ApiError extends Error {
  constructor(message, status) {
    super(message)
    this.status = status
  }
}

async function apiRequest(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers
    },
    ...options
  }

  try {
    const response = await fetch(url, config)
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new ApiError(errorData.error || `HTTP ${response.status}`, response.status)
    }

    return await response.json()
  } catch (error) {
    if (error instanceof ApiError) {
      throw error
    }
    throw new ApiError('Network error: ' + error.message, 0)
  }
}

export const scriptsApi = {
  // Get all scripts
  async getScripts() {
    return apiRequest('/scripts')
  },

  // Get active script ID
  async getActiveScriptId() {
    const data = await apiRequest('/scripts/active')
    return data.activeId
  },

  // Get specific script
  async getScript(id) {
    return apiRequest(`/scripts/${id}`)
  },

  // Save new script
  async saveScript(script) {
    const { name, groups, makeActive = true } = script
    return apiRequest('/scripts', {
      method: 'POST',
      body: JSON.stringify({ name, groups, makeActive })
    })
  },

  // Update existing script
  async updateScript(id, script) {
    const { name, groups, makeActive = true } = script
    return apiRequest(`/scripts/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ name, groups, makeActive })
    })
  },

  // Delete script
  async deleteScript(id) {
    return apiRequest(`/scripts/${id}`, {
      method: 'DELETE'
    })
  },

  // Set active script
  async setActiveScript(id) {
    return apiRequest(`/scripts/${id}/active`, {
      method: 'POST'
    })
  },

  // Clear active script
  async clearActiveScript() {
    return apiRequest('/scripts/active', {
      method: 'DELETE'
    })
  }
}

export { ApiError }
