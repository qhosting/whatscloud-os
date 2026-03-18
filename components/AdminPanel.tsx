import React, { useState, useEffect } from 'react';
import { accService } from '../services/accService';
import { Building2, Users, Shield, TrendingUp, DollarSign, Settings, Search, CheckCircle, XCircle, MoreVertical, CreditCard, Zap } from 'lucide-react';

export const AdminPanel: React.FC = () => {
    const [organizations, setOrganizations] = useState<any[]>([]);
    const [users, setUsers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'orgs' | 'users' | 'metrics'>('orgs');
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        try {
            const orgs = await accService.adminGetAllOrgs();
            const allUsers = await accService.adminGetAllUsers();
            setOrganizations(orgs);
            setUsers(allUsers);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const handleAdjustCredits = async (userId: string) => {
        const amountStr = prompt("¿Cuántos créditos deseas añadir (o restar)? Ej: 500 o -100");
        if (!amountStr) return;
        const amount = parseInt(amountStr);
        const reason = prompt("Motivo del ajuste:", "Ajuste manual SuperAdmin");
        
        if (isNaN(amount)) return alert("Monto inválido");

        try {
            await accService.adminAdjustCredits(userId, amount, reason || '');
            alert("Créditos ajustados satisfactoriamente.");
            loadData(); // Reload to see changes
        } catch (e) {
            alert("Error al ajustar créditos");
        }
    };

    const filteredOrgs = organizations.filter(o => 
        o.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
        o.slug?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const filteredUsers = users.filter(u => 
        u.email?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center h-96 gap-4 animate-in fade-in duration-700">
                <div className="w-12 h-12 border-4 border-yellow-500 border-t-transparent rounded-full animate-spin"></div>
                <p className="font-mono text-yellow-500 text-sm animate-pulse uppercase tracking-widest">Entering God Mode Protocol...</p>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* HEADER: GOD MODE */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 bg-slate-900 p-8 rounded-[2rem] border border-yellow-500/20 shadow-2xl shadow-yellow-500/5 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none">
                    <Shield size={200} className="text-yellow-500" />
                </div>
                <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="bg-yellow-500/10 p-2 rounded-lg border border-yellow-500/20">
                            <Shield className="text-yellow-500" size={24} />
                        </div>
                        <span className="text-[10px] font-black text-yellow-500 uppercase tracking-[0.3em] font-mono">Access Level: Supreme</span>
                    </div>
                    <h1 className="text-5xl font-black text-white tracking-tighter leading-none mb-3">
                        WhatsCloud<span className="text-yellow-500">.Control</span>
                    </h1>
                    <p className="text-slate-400 text-lg">Panel de Administración SaaS Multi-Tenant (GOD MODE)</p>
                </div>

                <div className="flex items-center gap-4 relative z-10 w-full md:w-auto">
                    <div className="flex-1 bg-white/5 border border-white/10 rounded-2xl flex items-center px-4 py-3 min-w-[300px]">
                        <Search className="text-slate-500 mr-3" size={18} />
                        <input 
                            type="text" 
                            placeholder="Buscar empresa o usuario..." 
                            className="bg-transparent border-none text-white text-sm focus:ring-0 w-full"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>
            </div>

            {/* QUICK STATS */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <StatCard icon={<Building2 className="text-blue-500" />} label="Empresas (Tenants)" value={organizations.length} color="blue" />
                <StatCard icon={<Users className="text-emerald-500" />} label="Usuarios Totales" value={users.length} color="emerald" />
                <StatCard icon={<Zap className="text-yellow-500" />} label="Créditos Circulantes" value={users.reduce((acc, u) => acc + (u.credits || 0), 0)} color="yellow" />
                <StatCard icon={<TrendingUp className="text-purple-500" />} label="Planes Activos" value={organizations.filter(o => o.status === 'ACTIVE').length} color="purple" />
            </div>

            {/* TABS CONTROLLER */}
            <div className="bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden">
                <div className="flex border-b border-slate-100 p-2 bg-slate-50/50">
                    <TabButton active={activeTab === 'orgs'} onClick={() => setActiveTab('orgs')} label="Empresas (Tenants)" icon={<Building2 size={16} />} color="blue" />
                    <TabButton active={activeTab === 'users'} onClick={() => setActiveTab('users')} label="Usuarios & Créditos" icon={<Users size={16} />} color="emerald" />
                    <TabButton active={activeTab === 'metrics'} onClick={() => setActiveTab('metrics')} label="Insights Globales" icon={<TrendingUp size={16} />} color="purple" />
                </div>

                <div className="p-6">
                    {activeTab === 'orgs' && (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-slate-50/80">
                                    <tr>
                                        <th className="px-6 py-4 text-[10px] font-black uppercase text-slate-500 tracking-widest">Empresa / Tenant</th>
                                        <th className="px-6 py-4 text-[10px] font-black uppercase text-slate-500 tracking-widest">Plan</th>
                                        <th className="px-6 py-4 text-[10px] font-black uppercase text-slate-500 tracking-widest">Status</th>
                                        <th className="px-6 py-4 text-[10px] font-black uppercase text-slate-500 tracking-widest">Slug / ID</th>
                                        <th className="px-6 py-4 text-[10px] font-black uppercase text-slate-500 tracking-widest">Infra n8n</th>
                                        <th className="px-6 py-4"></th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {filteredOrgs.map(org => (
                                        <tr key={org.id} className="hover:bg-slate-50/50 transition-colors group text-sm">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center text-slate-400 group-hover:bg-blue-100 group-hover:text-blue-600 transition-colors">
                                                        <Building2 size={20} />
                                                    </div>
                                                    <div>
                                                        <div className="font-bold text-slate-800">{org.name}</div>
                                                        <div className="text-[10px] text-slate-400 font-mono">{org.id.split('-')[0]}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${
                                                    org.plan === 'PRO' ? 'bg-blue-50 text-blue-600 border-blue-100' : 
                                                    org.plan === 'ENTERPRISE' ? 'bg-purple-50 text-purple-600 border-purple-100' :
                                                    'bg-slate-50 text-slate-400 border-slate-100'
                                                }`}>
                                                    {org.plan}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2">
                                                    <div className={`w-2 h-2 rounded-full ${org.status === 'ACTIVE' ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'}`}></div>
                                                    <span className="font-bold text-slate-700 capitalize">{org.status.toLowerCase()}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-slate-500 font-mono text-[11px]">{org.slug}</td>
                                            <td className="px-6 py-4">
                                                {org.n8nWebhookUrl ? (
                                                    <span className="text-emerald-500 flex items-center gap-1 font-bold text-xs"><CheckCircle size={14} /> Linkeado</span>
                                                ) : (
                                                    <span className="text-slate-300 flex items-center gap-1 text-xs"><XCircle size={14} /> Pendiente</span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <button className="p-2 text-slate-400 hover:text-slate-800 transition-colors">
                                                    <Settings size={18} />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {activeTab === 'users' && (
                        <div className="overflow-x-auto">
                           <table className="w-full text-left">
                                <thead className="bg-slate-50/80">
                                    <tr>
                                        <th className="px-6 py-4 text-[10px] font-black uppercase text-slate-500 tracking-widest">Usuario / Propietario</th>
                                        <th className="px-6 py-4 text-[10px] font-black uppercase text-slate-500 tracking-widest">Créditos</th>
                                        <th className="px-6 py-4 text-[10px] font-black uppercase text-slate-500 tracking-widest">Rol</th>
                                        <th className="px-6 py-4 text-[10px] font-black uppercase text-slate-500 tracking-widest">Organización</th>
                                        <th className="px-6 py-4"></th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {filteredUsers.map(user => (
                                        <tr key={user.id} className="hover:bg-slate-50/50 transition-colors group text-sm">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 bg-slate-900 rounded-full flex items-center justify-center text-white text-xs font-black">
                                                        {user.email?.charAt(0).toUpperCase()}
                                                    </div>
                                                    <div>
                                                        <div className="font-bold text-slate-800 truncate max-w-[200px]">{user.email}</div>
                                                        <div className="text-[10px] text-slate-400 font-mono">ID: {user.id.split('-')[0]}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2">
                                                    <span className="font-black text-slate-900 text-lg">{user.credits}</span>
                                                    <CreditCard size={14} className="text-emerald-500 opacity-60" />
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase ${
                                                    user.role === 'SUPER_ADMIN' ? 'bg-yellow-500 text-black' : 
                                                    user.role === 'ACCOUNT_OWNER' ? 'bg-slate-800 text-white' : 
                                                    'bg-slate-100 text-slate-500'
                                                }`}>
                                                    {user.role}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-slate-600 font-medium">
                                                {user.organization?.name || 'N/A'}
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <button 
                                                    onClick={() => handleAdjustCredits(user.id)}
                                                    className="bg-emerald-50 text-emerald-600 hover:bg-emerald-600 hover:text-white transition-all px-4 py-2 rounded-xl text-xs font-bold shadow-sm shadow-emerald-500/10 flex items-center gap-2 ml-auto"
                                                >
                                                    <DollarSign size={14} /> Ajustar Créditos
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {activeTab === 'metrics' && (
                        <div className="text-center py-20 bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200">
                             <TrendingUp size={48} className="mx-auto text-slate-300 mb-4" />
                             <h3 className="text-xl font-bold text-slate-800">Próximamente Metrics 3.0</h3>
                             <p className="text-slate-500 max-w-sm mx-auto mt-2">Estamos integrando dashboards de facturación global y tiempo de ejecución de bots para el próximo ciclo de despliegue.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

const StatCard: React.FC<{ icon: any, label: string, value: any, color: string }> = ({ icon, label, value, color }) => (
    <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all">
        <div className="flex items-start justify-between mb-4">
            <div className={`p-3 rounded-2xl bg-${color}-50`}>
                {icon}
            </div>
            <div className={`text-[10px] font-black uppercase text-${color}-600 tracking-widest`}>
                Live Data
            </div>
        </div>
        <div className="text-3xl font-black text-slate-900 mb-1">{value}</div>
        <div className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">{label}</div>
    </div>
);

const TabButton: React.FC<{ active: boolean, onClick: () => void, label: string, icon: any, color: string }> = ({ active, onClick, label, icon, color }) => (
    <button 
        onClick={onClick}
        className={`
            flex items-center gap-2 px-6 py-3 rounded-2xl text-sm font-bold transition-all
            ${active 
                ? `bg-white text-slate-900 shadow-lg shadow-slate-200 ring-1 ring-slate-200` 
                : 'text-slate-400 hover:text-slate-600 hover:bg-slate-100/50'
            }
        `}
    >
        {icon}
        {label}
    </button>
);
