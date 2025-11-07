import { useState } from 'react'
import { MapPin, Clock, AlertCircle, X, GripVertical } from 'lucide-react'
import './ErrandCard.css'

function ErrandCard({ errand, onUpdate, onRemove, index }) {
  const [isEditing, setIsEditing] = useState(false)
  const [localErrand, setLocalErrand] = useState(errand)

  const handleSave = () => {
    onUpdate(index, localErrand)
    setIsEditing(false)
  }

  const priorityColors = {
    low: '#4CAF50',
    medium: '#FF9800',
    high: '#F44336'
  }

  return (
    <div className="errand-card" draggable>
      <div className="errand-card-header">
        <GripVertical size={20} className="drag-handle" />
        <div className="errand-priority" style={{ backgroundColor: priorityColors[errand.priority || 'medium'] }}></div>
        <div className="errand-main">
          {isEditing ? (
            <input
              type="text"
              value={localErrand.name}
              onChange={(e) => setLocalErrand({ ...localErrand, name: e.target.value })}
              onBlur={handleSave}
              onKeyPress={(e) => e.key === 'Enter' && handleSave()}
              className="errand-input"
              autoFocus
            />
          ) : (
            <h4 onClick={() => setIsEditing(true)}>{errand.name}</h4>
          )}
        </div>
        <button onClick={() => onRemove(index)} className="errand-remove" aria-label="Remover">
          <X size={18} />
        </button>
      </div>

      <div className="errand-details">
        {errand.place && (
          <div className="errand-detail">
            <MapPin size={16} />
            <span>{errand.place}</span>
          </div>
        )}
        {errand.closingTime && (
          <div className="errand-detail warning">
            <Clock size={16} />
            <span>Fecha às {errand.closingTime}</span>
          </div>
        )}
        {errand.constraint && (
          <div className="errand-detail info">
            <AlertCircle size={16} />
            <span>{errand.constraint}</span>
          </div>
        )}
      </div>

      <div className="errand-priority-selector">
        <button
          className={`priority-btn ${errand.priority === 'low' ? 'active' : ''}`}
          onClick={() => onUpdate(index, { ...errand, priority: 'low' })}
          style={{ borderColor: priorityColors.low }}
        >
          Baixa
        </button>
        <button
          className={`priority-btn ${errand.priority === 'medium' ? 'active' : ''}`}
          onClick={() => onUpdate(index, { ...errand, priority: 'medium' })}
          style={{ borderColor: priorityColors.medium }}
        >
          Média
        </button>
        <button
          className={`priority-btn ${errand.priority === 'high' ? 'active' : ''}`}
          onClick={() => onUpdate(index, { ...errand, priority: 'high' })}
          style={{ borderColor: priorityColors.high }}
        >
          Alta
        </button>
      </div>
    </div>
  )
}

export default ErrandCard

