import { useState } from 'react'

export const useGeolocation = () => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const getLocation = async () => {
    setLoading(true)
    setError(null)

    try {
      if (!navigator.geolocation) {
        throw new Error('Geolocalização não suportada pelo navegador')
      }

      const position = await new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0
        })
      })

      const { latitude, longitude } = position.coords

      // Reverse geocoding para obter endereço
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${import.meta.env.VITE_GOOGLE_MAPS_API_KEY}`
      )
      
      const data = await response.json()
      
      if (data.results && data.results[0]) {
        setLoading(false)
        return data.results[0].formatted_address
      }
      
      throw new Error('Não foi possível obter o endereço')
    } catch (err) {
      setError(err.message)
      setLoading(false)
      throw err
    }
  }

  return { getLocation, loading, error }
}

