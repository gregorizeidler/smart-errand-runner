import './SkeletonLoader.css'

// DESIGN #5: Skeleton Screens Animados
function SkeletonLoader({ type = 'card' }) {
  if (type === 'map') {
    return (
      <div className="skeleton-map">
        <div className="skeleton-map-header shimmer" />
        <div className="skeleton-map-body">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="skeleton-marker shimmer" 
                 style={{ top: `${20 + i * 30}%`, left: `${20 + i * 20}%` }} />
          ))}
        </div>
      </div>
    )
  }

  if (type === 'timeline') {
    return (
      <div className="skeleton-timeline">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="skeleton-timeline-item">
            <div className="skeleton-circle shimmer" />
            <div className="skeleton-content">
              <div className="skeleton-line shimmer" style={{ width: '70%' }} />
              <div className="skeleton-line shimmer" style={{ width: '50%', marginTop: '8px' }} />
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (type === 'stats') {
    return (
      <div className="skeleton-stats">
        <div className="skeleton-stat-item">
          <div className="skeleton-circle shimmer" style={{ width: '60px', height: '60px' }} />
          <div className="skeleton-line shimmer" style={{ width: '80px', marginTop: '8px' }} />
        </div>
        <div className="skeleton-stat-item">
          <div className="skeleton-circle shimmer" style={{ width: '60px', height: '60px' }} />
          <div className="skeleton-line shimmer" style={{ width: '80px', marginTop: '8px' }} />
        </div>
      </div>
    )
  }

  // Default card skeleton
  return (
    <div className="skeleton-card">
      <div className="skeleton-header">
        <div className="skeleton-circle shimmer" style={{ width: '40px', height: '40px' }} />
        <div className="skeleton-line shimmer" style={{ width: '60%' }} />
      </div>
      <div className="skeleton-body">
        <div className="skeleton-line shimmer" style={{ width: '100%' }} />
        <div className="skeleton-line shimmer" style={{ width: '80%', marginTop: '8px' }} />
        <div className="skeleton-line shimmer" style={{ width: '90%', marginTop: '8px' }} />
      </div>
    </div>
  )
}

export default SkeletonLoader

