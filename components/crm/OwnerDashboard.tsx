import React, { useState, useEffect } from 'react';
import { PieChart, Users, PhoneCall, TrendingUp, Presentation, Landmark, CheckCircle, XCircle, Plus, Search, Trash2, ExternalLink, Filter, Bot } from 'lucide-react';
import { accService } from '../../services/accService';
import { NewLeadModal } from './NewLeadModal';

export const OwnerDashboard: React.FC<{ onProfileUpdate?: () => void }> = ({ onProfileUpdate }) => {
    const [stats, setStats] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [leads, setLeads] = useState<any[]>([]);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [searchTerm, setSearchTerm] = useState('');

    // Business Profile State
    const [businessProfile, setBusinessProfile] = useState({
        businessNiche: '',
        businessDescription: '',
        businessLocation: ''
    });
    const [isSavingProfile, setIsSavingProfile] = useState(false);

    const handleDeleteLead = async (id: string) => {
        if (!window.confirm('¿Seguro que deseas eliminar este lead?')) return;
        try {
            await accService.deleteLead(id);
            loadMetrics();
        } catch (e: any) {
            alert('Error al eliminar lead: ' + e.message);
        }
    };

    useEffect(() => {
        loadMetrics();
    }, []);

    const loadMetrics = async () => {
        try {
            setError(null);
            const [metrics, leadsData] = await Promise.all([
                accService.getCrmMetrics(),
                accService.getLeads(page, 10, searchTerm)
            ]);
            setStats(metrics);
            setLeads(leadsData.leads);
            setTotalPages(leadsData.pages);
            
            // Load Business Profile
            const profileData = await accService.getBusinessProfile();
            if (profileData) setBusinessProfile({
                businessNiche: profileData.businessNiche || '',
                businessDescription: profileData.businessDescription || '',
                businessLocation: profileData.businessLocation || ''
            });

        } catch (e: any) {
            console.error(e);
            setError(e.message || "Error de conexión con el servidor");
        } finally {
            setLoading(false);
        }
    };

    const handleSaveProfile = async () => {
        setIsSavingProfile(true);
        try {
            await accService.updateBusinessProfile(businessProfile);
            if (onProfileUpdate) onProfileUpdate();
            alert('Perfil de Negocio actualizado correctamente.');
        } catch (e: any) {
            alert('Error al guardar perfil: ' + e.message);
        } finally {
            setIsSavingProfile(false);
        }
    };

    useEffect(() => {
        loadMetrics();
    }, [page, searchTerm]);

    if (loading) return <div className="flex h-full items-center justify-center p-8"><div className="animate-spin rounded-full h-8 w-8 border-4 border-wc-blue border-t-transparent"></div></div>;
    
    if (error || !stats) return (
        <div className="flex flex-col h-full items-center justify-center p-8 bg-slate-50 text-center gap-4">
            <XCircle size={48} className="text-red-400" />
            <div>
                <h3 className="text-xl font-bold text-slate-800">Error al cargar métricas</h3>
                <p className="text-sm text-slate-500">{error || "No se recibieron datos del servidor"}</p>
            </div>
            <button onClick={loadMetrics} className="mt-4 px-6 py-2 bg-wc-blue text-white rounded-lg font-bold shadow-md hover:bg-blue-600 transition-colors">
                Reintentar
            </button>
        </div>
    );

    const { funnel, tasks } = stats;
    
    // Calcula la taza de conversión Lead -> Won
    const totalLeads = Object.values(funnel).reduce((a: any, b: any) => a + b, 0) as number;

    const wonCount = funnel.WON || 0;
    const conversionRate = totalLeads > 0 ? ((wonCount / totalLeads) * 100).toFixed(1) : "0";

    return (
        <div className="flex flex-col h-full bg-[#f8fafc] overflow-y-auto p-4 md:p-8">
            <div className="mb-6 flex justify-between items-center bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                <div>
                    <h1 className="text-2xl font-black text-slate-800 tracking-tight flex items-center gap-2">
                        <TrendingUp className="text-wc-blue" /> CRM Sales Dashboard
                    </h1>
                    <p className="text-slate-500 font-medium">Vista Global de la Organización Métrica y Equipo</p>
                </div>
                <div className="flex flex-col items-end gap-3">
                    <div className="text-right">
                        <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Win Rate</div>
                        <div className="text-3xl font-black text-emerald-600">{conversionRate}%</div>
                    </div>
                    <button 
                        onClick={() => setIsModalOpen(true)}
                        className="bg-wc-gradient text-white px-4 py-2 rounded-xl text-xs font-bold shadow-md hover:shadow-lg transition-all flex items-center gap-2 active:scale-95"
                    >
                        <Plus size={14} /> Nuevo Prospecto
                    </button>
                </div>
            </div>

            {/* EMBLEMAS DE TAREAS Y SEGUIMIENTOS */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-blue-50 text-wc-blue flex items-center justify-center">
                        <Users size={24} />
                    </div>
                    <div>
                        <p className="text-sm font-bold text-slate-500">Total Leads</p>
                        <p className="text-2xl font-black text-slate-800">{totalLeads}</p>
                    </div>
                </div>
                
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-amber-50 text-amber-500 flex items-center justify-center">
                        <PhoneCall size={24} />
                    </div>
                    <div>
                        <p className="text-sm font-bold text-slate-500">Seguimientos Activos</p>
                        <p className="text-2xl font-black text-slate-800">{tasks.pending}</p>
                    </div>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-red-200 bg-red-50 shadow-sm flex items-center gap-4 relative overflow-hidden">
                    <div className="absolute -right-4 -top-4 opacity-10">
                         <XCircle size={100} />
                    </div>
                    <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center z-10">
                        <XCircle size={24} />
                    </div>
                    <div className="z-10">
                        <p className="text-sm font-bold text-red-600">Tareas Vencidas (Equipo)</p>
                        <p className="text-2xl font-black text-red-700">{tasks.overdue}</p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                 {/* PIPELINE FUNNEL */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex flex-col">
                    <h3 className="text-lg font-black text-slate-800 mb-6 flex items-center gap-2">
                        <PieChart className="text-wc-purple" size={20} /> Pipeline Funnel Actual
                    </h3>
                    
                    <div className="flex flex-col gap-3 flex-1 justify-center">
                        <FunnelStage label="Total Nuevos" count={funnel.NEW || 0} color="bg-blue-100 text-blue-800 border-blue-200" max={totalLeads} />
                        <FunnelStage label="Contactados" count={funnel.CONTACTED || 0} color="bg-yellow-100 text-yellow-800 border-yellow-200" max={totalLeads} />
                        <FunnelStage label="Cotizados" count={funnel.QUOTED || 0} color="bg-purple-100 text-purple-800 border-purple-200" max={totalLeads} />
                        <FunnelStage label="Citas/Visitas" count={funnel.VISITED || 0} color="bg-indigo-100 text-indigo-800 border-indigo-200" max={totalLeads} />
                        <FunnelStage label="Ganados" count={funnel.WON || 0} color="bg-emerald-100 text-emerald-800 border-emerald-200" max={totalLeads} />
                    </div>
                </div>

                {/* BUSINESS PROFILE (IA STRATEGY) */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 relative overflow-hidden group">
                    <div className="absolute -right-6 -top-6 w-24 h-24 bg-wc-blue/5 rounded-full blur-2xl group-hover:bg-wc-blue/10 transition-all"></div>
                    
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-lg font-black text-slate-800 flex items-center gap-2">
                            <Bot className="text-wc-blue" size={20} /> Perfil Estratégico AI
                        </h3>
                        <button 
                            onClick={handleSaveProfile}
                            disabled={isSavingProfile}
                            className="text-[10px] font-black uppercase tracking-widest bg-slate-900 text-white px-3 py-1.5 rounded-lg hover:bg-black transition-all disabled:opacity-50"
                        >
                            {isSavingProfile ? 'Guardando...' : 'Guardar Perfil'}
                        </button>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 block">¿De qué trata tu negocio? (Nicho)</label>
                            <input 
                                type="text"
                                placeholder="Ej: Mueblería de Lujo, Clínica Dental..."
                                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:border-wc-blue transition-all font-bold"
                                value={businessProfile.businessNiche}
                                onChange={(e) => setBusinessProfile({...businessProfile, businessNiche: e.target.value})}
                            />
                        </div>
                        <div>
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 block">Descripción / Objetivo de Venta</label>
                            <textarea 
                                placeholder="Ej: Vendemos sofás minimalistas de alta gama para hogares premium..."
                                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:border-wc-blue transition-all font-medium h-20 resize-none"
                                value={businessProfile.businessDescription}
                                onChange={(e) => setBusinessProfile({...businessProfile, businessDescription: e.target.value})}
                            />
                        </div>
                        <div>
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 block">Ubicación Objetivo (Ciudad Base)</label>
                            <div className="relative">
                                <Landmark size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                <input 
                                    type="text"
                                    placeholder="Ej: CDMX, Monterrey, Querétaro..."
                                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:border-wc-blue transition-all font-bold"
                                    value={businessProfile.businessLocation}
                                    onChange={(e) => setBusinessProfile({...businessProfile, businessLocation: e.target.value})}
                                />
                            </div>
                        </div>
                        <p className="text-[10px] text-slate-400 italic">
                            * Esta información es utilizada por WhatsCloud AI para sugerirte nichos de búsqueda y mejores prospectos en el Lead Scrapper.
                        </p>
                    </div>
                </div>
            </div>

            {/* LEADS LIST SECTION */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 mt-6 overflow-hidden">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                    <div>
                        <h3 className="text-lg font-black text-slate-800 flex items-center gap-2">
                            <Users size={20} className="text-wc-blue" /> Gestión de Prospectos
                        </h3>
                        <p className="text-xs font-semibold text-slate-400">Listado completo de leads capturados</p>
                    </div>
                    <div className="flex w-full md:w-auto gap-2">
                        <div className="relative flex-1 md:w-64">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                            <input 
                                type="text"
                                placeholder="Buscar por nombre o nicho..."
                                className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:border-wc-blue transition-all"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>
                </div>

                <div className="overflow-x-auto -mx-6">
                    <table className="w-full text-left border-collapse min-w-[600px]">
                        <thead>
                            <tr className="bg-slate-50 border-y border-slate-100">
                                <th className="px-6 py-3 text-[10px] font-black uppercase text-slate-400 tracking-wider">Negocio / Cliente</th>
                                <th className="px-6 py-3 text-[10px] font-black uppercase text-slate-400 tracking-wider">Teléfono / WhatsApp</th>
                                <th className="px-6 py-3 text-[10px] font-black uppercase text-slate-400 tracking-wider">Nicho / Ciudad</th>
                                <th className="px-6 py-3 text-[10px] font-black uppercase text-slate-400 tracking-wider text-center">AI Score</th>
                                <th className="px-6 py-3 text-[10px] font-black uppercase text-slate-400 tracking-wider text-right">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {leads.map(lead => (
                                <tr key={lead.id} className="hover:bg-slate-50/50 transition-colors group">
                                    <td className="px-6 py-4">
                                        <div className="font-bold text-slate-700 text-sm">{lead.businessName}</div>
                                        <div className="text-[10px] text-slate-400 font-medium">Cap: {new Date(lead.createdAt).toLocaleDateString()}</div>
                                    </td>
                                    <td className="px-6 py-4 font-mono text-xs text-slate-600">{lead.phone}</td>
                                    <td className="px-6 py-4">
                                        <div className="text-xs font-bold text-slate-600">{lead.niche}</div>
                                        <div className="text-[10px] text-slate-400 uppercase italic">{lead.city}</div>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${lead.aiScore > 70 ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-600'}`}>
                                            {lead.aiScore || 0}%
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button 
                                                onClick={() => window.open(`https://wa.me/${lead.phone.replace(/\D/g,'')}`, '_blank')}
                                                className="p-1.5 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition-colors"
                                                title="WhatsApp"
                                            >
                                                <ExternalLink size={14} />
                                            </button>
                                            <button 
                                                onClick={() => handleDeleteLead(lead.id)}
                                                className="p-1.5 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
                                            >
                                                <Trash2 size={14} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {leads.length === 0 && (
                    <div className="py-20 text-center text-slate-400">
                        <Users className="mx-auto mb-4 opacity-20" size={48} />
                        <p className="text-sm font-medium">No se encontraron prospectos</p>
                    </div>
                )}

                {/* PAGINATION */}
                {totalPages > 1 && (
                    <div className="flex justify-center items-center gap-4 mt-6 pt-6 border-t border-slate-100">
                        <button 
                            disabled={page === 1}
                            onClick={() => setPage(p => p - 1)}
                            className="px-4 py-1.5 bg-slate-100 text-slate-600 rounded-xl text-xs font-bold disabled:opacity-30 disabled:cursor-not-allowed hover:bg-slate-200 transition-all"
                        >
                            Anterior
                        </button>
                        <span className="text-xs font-bold text-slate-500">Página {page} de {totalPages}</span>
                        <button 
                            disabled={page === totalPages}
                            onClick={() => setPage(p => p + 1)}
                            className="px-4 py-1.5 bg-slate-900 text-white rounded-xl text-xs font-bold disabled:opacity-30 disabled:cursor-not-allowed hover:bg-slate-800 transition-all shadow-md active:scale-95"
                        >
                            Siguiente
                        </button>
                    </div>
                )}
            </div>

            <NewLeadModal 
                isOpen={isModalOpen} 
                onClose={() => setIsModalOpen(false)} 
                onSuccess={() => loadMetrics()} 
            />
        </div>
    );
};

const FunnelStage = ({ label, count, color, max }: { label: string, count: number, color: string, max: number }) => {
    const width = max > 0 ? Math.max((count / max) * 100, 5) : 100; // minimum 5% width visually
    
    return (
        <div className="flex items-center gap-4">
            <div className="w-1/3 text-right text-sm font-bold text-slate-600 truncate">{label}</div>
            <div className="flex-1 bg-slate-100 rounded-full h-8 flex items-center relative overflow-hidden shadow-inner">
                 <div 
                    className={`h-full flex items-center justify-end pr-3 font-black text-xs transition-all duration-1000 ${color}`} 
                    style={{ width: `${width}%` }}
                 >
                     {count > 0 && count}
                 </div>
                 {count === 0 && <span className="absolute ml-3 text-xs font-bold text-slate-400">0</span>}
            </div>
            <div className="w-10 text-xs font-bold text-slate-400 text-right">
                {max > 0 ? ((count / max) * 100).toFixed(0) : 0}%
            </div>
        </div>
    );
}
