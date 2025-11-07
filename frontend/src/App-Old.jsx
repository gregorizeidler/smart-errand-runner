import { useState } from 'react'
import { MapPin, Clock, Navigation, AlertCircle, Loader2, Zap, Leaf, TrendingUp, Users, Truck, Lightbulb, MapPinned } from 'lucide-react'
import MapView from './components/MapView'
import axios from 'axios'
import './App.css'

function App() {
  const [userInput, setUserInput] = useState('')
  const [startAddress, setStartAddress] = useState('')
  const [startTime, setStartTime] = useState('')
  const [mode, setMode] = useState('balanced')
  const [suggestBestTime, setSuggestBestTime] = useState(false)
  const [deliveryMode, setDeliveryMode] = useState(false)
  const [carpooling, setCarpooling] = useState([])
  const [carpoolName, setCarpoolName] = useState('')
  const [carpoolTasks, setCarpoolTasks] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState(null)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setResult(null)

    try {
      const response = await axios.post('http://localhost:8000/api/optimize-errands', {
        user_input: userInput,
        start_address: startAddress,
        start_time: startTime || null,
        mode: mode,
        suggest_best_time: suggestBestTime,
        delivery_mode: deliveryMode,
        carpooling: carpooling.length > 0 ? carpooling : null
      })

      setResult(response.data)
    } catch (err) {
      setError(err.response?.data?.detail || 'Erro ao processar solicitação')
    } finally {
      setLoading(false)
    }
  }

  const handleExample = () => {
    setUserInput('Preciso ir ao banco (que fecha às 16h), passar na farmácia, buscar uma encomenda nos Correios (fecha às 17h) e comprar pão na volta.')
    setStartAddress('Av. Paulista, 1578, São Paulo')
    setStartTime('15:00')
    setMode('balanced')
    setCarpooling([])
  }

  const handleAddCarpool = () => {
    if (carpoolName && carpoolTasks) {
      setCarpooling([...carpooling, { name: carpoolName, tasks: carpoolTasks }])
      setCarpoolName('')
      setCarpoolTasks('')
    }
  }

  const handleRemoveCarpool = (index) => {
    setCarpooling(carpooling.filter((_, i) => i !== index))
  }

  return (
    <div className="app">
      <header className="header">
        <div className="header-content">
          <Navigation size={32} className="logo" />
          <h1>Smart Errand Runner</h1>
          <p className="subtitle">Otimize seus recados com inteligência artificial - Agora com 7 recursos avançados!</p>
        </div>
      </header>

      <main className="main">
        <div className="container">
          <form onSubmit={handleSubmit} className="form">
            <div className="form-group">
              <label htmlFor="startAddress">
                <MapPin size={20} />
                Endereço de Partida
              </label>
              <input
                id="startAddress"
                type="text"
                value={startAddress}
                onChange={(e) => setStartAddress(e.target.value)}
                placeholder="Ex: Rua ABC, 123, São Paulo"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="startTime">
                <Clock size={20} />
                Horário de Saída (opcional)
              </label>
              <input
                id="startTime"
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label htmlFor="userInput">
                <Navigation size={20} />
                Liste seus recados
              </label>
              <textarea
                id="userInput"
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                placeholder="Ex: Preciso ir ao banco (que fecha às 16h), passar na farmácia, buscar uma encomenda nos Correios (fecha às 17h) e comprar pão na volta."
                rows={5}
                required
              />
            </div>

            {/* NEW FEATURE 1: Modo Economia vs Rápido */}
            <div className="form-group">
              <label>
                <TrendingUp size={20} />
                Modo de Otimização
              </label>
              <div className="mode-selector">
                <button
                  type="button"
                  className={`mode-btn ${mode === 'economy' ? 'active economy' : ''}`}
                  onClick={() => setMode('economy')}
                >
                  <Leaf size={18} />
                  Economia
                  <span className="mode-desc">Menor distância, sem pedágios</span>
                </button>
                <button
                  type="button"
                  className={`mode-btn ${mode === 'balanced' ? 'active' : ''}`}
                  onClick={() => setMode('balanced')}
                >
                  <Navigation size={18} />
                  Balanceado
                  <span className="mode-desc">Melhor custo-benefício</span>
                </button>
                <button
                  type="button"
                  className={`mode-btn ${mode === 'fast' ? 'active fast' : ''}`}
                  onClick={() => setMode('fast')}
                >
                  <Zap size={18} />
                  Rápido
                  <span className="mode-desc">Menor tempo possível</span>
                </button>
              </div>
            </div>

            {/* NEW FEATURE 3: Melhor Horário para Sair */}
            <div className="form-group checkbox-group">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={suggestBestTime}
                  onChange={(e) => setSuggestBestTime(e.target.checked)}
                />
                <Clock size={18} />
                <span>Sugerir melhor horário para sair</span>
              </label>
            </div>

            {/* NEW FEATURE 12: Modo Entregador */}
            <div className="form-group checkbox-group">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={deliveryMode}
                  onChange={(e) => setDeliveryMode(e.target.checked)}
                />
                <Truck size={18} />
                <span>Modo Entregador (otimização TSP para múltiplas paradas)</span>
              </label>
            </div>

            {/* NEW FEATURE 4: Modo Carona */}
            <div className="form-group">
              <label>
                <Users size={20} />
                Modo Carona - Adicionar recados de outras pessoas
              </label>
              <div className="carpool-inputs">
                <input
                  type="text"
                  value={carpoolName}
                  onChange={(e) => setCarpoolName(e.target.value)}
                  placeholder="Nome da pessoa"
                  className="carpool-name"
                />
                <input
                  type="text"
                  value={carpoolTasks}
                  onChange={(e) => setCarpoolTasks(e.target.value)}
                  placeholder="Recados dela: ir ao mercado, farmácia..."
                  className="carpool-tasks"
                />
                <button type="button" onClick={handleAddCarpool} className="btn-add-carpool">
                  + Adicionar
                </button>
              </div>
              {carpooling.length > 0 && (
                <div className="carpool-list">
                  {carpooling.map((cp, idx) => (
                    <div key={idx} className="carpool-item">
                      <Users size={16} />
                      <span><strong>{cp.name}:</strong> {cp.tasks}</span>
                      <button type="button" onClick={() => handleRemoveCarpool(idx)} className="btn-remove">
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="button-group">
              <button type="submit" disabled={loading} className="btn btn-primary">
                {loading ? (
                  <>
                    <Loader2 size={20} className="spinner" />
                    Processando...
                  </>
                ) : (
                  <>
                    <Navigation size={20} />
                    Otimizar Rota
                  </>
                )}
              </button>
              <button type="button" onClick={handleExample} className="btn btn-secondary">
                Ver Exemplo
              </button>
            </div>
          </form>

          {error && (
            <div className="alert alert-error">
              <AlertCircle size={20} />
              <span>{error}</span>
            </div>
          )}

          {result && (
            <div className="results">
              <div className="results-header">
                <h2>Rota Otimizada</h2>
                <div className="stats">
                  <div className="stat">
                    <Clock size={20} />
                    <span>{result.total_duration}</span>
                  </div>
                  <div className="stat">
                    <Navigation size={20} />
                    <span>{result.total_distance}</span>
                  </div>
                </div>
              </div>

              {/* NEW FEATURE 3: Best Departure Time */}
              {result.best_departure_time && (
                <div className="feature-card">
                  <Clock size={24} className="feature-icon" />
                  <div className="feature-content">
                    <h3>Melhor Horário para Sair</h3>
                    <p>{result.best_departure_time}</p>
                  </div>
                </div>
              )}

              {/* NEW FEATURE 1: Economy Savings */}
              {result.economy_savings && (
                <div className="feature-card economy">
                  {mode === 'economy' ? <Leaf size={24} className="feature-icon" /> : <Zap size={24} className="feature-icon" />}
                  <div className="feature-content">
                    <h3>{mode === 'economy' ? 'Economia Estimada' : 'Tempo Economizado'}</h3>
                    <p>{result.economy_savings.message}</p>
                    {result.economy_savings.toll_savings && (
                      <div className="savings-details">
                        <span>💰 Pedágios: {result.economy_savings.toll_savings}</span>
                        <span>⛽ Combustível: {result.economy_savings.fuel_savings}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* NEW FEATURE 4: Carpooling Info */}
              {result.carpooling_info && (
                <div className="feature-card carpooling">
                  <Users size={24} className="feature-icon" />
                  <div className="feature-content">
                    <h3>Informações da Carona</h3>
                    <p>{result.carpooling_info.message}</p>
                    <div className="carpooling-stats">
                      <span>👥 {result.carpooling_info.total_people} pessoas</span>
                      <span>📦 {result.carpooling_info.shared_tasks} recados compartilhados</span>
                    </div>
                  </div>
                </div>
              )}

              {/* NEW FEATURE 2: Smart Suggestions */}
              {result.smart_suggestions && result.smart_suggestions.length > 0 && (
                <div className="feature-card suggestions">
                  <Lightbulb size={24} className="feature-icon" />
                  <div className="feature-content">
                    <h3>Sugestões Inteligentes</h3>
                    <ul className="suggestions-list">
                      {result.smart_suggestions.map((suggestion, idx) => (
                        <li key={idx}>{suggestion}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}

              {/* NEW FEATURE 11: Nearby Points of Interest */}
              {result.nearby_points && result.nearby_points.length > 0 && (
                <div className="feature-card nearby">
                  <MapPinned size={24} className="feature-icon" />
                  <div className="feature-content">
                    <h3>Pontos de Interesse no Caminho</h3>
                    <ul className="nearby-list">
                      {result.nearby_points.map((point, idx) => (
                        <li key={idx}>
                          <strong>{point.name}</strong> ({point.type})
                          <br />
                          <small>{point.between}</small>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}

              {result.warnings && result.warnings.length > 0 && (
                <div className="warnings">
                  {result.warnings.map((warning, idx) => (
                    <div key={idx} className="alert alert-warning">
                      <AlertCircle size={20} />
                      <span>{warning}</span>
                    </div>
                  ))}
                </div>
              )}

              <div className="route-steps">
                <h3>Sequência de Paradas</h3>
                {result.optimized_route.map((leg, idx) => (
                  <div key={idx} className="route-step">
                    <div className="step-number">{idx + 1}</div>
                    <div className="step-content">
                      <h4>{leg.task}</h4>
                      <p className="step-address">{leg.address}</p>
                      <div className="step-details">
                        <span className="badge">
                          <Clock size={14} />
                          Chegada: {leg.arrival_time}
                        </span>
                        {leg.closing_time && (
                          <span className="badge badge-warning">
                            <AlertCircle size={14} />
                            Fecha: {leg.closing_time}
                          </span>
                        )}
                        <span className="badge">
                          {leg.duration} • {leg.distance}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="map-container">
                <MapView route={result.optimized_route} nearbyPoints={result.nearby_points} />
              </div>
            </div>
          )}
        </div>
      </main>

      <footer className="footer">
        <p>Desenvolvido com ❤️ usando OpenAI GPT + Google Maps API | 
          <strong> Novo:</strong> 7 recursos avançados implementados! 🚀</p>
      </footer>
    </div>
  )
}

export default App
