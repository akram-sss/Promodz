import React, { useMemo } from 'react';
import { MapContainer, TileLayer, GeoJSON, ScaleControl, ZoomControl } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { Box, Typography } from '@mui/material';
import WILAYA_DATA from '../../data/Map/Wilaya-data.jsx';


// Vibrant, clearly distinguishable color scale
const COLOR_SCALE = [
  { threshold: 0,   color: '#e0e7ff', label: '0' },
  { threshold: 1,   color: '#93c5fd', label: '1–19' },
  { threshold: 20,  color: '#3b82f6', label: '20–49' },
  { threshold: 50,  color: '#f59e0b', label: '50–99' },
  { threshold: 100, color: '#f97316', label: '100–299' },
  { threshold: 300, color: '#ef4444', label: '300+' },
];

const getColor = (count) => {
  for (let i = COLOR_SCALE.length - 1; i >= 0; i--) {
    if (count >= COLOR_SCALE[i].threshold) return COLOR_SCALE[i].color;
  }
  return COLOR_SCALE[0].color;
};

const getRadius = (count) => {
  if (count === 0) return 4;
  if (count < 10) return 7;
  if (count < 50) return 10;
  if (count < 100) return 14;
  if (count < 300) return 18;
  return 22;
};

const getBorderColor = (count) => {
  if (count === 0) return '#94a3b8';
  if (count < 50) return '#2563eb';
  if (count < 100) return '#d97706';
  return '#dc2626';
};

const AlgerMap = ({ data, maptitle, cardtitle }) => {
  // Compute a stable key from data so GeoJSON re-renders on every update
  const dataKey = useMemo(() => JSON.stringify(data), [data]);

  const geoData = useMemo(() => ({
    type: "FeatureCollection",
    features: WILAYA_DATA.map(wilaya => ({
      type: "Feature",
      properties: {
        name: wilaya.name,
        count: data[wilaya.name] || 0,
        wilayaId: wilaya.id
      },
      geometry: {
        type: "Point",
        coordinates: [wilaya.longitude, wilaya.latitude]
      }
    }))
  }), [data]);

  const maxCount = useMemo(() => {
    const vals = Object.values(data);
    return vals.length ? Math.max(...vals, 1) : 1;
  }, [data]);

  const totalCount = useMemo(() => {
    return Object.values(data).reduce((s, v) => s + v, 0);
  }, [data]);

  const pointToLayer = (feature, latlng) => {
    const count = feature.properties.count;
    return L.circleMarker(latlng, {
      radius: getRadius(count),
      fillColor: getColor(count),
      color: getBorderColor(count),
      weight: count > 50 ? 2.5 : 1.5,
      opacity: 1,
      fillOpacity: 0.8,
    });
  };

  const onEachFeature = (feature, layer) => {
    const count = feature.properties.count;
    const pct = totalCount > 0 ? ((count / totalCount) * 100).toFixed(1) : '0.0';
    const barWidth = Math.min(100, (count / maxCount) * 100);
    const color = getColor(count);

    layer.bindPopup(`
      <div style="
        padding: 14px;
        font-family: 'Inter', -apple-system, sans-serif;
        min-width: 220px;
      ">
        <div style="
          display: flex;
          align-items: center;
          margin-bottom: 12px;
          padding-bottom: 10px;
          border-bottom: 2px solid ${color};
        ">
          <div style="
            width: 14px; height: 14px;
            background: ${color};
            border-radius: 50%;
            margin-right: 10px;
            box-shadow: 0 0 6px ${color}80;
          "></div>
          <h3 style="margin:0; color:#1e293b; font-size:16px; font-weight:700;">
            ${feature.properties.name}
          </h3>
        </div>
        <div style="margin-bottom: 10px;">
          <div style="display:flex; justify-content:space-between; margin-bottom:6px;">
            <span style="color:#64748b; font-size:13px;">${cardtitle}:</span>
            <strong style="color:${color}; font-size:15px;">
              ${count.toLocaleString()}
            </strong>
          </div>
          <div style="
            height: 8px;
            background: #f1f5f9;
            border-radius: 4px;
            overflow: hidden;
          ">
            <div style="
              width: ${barWidth}%;
              height: 100%;
              background: linear-gradient(90deg, ${color}, ${color}dd);
              border-radius: 4px;
              transition: width 0.3s ease;
            "></div>
          </div>
          <div style="text-align:right; font-size:11px; color:#94a3b8; margin-top:3px;">
            ${pct}% of total
          </div>
        </div>
      </div>
    `);

    // Show tooltip on hover with name + count
    layer.bindTooltip(
      `<strong>${feature.properties.name}</strong>: ${count.toLocaleString()}`,
      { direction: 'top', offset: [0, -8], className: 'wilaya-tooltip' }
    );
  };

  return (
    <Box sx={{ 
      height: '85vh', 
      width: '100%',
      position: 'relative',
      borderRadius: '16px',
      overflow: 'hidden',
      boxShadow: '0 4px 24px rgba(0,0,0,0.08)',
      border: '1px solid #e2e8f0',
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
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
          attribution='&copy; OpenStreetMap contributors'
        />
        
        {/* Key forces re-render when data changes */}
        <GeoJSON
          key={dataKey}
          data={geoData}
          pointToLayer={pointToLayer}
          onEachFeature={onEachFeature}
        />
        
        <ScaleControl position="bottomleft" imperial={false} />
        <ZoomControl position="topright" />
        
        {/* Legend */}
        <div className="leaflet-bottom leaflet-right">
          <div className="leaflet-control" style={{
            padding: '14px 16px',
            background: 'rgba(255, 255, 255, 0.96)',
            borderRadius: '12px',
            boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
            maxWidth: '200px',
            backdropFilter: 'blur(8px)',
            border: '1px solid #e2e8f0',
          }}>
            <div style={{ 
              fontSize: '13px', 
              fontWeight: 700, 
              color: '#1e293b', 
              marginBottom: '10px',
              paddingBottom: '6px',
              borderBottom: '2px solid #8b5cf6',
            }}>
              {cardtitle} Distribution
            </div>
            {COLOR_SCALE.map((item, i) => (
              <div key={i} style={{ 
                display: 'flex', 
                alignItems: 'center',
                marginBottom: '5px',
              }}>
                <div style={{
                  width: '14px',
                  height: '14px',
                  borderRadius: '3px',
                  marginRight: '8px',
                  backgroundColor: item.color,
                  border: '1px solid rgba(0,0,0,0.08)',
                  flexShrink: 0,
                }}></div>
                <span style={{
                  fontSize: '12px',
                  fontWeight: 500,
                  color: '#475569',
                }}>{item.label}</span>
              </div>
            ))}
          </div>
        </div>
      </MapContainer>
      
      {/* Title Badge */}
      <Box sx={{
        position: 'absolute',
        top: 16,
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 1000,
        backgroundColor: 'rgba(255, 255, 255, 0.96)',
        padding: '10px 24px',
        borderRadius: '24px',
        boxShadow: '0 2px 12px rgba(0,0,0,0.1)',
        backdropFilter: 'blur(8px)',
        border: '1px solid #e2e8f0',
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
      }}>
        <Typography sx={{ 
          color: '#1e293b',
          fontWeight: 700,
          fontSize: '0.95rem',
        }}>
          {maptitle}
        </Typography>
        <Typography sx={{
          backgroundColor: '#8b5cf6',
          color: '#fff',
          fontSize: '0.75rem',
          fontWeight: 600,
          padding: '2px 10px',
          borderRadius: '12px',
        }}>
          {totalCount.toLocaleString()}
        </Typography>
      </Box>
    </Box>
  );
};

export default AlgerMap;