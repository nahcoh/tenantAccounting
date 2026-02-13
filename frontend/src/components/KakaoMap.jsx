import React, { useEffect, useRef, useState } from 'react';

export default function KakaoMap({ address, className = '' }) {
  const mapRef = useRef(null);
  const [mapError, setMapError] = useState(false);

  useEffect(() => {
    if (!address || !mapRef.current) return;
    if (!window.kakao || !window.kakao.maps) {
      setMapError(true);
      return;
    }

    const geocoder = new window.kakao.maps.services.Geocoder();

    geocoder.addressSearch(address, (result, status) => {
      if (status === window.kakao.maps.services.Status.OK) {
        const coords = new window.kakao.maps.LatLng(result[0].y, result[0].x);

        const map = new window.kakao.maps.Map(mapRef.current, {
          center: coords,
          level: 3,
        });

        const marker = new window.kakao.maps.Marker({
          map: map,
          position: coords,
        });

        const infowindow = new window.kakao.maps.InfoWindow({
          content: `<div style="padding:5px;font-size:12px;white-space:nowrap;">${address}</div>`,
        });
        infowindow.open(map, marker);

        setMapError(false);
      } else {
        setMapError(true);
      }
    });
  }, [address]);

  if (mapError) {
    return null;
  }

  return (
    <div
      ref={mapRef}
      className={`w-full h-full rounded-2xl ${className}`}
      style={{ minHeight: '200px' }}
    />
  );
}
