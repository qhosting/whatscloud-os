import React, { useState, useEffect } from 'react';
import { UserRole, ACCProfile } from '../types';
import { 
  Shield, 
  Server, 
  Users, 
  Settings, 
  Activity, 
  Zap, 
  Database,
  RefreshCw,
  Lock,
  Globe,
  CreditCard,
  ToggleLeft,
  ToggleRight,
  Sliders
} from 'lucide-react';

interface AdminPanelProps {
  onSyncACC: () => void;
}

// Mock Data for Admin Panel
const MOCK_USERS: Partial<ACCProfile>[] = [
  { userId: 'wc_user_8821', name: 'Carlos Emprendedor', role: 'ACCOUNT_OWNER', credits: 150, subscriptionStatus: 'active' },
  { userId: 'wc_agent_007', name: 'Agente Smith', role: 'ACCOUNT_AGENT', credits: 0, subscriptionStatus: 'active' },
  { userId: 'wc_admin_1337', name: 'Desarrollador WhatsCloud', role: 'SUPER_ADMIN', credits: 99999, subscriptionStatus: 'active' },
];

export const AdminPanel: React.FC<AdminPanelProps> = ({ onSyncACC }) => {
  const [activeTab, setActiveTab] = useState<'hub' | 'users' | 'roles'>('hub');
  const [accStatus, setAccStatus] = useState<'connected' | 'syncing' | 'error'>('connected');
  const [users, setUsers] = useState(MOCK_USERS);
  
  // Expanded Granular Config
  const [roleConfig, setRoleConfig] = useState<Record<string, Record<string, any>>>({
      'ACCOUNT_OWNER': { 
          'can_scrape': true, 
          'can_export': true, 
          'can_manage_team': true, 
          'can_configure_bot': true,
          'max_daily_leads': 500,
          'export_formats': 'JSON, CSV, PDF'
      },
      'ACCOUNT_AGENT': { 
          'can_scrape': true, 
          'can_export': false, 
          'can_manage_team': false, 
          'can_configure_bot': false,
          'max_daily_leads': 50,
          'export_formats': 'None'
      },
      'PLATFORM_SUPPORT': {
          'can_scrape': true,
          'can_export': false,
          'can_manage_team': false,
          'can_configure_bot': true,
          'max_daily_leads': 1000,
          'export_formats': 'JSON'
      }
  });

  const handleManualSync = () => {
      setAccStatus('syncing');
      setTimeout(() => {
          setAccStatus('connected');
          onSyncACC(); // Call sync prop
      }, 2000);
  };

  const togglePermission = (role: string, perm: string) => {
      setRoleConfig(prev => ({
          ...prev,
          [role]: {
              ...prev[role],
              [perm]: !prev[role][perm]
          }
      }));
  };

  const updateNumericSetting = (role: string, setting: string, value: number) => {
     setRoleConfig(prev => ({
          ...prev,
          [role]: {
              ...prev[role],
              [setting]: value
          }
      }));
  };

  return (
    <div className="max-w-7xl mx-auto animate-in fade-in duration-500 pb-20">
      
      {/* GOD MODE HEADER */}
      <div className="bg-slate-950 text-white p-8 rounded-3xl shadow-2xl border border-slate-800 relative overflow-hidden mb-8">
         <div className="absolute top-0 right-0 p-8 opacity-10">
             <Shield size={200} />
         </div>
         <div className="relative z-10">
             <div className="flex items-center gap-3 mb-2">
                 <div className="bg-yellow-500/20 text-yellow-400 p-2 rounded-lg border border-yellow-500/50">
                     <Zap size={20} fill="currentColor" />
                 </div>
                 <span className="text-yellow-500 font-bold tracking-widest text-xs uppercase">Protocol 8888 Active</span>
             </div>
             <h1 className="text-4xl font-bold mb-2">Admin God Mode</h1>
             <p className="text-slate-400 max-w-2xl">
                 Panel de control omnisciente para la gestión del ecosistema WhatsCloud y la conexión neuronal con Aurum Control Center.
             </p>
         </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
          
          {/* SIDEBAR */}
          <div className="w-full lg:w-64 space-y-2">
              <button 
                onClick={() => setActiveTab('hub')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium ${activeTab === 'hub' ? 'bg-white shadow-md text-slate-900' : 'text-slate-500 hover:bg-white/50'}`}
              >
                  <Server size={18} /> ACC Hub Status
              </button>
              <button 
                onClick={() => setActiveTab('users')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium ${activeTab === 'users' ? 'bg-white shadow-md text-slate-900' : 'text-slate-500 hover:bg-white/50'}`}
              >
                  <Users size={18} /> User Management
              </button>
              <button 
                onClick={() => setActiveTab('roles')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium ${activeTab === 'roles' ? 'bg-white shadow-md text-slate-900' : 'text-slate-500 hover:bg-white/50'}`}
              >
                  <Sliders size={18} /> Role Preferences
              </button>
          </div>

          {/* CONTENT AREA */}
          <div className="flex-1">
              
              {/* TAB: ACC HUB */}
              {activeTab === 'hub' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                          <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                              <Database size={18} className="text-wc-blue" /> Estado de Conexión
                          </h3>
                          <div className="flex flex-col items-center justify-center py-8">
                              <div className={`w-24 h-24 rounded-full flex items-center justify-center mb-4 transition-all ${accStatus === 'syncing' ? 'bg-yellow-100 text-yellow-600 animate-pulse' : 'bg-emerald-100 text-emerald-600'}`}>
                                  <Activity size={48} />
                              </div>
                              <h4 className="text-2xl font-bold text-slate-800">
                                  {accStatus === 'connected' ? 'SYSTEM ONLINE' : 'SYNCING...'}
                              </h4>
                              <p className="text-slate-500 text-sm mt-1">Aurum Control Center v4.2.0</p>
                              
                              <button 
                                onClick={handleManualSync}
                                disabled={accStatus === 'syncing'}
                                className="mt-6 px-6 py-2 bg-slate-900 text-white rounded-lg text-sm font-bold flex items-center gap-2 hover:bg-slate-800 transition-colors"
                              >
                                  <RefreshCw size={14} className={accStatus === 'syncing' ? 'animate-spin' : ''} />
                                  Forzar Sincronización
                              </button>
                          </div>
                      </div>

                      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                          <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                              <Globe size={18} className="text-purple-500" /> Métricas Globales (Realtime)
                          </h3>
                          <div className="space-y-4">
                              <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                                  <span className="text-sm text-slate-500">Usuarios Activos</span>
                                  <span className="font-mono font-bold text-slate-800">1,240</span>
                              </div>
                              <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                                  <span className="text-sm text-slate-500">Leads Extraídos (Hoy)</span>
                                  <span className="font-mono font-bold text-slate-800">8,502</span>
                              </div>
                              <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                                  <span className="text-sm text-slate-500">Créditos Consumidos</span>
                                  <span className="font-mono font-bold text-slate-800">12,050</span>
                              </div>
                              <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                                  <span className="text-sm text-slate-500">Latencia API Gemini</span>
                                  <span className="font-mono font-bold text-emerald-600">42ms</span>
                              </div>
                          </div>
                      </div>
                  </div>
              )}

              {/* TAB: USERS */}
              {activeTab === 'users' && (
                  <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                      <table className="w-full text-left text-sm">
                          <thead className="bg-slate-50 text-slate-500 uppercase font-bold text-xs">
                              <tr>
                                  <th className="px-6 py-4">Usuario</th>
                                  <th className="px-6 py-4">Rol</th>
                                  <th className="px-6 py-4">Créditos</th>
                                  <th className="px-6 py-4">Status</th>
                                  <th className="px-6 py-4">Acciones</th>
                              </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100">
                              {users.map(user => (
                                  <tr key={user.userId} className="hover:bg-slate-50/50 transition-colors">
                                      <td className="px-6 py-4">
                                          <div className="font-bold text-slate-800">{user.name}</div>
                                          <div className="text-xs text-slate-400 font-mono">{user.userId}</div>
                                      </td>
                                      <td className="px-6 py-4">
                                          <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase border ${user.role === 'SUPER_ADMIN' ? 'bg-black text-yellow-400 border-yellow-500' : 'bg-slate-100 text-slate-600 border-slate-200'}`}>
                                              {user.role}
                                          </span>
                                      </td>
                                      <td className="px-6 py-4 font-mono text-slate-600">
                                          <div className="flex items-center gap-1">
                                            <CreditCard size={12} className="text-slate-400" />
                                            {user.credits}
                                          </div>
                                      </td>
                                      <td className="px-6 py-4">
                                          <span className="text-emerald-600 font-bold text-xs flex items-center gap-1">
                                              <span className="w-2 h-2 rounded-full bg-emerald-500"></span> Active
                                          </span>
                                      </td>
                                      <td className="px-6 py-4">
                                          <button className="text-xs text-wc-blue font-bold hover:underline">Editar</button>
                                      </td>
                                  </tr>
                              ))}
                          </tbody>
                      </table>
                  </div>
              )}

              {/* TAB: ROLES */}
              {activeTab === 'roles' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {Object.keys(roleConfig).map(role => (
                          <div key={role} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                              <h3 className="font-bold text-slate-800 mb-4 border-b border-slate-100 pb-2">{role}</h3>
                              <div className="space-y-4">
                                  {Object.keys(roleConfig[role]).map(perm => {
                                      const val = roleConfig[role][perm];
                                      
                                      // Render Boolean Toggle
                                      if (typeof val === 'boolean') {
                                        return (
                                          <div key={perm} className="flex justify-between items-center">
                                              <span className="text-xs text-slate-600 capitalize">{perm.replace(/_/g, ' ')}</span>
                                              <button 
                                                onClick={() => togglePermission(role, perm)}
                                                className={`transition-colors ${val ? 'text-wc-blue' : 'text-slate-300'}`}
                                              >
                                                  {val ? <ToggleRight size={24} /> : <ToggleLeft size={24} />}
                                              </button>
                                          </div>
                                        );
                                      }
                                      
                                      // Render Number Input
                                      if (typeof val === 'number') {
                                          return (
                                            <div key={perm} className="flex flex-col gap-1">
                                                <span className="text-xs text-slate-600 capitalize">{perm.replace(/_/g, ' ')}</span>
                                                <input 
                                                    type="number" 
                                                    value={val}
                                                    onChange={(e) => updateNumericSetting(role, perm, parseInt(e.target.value))}
                                                    className="w-full px-2 py-1 rounded border border-slate-200 text-xs"
                                                />
                                            </div>
                                          );
                                      }

                                      // Render String (Read Only for now)
                                      return (
                                         <div key={perm} className="flex flex-col gap-1">
                                            <span className="text-xs text-slate-600 capitalize">{perm.replace(/_/g, ' ')}</span>
                                            <div className="text-[10px] text-slate-400 bg-slate-50 px-2 py-1 rounded">{val}</div>
                                         </div>
                                      );
                                  })}
                              </div>
                          </div>
                      ))}
                  </div>
              )}

          </div>
      </div>
    </div>
  );
};