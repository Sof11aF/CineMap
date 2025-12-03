// Global variables
let map;
let allMarkers = [];
let currentCinemaFilter = 'all';
let currentDayFilter = 'all';

// Cinema data
const cinemas = [
  {
    name: "Votiv Kino",
    lat: 48.216342,
    lon: 16.362096,
    website: "https://www.votivkino.at",
    address: "Währinger Straße 12, 1090 Wien",
    showtimes: {
      "Wednesday": [
        {movie: "Dann Passiert das Leben", time: "17:00"},
        {movie: "Das Perfekte Geschenk", time: "18:45"},
        {movie: "Eddington", time: "20:30"}
      ],
      "Thursday": [
        {movie: "Franz K.", time: "15:15"},
        {movie: "Girls and Gods", time: "15:30"},
        {movie: "Eddington", time: "20:30"}
      ],
      "Friday": [
         {movie: "Die My Love", time: "20:30"},
        {movie: "Bugonia", time: "21:00"}
       
      ]
    }
  },
  {
    name: "Kino De France",
    lat: 48.214220,
    lon: 16.368598,
    website: "https://www.votivkino.at",
    address: "Heßgasse 7/Ecke Schottenring 5, 1010 Wien",
    showtimes: {
      "Wednesday": [
        {movie: "Lolita lesen in Teheran", time: "15:45"},
        {movie: "Stiller", time: "15:30"},
        {movie: "One Battle after Another", time: "17:30"},
       
      ],
      "Thursday": [
        {movie: "Bugonia", time: "17:45"},
        {movie: "Das Perfekte Geschenk", time: "20:00"},
        {movie: "Die My Love", time: "20:30"}
        
      ],
      "Friday": [
        {movie: "Das Perfekte Geschenk", time: "16:00"},
        {movie: "Mother's Baby", time: "17:45"},
        {movie: "Eddington", time: "20:30"}
        
      ]
    }
  },
  {
    name: "Burgkino",
    lat: 48.200915,
    lon: 16.368212,
    website: "https://www.burgkino.at",
    address: "Opernring 19, 1010 Wien",
    showtimes: {
      "Wednesday": [
        {movie: "Die My Love", time: "20:45"}
      ],
      "Thursday": [
        {movie: "Bugonia", time: "20:30"}
      ],
      "Friday": [
        {movie: "Sentimental Value", time: "20:00"}
      ]
    }
  }
];


// Initialize map
function initMap() {
  map = L.map('map').setView([48.2082, 16.3738], 13);
  
  L.tileLayer('https://api.maptiler.com/maps/pastel/{z}/{x}/{y}.png?key=xrhn5bfuUf5cJiHpfCpO', {
    attribution: '© MapTiler © OpenStreetMap contributors'
  }).addTo(map);

  const customIcon = L.icon({
    iconUrl: 'place-marker-svgrepo-com.svg',
    iconSize: [35, 35],
    iconAnchor: [17, 35],
    popupAnchor: [0, -30],
    className: 'cinema-marker'
  });

  // Create initial markers (all days)
  cinemas.forEach(c => {
    if (c.lat && c.lon) {
      const marker = createCinemaMarker(c, customIcon, 'all');
      allMarkers.push({ marker, cinema: c });
      marker.addTo(map);
    }
  });
}

// Create marker with dynamic popup content
function createCinemaMarker(cinema, icon, dayFilter = 'all') {
  let showtimesHtml = '';
  
  if (cinema.showtimes && Object.keys(cinema.showtimes).length > 0) {
    showtimesHtml = `<div class="showtimes">`;
    
    // Show ONLY the selected day OR all days
    const daysToShow = dayFilter === 'all' ? Object.keys(cinema.showtimes) : [dayFilter];
    
    let hasShowtimesForDay = false;
    daysToShow.forEach(day => {
      if (cinema.showtimes[day]) {
        hasShowtimesForDay = true;
        showtimesHtml += `<div class="day-group"><h4>${day}</h4><ul>`;
        cinema.showtimes[day].forEach(m => {
          showtimesHtml += `<li><strong>${m.movie}</strong> — ${m.time}</li>`;
        });
        showtimesHtml += `</ul></div>`;
      }
    });
    
    if (!hasShowtimesForDay) {
      showtimesHtml = '<p>No showtimes for selected day</p>';
    }
    
    showtimesHtml += `</div>`;
  } else {
    showtimesHtml = '<p>No showtimes available</p>';
  }

  const content = `
    <h3>${cinema.name}</h3>
    <p>${cinema.address || ""}</p>
    ${showtimesHtml}
    ${cinema.website ? `<a href="${cinema.website}" target="_blank" rel="noopener noreferrer">Website</a>` : ''}
  `;

  return L.marker([cinema.lat, cinema.lon], {icon: icon})
    .bindPopup(content, { maxWidth: 280, closeButton: true, autoClose: false });
}

// Filter by cinema name
function filterCinema(cinemaName) {
  currentCinemaFilter = cinemaName;
  applyFilters();
}

// Filter by day
function filterDay(dayName) {
  currentDayFilter = dayName;
  applyFilters();
}

// Main filter logic - combines cinema + day filters
function applyFilters() {
  allMarkers.forEach(({ marker, cinema }, index) => {
    let shouldShow = true;

    // Cinema filter
    if (currentCinemaFilter !== 'all' && cinema.name !== currentCinemaFilter) {
      shouldShow = false;
    }

    // Day filter - only show if cinema has showtimes for selected day
    if (currentDayFilter !== 'all' && (!cinema.showtimes || !cinema.showtimes[currentDayFilter])) {
      shouldShow = false;
    }

    if (shouldShow) {
      // Update marker popup with current day filter
      const customIcon = L.icon({
        iconUrl: 'place-marker-svgrepo-com.svg',
        iconSize: [35, 35],
        iconAnchor: [17, 35],
        popupAnchor: [0, -30],
        className: 'cinema-marker'
      });
      
      const newMarker = createCinemaMarker(cinema, customIcon, currentDayFilter);
      map.removeLayer(marker);
      allMarkers[index] = { marker: newMarker, cinema };
      newMarker.addTo(map);
    } else {
      map.removeLayer(marker);
    }
  });
}

// Get all unique days from showtimes
function getAllDays() {
  const days = new Set();
  cinemas.forEach(c => {
    if (c.showtimes) {
      Object.keys(c.showtimes).forEach(day => days.add(day));
    }
  });
  return Array.from(days);
}

// Toggle hamburger menu with tabs
function toggleMenu() {
  const menu = document.getElementById('emerging-menu');
  if (menu.style.display === "none" || !menu.style.display) {
    const allDays = ['all', ...getAllDays()];
    
    menu.innerHTML = `
      <h2>Filter Cinemas</h2>
      <div class="filter-tabs">
        <div class="tab active" onclick="switchTab('cinemas')">Cinemas</div>
        <div class="tab" onclick="switchTab('days')">Days</div>
      </div>
      
      <div id="cinema-tab" class="tab-content active">
        <ul>
          <li onclick="filterCinema('all'); closeMenu()">All Cinemas</li>
          ${cinemas.map(c => `<li onclick="filterCinema('${c.name}'); closeMenu()">${c.name}</li>`).join('')}
        </ul>
      </div>
      
      <div id="days-tab" class="tab-content">
        <ul>
          <li onclick="filterDay('all'); closeMenu()">All Days</li>
          ${allDays.slice(1).map(day => `<li onclick="filterDay('${day}'); closeMenu()">${day}</li>`).join('')}
        </ul>
      </div>
    `;
    
    menu.style.display = "block";
    menu.classList.add('active');
  } else {
    closeMenu();
  }
}

// Tab switching
function switchTab(tabName) {
  document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
  document.querySelectorAll('.tab-content').forEach(t => t.classList.remove('active'));
  
  event.target.classList.add('active');
  document.getElementById(tabName + '-tab').classList.add('active');
}

// Close menu
function closeMenu() {
  const menu = document.getElementById('emerging-menu');
  menu.style.display = "none";
  menu.classList.remove('active');
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', initMap);



