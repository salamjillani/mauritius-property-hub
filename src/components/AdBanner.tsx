import { useState, useEffect } from 'react';

const AdBanner = () => {
  const [ad, setAd] = useState(null);

  useEffect(() => {
    const fetchActiveAd = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/ads/active`);
        if (response.ok) {
          const data = await response.json();
          setAd(data.data);
        }
      } catch (error) {
        console.error('Error fetching ad:', error);
      }
    };

    fetchActiveAd();
    
    // Refresh ad every 5 minutes
    const interval = setInterval(fetchActiveAd, 300000);
    return () => clearInterval(interval);
  }, []);

  if (!ad) return null;

  return (
    <div className="w-full border-b border-blue-200">
      <a
        href={ad.url}
        target="_blank"
        rel="noopener noreferrer"
        className="block w-full relative"
      >
        <img
          src={ad.imageUrl}
          alt={ad.title}
          className="w-full h-20 object-cover"
        />
        {/* Optional: Add overlay text if needed */}
        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-20">
          <span className="text-white font-medium text-lg drop-shadow-lg">
            {ad.title}
          </span>
        </div>
      </a>
    </div>
  );
};

export default AdBanner;