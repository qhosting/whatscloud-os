import React, { useState, useEffect } from 'react';
import { Calendar, Clock, CheckCircle, AlertCircle, Phone, MessageSquare, MapPin, Plus } from 'lucide-react';
import { accService } from '../../services/accService';
import { NewLeadModal } from './NewLeadModal';

interface CrmTask {
    id: string;
    title: string;
    type: 'CALL' | 'VISIT' | 'QUOTE' | 'MESSAGE' | 'MEETING' | 'OTHER';
    dueDate: string;
    status: 'PENDING' | 'COMPLETED' | 'CANCELLED';
    Lead: { businessName: string; phone: string };
    agent: { name: string };
}

export const MobileAgenda = () => {
    const [tasks, setTasks] = useState<CrmTask[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);

    useEffect(() => {
        loadAgenda();
    }, []);

    const loadAgenda = async () => {
        try {
            setLoading(true);
            const data = await accService.getMyAgenda();
            setTasks(data);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const handleComplete = async (taskId: string) => {
        try {
            // Optimistic update
            setTasks(tasks.map(t => t.id === taskId ? { ...t, status: 'COMPLETED' } : t));
            await accService.updateCrmTask(taskId, { status: 'COMPLETED' });
        } catch (e) {
            console.error("Error completing task", e);
            loadAgenda(); // revert
        }
    };

    const getTaskIcon = (type: string) => {
        switch (type) {
            case 'CALL': return <Phone size={18} />;
            case 'VISIT': return <MapPin size={18} />;
            case 'MESSAGE': return <MessageSquare size={18} />;
            default: return <Clock size={18} />;
        }
    };

    const isOverdue = (dateString: string) => new Date(dateString) < new Date();

    const pendingTasks = tasks.filter(t => t.status === 'PENDING');
    const completedTasks = tasks.filter(t => t.status === 'COMPLETED');

    if (loading) return <div className="flex h-full items-center justify-center p-8"><div className="animate-spin rounded-full h-8 w-8 border-4 border-wc-blue border-t-transparent"></div></div>;

    return (
        <div className="flex flex-col h-full bg-slate-50 overflow-y-auto pb-24 md:pb-6">
            <div className="bg-white p-4 border-b border-slate-200 sticky top-0 z-10">
                <h1 className="text-xl font-black text-slate-800 tracking-tight flex items-center gap-2">
                    <Calendar className="text-wc-blue" /> Mi Agenda
                </h1>
                <p className="text-xs font-medium text-slate-500 mt-1">
                    Tienes {pendingTasks.length} seguimientos pendientes
                </p>
            </div>

            <div className="p-4 flex flex-col gap-3">
                {pendingTasks.map(task => (
                    <div 
                        key={task.id} 
                        className={`
                            bg-white p-4 rounded-xl border-l-4 shadow-sm flex flex-col gap-3 relative overflow-hidden transition-all
                            ${isOverdue(task.dueDate) ? 'border-red-500' : 'border-wc-blue'}
                        `}
                    >
                        {isOverdue(task.dueDate) && (
                            <div className="absolute top-0 right-0 bg-red-500 text-white text-[9px] font-bold px-2 py-0.5 rounded-bl-lg uppercase tracking-wider">
                                Vencido
                            </div>
                        )}
                        <div className="flex justify-between items-start pt-1">
                            <div>
                                <h3 className="font-bold text-slate-800 text-base leading-tight">
                                    {task.Lead?.businessName || 'Cliente sin nombre'}
                                </h3>
                                <p className="text-xs font-mono text-slate-500 mt-0.5">{task.Lead?.phone}</p>
                            </div>
                            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-slate-100 text-slate-600">
                                {getTaskIcon(task.type)}
                            </div>
                        </div>
                        
                        <div>
                            <p className="text-sm font-semibold text-slate-700">{task.title}</p>
                            <p className={`text-xs mt-1 font-medium flex items-center gap-1 ${isOverdue(task.dueDate) ? 'text-red-600' : 'text-slate-500'}`}>
                                <Clock size={12} />
                                {new Date(task.dueDate).toLocaleString()}
                            </p>
                        </div>

                        <div className="mt-2 flex gap-2">
                            <button 
                                onClick={() => handleComplete(task.id)}
                                className="flex-1 min-h-[48px] bg-wc-gradient text-white rounded-xl text-sm font-bold flex items-center justify-center gap-2 shadow-md shadow-wc-blue/20 active:scale-95 transition-transform"
                            >
                                <CheckCircle size={16} /> Marcar Hecho
                            </button>
                            {task.Lead?.phone && (
                                <a 
                                    href={`tel:${task.Lead.phone}`}
                                    className="min-h-[48px] min-w-[48px] bg-slate-100 text-slate-600 hover:text-green-600 rounded-xl flex items-center justify-center active:scale-95 transition-transform"
                                >
                                    <Phone size={18} />
                                </a>
                            )}
                        </div>
                    </div>
                ))}

                {pendingTasks.length === 0 && (
                    <div className="py-12 text-center text-slate-400 flex flex-col items-center">
                        <CheckCircle size={48} className="text-slate-300 mb-4" />
                        <h3 className="text-lg font-bold text-slate-600">¡Todo al día!</h3>
                        <p className="text-sm">No tienes seguimientos pendientes.</p>
                    </div>
                )}
            </div>
            
            {completedTasks.length > 0 && (
                <div className="pt-4 px-4">
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Completados Hoy</h3>
                    <div className="flex flex-col gap-2 opacity-60">
                         {completedTasks.map(t => (
                             <div key={t.id} className="bg-white p-3 rounded-lg border border-slate-200 flex justify-between items-center text-sm">
                                 <span className="line-through">{t.title} - {t.Lead?.businessName}</span>
                                 <CheckCircle size={16} className="text-green-500" />
                             </div>
                         ))}
                    </div>
                </div>
            )}

            {/* FAB - Nuevo Lead */}
            <button 
                onClick={() => setIsModalOpen(true)}
                className="fixed bottom-24 md:bottom-10 right-6 w-14 h-14 bg-wc-gradient text-white rounded-full shadow-xl shadow-wc-blue/40 flex items-center justify-center hover:scale-105 active:scale-95 transition-all z-30"
            >
                <Plus size={28} />
            </button>

            <NewLeadModal 
                isOpen={isModalOpen} 
                onClose={() => setIsModalOpen(false)} 
                onSuccess={() => loadAgenda()} 
            />
        </div>
    );
};
