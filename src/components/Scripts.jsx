import { useEffect, useState } from 'react'
import { getScripts, setActiveScript, getActiveScriptId, deleteScript, clearActiveScript } from '../data/scripts'
import { useNavigate } from 'react-router-dom'
import './CreateScript.css'

function Scripts() {
  const [scripts, setScripts] = useState([])
  const [activeId, setActiveId] = useState(null)
  const navigate = useNavigate()

  const refresh = () => {
    setScripts(getScripts())
    setActiveId(getActiveScriptId())
  }

  useEffect(() => {
    refresh()
  }, [])

  function handleSetActive(id) {
    setActiveScript(id)
    refresh()
  }

  function handleDelete(id) {
    deleteScript(id)
    refresh()
  }

  function handleEdit(id) {
    navigate(`/create-script?id=${encodeURIComponent(id)}`)
  }

  return (
    <div className="create-script-page">
      <div className="center-panel" style={{ gridColumn: '1 / -1' }}>
        <h2>Scripts</h2>
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '0.5rem' }}>
          <button className="modal-actions secondary" onClick={() => { clearActiveScript(); refresh() }}>Set None Active</button>
        </div>
        {scripts.length === 0 ? (
          <p className="empty-hint">No scripts saved yet.</p>
        ) : (
          <div className="script-list">
            {scripts.map(s => (
              <div key={s.id} className="script-row" style={{ gridTemplateColumns: '1fr auto auto auto' }}>
                <div>
                  <div className="row-name">{s.name}</div>
                  <div className="row-blurb">{new Date(s.createdAt).toLocaleString()}</div>
                </div>
                <button className="modal-actions secondary" onClick={() => handleEdit(s.id)}>Edit</button>
                <button className="modal-actions secondary" onClick={() => handleDelete(s.id)}>Delete</button>
                <button className="modal-actions primary" onClick={() => handleSetActive(s.id)} disabled={activeId === s.id}>
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


