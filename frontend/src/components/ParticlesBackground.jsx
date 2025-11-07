import { useEffect, useRef } from 'react'

// DESIGN #2: Animações de Partículas
function ParticlesBackground({ count = 50 }) {
  const containerRef = useRef(null)

  useEffect(() => {
    if (!containerRef.current) return

    const particles = []
    const container = containerRef.current

    for (let i = 0; i < count; i++) {
      const particle = document.createElement('div')
      particle.className = 'particle'
      
      // Random position
      particle.style.left = `${Math.random() * 100}%`
      particle.style.top = `${Math.random() * 100}%`
      
      // Random animation delay and duration
      particle.style.animationDelay = `${Math.random() * 3}s`
      particle.style.animationDuration = `${3 + Math.random() * 4}s`
      
      // Random size
      const size = 2 + Math.random() * 4
      particle.style.width = `${size}px`
      particle.style.height = `${size}px`
      
      container.appendChild(particle)
      particles.push(particle)
    }

    return () => {
      particles.forEach(p => p.remove())
    }
  }, [count])

  return <div ref={containerRef} className="particles-container" />
}

export default ParticlesBackground

