'use client';

import React, { useState, useCallback, useRef, useEffect } from 'react';
import { GoogleMap, useJsApiLoader, Marker, Autocomplete } from '@react-google-maps/api';
import { Loader2, MapPin, Search, Crosshair } from 'lucide-react';

const libraries: ("places" | "drawing" | "geometry" | "visualization")[] = ['places'];

interface LocationPickerProps {
    latitude: string;
    longitude: string;
    onChange: (lat: string, lng: string, address?: string) => void;
}

// Default center to Douala, Cameroon if no coords provided
const DEFAULT_CENTER = { lat: 4.0511, lng: 9.7679 };

export default function LocationPicker({ latitude, longitude, onChange }: LocationPickerProps) {
    const { isLoaded, loadError } = useJsApiLoader({
        googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || process.env.NEXT_PUBLIC_FIREBASE_API_KEY || '',
        libraries,
    });

    const [map, setMap] = useState<google.maps.Map | null>(null);
    const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);
    
    // Parse initial coordinates or use default
    const center = {
        lat: parseFloat(latitude) || DEFAULT_CENTER.lat,
        lng: parseFloat(longitude) || DEFAULT_CENTER.lng
    };

    const onLoad = useCallback((map: google.maps.Map) => {
        setMap(map);
    }, []);

    const onUnmount = useCallback(() => {
        setMap(null);
    }, []);

    const handleMapClick = (e: google.maps.MapMouseEvent) => {
        if (e.latLng) {
            const lat = e.latLng.lat();
            const lng = e.latLng.lng();
            onChange(lat.toString(), lng.toString());
        }
    };

    const handlePlaceChanged = () => {
        if (autocompleteRef.current !== null) {
            const place = autocompleteRef.current.getPlace();
            if (place.geometry && place.geometry.location) {
                const lat = place.geometry.location.lat();
                const lng = place.geometry.location.lng();
                const address = place.formatted_address;
                onChange(lat.toString(), lng.toString(), address);
                
                if (map) {
                    map.panTo({ lat, lng });
                    map.setZoom(15);
                }
            }
        }
    };

    const getUserLocation = () => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const lat = position.coords.latitude;
                    const lng = position.coords.longitude;
                    onChange(lat.toString(), lng.toString());
                    if (map) {
                        map.panTo({ lat, lng });
                        map.setZoom(15);
                    }
                },
                () => {
                    alert("Impossible d'obtenir votre position.");
                }
            );
        } else {
            alert("La géolocalisation n'est pas supportée par votre navigateur.");
        }
    };

    if (loadError) {
        return (
            <div className="w-full p-4 border border-red-200 bg-red-50 rounded-xl text-red-600 text-sm">
                Erreur lors du chargement de la carte. Vérifiez la clé API Google Maps.
            </div>
        );
    }

    if (!isLoaded) {
        return (
            <div className="w-full h-[300px] flex flex-col items-center justify-center bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-[#94A3B8]">
                <Loader2 className="w-6 h-6 animate-spin mb-2" />
                <span className="text-sm">Chargement de la carte...</span>
            </div>
        );
    }

    return (
        <div className="w-full space-y-3">
            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#94A3B8] w-4 h-4 z-20 pointer-events-none" />
                <Autocomplete
                    onLoad={(autocomplete) => { autocompleteRef.current = autocomplete; }}
                    onPlaceChanged={handlePlaceChanged}
                    options={{
                        fields: ['geometry.location', 'formatted_address', 'name'],
                        componentRestrictions: { country: 'cm' } 
                    }}
                >
                    <input
                        type="text"
                        placeholder="Rechercher un quartier ou une ville..."
                        className="w-full pl-10 pr-10 py-2.5 text-[13px] border border-[#E2E8F0] rounded-xl bg-white text-[#1E293B] shadow-sm placeholder:text-[#94A3B8] focus:outline-none focus:border-[#22C55E] transition-all relative z-10"
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') e.preventDefault();
                        }}
                    />
                </Autocomplete>
                <button
                    type="button"
                    onClick={getUserLocation}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-[#22C55E] bg-green-50 rounded-lg hover:bg-green-100 transition-colors z-20"
                    title="Utiliser ma position"
                >
                    <Crosshair className="w-4 h-4" />
                </button>
            </div>

            <div className="relative w-full h-[300px] rounded-xl overflow-hidden border border-[#E2E8F0] shadow-sm">
                <GoogleMap
                    mapContainerStyle={{ width: '100%', height: '100%' }}
                    center={center}
                    zoom={13}
                    onClick={handleMapClick}
                    onLoad={onLoad}
                    onUnmount={onUnmount}
                    options={{
                        disableDefaultUI: false,
                        zoomControl: true,
                        streetViewControl: false,
                        mapTypeControl: false,
                        fullscreenControl: true,
                    }}
                >
                    {(latitude && longitude) && (
                        <Marker
                            position={{ lat: parseFloat(latitude), lng: parseFloat(longitude) }}
                            animation={google.maps.Animation.DROP}
                        />
                    )}
                </GoogleMap>
                <div className="absolute top-2 left-2 pointer-events-none bg-white/90 backdrop-blur-[2px] px-3 py-1.5 rounded-lg border border-white/50 shadow-sm flex items-center gap-2">
                    <MapPin className="text-[#22C55E] w-4 h-4" />
                    <span className="text-xs font-medium text-[#1E293B]">
                        Cliquez sur la carte pour ajuster
                    </span>
                </div>
            </div>

            {(latitude && longitude) ? (
                <div className="flex gap-4 text-[11px] text-[#64748B] bg-[#F8FAFC] p-2.5 rounded-lg border border-[#E2E8F0]">
                    <div className="flex-1">
                        <span className="font-semibold text-[#1E293B]">Lat:</span> {parseFloat(latitude).toFixed(6)}
                    </div>
                    <div className="flex-1">
                        <span className="font-semibold text-[#1E293B]">Lng:</span> {parseFloat(longitude).toFixed(6)}
                    </div>
                </div>
            ) : (
                <div className="text-[11px] text-amber-600 bg-amber-50 p-2.5 rounded-lg border border-amber-100">
                    Position non définie. Veuillez rechercher ou cliquer sur la carte.
                </div>
            )}
        </div>
    );
}
