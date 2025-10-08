// API-based script management
import { scriptsApi, ApiError } from '../services/api'

// Cache for scripts to avoid repeated API calls
let scriptsCache = null
let activeIdCache = null
let lastFetch = 0
const CACHE_DURATION = 5000 // 5 seconds

async function getCachedScripts() {
  const now = Date.now()
  if (!scriptsCache || (now - lastFetch) > CACHE_DURATION) {
    try {
      scriptsCache = await scriptsApi.getScripts()
      lastFetch = now
    } catch (error) {
      console.error('Failed to fetch scripts:', error)
      return []
    }
  }
  return scriptsCache
}

async function getCachedActiveId() {
  if (activeIdCache === null) {
    try {
      activeIdCache = await scriptsApi.getActiveScriptId()
    } catch (error) {
      console.error('Failed to fetch active script ID:', error)
      return null
    }
  }
  return activeIdCache
}

export async function getScripts() {
  return await getCachedScripts()
}

export async function getActiveScriptId() {
  return await getCachedActiveId()
}

export async function getActiveScript() {
  const id = await getActiveScriptId()
  if (!id) return null
  const scripts = await getScripts()
  return scripts.find(s => s.id === id) || null
}

export async function saveScript(script) {
  try {
    const { name, groups, makeActive = true } = script
    const result = await scriptsApi.saveScript({ name, groups, makeActive })
    
    // Update cache
    scriptsCache = null
    activeIdCache = null
    
    return result
  } catch (error) {
    console.error('Failed to save script:', error)
    throw error
  }
}

export async function updateScript(script) {
  try {
    const { id, name, groups, makeActive = true } = script
    const result = await scriptsApi.updateScript(id, { name, groups, makeActive })
    
    // Update cache
    scriptsCache = null
    activeIdCache = null
    
    return result
  } catch (error) {
    console.error('Failed to update script:', error)
    throw error
  }
}

export async function deleteScript(id) {
  try {
    await scriptsApi.deleteScript(id)
    
    // Update cache
    scriptsCache = null
    activeIdCache = null
  } catch (error) {
    console.error('Failed to delete script:', error)
    throw error
  }
}

export async function setActiveScript(id) {
  try {
    await scriptsApi.setActiveScript(id)
    activeIdCache = id
  } catch (error) {
    console.error('Failed to set active script:', error)
    throw error
  }
}

export async function clearActiveScript() {
  try {
    await scriptsApi.clearActiveScript()
    activeIdCache = null
  } catch (error) {
    console.error('Failed to clear active script:', error)
    throw error
  }
}

// Export ApiError for error handling in components
export { ApiError }


