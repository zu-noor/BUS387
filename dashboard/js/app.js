// Main app controller for integrated dashboard
class DashboardApp {
  constructor() {
    // Initialize all components
    this.initializeComponents();
    
    // Set up navigation and other UI events
    this.setupEventListeners();
    
    // Initialize section visibility
    this.initializeSectionVisibility();
    
    // Initialize theme from localStorage
    this.initializeTheme();
    
    // Add notification container
    this.createNotificationContainer();
  }

  // Initialize all components
  initializeComponents() {
    // Initialize Notes Manager
    notesManager.initialize();
    
    // Initialize Blog Manager
    blogManager.initialize();
    
    // Initialize Travel Map functionality
    this.initializeTravelMapFunctionality();
  }

  // Initialize travel map functionality
  initializeTravelMapFunctionality() {
    // Initialize dashboard map preview
    travelMapManager.initPreviewMap();
    
    // Add recent travel entries to preview map
    const recentEntries = dataManager.getRecentTravelEntries(5);
    travelMapManager.addPreviewMarkers(recentEntries);
    
    // Set up travel entry preview on dashboard
    this.renderTravelEntriesPreview();
    
    // Add event listeners for travel section
    const addLocationBtn = document.getElementById('add-location-btn');
    if (addLocationBtn) {
      addLocationBtn.addEventListener('click', () => this.showAddLocationModal());
    }
    
    // Add location form submission
    const locationForm = document.getElementById('travel-location-form');
    if (locationForm) {
      locationForm.addEventListener('submit', (e) => {
        e.preventDefault();
        this.createNewTravelEntry();
      });
    }
    
    // Initialize travel section when it becomes visible
    document.querySelector('[data-section="travel"]').addEventListener('click', () => {
      // Initialize full map if not already
      travelMapManager.initMap();
      
      // Add entries to map
      const entries = dataManager.getTravelEntries();
      travelMapManager.addMarkers(entries);
      
      // Render entries list
      this.renderTravelEntriesList();
    });
  }

  // Set up event listeners
  setupEventListeners() {
    // Navigation links
    document.querySelectorAll('.main-nav a').forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        
        // Update active navigation link
        document.querySelectorAll('.main-nav a').forEach(navLink => {
          navLink.classList.remove('active');
        });
        link.classList.add('active');
        
        // Show the corresponding section
        const sectionId = link.getAttribute('data-section');
        this.showSection(sectionId);
      });
    });
    
    // Dashboard quick links
    document.querySelectorAll('.view-more').forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        
        // Update active navigation link
        const sectionId = link.getAttribute('data-section');
        document.querySelectorAll('.main-nav a').forEach(navLink => {
          navLink.classList.remove('active');
          if (navLink.getAttribute('data-section') === sectionId) {
            navLink.classList.add('active');
          }
        });
        
        // Show the corresponding section
        this.showSection(sectionId);
      });
    });

    // Theme toggle
    const themeSwitch = document.getElementById('theme-switch');
    themeSwitch.addEventListener('change', () => {
      if (themeSwitch.checked) {
        document.body.classList.remove('light-mode');
        document.body.classList.add('dark-mode');
        localStorage.setItem('theme', 'dark');
      } else {
        document.body.classList.remove('dark-mode');
        document.body.classList.add('light-mode');
        localStorage.setItem('theme', 'light');
      }
      
      // Resize maps when theme changes (to fix rendering issues)
      setTimeout(() => {
        travelMapManager.resizeMaps();
      }, 100);
    });
    
    // Add event for new travel entry
    document.getElementById('new-travel-btn').addEventListener('click', () => {
      // Navigate to travel section
      document.querySelectorAll('.main-nav a').forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('data-section') === 'travel') {
          link.classList.add('active');
        }
      });
      
      this.showSection('travel');
      
      // Show add location modal
      this.showAddLocationModal();
    });
    
    // Window resize event
    window.addEventListener('resize', () => {
      travelMapManager.resizeMaps();
    });
  }

  // Initialize section visibility
  initializeSectionVisibility() {
    // Hide all sections except dashboard
    document.querySelectorAll('main section').forEach(section => {
      if (section.id !== 'dashboard') {
        section.classList.add('hidden-section');
      } else {
        section.classList.add('active-section');
      }
    });
  }

  // Initialize theme from localStorage
  initializeTheme() {
    const savedTheme = localStorage.getItem('theme');
    
    if (savedTheme === 'dark') {
      document.body.classList.remove('light-mode');
      document.body.classList.add('dark-mode');
      document.getElementById('theme-switch').checked = true;
    } else {
      document.body.classList.remove('dark-mode');
      document.body.classList.add('light-mode');
      document.getElementById('theme-switch').checked = false;
    }
  }

  // Show a specific section
  showSection(sectionId) {
    // Hide all sections
    document.querySelectorAll('main section').forEach(section => {
      section.classList.add('hidden-section');
      section.classList.remove('active-section');
    });
    
    // Show requested section
    const section = document.getElementById(sectionId);
    if (section) {
      section.classList.remove('hidden-section');
      section.classList.add('active-section');
      
      // Special handling for travel section
      if (sectionId === 'travel') {
        // Initialize map if needed
        travelMapManager.initMap();
        setTimeout(() => {
          travelMapManager.resizeMaps();
        }, 100);
      }
    }
  }

  // Render travel entries list
  renderTravelEntriesList() {
    const entriesList = document.getElementById('travel-entries-list');
    if (!entriesList) return;
    
    // Clear list
    entriesList.innerHTML = '';
    
    // Get entries
    const entries = dataManager.getTravelEntries();
    
    if (entries.length === 0) {
      entriesList.innerHTML = '<div class="empty-state">No travel entries yet.</div>';
      return;
    }
    
    // Sort by date (newest first)
    const sortedEntries = [...entries].sort((a, b) => 
      new Date(b.date) - new Date(a.date)
    );
    
    // Create entry items
    sortedEntries.forEach(entry => {
      const entryItem = document.createElement('div');
      entryItem.className = 'travel-entry';
      
      const formattedDate = new Date(entry.date).toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
      
      entryItem.innerHTML = `
        ${entry.image ? `<img src="${entry.image}" alt="${entry.name}" class="travel-entry-img">` : ''}
        <div class="travel-entry-content">
          <h4>${entry.name}</h4>
          <div class="travel-entry-date">${formattedDate}</div>
          <p>${entry.notes}</p>
        </div>
      `;
      
      // Add click event to fly to location on map
      entryItem.addEventListener('click', () => {
        travelMapManager.flyToEntry(entry);
      });
      
      entriesList.appendChild(entryItem);
    });
  }

  // Render travel entries preview on dashboard
  renderTravelEntriesPreview() {
    // Not needed as we're using the map as preview
  }

  // Show add location modal
  showAddLocationModal() {
    const modal = document.getElementById('add-location-modal');
    if (!modal) return;
    
    // Initialize map if not already
    if (!travelMapManager.mapInitialized) {
      travelMapManager.initMap();
    }
    
    // Reset form
    const form = modal.querySelector('#travel-location-form');
    if (form) {
      form.reset();
    }
    
    // Show modal
    modal.classList.add('show');
  }

  // Create a new travel entry
  createNewTravelEntry() {
    const name = document.getElementById('location-name').value;
    const dateValue = document.getElementById('location-date').value;
    const notes = document.getElementById('location-notes').value;
    const imageUrl = document.getElementById('location-img').value;
    const lat = parseFloat(document.getElementById('location-lat').value);
    const lng = parseFloat(document.getElementById('location-lng').value);
    
    if (!name || !dateValue || isNaN(lat) || isNaN(lng)) {
      alert('Please fill in all required fields');
      return;
    }
    
    // Convert date string to ISO format
    const date = new Date(dateValue).toISOString();
    
    // Create new entry
    const newEntry = dataManager.addTravelEntry({
      name,
      date,
      notes,
      image: imageUrl || '',
      coordinates: {
        lat,
        lng
      }
    });
    
    // Close modal
    document.getElementById('add-location-modal').classList.remove('show');
    
    // Update maps
    const entries = dataManager.getTravelEntries();
    travelMapManager.addMarkers(entries);
    
    // Update preview map
    const recentEntries = dataManager.getRecentTravelEntries(5);
    travelMapManager.addPreviewMarkers(recentEntries);
    
    // Update entries list
    this.renderTravelEntriesList();
    
    // Show success message
    this.showNotification('Travel location added successfully');
    
    // Remove temporary marker
    if (travelMapManager.tempMarker) {
      travelMapManager.tempMarker.remove();
      travelMapManager.tempMarker = null;
    }
  }

  // Create a notification container if needed
  createNotificationContainer() {
    if (!document.querySelector('.notification-container')) {
      const container = document.createElement('div');
      container.className = 'notification-container';
      document.body.appendChild(container);
      
      // Add styles if not already in CSS
      if (!document.querySelector('#notification-styles')) {
        const style = document.createElement('style');
        style.id = 'notification-styles';
        style.textContent = `
          .notification-container {
            position: fixed;
            top: 20px;
            right: 20px;
            z-index: 9999;
          }
          .notification {
            background-color: var(--primary-color);
            color: white;
            padding: 12px 20px;
            margin-bottom: 10px;
            border-radius: 4px;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
            animation: fadeIn 0.3s ease-in;
          }
          .notification.fade-out {
            animation: fadeOut 0.3s ease-out;
          }
          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(-10px); }
            to { opacity: 1; transform: translateY(0); }
          }
          @keyframes fadeOut {
            from { opacity: 1; transform: translateY(0); }
            to { opacity: 0; transform: translateY(-10px); }
          }
        `;
        document.head.appendChild(style);
      }
    }
  }

  // Show a notification
  showNotification(message) {
    const container = document.querySelector('.notification-container');
    if (!container) return;
    
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.textContent = message;
    
    container.appendChild(notification);
    
    setTimeout(() => {
      notification.classList.add('fade-out');
      setTimeout(() => {
        container.removeChild(notification);
      }, 300);
    }, 3000);
  }
}

// Initialize the dashboard when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  const app = new DashboardApp();
});