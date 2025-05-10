// Map management for travel diary
class TravelMapManager {
  constructor() {
    this.map = null;
    this.previewMap = null;
    this.markers = {};
    this.mapboxToken = "pk.eyJ1Ijoiem5vb3IiLCJhIjoiY21hZ3U4ankyMDR4NzJyb2ZnOXJwOGRlMCJ9.4nJMlIObtEiRQmoLhFFQbw";
    this.mapInitialized = false;
    this.previewMapInitialized = false;
    this.tempMarker = null;
    this.selectedLocation = null;
  }

  // Initialize the full travel map
  initMap() {
    if (this.mapInitialized || !document.getElementById('travel-map')) return;
    
    mapboxgl.accessToken = this.mapboxToken;

    this.map = new mapboxgl.Map({
      container: 'travel-map',
      style: 'mapbox://styles/mapbox/streets-v11',
      center: [0, 20], // Center on world view
      zoom: 1.5
    });

    // Add navigation controls
    this.map.addControl(new mapboxgl.NavigationControl(), 'top-right');

    // Add geolocate control
    this.map.addControl(
      new mapboxgl.GeolocateControl({
        positionOptions: {
          enableHighAccuracy: true
        },
        trackUserLocation: true
      })
    );

    // Make map responsive
    this.map.on('load', () => {
      this.map.resize();
    });

    // Click event for adding new location
    this.map.on('click', (e) => {
      const coordinates = e.lngLat;
      
      // If we're in add mode (form is visible)
      if (document.getElementById('add-location-modal').classList.contains('show')) {
        // Update form coordinates
        document.getElementById('location-lat').value = coordinates.lat.toFixed(6);
        document.getElementById('location-lng').value = coordinates.lng.toFixed(6);
        
        // Add or move temporary marker
        this.addTempMarker(coordinates);
      }
    });

    this.mapInitialized = true;
  }

  // Initialize the map preview on dashboard
  initPreviewMap() {
    if (this.previewMapInitialized || !document.getElementById('map-preview')) return;
    
    mapboxgl.accessToken = this.mapboxToken;

    this.previewMap = new mapboxgl.Map({
      container: 'map-preview',
      style: 'mapbox://styles/mapbox/streets-v11',
      center: [0, 20], // Center on world view
      zoom: 1,
      interactive: false // Disable interactions for preview
    });

    this.previewMapInitialized = true;
  }

  // Add markers for travel entries
  addMarkers(entries) {
    if (!this.map || !this.mapInitialized) return;
    
    // Clear existing markers
    this.clearMarkers();
    
    // Add new markers
    entries.forEach(entry => {
      const el = document.createElement('div');
      el.className = 'marker';
      el.style.backgroundImage = 'url(https://cdn0.iconfinder.com/data/icons/small-n-flat/24/678111-map-marker-512.png)';
      el.style.width = '32px';
      el.style.height = '32px';
      el.style.backgroundSize = 'cover';
      
      // Create popup
      const popup = new mapboxgl.Popup({ offset: 25 })
        .setHTML(`
          <h3>${entry.name}</h3>
          <p>${new Date(entry.date).toLocaleDateString()}</p>
          ${entry.image ? `<img src="${entry.image}" alt="${entry.name}" style="width:100%;max-height:150px;object-fit:cover;">` : ''}
          <p>${entry.notes}</p>
        `);
      
      // Create marker
      const marker = new mapboxgl.Marker(el)
        .setLngLat([entry.coordinates.lng, entry.coordinates.lat])
        .setPopup(popup)
        .addTo(this.map);
      
      this.markers[entry.id] = marker;
    });
    
    // Fit bounds to markers if there are any
    if (entries.length > 0) {
      this.fitMapToMarkers(entries);
    }
  }

  // Add markers to preview map
  addPreviewMarkers(entries) {
    if (!this.previewMap || !this.previewMapInitialized) return;
    
    // Clear any existing markers
    if (this.previewMarkers) {
      this.previewMarkers.forEach(marker => marker.remove());
    }
    this.previewMarkers = [];
    
    // Add markers for preview (simpler, without popups)
    entries.forEach(entry => {
      const el = document.createElement('div');
      el.className = 'marker';
      el.style.backgroundImage = 'url(https://cdn0.iconfinder.com/data/icons/small-n-flat/24/678111-map-marker-512.png)';
      el.style.width = '24px';
      el.style.height = '24px';
      el.style.backgroundSize = 'cover';
      
      const marker = new mapboxgl.Marker(el)
        .setLngLat([entry.coordinates.lng, entry.coordinates.lat])
        .addTo(this.previewMap);
      
      this.previewMarkers.push(marker);
    });
    
    // Fit bounds to markers
    if (entries.length > 0) {
      this.fitPreviewMapToMarkers(entries);
    }
  }

  // Add temporary marker when selecting location
  addTempMarker(coordinates) {
    // Remove existing temp marker if there is one
    if (this.tempMarker) {
      this.tempMarker.remove();
    }
    
    // Create a temporary marker
    const el = document.createElement('div');
    el.className = 'temp-marker';
    el.style.backgroundImage = 'url(https://cdn0.iconfinder.com/data/icons/small-n-flat/24/678111-map-marker-512.png)';
    el.style.width = '32px';
    el.style.height = '32px';
    el.style.backgroundSize = 'cover';
    el.style.filter = 'hue-rotate(120deg)'; // Make it a different color
    
    this.tempMarker = new mapboxgl.Marker(el)
      .setLngLat(coordinates)
      .addTo(this.map);
  }

  // Clear all markers
  clearMarkers() {
    Object.values(this.markers).forEach(marker => marker.remove());
    this.markers = {};
  }

  // Fit map to show all markers
  fitMapToMarkers(entries) {
    if (!this.map || entries.length === 0) return;
    
    const bounds = new mapboxgl.LngLatBounds();
    
    entries.forEach(entry => {
      bounds.extend([entry.coordinates.lng, entry.coordinates.lat]);
    });
    
    this.map.fitBounds(bounds, {
      padding: 50,
      maxZoom: 10
    });
  }

  // Fit preview map to show all markers
  fitPreviewMapToMarkers(entries) {
    if (!this.previewMap || entries.length === 0) return;
    
    const bounds = new mapboxgl.LngLatBounds();
    
    entries.forEach(entry => {
      bounds.extend([entry.coordinates.lng, entry.coordinates.lat]);
    });
    
    this.previewMap.fitBounds(bounds, {
      padding: 20,
      maxZoom: 8
    });
  }

  // Fly to a specific entry
  flyToEntry(entry) {
    if (!this.map) return;
    
    this.map.flyTo({
      center: [entry.coordinates.lng, entry.coordinates.lat],
      zoom: 10,
      essential: true
    });
    
    // Open the popup
    if (this.markers[entry.id]) {
      this.markers[entry.id].togglePopup();
    }
  }

  // Resize maps when container size changes
  resizeMaps() {
    if (this.map) {
      this.map.resize();
    }
    if (this.previewMap) {
      this.previewMap.resize();
    }
  }
}

// Export map manager
const travelMapManager = new TravelMapManager();