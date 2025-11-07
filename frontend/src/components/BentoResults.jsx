import { Clock, MapPin, TrendingDown, DollarSign } from 'lucide-react'
import MapView from './MapView'
import RouteTimeline from './RouteTimeline'
import CostEstimator from './CostEstimator'
import '../styles/bento-grid.css'

// DESIGN #8: Bento Grid Layout - Componente moderno para exibir resultados
function BentoResults({ result }) {
  if (!result) return null

  return (
    <div className="bento-container">
      {/* Mapa Grande - Item Principal */}
      <div className="bento-item bento-map glass-card">
        <MapView route={result.optimized_route} nearbyPoints={result.nearby_points} />
      </div>

      {/* Stats Rápidos */}
      <div className="bento-item bento-stats glass-card">
        <div className="bento-header">
          <Clock size={24} />
          <h3>Tempo Total</h3>
        </div>
        <div className="bento-body">
          <div className="counter" style={{ fontSize: '2.5rem', color: 'white' }}>
            {result.total_duration}
          </div>
        </div>
      </div>

      {/* Timeline */}
      <div className="bento-item bento-timeline glass-card">
        <div className="bento-header">
          <MapPin size={24} />
          <h3>Rota</h3>
        </div>
        <div className="bento-body">
          <RouteTimeline route={result.optimized_route} />
        </div>
      </div>

      {/* Custo Estimado */}
      <div className="bento-item bento-cost glass-card">
        <div className="bento-header">
          <DollarSign size={24} />
          <h3>Custo</h3>
        </div>
        <div className="bento-body">
          <CostEstimator totalDistance={result.total_distance} />
        </div>
      </div>

      {/* Economia (se houver) */}
      {result.economy_savings && (
        <div className="bento-item bento-controls glass-card">
          <div className="bento-header">
            <TrendingDown size={24} />
            <h3>Economia</h3>
          </div>
          <div className="bento-body">
            <p style={{ fontSize: '1.1rem', color: 'white' }}>
              {result.economy_savings.message}
            </p>
          </div>
        </div>
      )}
    </div>
  )
}

export default BentoResults

