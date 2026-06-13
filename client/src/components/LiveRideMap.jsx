import React, { useState, useEffect, useRef, useCallback } from 'react';
import { GoogleMap, useLoadScript, Polyline, Marker } from '@react-google-maps/api';
import api from '../services/api';
import { Navigation, Wifi, WifiOff } from 'lucide-react';

const LIBRARIES = ['geometry'];

const MAP_OPTIONS = {
  disableDefaultUI: false,
  zoomControl: true,
  streetViewControl: false,
  mapTypeControl: false,
  fullscreenControl: true,
  styles: [
    { featureType: 'poi', elementType: 'labels', stylers: [{ visibility: 'off' }] },
  ],
};

const POLYLINE_OPTIONS = {
  strokeColor: '#10b981',
  strokeOpacity: 0.95,
  strokeWeight: 5,
};

const mapContainerStyle = { width: '100%', height: '300px', borderRadius: '0 0 12px 12px' };

// Default center — India (used only before GPS locks on)
const DEFAULT_CENTER = { lat: 20.5937, lng: 78.9629 };

const LiveRideMap = ({ rideId, onDistanceUpdate }) => {
  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
    libraries: LIBRARIES,
  });

  const [path, setPath] = useState([]);
  const [currentPos, setCurrentPos] = useState(null);
  const [liveDistanceKm, setLiveDistanceKm] = useState(0);
  const [gpsStatus, setGpsStatus] = useState('waiting'); // 'waiting' | 'active' | 'error'
  const mapRef = useRef(null);
  const watchIdRef = useRef(null);
  const lastPointRef = useRef(null);

  const onMapLoad = useCallback((map) => {
    mapRef.current = map;
  }, []);

  // Compute distance using Google Maps Geometry library
  const computeDistance = useCallback((pathArr) => {
    if (!window.google || pathArr.length < 2) return 0;
    let total = 0;
    for (let i = 1; i < pathArr.length; i++) {
      const p1 = new window.google.maps.LatLng(pathArr[i - 1].lat, pathArr[i - 1].lng);
      const p2 = new window.google.maps.LatLng(pathArr[i].lat, pathArr[i].lng);
      total += window.google.maps.geometry.spherical.computeDistanceBetween(p1, p2);
    }
    return Math.round((total / 1000) * 100) / 100;
  }, []);

  useEffect(() => {
    if (!rideId || !isLoaded) return;

    if (!navigator.geolocation) {
      setGpsStatus('error');
      return;
    }

    watchIdRef.current = navigator.geolocation.watchPosition(
      async (position) => {
        const { latitude: lat, longitude: lng } = position.coords;
        const newPoint = { lat, lng };

        setGpsStatus('active');
        setCurrentPos(newPoint);

        // Pan map smoothly to current position
        if (mapRef.current) mapRef.current.panTo(newPoint);

        // Only add point if moved more than ~10m from last point (reduces noise)
        const lastPt = lastPointRef.current;
        if (lastPt && window.google) {
          const dist = window.google.maps.geometry.spherical.computeDistanceBetween(
            new window.google.maps.LatLng(lastPt.lat, lastPt.lng),
            new window.google.maps.LatLng(lat, lng)
          );
          if (dist < 10) return; // skip tiny movements
        }

        lastPointRef.current = newPoint;

        setPath((prev) => {
          const updated = [...prev, newPoint];
          const km = computeDistance(updated);
          setLiveDistanceKm(km);
          onDistanceUpdate?.(km);
          return updated;
        });

        // Send coordinate to backend
        try {
          await api.post('/rides/track', { rideId, lat, lng });
        } catch (e) {
          console.warn('GPS track error:', e.message);
        }
      },
      (err) => {
        console.error('GPS error:', err);
        setGpsStatus('error');
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
    );

    return () => {
      if (watchIdRef.current != null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
    };
  }, [rideId, isLoaded, computeDistance, onDistanceUpdate]);

  if (loadError) {
    return (
      <div className="h-48 flex items-center justify-center bg-red-50 dark:bg-red-900/20 rounded-xl text-red-600 dark:text-red-400 text-sm">
        Failed to load Google Maps. Check your API key.
      </div>
    );
  }

  if (!isLoaded) {
    return (
      <div className="h-48 flex items-center justify-center bg-gray-100 dark:bg-gray-700 rounded-xl">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600" />
      </div>
    );
  }

  return (
    <div className="rounded-xl overflow-hidden border dark:border-gray-600 shadow-inner mt-4">
      {/* Map status bar */}
      <div className="flex items-center justify-between px-4 py-2 bg-gray-800 text-white text-xs">
        <div className="flex items-center gap-2">
          {gpsStatus === 'active' ? (
            <>
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
              </span>
              <Wifi className="w-3.5 h-3.5 text-green-400" />
              <span className="text-green-400 font-medium">GPS Tracking Active</span>
            </>
          ) : gpsStatus === 'error' ? (
            <>
              <WifiOff className="w-3.5 h-3.5 text-red-400" />
              <span className="text-red-400">GPS unavailable — allow location access</span>
            </>
          ) : (
            <>
              <span className="animate-pulse text-yellow-400">⏳</span>
              <span className="text-yellow-400">Acquiring GPS signal…</span>
            </>
          )}
        </div>

        {/* Live distance badge */}
        <div className="flex items-center gap-1.5 bg-emerald-600 px-3 py-1 rounded-full">
          <Navigation className="w-3 h-3" />
          <span className="font-bold tabular-nums">{liveDistanceKm.toFixed(2)} km</span>
        </div>
      </div>

      <GoogleMap
        mapContainerStyle={mapContainerStyle}
        center={currentPos || DEFAULT_CENTER}
        zoom={currentPos ? 17 : 5}
        onLoad={onMapLoad}
        options={MAP_OPTIONS}
      >
        {/* Ride path polyline */}
        {path.length > 1 && (
          <Polyline path={path} options={POLYLINE_OPTIONS} />
        )}

        {/* Current position marker */}
        {currentPos && (
          <Marker
            position={currentPos}
            icon={{
              path: window.google.maps.SymbolPath.CIRCLE,
              scale: 10,
              fillColor: '#10b981',
              fillOpacity: 1,
              strokeColor: '#ffffff',
              strokeWeight: 3,
            }}
            title="Your current location"
          />
        )}

        {/* Start marker */}
        {path.length > 0 && (
          <Marker
            position={path[0]}
            icon={{
              path: window.google.maps.SymbolPath.CIRCLE,
              scale: 7,
              fillColor: '#3b82f6',
              fillOpacity: 1,
              strokeColor: '#ffffff',
              strokeWeight: 2,
            }}
            title="Ride start"
          />
        )}
      </GoogleMap>

      {/* Legend */}
      <div className="flex items-center gap-4 px-4 py-2 bg-gray-50 dark:bg-gray-800 text-xs text-gray-500 dark:text-gray-400 border-t dark:border-gray-700">
        <div className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-blue-500 inline-block" /> Start</div>
        <div className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-emerald-500 inline-block" /> Current</div>
        <div className="flex items-center gap-1.5"><div className="w-6 h-1 bg-emerald-500 rounded" /> Path</div>
        <span className="ml-auto">{path.length} GPS points recorded</span>
      </div>
    </div>
  );
};

export default LiveRideMap;
