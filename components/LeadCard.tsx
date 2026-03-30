import React, { useState } from 'react';
import { Lead } from '../types';
import { MapPin, Phone, Mail, Building2, CheckCircle, Star, ExternalLink, BrainCircuit, Loader2, PhoneCall, Facebook, Instagram, Linkedin, Globe, Zap, Calendar, AlertCircle, Edit3, Clock } from 'lucide-react';
import { accService } from '../services/accService';

interface LeadCardProps {
  lead: Lead;
  onSelect?: (id: string) => void;
  selected?: boolean;
  onAnalyze?: (lead: Lead) => Promise<void>;
  onCall?: (lead: Lead) => Promise<void>; 
  onUpdate?: (lead: Lead) => void; // Callback after update
}

export const LeadCard: React.FC<LeadCardProps> = ({ lead, onSelect, selected, onAnalyze, onCall, onUpdate }) => {
  const [analyzing, setAnalyzing] = useState(false);
  const [calling, setCalling] = useState(false);
  const [updating, setUpdating] = useState(false);

  const handleAnalysis = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!onAnalyze) return;
    setAnalyzing(true);
    await onAnalyze(lead);
    setAnalyzing(false);
  };

  const handleCall = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!onCall) return;
    
    if (confirm(`¿Iniciar llamada a ${lead.businessName} (${lead.phone}) vía Issabel PBX?`)) {
        setCalling(true);
        await onCall(lead);
        setTimeout(() => setCalling(false), 2000); 
    }
  };

  const handleCRMUpdate = async (e: React.MouseEvent) => {
      e.stopPropagation();

      const newNotes = prompt(`Acerca de ${lead.businessName}:\n\nDescribe la tarea, acción o nota inicial para el CRM:`, lead.notes || "Contactar para ofrecer servicios");
      if (!newNotes) return;

      const followDateStr = prompt("Fecha programada para la tarea (AAAA-MM-DD):", new Date().toISOString().split('T')[0]);

      setUpdating(true);
      try {
          // 1. Crear Tarea en CRM
          await accService.createCrmTask({
              title: `Seguimiento: ${lead.businessName}`,
              type: 'CALL',
              description: newNotes,
              dueDate: followDateStr ? new Date(followDateStr).toISOString() : new Date().toISOString(),
              leadId: lead.id
          });

          // 2. Actualizar estado del Lead para denotar que fue transferido
          const updatedTargetStatus = 'CONTACTED';
          await accService.updateLead(lead.id, {
              status: updatedTargetStatus,
              notes: newNotes,
              followUpDate: followDateStr ? new Date(followDateStr).toISOString() : null
          });
          
          if (onUpdate) {
             lead.status = updatedTargetStatus;
             lead.notes = newNotes;
             onUpdate(lead);
          }
          
          alert("¡Lead transferido exitosamente a CRM y Tareas!");
      } catch (err) {
          alert("Error al transferir al CRM");
      } finally {
          setUpdating(false);
      }
  };

  const isExpired = lead.followUpDate ? new Date(lead.followUpDate) < new Date() : false;

  return (
    <div 
      className={`
        relative p-3 md:p-4 rounded-xl border-2 transition-all duration-200 cursor-pointer group flex flex-col justify-between h-full
        ${selected 
          ? 'border-wc-blue bg-blue-50/50 shadow-md' 
          : 'border-slate-100 bg-white hover:border-wc-blue/30 hover:shadow-sm'
        }
      `}
      onClick={() => onSelect && onSelect(lead.id)}
    >
      <div>
        <div className="flex justify-between items-start mb-3">
            <div className="flex items-center gap-3">
            <div className={`p-2.5 rounded-xl ${selected ? 'bg-wc-blue text-white' : 'bg-slate-100 text-wc-purple'}`}>
                <Building2 size={20} />
            </div>
            <div>
                <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-slate-800 leading-tight text-sm truncate max-w-[150px]">{lead.businessName}</h3>
                    {lead.aiScore && (
                        <div className="flex items-center gap-1.5">
                            <div 
                            className={`text-[10px] font-black px-1.5 py-0.5 rounded shadow-sm border ${
                                lead.aiScore >= 80 ? 'bg-emerald-500 text-white border-emerald-600' : 
                                lead.aiScore >= 50 ? 'bg-yellow-400 text-black border-yellow-500' : 
                                'bg-slate-200 text-slate-600 border-slate-300'
                            }`}
                            title="Calificación de Calidad IA"
                            >
                                {lead.aiScore}%
                            </div>
                        </div>
                    )}
                </div>
                
                <div className="flex items-center gap-2 mt-1">
                <span className={`text-[9px] font-black px-2 py-0.5 rounded border uppercase tracking-wider ${
                    lead.status === 'WON' ? 'bg-emerald-100 text-emerald-700 border-emerald-200' :
                    lead.status === 'LOST' ? 'bg-red-100 text-red-700 border-red-200' :
                    lead.status === 'NEW' ? 'bg-blue-100 text-blue-700 border-blue-200' :
                    lead.status === 'CONTACTED' ? 'bg-purple-100 text-purple-700 border-purple-200' :
                    'bg-slate-100 text-slate-600 border-slate-200'
                }`}>
                    {lead.status === 'CONTACTED' ? 'EN CRM' : lead.status}
                </span>
                {lead.priority === 'HIGH' && (
                    <span className="flex items-center gap-0.5 text-[9px] font-bold text-red-600 bg-red-50 px-1.5 py-0.5 rounded border border-red-100 uppercase animate-pulse">
                        <AlertCircle size={10} /> Alta Prioridad
                    </span>
                )}
                </div>
            </div>
            </div>
            {selected && <CheckCircle className="text-wc-blue animate-in zoom-in" size={24} />}
        </div>

        <div className="space-y-1.5 md:space-y-2.5 text-sm text-slate-600 mt-3 md:mt-4">
            <div className="flex items-start gap-3">
            <MapPin size={16} className="text-wc-green shrink-0 mt-0.5" />
            <span className="truncate leading-tight text-xs">{lead.address}</span>
            </div>
            
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <Phone size={16} className="text-wc-blue shrink-0" />
                    <span className="font-mono text-xs text-slate-700">{lead.phone}</span>
                </div>
                {onCall && (
                    <button 
                        onClick={handleCall}
                        disabled={calling}
                        className={`
                            p-2.5 min-w-[44px] min-h-[44px] rounded-full transition-colors flex items-center justify-center
                            ${calling ? 'bg-green-500 text-white animate-pulse' : 'bg-slate-100 text-slate-500 hover:bg-green-100 hover:text-green-600'}
                        `}
                        title="Llamar vía Issabel PBX"
                    >
                        {calling ? <Loader2 size={16} className="animate-spin" /> : <PhoneCall size={16} />}
                    </button>
                )}
            </div>

            {lead.followUpDate && (
                <div className={`flex items-center gap-3 p-2 rounded-lg border ${isExpired ? 'bg-red-50 text-red-600 border-red-100' : 'bg-amber-50 text-amber-700 border-amber-100 animate-pulse'}`}>
                    <Calendar size={14} />
                    <div className="flex flex-col">
                        <span className="text-[10px] uppercase font-black">Recordatorio</span>
                        <span className="text-xs font-bold">{new Date(lead.followUpDate).toLocaleDateString()}</span>
                    </div>
                    {isExpired && <span className="ml-auto text-[10px] font-black uppercase">Vencido</span>}
                </div>
            )}
            
            {lead.notes && (
                <div className="bg-slate-50 p-2 rounded border border-slate-100 text-[11px] text-slate-500 line-clamp-2 italic">
                    <Edit3 size={10} className="inline mr-1" /> {lead.notes}
                </div>
            )}
        </div>
      </div>

      <div className="mt-3 pt-3 border-t border-slate-100">
          {(lead.aiSummary || lead.analysis) ? (
              <div className="bg-purple-50 p-2.5 rounded-lg border border-purple-100 mb-2">
                  <div className="flex items-center gap-2 text-[10px] font-bold text-purple-600 mb-1 uppercase tracking-wide">
                      <BrainCircuit size={12} /> Estrategia IA
                  </div>
                  <p className="text-[11px] text-slate-700 italic leading-snug line-clamp-2">"{lead.aiSummary || lead.analysis}"</p>
              </div>
          ) : (
            onAnalyze && (
                <button 
                onClick={handleAnalysis}
                disabled={analyzing}
                className="w-full py-2.5 min-h-[44px] mb-2 text-xs font-medium text-purple-600 bg-white border border-purple-200 rounded-lg hover:bg-purple-50 flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
                >
                    {analyzing ? <Loader2 size={14} className="animate-spin" /> : <BrainCircuit size={14} />}
                    {analyzing ? "Analizando..." : "Analizar Estrategia"}
                </button>
            )
          )}

          <div className="flex gap-2">
            {lead.status === 'NEW' ? (
                <button 
                    onClick={handleCRMUpdate}
                    disabled={updating}
                    className="flex-1 flex items-center justify-center gap-2 py-2.5 min-h-[44px] text-xs font-bold bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors shadow-lg shadow-black/10"
                >
                    {updating ? <Loader2 size={14} className="animate-spin" /> : <Clock size={14} />}
                    Pasar a CRM
                </button>
            ) : (
                <div className="flex-1 flex items-center justify-center gap-2 py-2.5 min-h-[44px] text-xs font-bold bg-emerald-50 text-emerald-600 border border-emerald-200 rounded-lg">
                    <CheckCircle size={14} /> En CRM y Tareas
                </div>
            )}
            {lead.mapsUrl && (
                <a 
                    href={lead.mapsUrl} 
                    target="_blank" 
                    rel="noreferrer"
                    onClick={(e) => e.stopPropagation()} 
                    className="p-2.5 min-w-[44px] min-h-[44px] flex items-center justify-center bg-slate-100 text-slate-400 hover:text-wc-blue rounded-lg transition-colors"
                    title="Ver en Google Maps"
                >
                    <ExternalLink size={16} />
                </a>
            )}
          </div>
      </div>
    </div>
  );
};