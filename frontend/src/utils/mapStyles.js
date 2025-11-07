// Melhoria #16: Tema customizado para Google Maps
// Light theme
export const lightMapStyles = [
  {
    "featureType": "water",
    "elementType": "geometry",
    "stylers": [{ "color": "#e9e9e9" }, { "lightness": 17 }]
  },
  {
    "featureType": "landscape",
    "elementType": "geometry",
    "stylers": [{ "color": "#f5f5f5" }, { "lightness": 20 }]
  },
  {
    "featureType": "road.highway",
    "elementType": "geometry.fill",
    "stylers": [{ "color": "#ffffff" }, { "lightness": 17 }]
  },
  {
    "featureType": "road.highway",
    "elementType": "geometry.stroke",
    "stylers": [{ "color": "#ffffff" }, { "lightness": 29 }, { "weight": 0.2 }]
  },
  {
    "featureType": "road.arterial",
    "elementType": "geometry",
    "stylers": [{ "color": "#ffffff" }, { "lightness": 18 }]
  },
  {
    "featureType": "road.local",
    "elementType": "geometry",
    "stylers": [{ "color": "#ffffff" }, { "lightness": 16 }]
  },
  {
    "featureType": "poi",
    "elementType": "geometry",
    "stylers": [{ "color": "#f5f5f5" }, { "lightness": 21 }]
  },
  {
    "featureType": "poi.park",
    "elementType": "geometry",
    "stylers": [{ "color": "#dedede" }, { "lightness": 21 }]
  },
  {
    "elementType": "labels.text.stroke",
    "stylers": [{ "visibility": "on" }, { "color": "#ffffff" }, { "lightness": 16 }]
  },
  {
    "elementType": "labels.text.fill",
    "stylers": [{ "saturation": 36 }, { "color": "#333333" }, { "lightness": 40 }]
  },
  {
    "elementType": "labels.icon",
    "stylers": [{ "visibility": "off" }]
  },
  {
    "featureType": "transit",
    "elementType": "geometry",
    "stylers": [{ "color": "#f2f2f2" }, { "lightness": 19 }]
  },
  {
    "featureType": "administrative",
    "elementType": "geometry.fill",
    "stylers": [{ "color": "#fefefe" }, { "lightness": 20 }]
  },
  {
    "featureType": "administrative",
    "elementType": "geometry.stroke",
    "stylers": [{ "color": "#fefefe" }, { "lightness": 17 }, { "weight": 1.2 }]
  }
]

// Dark theme
export const darkMapStyles = [
  {
    "elementType": "geometry",
    "stylers": [{ "color": "#212121" }]
  },
  {
    "elementType": "labels.icon",
    "stylers": [{ "visibility": "off" }]
  },
  {
    "elementType": "labels.text.fill",
    "stylers": [{ "color": "#757575" }]
  },
  {
    "elementType": "labels.text.stroke",
    "stylers": [{ "color": "#212121" }]
  },
  {
    "featureType": "administrative",
    "elementType": "geometry",
    "stylers": [{ "color": "#757575" }]
  },
  {
    "featureType": "administrative.country",
    "elementType": "labels.text.fill",
    "stylers": [{ "color": "#9e9e9e" }]
  },
  {
    "featureType": "administrative.locality",
    "elementType": "labels.text.fill",
    "stylers": [{ "color": "#bdbdbd" }]
  },
  {
    "featureType": "poi",
    "elementType": "labels.text.fill",
    "stylers": [{ "color": "#757575" }]
  },
  {
    "featureType": "poi.park",
    "elementType": "geometry",
    "stylers": [{ "color": "#181818" }]
  },
  {
    "featureType": "poi.park",
    "elementType": "labels.text.fill",
    "stylers": [{ "color": "#616161" }]
  },
  {
    "featureType": "poi.park",
    "elementType": "labels.text.stroke",
    "stylers": [{ "color": "#1b1b1b" }]
  },
  {
    "featureType": "road",
    "elementType": "geometry.fill",
    "stylers": [{ "color": "#2c2c2c" }]
  },
  {
    "featureType": "road",
    "elementType": "labels.text.fill",
    "stylers": [{ "color": "#8a8a8a" }]
  },
  {
    "featureType": "road.arterial",
    "elementType": "geometry",
    "stylers": [{ "color": "#373737" }]
  },
  {
    "featureType": "road.highway",
    "elementType": "geometry",
    "stylers": [{ "color": "#3c3c3c" }]
  },
  {
    "featureType": "road.highway.controlled_access",
    "elementType": "geometry",
    "stylers": [{ "color": "#4e4e4e" }]
  },
  {
    "featureType": "road.local",
    "elementType": "labels.text.fill",
    "stylers": [{ "color": "#616161" }]
  },
  {
    "featureType": "transit",
    "elementType": "labels.text.fill",
    "stylers": [{ "color": "#757575" }]
  },
  {
    "featureType": "water",
    "elementType": "geometry",
    "stylers": [{ "color": "#000000" }]
  },
  {
    "featureType": "water",
    "elementType": "labels.text.fill",
    "stylers": [{ "color": "#3d3d3d" }]
  }
]

// Ícones personalizados para cada tipo de lugar
export const customMarkerIcons = {
  bank: 'data:image/svg+xml;charset=UTF-8,%3Csvg xmlns="http://www.w3.org/2000/svg" width="40" height="40"%3E%3Ccircle cx="20" cy="20" r="18" fill="%234CAF50" stroke="white" stroke-width="2"/%3E%3Ctext x="20" y="27" font-size="20" text-anchor="middle" fill="white"%3E🏦%3C/text%3E%3C/svg%3E',
  pharmacy: 'data:image/svg+xml;charset=UTF-8,%3Csvg xmlns="http://www.w3.org/2000/svg" width="40" height="40"%3E%3Ccircle cx="20" cy="20" r="18" fill="%23F44336" stroke="white" stroke-width="2"/%3E%3Ctext x="20" y="27" font-size="20" text-anchor="middle" fill="white"%3E💊%3C/text%3E%3C/svg%3E',
  post_office: 'data:image/svg+xml;charset=UTF-8,%3Csvg xmlns="http://www.w3.org/2000/svg" width="40" height="40"%3E%3Ccircle cx="20" cy="20" r="18" fill="%23FF9800" stroke="white" stroke-width="2"/%3E%3Ctext x="20" y="27" font-size="20" text-anchor="middle" fill="white"%3E📮%3C/text%3E%3C/svg%3E',
  bakery: 'data:image/svg+xml;charset=UTF-8,%3Csvg xmlns="http://www.w3.org/2000/svg" width="40" height="40"%3E%3Ccircle cx="20" cy="20" r="18" fill="%23FFC107" stroke="white" stroke-width="2"/%3E%3Ctext x="20" y="27" font-size="20" text-anchor="middle" fill="white"%3E🍞%3C/text%3E%3C/svg%3E',
  supermarket: 'data:image/svg+xml;charset=UTF-8,%3Csvg xmlns="http://www.w3.org/2000/svg" width="40" height="40"%3E%3Ccircle cx="20" cy="20" r="18" fill="%239C27B0" stroke="white" stroke-width="2"/%3E%3Ctext x="20" y="27" font-size="20" text-anchor="middle" fill="white"%3E🛒%3C/text%3E%3C/svg%3E',
  home: 'data:image/svg+xml;charset=UTF-8,%3Csvg xmlns="http://www.w3.org/2000/svg" width="40" height="40"%3E%3Ccircle cx="20" cy="20" r="18" fill="%232196F3" stroke="white" stroke-width="2"/%3E%3Ctext x="20" y="27" font-size="20" text-anchor="middle" fill="white"%3E🏠%3C/text%3E%3C/svg%3E',
  default: 'data:image/svg+xml;charset=UTF-8,%3Csvg xmlns="http://www.w3.org/2000/svg" width="40" height="40"%3E%3Ccircle cx="20" cy="20" r="18" fill="%232196F3" stroke="white" stroke-width="2"/%3E%3Ctext x="20" y="27" font-size="20" text-anchor="middle" fill="white"%3E📍%3C/text%3E%3C/svg%3E'
}

export function getMarkerIcon(placeName) {
  const lowerName = (placeName || '').toLowerCase()
  
  if (lowerName.includes('banco') || lowerName.includes('bank')) {
    return customMarkerIcons.bank
  }
  if (lowerName.includes('farmácia') || lowerName.includes('pharmacy')) {
    return customMarkerIcons.pharmacy
  }
  if (lowerName.includes('correio') || lowerName.includes('post')) {
    return customMarkerIcons.post_office
  }
  if (lowerName.includes('padaria') || lowerName.includes('bakery') || lowerName.includes('pão')) {
    return customMarkerIcons.bakery
  }
  if (lowerName.includes('mercado') || lowerName.includes('supermarket')) {
    return customMarkerIcons.supermarket
  }
  if (lowerName.includes('casa') || lowerName.includes('home') || lowerName.includes('retornar')) {
    return customMarkerIcons.home
  }
  
  return customMarkerIcons.default
}

