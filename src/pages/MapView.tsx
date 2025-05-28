import { useState, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { useToast } from "@/hooks/use-toast";
import { MapContainer, TileLayer, Marker, Popup, FeatureGroup } from "react-leaflet";
import { EditControl } from "react-leaflet-draw";
import MarkerClusterGroup from "react-leaflet-markercluster";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet-draw/dist/leaflet.draw.css";


const MapView = () => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [properties, setProperties] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filteredProperties, setFilteredProperties] = useState([]);
  const featureGroupRef = useRef(null);

  useEffect(() => {
    const fetchProperties = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/properties`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        if (!response.ok) {
          throw new Error("Failed to fetch properties");
        }
        const data = await response.json();
        setProperties(data.data);
        setFilteredProperties(data.data);
      } catch (error) {
        toast({
          title: t("error"),
          description: t("failed_to_load_properties"),
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };
    fetchProperties();
  }, [toast, t]);

  const handleDrawCreated = (e) => {
    const layer = e.layer;
    const bounds = layer.getBounds();
    const filtered = properties.filter((prop) =>
      bounds.contains([prop.location.latitude, prop.location.longitude])
    );
    setFilteredProperties(filtered);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Navbar />
        <div className="flex-grow flex items-center justify-center">
          <Loader2 className="h-12 w-12 animate-spin" />
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      <main className="flex-grow container mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold mb-6">{t("properties_map")}</h1>
        <MapContainer
          center={[-20.348404, 57.552152]} // Mauritius coordinates
          zoom={10}
          style={{ height: "600px", width: "100%" }}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          />
          <FeatureGroup ref={featureGroupRef}>
            <EditControl
              position="topright"
              onCreated={handleDrawCreated}
              draw={{
                rectangle: true,
                polygon: true,
                circle: false,
                polyline: false,
                marker: false,
              }}
            />
          </FeatureGroup>
          <MarkerClusterGroup>
            {filteredProperties
              .filter((prop) => prop.location?.latitude && prop.location?.longitude)
              .map((prop) => (
                <Marker
                  key={prop._id}
                  position={[prop.location.latitude, prop.location.longitude]}
                  icon={L.icon({
                    iconUrl: "/marker-icon.png",
                    iconSize: [25, 41],
                    iconAnchor: [12, 41],
                  })}
                >
                  <Popup>
                    <div>
                      <h3>{prop.title}</h3>
                      <p>{t("price")}: {prop.price} {prop.currency}</p>
                      <a
                        href={`/properties/${prop.category.replace(" ", "-")}/${prop._id}`}
                        className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-white shadow transition-colors hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                      >
                        {t("view_details")}
                      </a>
                    </div>
                  </Popup>
                </Marker>
              ))}
          </MarkerClusterGroup>
        </MapContainer>
      </main>
      <Footer />
    </div>
  );
};

export default MapView;