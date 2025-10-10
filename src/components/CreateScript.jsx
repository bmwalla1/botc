import { useState, useMemo, useCallback, useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { characterGroups, characterDetails } from '../data/characters'
import { saveScript, updateScript, setActiveScript, getScripts, ApiError } from '../data/scripts'
import './CreateScript.css'

function CreateScript() {
  const [selected, setSelected] = useState([]) // array of slugs
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [scriptName, setScriptName] = useState('')
  const [makeActive, setMakeActive] = useState(true)
  const [editingId, setEditingId] = useState(null)
  const [originalName, setOriginalName] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
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

  // Filter characters based on search term
  const filteredGroupedLists = useMemo(() => {
    if (!searchTerm.trim()) {
      return groupedLists
    }
    
    const searchLower = searchTerm.toLowerCase()
    return groupedLists.map(([group, slugs]) => [
      group,
      slugs.filter(slug => {
        const details = characterDetails[slug]
        return details?.name?.toLowerCase().includes(searchLower) ||
               details?.blurb?.toLowerCase().includes(searchLower)
      })
    ]).filter(([group, slugs]) => slugs.length > 0)
  }, [groupedLists, searchTerm])

  // Load existing script for edit mode
  useEffect(() => {
    const loadScript = async () => {
      const params = new URLSearchParams(location.search)
      const id = params.get('id')
      if (!id) return
      
      try {
        setIsLoading(true)
        setError(null)
        const scripts = await getScripts()
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
      } catch (err) {
        console.error('Failed to load script:', err)
        setError('Failed to load script. Please try again.')
      } finally {
        setIsLoading(false)
      }
    }
    
    loadScript()
  }, [location.search])

  const meetsMinimums = (selectedByGroup.townsfolk.length >= 13 &&
    selectedByGroup.outsiders.length >= 4 &&
    selectedByGroup.minions.length >= 4 &&
    selectedByGroup.demons.length >= 1)

  function openCreateModal() {
    // If editing, prefill with original name
    setScriptName(editingId ? originalName : '')
    setMakeActive(true)
    setIsModalOpen(true)
  }

  async function handleSaveScript() {
    try {
      setIsLoading(true)
      setError(null)
      
      const scriptData = {
        name: scriptName || 'Untitled Script',
        groups: {
          townsfolk: selectedByGroup.townsfolk,
          outsiders: selectedByGroup.outsiders,
          minions: selectedByGroup.minions,
          demons: selectedByGroup.demons
        },
        makeActive
      }

      if (editingId && scriptName.trim() === originalName.trim()) {
        // Update existing script
        await updateScript({ id: editingId, ...scriptData })
      } else {
        // Create new script
        await saveScript(scriptData)
      }
      
      setIsModalOpen(false)
    } catch (err) {
      console.error('Failed to save script:', err)
      if (err instanceof ApiError) {
        setError(`Failed to save script: ${err.message}`)
      } else {
        setError('Failed to save script. Please try again.')
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
      <div className="left-column">
        <div className="search-container">
          <input
            type="text"
            placeholder="Search characters..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="character-search"
          />
        </div>
        {filteredGroupedLists.map(([group, slugs]) => (
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
        {searchTerm.trim() && filteredGroupedLists.length === 0 && (
          <div className="no-results">
            <p>No characters found matching "{searchTerm}"</p>
          </div>
        )}
      </div>

      <div className="center-panel">
        <h2>Current Script</h2>
        <div className="script-actions">
          <button 
            className="primary" 
            onClick={openCreateModal} 
            disabled={!meetsMinimums || isLoading}
          >
            {isLoading ? 'Loading...' : 'Create Script'}
          </button>
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
                    // Find jinxes that exist in the current selection
                    const relevantJinxes = (details?.jinxes || []).filter(jinx => 
                      selected.includes(jinx.character)
                    )
                    
                    return (
                      <div key={slug} className="character-container">
                        <div className="script-row" onClick={() => toggleCharacter(slug)} title="Remove from script">
                          <img className="row-icon" src={details?.image} alt={details?.name} />
                          <div className="row-name">{details?.name}</div>
                          <div className="row-blurb">{details?.blurb}</div>
                        </div>
                        {relevantJinxes.length > 0 && (
                          <div className="jinx-icons-row">
                            {relevantJinxes.map((jinx, index) => {
                              const jinxCharacter = characterDetails[jinx.character]
                              return (
                                <img 
                                  key={`${slug}-jinx-${index}`}
                                  className="jinx-icon" 
                                  src={jinxCharacter?.image} 
                                  alt={jinxCharacter?.name}
                                  title={`${jinxCharacter?.name}: ${jinx.description}`}
                                />
                              )
                            })}
                          </div>
                        )}
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
              <button 
                className="secondary" 
                onClick={() => setIsModalOpen(false)}
                disabled={isLoading}
              >
                Cancel
              </button>
              <button 
                className="primary" 
                onClick={handleSaveScript}
                disabled={isLoading}
              >
                {isLoading ? 'Saving...' : 'Save Script'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default CreateScript


