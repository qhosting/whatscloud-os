import React, { useState } from 'react';
import { UserRole } from '../types';
import { 
  Radio, 
  MessageSquare, 
  Plus, 
  Settings, 
  CheckCircle2, 
  AlertCircle, 
  RefreshCw,
  QrCode,
  Smartphone,
  Lock,
  Phone,
  Server,
  Save
} from 'lucide-react';
import { WahaConnectionCard } from './WahaConnectionCard';

interface ConnectionsModuleProps {
  onLinkExtension?: (extension: string) => void;
  currentExtension?: string;
  role: UserRole;
}

export const ConnectionsModule: React.FC<ConnectionsModuleProps> = ({ onLinkExtension, currentExtension, role }) => {
  // RBAC
  const canManage = role === 'SUPER_ADMIN' || role === 'ACCOUNT_OWNER';

  // STATE: PBX
  const [pbxExt, setPbxExt] = useState(currentExtension || '');
  const [isSavingExt, setIsSavingExt] = useState(false);

  const handleSaveExtension = () => {
      if(!onLinkExtension) return;
      setIsSavingExt(true);
      setTimeout(() => {
          onLinkExtension(pbxExt);
          setIsSavingExt(false);
      }, 1000);
  };

  return (
    <div className="max-w-5xl mx-auto animate-in fade-in duration-300 pb-12">
      
      {/* HEADER */}
      <div className="flex justify-between items-end mb-8">
        <div>
           <h1 className="text-3xl font-bold text-slate-800 mb-2">
              Panel de <span className="text-transparent bg-clip-text bg-wc-gradient">Conexiones</span>
           </h1>
           <p className="text-slate-500 text-lg">
             Centraliza tu mensajería (WhatsApp) y telefonía (Issabel PBX).
           </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* LEFT COLUMN: WHATSAPP/WAHA (2/3 width) */}
          <div className="lg:col-span-2 space-y-6">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="font-black text-slate-800 flex items-center gap-2 text-xl tracking-tight">
                        <MessageSquare className="text-green-500" /> WhatsApp <span className="text-green-500 text-sm font-black uppercase tracking-widest pl-2">Engine</span>
                    </h3>
                </div>

                {/* WAHA DIRECT CONNECTION */}
                {canManage && (
                     <WahaConnectionCard />
                )}
          </div>

          {/* RIGHT COLUMN: ISSABEL PBX (1/3 width) */}
          <div className="lg:col-span-1">
             <div className="bg-slate-900 text-white p-6 rounded-2xl shadow-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-10">
                    <Server size={120} />
                </div>
                
                <h3 className="font-bold text-lg mb-4 flex items-center gap-2 relative z-10">
                    <Phone className="text-amber-500" /> Issabel PBX
                </h3>
                
                <p className="text-xs text-slate-400 mb-6 relative z-10 leading-relaxed">
                    Vincula tu extensión SIP para habilitar las funciones de <strong>Click-to-Call</strong> y <strong>Campañas de Voz</strong> desde WhatsCloud.
                </p>

                <div className="space-y-4 relative z-10">
                    <div>
                        <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Tu Extensión SIP</label>
                        <div className="flex items-center gap-2">
                             <input 
                                type="text" 
                                value={pbxExt}
                                onChange={(e) => setPbxExt(e.target.value)}
                                placeholder="Ej: 101"
                                disabled={!canManage}
                                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white font-mono text-center focus:border-amber-500 outline-none"
                             />
                        </div>
                    </div>

                    <div className="bg-slate-800/50 p-3 rounded-lg border border-slate-700">
                        <div className="flex justify-between items-center text-xs mb-1">
                            <span className="text-slate-400">Estado Conexión</span>
                            <span className="text-green-400 font-bold flex items-center gap-1"><CheckCircle2 size={10} /> Online</span>
                        </div>
                        <div className="flex justify-between items-center text-xs">
                            <span className="text-slate-400">Contexto</span>
                            <span className="text-white font-mono">from-internal</span>
                        </div>
                    </div>

                    {canManage && (
                        <button 
                         onClick={handleSaveExtension}
                         className="w-full py-2 bg-amber-600 hover:bg-amber-500 text-white text-sm font-bold rounded-lg shadow-lg shadow-amber-900/20 transition-all flex items-center justify-center gap-2"
                        >
                            {isSavingExt ? <RefreshCw size={14} className="animate-spin" /> : <Save size={14} />}
                            {isSavingExt ? 'Vinculando...' : 'Guardar Extensión'}
                        </button>
                    )}
                </div>
             </div>
          </div>

      </div>
    </div>
  );
};