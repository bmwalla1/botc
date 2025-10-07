import { useState, useMemo, useCallback, useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { characterGroups, characterDetails } from '../data/characters'
import { saveScript, setActiveScript, getScripts } from '../data/scripts'
import './CreateScript.css'

function CreateScript() {
  const [selected, setSelected] = useState([]) // array of slugs
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [scriptName, setScriptName] = useState('')
  const [makeActive, setMakeActive] = useState(true)
  const [editingId, setEditingId] = useState(null)
  const [originalName, setOriginalName] = useState('')
  const location = useLocation()

  const limits = { townsfolk: 13, outsiders: 5, minions: 5, demons: 5 }

  const selectedByGroup = useMemo(() => {
    return selected.reduce((acc, slug) => {
      const type = characterDetails[slug]?.type
      if (!type) return acc
      if (!acc[type]) acc[type] = []
      acc[type].push(slug)
      return acc
    }, { townsfolk: [], outsiders: [], minions: [], demons: [] })
  }, [selected])

  const toggleCharacter = useCallback((slug) => {
    setSelected(prev => prev.includes(slug) ? prev.filter(s => s !== slug) : [...prev, slug])
  }, [])

  const groupedLists = useMemo(() => Object.entries(characterGroups), [])

  // Load existing script for edit mode
  useEffect(() => {
    const params = new URLSearchParams(location.search)
    const id = params.get('id')
    if (!id) return
    const scripts = getScripts()
    const found = scripts.find(s => s.id === id)
    if (!found) return
    setEditingId(found.id)
    setOriginalName(found.name)
    setScriptName(found.name)
    // Flatten selected slugs from groups in order
    const combined = [
      ...(found.groups?.townsfolk || []),
      ...(found.groups?.outsiders || []),
      ...(found.groups?.minions || []),
      ...(found.groups?.demons || [])
    ]
    setSelected(combined)
  }, [location.search])

  const meetsMinimums = (selectedByGroup.townsfolk.length >= 13 &&
    selectedByGroup.outsiders.length >= 5 &&
    selectedByGroup.minions.length >= 5 &&
    selectedByGroup.demons.length >= 1)

  function openCreateModal() {
    // If editing, prefill with original name
    setScriptName(editingId ? originalName : '')
    setMakeActive(true)
    setIsModalOpen(true)
  }

  function handleSaveScript() {
    let id = `${Date.now()}`
    // If editing and name unchanged, overwrite existing id
    if (editingId && scriptName.trim() === originalName.trim()) {
      id = editingId
    }
    const script = {
      id,
      name: scriptName || 'Untitled Script',
      createdAt: new Date().toISOString(),
      groups: {
        townsfolk: selectedByGroup.townsfolk,
        outsiders: selectedByGroup.outsiders,
        minions: selectedByGroup.minions,
        demons: selectedByGroup.demons
      }
    }
    saveScript(script)
    if (makeActive) setActiveScript(id)
    setIsModalOpen(false)
  }

  return (
    <div className="create-script-page">
      <div className="left-column">
        {groupedLists.map(([group, slugs]) => (
          <div key={group} className="group-block">
            <h3 className="group-title">{group.charAt(0).toUpperCase() + group.slice(1)}</h3>
            <div className="group-list">
              {slugs.map(slug => {
                const details = characterDetails[slug]
                const isActive = selected.includes(slug)
                const isAtLimit = (selectedByGroup[group]?.length || 0) >= limits[group]
                const disabled = !isActive && isAtLimit
                return (
                  <button
                    key={slug}
                    className={`character-list-item ${isActive ? 'active' : ''} ${disabled ? 'disabled' : ''}`}
                    onClick={() => { if (!disabled) toggleCharacter(slug) }}
                    title={details?.blurb || details?.name}
                    aria-disabled={disabled}
                  >
                    <img className="mini-icon" src={details?.image} alt={details?.name} />
                    <span className="name">{details?.name}</span>
                  </button>
                )
              })}
            </div>
          </div>
        ))}
      </div>

      <div className="center-panel">
        <h2>Current Script</h2>
        <div className="script-actions">
          <button className="primary" onClick={openCreateModal} disabled={!meetsMinimums}>Create Script</button>
        </div>
        {selected.length === 0 ? (
          <p className="empty-hint">Click characters on the left to add them to your script.</p>
        ) : (
          <div className="script-groups">
            {(['townsfolk','outsiders','minions','demons']).map(group => (
              <div key={group} className="script-group">
                <div className="script-group-header">
                  <span className={`pill pill-${group}`}>{group.toUpperCase()}</span>
                  <span className="count">{(selectedByGroup[group] || []).length}/{limits[group]}</span>
                </div>
                <div className="script-list">
                  {(selectedByGroup[group] || []).map(slug => {
                    const details = characterDetails[slug]
                    return (
                      <div key={slug} className="script-row" onClick={() => toggleCharacter(slug)} title="Remove from script">
                        <img className="row-icon" src={details?.image} alt={details?.name} />
                        <div className="row-name">{details?.name}</div>
                        <div className="row-blurb">{details?.blurb}</div>
                      </div>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      {isModalOpen && (
        <div className="modal-backdrop" onClick={() => setIsModalOpen(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h3>Name Your Script</h3>
            <input 
              type="text" 
              className="text-input" 
              placeholder="My Script"
              value={scriptName}
              onChange={e => setScriptName(e.target.value)}
            />
            <label className="checkbox">
              <input type="checkbox" checked={makeActive} onChange={e => setMakeActive(e.target.checked)} />
              <span>Set as active after saving</span>
            </label>
            <div className="modal-actions">
              <button className="secondary" onClick={() => setIsModalOpen(false)}>Cancel</button>
              <button className="primary" onClick={handleSaveScript}>Save Script</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default CreateScript


