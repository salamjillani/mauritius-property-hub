import { useEffect } from 'react';
import { useMap } from 'react-leaflet';

const MapEvents = ({ setMarkerPosition, setFormData }) => {
  const map = useMap();
  
  useEffect(() => {
    const handleClick = (e) => {
      const { lat, lng } = e.latlng;
      setMarkerPosition([lat, lng]);
      setFormData(prev => ({
        ...prev,
        address: {
          ...prev.address,
          latitude: lat.toString(),
          longitude: lng.toString()
        }
      }));
    };

    map.on('click', handleClick);
    return () => {
      map.off('click', handleClick);
    };
  }, [map, setMarkerPosition, setFormData]);

  return null;
};

export default MapEvents;