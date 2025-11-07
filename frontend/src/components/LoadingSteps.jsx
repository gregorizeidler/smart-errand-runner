import { useEffect, useState } from 'react'
import { Brain, Search, Map, CheckCircle } from 'lucide-react'
import './LoadingSteps.css'

const steps = [
  { id: 1, icon: Brain, text: 'GPT interpretando seus recados...', duration: 2000 },
  { id: 2, icon: Search, text: 'Buscando locais no Google Maps...', duration: 2500 },
  { id: 3, icon: Map, text: 'Otimizando rota inteligente...', duration: 2000 },
  { id: 4, icon: CheckCircle, text: 'Pronto! Sua rota está otimizada!', duration: 500 }
]

function LoadingSteps({ onComplete }) {
  const [currentStep, setCurrentStep] = useState(0)

  useEffect(() => {
    if (currentStep >= steps.length) {
      setTimeout(() => onComplete?.(), 500)
      return
    }

    const timer = setTimeout(() => {
      setCurrentStep(currentStep + 1)
    }, steps[currentStep]?.duration || 2000)

    return () => clearTimeout(timer)
  }, [currentStep, onComplete])

  return (
    <div className="loading-steps">
      {steps.map((step, index) => {
        const Icon = step.icon
        const isActive = index === currentStep
        const isCompleted = index < currentStep
        
        return (
          <div 
            key={step.id} 
            className={`loading-step ${isActive ? 'active' : ''} ${isCompleted ? 'completed' : ''}`}
          >
            <div className="step-icon">
              <Icon size={24} />
              {isCompleted && <CheckCircle size={16} className="check-overlay" />}
            </div>
            <div className="step-text">
              {step.text}
            </div>
            {isActive && <div className="step-progress"></div>}
          </div>
        )
      })}
    </div>
  )
}

export default LoadingSteps

