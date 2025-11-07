import { useState, lazy, Suspense } from 'react'
import { MapPin, Clock, Navigation, AlertCircle, Loader2, Zap, Leaf, TrendingUp, Users, Truck, Lightbulb, MapPinned, Moon, Sun } from 'lucide-react'
import LoadingSteps from './components/LoadingSteps'
import RouteTimeline from './components/RouteTimeline'
import CostEstimator from './components/CostEstimator'
import ParticlesBackground from './components/ParticlesBackground'
import SkeletonLoader from './components/SkeletonLoader'
import { useTheme } from './hooks/useTheme'
import { useGeolocation } from './hooks/useGeolocation'
import { useScrollReveal } from './hooks/useScrollReveal'
import axios from 'axios'
import './App.css'
import './styles/glassmorphism.css'
import './styles/animations.css'
import './styles/bento-grid.css'

// Lazy load Map component (melhoria #21)
const MapView = lazy(() => import('./components/MapView'))

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
  const [loadingStep, setLoadingStep] = useState(null)
  const [result, setResult] = useState(null)
  const [error, setError] = useState(null)
  
  // Melhoria #3: Modo Escuro
  const { isDark, toggleTheme } = useTheme()
  
  // Melhoria #12: Geolocalização
  const { getLocation, loading: geoLoading } = useGeolocation()
  
  // Ativa scroll reveal animations
  useScrollReveal()

  const handleUseLocation = async () => {
    try {
      const address = await getLocation()
      setStartAddress(address)
    } catch (err) {
      setError('Não foi possível obter sua localização')
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setLoadingStep('processing')
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

      setLoadingStep('complete')
      setTimeout(() => {
        setResult(response.data)
        setLoadingStep(null)
        setLoading(false)
      }, 500)
    } catch (err) {
      setError(err.response?.data?.detail || 'Erro ao processar solicitação')
      setLoading(false)
      setLoadingStep(null)
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
      {/* NOVO: Partículas de fundo */}
      <ParticlesBackground count={30} />
      
      <header className="header gradient-animated frosted-header">
        <div className="header-content">
          <Navigation size={32} className="logo floating" />
          <h1>Smart Errand Runner</h1>
          <p className="subtitle">Otimize seus recados com inteligência artificial - Agora com 45+ recursos!</p>
          {/* Melhoria #3: Toggle de Modo Escuro */}
          <button onClick={toggleTheme} className="theme-toggle pulse-button" aria-label="Toggle theme">
            {isDark ? <Sun size={24} /> : <Moon size={24} />}
          </button>
        </div>
      </header>

      <main className="main">
        <div className="container">
          <form onSubmit={handleSubmit} className="form glass-card scroll-reveal">
            <div className="form-group">
              <label htmlFor="startAddress">
                <MapPin size={20} />
                Endereço de Partida
              </label>
              <div className="input-with-button">
                <input
                  id="startAddress"
                  type="text"
                  value={startAddress}
                  onChange={(e) => setStartAddress(e.target.value)}
                  placeholder="Ex: Rua ABC, 123, São Paulo"
                  required
                />
                {/* Melhoria #12: Botão de Geolocalização */}
                <button
                  type="button"
                  onClick={handleUseLocation}
                  disabled={geoLoading}
                  className="btn-location"
                  title="Usar minha localização"
                >
                  {geoLoading ? <Loader2 size={18} className="spinner" /> : <MapPin size={18} />}
                </button>
              </div>
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

            {/* Modo de Otimização */}
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

            {/* Checkboxes */}
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

            {/* Modo Carona */}
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

          {/* Melhoria #1: Loading Steps Progressivo */}
          {loadingStep === 'processing' && (
            <div className="glass-card bounce-in">
              <LoadingSteps onComplete={() => setLoadingStep('complete')} />
            </div>
          )}
          
          {/* Skeleton screens enquanto processa */}
          {loading && !loadingStep && (
            <div className="glass-card">
              <SkeletonLoader type="stats" />
              <SkeletonLoader type="timeline" />
            </div>
          )}

          {result && (
            <div className="results scroll-reveal">
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

              {/* Best Departure Time */}
              {result.best_departure_time && (
                <div className="feature-card glass-card slide-fade-enter">
                  <Clock size={24} className="feature-icon" />
                  <div className="feature-content">
                    <h3>Melhor Horário para Sair</h3>
                    <p>{result.best_departure_time}</p>
                  </div>
                </div>
              )}

              {/* Economy Savings */}
              {result.economy_savings && (
                <div className="feature-card economy glass-card slide-fade-enter">
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

              {/* Melhoria #6: Cost Estimator */}
              <CostEstimator totalDistance={result.total_distance} />

              {/* Carpooling Info */}
              {result.carpooling_info && (
                <div className="feature-card carpooling glass-card slide-fade-enter">
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

              {/* Smart Suggestions */}
              {result.smart_suggestions && result.smart_suggestions.length > 0 && (
                <div className="feature-card suggestions glass-card slide-fade-enter">
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

              {/* Nearby Points of Interest */}
              {result.nearby_points && result.nearby_points.length > 0 && (
                <div className="feature-card nearby glass-card slide-fade-enter">
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

              {/* Melhoria #2: Route Timeline */}
              <RouteTimeline route={result.optimized_route} />

              {/* Melhoria #21: Lazy Load Map */}
              <div className="map-container glass-card">
                <Suspense fallback={
                  <div className="glass-card">
                    <SkeletonLoader type="map" />
                  </div>
                }>
                  <MapView route={result.optimized_route} nearbyPoints={result.nearby_points} />
                </Suspense>
              </div>
            </div>
          )}
        </div>
      </main>

      <footer className="footer frosted-header">
        <p>Desenvolvido com ❤️ usando OpenAI GPT + Google Maps API | 
          <strong> Novo:</strong> 45+ recursos avançados implementados! 🚀✨</p>
      </footer>
    </div>
  )
}

export default App

