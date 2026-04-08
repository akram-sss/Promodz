import React from 'react';
import { MapContainer, TileLayer, GeoJSON, ScaleControl, ZoomControl } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { Box, Typography } from '@mui/material';
import WILAYA_DATA from '../../data/Map/Wilaya-data.jsx';


// Updated Color Scale to handle higher values dynamically
const COLOR_SCALE = [
  { threshold: 0, color: '#f3e8ff', label: '0-49' },
  { threshold: 50, color: '#d8b4fe', label: '50-99' },
  { threshold: 100, color: '#c084fc', label: '100-199' },
  { threshold: 200, color: '#a855f7', label: '200-299' },
  { threshold: 300, color: '#9333ea', label: '300-399' },
  { threshold: 400, color: '#8b5cf6', label: '400+' }
];

const AlgerMap = ({data,maptitle,cardtitle}) => {
  // Create GeoJSON with PROPER coordinate order: [longitude, latitude]
  const geoData = {
    type: "FeatureCollection",
    features: WILAYA_DATA.map(wilaya => ({
      type: "Feature",
      properties: {
        name: wilaya.name,
        visits: data[wilaya.name] || 0,
        wilayaId: wilaya.id
      },
      geometry: {
        type: "Point",
        coordinates: [wilaya.longitude, wilaya.latitude]
      }
    }))
  };

  const getColor = (visits) => {
    for (let i = COLOR_SCALE.length - 1; i >= 0; i--) {
      if (visits >= COLOR_SCALE[i].threshold) return COLOR_SCALE[i].color;
    }
    return COLOR_SCALE[0].color;
  };

  // Improved radius calculation to handle higher values
  const getRadius = (visits) => {
    // Logarithmic scaling for better visual distinction across wide ranges
    if (visits === 0) return 4;
    return 6 + Math.log(visits) * 4;
  };

  const pointToLayer = (feature, latlng) => {
    const visits = feature.properties.visits;
    return L.circleMarker(latlng, {
      radius: getRadius(visits),
      fillColor: getColor(visits),
      color: '#6d28d9',
      weight: visits > 100 ? 2 : 1,
      opacity: 1,
      fillOpacity: 0.85,
      className: `wilaya-marker wilaya-${feature.properties.wilayaId}`
    });
  };

  // Calculate max visits for scaling the progress bars in popups
  const maxVisits = Math.max(...Object.values(data));

  return (
    <Box sx={{ 
      height: '90vh', 
      width: '100%',
      position: 'relative',
      borderRadius: '12px',
      overflow: 'hidden',
      boxShadow: 3,
      border: '1px solid rgba(139, 92, 246, 0.15)'
    }}>
      <MapContainer 
        center={[28, 3]}
        zoom={5.5}
        style={{ height: '100%', width: '100%' }}
        minZoom={4}
        maxZoom={10}
        scrollWheelZoom={true}
        zoomControl={false}
        attributionControl={false}
      >
        {/* Light-themed base map for better contrast with markers */}
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        
        {/* Highlight layer for Algeria borders */}
        <GeoJSON
          data={{
            type: "Feature",
            properties: {},
            geometry: {
              type: "Polygon",
              coordinates: [[
                // Simplified Algeria boundary coordinates
                [-8.684, 35.225], [11.999, 35.225], 
                [11.999, 18.995], [-8.684, 18.995], 
                [-8.684, 35.225]
              ]]
            }
          }}
          style={{
            fill: false,
            color: 'rgba(139, 92, 246, 0.15)',
            weight: 2,
            dashArray: '5, 5'
          }}
        />
        
        {/* Wilaya markers */}
        <GeoJSON
          data={geoData}
          pointToLayer={pointToLayer}
          onEachFeature={(feature, layer) => {
            const visits = feature.properties.visits;
            layer.bindPopup(`
              <div style="
                padding: 12px; 
                font-family: 'Inter', sans-serif; 
                min-width: 200px;
                border-radius: 8px;
              ">
                <div style="
                  display: flex;
                  align-items: center;
                  margin-bottom: 10px;
                  padding-bottom: 8px;
                  border-bottom: 1px solid rgba(139, 92, 246, 0.2);
                ">
                  <div style="
                    width: 12px;
                    height: 12px;
                    background-color: ${getColor(visits)};
                    border-radius: 50%;
                    margin-right: 10px;
                    border: 1px solid #6d28d9;
                  "></div>
                  <h3 style="
                    margin: 0;
                    color: #6d28d9;
                    font-size: 16px;
                    font-weight: 600;
                  ">
                    ${feature.properties.name}
                  </h3>
                </div>
                <div style="margin-bottom: 8px;">
                  <div style="
                    display: flex;
                    justify-content: space-between;
                    margin-bottom: 4px;
                  ">
                    <span style="color: #666;">${cardtitle}s:</span>
                    <strong style="color: ${getColor(visits)};">
                      ${visits.toLocaleString()}
                    </strong>
                  </div>
                  <div style="
                    height: 6px;
                    background: rgba(139, 92, 246, 0.1);
                    border-radius: 3px;
                    margin-top: 4px;
                    overflow: hidden;
                  ">
                    <div style="
                      width: ${Math.min(100, (visits / maxVisits) * 100)}%;
                      height: 100%;
                      background: ${getColor(visits)};
                      border-radius: 3px;
                    "></div>
                  </div>
                </div>
                <div style="
                  display: grid;
                  grid-template-columns: 1fr 1fr;
                  gap: 8px;
                  font-size: 12px;
                  color: #666;
                  margin-top: 10px;
                ">
                  <div>
                    <div style="font-weight: 500; margin-bottom: 2px;">Latitude</div>
                    <div>${feature.geometry.coordinates[1].toFixed(4)}</div>
                  </div>
                  <div>
                    <div style="font-weight: 500; margin-bottom: 2px;">Longitude</div>
                    <div>${feature.geometry.coordinates[0].toFixed(4)}</div>
                  </div>
                </div>
              </div>
            `);
          }}
        />
        
        <ScaleControl position="bottomleft" imperial={false} />
        <ZoomControl position="topright" />
        
        {/* Enhanced Legend */}
        <div className="leaflet-bottom leaflet-right">
          <div className="leaflet-control leaflet-bar" style={{
            padding: '16px',
            background: 'rgba(255, 255, 255, 0.95)',
            borderRadius: '12px',
            boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
            maxWidth: '220px',
            backdropFilter: 'blur(4px)',
            border: '1px solid rgba(0,0,0,0.05)'
          }}>
            <Typography variant="subtitle2" sx={{ 
              marginBottom: '12px',
              color: '#6d28d9',
              fontWeight: '600',
              fontSize: '14px'
            }}>
              {cardtitle} Distribution
            </Typography>
            {COLOR_SCALE.map((item, index) => (
              <div key={index} style={{ 
                display: 'flex', 
                alignItems: 'center',
                marginBottom: '6px'
              }}>
                <div style={{
                  width: '16px',
                  height: '16px',
                  borderRadius: '4px',
                  marginRight: '10px',
                  backgroundColor: item.color,
                  border: '1px solid rgba(0,0,0,0.1)'
                }}></div>
                <span style={{
                  fontSize: '13px',
                  fontWeight: '500',
                  color: '#333'
                }}>{item.label}</span>
              </div>
            ))}
            <div style={{ 
              marginTop: '12px',
              fontSize: '12px',
              color: '#666',
              lineHeight: '1.4'
            }}>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <div style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  marginRight: '8px',
                  background: 'transparent',
                  border: '1px solid #6d28d9'
                }}></div>
                <span>Circle size represents {cardtitle} count</span>
              </div>
            </div>
          </div>
        </div>
      </MapContainer>
      
      {/* Title */}
      <Box sx={{
        position: 'absolute',
        top: '20px',
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 1000,
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        padding: '12px 24px',
        borderRadius: '30px',
        boxShadow: 3,
        textAlign: 'center',
        backdropFilter: 'blur(2px)',
        border: '1px solid rgba(139, 92, 246, 0.2)'
      }}>
        <Typography variant="h6" sx={{ 
          color: '#6d28d9',
          fontWeight: '700',
          fontSize: '1.1rem'
        }}>
          {maptitle}
        </Typography>
      </Box>
      
      {/* Data source attribution */}
      <Box sx={{
        position: 'absolute',
        bottom: '10px',
        left: '10px',
        zIndex: 1000,
        backgroundColor: 'rgba(255, 255, 255, 0.8)',
        padding: '4px 8px',
        borderRadius: '4px',
        fontSize: '11px',
        color: '#666'
      }}>
        Data updated: {new Date().toLocaleDateString()}
      </Box>
    </Box>
  );
};

export default AlgerMap;