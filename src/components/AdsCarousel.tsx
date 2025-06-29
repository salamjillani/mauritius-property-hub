import React, { useState, useEffect } from 'react';
import { Carousel } from 'react-responsive-carousel';
import 'react-responsive-carousel/lib/styles/carousel.min.css';
import axios from 'axios';

const AdsCarousel = () => {
  const [ads, setAds] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchActiveAds = async () => {
      try {
        const response = await axios.get('/api/advertisements/active');
        // Ensure we're setting an array, even if the response structure is unexpected
        const adsData = response.data?.data || response.data || [];
        setAds(Array.isArray(adsData) ? adsData : []);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching ads:', error);
        setAds([]); // Ensure ads is always an array on error
        setLoading(false);
      }
    };
    fetchActiveAds();
  }, []);

  if (loading) return null;
  // Safe check: ensure ads exists and is an array before checking length
  if (!ads || !Array.isArray(ads) || ads.length === 0) return null;

  return (
    <Carousel
      showArrows={true}
      showStatus={false}
      showThumbs={false}
      infiniteLoop={true}
      autoPlay={true}
      interval={5000}
      stopOnHover={true}
      dynamicHeight={false}
    >
      {ads.map((ad) => (
        <a key={ad._id} href={ad.link} target="_blank" rel="noopener noreferrer">
          <img 
            src={ad.image} 
            alt={ad.title} 
            style={{ maxHeight: '200px', objectFit: 'cover' }} 
          />
        </a>
      ))}
    </Carousel>
  );
};

export default AdsCarousel;