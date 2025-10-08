import { useEffect, useState } from 'react'
import { getScripts, setActiveScript, getActiveScriptId, deleteScript, clearActiveScript, ApiError } from '../data/scripts'
import { useNavigate } from 'react-router-dom'
import './CreateScript.css'

function Scripts() {
  const [scripts, setScripts] = useState([])
  const [activeId, setActiveId] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)
  const navigate = useNavigate()

  const refresh = async () => {
    try {
      setIsLoading(true)
      setError(null)
      const [scriptsData, activeIdData] = await Promise.all([
        getScripts(),
        getActiveScriptId()
      ])
      setScripts(scriptsData)
      setActiveId(activeIdData)
    } catch (err) {
      console.error('Failed to refresh scripts:', err)
      setError('Failed to load scripts. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    refresh()
  }, [])

  async function handleSetActive(id) {
    try {
      setIsLoading(true)
      setError(null)
      await setActiveScript(id)
      await refresh()
    } catch (err) {
      console.error('Failed to set active script:', err)
      if (err instanceof ApiError) {
        setError(`Failed to set active script: ${err.message}`)
      } else {
        setError('Failed to set active script. Please try again.')
      }
    } finally {
      setIsLoading(false)
    }
  }

  async function handleDelete(id) {
    if (!window.confirm('Are you sure you want to delete this script?')) {
      return
    }
    
    try {
      setIsLoading(true)
      setError(null)
      await deleteScript(id)
      await refresh()
    } catch (err) {
      console.error('Failed to delete script:', err)
      if (err instanceof ApiError) {
        setError(`Failed to delete script: ${err.message}`)
      } else {
        setError('Failed to delete script. Please try again.')
      }
    } finally {
      setIsLoading(false)
    }
  }

  function handleEdit(id) {
    navigate(`/create-script?id=${encodeURIComponent(id)}`)
  }

  async function handleClearActive() {
    try {
      setIsLoading(true)
      setError(null)
      await clearActiveScript()
      await refresh()
    } catch (err) {
      console.error('Failed to clear active script:', err)
      if (err instanceof ApiError) {
        setError(`Failed to clear active script: ${err.message}`)
      } else {
        setError('Failed to clear active script. Please try again.')
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="create-script-page">
      {error && (
        <div className="error-message" style={{ 
          background: '#ffebee', 
          color: '#c62828', 
          padding: '10px', 
          margin: '10px', 
          borderRadius: '4px',
          textAlign: 'center'
        }}>
          {error}
        </div>
      )}
      <div className="center-panel" style={{ gridColumn: '1 / -1' }}>
        <h2>Scripts</h2>
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '0.5rem' }}>
          <button 
            className="modal-actions secondary" 
            onClick={handleClearActive}
            disabled={isLoading}
          >
            {isLoading ? 'Loading...' : 'Set None Active'}
          </button>
        </div>
        {isLoading && scripts.length === 0 ? (
          <p className="empty-hint">Loading scripts...</p>
        ) : scripts.length === 0 ? (
          <p className="empty-hint">No scripts saved yet.</p>
        ) : (
          <div className="script-list">
            {scripts.map(s => (
              <div key={s.id} className="script-row" style={{ gridTemplateColumns: '1fr auto auto auto' }}>
                <div>
                  <div className="row-name">{s.name}</div>
                  <div className="row-blurb">{new Date(s.createdAt).toLocaleString()}</div>
                </div>
                <button 
                  className="modal-actions secondary" 
                  onClick={() => handleEdit(s.id)}
                  disabled={isLoading}
                >
                  Edit
                </button>
                <button 
                  className="modal-actions secondary" 
                  onClick={() => handleDelete(s.id)}
                  disabled={isLoading}
                >
                  Delete
                </button>
                <button 
                  className="modal-actions primary" 
                  onClick={() => handleSetActive(s.id)} 
                  disabled={activeId === s.id || isLoading}
                >
                  {activeId === s.id ? 'Active' : 'Set Active'}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default Scripts


