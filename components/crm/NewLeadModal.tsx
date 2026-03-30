import React, { useState } from 'react';
import { X, UserPlus, Phone, Briefcase, FileText, Loader2, CheckCircle } from 'lucide-react';
import { accService } from '../../services/accService';

interface NewLeadModalProps {
    isOpen: boolean;
    isAdmin?: boolean;
    onClose: () => void;
    onSuccess: (lead: any) => void;
}

export const NewLeadModal: React.FC<NewLeadModalProps> = ({ isOpen, isAdmin, onClose, onSuccess }) => {
    const [formData, setFormData] = useState({
        businessName: '',
        phone: '',
        niche: '',
        notes: '',
        assignedTo: ''
    });
    const [agents, setAgents] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    React.useEffect(() => {
        if (isOpen && isAdmin) {
            accService.getTenantAgents().then(setAgents).catch(console.error);
        }
    }, [isOpen, isAdmin]);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.businessName || !formData.phone) {
            setError('Nombre y teléfono son obligatorios.');
            return;
        }

        try {
            setLoading(true);
            setError('');
            const newLead = await accService.createLead(formData);
            setSuccess(true);
            
            // Auto schedule initial task optionally? No, we just insert the lead.
            // Pero asignamos la tarea al agente seleccionado si es Admin
            await accService.createCrmTask({
                title: 'Primer Contacto (Manual)',
                leadId: newLead.id,
                dueDate: new Date().toISOString(),
                type: 'CALL',
                priority: 'HIGH',
                assignedTo: formData.assignedTo || undefined
            });

            setTimeout(() => {
                setSuccess(false);
                setFormData({ businessName: '', phone: '', niche: '', notes: '' });
                onSuccess(newLead);
                onClose();
            }, 1500);

        } catch (err: any) {
            setError(err.message || 'Error al guardar el prospecto.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden relative">
                
                {/* Header */}
                <div className="bg-slate-50 border-b border-slate-100 p-4 flex justify-between items-center relative">
                    <button 
                        onClick={onClose} 
                        className="absolute right-4 top-4 p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-200 rounded-full transition-colors"
                    >
                        <X size={20} />
                    </button>
                    <h2 className="text-lg font-black text-slate-800 flex items-center gap-2">
                        <UserPlus size={20} className="text-wc-blue" /> Nuevo Prospecto
                    </h2>
                </div>

                {/* Body */}
                <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-4">
                    {error && (
                        <div className="p-3 bg-red-50 border border-red-100 text-red-600 text-xs font-bold rounded-lg text-center">
                            {error}
                        </div>
                    )}

                    {success ? (
                        <div className="py-8 flex flex-col items-center justify-center text-emerald-500 animate-in zoom-in duration-300">
                            <CheckCircle size={64} className="mb-4" />
                            <h3 className="text-xl font-bold text-slate-800">¡Prospecto Guardado!</h3>
                            <p className="text-sm text-slate-500">Añadido a la agenda para contactar hoy.</p>
                        </div>
                    ) : (
                        <>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Empresa / Nombre *</label>
                                <div className="relative">
                                    <UserPlus className="absolute left-3 top-3 text-slate-300" size={16} />
                                    <input 
                                        type="text" 
                                        value={formData.businessName}
                                        onChange={(e) => setFormData({...formData, businessName: e.target.value})}
                                        className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 focus:border-wc-blue focus:ring-2 focus:ring-wc-blue/20 outline-none text-sm transition-all bg-slate-50 focus:bg-white"
                                        placeholder="Ej. Taquería El Paisa"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Teléfono Móvil *</label>
                                <div className="relative">
                                    <Phone className="absolute left-3 top-3 text-slate-300" size={16} />
                                    <input 
                                        type="tel" 
                                        value={formData.phone}
                                        onChange={(e) => setFormData({...formData, phone: e.target.value})}
                                        className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 focus:border-wc-blue focus:ring-2 focus:ring-wc-blue/20 outline-none text-sm transition-all bg-slate-50 focus:bg-white"
                                        placeholder="+52 5500 0000"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Nicho / Giro</label>
                                <div className="relative">
                                    <Briefcase className="absolute left-3 top-3 text-slate-300" size={16} />
                                    <input 
                                        type="text" 
                                        value={formData.niche}
                                        onChange={(e) => setFormData({...formData, niche: e.target.value})}
                                        className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 focus:border-wc-blue focus:ring-2 focus:ring-wc-blue/20 outline-none text-sm transition-all bg-slate-50 focus:bg-white"
                                        placeholder="Alimentos y Bebidas"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Notas Preparativas</label>
                                <div className="relative">
                                    <FileText className="absolute left-3 top-3 text-slate-300" size={16} />
                                    <textarea 
                                        value={formData.notes}
                                        onChange={(e) => setFormData({...formData, notes: e.target.value})}
                                        className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 focus:border-wc-blue focus:ring-2 focus:ring-wc-blue/20 outline-none text-sm transition-all bg-slate-50 focus:bg-white resize-none"
                                        rows={2}
                                        placeholder="Comentarios adicionales..."
                                    />
                                </div>
                            </div>

                            {isAdmin && (
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Asignar a Vendedor</label>
                                    <select 
                                        value={formData.assignedTo}
                                        onChange={(e) => setFormData({...formData, assignedTo: e.target.value})}
                                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-wc-blue focus:ring-2 focus:ring-wc-blue/20 outline-none text-sm transition-all bg-slate-50 focus:bg-white font-bold"
                                    >
                                        <option value="">Yo mismo (Actual)</option>
                                        {agents.map(a => (
                                            <option key={a.id} value={a.id}>{a.name} ({a.email})</option>
                                        ))}
                                    </select>
                                </div>
                            )}

                            <div className="mt-4 flex gap-3">
                                <button
                                    type="button"
                                    onClick={onClose}
                                    className="px-6 py-3 rounded-xl font-bold text-slate-500 bg-slate-100 hover:bg-slate-200 transition-colors w-1/3"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="flex-1 py-3 bg-wc-gradient text-white rounded-xl font-bold text-sm shadow-md shadow-wc-blue/30 active:scale-95 transition-transform flex items-center justify-center gap-2"
                                >
                                    {loading ? <Loader2 size={18} className="animate-spin" /> : <UserPlus size={18} />}
                                    Guardar Lead
                                </button>
                            </div>
                        </>
                    )}
                </form>
            </div>
        </div>
    );
};
