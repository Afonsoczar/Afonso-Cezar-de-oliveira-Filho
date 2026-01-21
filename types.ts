
export enum ClientType {
  LANCHONETE = 'Lanchonete',
  BAR = 'Bar',
  RESTAURANTE = 'Restaurante',
  FOOD_TRUCK = 'Food Truck',
  PONTO_INFORMAL = 'Ponto Informal'
}

export enum ClientSize {
  PEQUENO = 'Pequeno',
  MEDIO = 'Médio',
  GRANDE = 'Grande'
}

export enum ClientStatus {
  ATIVO = 'Ativo',
  POTENCIAL = 'Potencial',
  INATIVO = 'Inativo'
}

export interface Client {
  id: string; // Unique numeric code starting from 1000
  name: string; // Nome Fantasia / Estabelecimento
  razaoSocial: string; // Razão Social oficial
  responsibleName: string;
  phone: string;
  address: string;
  neighborhood: string;
  city: string;
  state: string;
  documentType: 'CPF' | 'CNPJ';
  documentValue: string;
  clientType: ClientType;
  clientSize: ClientSize;
  segment: string;
  status: ClientStatus;
  latitude: number | null;
  longitude: number | null;
  registeredBy: string;
  createdAt: string;
  observations: string;
}

export interface User {
  id: string;
  username: string;
  password?: string;
  role: 'admin' | 'vendedor';
}
