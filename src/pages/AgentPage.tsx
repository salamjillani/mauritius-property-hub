import React from 'react';
import { useParams } from 'react-router-dom';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MapPin, Phone, Mail, Star, MessageCircle, Calendar, Share2, Bookmark, Home, Check, Award } from "lucide-react";
import { motion } from "framer-motion";
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { AGENTS } from '@/data/agents';
import BackButton from '@/components/BackButton';
import PropertyStatusBadge from '@/components/PropertyStatusBadge';

const AgentPage = () => {
  const { id } = useParams<{ id: string }>();
  const agent = AGENTS.find(agent => agent.id === id);

  // Sample property data - in a real app, this would come from your database
  const agentProperties = [
    {
      id: "prop-sample-1",
      title: "Modern Penthouse",
      location: "Flic en Flac, Mauritius",
      price: 1850000,
      status: "sold" as const,
      soldDate: new Date(2023, 11, 15), // December 15, 2023
      description: "A stylish penthouse featuring panoramic sea views, private rooftop terrace, and premium finishes throughout.",
      image: "/lovable-uploads/fa0ea7e6-9551-4720-9c0d-25afef297d47.png"
    },
    {
      id: "prop-sample-2",
      title: "Luxury Beach Villa",
      location: "Grand Baie, Mauritius",
      price: 2500000,
      status: "for-sale" as const,
      description: "This luxurious beachfront villa offers breathtaking ocean views, modern design, a private pool, and direct beach access.",
      image: "/lovable-uploads/42669f7c-63eb-4b15-b527-72200b40cd5c.png"
    },
    {
      id: "prop-sample-3",
      title: "Executive Apartment",
      location: "Port Louis, Mauritius",
      price: 15000,
      status: "for-rent" as const,
      description: "Spacious executive apartment in the heart of the city with modern amenities and beautiful city views.",
      image: "/lovable-uploads/42669f7c-63eb-4b15-b527-72200b40cd5c.png"
    },
    {
      id: "prop-sample-4",
      title: "Seaside Condo",
      location: "Tamarin, Mauritius",
      price: 950000,
      status: "rented" as const,
      soldDate: new Date(2024, 2, 5), // March 5, 2024
      description: "Beautiful seaside condo with stunning sunset views and access to community amenities.",
      image: "/lovable-uploads/42669f7c-63eb-4b15-b527-72200b40cd5c.png"
    }
  ];

  if (!agent) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <h1>Agent not found</h1>
        </div>
        <Footer />
      </div>
    );
  }

  // Animation variants
  const fadeInUp = {
    hidden: { opacity: 0, y: 40 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.8 } }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-50 to-slate-100">
      <Navbar />
      <div className="flex-1 relative">
        <BackButton className="absolute top-6 left-6 z-10" />
        <div className="max-w-7xl mx-auto p-6 md:p-10 space-y-16 relative">
          {/* Floating Contact Button */}
          <div className="fixed bottom-6 right-6 z-50">
            <Button className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white shadow-xl flex gap-2 px-6 py-6 rounded-full transition-all duration-300 hover:scale-105">
              <MessageCircle size={20} /> Contact {agent.name.split(' ')[0]}
            </Button>
          </div>

          {/* Hero Section */}
          <motion.section 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInUp}
            className="relative rounded-3xl overflow-hidden shadow-2xl"
          >
            {/* Background gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-r from-slate-900/90 to-slate-900/70 z-10"></div>
            
            {/* Background image */}
            <div className="absolute inset-0 bg-cover bg-center opacity-40" 
                 style={{ backgroundImage: `url('/lovable-uploads/42669f7c-63eb-4b15-b527-72200b40cd5c.png')` }}>
            </div>
            
            {/* Content */}
            <div className="relative z-20 p-8 md:p-12 flex flex-col md:flex-row items-center gap-10">
              <div className="relative">
                <img 
                  src={agent.photo} 
                  alt={agent.name}
                  className="w-40 h-40 md:w-48 md:h-48 rounded-full border-4 border-amber-400 shadow-lg object-cover" 
                />
                <div className="absolute -bottom-2 -right-2 bg-amber-400 text-slate-900 rounded-full p-2">
                  <Award size={24} />
                </div>
              </div>
              <div className="space-y-4 text-center md:text-left">
                <div className="inline-flex items-center gap-2 bg-amber-400/20 px-4 py-1 rounded-full text-amber-400 text-sm mb-2">
                  <Check size={16} className="text-amber-400" /> Verified Agent
                </div>
                <h1 className="text-4xl md:text-5xl font-bold text-white">{agent.name}</h1>
                <p className="text-xl text-amber-300 font-light">{agent.role}</p>
                <div className="flex items-center gap-1 justify-center md:justify-start">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={18} className={i < agent.rating ? "text-amber-400 fill-amber-400" : "text-slate-500"} />
                  ))}
                  <span className="text-slate-300 ml-2">{agent.rating}/5</span>
                </div>
                <p className="text-slate-300 max-w-xl italic">{agent.description}</p>
              </div>
            </div>
          </motion.section>

          {/* Contact & Stats Section */}
          <motion.section
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInUp}
            className="bg-white rounded-3xl shadow-lg p-8 flex flex-col sm:flex-row justify-between items-center gap-10"
          >
            <div className="flex flex-wrap gap-4">
              <Button className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white shadow-md flex gap-2 px-6 py-6 transition-all duration-200 hover:shadow-lg">
                <Phone size={18} /> Call Now
              </Button>
              <Button className="border-2 border-amber-500 text-amber-600 hover:bg-amber-50 flex gap-2 px-6 py-6 transition-all duration-200">
                <Mail size={18} /> Email
              </Button>
              <Button className="bg-slate-100 hover:bg-slate-200 text-slate-700 flex gap-2 px-6 py-6 transition-all duration-200">
                <Share2 size={18} /> Share Profile
              </Button>
            </div>
            <div className="flex gap-10 text-center">
              <div className="bg-slate-50 p-4 rounded-xl">
                <p className="text-2xl font-bold text-amber-500">15+</p>
                <p className="text-slate-600">Years Experience</p>
              </div>
              <div className="bg-slate-50 p-4 rounded-xl">
                <p className="text-2xl font-bold text-amber-500">$2.5M</p>
                <p className="text-slate-600">Avg. Listing</p>
              </div>
              <div className="bg-slate-50 p-4 rounded-xl">
                <p className="text-2xl font-bold text-amber-500">{agent.properties}</p>
                <p className="text-slate-600">Properties</p>
              </div>
            </div>
          </motion.section>

          {/* Properties For Sale/Rent Section */}
          <motion.section
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInUp}
          >
            <h2 className="text-2xl font-bold text-slate-800 mb-6 flex items-center gap-2">
              <Home size={24} className="text-amber-500" /> Available Properties
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {agentProperties
                .filter(prop => prop.status === 'for-sale' || prop.status === 'for-rent')
                .map((property) => (
                  <Card key={property.id} className="rounded-2xl overflow-hidden shadow-xl border-0 hover:scale-105 transition-all duration-300 group">
                    <div className="absolute top-4 left-4 z-10">
                      <PropertyStatusBadge status={property.status} />
                    </div>
                    <div className="absolute top-4 right-4 z-10">
                      <Button variant="ghost" size="icon" className="bg-white/80 hover:bg-white rounded-full h-8 w-8">
                        <Bookmark size={16} className="text-slate-600" />
                      </Button>
                    </div>
                    <div className="relative">
                      <img 
                        src={property.image} 
                        alt={property.title}
                        className="h-64 w-full object-cover group-hover:scale-105 transition-transform duration-500" 
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-900/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    </div>
                    <CardContent className="p-6 space-y-3 bg-white">
                      <div className="flex justify-between items-start">
                        <h3 className="text-lg font-bold text-slate-800 group-hover:text-amber-600 transition-colors duration-300">{property.title}</h3>
                        <span className="text-amber-600 font-bold">
                          {property.status === 'for-rent' ? `$${property.price}/month` : `$${property.price.toLocaleString()}`}
                        </span>
                      </div>
                      <div className="flex items-center gap-1 text-slate-500">
                        <MapPin size={16} />
                        <p className="text-sm">{property.location}</p>
                      </div>
                      <p className="text-sm text-slate-600 line-clamp-2">{property.description}</p>
                      <Button className="w-full mt-2 bg-slate-100 hover:bg-slate-200 text-slate-700">View Details</Button>
                    </CardContent>
                  </Card>
                ))}
            </div>
          </motion.section>

          {/* Sold Properties Section */}
          <motion.section
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInUp}
          >
            <h2 className="text-2xl font-bold text-slate-800 mb-6 flex items-center gap-2">
              <Check size={24} className="text-green-500" /> Recently Sold Properties
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {agentProperties
                .filter(prop => prop.status === 'sold' || prop.status === 'rented')
                .map((property) => (
                  <Card key={property.id} className="rounded-2xl overflow-hidden shadow-md border-0 relative group">
                    <div className="absolute top-4 left-4 z-10">
                      <PropertyStatusBadge 
                        status={property.status} 
                        soldDate={property.soldDate}
                      />
                    </div>
                    <div className="relative">
                      <img 
                        src={property.image} 
                        alt={property.title}
                        className="h-64 w-full object-cover grayscale group-hover:grayscale-[70%] transition-all duration-500" 
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-900/70 to-transparent"></div>
                      
                      {/* Sold overlay */}
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="bg-slate-900/60 backdrop-blur-sm px-6 py-2 rounded-full">
                          <p className="text-white font-bold uppercase tracking-wide">
                            {property.status === 'sold' ? 'Sold' : 'Rented'}
                          </p>
                        </div>
                      </div>
                    </div>
                    <CardContent className="p-6 space-y-3 bg-slate-50">
                      <div className="flex justify-between items-start">
                        <h3 className="text-lg font-semibold text-slate-700">{property.title}</h3>
                        <div className="flex items-center gap-1 text-slate-500">
                          <Calendar size={14} />
                          <span className="text-xs">
                            {property.soldDate?.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 text-slate-500">
                        <MapPin size={16} />
                        <p className="text-sm">{property.location}</p>
                      </div>
                      <p className="text-slate-600 font-medium">
                        {property.status === 'rented' ? 
                          `Rented: $${property.price}/month` : 
                          `Sold: $${property.price.toLocaleString()}`}
                      </p>
                      <p className="text-sm text-slate-500 line-clamp-2">{property.description}</p>
                    </CardContent>
                  </Card>
                ))}
            </div>
          </motion.section>

          {/* Map View Section */}
          <motion.section
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInUp}
          >
            <h2 className="text-2xl font-bold text-slate-800 mb-6 flex items-center gap-2">
              <MapPin size={24} className="text-amber-500" /> Property Locations
            </h2>
            <div className="h-[500px] bg-slate-100 rounded-3xl overflow-hidden shadow-lg border border-slate-200">
              {/* Map implementation can be added here */}
              <div className="w-full h-full flex flex-col items-center justify-center text-slate-500">
                <MapPin size={48} className="text-slate-300 mb-4" />
                <p className="text-lg font-medium">Interactive Map Coming Soon</p>
                <p className="text-sm text-slate-400">Explore all properties in their exact locations</p>
              </div>
            </div>
          </motion.section>

          {/* Testimonials Section */}
          <motion.section
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInUp}
            className="mb-16"
          >
            <h2 className="text-2xl font-bold text-slate-800 mb-6 flex items-center gap-2">
              <MessageCircle size={24} className="text-amber-500" /> Client Testimonials
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white p-8 rounded-2xl shadow-lg border border-slate-100">
                <div className="flex gap-2 mb-3">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={18} className="text-amber-400 fill-amber-400" />
                  ))}
                </div>
                <blockquote className="italic text-slate-700 text-lg">
                  "Working with {agent.name} was an absolute pleasure. Their expertise and dedication made finding our perfect property a seamless experience."
                </blockquote>
                <div className="flex items-center gap-4 mt-6">
                  <div className="h-12 w-12 bg-amber-100 rounded-full flex items-center justify-center text-amber-600 font-bold">JD</div>
                  <div>
                    <p className="font-medium text-slate-800">John Doe</p>
                    <p className="text-sm text-slate-500">Purchased in Grand Baie</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white p-8 rounded-2xl shadow-lg border border-slate-100">
                <div className="flex gap-2 mb-3">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={18} className="text-amber-400 fill-amber-400" />
                  ))}
                </div>
                <blockquote className="italic text-slate-700 text-lg">
                  "Exceptional market knowledge and personalized service. {agent.name.split(' ')[0]} understood exactly what we were looking for and delivered beyond our expectations."
                </blockquote>
                <div className="flex items-center gap-4 mt-6">
                  <div className="h-12 w-12 bg-amber-100 rounded-full flex items-center justify-center text-amber-600 font-bold">SM</div>
                  <div>
                    <p className="font-medium text-slate-800">Sarah Miller</p>
                    <p className="text-sm text-slate-500">Rented in Port Louis</p>
                  </div>
                </div>
              </div>
            </div>
          </motion.section>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default AgentPage;