
import React, { useEffect, useRef, useState } from 'react';
import { Client } from '../types';
import { Button } from './Button';
import { MapPin, Key, AlertTriangle, Search, Sparkles, RefreshCw } from 'lucide-react';
import { searchNearbyPlaces } from '../services/geminiService';

interface MapViewerProps {
  clients: Client[];
}

declare global {
  interface AIStudio {
    hasSelectedApiKey: () => Promise<boolean>;
    openSelectKey: () => Promise<void>;
  }
  interface Window {
    google: any;
    gm_authFailure?: () => void;
    // Fix: Changed aistudio to optional to match identical modifiers requirement from global environment
    aistudio?: AIStudio;
    initMapCallback?: () => void;
  }
}

export const MapViewer: React.FC<MapViewerProps> = ({ clients }) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const googleMapRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);
  
  const [status, setStatus] = useState<'checking' | 'needs_key' | 'loading' | 'ready' | 'error'>('checking');
  const [errorMessage, setErrorMessage] = useState('');
  
  // Estados para Busca Inteligente
  const [searchQuery, setSearchQuery] = useState('');
  const [aiResponse, setAiResponse] = useState<string | null>(null);
  const [isSearching, setIsSearching] = useState(false);

  // Função para carregar o script do Google Maps
  const loadGoogleMapsScript = (apiKey: string) => {
    if (window.google && window.google.maps) {
      setStatus('ready');
      return;
    }

    // Callback global de erro do Google Maps (disparado se a chave for inválida ou sem faturamento)
    window.gm_authFailure = () => {
      setStatus('error');
      setErrorMessage('Erro de autenticação: Verifique se sua chave tem faturamento (billing) ativo e a "Maps JavaScript API" habilitada no console do Google Cloud.');
    };

    // Callback de sucesso
    window.initMapCallback = () => {
      setStatus('ready');
    };

    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&callback=initMapCallback`;
    script.async = true;
    script.defer = true;
    script.onerror = () => {
      setStatus('error');
      setErrorMessage('Falha ao carregar o script do Google Maps. Verifique sua conexão.');
    };
    document.head.appendChild(script);
  };

  useEffect(() => {
    const initialize = async () => {
      try {
        // Verifica se a plataforma aistudio está disponível
        if (window.aistudio) {
          const hasKey = await window.aistudio.hasSelectedApiKey();
          if (hasKey) {
            const apiKey = process.env.API_KEY;
            if (apiKey) {
              loadGoogleMapsScript(apiKey);
            } else {
              setStatus('needs_key');
            }
          } else {
            setStatus('needs_key');
          }
        } else {
          // Fallback para quando process.env.API_KEY está disponível diretamente
          const apiKey = process.env.API_KEY;
          if (apiKey) {
            loadGoogleMapsScript(apiKey);
          } else {
            setStatus('error');
            setErrorMessage('Ambiente não configurado corretamente: API_KEY não encontrada.');
          }
        }
      } catch (err) {
        console.error("Erro na inicialização do mapa:", err);
        setStatus('error');
      }
    };

    initialize();
  }, []);

  // Inicializa o mapa quando o script estiver pronto
  useEffect(() => {
    if (status === 'ready' && mapRef.current && !googleMapRef.current) {
      const maceio = { lat: -9.6498, lng: -35.7089 };
      googleMapRef.current = new window.google.maps.Map(mapRef.current, {
        center: maceio,
        zoom: 13,
        mapId: 'LELE_MAP_ID', // Opcional: ID de estilização do Google
        disableDefaultUI: false,
        zoomControl: true,
        streetViewControl: false,
        mapTypeControl: false,
      });
    }

    if (googleMapRef.current && status === 'ready') {
      // Limpa marcadores anteriores
      markersRef.current.forEach(m => m.setMap(null));
      markersRef.current = [];

      const bounds = new window.google.maps.LatLngBounds();
      let hasMarkers = false;

      clients.forEach(client => {
        if (client.latitude && client.longitude) {
          const color = client.status === 'Ativo' ? '#4CAF50' : 
                       client.status === 'Potencial' ? '#2196F3' : '#FF3B1D';

          const marker = new window.google.maps.Marker({
            position: { lat: client.latitude, lng: client.longitude },
            map: googleMapRef.current,
            title: client.name,
            icon: {
              path: window.google.maps.SymbolPath.CIRCLE,
              fillColor: color,
              fillOpacity: 1,
              strokeWeight: 2,
              strokeColor: '#FFFFFF',
              scale: 10
            }
          });

          const infoWindow = new window.google.maps.InfoWindow({
            content: `
              <div style="padding:10px; font-family: sans-serif; min-width: 180px;">
                <h4 style="margin:0; color:#FF3B1D; font-weight:800; font-size:14px;">${client.name}</h4>
                <p style="margin:4px 0; font-size:11px; color:#666;">${client.address}</p>
                <div style="margin-top:8px; display:flex; justify-content:space-between; align-items:center;">
                  <span style="font-size:10px; font-weight:700; color:${color}">${client.status.toUpperCase()}</span>
                  <a href="https://wa.me/55${client.phone.replace(/\D/g, '')}" target="_blank" style="color:#25D366; font-weight:700; font-size:11px; text-decoration:none;">WHATSAPP</a>
                </div>
              </div>
            `
          });

          marker.addListener('click', () => {
            infoWindow.open(googleMapRef.current, marker);
          });

          markersRef.current.push(marker);
          bounds.extend({ lat: client.latitude, lng: client.longitude });
          hasMarkers = true;
        }
      });

      if (hasMarkers) {
        googleMapRef.current.fitBounds(bounds);
        if (clients.filter(c => c.latitude).length === 1) {
          googleMapRef.current.setZoom(16);
        }
      }
    }
  }, [status, clients]);

  const handleOpenSelector = async () => {
    if (window.aistudio) {
      await window.aistudio.openSelectKey();
      window.location.reload();
    }
  };

  const handleAISearch = async () => {
    if (!searchQuery.trim()) return;
    setIsSearching(true);
    setAiResponse(null);
    
    const center = googleMapRef.current?.getCenter() || { lat: -9.6498, lng: -35.7089 };
    const lat = typeof center.lat === 'function' ? center.lat() : center.lat;
    const lng = typeof center.lng === 'function' ? center.lng() : center.lng;

    try {
      const result = await searchNearbyPlaces(searchQuery, lat, lng);
      setAiResponse(result);
    } catch (err) {
      setAiResponse("Erro ao consultar o Gemini.");
    } finally {
      setIsSearching(false);
    }
  };

  // UI para estados de erro e carregamento
  if (status === 'checking' || status === 'loading') {
    return (
      <div className="w-full h-[500px] flex flex-col items-center justify-center bg-gray-50 rounded-3xl border border-gray-100">
        <RefreshCw className="text-[#FF3B1D] animate-spin mb-4" size={40} />
        <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">Carregando Google Maps...</p>
      </div>
    );
  }

  if (status === 'needs_key' || status === 'error') {
    return (
      <div className="w-full h-[500px] flex flex-col items-center justify-center bg-white rounded-3xl border-2 border-dashed border-gray-200 p-8 text-center">
        <div className="p-6 bg-red-50 rounded-full text-[#FF3B1D] mb-6">
          <AlertTriangle size={48} />
        </div>
        <h3 className="text-xl font-black text-gray-800 mb-2 uppercase tracking-tighter">O Mapa parou de funcionar?</h3>
        <p className="text-gray-500 text-sm mb-6 max-w-sm leading-relaxed">
          {errorMessage || 'Você precisa selecionar uma chave de API válida com faturamento (Billing) ativo para que o Google Maps seja exibido.'}
        </p>
        <Button onClick={handleOpenSelector} className="w-full max-w-xs py-5 shadow-2xl shadow-red-100">
          Configurar Chave de API
        </Button>
        <p className="mt-4 text-[10px] text-gray-400">
          Certifique-se que a <b>Maps JavaScript API</b> está ativada no seu console.
        </p>
      </div>
    );
  }

  return (
    <div className="w-full h-full flex flex-col">
      <div className="p-4 bg-white border-b border-gray-100 flex flex-col gap-3">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Sparkles className="absolute left-3 top-1/2 -translate-y-1/2 text-[#FF3B1D]" size={18} />
            <input 
              type="text" 
              placeholder="Gemini: 'Onde tem padarias nesta região?'"
              className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-[#FF3B1D] outline-none"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAISearch()}
            />
          </div>
          <Button onClick={handleAISearch} isLoading={isSearching} className="px-6 h-12">
            <Search size={20} />
          </Button>
        </div>
        {aiResponse && (
          <div className="p-4 bg-red-50 border border-red-100 rounded-2xl animate-in slide-in-from-top-2">
            <div className="flex justify-between items-center mb-2">
              <span className="text-[10px] font-black text-[#FF3B1D] uppercase tracking-widest">Insight do Gemini</span>
              <button onClick={() => setAiResponse(null)} className="text-gray-400 hover:text-red-500 transition-colors"><X size={14} /></button>
            </div>
            <p className="text-xs text-gray-700 leading-relaxed font-medium">{aiResponse}</p>
          </div>
        )}
      </div>
      <div ref={mapRef} className="flex-1 w-full min-h-[500px]"></div>
    </div>
  );
};

const X = ({ size, className }: { size: number, className?: string }) => (
  <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
);
