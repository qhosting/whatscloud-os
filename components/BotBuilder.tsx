import React, { useState, useEffect, useRef } from 'react';
import { BotConfig, SmartAction, SmartActionType, ChatMessage, UserRole, LongTermMemory } from '../types';
import { geminiService } from '../services/geminiService';
import { 
  Bot, 
  Send, 
  Plus, 
  Image as ImageIcon, 
  List, 
  MousePointer2, 
  Save, 
  Play, 
  Trash2,
  MoreVertical,
  Smartphone,
  BookOpen,
  FileText,
  UploadCloud,
  BrainCircuit,
  Lock,
  Cpu, 
  RefreshCw,
  FormInput,
  Clock,
  UserCheck
} from 'lucide-react';

interface BotBuilderProps {
  onSave: (config: BotConfig) => void;
  role: UserRole;
}

const INITIAL_PROMPT = `Eres el asistente virtual de "Pizza Napoli". 
Tu tono es amable, divertido y profesional.
Ayuda a los clientes a ver el menú, hacer pedidos y consultar horarios.`;

const INITIAL_KB = `HORARIOS:
Lunes a Viernes: 12:00 PM - 10:00 PM
Fines de Semana: 12:00 PM - 12:00 AM

DIRECCIÓN:
Av. Siempre Viva 123, CDMX.

POLÍTICA DE ENVÍOS:
Envío gratis en pedidos mayores a $200 MXN.
Cobertura: 5km a la redonda.`;

export const BotBuilder: React.FC<BotBuilderProps> = ({ onSave, role }) => {
  // RBAC CHECK
  const isReadOnly = role === 'ACCOUNT_AGENT';

  // STATE: CONFIG
  const [activeTab, setActiveTab] = useState<'persona' | 'knowledge' | 'actions'>('persona');
  const [config, setConfig] = useState<BotConfig>({
    systemPrompt: INITIAL_PROMPT,
    knowledgeBase: INITIAL_KB,
    temperature: 0.7,
    actions: []
  });

  // STATE: SIMULATOR
  const [messages, setMessages] = useState<ChatMessage[]>([
    { id: '1', role: 'assistant', text: '¡Hola! Bienvenido a Pizza Napoli 🍕 ¿En qué puedo ayudarte hoy?', timestamp: new Date() }
  ]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // STATE: LONG TERM MEMORY (THE HIPPOCAMPUS)
  const [memory, setMemory] = useState<LongTermMemory>({});
  const [isUpdatingMemory, setIsUpdatingMemory] = useState(false);
  const [showMemoryBank, setShowMemoryBank] = useState(false);

  // STATE: ACTION CREATOR MODAL
  const [isActionModalOpen, setIsActionModalOpen] = useState(false);
  const [newActionType, setNewActionType] = useState<SmartActionType>('button');
  const [newActionName, setNewActionName] = useState('');
  
  // Temp state for creating complex actions
  const [tempButtons, setTempButtons] = useState<string[]>(['', '']); 
  const [tempListRows, setTempListRows] = useState<string[]>(['', '', '']);
  const [tempText, setTempText] = useState('');
  const [tempTitle, setTempTitle] = useState('');
  const [tempNumber, setTempNumber] = useState(0);

  // Persistencia Local (Load)
  useEffect(() => {
    const saved = localStorage.getItem('wc_bot_config');
    const savedMemory = localStorage.getItem('wc_bot_memory');
    if (saved) {
      try {
        setConfig(JSON.parse(saved));
      } catch (e) { console.error("Error loading bot config", e); }
    }
    if (savedMemory) {
        try {
            setMemory(JSON.parse(savedMemory));
        } catch (e) { console.error("Error loading memory", e); }
    }
  }, []);

  // Persistencia Local (Save on Change)
  useEffect(() => {
    localStorage.setItem('wc_bot_config', JSON.stringify(config));
  }, [config]);

  // SCROLL TO BOTTOM
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  // --- LOGIC: CHAT SIMULATOR ---
  const handleSendMessage = async () => {
    if (!inputText.trim()) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      text: inputText,
      timestamp: new Date()
    };

    // 1. Update UI immediately
    const updatedHistory = [...messages, userMsg];
    setMessages(updatedHistory);
    setInputText('');
    setIsTyping(true);

    // 2. Call Gemini Service with HISTORY & MEMORY
    const aiResponse = await geminiService.chatWithBot(messages, userMsg.text, config, memory);
    
    setIsTyping(false);

    let actionTriggered: SmartAction | undefined;
    if (aiResponse.actionTrigger) {
      actionTriggered = config.actions.find(a => a.triggerCode === aiResponse.actionTrigger);
    }

    const botMsg: ChatMessage = {
      id: (Date.now() + 1).toString(),
      role: 'assistant',
      text: aiResponse.text || (actionTriggered ? '' : '...'),
      actionTriggered: actionTriggered,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, botMsg]);

    // 3. TRIGGER MEMORY UPDATE (PROTOCOL 719 31)
    updateHippocampus(userMsg.text, botMsg.text);
  };

  const updateHippocampus = async (userText: string, botText: string) => {
      setIsUpdatingMemory(true);
      try {
          const newMemory = await geminiService.updateLongTermMemory(memory, userText, botText);
          setMemory(newMemory);
          localStorage.setItem('wc_bot_memory', JSON.stringify(newMemory));
      } catch (e) {
          console.error("Memory Sync Failed", e);
      } finally {
          setIsUpdatingMemory(false);
      }
  };

  const handleResetChat = () => {
    setMessages([
        { id: Date.now().toString(), role: 'assistant', text: '¡Hola! (Chat Reiniciado) 🔄', timestamp: new Date() }
    ]);
  };

  const handleWipeMemory = () => {
      if(confirm("¿Borrar toda la memoria a largo plazo del usuario?")) {
          setMemory({});
          localStorage.removeItem('wc_bot_memory');
      }
  };

  // --- LOGIC: ACTION CREATOR ---
  const handleAddAction = () => {
    const id = `ACT_${Date.now()}`;
    const triggerCode = `{{ACTION_${newActionName.toUpperCase().replace(/\s+/g, '_')}}}`;
    
    const newAction: SmartAction = {
      id,
      triggerCode,
      type: newActionType,
      name: newActionName || `Action ${config.actions.length + 1}`,
      content: {
        text: tempText,
        buttons: newActionType === 'button' ? tempButtons.filter(b => b.trim() !== '') : undefined,
        listTitle: newActionType === 'list' ? tempTitle : undefined,
        listRows: newActionType === 'list' ? tempListRows.filter(r => r.trim() !== '') : undefined,
        url: newActionType === 'image' ? tempText : undefined,
        inputPlaceholder: newActionType === 'input' ? tempText : undefined,
        waitSeconds: newActionType === 'wait' ? tempNumber : undefined
      }
    };

    setConfig(prev => ({
      ...prev,
      actions: [...prev.actions, newAction]
    }));

    setIsActionModalOpen(false);
    setNewActionName('');
    setTempText('');
    setTempButtons(['', '']);
    setTempListRows(['', '', '']);
    setTempTitle('');
    setTempNumber(0);
  };

  const deleteAction = (id: string) => {
    if (isReadOnly) return;
    setConfig(prev => ({
      ...prev,
      actions: prev.actions.filter(a => a.id !== id)
    }));
  };

  // --- RENDER HELPERS ---
  const renderChatBubble = (msg: ChatMessage) => {
    const isUser = msg.role === 'user';
    
    if (msg.actionTriggered) {
      const action = msg.actionTriggered;
      return (
        <div key={msg.id} className="flex flex-col gap-1 items-start max-w-[85%]">
           {/* IMAGE RENDERER */}
           {action.type === 'image' && (
             <div className="bg-white p-1 rounded-lg shadow-sm border border-slate-200">
               <img 
                src={action.content.url || 'https://via.placeholder.com/300?text=Image+Catalog'} 
                alt="Bot Content" 
                className="rounded-lg w-48 h-32 object-cover"
               />
               {action.content.text && <p className="text-xs p-2 text-slate-700">{action.content.text}</p>}
             </div>
           )}

           {/* BUTTON RENDERER */}
           {action.type === 'button' && (
             <div className="flex flex-col gap-1 w-full">
               <div className="bg-white p-3 rounded-lg rounded-tl-none shadow-sm text-sm text-slate-800 border border-slate-100">
                 {action.content.text || "Selecciona una opción:"}
               </div>
               <div className="flex flex-col gap-2 mt-1">
                 {action.content.buttons?.map((btn, idx) => (
                   <button key={idx} className="bg-white text-wc-blue font-semibold text-sm py-2 px-4 rounded-lg shadow-sm border border-slate-100 hover:bg-slate-50 transition-colors">
                     {btn}
                   </button>
                 ))}
               </div>
             </div>
           )}

           {/* LIST RENDERER */}
           {action.type === 'list' && (
             <div className="flex flex-col gap-1 w-64">
                <div className="bg-white p-3 rounded-lg rounded-tl-none shadow-sm text-sm text-slate-800 border border-slate-100">
                 {action.content.text || "Abre el menú aquí:"}
               </div>
               <button className="flex items-center justify-between bg-white text-slate-700 text-sm py-2.5 px-4 rounded-lg shadow-sm border border-slate-100 hover:bg-slate-50">
                 <span className="truncate">{action.content.listTitle || "Ver Opciones"}</span>
                 <List size={16} />
               </button>
               <div className="bg-slate-50 rounded-lg p-2 border border-slate-100 text-xs text-slate-400 text-center mt-1">
                 (List opens native OS menu with {action.content.listRows?.length} items)
               </div>
             </div>
           )}

           {/* INPUT RENDERER */}
           {action.type === 'input' && (
               <div className="flex flex-col gap-1 w-full">
                   <div className="bg-white p-3 rounded-lg rounded-tl-none shadow-sm text-sm text-slate-800 border border-slate-100 flex items-center gap-2">
                        <FormInput size={16} className="text-wc-purple" />
                        {action.content.inputPlaceholder || "Por favor, ingresa tus datos..."}
                   </div>
                   <div className="text-[10px] text-center text-slate-400">Waiting for user input...</div>
               </div>
           )}

           {/* WAIT RENDERER */}
           {action.type === 'wait' && (
               <div className="flex items-center gap-2 bg-slate-100 px-3 py-1.5 rounded-full text-xs text-slate-500">
                   <Clock size={12} className="animate-spin" />
                   Esperando {action.content.waitSeconds} segundos...
               </div>
           )}

           {/* HANDOVER RENDERER */}
           {action.type === 'handover' && (
               <div className="bg-amber-50 border border-amber-200 p-3 rounded-lg text-amber-700 text-sm flex items-center gap-2">
                   <UserCheck size={16} />
                   Derivando conversación a un Agente Humano...
               </div>
           )}

           <span className="text-[10px] text-slate-400 mt-1 ml-1">Smart Action triggered via {action.triggerCode}</span>
        </div>
      );
    }

    return (
      <div 
        key={msg.id} 
        className={`
          max-w-[80%] px-4 py-2 rounded-xl text-sm leading-relaxed shadow-sm
          ${isUser 
            ? 'bg-wc-green text-white self-end rounded-tr-none' 
            : 'bg-white text-slate-800 self-start rounded-tl-none border border-slate-100'}
        `}
      >
        {msg.text}
      </div>
    );
  };

  return (
    <div className="flex flex-col lg:flex-row h-[calc(100vh-140px)] gap-6 animate-in fade-in">
      
      {/* LEFT COLUMN: EDITOR */}
      <div className="w-full lg:w-1/2 flex flex-col bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden relative">
        
        {isReadOnly && (
          <div className="absolute top-0 right-0 bg-slate-100 px-3 py-1 rounded-bl-xl border-l border-b border-slate-200 z-10 flex items-center gap-1 text-xs font-bold text-slate-500">
            <Lock size={12} /> READ ONLY MODE
          </div>
        )}

        {/* TABS */}
        <div className="flex border-b border-slate-100">
          <button 
            onClick={() => setActiveTab('persona')}
            className={`flex-1 py-4 text-sm font-semibold flex items-center justify-center gap-2 transition-colors ${activeTab === 'persona' ? 'text-wc-purple border-b-2 border-wc-purple bg-purple-50/50' : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'}`}
          >
            <Bot size={18} />
            Persona
          </button>
          <button 
            onClick={() => setActiveTab('knowledge')}
            className={`flex-1 py-4 text-sm font-semibold flex items-center justify-center gap-2 transition-colors ${activeTab === 'knowledge' ? 'text-wc-green border-b-2 border-wc-green bg-green-50/50' : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'}`}
          >
            <BookOpen size={18} />
            Conocimiento
          </button>
          <button 
            onClick={() => setActiveTab('actions')}
            className={`flex-1 py-4 text-sm font-semibold flex items-center justify-center gap-2 transition-colors ${activeTab === 'actions' ? 'text-wc-blue border-b-2 border-wc-blue bg-blue-50/50' : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'}`}
          >
            <MousePointer2 size={18} />
            Acciones
          </button>
        </div>

        {/* EDITOR CONTENT */}
        <div className="flex-1 p-6 overflow-y-auto">
          
          {/* TAB: PERSONA */}
          {activeTab === 'persona' && (
            <div className="space-y-6">
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-2 uppercase flex items-center gap-2">
                    <BrainCircuit size={14} />
                    System Prompt (Rol del Agente)
                </label>
                <textarea 
                  readOnly={isReadOnly}
                  className="w-full h-64 p-4 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-wc-purple/20 focus:border-wc-purple outline-none leading-relaxed bg-slate-50"
                  value={config.systemPrompt}
                  onChange={(e) => setConfig({...config, systemPrompt: e.target.value})}
                  placeholder="Define quién es tu bot..."
                />
                <p className="mt-2 text-xs text-slate-400">
                  Tip: Define la personalidad y el objetivo principal aquí.
                </p>
              </div>

              <div>
                <div className="flex justify-between mb-2">
                   <label className="block text-xs font-bold text-slate-500 uppercase">Creatividad (Temperatura)</label>
                   <span className="text-xs font-bold text-wc-purple">{config.temperature}</span>
                </div>
                <input 
                  disabled={isReadOnly}
                  type="range" 
                  min="0" max="1" step="0.1"
                  value={config.temperature}
                  onChange={(e) => setConfig({...config, temperature: parseFloat(e.target.value)})}
                  className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-wc-purple"
                />
                <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                  <span>Preciso (Robot)</span>
                  <span>Creativo (Humano)</span>
                </div>
              </div>
            </div>
          )}

          {/* TAB: KNOWLEDGE BASE */}
          {activeTab === 'knowledge' && (
              <div className="space-y-6">
                  <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-xl">
                      <h4 className="text-sm font-bold text-yellow-800 flex items-center gap-2 mb-1">
                          <BookOpen size={16} />
                          Cerebro del Negocio
                      </h4>
                      <p className="text-xs text-yellow-700">
                          Todo lo que escribas aquí será "la verdad absoluta" para el bot. Agrega precios, horarios, menú, FAQs, etc.
                      </p>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-2 uppercase flex items-center gap-2">
                        <FileText size={14} />
                        Datos del Negocio (Texto Libre)
                    </label>
                    <textarea 
                        readOnly={isReadOnly}
                        className="w-full h-64 p-4 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-wc-green/20 focus:border-wc-green outline-none leading-relaxed bg-white font-mono text-slate-600"
                        value={config.knowledgeBase}
                        onChange={(e) => setConfig({...config, knowledgeBase: e.target.value})}
                        placeholder="Ej: La pizza de pepperoni cuesta $150..."
                    />
                  </div>
                  
                  {!isReadOnly && (
                    <div className="border-2 border-dashed border-slate-200 rounded-xl p-6 text-center hover:bg-slate-50 transition-colors cursor-pointer group">
                        <div className="w-12 h-12 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center mx-auto mb-3 group-hover:bg-wc-green/10 group-hover:text-wc-green transition-colors">
                            <UploadCloud size={24} />
                        </div>
                        <h4 className="text-sm font-bold text-slate-700">Subir Documentos (PDF, TXT)</h4>
                        <p className="text-xs text-slate-400 mt-1">Arrastra archivos para extraer texto automáticamente</p>
                        <span className="text-[10px] text-slate-300 mt-2 block">(Funcionalidad simulada para demo)</span>
                    </div>
                  )}
              </div>
          )}

          {/* TAB: ACTIONS */}
          {activeTab === 'actions' && (
            <div className="space-y-4">
               {config.actions.length === 0 ? (
                 <div className="text-center py-12 border-2 border-dashed border-slate-200 rounded-xl bg-slate-50">
                   <p className="text-slate-500 text-sm mb-4">No has creado acciones multimedia aún.</p>
                   {!isReadOnly && (
                     <button onClick={() => setIsActionModalOpen(true)} className="px-4 py-2 bg-white border border-slate-300 rounded-lg text-sm font-semibold hover:border-wc-blue text-slate-700">
                       Crear mi primera acción
                     </button>
                   )}
                 </div>
               ) : (
                 <div className="space-y-3">
                   {config.actions.map(action => (
                     <div key={action.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100 hover:border-wc-blue/30 transition-colors group">
                       <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-lg 
                              ${action.type === 'image' ? 'bg-purple-100 text-purple-600' : 
                                action.type === 'button' ? 'bg-blue-100 text-blue-600' : 
                                action.type === 'list' ? 'bg-green-100 text-green-600' :
                                action.type === 'input' ? 'bg-orange-100 text-orange-600' :
                                action.type === 'wait' ? 'bg-slate-200 text-slate-600' :
                                'bg-amber-100 text-amber-600'
                            }`}>
                            {action.type === 'image' && <ImageIcon size={18} />}
                            {action.type === 'button' && <MousePointer2 size={18} />}
                            {action.type === 'list' && <List size={18} />}
                            {action.type === 'input' && <FormInput size={18} />}
                            {action.type === 'wait' && <Clock size={18} />}
                            {action.type === 'handover' && <UserCheck size={18} />}
                          </div>
                          <div>
                            <h4 className="font-semibold text-sm text-slate-800">{action.name}</h4>
                            <code className="text-[10px] text-slate-500 bg-white px-1.5 py-0.5 rounded border border-slate-200">{action.triggerCode}</code>
                          </div>
                       </div>
                       {!isReadOnly && (
                         <button onClick={() => deleteAction(action.id)} className="text-slate-400 hover:text-red-500 p-2">
                           <Trash2 size={16} />
                         </button>
                       )}
                     </div>
                   ))}
                   {!isReadOnly && (
                    <button 
                      onClick={() => setIsActionModalOpen(true)}
                      className="w-full py-3 border-2 border-dashed border-slate-200 rounded-xl text-slate-500 text-sm font-medium hover:border-wc-blue hover:text-wc-blue transition-colors flex items-center justify-center gap-2"
                    >
                      <Plus size={16} /> Crear Nueva Acción
                    </button>
                   )}
                 </div>
               )}
            </div>
          )}

        </div>

        {/* FOOTER */}
        <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-between items-center">
           <div className="text-xs text-slate-500">
             {config.actions.length} acciones • {config.knowledgeBase.length} chars KB
           </div>
           <button 
             onClick={() => onSave(config)}
             disabled={isReadOnly}
             className="flex items-center gap-2 bg-wc-gradient text-white px-6 py-2.5 rounded-lg text-sm font-bold shadow-md hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
             title={isReadOnly ? "Solo lectura para Agentes" : "Guardar cambios"}
           >
             {isReadOnly ? <Lock size={16} /> : <Save size={16} />}
             {isReadOnly ? "Solo Lectura" : "Guardar Configuración"}
           </button>
        </div>
      </div>

      {/* RIGHT COLUMN: SIMULATOR */}
      <div className="w-full lg:w-1/2 flex flex-col bg-[#E5DDD5] rounded-2xl shadow-sm border border-slate-200 overflow-hidden relative">
         <div className="bg-[#075E54] text-white p-4 flex items-center justify-between shadow-md z-10">
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center">
                    <Bot size={24} className="text-[#075E54]" />
                </div>
                <div>
                    <h3 className="font-bold leading-tight">Bot Simulator</h3>
                    <p className="text-xs text-white/80 flex items-center gap-1">
                        <span className={`w-1.5 h-1.5 rounded-full ${isUpdatingMemory ? 'bg-yellow-400 animate-ping' : 'bg-green-400'}`}></span>
                        {isUpdatingMemory ? 'Updating Memory...' : 'Memory Active'}
                    </p>
                </div>
            </div>
            <div className="flex gap-1">
                <button 
                    onClick={() => setShowMemoryBank(!showMemoryBank)}
                    className={`p-2 rounded-lg transition-colors ${showMemoryBank ? 'bg-white text-[#075E54]' : 'text-white/70 hover:bg-white/10'}`}
                    title="Ver Banco de Memoria"
                >
                    <Cpu size={18} />
                </button>
                <button 
                    onClick={handleResetChat} 
                    className="p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                    title="Reiniciar Conversación"
                >
                    <RefreshCw size={18} />
                </button>
            </div>
         </div>

         {/* MEMORY BANK OVERLAY */}
         {showMemoryBank && (
             <div className="absolute top-16 right-4 z-20 w-64 bg-white/95 backdrop-blur-md shadow-2xl rounded-xl border border-slate-200 animate-in slide-in-from-right-4 duration-300 flex flex-col max-h-[400px]">
                 <div className="p-3 border-b border-slate-100 flex justify-between items-center">
                     <span className="text-xs font-bold text-slate-700 uppercase flex items-center gap-1">
                         <Cpu size={14} className="text-wc-purple" />
                         Protocol 719 31
                     </span>
                     <button onClick={handleWipeMemory} className="text-red-400 hover:text-red-600" title="Wipe Memory">
                         <Trash2 size={12} />
                     </button>
                 </div>
                 <div className="p-3 overflow-y-auto space-y-3 text-xs">
                     <div>
                         <span className="font-bold text-slate-500 block mb-1">Nombre:</span>
                         <span className="bg-purple-100 text-purple-700 px-2 py-0.5 rounded">{memory.user_name || 'Desconocido'}</span>
                     </div>
                     <div>
                         <span className="font-bold text-slate-500 block mb-1">Gustos/Preferencias:</span>
                         <div className="flex flex-wrap gap-1">
                             {memory.user_preferences?.map((pref, i) => (
                                 <span key={i} className="bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded">{pref}</span>
                             )) || <span className="text-slate-400 italic">Nada aún...</span>}
                         </div>
                     </div>
                     <div>
                         <span className="font-bold text-slate-500 block mb-1">Sentimiento Actual:</span>
                         <span className={`px-2 py-0.5 rounded font-bold ${memory.sentiment === 'positive' ? 'text-green-600 bg-green-100' : memory.sentiment === 'negative' ? 'text-red-600 bg-red-100' : 'text-slate-600 bg-slate-100'}`}>
                             {memory.sentiment || 'Neutral'}
                         </span>
                     </div>
                     {memory.contact_info && (
                         <div>
                             <span className="font-bold text-slate-500 block mb-1">Contacto:</span>
                             <div className="space-y-1 text-slate-600">
                                 {memory.contact_info.phone && <div className="flex items-center gap-1"><Smartphone size={10} /> {memory.contact_info.phone}</div>}
                             </div>
                         </div>
                     )}
                     <div>
                         <span className="font-bold text-slate-500 block mb-1">Raw Data (Facts):</span>
                         <pre className="text-[9px] text-slate-500 bg-slate-50 p-1 rounded border border-slate-100">
                             {JSON.stringify(memory.custom_facts, null, 2)}
                         </pre>
                     </div>
                 </div>
             </div>
         )}

         {/* MESSAGES AREA */}
         <div className="flex-1 p-4 overflow-y-auto space-y-3" style={{backgroundImage: "url('https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png')", backgroundBlendMode: 'overlay'}}>
            {messages.map(msg => (
              <div key={msg.id} className={`flex w-full ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                {renderChatBubble(msg)}
              </div>
            ))}
            {isTyping && (
               <div className="flex justify-start">
                 <div className="bg-white px-4 py-3 rounded-xl rounded-tl-none border border-slate-100 shadow-sm">
                   <div className="flex gap-1">
                     <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></span>
                     <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce delay-75"></span>
                     <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce delay-150"></span>
                   </div>
                 </div>
               </div>
            )}
            <div ref={chatEndRef} />
         </div>

         {/* INPUT AREA */}
         <div className="p-3 bg-[#F0F2F5] flex items-center gap-2">
            <input 
              type="text" 
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
              placeholder="Escribe un mensaje..."
              className="flex-1 px-4 py-2.5 rounded-full border border-slate-300 focus:outline-none focus:border-[#075E54] text-sm"
            />
            <button 
              onClick={handleSendMessage}
              className="p-2.5 bg-[#075E54] text-white rounded-full hover:bg-[#054c44] transition-colors"
            >
              <Send size={18} />
            </button>
         </div>
      </div>

      {/* MODAL: CREATE ACTION */}
      {isActionModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
            <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h3 className="font-bold text-slate-800">Crear Smart Action</h3>
              <button onClick={() => setIsActionModalOpen(false)} className="text-slate-400 hover:text-slate-600"><XIcon size={20} /></button>
            </div>
            
            <div className="p-6 space-y-4">
              
              {/* Type Selector */}
              <div className="grid grid-cols-3 gap-2">
                {(['button', 'list', 'image', 'input', 'wait', 'handover'] as SmartActionType[]).map(type => (
                  <button
                    key={type}
                    onClick={() => setNewActionType(type)}
                    className={`flex flex-col items-center gap-1 py-3 px-2 rounded-xl border-2 transition-all ${newActionType === type ? 'border-wc-blue bg-blue-50 text-wc-blue' : 'border-slate-100 text-slate-500 hover:bg-slate-50'}`}
                  >
                    {type === 'button' && <MousePointer2 size={20} />}
                    {type === 'list' && <List size={20} />}
                    {type === 'image' && <ImageIcon size={20} />}
                    {type === 'input' && <FormInput size={20} />}
                    {type === 'wait' && <Clock size={20} />}
                    {type === 'handover' && <UserCheck size={20} />}
                    <span className="text-[10px] font-bold uppercase">{type}</span>
                  </button>
                ))}
              </div>

              {/* Name */}
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase">Nombre Interno (ID)</label>
                <input 
                  type="text" 
                  value={newActionName} 
                  onChange={(e) => setNewActionName(e.target.value)}
                  placeholder="Ej: Menu Principal"
                  className="w-full mt-1 px-3 py-2 border border-slate-200 rounded-lg text-sm focus:border-wc-blue outline-none" 
                />
              </div>

              {/* Conditional Fields */}
              {newActionType === 'image' && (
                 <div>
                    <label className="text-xs font-bold text-slate-500 uppercase">URL de Imagen</label>
                    <input 
                      type="text" 
                      value={tempText} 
                      onChange={(e) => setTempText(e.target.value)}
                      placeholder="https://..."
                      className="w-full mt-1 px-3 py-2 border border-slate-200 rounded-lg text-sm" 
                    />
                 </div>
              )}

              {newActionType === 'button' && (
                <div className="space-y-3">
                   <div>
                    <label className="text-xs font-bold text-slate-500 uppercase">Texto del Mensaje</label>
                    <input 
                      type="text" 
                      value={tempText} 
                      onChange={(e) => setTempText(e.target.value)}
                      placeholder="¿Qué deseas hacer?"
                      className="w-full mt-1 px-3 py-2 border border-slate-200 rounded-lg text-sm" 
                    />
                   </div>
                   <div>
                     <label className="text-xs font-bold text-slate-500 uppercase">Botones (Máx 3)</label>
                     <div className="space-y-2 mt-1">
                       {tempButtons.map((btn, idx) => (
                         <input 
                           key={idx}
                           type="text"
                           value={btn}
                           onChange={(e) => {
                             const newBtns = [...tempButtons];
                             newBtns[idx] = e.target.value;
                             setTempButtons(newBtns);
                           }}
                           placeholder={`Botón ${idx + 1}`}
                           className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
                         />
                       ))}
                       {tempButtons.length < 3 && (
                         <button 
                           onClick={() => setTempButtons([...tempButtons, ''])}
                           className="text-xs text-wc-blue font-semibold hover:underline flex items-center gap-1"
                         >
                           <Plus size={12} /> Agregar Botón
                         </button>
                       )}
                     </div>
                   </div>
                </div>
              )}

              {newActionType === 'list' && (
                 <div className="space-y-3">
                    <div>
                      <label className="text-xs font-bold text-slate-500 uppercase">Texto del Mensaje</label>
                      <input type="text" value={tempText} onChange={(e) => setTempText(e.target.value)} placeholder="Abre nuestro menú" className="w-full mt-1 px-3 py-2 border border-slate-200 rounded-lg text-sm" />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-slate-500 uppercase">Título del Botón de Lista</label>
                      <input type="text" value={tempTitle} onChange={(e) => setTempTitle(e.target.value)} placeholder="Ver Opciones" className="w-full mt-1 px-3 py-2 border border-slate-200 rounded-lg text-sm" />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-slate-500 uppercase">Opciones (Rows)</label>
                      <div className="space-y-2 mt-1 max-h-32 overflow-y-auto">
                        {tempListRows.map((row, idx) => (
                          <input key={idx} type="text" value={row} onChange={(e) => { const n = [...tempListRows]; n[idx] = e.target.value; setTempListRows(n); }} placeholder={`Opción ${idx + 1}`} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm" />
                        ))}
                         {tempListRows.length < 10 && (
                         <button onClick={() => setTempListRows([...tempListRows, ''])} className="text-xs text-wc-blue font-semibold hover:underline flex items-center gap-1"><Plus size={12} /> Agregar Opción</button>
                       )}
                      </div>
                    </div>
                 </div>
              )}

              {newActionType === 'input' && (
                  <div>
                    <label className="text-xs font-bold text-slate-500 uppercase">Pregunta o Placeholder</label>
                    <input 
                      type="text" 
                      value={tempText} 
                      onChange={(e) => setTempText(e.target.value)}
                      placeholder="Ej: Por favor escribe tu correo electrónico"
                      className="w-full mt-1 px-3 py-2 border border-slate-200 rounded-lg text-sm" 
                    />
                    <p className="text-[10px] text-slate-400 mt-1">El bot detendrá el flujo hasta que el usuario responda.</p>
                  </div>
              )}

              {newActionType === 'wait' && (
                  <div>
                    <label className="text-xs font-bold text-slate-500 uppercase">Tiempo de Espera (Segundos)</label>
                    <input 
                      type="number" 
                      value={tempNumber} 
                      onChange={(e) => setTempNumber(parseInt(e.target.value))}
                      placeholder="Ej: 5"
                      className="w-full mt-1 px-3 py-2 border border-slate-200 rounded-lg text-sm" 
                    />
                  </div>
              )}

              {newActionType === 'handover' && (
                  <div className="bg-amber-50 p-3 rounded-lg border border-amber-200 text-sm text-amber-700">
                      Esta acción detendrá el bot y notificará a los agentes humanos en Chatwoot/Waha.
                  </div>
              )}

            </div>

            <div className="p-5 bg-slate-50 flex gap-3">
              <button onClick={() => setIsActionModalOpen(false)} className="flex-1 py-2 text-slate-500 font-medium text-sm hover:bg-slate-200 rounded-lg transition-colors">Cancelar</button>
              <button onClick={handleAddAction} disabled={!newActionName} className="flex-1 py-2 bg-wc-gradient text-white font-bold text-sm rounded-lg hover:opacity-90 disabled:opacity-50 transition-opacity">Crear Acción</button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};

// Helper Icon for Modal Close
const XIcon = ({size}: {size: number}) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 18 18"/></svg>
);