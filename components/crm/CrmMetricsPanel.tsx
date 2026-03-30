import React, { useState, useEffect } from 'react';
import {
    PieChart, Users, PhoneCall, TrendingUp, XCircle,
    Award, Bot, RefreshCw
} from 'lucide-react';
import { accService } from '../../services/accService';

// ─── FunnelStage Component ───
const FunnelStage: React.FC<{ label: string; count: number; color: string; max: number }> = ({ label, count, color, max }) => {
    const width = max > 0 ? Math.max((count / max) * 100, 4) : 100;
    return (
        <div className="flex items-center gap-3">
            <div className="w-28 text-right text-xs font-bold text-slate-500 truncate flex-shrink-0">{label}</div>
            <div className="flex-1 bg-slate-100 rounded-full h-7 flex items-center relative overflow-hidden shadow-inner">
                <div
                    className={`h-full flex items-center justify-end pr-3 font-black text-xs transition-all duration-700 ${color}`}
                    style={{ width: `${width}%` }}
                >
                    {count > 0 && count}
                </div>
                {count === 0 && <span className="absolute ml-3 text-xs font-bold text-slate-400">0</span>}
            </div>
            <div className="w-8 text-xs font-bold text-slate-400 text-right flex-shrink-0">
                {max > 0 ? ((count / max) * 100).toFixed(0) : 0}%
            </div>
        </div>
    );
};

export const CrmMetricsPanel: React.FC<{ onProfileUpdate?: () => void }> = ({ onProfileUpdate }) => {
    const [stats, setStats] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isSavingProfile, setIsSavingProfile] = useState(false);
    const [businessProfile, setBusinessProfile] = useState({
        businessNiche: '',
        businessDescription: '',
        businessLocation: ''
    });

    useEffect(() => { loadAll(); }, []);

    const loadAll = async () => {
        try {
            setError(null);
            const [metrics, profileData] = await Promise.all([
                accService.getCrmMetrics(),
                accService.getBusinessProfile().catch(() => null)
            ]);
            setStats(metrics);
            if (profileData) {
                setBusinessProfile({
                    businessNiche: profileData.businessNiche || '',
                    businessDescription: profileData.businessDescription || '',
                    businessLocation: profileData.businessLocation || ''
                });
            }
        } catch (e: any) {
            setError(e.message || 'Error de conexión');
        } finally {
            setLoading(false);
        }
    };

    const handleSaveProfile = async () => {
        setIsSavingProfile(true);
        try {
            await accService.updateBusinessProfile(businessProfile);
            if (onProfileUpdate) onProfileUpdate();
            alert('Perfil guardado correctamente.');
        } catch (e: any) {
            alert('Error: ' + e.message);
        } finally {
            setIsSavingProfile(false);
        }
    };

    if (loading) return (
        <div className="flex h-full items-center justify-center p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-4 border-wc-blue border-t-transparent" />
        </div>
    );

    if (error || !stats) return (
        <div className="flex flex-col h-full items-center justify-center p-8 text-center gap-4">
            <XCircle size={48} className="text-red-400" />
            <div>
                <h3 className="text-xl font-bold text-slate-800">Error al cargar métricas</h3>
                <p className="text-sm text-slate-500 mt-1">{error || 'Sin respuesta del servidor'}</p>
            </div>
            <button onClick={loadAll} className="px-6 py-2 bg-wc-blue text-white rounded-lg font-bold shadow-md hover:bg-blue-600 transition-colors flex items-center gap-2">
                <RefreshCw size={14} /> Reintentar
            </button>
        </div>
    );

    const { funnel, tasks } = stats;
    const totalLeads = Object.values(funnel).reduce((a: any, b: any) => a + b, 0) as number;
    const wonCount = funnel.WON || 0;
    const conversionRate = totalLeads > 0 ? ((wonCount / totalLeads) * 100).toFixed(1) : '0';

    const kpis = [
        { icon: <Users size={20} />, label: 'Total Leads', value: totalLeads, color: 'text-wc-blue', bg: 'bg-blue-50' },
        { icon: <PhoneCall size={20} />, label: 'Seguimientos', value: tasks.pending, color: 'text-amber-600', bg: 'bg-amber-50' },
        { icon: <Award size={20} />, label: 'Win Rate', value: `${conversionRate}%`, color: 'text-emerald-600', bg: 'bg-emerald-50' },
        { icon: <XCircle size={20} />, label: 'Tareas Vencidas', value: tasks.overdue, color: 'text-red-600', bg: 'bg-red-50' },
    ];

    return (
        <div className="flex flex-col h-full bg-[#f4f6f9] overflow-y-auto">
            <div className="p-6 flex flex-col gap-6">
                
                {/* ── HEADER ── */}
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-wc-gradient flex items-center justify-center shadow-md">
                        <TrendingUp size={20} className="text-white" />
                    </div>
                    <div>
                        <h2 className="text-xl font-black text-slate-800 tracking-tight">Métricas y Resultados</h2>
                        <p className="text-xs font-medium text-slate-500 flex items-center gap-1">
                            Resumen global del rendimiento comercial
                        </p>
                    </div>
                </div>

                {/* ── KPI CARDS ── */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    {kpis.map((kpi, i) => (
                        <div key={i} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 flex items-center gap-4">
                            <div className={`w-12 h-12 rounded-xl ${kpi.bg} ${kpi.color} flex items-center justify-center flex-shrink-0`}>
                                {kpi.icon}
                            </div>
                            <div>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1.5">{kpi.label}</p>
                                <p className="text-2xl font-black text-slate-800 leading-none">{kpi.value}</p>
                            </div>
                        </div>
                    ))}
                </div>

                {/* ── PANELS ── */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Pipeline Funnel */}
                    <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200">
                        <h3 className="text-sm font-black text-slate-800 mb-6 flex items-center gap-2">
                            <PieChart className="text-wc-purple" size={18} /> Embudo de Conversión (Pipeline)
                        </h3>
                        <div className="flex flex-col gap-3">
                            <FunnelStage label="Nuevos"      count={funnel.NEW || 0}       color="bg-blue-100 text-blue-700 border-blue-200"     max={totalLeads} />
                            <FunnelStage label="Contactados" count={funnel.CONTACTED || 0}  color="bg-amber-100 text-amber-700 border-amber-200"   max={totalLeads} />
                            <FunnelStage label="Cotizados"   count={funnel.QUOTED || 0}     color="bg-purple-100 text-purple-700 border-purple-200" max={totalLeads} />
                            <FunnelStage label="Citas/Visitas"count={funnel.VISITED || 0}   color="bg-indigo-100 text-indigo-700 border-indigo-200" max={totalLeads} />
                            <FunnelStage label="Ganados"     count={funnel.WON || 0}        color="bg-emerald-100 text-emerald-700 border-emerald-200" max={totalLeads} />
                            <FunnelStage label="Perdidos"    count={funnel.LOST || 0}       color="bg-red-100 text-red-700 border-red-200"         max={totalLeads} />
                        </div>
                    </div>

                    {/* Business Profile AI */}
                    <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200 relative overflow-hidden flex flex-col justify-between">
                        <div className="absolute -right-10 -top-10 w-40 h-40 bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />
                        <div>
                            <div className="flex justify-between items-center mb-6 relative z-10">
                                <h3 className="text-sm font-black text-slate-800 flex items-center gap-2">
                                    <Bot className="text-wc-blue" size={18} /> Contexto Estratégico IA
                                </h3>
                            </div>
                            <div className="space-y-4 relative z-10">
                                <div>
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 block">Nicho de Mercado</label>
                                    <input
                                        type="text"
                                        placeholder="Ej: Mueblería de Lujo..."
                                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:border-wc-blue transition-all font-bold"
                                        value={businessProfile.businessNiche}
                                        onChange={e => setBusinessProfile({ ...businessProfile, businessNiche: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 block">¿Qué problema resuelves?</label>
                                    <textarea
                                        rows={3}
                                        placeholder="Ej: Vendemos muebles de alta gama bajo demanda para diseñadores..."
                                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:border-wc-blue transition-all font-medium resize-none"
                                        value={businessProfile.businessDescription}
                                        onChange={e => setBusinessProfile({ ...businessProfile, businessDescription: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 block">Zona Geográfica (Target)</label>
                                    <input
                                        type="text"
                                        placeholder="Ej: Ciudad de México, LATAM"
                                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:border-wc-blue transition-all font-bold"
                                        value={businessProfile.businessLocation}
                                        onChange={e => setBusinessProfile({ ...businessProfile, businessLocation: e.target.value })}
                                    />
                                    <p className="text-[10px] text-slate-400 mt-2 font-medium">Esta info alimenta al bot para prospectar inteligentemente.</p>
                                </div>
                            </div>
                        </div>
                        <div className="mt-6 flex justify-end">
                            <button
                                onClick={handleSaveProfile}
                                disabled={isSavingProfile}
                                className="text-xs font-black uppercase tracking-widest bg-slate-900 text-white px-5 py-3 rounded-xl hover:bg-black transition-all disabled:opacity-50 active:scale-95 shadow-md hover:shadow-lg w-full sm:w-auto"
                            >
                                {isSavingProfile ? 'Guardando...' : 'Guardar Perfil'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
