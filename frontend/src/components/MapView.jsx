import { GoogleMap, LoadScript, Marker, Polyline, InfoWindow } from '@react-google-maps/api'
import { useState, useEffect } from 'react'
import polyline from '@mapbox/polyline'
import { lightMapStyles, darkMapStyles, getMarkerIcon } from '../utils/mapStyles'

const containerStyle = {
  width: '100%',
  height: '500px',
  borderRadius: '12px'
}

function MapView({ route, nearbyPoints }) {
  const [selectedMarker, setSelectedMarker] = useState(null)
  const [map, setMap] = useState(null)
  const [isDark, setIsDark] = useState(false)
  
  // Melhoria #16: Detectar modo escuro
  useEffect(() => {
    const theme = document.documentElement.getAttribute('data-theme')
    setIsDark(theme === 'dark')
    
    // Observar mudanças no tema
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.attributeName === 'data-theme') {
          const newTheme = document.documentElement.getAttribute('data-theme')
          setIsDark(newTheme === 'dark')
        }
      })
    })
    
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-theme']
    })
    
    return () => observer.disconnect()
  }, [])

  // Decode polylines and create path
  const paths = route.map(leg => {
    if (leg.polyline) {
      try {
        const decoded = polyline.decode(leg.polyline)
        return decoded.map(([lat, lng]) => ({ lat, lng }))
      } catch (e) {
        return []
      }
    }
    return []
  }).flat()

  // Get all markers
  const markers = route
    .filter(leg => leg.end_location)
    .map((leg, idx) => ({
      position: leg.end_location,
      title: leg.task,
      label: (idx + 1).toString(),
      info: {
        task: leg.task,
        address: leg.address,
        arrival: leg.arrival_time,
        closing: leg.closing_time,
        duration: leg.duration,
        distance: leg.distance
      }
    }))

  // Calculate center
  const center = markers.length > 0 
    ? markers[0].position 
    : { lat: -23.5505, lng: -46.6333 }

  const onLoad = (map) => {
    setMap(map)
    
    // Fit bounds to show all markers
    if (markers.length > 0) {
      const bounds = new window.google.maps.LatLngBounds()
      markers.forEach(marker => {
        bounds.extend(marker.position)
      })
      map.fitBounds(bounds)
    }
  }

  // Create markers for nearby points
  const nearbyMarkers = nearbyPoints?.map((point, idx) => ({
    position: point.location,
    title: point.name,
    type: point.type,
    info: point
  })) || []

  // DESIGN #3: Mapa 3D com Edifícios
  const enable3D = () => {
    if (map) {
      map.setTilt(45) // Inclinação 3D
      map.setMapTypeId('satellite') // Modo satélite mostra edifícios 3D
      // Para voltar: map.setTilt(0) e map.setMapTypeId('roadmap')
    }
  }

  // Melhoria #16: Opções do mapa com tema customizado
  const mapOptions = {
    styles: isDark ? darkMapStyles : lightMapStyles,
    disableDefaultUI: false,
    zoomControl: true,
    mapTypeControl: true, // Permite alternar para visualização 3D
    streetViewControl: true, // FEATURE #11: AR Preview
    fullscreenControl: true,
    rotateControl: true, // Para mapa 3D
    tilt: 0, // Pode ser 45 para 3D
  }

  return (
    <LoadScript googleMapsApiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY || 'YOUR_API_KEY'}>
      <GoogleMap
        mapContainerStyle={containerStyle}
        center={center}
        zoom={13}
        onLoad={onLoad}
        options={mapOptions}
      >
        {/* Draw route path */}
        {paths.length > 0 && (
          <Polyline
            path={paths}
            options={{
              strokeColor: '#2196F3',
              strokeOpacity: 0.8,
              strokeWeight: 4,
            }}
          />
        )}

        {/* Place markers for route with custom icons (Melhoria #16) */}
        {markers.map((marker, idx) => (
          <Marker
            key={`route-${idx}`}
            position={marker.position}
            icon={{
              url: getMarkerIcon(marker.info.task),
              scaledSize: new window.google.maps.Size(40, 40)
            }}
            label={{
              text: marker.label,
              color: 'white',
              fontWeight: 'bold',
              fontSize: '14px'
            }}
            onClick={() => setSelectedMarker({ type: 'route', idx })}
            animation={window.google.maps.Animation.DROP}
          />
        ))}

        {/* Place markers for nearby points */}
        {nearbyMarkers.map((marker, idx) => (
          <Marker
            key={`nearby-${idx}`}
            position={marker.position}
            icon={{
              url: 'http://maps.google.com/mapfiles/ms/icons/orange-dot.png'
            }}
            onClick={() => setSelectedMarker({ type: 'nearby', idx })}
          />
        ))}

        {/* Show info window for selected marker */}
        {selectedMarker !== null && selectedMarker.type === 'route' && (
          <InfoWindow
            position={markers[selectedMarker.idx].position}
            onCloseClick={() => setSelectedMarker(null)}
          >
            <div style={{ padding: '8px', maxWidth: '250px' }}>
              <h3 style={{ margin: '0 0 8px 0', fontSize: '16px' }}>
                {markers[selectedMarker.idx].info.task}
              </h3>
              <p style={{ margin: '4px 0', fontSize: '13px', color: '#666' }}>
                {markers[selectedMarker.idx].info.address}
              </p>
              <div style={{ marginTop: '8px', fontSize: '12px' }}>
                <div><strong>Chegada:</strong> {markers[selectedMarker.idx].info.arrival}</div>
                {markers[selectedMarker.idx].info.closing && (
                  <div><strong>Fecha:</strong> {markers[selectedMarker.idx].info.closing}</div>
                )}
                <div><strong>Tempo:</strong> {markers[selectedMarker.idx].info.duration}</div>
                <div><strong>Distância:</strong> {markers[selectedMarker.idx].info.distance}</div>
              </div>
            </div>
          </InfoWindow>
        )}

        {/* Show info window for nearby points */}
        {selectedMarker !== null && selectedMarker.type === 'nearby' && (
          <InfoWindow
            position={nearbyMarkers[selectedMarker.idx].position}
            onCloseClick={() => setSelectedMarker(null)}
          >
            <div style={{ padding: '8px', maxWidth: '250px' }}>
              <h3 style={{ margin: '0 0 8px 0', fontSize: '16px', color: '#FF9800' }}>
                📍 {nearbyMarkers[selectedMarker.idx].title}
              </h3>
              <p style={{ margin: '4px 0', fontSize: '13px', color: '#666' }}>
                {nearbyMarkers[selectedMarker.idx].type}
              </p>
              <p style={{ margin: '4px 0', fontSize: '12px', fontStyle: 'italic' }}>
                {nearbyMarkers[selectedMarker.idx].info.between}
              </p>
            </div>
          </InfoWindow>
        )}
      </GoogleMap>
    </LoadScript>
  )
}

export default MapView

