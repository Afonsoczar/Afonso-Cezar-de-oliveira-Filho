
import React, { useState } from 'react';
import { Client, ClientType, ClientSize } from '../types';
import { NEIGHBORHOODS } from '../constants';
import { Search, Filter, Download, User as UserIcon, Calendar, MapPin } from 'lucide-react';
import { exportToCSV } from '../services/storageService';
import { Button } from './Button';

interface ClientListProps {
  clients: Client[];
}

export const ClientList: React.FC<ClientListProps> = ({ clients }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterNeighborhood, setFilterNeighborhood] = useState('');
  const [filterType, setFilterType] = useState('');
  const [filterSize, setFilterSize] = useState('');

  const filteredClients = clients.filter(c => {
    const matchesSearch = 
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      c.phone.includes(searchTerm) ||
      c.id.includes(searchTerm);
    
    const matchesNeighborhood = !filterNeighborhood || c.neighborhood === filterNeighborhood;
    const matchesType = !filterType || c.clientType === filterType;
    const matchesSize = !filterSize || c.clientSize === filterSize;

    return matchesSearch && matchesNeighborhood && matchesType && matchesSize;
  });

  return (
    <div className="space-y-4">
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col gap-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input 
            type="text"
            placeholder="Buscar por nome, telefone ou código..."
            className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-[#FF3B1D]"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <select 
            className="p-2 text-sm bg-gray-50 border border-gray-200 rounded-lg outline-none"
            value={filterNeighborhood}
            onChange={(e) => setFilterNeighborhood(e.target.value)}
          >
            <option value="">Bairro (Todos)</option>
            {NEIGHBORHOODS.map(n => <option key={n} value={n}>{n}</option>)}
          </select>

          <select 
            className="p-2 text-sm bg-gray-50 border border-gray-200 rounded-lg outline-none"
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
          >
            <option value="">Tipo (Todos)</option>
            {Object.values(ClientType).map(t => <option key={t} value={t}>{t}</option>)}
          </select>

          <select 
            className="p-2 text-sm bg-gray-50 border border-gray-200 rounded-lg outline-none"
            value={filterSize}
            onChange={(e) => setFilterSize(e.target.value)}
          >
            <option value="">Porte (Todos)</option>
            {Object.values(ClientSize).map(s => <option key={s} value={s}>{s}</option>)}
          </select>

          <Button variant="secondary" onClick={() => exportToCSV(filteredClients)} className="text-xs h-10">
            <Download size={16} /> Exportar
          </Button>
        </div>
      </div>

      <div className="text-xs text-gray-500 font-medium px-1">
        Mostrando {filteredClients.length} de {clients.length} clientes
      </div>

      <div className="grid grid-cols-1 gap-4">
        {filteredClients.map(client => (
          <div key={client.id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 hover:border-[#FF3B1D]/30 transition-colors">
            <div className="flex justify-between items-start mb-2">
              <div>
                <span className="text-[10px] font-bold text-gray-400 uppercase">#{client.id}</span>
                <h4 className="font-bold text-gray-800 text-lg leading-tight">{client.name}</h4>
              </div>
              <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase ${
                client.status === 'Ativo' ? 'bg-green-100 text-green-700' :
                client.status === 'Potencial' ? 'bg-blue-100 text-blue-700' :
                'bg-gray-100 text-gray-700'
              }`}>
                {client.status}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-y-2 mt-4 text-sm">
              <div className="flex items-center gap-2 text-gray-600">
                <Store size={14} className="text-[#FF3B1D]" />
                <span>{client.clientType}</span>
              </div>
              <div className="flex items-center gap-2 text-gray-600">
                <MapPin size={14} className="text-[#FF3B1D]" />
                <span className="truncate">{client.neighborhood}</span>
              </div>
              <div className="flex items-center gap-2 text-gray-600">
                <UserIcon size={14} className="text-[#FF3B1D]" />
                <span className="truncate">{client.responsibleName}</span>
              </div>
              <div className="flex items-center gap-2 text-gray-600">
                <Calendar size={14} className="text-[#FF3B1D]" />
                <span>{new Date(client.createdAt).toLocaleDateString()}</span>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-gray-50 flex justify-between items-center">
              <span className="text-xs text-gray-400">Por: {client.registeredBy}</span>
              <a 
                href={`https://wa.me/55${client.phone.replace(/\D/g, '')}`} 
                target="_blank" 
                rel="noreferrer"
                className="text-xs font-bold text-[#FF3B1D] hover:underline"
              >
                Conversar WhatsApp
              </a>
            </div>
          </div>
        ))}

        {filteredClients.length === 0 && (
          <div className="py-20 text-center text-gray-400">
            Nenhum cliente encontrado com esses filtros.
          </div>
        )}
      </div>
    </div>
  );
};

const Store = ({ size, className }: { size: number, className?: string }) => (
  <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m2 7 4.41-4.41A2 2 0 0 1 7.83 2h8.34a2 2 0 0 1 1.42.59L22 7"/><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/><path d="M15 22v-4a2 2 0 0 0-2-2h-2a2 2 0 0 0-2 2v4"/><path d="M2 7h20"/><path d="M22 7v3a2 2 0 0 1-2 2v0a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 16 12a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 12 12a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 8 12a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 4 12v0a2 2 0 0 1-2-2V7"/></svg>
);
