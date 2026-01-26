
import React, { useState, useEffect } from 'react';
import { UserRole, ACCProfile } from '../types';
import { PROD_CONFIG } from '../services/config';
import { storageService } from '../services/storageService';
// Added CreditCard to imports from lucide-react to fix error on line 186
import { 
  Shield, Server, Users, Activity, Zap, Database, RefreshCw, Terminal, Cpu, Search, Trash2, TrendingUp, AlertCircle, CreditCard
} from 'lucide-react';

interface AdminPanelProps {
  onSyncACC: () => void;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({ onSyncACC }) => {
  const [activeTab, setActiveTab] = useState<'hub' | 'users' | 'infra' | 'logs'>('hub');
  const [logs, setLogs] = useState<any[]>([]);
  const [stats, setStats] = useState({ online: 1240, leads: 8502, latency: '4ms' });

  useEffect(() => {
    const loadLogs = () => {
      const storedLogs = JSON.parse(localStorage.getItem('db_system_logs') || '[]');
      setLogs(storedLogs);
    };
    loadLogs();
    const interval = setInterval(loadLogs, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleClearLogs = () => {
    localStorage.setItem('db_system_logs', '[]');
    setLogs([]);
  };

  const adjustCredits = async (userId: string, amount: number) => {
    console.log(`[GOD MODE] Ajustando créditos para ${userId}: ${amount}`);
    // En producción esto enviaría un query a PGSQL 16
    alert(`Ajuste de ${amount} créditos procesado para el cluster.`);
  };

  return (
    <div className="max-w-7xl mx-auto animate-in fade-in duration-500 pb-20">
      <div className="bg-slate-950 text-white p-8 rounded-3xl shadow-2xl border border-slate-800 mb-8 relative overflow-hidden">
         <div className="absolute top-0 right-0 p-8 opacity-10"><Shield size={200} /></div>
         <div className="relative z-10">
             <div className="flex items-center gap-3 mb-2">
                 <div className="bg-yellow-500/20 text-yellow-400 p-2 rounded-lg border border-yellow-500/50">
                     <Zap size={20} fill="currentColor" />
                 </div>
                 <span className="text-yellow-500 font-bold tracking-widest text-xs uppercase">WhatsCloud.MX God Mode</span>
             </div>
             <h1 className="text-4xl font-bold mb-2 tracking-tighter">Panel de Control Supremo</h1>
         </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
          <div className="w-full lg:w-64 space-y-2">
              <TabButton active={activeTab === 'hub'} onClick={() => setActiveTab('hub')} icon={<Server size={18} />} label="Estado Global" />
              <TabButton active={activeTab === 'users'} onClick={() => setActiveTab('users')} icon={<Users size={18} />} label="Gestión Usuarios" />
              <TabButton active={activeTab === 'infra'} onClick={() => setActiveTab('infra')} icon={<Terminal size={18} />} label="Infraestructura" />
              <TabButton active={activeTab === 'logs'} onClick={() => setActiveTab('logs')} icon={<Activity size={18} />} label="Logs Sistema" />
          </div>

          <div className="flex-1 bg-white rounded-3xl p-8 border border-slate-100 shadow-sm">
              {activeTab === 'hub' && (
                  <div className="space-y-8">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                          <StatCard icon={<Users className="text-blue-500" />} label="Online" value={stats.online.toString()} />
                          <StatCard icon={<Database className="text-purple-500" />} label="Total Leads" value={stats.leads.toString()} />
                          <StatCard icon={<Zap className="text-yellow-500" />} label="Latencia" value={stats.latency} />
                      </div>
                      <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
                          <h3 className="font-bold text-slate-800 mb-4">Salud del Cluster</h3>
                          <div className="space-y-4">
                              <HealthItem label="PostgreSQL 16 Engine" status="Healthy" />
                              <HealthItem label="Redis Session Cache" status="Healthy" />
                              <HealthItem label="N8N Worker Nodes" status="Scaling" />
                          </div>
                      </div>
                  </div>
              )}

              {activeTab === 'users' && (
                  <div className="space-y-6">
                      <div className="flex justify-between items-center">
                          <h3 className="text-xl font-bold">Usuarios del Ecosistema</h3>
                          <div className="relative">
                              <Search className="absolute left-3 top-2.5 text-slate-400" size={16} />
                              <input type="text" placeholder="Buscar email o ID..." className="pl-10 pr-4 py-2 bg-slate-100 rounded-xl text-sm outline-none" />
                          </div>
                      </div>
                      <div className="overflow-hidden border border-slate-100 rounded-2xl">
                          <table className="w-full text-left">
                              <thead className="bg-slate-50 text-xs font-bold text-slate-500 uppercase">
                                  <tr>
                                      <th className="p-4">Usuario</th>
                                      <th className="p-4">Rol</th>
                                      <th className="p-4">Créditos</th>
                                      <th className="p-4">Acción</th>
                                  </tr>
                              </thead>
                              <tbody className="divide-y divide-slate-100">
                                  <UserRow name="Admin QHosting" email="admin@qhosting.net" role="SUPER_ADMIN" credits="∞" onAdjust={() => adjustCredits('wc_admin_god', 1000)} />
                                  <UserRow name="Carlos Demo" email="carlos@whatscloud.mx" role="ACCOUNT_OWNER" credits="150" onAdjust={() => adjustCredits('wc_user_8821', 50)} />
                              </tbody>
                          </table>
                      </div>
                  </div>
              )}

              {activeTab === 'infra' && (
                  <div className="space-y-6">
                      <div className="bg-slate-900 text-white p-6 rounded-2xl font-mono text-sm border border-slate-800">
                          <div className="flex items-center gap-2 mb-4 text-wc-blue">
                              <Terminal size={18} />
                              <span>System Environment Variables</span>
                          </div>
                          <p className="text-slate-400 mb-2">DB_URL=postgres://acc_prod:***@whatscloud-os-db:5432</p>
                          <p className="text-slate-400 mb-2">REDIS_URI={PROD_CONFIG.REDIS.URI}</p>
                          <p className="text-slate-400">GEMINI_MODEL=gemini-3-flash-preview</p>
                      </div>
                  </div>
              )}

              {activeTab === 'logs' && (
                  <div className="space-y-4">
                      <div className="flex justify-between items-center">
                          <h3 className="text-xl font-bold">System Events (Protocol 8888)</h3>
                          <button onClick={handleClearLogs} className="text-xs text-red-500 font-bold hover:underline flex items-center gap-1">
                              <Trash2 size={14} /> Limpiar Logs
                          </button>
                      </div>
                      <div className="space-y-2 max-h-[500px] overflow-y-auto pr-2">
                          {logs.length === 0 ? (
                              <p className="text-center py-20 text-slate-400 italic">No hay eventos recientes en el cluster.</p>
                          ) : (
                              logs.map(log => (
                                  <div key={log.id} className="p-3 bg-slate-50 rounded-lg border border-slate-100 font-mono text-[11px] flex items-start gap-3">
                                      <span className="text-slate-400 shrink-0">{new Date(log.timestamp).toLocaleTimeString()}</span>
                                      <span className={log.type === 'ERROR' ? 'text-red-500 font-bold' : 'text-blue-500'}>[{log.type}]</span>
                                      <span className="text-slate-700">{log.message}</span>
                                  </div>
                              ))
                          )}
                      </div>
                  </div>
              )}
          </div>
      </div>
    </div>
  );
};

const TabButton = ({ active, onClick, icon, label }: any) => (
    <button onClick={onClick} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-bold text-sm ${active ? 'bg-slate-900 text-white shadow-xl translate-x-1' : 'text-slate-500 hover:bg-white/50'}`}>
        {icon} <span>{label}</span>
    </button>
);

const StatCard = ({ icon, label, value }: any) => (
    <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 text-center">
        <div className="w-10 h-10 bg-white rounded-xl shadow-sm flex items-center justify-center mx-auto mb-3">{icon}</div>
        <div className="text-2xl font-black text-slate-900">{value}</div>
        <div className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">{label}</div>
    </div>
);

const HealthItem = ({ label, status }: any) => (
    <div className="flex justify-between items-center">
        <span className="text-sm text-slate-600">{label}</span>
        <span className="flex items-center gap-1.5 text-xs font-bold text-emerald-500">
            <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></div>
            {status}
        </span>
    </div>
);

const UserRow = ({ name, email, role, credits, onAdjust }: any) => (
    <tr className="hover:bg-slate-50/50 transition-colors">
        <td className="p-4">
            <div className="font-bold text-slate-800 text-sm">{name}</div>
            <div className="text-[10px] text-slate-500">{email}</div>
        </td>
        <td className="p-4"><span className="text-[10px] bg-slate-100 px-2 py-1 rounded font-bold">{role}</span></td>
        <td className="p-4 font-mono font-bold text-wc-blue">{credits}</td>
        <td className="p-4">
            <button onClick={onAdjust} className="text-xs font-bold text-slate-400 hover:text-slate-900 flex items-center gap-1">
                <CreditCard size={12} /> + CR
            </button>
        </td>
    </tr>
);
