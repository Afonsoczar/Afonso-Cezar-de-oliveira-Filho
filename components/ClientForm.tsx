
import React, { useState, useEffect } from 'react';
import { 
  ClientType, ClientSize, ClientStatus, User 
} from '../types';
import { 
  NEIGHBORHOODS, CLIENT_SEGMENTS 
} from '../constants';
import { Button } from './Button';
import { lookupCNPJ } from '../services/geminiService';
import { MapPin, Search, ChevronLeft } from 'lucide-react';

interface ClientFormProps {
  user: User;
  onSave: (client: any) => void;
  onCancel: () => void;
}

export const ClientForm: React.FC<ClientFormProps> = ({ user, onSave, onCancel }) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '', // Nome Fantasia
    razaoSocial: '',
    responsibleName: '',
    phone: '',
    address: '',
    neighborhood: NEIGHBORHOODS[0],
    city: 'Maceió',
    state: 'AL',
    documentType: 'CNPJ' as 'CPF' | 'CNPJ',
    documentValue: '',
    clientType: ClientType.LANCHONETE,
    clientSize: ClientSize.PEQUENO,
    segment: CLIENT_SEGMENTS[0],
    status: ClientStatus.POTENCIAL,
    observations: '',
    latitude: null as number | null,
    longitude: null as number | null
  });

  useEffect(() => {
    // Capture location on mount
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition((position) => {
        setFormData(prev => ({
          ...prev,
          latitude: position.coords.latitude,
          longitude: position.coords.longitude
        }));
      }, (error) => {
        console.error("Erro ao obter localização:", error);
      });
    }
  }, []);

  const handleCNPJLookup = async () => {
    const cleanCNPJ = formData.documentValue.replace(/\D/g, '');
    if (cleanCNPJ.length !== 14) {
      alert("Digite um CNPJ válido com 14 dígitos.");
      return;
    }
    
    setLoading(true);
    const data = await lookupCNPJ(cleanCNPJ);
    if (data) {
      setFormData(prev => ({
        ...prev,
        razaoSocial: data.razaoSocial,
        name: data.nomeFantasia,
        address: data.logradouro || prev.address,
        neighborhood: NEIGHBORHOODS.includes(data.bairro) ? data.bairro : prev.neighborhood,
        city: data.cidade || 'Maceió',
        state: data.uf || 'AL'
      }));
    } else {
      alert("Não foi possível encontrar dados para este CNPJ automaticamente. Por favor, preencha manualmente.");
    }
    setLoading(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      ...formData,
      registeredBy: user.username
    });
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100">
      <div className="bg-[#FF3B1D] p-4 text-white flex items-center gap-3">
        <button onClick={onCancel} className="p-1 hover:bg-white/10 rounded-full">
          <ChevronLeft size={24} />
        </button>
        <h2 className="text-xl font-bold">Novo Cadastro</h2>
      </div>

      <form onSubmit={handleSubmit} className="p-6 space-y-6">
        {/* Documentação */}
        <section className="space-y-4">
          <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider">Documentação</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold text-gray-700">Tipo de Documento</label>
              <select 
                className="p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#FF3B1D] outline-none"
                value={formData.documentType}
                onChange={(e) => setFormData({...formData, documentType: e.target.value as any})}
              >
                <option value="CNPJ">CNPJ</option>
                <option value="CPF">CPF</option>
              </select>
            </div>
            
            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold text-gray-700">{formData.documentType}</label>
              <div className="relative">
                <input 
                  type="text"
                  required
                  placeholder={`Digite o ${formData.documentType}`}
                  className="w-full pl-3 pr-24 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#FF3B1D] outline-none"
                  value={formData.documentValue}
                  onChange={(e) => setFormData({...formData, documentValue: e.target.value})}
                />
                {formData.documentType === 'CNPJ' && (
                  <button 
                    type="button"
                    onClick={handleCNPJLookup}
                    className="absolute right-2 top-2 p-1.5 h-10 bg-[#FF3B1D] text-white hover:bg-[#E0341A] rounded-lg transition-colors flex items-center gap-1 text-xs px-3 font-bold shadow-sm"
                  >
                    <Search size={14} /> BUSCAR
                  </button>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Identificação */}
        <section className="space-y-4">
          <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider">Dados do Estabelecimento</h3>
          
          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold text-gray-700">Razão Social</label>
            <input 
              type="text" 
              placeholder="Ex: Empresa de Alimentos LTDA"
              className="p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#FF3B1D] outline-none"
              value={formData.razaoSocial}
              onChange={(e) => setFormData({...formData, razaoSocial: e.target.value})}
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold text-gray-700">Nome Fantasia (Estabelecimento)</label>
            <input 
              type="text" required
              placeholder="Como o local é conhecido"
              className="p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#FF3B1D] outline-none"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold text-gray-700">Nome do Responsável</label>
              <input 
                type="text" required
                placeholder="Contato principal"
                className="p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#FF3B1D] outline-none"
                value={formData.responsibleName}
                onChange={(e) => setFormData({...formData, responsibleName: e.target.value})}
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold text-gray-700">WhatsApp / Telefone</label>
              <input 
                type="tel" required
                placeholder="(82) 99999-9999"
                className="p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#FF3B1D] outline-none"
                value={formData.phone}
                onChange={(e) => setFormData({...formData, phone: e.target.value})}
              />
            </div>
          </div>
        </section>

        {/* Localização */}
        <section className="space-y-4">
          <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider">Endereço</h3>
          
          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold text-gray-700">Logradouro / Número</label>
            <input 
              type="text" required
              className="p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#FF3B1D] outline-none"
              value={formData.address}
              onChange={(e) => setFormData({...formData, address: e.target.value})}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold text-gray-700">Bairro</label>
              <select 
                className="p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#FF3B1D] outline-none"
                value={formData.neighborhood}
                onChange={(e) => setFormData({...formData, neighborhood: e.target.value})}
              >
                {NEIGHBORHOODS.map(n => <option key={n} value={n}>{n}</option>)}
              </select>
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold text-gray-700">Cidade</label>
              <input readOnly value={formData.city} className="p-3 bg-gray-100 border border-gray-200 rounded-xl text-gray-500" />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold text-gray-700">Estado</label>
              <input readOnly value={formData.state} className="p-3 bg-gray-100 border border-gray-200 rounded-xl text-gray-500" />
            </div>
          </div>

          <div className="bg-gray-100 p-3 rounded-xl flex items-center gap-3">
            <MapPin className="text-[#FF3B1D]" size={20} />
            <div className="text-xs text-gray-600">
              <p>GPS capturado:</p>
              <p className="font-mono font-bold text-gray-800">{formData.latitude ? `${formData.latitude.toFixed(6)}, ${formData.longitude?.toFixed(6)}` : 'Obtendo localização...'}</p>
            </div>
          </div>
        </section>

        {/* Perfil Comercial */}
        <section className="space-y-4">
          <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider">Classificação Comercial</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold text-gray-700">Tipo de Cliente</label>
              <select 
                className="p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#FF3B1D] outline-none"
                value={formData.clientType}
                onChange={(e) => setFormData({...formData, clientType: e.target.value as any})}
              >
                {Object.values(ClientType).map(v => <option key={v} value={v}>{v}</option>)}
              </select>
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold text-gray-700">Tamanho do Cliente</label>
              <select 
                className="p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#FF3B1D] outline-none"
                value={formData.clientSize}
                onChange={(e) => setFormData({...formData, clientSize: e.target.value as any})}
              >
                {Object.values(ClientSize).map(v => <option key={v} value={v}>{v}</option>)}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold text-gray-700">Segmento</label>
              <select 
                className="p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#FF3B1D] outline-none"
                value={formData.segment}
                onChange={(e) => setFormData({...formData, segment: e.target.value})}
              >
                {CLIENT_SEGMENTS.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold text-gray-700">Status</label>
              <select 
                className="p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#FF3B1D] outline-none"
                value={formData.status}
                onChange={(e) => setFormData({...formData, status: e.target.value as any})}
              >
                {Object.values(ClientStatus).map(v => <option key={v} value={v}>{v}</option>)}
              </select>
            </div>
          </div>
        </section>

        <section className="space-y-4">
          <label className="text-sm font-semibold text-gray-700">Observações</label>
          <textarea 
            rows={3}
            className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#FF3B1D] outline-none"
            placeholder="Informações adicionais importantes sobre o ponto ou dono..."
            value={formData.observations}
            onChange={(e) => setFormData({...formData, observations: e.target.value})}
          />
        </section>

        <div className="pt-4 flex gap-4 sticky bottom-0 bg-white py-2">
          <Button type="button" variant="secondary" className="flex-1" onClick={onCancel}>Cancelar</Button>
          <Button type="submit" className="flex-[2]" isLoading={loading}>Finalizar Cadastro</Button>
        </div>
      </form>
    </div>
  );
};
