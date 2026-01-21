
import { Client, User } from '../types';
import { INITIAL_CLIENT_CODE } from '../constants';

const CLIENTS_KEY = 'lele_da_kuka_clients_v1';
const USERS_KEY = 'lele_da_kuka_users_v1';

// --- Client Management ---
export const getClients = (): Client[] => {
  const data = localStorage.getItem(CLIENTS_KEY);
  return data ? JSON.parse(data) : [];
};

export const saveClient = (clientData: Omit<Client, 'id' | 'createdAt'>): Client => {
  const clients = getClients();
  const nextId = clients.length > 0 
    ? Math.max(...clients.map(c => parseInt(c.id))) + 1 
    : INITIAL_CLIENT_CODE;
    
  const newClient: Client = {
    ...clientData,
    id: nextId.toString(),
    createdAt: new Date().toISOString()
  };
  
  const updatedClients = [...clients, newClient];
  localStorage.setItem(CLIENTS_KEY, JSON.stringify(updatedClients));
  return newClient;
};

// --- User Management ---
export const getUsers = (): User[] => {
  const data = localStorage.getItem(USERS_KEY);
  const users = data ? JSON.parse(data) : [];
  
  // Ensure default admin exists
  if (users.length === 0) {
    const defaultAdmin: User = {
      id: 'admin-0',
      username: 'admin',
      password: '123',
      role: 'admin'
    };
    localStorage.setItem(USERS_KEY, JSON.stringify([defaultAdmin]));
    return [defaultAdmin];
  }
  return users;
};

export const saveUser = (userData: Omit<User, 'id'>): User => {
  const users = getUsers();
  const newUser: User = {
    ...userData,
    id: `user-${Date.now()}`
  };
  const updatedUsers = [...users, newUser];
  localStorage.setItem(USERS_KEY, JSON.stringify(updatedUsers));
  return newUser;
};

export const deleteUser = (id: string) => {
  const users = getUsers().filter(u => u.id !== id);
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
};

export const exportToCSV = (clients: Client[]) => {
  if (clients.length === 0) return;
  
  const headers = [
    'Código', 'Razão Social', 'Nome Fantasia', 'Responsável', 'Telefone', 'Endereço', 'Bairro', 
    'Cidade', 'Estado', 'Tipo Doc', 'Documento', 'Tipo Cliente', 'Tamanho', 'Segmento', 
    'Status', 'Latitude', 'Longitude', 'Cadastrado Por', 'Data Cadastro', 'Observações'
  ];
  
  const rows = clients.map(c => [
    c.id, c.razaoSocial || '', c.name || '', c.responsibleName || '', c.phone || '', c.address || '', c.neighborhood || '', 
    c.city || 'Maceió', c.state || 'AL', c.documentType, c.documentValue, c.clientType, c.clientSize, c.segment, 
    c.status, c.latitude || '', c.longitude || '', c.registeredBy, c.createdAt, c.observations || ''
  ]);
  
  const csvContent = [
    headers.join(';'),
    ...rows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(';'))
  ].join('\n');
  
  const blob = new Blob([`\ufeff${csvContent}`], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `clientes_lele_da_kuka_${new Date().toISOString().split('T')[0]}.csv`);
  link.click();
};
