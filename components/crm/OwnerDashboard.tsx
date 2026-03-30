import React, { useState, useEffect, useRef } from 'react';
import {
    PieChart, Users, PhoneCall, TrendingUp, Landmark, XCircle,
    Plus, Search, Trash2, ExternalLink, Bot, ChevronDown,
    ChevronUp, MessageSquare, CheckCircle2, Star, Eye,
    MoreHorizontal, RefreshCw, Award
} from 'lucide-react';
import { accService } from '../../services/accService';
import { NewLeadModal } from './NewLeadModal';

// ─── Types ────────────────────────────────────────────────────────────────────
type LeadStatus = 'NEW' | 'CONTACTED' | 'QUOTED' | 'VISITED' | 'WON' | 'LOST';

interface StatusConfig {
    label: string;
    color: string;
    bg: string;
    border: string;
    dot: string;
}

// ─── Constants ────────────────────────────────────────────────────────────────
const STATUS_CONFIG: Record<LeadStatus, StatusConfig> = {
    NEW:       { label: 'Nuevo',      color: 'text-blue-700',   bg: 'bg-blue-50',    border: 'border-blue-200',   dot: 'bg-blue-500'   },
    CONTACTED: { label: 'Contactado', color: 'text-amber-700',  bg: 'bg-amber-50',   border: 'border-amber-200',  dot: 'bg-amber-500'  },
    QUOTED:    { label: 'Cotizado',   color: 'text-purple-700', bg: 'bg-purple-50',  border: 'border-purple-200', dot: 'bg-purple-500' },
    VISITED:   { label: 'Cita/Visita',color: 'text-indigo-700', bg: 'bg-indigo-50',  border: 'border-indigo-200', dot: 'bg-indigo-500' },
    WON:       { label: 'Ganado',     color: 'text-emerald-700',bg: 'bg-emerald-50', border: 'border-emerald-200',dot: 'bg-emerald-500'},
    LOST:      { label: 'Perdido',    color: 'text-red-700',    bg: 'bg-red-50',     border: 'border-red-200',    dot: 'bg-red-500'    },
};

const ALL_STATUSES: LeadStatus[] = ['NEW', 'CONTACTED', 'QUOTED', 'VISITED', 'WON', 'LOST'];

// ─── StatusBadge ──────────────────────────────────────────────────────────────
const StatusBadge: React.FC<{ status: LeadStatus }> = ({ status }) => {
    const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.NEW;
    return (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black border ${cfg.bg} ${cfg.color} ${cfg.border}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
            {cfg.label}
        </span>
    );
};

// ─── StatusDropdown ───────────────────────────────────────────────────────────
const StatusDropdown: React.FC<{
    current: LeadStatus;
    onChange: (s: LeadStatus) => void;
    loading?: boolean;
}> = ({ current, onChange, loading }) => {
    const [open, setOpen] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    return (
        <div ref={ref} className="relative">
            <button
                onClick={() => setOpen(o => !o)}
                disabled={loading}
                className="flex items-center gap-1 px-2 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 transition-all text-slate-600 disabled:opacity-50"
                title="Cambiar etapa"
            >
                {loading
                    ? <RefreshCw size={12} className="animate-spin" />
                    : <><ChevronDown size={12} /><span className="text-[10px] font-bold">Etapa</span></>
                }
            </button>
            {open && (
                <div className="absolute right-0 top-8 z-50 w-40 bg-white rounded-xl shadow-xl border border-slate-100 overflow-hidden">
                    {ALL_STATUSES.map(s => {
                        const cfg = STATUS_CONFIG[s];
                        return (
                            <button
                                key={s}
                                onClick={() => { onChange(s); setOpen(false); }}
                                className={`w-full flex items-center gap-2 px-3 py-2 text-xs font-bold transition-colors hover:bg-slate-50 ${s === current ? cfg.color + ' ' + cfg.bg : 'text-slate-600'}`}
                            >
                                <span className={`w-2 h-2 rounded-full ${cfg.dot}`} />
                                {cfg.label}
                            </button>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

// ─── FunnelStage ──────────────────────────────────────────────────────────────
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

// ─── Main Component ───────────────────────────────────────────────────────────
export const OwnerDashboard: React.FC<{ onProfileUpdate?: () => void }> = ({ onProfileUpdate }) => {
    const [stats, setStats] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Lead list state
    const [leads, setLeads] = useState<any[]>([]);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [searchTerm, setSearchTerm] = useState('');
    const [activeFilter, setActiveFilter] = useState<LeadStatus | 'ALL'>('ALL');
    const [updatingLeadId, setUpdatingLeadId] = useState<string | null>(null);

    useEffect(() => { loadAll(); }, []);
    useEffect(() => { loadLeads(); }, [page, searchTerm]);

    const loadAll = async () => {
        try {
            setError(null);
            // Ya no cargamos métricas globales aquí para optimizar vista
            setStats({}); 
        } catch (e: any) {
            setError(e.message || 'Error de conexión');
        } finally {
            setLoading(false);
        }
    };

    const loadLeads = async () => {
        try {
            const data = await accService.getLeads(page, 15, searchTerm);
            setLeads(data.leads || []);
            setTotalPages(data.pages || 1);
        } catch (e: any) {
            console.error(e);
        }
    };

    const handleDeleteLead = async (id: string) => {
        if (!window.confirm('¿Seguro que deseas eliminar este prospecto?')) return;
        try {
            await accService.deleteLead(id);
            loadLeads();
            loadAll();
        } catch (e: any) {
            alert('Error al eliminar: ' + e.message);
        }
    };

    const handleStatusChange = async (leadId: string, newStatus: LeadStatus) => {
        setUpdatingLeadId(leadId);
        try {
            await accService.updateLead(leadId, { status: newStatus });
            setLeads(prev => prev.map(l => l.id === leadId ? { ...l, status: newStatus } : l));
        } catch (e: any) {
            alert('Error al actualizar estado: ' + e.message);
        } finally {
            setUpdatingLeadId(null);
        }
    };

    // ── Filtered leads ──
    const filteredLeads = activeFilter === 'ALL'
        ? leads
        : leads.filter(l => (l.status || 'NEW') === activeFilter);

    // ── Loading / Error states ──
    if (loading) return (
        <div className="flex h-full items-center justify-center">
            <div className="flex flex-col items-center gap-3">
                <div className="animate-spin rounded-full h-10 w-10 border-4 border-wc-blue border-t-transparent" />
                <p className="text-sm font-bold text-slate-400">Cargando dashboard...</p>
            </div>
        </div>
    );

    if (error) return (
        <div className="flex flex-col h-full items-center justify-center p-8 text-center gap-4">
            <XCircle size={48} className="text-red-400" />
            <div>
                <h3 className="text-xl font-bold text-slate-800">Error al cargar listado</h3>
                <p className="text-sm text-slate-500 mt-1">{error || 'Sin respuesta del servidor'}</p>
            </div>
            <button onClick={loadLeads} className="px-6 py-2 bg-wc-blue text-white rounded-lg font-bold shadow-md hover:bg-blue-600 transition-colors flex items-center gap-2">
                <RefreshCw size={14} /> Reintentar
            </button>
        </div>
    );

    return (
        <div className="flex flex-col h-full bg-[#f4f6f9] overflow-y-auto">
            {/* ── HEADER ── */}
            <div className="sticky top-[3.5rem] md:top-0 z-20 bg-white border-b border-slate-200 px-4 md:px-6 py-3 md:py-4 flex items-center justify-between shadow-sm">
                <div className="flex items-center gap-2 md:gap-3">
                    <div className="w-8 h-8 md:w-9 md:h-9 rounded-xl bg-wc-gradient flex items-center justify-center shadow-md">
                        <TrendingUp size={16} className="text-white md:w-[18px] md:h-[18px]" />
                    </div>
                    <div>
                        <h1 className="text-sm md:text-base font-black text-slate-800 leading-tight">CRM Sales Dashboard</h1>
                        <p className="text-[9px] md:text-[10px] font-semibold text-slate-400 uppercase tracking-widest hidden sm:block">Gestión de Prospectos y Pipeline</p>
                    </div>
                </div>
                <div className="flex items-center gap-2 md:gap-3">
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="bg-wc-gradient text-white px-3 md:px-4 py-1.5 md:py-2 rounded-xl text-[10px] md:text-xs font-black shadow-md hover:shadow-lg transition-all flex items-center gap-1 md:gap-2 active:scale-95"
                    >
                        <Plus size={14} /> <span className="hidden sm:inline">Nuevo Prospecto</span><span className="sm:hidden">Nuevo</span>
                    </button>
                </div>
            </div>

            <div className="p-3 md:p-5 flex flex-col h-full">
                {/* ── GESTIÓN DE PROSPECTOS ── */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                    {/* Section header */}
                    <div className="px-4 md:px-6 pt-4 md:pt-5 pb-3 md:pb-4 border-b border-slate-100">
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3 md:gap-4">
                            <div>
                                <h3 className="text-sm md:text-base font-black text-slate-800 flex items-center gap-2">
                                    <Users size={16} className="text-wc-blue md:w-[18px]" /> Gestión de Prospectos
                                </h3>
                                <p className="text-[10px] md:text-[11px] font-semibold text-slate-400 mt-0.5">
                                    {filteredLeads.length} prospecto{filteredLeads.length !== 1 ? 's' : ''} {activeFilter !== 'ALL' ? `en etapa "${STATUS_CONFIG[activeFilter]?.label}"` : 'en total'}
                                </p>
                            </div>
                            {/* Search */}
                            <div className="relative w-full md:w-64">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                                <input
                                    type="text"
                                    placeholder="Buscar por nombre o nicho..."
                                    className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:border-wc-blue transition-all font-medium"
                                    value={searchTerm}
                                    onChange={e => { setSearchTerm(e.target.value); setPage(1); }}
                                />
                            </div>
                        </div>

                        {/* Stage filter tabs */}
                        <div className="flex flex-wrap gap-1.5 md:gap-2 mt-3 md:mt-4">
                            <button
                                onClick={() => setActiveFilter('ALL')}
                                className={`px-2 md:px-3 py-1 rounded-lg text-[10px] md:text-[11px] font-black transition-all border ${activeFilter === 'ALL' ? 'bg-slate-900 text-white border-slate-900' : 'bg-slate-50 text-slate-500 border-slate-200 hover:bg-slate-100'}`}
                            >
                                Todos ({leads.length})
                            </button>
                            {ALL_STATUSES.map(s => {
                                const cfg = STATUS_CONFIG[s];
                                const cnt = leads.filter(l => (l.status || 'NEW') === s).length;
                                return (
                                    <button
                                        key={s}
                                        onClick={() => setActiveFilter(s)}
                                        className={`px-2 md:px-3 py-1 rounded-lg text-[10px] md:text-[11px] font-black transition-all border flex items-center gap-1 md:gap-1.5 ${activeFilter === s ? `${cfg.bg} ${cfg.color} ${cfg.border}` : 'bg-slate-50 text-slate-500 border-slate-200 hover:bg-slate-100'}`}
                                    >
                                        <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
                                        {cfg.label} ({cnt})
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Table */}
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse min-w-[700px]">
                            <thead>
                                <tr className="bg-slate-50/80 border-b border-slate-100">
                                    <th className="px-5 py-3 text-[10px] font-black uppercase text-slate-400 tracking-wider">Prospecto</th>
                                    <th className="px-5 py-3 text-[10px] font-black uppercase text-slate-400 tracking-wider">Teléfono</th>
                                    <th className="px-5 py-3 text-[10px] font-black uppercase text-slate-400 tracking-wider">Nicho / Ciudad</th>
                                    <th className="px-5 py-3 text-[10px] font-black uppercase text-slate-400 tracking-wider text-center">AI Score</th>
                                    <th className="px-5 py-3 text-[10px] font-black uppercase text-slate-400 tracking-wider">Etapa</th>
                                    <th className="px-5 py-3 text-[10px] font-black uppercase text-slate-400 tracking-wider text-right">Acciones</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {filteredLeads.map(lead => {
                                    const status = (lead.status || 'NEW') as LeadStatus;
                                    const isUpdating = updatingLeadId === lead.id;
                                    return (
                                        <tr key={lead.id} className="hover:bg-blue-50/30 transition-colors group">
                                            <td className="px-5 py-3.5">
                                                <div className="font-bold text-slate-700 text-sm leading-tight">{lead.businessName || '—'}</div>
                                                <div className="text-[10px] text-slate-400 font-medium mt-0.5">
                                                    Captado: {new Date(lead.createdAt).toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' })}
                                                </div>
                                            </td>
                                            <td className="px-5 py-3.5">
                                                <span className="font-mono text-xs text-slate-600 bg-slate-50 px-2 py-1 rounded-lg border border-slate-100">
                                                    {lead.phone || '—'}
                                                </span>
                                            </td>
                                            <td className="px-5 py-3.5">
                                                <div className="text-xs font-bold text-slate-600">{lead.niche || '—'}</div>
                                                <div className="text-[10px] text-slate-400 uppercase font-medium">{lead.city || '—'}</div>
                                            </td>
                                            <td className="px-5 py-3.5 text-center">
                                                <div className="inline-flex flex-col items-center gap-0.5">
                                                    <span className={`px-2.5 py-1 rounded-full text-[11px] font-black ${(lead.aiScore || 0) >= 70 ? 'bg-emerald-100 text-emerald-700' : (lead.aiScore || 0) >= 40 ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-500'}`}>
                                                        {lead.aiScore || 0}%
                                                    </span>
                                                    {(lead.aiScore || 0) >= 70 && <Star size={10} className="text-amber-400 fill-amber-400" />}
                                                </div>
                                            </td>
                                            <td className="px-5 py-3.5">
                                                <StatusBadge status={status} />
                                            </td>
                                            <td className="px-5 py-3.5">
                                                <div className="flex justify-end items-center gap-1.5">
                                                    <StatusDropdown
                                                        current={status}
                                                        onChange={s => handleStatusChange(lead.id, s)}
                                                        loading={isUpdating}
                                                    />
                                                    <button
                                                        onClick={() => window.open(`https://wa.me/${(lead.phone || '').replace(/\D/g, '')}`, '_blank')}
                                                        className="p-1.5 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition-colors opacity-0 group-hover:opacity-100"
                                                        title="Abrir WhatsApp"
                                                    >
                                                        <MessageSquare size={13} />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteLead(lead.id)}
                                                        className="p-1.5 bg-red-50 text-red-500 rounded-lg hover:bg-red-100 transition-colors opacity-0 group-hover:opacity-100"
                                                        title="Eliminar"
                                                    >
                                                        <Trash2 size={13} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>

                    {/* Empty state */}
                    {filteredLeads.length === 0 && (
                        <div className="py-16 text-center">
                            <Users className="mx-auto mb-3 text-slate-200" size={52} />
                            <p className="text-sm font-bold text-slate-400">No hay prospectos {activeFilter !== 'ALL' ? `en etapa "${STATUS_CONFIG[activeFilter as LeadStatus]?.label}"` : ''}</p>
                            <p className="text-xs text-slate-300 mt-1">
                                {activeFilter !== 'ALL' ? 'Prueba cambiando el filtro de etapa' : 'Agrega tu primer prospecto con el botón "Nuevo Prospecto"'}
                            </p>
                        </div>
                    )}

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="flex justify-between items-center px-6 py-4 border-t border-slate-100 bg-slate-50/50">
                            <span className="text-xs font-bold text-slate-400">Página {page} de {totalPages}</span>
                            <div className="flex gap-2">
                                <button
                                    disabled={page === 1}
                                    onClick={() => setPage(p => p - 1)}
                                    className="px-4 py-1.5 bg-white border border-slate-200 text-slate-600 rounded-xl text-xs font-bold disabled:opacity-30 disabled:cursor-not-allowed hover:bg-slate-50 transition-all shadow-sm"
                                >
                                    ← Anterior
                                </button>
                                <button
                                    disabled={page === totalPages}
                                    onClick={() => setPage(p => p + 1)}
                                    className="px-4 py-1.5 bg-slate-900 text-white rounded-xl text-xs font-bold disabled:opacity-30 disabled:cursor-not-allowed hover:bg-slate-800 transition-all shadow-md active:scale-95"
                                >
                                    Siguiente →
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <NewLeadModal
                isOpen={isModalOpen}
                isAdmin={true}
                onClose={() => setIsModalOpen(false)}
                onSuccess={() => { loadLeads(); loadAll(); }}
            />
        </div>
    );
};
