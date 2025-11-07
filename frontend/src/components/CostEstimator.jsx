import { useState } from 'react'
import { DollarSign, Droplet, TrendingDown } from 'lucide-react'
import './CostEstimator.css'

function CostEstimator({ totalDistance }) {
  const [fuelPrice, setFuelPrice] = useState(5.50)
  const [fuelEfficiency, setFuelEfficiency] = useState(12) // km/L
  
  // Extrair distância em km
  const distanceKm = parseFloat(totalDistance?.replace(' km', '').replace(',', '.')) || 0
  
  // Cálculos
  const litersNeeded = distanceKm / fuelEfficiency
  const totalCost = litersNeeded * fuelPrice
  const co2Emissions = litersNeeded * 2.31 // kg de CO2 por litro
  
  return (
    <div className="cost-estimator">
      <h3>
        <DollarSign size={20} />
        Estimativa de Custos
      </h3>
      
      <div className="cost-inputs">
        <div className="cost-input-group">
          <label>
            <Droplet size={16} />
            Preço do Combustível (R$/L)
          </label>
          <input
            type="number"
            value={fuelPrice}
            onChange={(e) => setFuelPrice(parseFloat(e.target.value) || 0)}
            step="0.10"
            min="0"
          />
        </div>
        
        <div className="cost-input-group">
          <label>
            <TrendingDown size={16} />
            Consumo Médio (km/L)
          </label>
          <input
            type="number"
            value={fuelEfficiency}
            onChange={(e) => setFuelEfficiency(parseFloat(e.target.value) || 1)}
            step="0.5"
            min="1"
          />
        </div>
      </div>
      
      <div className="cost-results">
        <div className="cost-result-card fuel">
          <div className="result-icon">⛽</div>
          <div className="result-content">
            <div className="result-value">{litersNeeded.toFixed(1)}L</div>
            <div className="result-label">Combustível necessário</div>
          </div>
        </div>
        
        <div className="cost-result-card money">
          <div className="result-icon">💰</div>
          <div className="result-content">
            <div className="result-value">R$ {totalCost.toFixed(2)}</div>
            <div className="result-label">Custo estimado</div>
          </div>
        </div>
        
        <div className="cost-result-card co2">
          <div className="result-icon">🌱</div>
          <div className="result-content">
            <div className="result-value">{co2Emissions.toFixed(1)} kg</div>
            <div className="result-label">Emissão de CO₂</div>
          </div>
        </div>
      </div>
      
      <div className="cost-tip">
        💡 <strong>Dica:</strong> No modo Economia, você pode economizar até 15% em combustível!
      </div>
    </div>
  )
}

export default CostEstimator

