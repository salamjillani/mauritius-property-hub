// AdBanner.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Carousel } from 'react-responsive-carousel';
import 'react-responsive-carousel/lib/styles/carousel.min.css';

const AdBanner = () => {
  const [ads, setAds] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchActiveAds = async () => {
      try {
        const response = await axios.get('/api/advertisements/active');
        setAds(response.data?.data || []);
      } catch (error) {
        console.error('Error fetching ads:', error);
        setAds([]);
      } finally {
        setLoading(false);
      }
    };
    
    fetchActiveAds();
    
    // Refresh ads every 5 minutes
    const interval = setInterval(fetchActiveAds, 300000);
    return () => clearInterval(interval);
  }, []);

  if (loading) return null;
  if (!ads || ads.length === 0) return null;

  return (
    <div className="w-full bg-gray-100 border-b">
      <Carousel 
        showArrows={true}
        showStatus={false}
        showThumbs={false}
        infiniteLoop={true}
        autoPlay={true}
        interval={5000}
        stopOnHover={false}
        swipeable={true}
        dynamicHeight={false}
        emulateTouch={true}
      >
        {ads.map((ad) => (
          <a 
            key={ad._id}
            href={ad.link}
            target="_blank"
            rel="noopener noreferrer"
            className="block"
          >
            <img 
              src={ad.image}
              alt={ad.title}
              className="w-full h-32 object-contain"
            />
          </a>
        ))}
      </Carousel>
    </div>
  );
};

export default AdBanner;