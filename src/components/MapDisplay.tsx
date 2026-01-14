'use client';

import React, { useEffect, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet.markercluster/dist/leaflet.markercluster';
import 'leaflet.markercluster/dist/MarkerCluster.Default.css';
import 'leaflet.heat';
import { useTheme } from '@/components/ThemeProvider';

type MarkerPoint = {
  lat: number;
  lng: number;
  label: string;
  type: string;
  species: string;
  year: number;
};

type MapDisplayProps = {
  filter?: string;
  data?: MarkerPoint[];
  visibleRef?: React.MutableRefObject<MarkerPoint[]>;
  selectedTypes?: string[];
  selectedRegion?: string;
  selectedSpecies?: string;
  selectedYear?: string;
};

const dummyData: MarkerPoint[] = [
  { lat: -1.286389, lng: 36.817223, label: 'Nairobi', type: 'Sample Site', species: 'Type 1', year: 2023 },
  { lat: 0.516667, lng: 35.283333, label: 'Eldoret', type: 'Confirmed Case', species: 'Type 2', year: 2022 },
  { lat: -0.023559, lng: 37.906193, label: 'Meru', type: 'Pending Review', species: 'Type 3', year: 2024 },
];

const iconMap: { [key: string]: string } = {
  'Sample Site': '/markers/marker-icon-blue.png',
  'Confirmed Case': '/markers/marker-icon-green.png',
  'Pending Review': '/markers/marker-icon-yellow.png',
};

export default function MapDisplay({
  filter = '',
  data,
  visibleRef,
  selectedTypes,
  selectedRegion,
  selectedSpecies,
  selectedYear,
}: MapDisplayProps) {
  const { theme } = useTheme();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    
    const map = L.map('map', {
      center: [-1.3, 36.8],
      zoom: 6,
      zoomControl: true,
    });

    const baseLayers = {
      'OpenStreetMap': L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors',
      }),
      'Satellite': L.tileLayer(
        'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
        {
          attribution: 'Tiles © Esri',
        }
      ),
      'Light Gray': L.tileLayer(
        'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png',
        {
          attribution: '&copy; CartoDB',
        }
      ),
      'Dark Map': L.tileLayer(
        'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
        {
          attribution: '&copy; CartoDB',
        }
      ),
    };

    baseLayers.OpenStreetMap.addTo(map);

    const markerCluster = L.markerClusterGroup();
    const visibleTypes = new Set<string>();
    const points = data && data.length > 0 ? data : dummyData;

    if (visibleRef && 'current' in visibleRef) {
      visibleRef.current = [];
    }

    points.forEach((point) => {
      const matchesTextFilter =
        !filter ||
        point.label.toLowerCase().includes(filter.toLowerCase()) ||
        point.type.toLowerCase().includes(filter.toLowerCase()) ||
        point.species.toLowerCase().includes(filter.toLowerCase()) ||
        point.year.toString().includes(filter.toLowerCase());

      const matchesTypeFilter =
        !selectedTypes || selectedTypes.length === 0 || selectedTypes.includes(point.type);

      const matchesRegion = !selectedRegion || point.label === selectedRegion;
      const matchesSpecies = !selectedSpecies || point.species === selectedSpecies;
      const matchesYear = !selectedYear || point.year.toString() === selectedYear;

      if (!matchesTextFilter || !matchesTypeFilter || !matchesRegion || !matchesSpecies || !matchesYear) {
        return;
      }

      visibleTypes.add(point.type);
      if (visibleRef && 'current' in visibleRef) {
        visibleRef.current.push(point);
      }

      const iconUrl = iconMap[point.type] || '/markers/marker-icon-blue.png';

      const marker = L.marker([point.lat, point.lng], {
        icon: L.icon({
          iconUrl,
          shadowUrl: '/markers/marker-shadow.png',
          iconSize: [25, 41],
          iconAnchor: [12, 41],
          popupAnchor: [1, -34],
          shadowSize: [41, 41],
        }),
      }).bindPopup(`
        <b>${point.label}</b><br>
        ${point.type}<br>
        ${point.species}<br>
        ${point.year}
      `);

      markerCluster.addLayer(marker);
    });

    const intensityMap: Record<string, number> = {
      'Confirmed Case': 1.0, 
      'Sample Site': 0.7,     
      'Pending Review': 0.4,  
    };

    const heatPoints = points
      .filter((p) =>
        (!selectedTypes || selectedTypes.length === 0 || selectedTypes.includes(p.type)) &&
        (!selectedRegion || p.label === selectedRegion) &&
        (!selectedSpecies || p.species === selectedSpecies) &&
        (!selectedYear || p.year.toString() === selectedYear)
      )
      .map((p) => [p.lat, p.lng, intensityMap[p.type] || 0.6]);

    const heatLayer = (L as any).heatLayer(heatPoints, {
      radius: 35,          
      blur: 20,             
      maxZoom: 12,          
      minOpacity: 0.4,      
      max: 1.0,             
      gradient: {
        0.2: '#0000FF',     
        0.4: '#00FF00',     
        0.6: '#FFFF00',     
        0.8: '#FF7700',     
        1.0: '#FF0000'      
      },
    });

    const overlayMaps = {
      'Heatmap': heatLayer,
      'Marker Clusters': markerCluster,
    };

    const layerControl = L.control.layers(baseLayers, overlayMaps, {
      collapsed: true,
      position: 'topright'  
    }).addTo(map);

    map.addLayer(markerCluster);
    map.addLayer(heatLayer);

    const typeColors: { [key: string]: string } = {
      'Sample Site': 'primary',
      'Confirmed Case': 'success',
      'Pending Review': 'warning',
      default: 'secondary',
    };

    const LegendControl = L.Control.extend({
      onAdd: function () {
        const div = L.DomUtil.create('div', 'legend p-3 rounded shadow-sm') as HTMLElement;
        div.style.background = theme === 'dark' ? '#1e1e1e' : '#ffffff';
        div.style.color = theme === 'dark' ? '#f8f9fa' : '#212529';
        div.style.border = '1px solid #ccc';
        div.style.zIndex = '1000';
        div.style.maxWidth = '200px';
        
        div.innerHTML = `
          <h6 class="mb-2 fw-semibold text-center">Legend</h6>
          <div class="mb-3">
            <h7 class="fw-semibold">Heat Intensity:</h7>
            <div class="heat-gradient mt-1" style="
              height: 20px;
              background: linear-gradient(to right, #0000FF, #00FF00, #FFFF00, #FF7700, #FF0000);
              border-radius: 3px;
              border: 1px solid #ccc;
            "></div>
            <div class="d-flex justify-content-between small mt-1">
              <span>Low</span>
              <span>High</span>
            </div>
          </div>
          <h7 class="fw-semibold">Marker Types:</h7>
          <ul class="list-unstyled mb-0 small">
            ${Array.from(visibleTypes)
              .map(
                (type) => `
                <li class="d-flex align-items-center mb-1">
                  <span style="
                    display:inline-block;
                    width:12px;
                    height:12px;
                    border-radius:50%;
                    margin-right:8px;
                    background-color: var(--bs-${typeColors[type] || typeColors.default});
                  "></span>
                  <span>${type}</span>
                </li>`
              )
              .join('')}
          </ul>
        `;
        return div;
      },
    });

    new LegendControl({ position: 'bottomleft' }).addTo(map);

    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);

    return () => {
      clearTimeout(timer);
      map.remove();
    };
  }, [filter, data, visibleRef, selectedTypes, selectedRegion, selectedSpecies, selectedYear, theme]);

  return (
    <div style={{ position: 'relative', height: '100%', width: '100%' }}>
      {isLoading && (
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(255, 255, 255, 0.8)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 1000,
          }}
        >
          <div
            style={{
              textAlign: 'center',
              padding: '20px',
              borderRadius: '8px',
              backgroundColor: 'white',
              boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
            }}
          >
            <div
              style={{
                border: '4px solid #f3f3f3',
                borderTop: '4px solid #3498db',
                borderRadius: '50%',
                width: '40px',
                height: '40px',
                animation: 'spin 1s linear infinite',
                margin: '0 auto 16px',
              }}
            />
            <p style={{ margin: 0, color: '#333', fontWeight: '500' }}>
              Loading map data...
            </p>
          </div>
        </div>
      )}
      <div 
        id="map" 
        style={{ 
          height: '100%', 
          width: '100%',
          opacity: isLoading ? 0.5 : 1,
          transition: 'opacity 0.3s ease-in-out'
        }} 
      />
      
      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}