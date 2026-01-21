
import React, { useState, useEffect } from 'react';
import { User } from '../types';
import { getUsers, saveUser, deleteUser } from '../services/storageService';
import { Button } from './Button';
import { UserPlus, Trash2, Shield, User as UserIcon } from 'lucide-react';

export const UserManagement: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [showAdd, setShowAdd] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    role: 'vendedor' as 'admin' | 'vendedor'
  });

  useEffect(() => {
    setUsers(getUsers());
  }, []);

  const handleAddUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.username || !formData.password) return;
    
    saveUser(formData);
    setUsers(getUsers());
    setShowAdd(false);
    setFormData({ username: '', password: '', role: 'vendedor' });
  };

  const handleDelete = (id: string, username: string) => {
    if (username === 'admin') {
      alert("O usuário 'admin' padrão não pode ser excluído.");
      return;
    }
    if (window.confirm(`Deseja realmente excluir o usuário ${username}?`)) {
      deleteUser(id);
      setUsers(getUsers());
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-gray-800">Gestão de Acessos</h2>
        <Button onClick={() => setShowAdd(!showAdd)} variant={showAdd ? 'secondary' : 'primary'}>
          {showAdd ? 'Cancelar' : <><UserPlus size={18} /> Novo Usuário</>}
        </Button>
      </div>

      {showAdd && (
        <form onSubmit={handleAddUser} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold">Usuário</label>
            <input 
              type="text" required
              className="p-2 bg-gray-50 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-[#FF3B1D]"
              value={formData.username}
              onChange={e => setFormData({...formData, username: e.target.value})}
            />
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold">Senha</label>
            <input 
              type="password" required
              className="p-2 bg-gray-50 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-[#FF3B1D]"
              value={formData.password}
              onChange={e => setFormData({...formData, password: e.target.value})}
            />
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold">Perfil</label>
            <select 
              className="p-2 bg-gray-50 border border-gray-200 rounded-lg outline-none"
              value={formData.role}
              onChange={e => setFormData({...formData, role: e.target.value as any})}
            >
              <option value="vendedor">Vendedor</option>
              <option value="admin">Administrador</option>
            </select>
          </div>
          <Button type="submit">Cadastrar</Button>
        </form>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 text-xs font-bold text-gray-400 uppercase tracking-wider">
            <tr>
              <th className="px-6 py-3">Usuário</th>
              <th className="px-6 py-3">Perfil</th>
              <th className="px-6 py-3 text-right">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {users.map(user => (
              <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${user.role === 'admin' ? 'bg-purple-100 text-purple-600' : 'bg-blue-100 text-blue-600'}`}>
                    {user.role === 'admin' ? <Shield size={16} /> : <UserIcon size={16} />}
                  </div>
                  <span className="font-semibold text-gray-700">{user.username}</span>
                </td>
                <td className="px-6 py-4">
                  <span className={`text-xs px-2 py-1 rounded-full ${user.role === 'admin' ? 'bg-purple-50 text-purple-700' : 'bg-blue-50 text-blue-700'}`}>
                    {user.role === 'admin' ? 'Administrador' : 'Vendedor'}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  {user.username !== 'admin' && (
                    <button 
                      onClick={() => handleDelete(user.id, user.username)}
                      className="text-gray-400 hover:text-red-500 transition-colors"
                    >
                      <Trash2 size={18} />
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
