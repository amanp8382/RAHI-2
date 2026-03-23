// Smart Tourism Safety Dashboard - JavaScript

document.addEventListener('DOMContentLoaded', function() {
    // Initialize dashboard
    initDashboard();
});

function initDashboard() {
    // Initialize navigation
    initNavigation();
    
    // Initialize dropdowns
    initDropdowns();
    
    // Initialize search functionality
    initSearch();
    
    // Initialize filters
    initFilters();
    
    // Initialize real-time updates
    initRealTimeUpdates();
    
    // Initialize tooltips and interactions
    initInteractions();
    
    console.log('RAAHI Dashboard initialized successfully');
}

// Navigation Management
function initNavigation() {
    const menuItems = document.querySelectorAll('.menu-item');
    const views = document.querySelectorAll('.view');
    
    menuItems.forEach(item => {
        item.addEventListener('click', function() {
            const targetView = this.getAttribute('data-view');
            
            // Remove active class from all menu items and views
            menuItems.forEach(mi => mi.classList.remove('active'));
            views.forEach(view => view.classList.remove('active'));
            
            // Add active class to clicked menu item and corresponding view
            this.classList.add('active');
            document.getElementById(targetView + '-view').classList.add('active');
            
            // Update page title
            updatePageTitle(targetView);
        });
    });
}

function updatePageTitle(viewName) {
    const titles = {
        dashboard: 'Core Monitoring Dashboard',
        incidents: 'Incident Management',
        tourists: 'Tourist Management'
    };
    
    document.title = `RAAHI - ${titles[viewName] || 'Smart Tourism Safety'}`;
}

// Dropdown Management
function initDropdowns() {
    // Close dropdowns when clicking outside
    document.addEventListener('click', function(event) {
        const dropdowns = document.querySelectorAll('.dropdown-menu');
        const clickableElements = [
            '.notification-icon', '.admin-profile', '.location-selector', 
            '.time-range-selector', '.export-button', '.system-status',
            '.language-selector', '.help-button'
        ];
        
        const isClickableElement = clickableElements.some(selector => 
            event.target.closest(selector)
        );
        
        dropdowns.forEach(dropdown => {
            if (!dropdown.contains(event.target) && !isClickableElement) {
                dropdown.classList.remove('active');
            }
        });
    });
    
    // Initialize search filter buttons
    initSearchFilterButtons();
}

function toggleNotifications() {
    const dropdown = document.getElementById('notification-dropdown');
    const profileDropdown = document.getElementById('profile-dropdown');
    
    // Close profile dropdown if open
    profileDropdown.classList.remove('active');
    
    // Toggle notifications dropdown
    dropdown.classList.toggle('active');
    
    // Mark notifications as read when opened
    if (dropdown.classList.contains('active')) {
        markNotificationsAsRead();
    }
}

function toggleProfileMenu() {
    const dropdown = document.getElementById('profile-dropdown');
    const notificationDropdown = document.getElementById('notification-dropdown');
    
    // Close notification dropdown if open
    notificationDropdown.classList.remove('active');
    
    // Toggle profile dropdown
    dropdown.classList.toggle('active');
}

function markNotificationsAsRead() {
    const unreadItems = document.querySelectorAll('.notification-item.unread');
    unreadItems.forEach(item => {
        item.classList.remove('unread');
    });
    
    // Update notification badge
    const badge = document.querySelector('.notification-badge');
    if (badge) {
        badge.textContent = '0';
        badge.style.display = 'none';
    }
}

// New Header Functions
function toggleLocationSelector() {
    closeAllDropdowns();
    const dropdown = document.getElementById('location-dropdown');
    dropdown.classList.toggle('active');
}

function toggleTimeRange() {
    closeAllDropdowns();
    const dropdown = document.getElementById('timerange-dropdown');
    dropdown.classList.toggle('active');
}

function toggleExportMenu() {
    closeAllDropdowns();
    const dropdown = document.getElementById('export-dropdown');
    dropdown.classList.toggle('active');
}

function toggleSystemStatus() {
    closeAllDropdowns();
    const dropdown = document.getElementById('system-status-dropdown');
    dropdown.classList.toggle('active');
}

function toggleLanguageMenu() {
    closeAllDropdowns();
    const dropdown = document.getElementById('language-dropdown');
    dropdown.classList.toggle('active');
}

function toggleHelpMenu() {
    closeAllDropdowns();
    const dropdown = document.getElementById('help-dropdown');
    dropdown.classList.toggle('active');
}

function triggerEmergency() {
    const confirmed = confirm('Are you sure you want to trigger an emergency alert? This will notify all emergency services and initiate emergency protocols.');
    if (confirmed) {
        showNotification('Emergency Alert Triggered! All emergency services have been notified.', 'error');
        
        // Add emergency indicator to the page
        document.body.classList.add('emergency-mode');
        
        // Change emergency button to show active state
        const emergencyBtn = document.querySelector('.emergency-button');
        emergencyBtn.innerHTML = '<i class="fas fa-times-circle"></i><span>Emergency Active</span>';
        emergencyBtn.style.background = 'var(--red-500)';
        emergencyBtn.style.color = 'white';
        emergencyBtn.onclick = cancelEmergency;
    }
}

function cancelEmergency() {
    const confirmed = confirm('Cancel emergency alert?');
    if (confirmed) {
        document.body.classList.remove('emergency-mode');
        const emergencyBtn = document.querySelector('.emergency-button');
        emergencyBtn.innerHTML = '<i class="fas fa-exclamation-circle"></i><span>Emergency</span>';
        emergencyBtn.style.background = '';
        emergencyBtn.style.color = '';
        emergencyBtn.onclick = triggerEmergency;
        showNotification('Emergency alert cancelled.', 'info');
    }
}

function closeAllDropdowns() {
    document.querySelectorAll('.dropdown-menu.active').forEach(dropdown => {
        dropdown.classList.remove('active');
    });
}

// Search Filter Functions
function initSearchFilterButtons() {
    const filterButtons = document.querySelectorAll('.search-filter-btn');
    filterButtons.forEach(button => {
        button.addEventListener('click', function() {
            // Remove active class from all filter buttons
            filterButtons.forEach(btn => btn.classList.remove('active'));
            // Add active class to clicked button
            this.classList.add('active');
            
            // Update search behavior based on selected filter
            const filterType = this.getAttribute('data-filter');
            updateSearchContext(filterType);
        });
    });
}

function updateSearchContext(filterType) {
    const searchInput = document.getElementById('globalSearch');
    const placeholders = {
        all: 'Search by Tourist ID or Incident ID...',
        tourists: 'Search tourists by ID, name, or location...',
        incidents: 'Search incidents by ID, type, or location...',
        locations: 'Search by location name or area...'
    };
    
    searchInput.placeholder = placeholders[filterType] || placeholders.all;
    searchInput.setAttribute('data-filter', filterType);
}

// Search Functionality
function initSearch() {
    const globalSearch = document.getElementById('globalSearch');
    const touristSearch = document.querySelector('.tourists-main .search-bar input');
    
    if (globalSearch) {
        globalSearch.addEventListener('input', function(e) {
            handleGlobalSearch(e.target.value);
        });
        
        globalSearch.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                executeSearch(e.target.value);
            }
        });
    }
    
    if (touristSearch) {
        touristSearch.addEventListener('input', function(e) {
            handleTouristSearch(e.target.value);
        });
    }
}

function handleGlobalSearch(query) {
    if (query.length < 2) return;
    
    const filterType = document.getElementById('globalSearch').getAttribute('data-filter') || 'all';
    
    // Enhanced search based on filter type
    switch (filterType) {
        case 'tourists':
            performTouristSearch(query);
            break;
        case 'incidents':
            performIncidentSearch(query);
            break;
        case 'locations':
            performLocationSearch(query);
            break;
        default:
            performGlobalSearch(query);
    }
}

function performTouristSearch(query) {
    switchToView('tourists');
    setTimeout(() => handleTouristSearch(query), 300);
}

function performIncidentSearch(query) {
    switchToView('incidents');
    // Filter incidents based on query
    console.log('Incident search:', query);
}

function performLocationSearch(query) {
    console.log('Location search:', query);
    showNotification(`Searching locations for: ${query}`, 'info');
}

function performGlobalSearch(query) {
    // Show search suggestions or results
    console.log('Global search:', query);
    
    // Here you would typically make an API call to search
    // For demo purposes, we'll just log the search
}

function executeSearch(query) {
    if (!query.trim()) return;
    
    // Check if it's a tourist ID or incident ID
    if (query.startsWith('T00') || query.startsWith('#INC')) {
        // Redirect to appropriate view and highlight result
        if (query.startsWith('T00')) {
            switchToView('tourists');
            highlightTourist(query);
        } else {
            switchToView('incidents');
            highlightIncident(query);
        }
    }
}

function handleTouristSearch(query) {
    const touristCards = document.querySelectorAll('.tourist-card');
    
    touristCards.forEach(card => {
        const name = card.querySelector('h4').textContent.toLowerCase();
        const id = card.querySelector('.tourist-id').textContent.toLowerCase();
        const location = card.querySelector('.tourist-location span').textContent.toLowerCase();
        
        const searchTerms = query.toLowerCase();
        const matches = name.includes(searchTerms) || 
                       id.includes(searchTerms) || 
                       location.includes(searchTerms);
        
        card.style.display = matches ? 'flex' : 'none';
    });
}

function switchToView(viewName) {
    const menuItem = document.querySelector(`[data-view="${viewName}"]`);
    if (menuItem) {
        menuItem.click();
    }
}

function highlightTourist(touristId) {
    setTimeout(() => {
        const touristCards = document.querySelectorAll('.tourist-card');
        touristCards.forEach(card => {
            const cardId = card.querySelector('.tourist-id').textContent;
            if (cardId.includes(touristId)) {
                card.scrollIntoView({ behavior: 'smooth', block: 'center' });
                card.style.boxShadow = '0 0 20px rgba(79, 70, 229, 0.3)';
                setTimeout(() => {
                    card.style.boxShadow = '';
                }, 3000);
            }
        });
    }, 300);
}

function highlightIncident(incidentId) {
    setTimeout(() => {
        const incidentCards = document.querySelectorAll('.incident-card');
        incidentCards.forEach(card => {
            const cardId = card.querySelector('.incident-id').textContent;
            if (cardId === incidentId) {
                card.scrollIntoView({ behavior: 'smooth', block: 'center' });
                card.style.boxShadow = '0 0 20px rgba(79, 70, 229, 0.3)';
                setTimeout(() => {
                    card.style.boxShadow = '';
                }, 3000);
            }
        });
    }, 300);
}

// Filter Management
function initFilters() {
    // Tourist filters
    const filterButtons = document.querySelectorAll('.filter-btn');
    filterButtons.forEach(button => {
        button.addEventListener('click', function() {
            // Remove active class from all buttons
            filterButtons.forEach(btn => btn.classList.remove('active'));
            // Add active class to clicked button
            this.classList.add('active');
            
            // Apply filter
            applyTouristFilter(this.textContent.toLowerCase());
        });
    });
    
    // Incident filters
    const incidentFilters = document.querySelectorAll('.filter-select');
    incidentFilters.forEach(select => {
        select.addEventListener('change', function() {
            applyIncidentFilters();
        });
    });
}

function applyTouristFilter(filterType) {
    const touristCards = document.querySelectorAll('.tourist-card');
    
    touristCards.forEach(card => {
        let show = true;
        
        switch (filterType) {
            case 'all':
                show = true;
                break;
            case 'active':
                show = card.querySelector('.status-indicator.online') !== null;
                break;
            case 'at risk':
                show = card.classList.contains('at-risk') || 
                       card.querySelector('.status-badge.warning') !== null;
                break;
            case 'offline':
                show = card.querySelector('.status-indicator.offline') !== null;
                break;
        }
        
        card.style.display = show ? 'flex' : 'none';
    });
}

function applyIncidentFilters() {
    const severityFilter = document.querySelector('.filter-select').value;
    const statusFilter = document.querySelectorAll('.filter-select')[1].value;
    const incidentCards = document.querySelectorAll('.incident-card');
    
    incidentCards.forEach(card => {
        let show = true;
        
        // Apply severity filter
        if (severityFilter !== 'all') {
            const severityTag = card.querySelector('.severity-tag');
            if (!severityTag || !severityTag.classList.contains(severityFilter)) {
                show = false;
            }
        }
        
        // Apply status filter
        if (statusFilter !== 'all' && show) {
            // For demo purposes, we'll check the timeline
            const timelineSteps = card.querySelectorAll('.timeline-step');
            const isResolved = Array.from(timelineSteps).every(step => 
                step.classList.contains('completed'));
            
            if ((statusFilter === 'resolved' && !isResolved) ||
                (statusFilter === 'pending' && isResolved)) {
                show = false;
            }
        }
        
        card.style.display = show ? 'block' : 'none';
    });
}

// Real-time Updates
function initRealTimeUpdates() {
    // Simulate real-time updates every 30 seconds
    setInterval(updateStats, 30000);
    setInterval(updateAlerts, 15000);
    setInterval(updateTimestamps, 60000);
}

function updateStats() {
    // Simulate updating dashboard statistics
    const statNumbers = document.querySelectorAll('.stat-number');
    
    statNumbers.forEach((stat, index) => {
        const currentValue = parseInt(stat.textContent.replace(',', ''));
        let newValue = currentValue;
        
        // Simulate small changes
        switch (index) {
            case 0: // Total Tourists
                newValue += Math.floor(Math.random() * 5) - 2;
                break;
            case 1: // Active Alerts
                newValue += Math.floor(Math.random() * 3) - 1;
                break;
            case 2: // Missing Persons
                newValue = Math.max(0, newValue + Math.floor(Math.random() * 2) - 1);
                break;
            case 3: // IoT Devices
                newValue = Math.max(150, Math.min(160, newValue + Math.floor(Math.random() * 3) - 1));
                break;
        }
        
        if (newValue !== currentValue) {
            stat.textContent = index === 0 ? newValue.toLocaleString() : newValue;
            
            // Add animation for updated stats
            stat.parentElement.style.background = 'linear-gradient(90deg, #EEF2FF, #FFFFFF)';
            setTimeout(() => {
                stat.parentElement.style.background = '';
            }, 2000);
        }
    });
}

function updateAlerts() {
    // Simulate new alerts
    if (Math.random() < 0.3) { // 30% chance of new alert
        addNewAlert();
    }
}

function addNewAlert() {
    const alertList = document.querySelector('.alert-list');
    const alertTypes = ['SOS Alert Triggered', 'Geo-fence Breach', 'Device Offline', 'Anomaly Detected'];
    const locations = ['Marine Drive', 'Gateway Plaza', 'Old Fort Area', 'Taj Hotel Area'];
    const severities = ['high', 'medium', 'low'];
    
    const newAlert = document.createElement('div');
    const alertType = alertTypes[Math.floor(Math.random() * alertTypes.length)];
    const location = locations[Math.floor(Math.random() * locations.length)];
    const severity = severities[Math.floor(Math.random() * severities.length)];
    const time = new Date().toLocaleTimeString('en-US', { 
        hour12: false, 
        hour: '2-digit', 
        minute: '2-digit' 
    });
    
    newAlert.className = `alert-item ${severity}`;
    newAlert.innerHTML = `
        <div class="alert-time">${time}</div>
        <div class="alert-content">
            <div class="alert-title">${alertType}</div>
            <div class="alert-details">Tourist ID: T00${Math.floor(Math.random() * 999) + 1000} - ${location}</div>
        </div>
        <div class="alert-action">
            <i class="fas fa-chevron-right"></i>
        </div>
    `;
    
    // Add to the top of the list
    alertList.insertBefore(newAlert, alertList.firstChild);
    
    // Remove oldest alert if list is too long
    const alerts = alertList.querySelectorAll('.alert-item');
    if (alerts.length > 10) {
        alertList.removeChild(alerts[alerts.length - 1]);
    }
    
    // Animate new alert
    newAlert.style.backgroundColor = '#EEF2FF';
    setTimeout(() => {
        newAlert.style.backgroundColor = '';
    }, 3000);
    
    // Update notification badge
    const badge = document.querySelector('.notification-badge');
    if (badge) {
        const currentCount = parseInt(badge.textContent) || 0;
        badge.textContent = currentCount + 1;
        badge.style.display = 'block';
    }
}

function updateTimestamps() {
    // Update "last seen" timestamps
    const timestamps = document.querySelectorAll('.last-seen');
    timestamps.forEach(timestamp => {
        const text = timestamp.textContent;
        if (text.includes('minute')) {
            const minutes = parseInt(text.match(/\d+/)[0]) + 1;
            timestamp.textContent = `Updated ${minutes}m ago`;
        }
    });
}

// Interactions and UI enhancements
function initInteractions() {
    // Add click handlers for action buttons
    initActionButtons();
    
    // Add hover effects for cards
    initCardHoverEffects();
    
    // Add mobile menu toggle
    initMobileMenu();
    
    // Add keyboard shortcuts
    initKeyboardShortcuts();
    
    // Add dropdown item handlers
    initDropdownItemHandlers();
}

function initDropdownItemHandlers() {
    // Location selector items
    document.querySelectorAll('#location-dropdown .dropdown-item').forEach(item => {
        item.addEventListener('click', function() {
            if (!this.classList.contains('active')) {
                const locationName = this.textContent.trim();
                document.querySelector('.location-selector span').textContent = locationName;
                
                // Update active state
                document.querySelectorAll('#location-dropdown .dropdown-item').forEach(i => {
                    i.classList.remove('active');
                    i.querySelector('.fa-check')?.remove();
                });
                this.classList.add('active');
                this.innerHTML += '<i class="fas fa-check" style="margin-left: auto;"></i>';
                
                showNotification(`Location changed to ${locationName}`, 'success');
            }
            closeAllDropdowns();
        });
    });
    
    // Time range selector items
    document.querySelectorAll('#timerange-dropdown .dropdown-item').forEach(item => {
        item.addEventListener('click', function() {
            if (!this.classList.contains('active') && !this.textContent.includes('Custom')) {
                const timeRange = this.textContent.trim();
                const shortRange = timeRange.replace('Last ', '').replace(' hours', 'h').replace(' days', 'd');
                document.querySelector('.time-range-selector span').textContent = shortRange;
                
                // Update active state
                document.querySelectorAll('#timerange-dropdown .dropdown-item').forEach(i => {
                    i.classList.remove('active');
                    i.querySelector('.fa-check')?.remove();
                });
                this.classList.add('active');
                this.innerHTML += '<i class="fas fa-check" style="margin-left: auto;"></i>';
                
                showNotification(`Time range changed to ${timeRange}`, 'success');
            }
            closeAllDropdowns();
        });
    });
    
    // Export menu items
    document.querySelectorAll('#export-dropdown .dropdown-item').forEach(item => {
        item.addEventListener('click', function() {
            const exportType = this.textContent.trim();
            showNotification(`Preparing ${exportType}...`, 'info');
            
            // Simulate export process
            setTimeout(() => {
                showNotification(`${exportType} ready for download`, 'success');
            }, 2000);
            
            closeAllDropdowns();
        });
    });
    
    // Language selector items
    document.querySelectorAll('#language-dropdown .dropdown-item').forEach(item => {
        item.addEventListener('click', function() {
            if (!this.classList.contains('active')) {
                const langCode = this.textContent.match(/\((\w+)\)/)?.[1] || 'EN';
                document.querySelector('.language-selector span').textContent = langCode;
                
                // Update active state
                document.querySelectorAll('#language-dropdown .dropdown-item').forEach(i => {
                    i.classList.remove('active');
                    i.querySelector('.fa-check')?.remove();
                });
                this.classList.add('active');
                this.innerHTML += '<i class="fas fa-check" style="margin-left: auto;"></i>';
                
                showNotification(`Language changed to ${langCode}`, 'success');
            }
            closeAllDropdowns();
        });
    });
    
    // Help menu items
    document.querySelectorAll('#help-dropdown .dropdown-item').forEach(item => {
        item.addEventListener('click', function() {
            const helpItem = this.textContent.trim();
            
            if (helpItem.includes('Keyboard Shortcuts')) {
                showKeyboardShortcutsModal();
            } else if (helpItem.includes('About RAAHI')) {
                showAboutModal();
            } else {
                showNotification(`Opening ${helpItem}...`, 'info');
            }
            
            closeAllDropdowns();
        });
    });
}

function initActionButtons() {
    // Incident action buttons
    document.querySelectorAll('.btn-action-primary, .btn-action-secondary, .btn-action-success').forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            const action = this.textContent.trim();
            handleIncidentAction(action, this);
        });
    });
    
    // Tourist action buttons
    document.querySelectorAll('.tourist-actions .btn-icon').forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            const touristCard = this.closest('.tourist-card');
            const touristId = touristCard.querySelector('.tourist-id').textContent;
            const action = this.getAttribute('title');
            handleTouristAction(action, touristId, this);
        });
    });
    
    // Table action buttons
    document.querySelectorAll('.btn-action').forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            const row = this.closest('tr');
            const incidentId = row.querySelector('td:first-child').textContent;
            showIncidentModal(incidentId);
        });
    });
}

function handleIncidentAction(action, button) {
    const incidentCard = button.closest('.incident-card');
    const incidentId = incidentCard.querySelector('.incident-id').textContent;
    
    switch (action) {
        case 'Notify Police':
            showNotification(`Police notified for incident ${incidentId}`, 'success');
            break;
        case 'Notify Ambulance':
            showNotification(`Ambulance dispatched for incident ${incidentId}`, 'success');
            break;
        case 'Mark Resolved':
            markIncidentResolved(incidentCard);
            break;
        default:
            console.log(`Action: ${action} for ${incidentId}`);
    }
}

function handleTouristAction(action, touristId, button) {
    switch (action) {
        case 'View Profile':
            showTouristProfile(touristId);
            break;
        case 'Track Location':
            showLocationTracking(touristId);
            break;
        case 'Send Alert':
            sendTouristAlert(touristId);
            break;
        default:
            console.log(`Action: ${action} for ${touristId}`);
    }
}

function markIncidentResolved(incidentCard) {
    const timeline = incidentCard.querySelector('.incident-timeline');
    const steps = timeline.querySelectorAll('.timeline-step');
    
    // Mark all steps as completed
    steps.forEach(step => {
        step.classList.remove('current');
        step.classList.add('completed');
    });
    
    // Update action buttons
    const actions = incidentCard.querySelector('.incident-actions');
    actions.innerHTML = `
        <button class="btn-action-secondary" disabled>
            <i class="fas fa-check"></i> Resolved
        </button>
        <button class="btn-action-primary">
            <i class="fas fa-eye"></i> View Details
        </button>
    `;
    
    showNotification('Incident marked as resolved', 'success');
}

function showIncidentModal(incidentId) {
    // Create and show modal (simplified)
    const modal = createModal(`Incident Details - ${incidentId}`, `
        <div class="modal-content">
            <p>Detailed information for incident ${incidentId} would be displayed here.</p>
            <p>This would include timeline, involved parties, evidence, and resolution details.</p>
        </div>
    `);
    
    document.body.appendChild(modal);
    modal.classList.add('active');
}

function showTouristProfile(touristId) {
    const modal = createModal(`Tourist Profile - ${touristId}`, `
        <div class="modal-content">
            <div class="profile-section">
                <h4>Personal Information</h4>
                <p>Name: John Doe</p>
                <p>ID: ${touristId}</p>
                <p>Phone: +1-555-0123</p>
                <p>Emergency Contact: +1-555-0456</p>
            </div>
            <div class="profile-section">
                <h4>Current Status</h4>
                <p>Location: Marine Drive</p>
                <p>Status: Safe</p>
                <p>Last Update: 2 minutes ago</p>
            </div>
            <div class="profile-section">
                <h4>Movement History</h4>
                <p>Digital ID verified via blockchain</p>
                <p>Recent locations: Gateway Plaza → Marine Drive</p>
            </div>
        </div>
    `);
    
    document.body.appendChild(modal);
    modal.classList.add('active');
}

function showLocationTracking(touristId) {
    showNotification(`Tracking location for ${touristId}`, 'info');
}

function sendTouristAlert(touristId) {
    showNotification(`Alert sent to ${touristId}`, 'success');
}

function createModal(title, content) {
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.innerHTML = `
        <div class="modal">
            <div class="modal-header">
                <h3>${title}</h3>
                <button class="modal-close">&times;</button>
            </div>
            <div class="modal-body">
                ${content}
            </div>
        </div>
    `;
    
    // Add close functionality
    modal.querySelector('.modal-close').addEventListener('click', () => {
        modal.remove();
    });
    
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.remove();
        }
    });
    
    return modal;
}

function initCardHoverEffects() {
    // Enhanced hover effects for cards
    const cards = document.querySelectorAll('.stat-card, .incident-card, .tourist-card');
    
    cards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-2px)';
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0)';
        });
    });
}

function initMobileMenu() {
    // Mobile menu toggle (if needed)
    const menuToggle = document.createElement('button');
    menuToggle.className = 'mobile-menu-toggle';
    menuToggle.innerHTML = '<i class="fas fa-bars"></i>';
    menuToggle.style.display = 'none';
    
    // Add to top bar on mobile
    if (window.innerWidth <= 768) {
        const topBarLeft = document.querySelector('.top-bar-left');
        topBarLeft.appendChild(menuToggle);
        menuToggle.style.display = 'block';
        
        menuToggle.addEventListener('click', function() {
            const sidebar = document.querySelector('.sidebar');
            sidebar.classList.toggle('active');
        });
    }
}

function initKeyboardShortcuts() {
    document.addEventListener('keydown', function(e) {
        // Ctrl/Cmd + K for search
        if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
            e.preventDefault();
            const searchInput = document.getElementById('globalSearch');
            searchInput.focus();
        }
        
        // Number keys for quick navigation
        if (e.altKey && e.key >= '1' && e.key <= '3') {
            e.preventDefault();
            const views = ['dashboard', 'incidents', 'tourists'];
            const viewIndex = parseInt(e.key) - 1;
            if (views[viewIndex]) {
                switchToView(views[viewIndex]);
            }
        }
        
        // Escape to close modals and dropdowns
        if (e.key === 'Escape') {
            document.querySelectorAll('.modal-overlay').forEach(modal => modal.remove());
            document.querySelectorAll('.dropdown-menu.active').forEach(dropdown => {
                dropdown.classList.remove('active');
            });
        }
    });
}

// Utility Functions
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <i class="fas fa-${getNotificationIcon(type)}"></i>
            <span>${message}</span>
        </div>
        <button class="notification-close">&times;</button>
    `;
    
    // Add styles for notification
    Object.assign(notification.style, {
        position: 'fixed',
        top: '80px',
        right: '20px',
        backgroundColor: getNotificationColor(type),
        color: '#ffffff',
        padding: '12px 16px',
        borderRadius: '8px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
        zIndex: '9999',
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        minWidth: '300px',
        animation: 'slideInRight 0.3s ease'
    });
    
    // Add close functionality
    notification.querySelector('.notification-close').addEventListener('click', () => {
        notification.style.animation = 'slideOutRight 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    });
    
    document.body.appendChild(notification);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        if (notification.parentNode) {
            notification.style.animation = 'slideOutRight 0.3s ease';
            setTimeout(() => notification.remove(), 300);
        }
    }, 5000);
}

function getNotificationIcon(type) {
    const icons = {
        success: 'check-circle',
        error: 'exclamation-triangle',
        warning: 'exclamation-circle',
        info: 'info-circle'
    };
    return icons[type] || icons.info;
}

function getNotificationColor(type) {
    const colors = {
        success: '#10B981',
        error: '#EF4444',
        warning: '#F59E0B',
        info: '#4F46E5'
    };
    return colors[type] || colors.info;
}

// Add CSS animations for notifications
const style = document.createElement('style');
style.textContent = `
    @keyframes slideInRight {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOutRight {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
    
    .modal-overlay {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.5);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 9999;
        opacity: 0;
        visibility: hidden;
        transition: all 0.3s ease;
    }
    
    .modal-overlay.active {
        opacity: 1;
        visibility: visible;
    }
    
    .modal {
        background: white;
        border-radius: 12px;
        max-width: 600px;
        width: 90%;
        max-height: 80vh;
        overflow-y: auto;
        transform: scale(0.9);
        transition: transform 0.3s ease;
    }
    
    .modal-overlay.active .modal {
        transform: scale(1);
    }
    
    .modal-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 20px 24px;
        border-bottom: 1px solid #e5e7eb;
    }
    
    .modal-header h3 {
        margin: 0;
        color: #111827;
        font-weight: 600;
    }
    
    .modal-close {
        background: none;
        border: none;
        font-size: 24px;
        cursor: pointer;
        color: #6b7280;
        padding: 0;
        width: 30px;
        height: 30px;
        display: flex;
        align-items: center;
        justify-content: center;
    }
    
    .modal-close:hover {
        color: #374151;
    }
    
    .modal-body {
        padding: 24px;
    }
    
    .profile-section {
        margin-bottom: 20px;
        padding-bottom: 16px;
        border-bottom: 1px solid #e5e7eb;
    }
    
    .profile-section:last-child {
        border-bottom: none;
        margin-bottom: 0;
    }
    
    .profile-section h4 {
        color: #374151;
        font-weight: 600;
        margin-bottom: 8px;
    }
    
    .profile-section p {
        color: #6b7280;
        margin: 4px 0;
    }
    
    .notification-content {
        display: flex;
        align-items: center;
        gap: 8px;
    }
    
    .notification-close {
        background: none;
        border: none;
        color: inherit;
        cursor: pointer;
        font-size: 18px;
        padding: 0;
        margin-left: auto;
    }
    
    /* Modal Content Styles */
    .shortcuts-content {
        display: grid;
        gap: 20px;
    }
    
    .shortcut-section h4 {
        color: #374151;
        font-weight: 600;
        margin-bottom: 12px;
        padding-bottom: 6px;
        border-bottom: 2px solid #e5e7eb;
    }
    
    .shortcut-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 8px;
    }
    
    .shortcut-item kbd {
        background: #f3f4f6;
        border: 1px solid #d1d5db;
        border-radius: 4px;
        padding: 4px 8px;
        font-size: 11px;
        font-weight: 600;
        color: #374151;
    }
    
    .about-content {
        text-align: center;
    }
    
    .about-logo {
        margin-bottom: 24px;
        padding-bottom: 16px;
        border-bottom: 1px solid #e5e7eb;
    }
    
    .about-logo h2 {
        color: #111827;
        font-weight: 700;
        margin-bottom: 4px;
    }
    
    .tagline {
        color: #6b7280;
        font-style: italic;
    }
    
    .about-details,
    .about-features,
    .about-support {
        margin-bottom: 20px;
        padding: 16px;
        background: #f9fafb;
        border-radius: 8px;
        text-align: left;
    }
    
    .about-features ul {
        margin: 8px 0 0 20px;
        color: #4b5563;
    }
    
    .about-features li {
        margin-bottom: 4px;
    }
    
    /* Emergency Mode */
    body.emergency-mode {
        --primary-blue: #ef4444;
        --secondary-blue: #dc2626;
        --light-blue: #fee2e2;
    }
    
    body.emergency-mode .top-bar {
        background: linear-gradient(90deg, #fee2e2 0%, #ffffff 100%);
        border-bottom-color: #fecaca;
    }
    
    body.emergency-mode .logo {
        color: #dc2626;
    }
    
    body.emergency-mode::before {
        content: '🚨 EMERGENCY MODE ACTIVE 🚨';
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        background: #ef4444;
        color: white;
        text-align: center;
        padding: 4px;
        font-weight: 700;
        z-index: 10001;
        animation: emergencyBlink 1s infinite;
    }
    
    body.emergency-mode .main-container {
        margin-top: calc(var(--topbar-height) + 28px);
    }
    
    @keyframes emergencyBlink {
        0%, 50% { background: #ef4444; }
        51%, 100% { background: #dc2626; }
    }
`;

document.head.appendChild(style);

function showKeyboardShortcutsModal() {
    const modal = createModal('Keyboard Shortcuts', `
        <div class="shortcuts-content">
            <div class="shortcut-section">
                <h4>Navigation</h4>
                <div class="shortcut-item">
                    <kbd>Alt + 1</kbd>
                    <span>Dashboard View</span>
                </div>
                <div class="shortcut-item">
                    <kbd>Alt + 2</kbd>
                    <span>Incidents View</span>
                </div>
                <div class="shortcut-item">
                    <kbd>Alt + 3</kbd>
                    <span>Tourists View</span>
                </div>
            </div>
            <div class="shortcut-section">
                <h4>Search</h4>
                <div class="shortcut-item">
                    <kbd>Ctrl/Cmd + K</kbd>
                    <span>Focus Search Bar</span>
                </div>
                <div class="shortcut-item">
                    <kbd>Enter</kbd>
                    <span>Execute Search</span>
                </div>
            </div>
            <div class="shortcut-section">
                <h4>General</h4>
                <div class="shortcut-item">
                    <kbd>Esc</kbd>
                    <span>Close Modals/Dropdowns</span>
                </div>
            </div>
        </div>
    `);
    
    document.body.appendChild(modal);
    modal.classList.add('active');
}

function showAboutModal() {
    const modal = createModal('About RAAHI', `
        <div class="about-content">
            <div class="about-logo">
                <i class="fas fa-shield-alt" style="font-size: 48px; color: var(--primary-blue); margin-bottom: 16px;"></i>
                <h2>RAAHI v2.1.0</h2>
                <p class="tagline">Smart Tourism Safety System</p>
            </div>
            <div class="about-details">
                <p><strong>Release Date:</strong> September 2025</p>
                <p><strong>Build:</strong> 2.1.0.1247</p>
                <p><strong>Environment:</strong> Production</p>
                <p><strong>Last Updated:</strong> 19 Sep 2025</p>
            </div>
            <div class="about-features">
                <h4>Key Features:</h4>
                <ul>
                    <li>Real-time tourist safety monitoring</li>
                    <li>Incident management and tracking</li>
                    <li>IoT device integration</li>
                    <li>Emergency response coordination</li>
                    <li>Blockchain-based digital ID verification</li>
                </ul>
            </div>
            <div class="about-support">
                <p><strong>Support:</strong> support@raahi.gov.in</p>
                <p><strong>Documentation:</strong> docs.raahi.gov.in</p>
                <p><strong>Emergency Hotline:</strong> 1800-RAAHI-911</p>
            </div>
        </div>
    `);
    
    document.body.appendChild(modal);
    modal.classList.add('active');
}

// Export functions for external use (if needed)
window.RAAHI = {
    showNotification,
    switchToView,
    handleGlobalSearch: executeSearch,
    triggerEmergency,
    toggleLocationSelector,
    toggleTimeRange,
    toggleExportMenu,
    toggleSystemStatus,
    toggleLanguageMenu,
    toggleHelpMenu
};
