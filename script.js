// main.js

// Importa o array de locations do arquivo locations.js
import { locations } from './locations.js'; // Caminho relativo para o arquivo locations.js

// Inicializa o mapa
const map = L.map('map');

// Camada de mapa padrão (OpenStreetMap)
const openStreetMap = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 18,
    attribution: 'Map data © <a href="https://openstreetmap.org">OpenStreetMap</a> contributors'
});

// Camada de satélite (Esri World Imagery)
const satellite = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
    maxZoom: 18,
    attribution: 'Tiles © Esri'
});

// Adiciona o controle de camadas
const baseLayers = {
    "Mapa Padrão": openStreetMap,
    "Satélite": satellite
};

L.control.layers(baseLayers).addTo(map);

// Define a camada padrão inicial
openStreetMap.addTo(map);

// Função para adicionar marcadores
function addMarkers() {
    locations.forEach(location => {
        const { coords, name, whatsapp, color, local } = location;

        // Define o ícone com base na cor
        const icon = L.icon({
            iconUrl: `https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-${color}.png`,
            shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
            iconSize: [25, 41],
            iconAnchor: [12, 41],
            popupAnchor: [1, -34],
            shadowSize: [41, 41]
        });

        // Cria o marcador
        const marker = L.marker(coords, { icon }).addTo(map);

        // Conteúdo do pop-up
        const popupContent = `
            <div>
                <p class="name"><strong>${name}</strong></p>
                <p>${coords[0].toFixed(6)}, ${coords[1].toFixed(6)}</p>
                <p>
                    <a href="https://wa.me/${whatsapp}" target="_blank" class="whatsapp-link">
                    ${whatsapp}
                    <img src="https://upload.wikimedia.org/wikipedia/commons/5/5e/WhatsApp_icon.png" alt="WhatsApp" width="20" height="20">
                    </a> 
                </p>
                <p class="lc">${local}</p>
                
                <p><a href="https://www.google.com/maps/place/${coords}">Google maps</a></p>
                
                <p><a href="https://maps.apple.com/?q=${coords}" target="_blank">Apple maps</a></p>
                
                <p><a href="https://waze.com/ul?ll=${coords}" target="_blank">Waze maps</a></p>

                
            </div>
        `;

        // Adiciona o pop-up ao marcador
        marker.bindPopup(popupContent);
    });
}

// Função para ajustar a visualização do mapa
function adjustMapView(userCoords) {
    const markersGroup = L.featureGroup(); // Grupo para os marcadores

    // Adiciona os marcadores ao grupo
    locations.forEach(location => {
        const marker = L.marker(location.coords);
        markersGroup.addLayer(marker);
    });

    // Adiciona a localização do usuário ao grupo
    if (userCoords) {
        const userMarker = L.marker([userCoords.latitude, userCoords.longitude]);
        markersGroup.addLayer(userMarker);
    }

    // Ajusta a visualização do mapa para incluir todos os marcadores e a localização do usuário
    map.fitBounds(markersGroup.getBounds());
}

// Variável para armazenar o marcador do usuário
let userMarker = null;

// Função para atualizar a localização do usuário
function updateUserLocation(position) {
    const userCoords = {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude
    };

    // Se o marcador do usuário já existe, atualiza sua posição
    if (userMarker) {
        userMarker.setLatLng([userCoords.latitude, userCoords.longitude]);
    } else {
        // Caso contrário, cria um novo marcador
        const userIcon = L.divIcon({ className: 'user-location-marker', iconSize: [20, 20] });
        userMarker = L.marker([userCoords.latitude, userCoords.longitude], { icon: userIcon })
            .addTo(map)
            .bindPopup("Você está aqui!")
            .openPopup();
    }

    // Ajusta a visualização do mapa
    adjustMapView(userCoords);
}

// Função para obter a localização do usuário em tempo real
function watchUserLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.watchPosition(
            (position) => {
                updateUserLocation(position);
            },
            (error) => {
                console.error("Erro ao obter localização:", error);
                // Se não conseguir a localização, ajusta a visualização apenas para os marcadores
                adjustMapView();
            },
            {
                enableHighAccuracy: true, // Tenta obter a localização com maior precisão
                timeout: 5000, // Tempo máximo de espera para obter a localização
                maximumAge: 0 // Não usa cache de localização
            }
        );
    } else {
        alert("Geolocalização não é suportada pelo navegador.");
        // Se a geolocalização não for suportada, ajusta a visualização apenas para os marcadores
        adjustMapView();
    }
}

// Adiciona os marcadores ao mapa
addMarkers();

// Inicia o monitoramento da localização do usuário em tempo real
watchUserLocation();
