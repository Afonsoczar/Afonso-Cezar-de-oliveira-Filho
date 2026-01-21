
import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  PlusCircle, 
  Users, 
  Map as MapIcon, 
  Menu,
  X,
  Settings,
  Lock,
  User as UserIcon,
  BrainCircuit,
  Send
} from 'lucide-react';
import { Client, User } from './types';
import { getClients, saveClient, getUsers } from './services/storageService';
import { Dashboard } from './components/Dashboard';
import { ClientForm } from './components/ClientForm';
import { ClientList } from './components/ClientList';
import { UserManagement } from './components/UserManagement';
import { MapViewer } from './components/MapViewer';
import { LOGO_URL, FALLBACK_LOGO, APP_FOOTER } from './constants';
import { Button } from './components/Button';
import { analyzeMarketComplex } from './services/geminiService';

const App: React.FC = () => {
  const [view, setView] = useState<'dashboard' | 'list' | 'map' | 'form' | 'users' | 'ai_strategy'>('dashboard');
  const [clients, setClients] = useState<Client[]>([]);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  
  // Login states
  const [loginUser, setLoginUser] = useState('');
  const [loginPass, setLoginPass] = useState('');
  const [loginError, setLoginError] = useState('');

  // AI Strategy states
  const [strategyPrompt, setStrategyPrompt] = useState('');
  const [strategyResult, setStrategyResult] = useState<string | null>(null);
  const [isThinking, setIsThinking] = useState(false);

  useEffect(() => {
    setClients(getClients());
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const allUsers = getUsers();
    const found = allUsers.find(u => u.username === loginUser && u.password === loginPass);
    
    if (found) {
      setUser(found);
      setLoginError('');
    } else {
      setLoginError('Usuário ou senha inválidos.');
    }
  };

  const handleSaveClient = (clientData: any) => {
    const saved = saveClient(clientData);
    setClients(prev => [...prev, saved]);
    setView('list');
  };

  const handleGenerateStrategy = async () => {
    if (!strategyPrompt.trim()) return;
    setIsThinking(true);
    setStrategyResult(null);
    
    const context = `Atue como um estrategista de vendas para a Lelé da Kuka em Maceió-AL. 
    Temos atualmente ${clients.length} clientes cadastrados. 
    Pergunta do usuário: ${strategyPrompt}`;
    
    const result = await analyzeMarketComplex(context);
    setStrategyResult(result);
    setIsThinking(false);
  };

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    e.currentTarget.src = FALLBACK_LOGO;
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4 font-sans text-[#1e293b]">
        <div className="bg-white p-8 rounded-3xl shadow-2xl w-full max-w-md text-center border border-gray-100 animate-in fade-in duration-500">
          <div className="relative inline-block mb-6">
            <img 
              src={LOGO_URL} 
              onError={handleImageError}
              alt="Logo Lelé da Kuka" 
              className="w-28 h-28 mx-auto rounded-full shadow-lg object-cover border-4 border-[#FF3B1D]" 
            />
            <div className="absolute -bottom-1 -right-1 bg-green-500 w-5 h-5 rounded-full border-4 border-white"></div>
          </div>
          <h1 className="text-3xl font-black text-gray-800 mb-1 tracking-tighter uppercase">Lelé da Kuka</h1>
          <p className="text-gray-400 text-xs mb-10 font-bold uppercase tracking-widest">Gestão de Vendas & CRM</p>
          
          <form onSubmit={handleLogin} className="space-y-4 text-left">
            <div className="space-y-1">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Usuário de Acesso</label>
              <div className="relative">
                <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
                <input 
                  type="text" 
                  className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-[#FF3B1D] outline-none transition-all font-bold text-sm"
                  value={loginUser}
                  onChange={e => setLoginUser(e.target.value)}
                  placeholder="Nome de usuário"
                />
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Senha Secreta</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
                <input 
                  type="password" 
                  className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-[#FF3B1D] outline-none transition-all font-bold text-sm"
                  value={loginPass}
                  onChange={e => setLoginPass(e.target.value)}
                  placeholder="••••••••"
                />
              </div>
            </div>
            
            {loginError && (
              <div className="bg-red-50 text-red-600 text-[10px] font-black p-3 rounded-xl border border-red-100 flex items-center gap-2 uppercase">
                <X size={14} /> {loginError}
              </div>
            )}
            
            <Button className="w-full py-5 rounded-2xl shadow-xl shadow-red-100 text-sm font-black uppercase tracking-widest mt-4" type="submit">
              Entrar no Sistema
            </Button>
          </form>
          
          <div className="mt-10 pt-6 border-t border-gray-50">
            <p className="text-[9px] text-gray-300 font-black uppercase tracking-[0.2em]">{APP_FOOTER.text}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 pb-20 md:pb-0 md:pl-64 font-sans text-[#1e293b]">
      {/* Mobile Top Bar */}
      <header className="md:hidden bg-white border-b border-gray-100 p-4 flex justify-between items-center sticky top-0 z-40 shadow-sm">
        <div className="flex items-center gap-3">
          <img src={LOGO_URL} onError={handleImageError} alt="Logo" className="h-9 w-9 rounded-full object-cover border-2 border-[#FF3B1D]" />
          <h1 className="font-black text-gray-800 text-sm tracking-tighter uppercase">Lelé da Kuka</h1>
        </div>
        <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="p-2 text-[#FF3B1D] bg-red-50 rounded-xl active:scale-90 transition-transform">
          {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </header>

      {/* Sidebar Desktop */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-100 transform ${isMenuOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 transition-transform duration-300 ease-out shadow-2xl md:shadow-none`}>
        <div className="p-6 flex flex-col h-full">
          <div className="flex flex-col items-center mb-10">
            <img src={LOGO_URL} onError={handleImageError} alt="Logo" className="w-20 h-20 mb-3 rounded-full shadow-lg object-cover border-4 border-[#FF3B1D]" />
            <h2 className="font-black text-gray-800 text-xl tracking-tighter text-center leading-tight uppercase">Lelé da Kuka</h2>
            <div className="flex items-center gap-1 mt-2">
               <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
               <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Maceió - AL</span>
            </div>
          </div>

          <nav className="space-y-1.5 flex-1">
            <SidebarLink active={view === 'dashboard'} icon={<LayoutDashboard size={20} />} label="Dashboard" onClick={() => { setView('dashboard'); setIsMenuOpen(false); }} />
            <SidebarLink active={view === 'form'} icon={<PlusCircle size={20} />} label="Novo Cadastro" onClick={() => { setView('form'); setIsMenuOpen(false); }} />
            <SidebarLink active={view === 'list'} icon={<Users size={20} />} label="Lista Clientes" onClick={() => { setView('list'); setIsMenuOpen(false); }} />
            <SidebarLink active={view === 'map'} icon={<MapIcon size={20} />} label="Mapa / Rotas" onClick={() => { setView('map'); setIsMenuOpen(false); }} />
            <SidebarLink active={view === 'ai_strategy'} icon={<BrainCircuit size={20} />} label="IA Estratégica" onClick={() => { setView('ai_strategy'); setIsMenuOpen(false); }} />
            {user.role === 'admin' && (
              <SidebarLink active={view === 'users'} icon={<Settings size={20} />} label="Vendedores" onClick={() => { setView('users'); setIsMenuOpen(false); }} />
            )}
          </nav>

          <div className="pt-6 border-t border-gray-50 mt-auto">
            <div className="flex items-center gap-3 mb-4 p-3 bg-gray-50 rounded-2xl border border-gray-100">
              <div className="bg-[#FF3B1D] text-white p-2 rounded-xl shadow-lg shadow-red-100">
                <UserIcon size={16} />
              </div>
              <div className="overflow-hidden text-left">
                <p className="text-xs font-black text-gray-800 truncate uppercase">{user.username}</p>
                <button onClick={() => setUser(null)} className="text-[9px] text-gray-400 font-black uppercase hover:text-[#FF3B1D] transition-colors">Sair Agora</button>
              </div>
            </div>
            <p className="text-[9px] text-gray-300 font-black text-center uppercase tracking-widest">{APP_FOOTER.text}</p>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-4 md:p-10 max-w-7xl mx-auto w-full h-screen overflow-y-auto overflow-x-hidden">
        {view === 'dashboard' && (
          <div className="space-y-8 animate-in fade-in duration-500 pb-10 text-left">
             <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                   <h1 className="text-3xl font-black text-gray-800 tracking-tighter uppercase">Visão Geral</h1>
                   <p className="text-gray-400 text-xs font-bold uppercase tracking-widest mt-1 text-left">Status atual das operações em Maceió</p>
                </div>
                <Button onClick={() => setView('form')} className="rounded-2xl shadow-xl shadow-red-100 py-4 px-8">
                   <PlusCircle size={20} /> <span className="uppercase tracking-widest text-xs font-black">Cadastrar Cliente</span>
                </Button>
             </div>
             <Dashboard clients={clients} />
          </div>
        )}

        {view === 'list' && (
          <div className="space-y-8 animate-in fade-in duration-500 pb-10 text-left">
             <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                   <h1 className="text-3xl font-black text-gray-800 tracking-tighter uppercase">Clientes CRM</h1>
                   <p className="text-gray-400 text-xs font-bold uppercase tracking-widest mt-1 text-left">Base de dados permanente de Maceió</p>
                </div>
                <Button onClick={() => setView('form')} className="rounded-2xl shadow-xl shadow-red-100 py-4 px-8">
                   <PlusCircle size={20} /> <span className="uppercase tracking-widest text-xs font-black">Novo Cadastro</span>
                </Button>
             </div>
             <ClientList clients={clients} />
          </div>
        )}

        {view === 'map' && (
          <div className="h-full flex flex-col space-y-6 animate-in fade-in duration-500 pb-10 text-left">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
               <div>
                  <h1 className="text-3xl font-black text-gray-800 tracking-tighter uppercase">Mapa de Clientes</h1>
                  <p className="text-gray-400 text-xs font-bold uppercase tracking-widest mt-1 text-left">Geolocalização capturada em campo</p>
               </div>
               <Button onClick={() => setView('form')} variant="secondary" className="rounded-2xl py-4 px-8">
                   <PlusCircle size={20} /> <span className="uppercase tracking-widest text-[10px] font-black">Adicionar Ponto</span>
                </Button>
            </div>
            <div className="flex-1 min-h-[600px] shadow-2xl rounded-3xl overflow-hidden border border-gray-100">
              <MapViewer clients={clients} />
            </div>
          </div>
        )}

        {view === 'ai_strategy' && (
          <div className="space-y-8 animate-in fade-in duration-500 pb-10 text-left max-w-4xl mx-auto">
             <div>
                <h1 className="text-3xl font-black text-gray-800 tracking-tighter uppercase">IA Estratégica</h1>
                <p className="text-gray-400 text-xs font-bold uppercase tracking-widest mt-1 text-left">Análise complexa de mercado (Gemini Thinking Mode)</p>
             </div>
             
             <div className="bg-white p-6 rounded-3xl shadow-lg border border-gray-100 space-y-4">
               <div className="flex items-center gap-3 mb-2">
                 <div className="p-2 bg-red-50 text-[#FF3B1D] rounded-xl">
                    <BrainCircuit size={24} />
                 </div>
                 <h2 className="text-lg font-black text-gray-800 uppercase tracking-tight">O que deseja analisar hoje?</h2>
               </div>
               <textarea 
                 className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-[#FF3B1D] outline-none min-h-[120px] font-medium text-sm"
                 placeholder="Ex: 'Com base nos meus clientes atuais, qual o melhor bairro para expandir as vendas de lanchonetes?' ou 'Crie um roteiro de vendas otimizado para a Ponta Verde'."
                 value={strategyPrompt}
                 onChange={(e) => setStrategyPrompt(e.target.value)}
               />
               <Button onClick={handleGenerateStrategy} isLoading={isThinking} className="w-full py-5 rounded-2xl shadow-xl shadow-red-100 text-sm font-black uppercase tracking-widest">
                 {isThinking ? 'IA Pensando profundamente...' : <><Send size={18} /> Gerar Estratégia</>}
               </Button>
             </div>

             {strategyResult && (
               <div className="bg-gray-900 text-white p-8 rounded-3xl shadow-2xl animate-in slide-in-from-bottom-4">
                 <div className="flex items-center gap-2 mb-6 border-b border-white/10 pb-4">
                   <Sparkles className="text-[#FF3B1D]" size={20} />
                   <span className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Resultado da Análise Avançada</span>
                 </div>
                 <div className="prose prose-invert prose-sm max-w-none">
                    <p className="text-gray-100 leading-relaxed whitespace-pre-wrap text-sm font-medium">{strategyResult}</p>
                 </div>
                 <div className="mt-8 pt-4 border-t border-white/10 flex justify-end">
                    <Button variant="ghost" onClick={() => {
                      navigator.clipboard.writeText(strategyResult);
                      alert("Copiado para a área de transferência!");
                    }} className="text-white hover:bg-white/10 uppercase text-[10px] font-black">Copiar Relatório</Button>
                 </div>
               </div>
             )}
          </div>
        )}

        {view === 'users' && user.role === 'admin' && (
          <div className="animate-in fade-in duration-500 pb-10 text-left">
             <h1 className="text-3xl font-black text-gray-800 tracking-tighter uppercase mb-6">Controle de Acessos</h1>
             <UserManagement />
          </div>
        )}

        {view === 'form' && (
          <div className="max-w-3xl mx-auto animate-in zoom-in-95 duration-300 pb-20 text-left">
            <div className="mb-6 flex items-center justify-between">
               <h1 className="text-2xl font-black text-gray-800 uppercase tracking-tighter">Cadastro de Cliente</h1>
               <button onClick={() => setView('dashboard')} className="text-gray-400 hover:text-red-500 transition-colors font-black text-[10px] uppercase tracking-widest">Voltar</button>
            </div>
            <ClientForm user={user} onSave={handleSaveClient} onCancel={() => setView('dashboard')} />
          </div>
        )}
      </main>

      {/* Navigation Mobile Bottom */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-gray-100 flex justify-around p-3 z-40 shadow-[0_-10px_30px_rgba(0,0,0,0.05)]">
        <NavButton active={view === 'dashboard'} icon={<LayoutDashboard size={22} />} onClick={() => setView('dashboard')} />
        <NavButton active={view === 'list'} icon={<Users size={22} />} onClick={() => setView('list')} />
        
        <div className="relative -top-8">
          <button 
            onClick={() => setView('form')} 
            className="bg-[#FF3B1D] text-white p-5 rounded-full shadow-[0_15px_30px_rgba(255,59,29,0.4)] border-8 border-white active:scale-90 transition-all flex items-center justify-center"
          >
            <PlusCircle size={28} />
          </button>
        </div>

        <NavButton active={view === 'map'} icon={<MapIcon size={22} />} onClick={() => setView('map')} />
        <NavButton active={view === 'ai_strategy'} icon={<BrainCircuit size={22} />} onClick={() => setView('ai_strategy')} />
      </nav>
    </div>
  );
};

const SidebarLink = ({ active, icon, label, onClick }: { active: boolean, icon: React.ReactNode, label: string, onClick: () => void }) => (
  <button 
    onClick={onClick} 
    className={`w-full flex items-center gap-3 px-5 py-4 rounded-2xl transition-all duration-300 ${
      active 
        ? 'bg-[#FF3B1D] text-white shadow-xl shadow-red-100 translate-x-1' 
        : 'text-gray-500 hover:bg-gray-50 hover:text-gray-800'
    }`}
  >
    <span className={`${active ? 'scale-110' : ''} transition-transform`}>{icon}</span>
    <span className="font-black text-[11px] uppercase tracking-widest leading-none text-left">{label}</span>
  </button>
);

const NavButton = ({ active, icon, onClick }: { active: boolean, icon: React.ReactNode, onClick: () => void }) => (
  <button 
    onClick={onClick} 
    className={`p-3 transition-all duration-300 rounded-2xl ${
      active ? 'text-[#FF3B1D] bg-red-50' : 'text-gray-400'
    }`}
  >
    {icon}
  </button>
);

const Sparkles = ({ className, size }: { className?: string, size: number }) => (
  <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/><path d="M5 3v4"/><path d="M19 17v4"/><path d="M3 5h4"/><path d="M17 19h4"/></svg>
);

export default App;
