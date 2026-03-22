import React, { useState, useEffect } from 'react';
import { PieChart, Users, PhoneCall, TrendingUp, Presentation, Landmark, CheckCircle, XCircle } from 'lucide-react';
import { accService } from '../../services/accService';

export const OwnerDashboard = () => {
    const [stats, setStats] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        loadMetrics();
    }, []);

    const loadMetrics = async () => {
        try {
            setError(null);
            const data = await accService.getCrmMetrics();
            setStats(data);
        } catch (e: any) {
            console.error(e);
            setError(e.message || "Error de conexión con el servidor");
        } finally {
            setLoading(false);
        }
    };

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
                <div className="text-right">
                    <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Win Rate</div>
                    <div className="text-3xl font-black text-emerald-600">{conversionRate}%</div>
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

            {/* PIPELINE FUNNEL */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 relative">
                <h3 className="text-lg font-black text-slate-800 mb-6 flex items-center gap-2">
                    <PieChart className="text-wc-purple" size={20} /> Pipeline Funnel Actual
                </h3>
                
                <div className="flex flex-col gap-3">
                    <FunnelStage label="Total Nuevos" count={funnel.NEW || 0} color="bg-blue-100 text-blue-800 border-blue-200" max={totalLeads} />
                    <FunnelStage label="Contactados" count={funnel.CONTACTED || 0} color="bg-yellow-100 text-yellow-800 border-yellow-200" max={totalLeads} />
                    <FunnelStage label="Cotizados / Negociación" count={funnel.QUOTED || 0} color="bg-purple-100 text-purple-800 border-purple-200" max={totalLeads} />
                    <FunnelStage label="Citas / Visitas Realizadas" count={funnel.VISITED || 0} color="bg-indigo-100 text-indigo-800 border-indigo-200" max={totalLeads} />
                    <FunnelStage label="Ganados" count={funnel.WON || 0} color="bg-emerald-100 text-emerald-800 border-emerald-200" max={totalLeads} />
                </div>
            </div>
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
