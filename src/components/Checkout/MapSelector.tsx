"use client";
import React, { useState, useEffect, useRef } from "react";
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from "react-leaflet";
import L from "leaflet";

const markerIcon = new L.Icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

interface MapSelectorProps {
  initialLat: number;
  initialLng: number;
  onLocationSelect: (lat: number, lng: number) => void;
}

const ChangeMapView = ({ coords }: { coords: [number, number] }) => {
  const map = useMap();
  useEffect(() => {
    if (coords[0] !== 0 && coords[1] !== 0) {
      map.flyTo(coords, map.getZoom(), { animate: true, duration: 1.5 });
    }
  }, [coords, map]);
  return null;
};

const MapSelector: React.FC<MapSelectorProps> = ({ initialLat, initialLng, onLocationSelect }) => {
  const [position, setPosition] = useState<[number, number]>([initialLat, initialLng]);
  const [searchQuery, setSearchQuery] = useState("");
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setPosition([initialLat, initialLng]);
  }, [initialLat, initialLng]);

  // Menutup dropdown rekomendasi jika mengklik di luar area input
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // 🔥 EFFECT UNTUK OTOMATIS MENCARI REKOMENDASI ALAMAT SAAT KETIK (Debounce 500ms)
  useEffect(() => {
    if (searchQuery.trim().length < 3) {
      setSuggestions([]);
      return;
    }

    const delayDebounceFn = setTimeout(async () => {
      try {
        // Kita batasi pencarian di area Indonesia agar rekomendasinya lebih relevan
        const response = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
            searchQuery
          )}&countrycodes=id&limit=5`
        );
        const data = await response.json();
        setSuggestions(data || []);
        setShowDropdown(true);
      } catch (error) {
        console.error("Autocomplete error:", error);
      }
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  const MapEvents = () => {
    useMapEvents({
      click(e) {
        const { lat, lng } = e.latlng;
        setPosition([lat, lng]);
        onLocationSelect(lat, lng);
        setShowDropdown(false);
      },
    });
    return null;
  };

  // 🔥 Handler ketika salah satu rekomendasi alamat diklik
  const handleSelectSuggestion = (item: any) => {
    const lat = parseFloat(item.lat);
    const lng = parseFloat(item.lon);
    
    setSearchQuery(item.display_name);
    setPosition([lat, lng]);
    onLocationSelect(lat, lng);
    setShowDropdown(false);
  };

  return (
    <div className="space-y-3 w-full relative" ref={dropdownRef}>
      {/* Container Input & Dropdown */}
      <div className="w-full relative">
        <input
          type="text"
          placeholder="Ketik nama jalan atau daerah (Contoh: Kelud Raya, Tembalang)..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onFocus={() => suggestions.length > 0 && setShowDropdown(true)}
          className="w-full border border-gray-3 bg-white px-3.5 py-2.5 rounded-lg text-xs text-dark focus:outline-none focus:border-blue shadow-sm"
        />

        {/* 🔥 UI DROPDOWN REKOMENDASI ALAMAT */}
        {showDropdown && suggestions.length > 0 && (
          <div className="absolute left-0 right-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg z-[9999] max-h-[200px] overflow-y-auto">
            {suggestions.map((item, index) => (
              <div
                key={index}
                onClick={() => handleSelectSuggestion(item)}
                className="px-4 py-2.5 text-xs text-gray-700 hover:bg-blue/10 hover:text-blue cursor-pointer border-b border-gray-100 last:border-none truncate"
              >
                📍 {item.display_name}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Wadah Peta */}
      <div className="w-full h-[300px] rounded-lg overflow-hidden border border-gray-300 shadow-inner z-0 relative">
        <MapContainer
          center={position}
          zoom={15}
          style={{ height: "100%", width: "100%" }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <Marker position={position} icon={markerIcon} />
          <MapEvents />
          <ChangeMapView coords={position} />
        </MapContainer>
      </div>
    </div>
  );
};

export default MapSelector;