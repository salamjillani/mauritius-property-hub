// src/main.tsx
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import 'leaflet/dist/leaflet.css';
import './index.css'
import './i18n';
import axios from 'axios';

// Set base URL for API requests
axios.defaults.baseURL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

createRoot(document.getElementById("root")!).render(<App />);