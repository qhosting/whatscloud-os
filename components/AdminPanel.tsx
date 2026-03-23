import React, { useState, useEffect } from 'react';
import { accService } from '../services/accService';
import { Building2, Users, Shield, TrendingUp, DollarSign, Settings, Search, CheckCircle, XCircle, MoreVertical, CreditCard, Zap, Smartphone, Activity } from 'lucide-react';

export const AdminPanel: React.FC = () => {
    const [organizations, setOrganizations] = useState<any[]>([]);
    const [users, setUsers] = useState<any[]>([]);
    const [wahaSessions, setWahaSessions] = useState<any[]>([]);
    const [plans, setPlans] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'orgs' | 'users' | 'metrics' | 'waha' | 'plans'>('orgs');
    const [searchTerm, setSearchTerm] = useState('');
    
    // Org Modal State
    const [editingOrg, setEditingOrg] = useState<any>(null);
    const [isSavingOrg, setIsSavingOrg] = useState(false);

    // Plan Modal State
    const [editingPlan, setEditingPlan] = useState<any>(null);
    const [isSavingPlan, setIsSavingPlan] = useState(false);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        try {
            const orgs = await accService.adminGetAllOrgs();
            const allUsers = await accService.adminGetAllUsers();
            const sessions = await accService.adminGetAllWahaSessions().catch(() => []);
            const allPlans = await accService.adminGetAllPlans().catch(() => []);
            setOrganizations(orgs);
            setUsers(allUsers);
            setWahaSessions(sessions);
            setPlans(allPlans);
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

    const handleSaveOrg = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingOrg) return;
        setIsSavingOrg(true);
        try {
            await accService.adminUpdateOrg(editingOrg.id, {
                name: editingOrg.name,
                slug: editingOrg.slug,
                plan: editingOrg.plan,
                status: editingOrg.status,
                n8nWebhookUrl: editingOrg.n8nWebhookUrl,
                amiHost: editingOrg.amiHost,
                subscriptionPlanId: editingOrg.subscriptionPlanId
            });
            // alert('Empresa actualizada correctamente');
            setEditingOrg(null);
            loadData();
        } catch (e) {
            alert('Error al actualizar empresa');
        } finally {
            setIsSavingOrg(false);
        }
    };

    const handleSavePlan = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingPlan) return;
        setIsSavingPlan(true);
        try {
            if (editingPlan.id) {
                await accService.adminUpdatePlan(editingPlan.id, editingPlan);
            } else {
                await accService.adminCreatePlan(editingPlan);
            }
            setEditingPlan(null);
            loadData();
        } catch (e) {
            alert('Error al guardar el plan');
        } finally {
            setIsSavingPlan(false);
        }
    };

    const handleDeletePlan = async (id: string) => {
        if (!confirm('¿Seguro que deseas eliminar este plan? No debe haber ninguna empresa usándolo.')) return;
        try {
            await accService.adminDeletePlan(id);
            loadData();
        } catch (e: any) {
            alert(e.message || 'Error al eliminar el plan');
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
                <StatCard icon={<Smartphone className="text-purple-500" />} label="Motores WAHA" value={wahaSessions.length} color="purple" />
            </div>

            {/* TABS CONTROLLER */}
            <div className="bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden">
                <div className="flex border-b border-slate-100 p-2 bg-slate-50/50">
                    <TabButton active={activeTab === 'orgs'} onClick={() => setActiveTab('orgs')} label="Empresas (Tenants)" icon={<Building2 size={16} />} color="blue" />
                    <TabButton active={activeTab === 'users'} onClick={() => setActiveTab('users')} label="Usuarios & Créditos" icon={<Users size={16} />} color="emerald" />
                    <TabButton active={activeTab === 'waha'} onClick={() => setActiveTab('waha')} label="Motor WAHA" icon={<Smartphone size={16} />} color="orange" />
                    <TabButton active={activeTab === 'plans'} onClick={() => setActiveTab('plans')} label="Planes & Precios" icon={<CreditCard size={16} />} color="purple" />
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
                                                <button 
                                                    onClick={() => setEditingOrg(org)}
                                                    className="p-2 text-slate-400 hover:text-slate-800 transition-colors"
                                                >
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

                    {activeTab === 'waha' && (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-slate-50/80">
                                    <tr>
                                        <th className="px-6 py-4 text-[10px] font-black uppercase text-slate-500 tracking-widest">Session ID (Tenant)</th>
                                        <th className="px-6 py-4 text-[10px] font-black uppercase text-slate-500 tracking-widest">Status / Worker</th>
                                        <th className="px-6 py-4 text-[10px] font-black uppercase text-slate-500 tracking-widest">Info Adicional</th>
                                        <th className="px-6 py-4"></th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {wahaSessions.map(session => (
                                        <tr key={session.name} className="hover:bg-slate-50/50 transition-colors group text-sm">
                                            <td className="px-6 py-4">
                                                <div className="font-bold text-slate-800 font-mono text-xs">{session.name}</div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider ${
                                                    session.status === 'WORKING' ? 'bg-green-100 text-green-700' : 
                                                    session.status === 'SCAN_QR_CODE' ? 'bg-blue-100 text-blue-700' : 
                                                    'bg-slate-100 text-slate-600'
                                                }`}>
                                                    {session.status}
                                                </span>
                                            </td>
                                             <td className="px-6 py-4">
                                                 <div className="flex items-center gap-2">
                                                     <Smartphone size={12} className="text-slate-400" />
                                                     <span className="font-mono text-xs font-black text-slate-600 bg-slate-100 px-2 py-1 rounded-lg">
                                                         {session.me?.id?.split('@')[0] || session.me?.user || 'Sín Vincular'}
                                                     </span>
                                                 </div>
                                             </td>
                                            <td className="px-6 py-4 text-right">
                                                <button 
                                                    onClick={async () => {
                                                        if(confirm(`⚠️ CUIDADO: Forzar cierre a la sesión ${session.name}? El cliente tendrá que re-escanear su código QR.`)) {
                                                            await accService.adminDeleteWahaSession(session.name);
                                                            loadData();
                                                        }
                                                    }}
                                                    className="bg-red-50 text-red-600 hover:bg-red-600 hover:text-white transition-all px-4 py-2 rounded-xl text-xs font-bold shadow-sm flex items-center gap-2 ml-auto"
                                                >
                                                    <XCircle size={14} /> Matar Sesión
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                    {wahaSessions.length === 0 && (
                                        <tr><td colSpan={4} className="text-center py-10 text-slate-400 font-bold">No hay sesiones de WAHA activas en el cluster.</td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {activeTab === 'plans' && (
                        <div className="space-y-6">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-xl font-black text-slate-800 tracking-tight">Diseñador de Planes Dinámicos</h3>
                                <button 
                                    onClick={() => setEditingPlan({ name: '', price: 0, limits: { maxUsers: 5, maxMessages: 1000 }, isActive: true })}
                                    className="bg-slate-900 text-white px-6 py-3 rounded-2xl font-bold text-sm flex items-center gap-2 hover:bg-slate-800 active:scale-95 transition-all shadow-xl shadow-slate-900/10"
                                >
                                    <Zap size={16} /> Crear Plan Nuevo
                                </button>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                {plans.map(plan => (
                                    <div key={plan.id} className="bg-slate-50 border border-slate-200 rounded-[2.5rem] p-8 relative overflow-hidden group hover:border-purple-500/30 transition-all">
                                        <div className="absolute top-0 right-0 p-4">
                                            <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${plan.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                                {plan.isActive ? 'Activo' : 'Inactivo'}
                                            </span>
                                        </div>
                                        <h4 className="text-2xl font-black text-slate-900 mb-2 truncate pr-16">{plan.name}</h4>
                                        <div className="flex items-baseline gap-1 mb-6">
                                            <span className="text-4xl font-black text-purple-600">${plan.price}</span>
                                            <span className="text-slate-400 font-bold text-xs uppercase tracking-widest">/ mes</span>
                                        </div>
                                        
                                        <div className="space-y-3 mb-8">
                                            <div className="flex items-center justify-between text-xs">
                                                <span className="text-slate-500 font-medium italic">Máx Usuarios:</span>
                                                <span className="font-bold text-slate-700">{plan.limits?.maxUsers || '∞'}</span>
                                            </div>
                                            <div className="flex items-center justify-between text-xs">
                                                <span className="text-slate-500 font-medium italic">Msg WAHA:</span>
                                                <span className="font-bold text-slate-700">{plan.limits?.maxMessages || '∞'}</span>
                                            </div>
                                        </div>

                                        <div className="flex gap-2 relative z-10 pt-4 border-t border-slate-200 border-dashed">
                                            <button 
                                                onClick={() => setEditingPlan(plan)}
                                                className="flex-1 bg-white border border-slate-200 p-3 rounded-xl font-bold text-xs hover:bg-slate-100 transition-colors flex items-center justify-center gap-2"
                                            >
                                                <Settings size={14} /> Editar
                                            </button>
                                            <button 
                                                onClick={() => handleDeletePlan(plan.id)}
                                                className="w-12 h-12 bg-red-50 text-red-600 rounded-xl flex items-center justify-center hover:bg-red-600 hover:text-white transition-all shadow-sm shadow-red-500/5 group/del"
                                            >
                                                <XCircle size={18} className="transition-transform group-hover/del:scale-110" />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                                {plans.length === 0 && (
                                    <div className="col-span-full py-20 text-center border-2 border-dashed border-slate-100 rounded-[2.5rem]">
                                        <CreditCard size={48} className="mx-auto text-slate-200 mb-4" />
                                        <p className="text-slate-400 font-bold">Aún no has diseñado ningún plan dinámico.</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {activeTab === 'metrics' && (
                        <div className="space-y-6">
                            <div className="bg-slate-50 p-6 rounded-3xl border border-slate-200">
                                <h3 className="font-black text-slate-800 mb-6 flex items-center gap-2">
                                    <TrendingUp size={18} className="text-purple-600" /> Monitoreo en Tiempo Real
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
                                        <div className="text-[10px] font-black text-slate-400 uppercase mb-1">Conversaciones</div>
                                        <div className="text-2xl font-black text-slate-900">Activo</div>
                                        <p className="text-[10px] text-wc-green font-bold">Latency: 45ms</p>
                                    </div>
                                    <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
                                        <div className="text-[10px] font-black text-slate-400 uppercase mb-1">Scraper Engine</div>
                                        <div className="text-2xl font-black text-slate-900">En Cola</div>
                                        <p className="text-[10px] text-blue-500 font-bold">Puppeteer Headless OK</p>
                                    </div>
                                    <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
                                        <div className="text-[10px] font-black text-slate-400 uppercase mb-1">IA Gemini API</div>
                                        <div className="text-2xl font-black text-slate-900">Operativo</div>
                                        <p className="text-[10px] text-purple-600 font-bold">Token Usage: Dynamic</p>
                                    </div>
                                </div>
                            </div>
                            <div className="text-center py-10 text-slate-400 text-sm">
                                <Shield size={32} className="mx-auto opacity-20 mb-3" />
                                <p>Infraestructura escalada horizontalmente sobre <span className="font-bold text-slate-600">Aurum Control Center Cluster</span>.</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* EDIT ORG MODAL */}
            {editingOrg && (
                <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in">
                    <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
                        <div className="p-6 border-b border-slate-100 bg-slate-50 flex justify-between items-center relative">
                            <div>
                                <h3 className="font-black text-lg text-slate-800 tracking-tight">Configurar Tenant</h3>
                                <p className="text-xs font-mono text-slate-500 mt-1">{editingOrg.name} ({editingOrg.slug})</p>
                            </div>
                            <button onClick={() => setEditingOrg(null)} className="text-slate-400 hover:text-slate-600 bg-slate-200/50 hover:bg-slate-200 p-2 rounded-full transition-colors">
                                <XCircle size={20} />
                            </button>
                        </div>
                        <div className="p-6 overflow-y-auto">
                            <form id="editOrgForm" onSubmit={handleSaveOrg} className="space-y-6">
                                <div>
                                    <label className="block text-[10px] font-black uppercase text-slate-500 mb-2 tracking-widest">Nombre de la Organización</label>
                                    <input 
                                        type="text"
                                        placeholder="Tenant Name"
                                        value={editingOrg.name || ''}
                                        onChange={(e) => setEditingOrg({...editingOrg, name: e.target.value})}
                                        className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:border-purple-500 focus:ring-4 focus:ring-purple-500/10 transition-all font-bold text-slate-800"
                                    />
                                </div>
                                <div className="bg-slate-50 p-4 rounded-2xl border border-dashed border-slate-200">
                                    <label className="block text-[10px] font-black uppercase text-slate-500 mb-2 tracking-widest flex items-center gap-1">
                                       <Activity size={10} className="text-amber-500" /> Slug / ID Motor WAHA
                                    </label>
                                    <input 
                                        type="text"
                                        placeholder="neurondas"
                                        value={editingOrg.slug || ''}
                                        onChange={(e) => setEditingOrg({...editingOrg, slug: e.target.value.toLowerCase().replace(/\s+/g, '-')})}
                                        className="w-full px-4 py-2 bg-white rounded-xl border border-slate-200 outline-none focus:border-amber-500 transition-all font-mono text-xs text-amber-700 font-bold"
                                    />
                                    <p className="text-[9px] text-slate-400 mt-2 italic font-medium">Este será el nombre visible en Easypanel: <strong>{editingOrg.slug || 'neurondas'}</strong></p>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-black uppercase text-slate-500 mb-2 tracking-widest">Plan Maestro</label>
                                        <select 
                                            value={editingOrg.subscriptionPlanId || editingOrg.plan || 'FREE'}
                                            onChange={(e) => setEditingOrg({...editingOrg, subscriptionPlanId: e.target.value})}
                                            className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-700 font-bold outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all cursor-pointer"
                                        >
                                            <optgroup label="Planes Dinámicos">
                                                {plans.map(p => (
                                                    <option key={p.id} value={p.id}>{p.name} (${p.price})</option>
                                                ))}
                                            </optgroup>
                                            <optgroup label="Legacy (ENUM)">
                                                <option value="FREE">Free (Legacy)</option>
                                                <option value="PRO">Pro (Legacy)</option>
                                                <option value="ENTERPRISE">Enterprise (Legacy)</option>
                                            </optgroup>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-black uppercase text-slate-500 mb-2 tracking-widest">Estado</label>
                                        <select 
                                            value={editingOrg.status || 'ACTIVE'}
                                            onChange={(e) => setEditingOrg({...editingOrg, status: e.target.value})}
                                            className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-700 font-bold outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all cursor-pointer"
                                        >
                                            <option value="ACTIVE">Active</option>
                                            <option value="SUSPENDED">Suspended</option>
                                            <option value="CANCELLED">Cancelled</option>
                                        </select>
                                    </div>
                                </div>
                                <div className="border-t border-dashed border-slate-200 pt-5">
                                    <h4 className="text-sm font-bold text-slate-700 mb-4 flex items-center gap-2">
                                        <Zap size={16} className="text-purple-500" /> Automatizaciones & Voz
                                    </h4>
                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-[10px] font-black uppercase text-slate-500 mb-2 tracking-widest">Webhook n8n (Integración)</label>
                                            <input 
                                                type="url"
                                                placeholder="https://tu-n8n.com/webhook/..."
                                                value={editingOrg.n8nWebhookUrl || ''}
                                                onChange={(e) => setEditingOrg({...editingOrg, n8nWebhookUrl: e.target.value})}
                                                className="w-full font-mono text-sm px-4 py-3 rounded-xl border border-slate-200 outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-100 transition-all placeholder:text-slate-300"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-[10px] font-black uppercase text-slate-500 mb-2 tracking-widest">IP Servidor PBX (Issabel/Asterisk)</label>
                                            <div className="relative">
                                                <input 
                                                    type="text"
                                                    placeholder="192.168.x.x o hostname"
                                                    value={editingOrg.amiHost || ''}
                                                    onChange={(e) => setEditingOrg({...editingOrg, amiHost: e.target.value})}
                                                    className="w-full font-mono text-sm px-4 py-3 rounded-xl border border-slate-200 outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-100 transition-all placeholder:text-slate-300 pl-10"
                                                />
                                                <Smartphone size={16} className="absolute left-3 top-3.5 text-slate-400" />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </form>
                        </div>
                        <div className="p-4 border-t border-slate-100 bg-slate-50/50 flex gap-3">
                            <button type="button" onClick={() => setEditingOrg(null)} className="flex-1 px-4 py-3 text-sm font-bold text-slate-500 hover:bg-slate-200 rounded-xl transition-all">
                                Cancelar
                            </button>
                            <button type="submit" form="editOrgForm" disabled={isSavingOrg} className="flex-1 px-4 py-3 text-sm font-bold text-white bg-slate-900 hover:bg-slate-800 disabled:opacity-50 flex items-center justify-center gap-2 rounded-xl shadow-lg shadow-slate-900/20 transition-all active:scale-95">
                                {isSavingOrg ? <CheckCircle className="animate-pulse" size={16} /> : <Settings size={16} />}
                                Guardar Configuración
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* PLAN BUILDER MODAL */}
            {editingPlan && (
                <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-[60] p-4 animate-in fade-in">
                    <div className="bg-white rounded-[2.5rem] shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden flex flex-col max-h-[90vh]">
                        <div className="p-8 border-b border-slate-100 bg-purple-50 flex justify-between items-center relative">
                            <div>
                                <h3 className="font-black text-2xl text-slate-800 tracking-tight">Diseñar Plan</h3>
                                <p className="text-xs font-bold text-purple-600 uppercase tracking-widest mt-1">Configuración Comercial</p>
                            </div>
                            <button onClick={() => setEditingPlan(null)} className="text-purple-400 hover:text-purple-600 bg-purple-200/50 hover:bg-purple-200 p-2 rounded-full transition-colors">
                                <XCircle size={20} />
                            </button>
                        </div>
                        <div className="p-8 overflow-y-auto">
                            <form id="editPlanForm" onSubmit={handleSavePlan} className="space-y-6">
                                <div>
                                    <label className="block text-[10px] font-black uppercase text-slate-500 mb-2 tracking-[0.2em]">Nombre del Paquete</label>
                                    <input 
                                        type="text"
                                        placeholder="Ej: Plan Pro Max"
                                        required
                                        value={editingPlan.name || ''}
                                        onChange={(e) => setEditingPlan({...editingPlan, name: e.target.value})}
                                        className="w-full px-5 py-4 rounded-2xl border border-slate-200 bg-slate-50 text-slate-800 font-bold outline-none focus:border-purple-500 focus:ring-4 focus:ring-purple-500/10 transition-all"
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-[10px] font-black uppercase text-slate-500 mb-2 tracking-[0.2em]">Precio Mensual ($)</label>
                                        <input 
                                            type="number"
                                            placeholder="49"
                                            value={editingPlan.price || 0}
                                            onChange={(e) => setEditingPlan({...editingPlan, price: parseFloat(e.target.value) || 0})}
                                            className="w-full px-5 py-4 rounded-2xl border border-slate-200 bg-slate-50 text-slate-800 font-black outline-none focus:border-purple-500 focus:ring-4 focus:ring-purple-500/10 transition-all font-mono"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-black uppercase text-slate-500 mb-2 tracking-[0.2em]">Estado Vital</label>
                                        <select 
                                            value={editingPlan.isActive ? 'Y' : 'N'}
                                            onChange={(e) => setEditingPlan({...editingPlan, isActive: e.target.value === 'Y'})}
                                            className="w-full px-5 py-4 rounded-2xl border border-slate-200 bg-white text-slate-800 font-black outline-none focus:border-purple-500 transition-all shadow-sm"
                                        >
                                            <option value="Y">Publicado</option>
                                            <option value="N">Borrador</option>
                                        </select>
                                    </div>
                                </div>
                                <div className="pt-4 border-t border-dashed border-slate-200">
                                    <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">Límites Técnicos (Quota)</h4>
                                    <div className="space-y-4">
                                        <div className="flex items-center gap-4">
                                            <div className="flex-1">
                                                <label className="block text-[9px] font-black text-slate-500 mb-1">Max Usuarios</label>
                                                <input 
                                                    type="number"
                                                    value={editingPlan.limits?.maxUsers || 5}
                                                    onChange={(e) => setEditingPlan({...editingPlan, limits: { ...editingPlan.limits, maxUsers: parseInt(e.target.value) || 0 }})}
                                                    className="w-full px-4 py-3 rounded-xl border border-slate-100 bg-slate-50/50 font-bold text-sm"
                                                />
                                            </div>
                                            <div className="flex-1 text-center bg-slate-100/50 p-2 rounded-xl">
                                                <label className="block text-[8px] font-black text-slate-400 mb-1 uppercase tracking-widest">Base Quota (Legacy)</label>
                                                <span className="font-bold text-slate-400 text-xs">{editingPlan.limits?.maxMessages || 1000}</span>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="bg-green-50/50 p-3 rounded-2xl border border-green-100">
                                                <label className="block text-[9px] font-black tracking-widest text-green-600 mb-1 uppercase">Cuota WhatsApp</label>
                                                <input 
                                                    type="number"
                                                    value={editingPlan.limits?.maxWaMessages || 0}
                                                    onChange={(e) => setEditingPlan({...editingPlan, limits: { ...editingPlan.limits, maxWaMessages: parseInt(e.target.value) || 0 }})}
                                                    className="w-full bg-transparent border-none font-black text-lg text-green-700 focus:ring-0 p-0"
                                                />
                                            </div>
                                            <div className="bg-blue-50/50 p-3 rounded-2xl border border-blue-100">
                                                <label className="block text-[9px] font-black tracking-widest text-blue-600 mb-1 uppercase">Cuota SMS</label>
                                                <input 
                                                    type="number"
                                                    value={editingPlan.limits?.maxSms || 0}
                                                    onChange={(e) => setEditingPlan({...editingPlan, limits: { ...editingPlan.limits, maxSms: parseInt(e.target.value) || 0 }})}
                                                    className="w-full bg-transparent border-none font-black text-lg text-blue-700 focus:ring-0 p-0"
                                                />
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="bg-orange-50/50 p-3 rounded-2xl border border-orange-100">
                                                <label className="block text-[9px] font-black tracking-widest text-orange-600 mb-1 uppercase">Límite Leads</label>
                                                <input 
                                                    type="number"
                                                    value={editingPlan.limits?.maxLeads || 0}
                                                    onChange={(e) => setEditingPlan({...editingPlan, limits: { ...editingPlan.limits, maxLeads: parseInt(e.target.value) || 0 }})}
                                                    className="w-full bg-transparent border-none font-black text-lg text-orange-700 focus:ring-0 p-0"
                                                />
                                            </div>
                                            <div className="bg-purple-50/50 p-3 rounded-2xl border border-purple-100">
                                                <label className="block text-[9px] font-black tracking-widest text-purple-600 mb-1 uppercase">Minutos PBX</label>
                                                <input 
                                                    type="number"
                                                    value={editingPlan.limits?.maxPbxMinutes || 0}
                                                    onChange={(e) => setEditingPlan({...editingPlan, limits: { ...editingPlan.limits, maxPbxMinutes: parseInt(e.target.value) || 0 }})}
                                                    className="w-full bg-transparent border-none font-black text-lg text-purple-700 focus:ring-0 p-0"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </form>
                        </div>
                        <div className="p-8 border-t border-slate-100 bg-slate-50/50 flex gap-3">
                            <button onClick={() => setEditingPlan(null)} className="flex-1 px-4 py-4 text-sm font-bold text-slate-500 hover:bg-slate-200 rounded-2xl transition-all">
                                Descartar
                            </button>
                            <button type="submit" form="editPlanForm" disabled={isSavingPlan} className="flex-[2] bg-purple-600 text-white px-4 py-4 rounded-2xl font-black text-sm shadow-xl shadow-purple-600/20 hover:bg-purple-700 active:scale-95 transition-all">
                                {isSavingPlan ? 'Procesando...' : (editingPlan.id ? 'Actualizar Plan' : 'Crear Plan Maestro')}
                            </button>
                        </div>
                    </div>
                </div>
            )}
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
