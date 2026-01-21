
import React from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, Legend 
} from 'recharts';
import { Client, ClientSize, ClientType } from '../types';
import { Users, Store, TrendingUp, MapPin, Building2 } from 'lucide-react';

interface DashboardProps {
  clients: Client[];
}

export const Dashboard: React.FC<DashboardProps> = ({ clients }) => {
  const totalClients = clients.length;
  const activeClients = clients.filter(c => c.status === 'Ativo').length;
  const potentialClients = clients.filter(c => c.status === 'Potencial').length;
  
  // Data for chart: Clients by Size
  const sizeData = Object.values(ClientSize).map(size => ({
    name: size,
    value: clients.filter(c => c.clientSize === size).length
  }));

  // Data for chart: Clients by Type
  const typeData = Object.values(ClientType).map(type => ({
    name: type,
    value: clients.filter(c => c.clientType === type).length
  }));

  // Data for chart: Clients by Neighborhood
  const neighborhoodMap = new Map();
  clients.forEach(c => {
    neighborhoodMap.set(c.neighborhood, (neighborhoodMap.get(c.neighborhood) || 0) + 1);
  });
  const neighborhoodData = Array.from(neighborhoodMap.entries())
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 8); // Top 8 neighborhoods

  const COLORS = ['#FF3B1D', '#FFA726', '#4CAF50', '#2196F3', '#9C27B0', '#00BCD4', '#795548', '#607D8B'];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col items-center transition-transform hover:scale-[1.02]">
          <Users className="text-[#FF3B1D] mb-2" size={24} />
          <span className="text-2xl font-bold text-gray-800">{totalClients}</span>
          <span className="text-xs text-gray-500 uppercase font-medium">Total Clientes</span>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col items-center transition-transform hover:scale-[1.02]">
          <TrendingUp className="text-green-500 mb-2" size={24} />
          <span className="text-2xl font-bold text-gray-800">{activeClients}</span>
          <span className="text-xs text-gray-500 uppercase font-medium">Ativos</span>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col items-center transition-transform hover:scale-[1.02]">
          <Building2 className="text-blue-500 mb-2" size={24} />
          <span className="text-2xl font-bold text-gray-800">{potentialClients}</span>
          <span className="text-xs text-gray-500 uppercase font-medium">Potenciais</span>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col items-center transition-transform hover:scale-[1.02]">
          <MapPin className="text-orange-500 mb-2" size={24} />
          <span className="text-2xl font-bold text-gray-800">Maceió</span>
          <span className="text-xs text-gray-500 uppercase font-medium">AL</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Neighborhood Distribution */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
             <MapPin size={18} className="text-[#FF3B1D]" /> Concentração por Bairro
          </h3>
          <div className="h-64">
            {neighborhoodData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={neighborhoodData} layout="vertical" margin={{ left: 20, right: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                  <XAxis type="number" hide />
                  <YAxis dataKey="name" type="category" fontSize={10} width={80} />
                  <Tooltip cursor={{fill: '#fef2f2'}} />
                  <Bar dataKey="value" fill="#FF3B1D" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-gray-400 italic">Sem dados de geolocalização</div>
            )}
          </div>
        </div>

        {/* Size Distribution */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
             <Store size={18} className="text-[#FF3B1D]" /> Clientes por Porte
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={sizeData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {sizeData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend iconType="circle" />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Category Distribution */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 lg:col-span-2">
          <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
             <Building2 size={18} className="text-[#FF3B1D]" /> Distribuição por Categoria
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={typeData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" fontSize={10} interval={0} />
                <YAxis />
                <Tooltip cursor={{fill: '#fef2f2'}} />
                <Bar dataKey="value" fill="#FF3B1D" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
