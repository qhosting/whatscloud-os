import React, { useState } from 'react';
import { ChatwootChannel, UserRole } from '../types';
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

interface ConnectionsModuleProps {
  onCreateChannel: (data: { name: string; phoneNumber: string }) => void;
  onLinkExtension?: (extension: string) => void;
  currentExtension?: string;
  role: UserRole;
}

export const ConnectionsModule: React.FC<ConnectionsModuleProps> = ({ onCreateChannel, onLinkExtension, currentExtension, role }) => {
  // RBAC
  const canManage = role === 'SUPER_ADMIN' || role === 'ACCOUNT_OWNER';

  // STATE: CHATWOOT
  const [isCreating, setIsCreating] = useState(false);
  const [channels] = useState<ChatwootChannel[]>([
    {
      id: 'cw_1',
      name: 'Ventas Principal',
      type: 'whatsapp_api',
      identifier: '+525512345678',
      status: 'active',
      webhookStatus: 'healthy'
    }
  ]);

  // STATE: PBX
  const [pbxExt, setPbxExt] = useState(currentExtension || '');
  const [isSavingExt, setIsSavingExt] = useState(false);

  // FORM STATE
  const [newName, setNewName] = useState('');
  const [newPhone, setNewPhone] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName || !newPhone) return;
    onCreateChannel({ name: newName, phoneNumber: newPhone });
    setIsCreating(false);
    setNewName('');
    setNewPhone('');
  };

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
          
          {/* LEFT COLUMN: WHATSAPP/CHATWOOT (2/3 width) */}
          <div className="lg:col-span-2 space-y-6">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="font-bold text-slate-700 flex items-center gap-2">
                        <MessageSquare className="text-green-500" /> WhatsApp API Gateways
                    </h3>
                    {canManage && (
                        <button onClick={() => setIsCreating(true)} className="text-xs bg-wc-gradient text-white px-3 py-1.5 rounded-lg font-bold shadow hover:opacity-90 flex items-center gap-1">
                            <Plus size={14} /> Nuevo
                        </button>
                    )}
                </div>

                {/* CREATE CARD */}
                {isCreating && (
                    <div className="bg-white p-6 rounded-2xl border-2 border-wc-blue shadow-lg relative overflow-hidden animate-in zoom-in-95">
                        <div className="absolute top-0 right-0 bg-wc-blue text-white px-3 py-1 text-xs font-bold rounded-bl-xl">NUEVO</div>
                        <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2"><QrCode className="text-wc-blue" /> Conectar WhatsApp</h3>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Nombre</label>
                                <input type="text" value={newName} onChange={(e) => setNewName(e.target.value)} className="w-full px-4 py-2 rounded-lg border border-slate-200 outline-none text-sm" autoFocus />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Número</label>
                                <input type="text" value={newPhone} onChange={(e) => setNewPhone(e.target.value)} className="w-full px-4 py-2 rounded-lg border border-slate-200 outline-none text-sm font-mono" />
                            </div>
                            <div className="pt-2 flex gap-3">
                                <button type="button" onClick={() => setIsCreating(false)} className="flex-1 py-2 text-slate-500 text-sm font-semibold hover:bg-slate-50 rounded-lg">Cancelar</button>
                                <button type="submit" className="flex-1 py-2 bg-wc-blue text-white text-sm font-bold rounded-lg shadow-md hover:bg-blue-600">Crear Canal</button>
                            </div>
                        </form>
                    </div>
                )}

                {/* CHANNELS LIST */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {channels.map(channel => (
                    <div key={channel.id} className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex justify-between items-start mb-4">
                            <div className="flex items-center gap-3">
                                <div className={`p-2 rounded-xl ${channel.status === 'active' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-500'}`}>
                                    <Smartphone size={20} />
                                </div>
                                <div>
                                    <h3 className="font-bold text-slate-800 text-sm">{channel.name}</h3>
                                    <p className="text-[10px] text-slate-500 font-mono">{channel.identifier}</p>
                                </div>
                            </div>
                            <div className={`w-2 h-2 rounded-full ${channel.status === 'active' ? 'bg-green-500 animate-pulse' : 'bg-red-400'}`}></div>
                        </div>
                        <div className="flex gap-2 opacity-80">
                            {canManage ? (
                                <button className="flex-1 py-1.5 text-[10px] font-bold text-slate-600 border border-slate-200 rounded hover:bg-slate-50">Configurar</button>
                            ) : (
                                <div className="flex-1 py-1.5 text-[10px] text-center bg-slate-50 text-slate-400 rounded"><Lock size={10} className="inline mr-1" /> Locked</div>
                            )}
                        </div>
                    </div>
                    ))}
                </div>
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