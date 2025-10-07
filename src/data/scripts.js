// Simple localStorage helpers for scripts
const SCRIPTS_KEY = 'botc:scripts:list'
const ACTIVE_ID_KEY = 'botc:scripts:activeId'

function readJson(key, fallback) {
  try {
    const raw = localStorage.getItem(key)
    if (!raw) return fallback
    return JSON.parse(raw)
  } catch (_) {
    return fallback
  }
}

function writeJson(key, value) {
  localStorage.setItem(key, JSON.stringify(value))
}

export function getScripts() {
  return readJson(SCRIPTS_KEY, [])
}

export function getActiveScriptId() {
  return readJson(ACTIVE_ID_KEY, null)
}

export function getActiveScript() {
  const id = getActiveScriptId()
  if (!id) return null
  return getScripts().find(s => s.id === id) || null
}

export function saveScript(script) {
  const scripts = getScripts()
  const existingIndex = scripts.findIndex(s => s.id === script.id)
  if (existingIndex >= 0) {
    scripts[existingIndex] = script
  } else {
    scripts.push(script)
  }
  writeJson(SCRIPTS_KEY, scripts)
}

export function deleteScript(id) {
  const scripts = getScripts().filter(s => s.id !== id)
  writeJson(SCRIPTS_KEY, scripts)
  const activeId = getActiveScriptId()
  if (activeId === id) {
    writeJson(ACTIVE_ID_KEY, null)
  }
}

export function setActiveScript(id) {
  writeJson(ACTIVE_ID_KEY, id)
}

export function clearActiveScript() {
  writeJson(ACTIVE_ID_KEY, null)
}


