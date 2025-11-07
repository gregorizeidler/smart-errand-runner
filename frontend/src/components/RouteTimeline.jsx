import { Clock, MapPin, Navigation, Flag } from 'lucide-react'
import './RouteTimeline.css'

function RouteTimeline({ route }) {
  if (!route || route.length === 0) return null

  return (
    <div className="route-timeline">
      <h3>
        <Navigation size={20} />
        Timeline da Rota
      </h3>
      <div className="timeline-container">
        {route.map((leg, idx) => {
          const isLast = idx === route.length - 1
          const Icon = idx === 0 ? MapPin : isLast ? Flag : MapPin

          return (
            <div key={idx} className="timeline-item">
              <div className="timeline-marker">
                <div className="timeline-icon">
                  <Icon size={20} />
                </div>
                {!isLast && <div className="timeline-line"></div>}
              </div>
              
              <div className="timeline-content">
                <div className="timeline-time">
                  <Clock size={14} />
                  {leg.arrival_time}
                </div>
                <div className="timeline-title">{leg.task}</div>
                <div className="timeline-address">{leg.address}</div>
                <div className="timeline-meta">
                  <span>{leg.duration}</span>
                  <span>•</span>
                  <span>{leg.distance}</span>
                  {leg.closing_time && (
                    <>
                      <span>•</span>
                      <span className="closing-time">Fecha: {leg.closing_time}</span>
                    </>
                  )}
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default RouteTimeline

