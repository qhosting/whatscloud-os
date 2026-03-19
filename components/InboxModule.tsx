import React, { useState, useEffect, useRef } from 'react';
import { MessageSquare, Send, User, Search, RefreshCw, Bot, Check, CheckCheck, Clock } from 'lucide-react';

interface Conversation {
    id: string;
    status: string;
    lastMessageAt: string;
    unreadCount: number;
    Lead: {
        id: string;
        businessName: string;
        phone: string;
    };
    messages?: Message[];
}

interface Message {
    id: string;
    content: string;
    sender: 'LEAD' | 'AGENT' | 'BOT' | 'AI';
    direction: 'INCOMING' | 'OUTGOING';
    status: string;
    createdAt: string;
}

export const InboxModule: React.FC = () => {
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [activeConvId, setActiveConvId] = useState<string | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [inputText, setInputText] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const activeConv = conversations.find(c => c.id === activeConvId);

    const fetchConversations = async () => {
        try {
            const token = localStorage.getItem('wc_auth_token');
            const res = await fetch('/api/inbox/conversations', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setConversations(data);
            }
        } catch (e) {
            console.error("Fetch Conversations Error", e);
        }
    };

    const fetchMessages = async (convId: string) => {
        try {
            const token = localStorage.getItem('wc_auth_token');
            const res = await fetch(`/api/inbox/conversations/${convId}/messages`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setMessages(data);
                // Clear unread locally
                setConversations(prev => prev.map(c => c.id === convId ? { ...c, unreadCount: 0 } : c));
            }
        } catch (e) {
            console.error("Fetch Messages Error", e);
        }
    };

    useEffect(() => {
        fetchConversations();
        const interval = setInterval(fetchConversations, 10000); // Poll conversations
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        if (activeConvId) {
            fetchMessages(activeConvId);
            const interval = setInterval(() => fetchMessages(activeConvId), 5000); // Poll active messages
            return () => clearInterval(interval);
        }
    }, [activeConvId]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!inputText.trim() || !activeConvId) return;

        const text = inputText.trim();
        setInputText('');
        setIsLoading(true);

        // Optimistic UI
        const optimisticMsg: Message = {
            id: 'temp-' + Date.now(),
            content: text,
            sender: 'AGENT',
            direction: 'OUTGOING',
            status: 'SENDING',
            createdAt: new Date().toISOString()
        };
        setMessages(prev => [...prev, optimisticMsg]);

        try {
            const token = localStorage.getItem('wc_auth_token');
            const res = await fetch(`/api/inbox/conversations/${activeConvId}/send`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ text })
            });
            if (res.ok) {
                const savedMsg = await res.json();
                setMessages(prev => prev.map(m => m.id === optimisticMsg.id ? savedMsg : m));
            } else {
                setMessages(prev => prev.filter(m => m.id !== optimisticMsg.id));
                alert("Error al enviar mensaje");
            }
        } catch (error) {
            setMessages(prev => prev.filter(m => m.id !== optimisticMsg.id));
            console.error("Send Error", error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex h-[calc(100vh-12rem)] bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden animate-in fade-in duration-500">
            {/* Conversations List (Left Panel) */}
            <div className="w-1/3 border-r border-slate-200 flex flex-col bg-slate-50">
                <div className="p-4 border-b border-slate-200 bg-white">
                    <h2 className="text-lg font-black text-slate-800 flex items-center gap-2">
                        <MessageSquare size={20} className="text-wc-blue" /> Inbox Omnicanal
                    </h2>
                    <div className="mt-4 relative">
                        <Search size={16} className="absolute left-3 top-2.5 text-slate-400" />
                        <input 
                            type="text" 
                            placeholder="Buscar en chats..." 
                            className="w-full pl-9 pr-4 py-2 bg-slate-100 border-none rounded-xl text-sm focus:ring-2 ring-wc-blue/50 outline-none transition-all"
                        />
                    </div>
                </div>
                <div className="flex-1 overflow-y-auto">
                    {conversations.length === 0 ? (
                        <div className="p-8 text-center text-slate-400 text-sm">No hay conversaciones activas</div>
                    ) : (
                        conversations.map(conv => (
                            <button 
                                key={conv.id}
                                onClick={() => setActiveConvId(conv.id)}
                                className={`w-full p-4 flex items-start gap-3 border-b border-slate-100 transition-colors text-left
                                    ${activeConvId === conv.id ? 'bg-wc-blue/5' : 'hover:bg-slate-100/50'}
                                `}
                            >
                                <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center flex-shrink-0 text-slate-500 font-bold">
                                    <User size={18} />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex justify-between items-center mb-1">
                                        <span className="font-bold text-slate-800 text-sm truncate">{conv.Lead.businessName || conv.Lead.phone}</span>
                                        <span className="text-[10px] text-slate-400 whitespace-nowrap">
                                            {new Date(conv.lastMessageAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <p className="text-xs text-slate-500 truncate pr-2">
                                            {conv.messages?.[0]?.content || "Click para ver mensajes..."}
                                        </p>
                                        {conv.unreadCount > 0 && (
                                            <span className="bg-wc-green text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                                                {conv.unreadCount}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </button>
                        ))
                    )}
                </div>
            </div>

            {/* Chat Area (Right Panel) */}
            <div className="flex-1 flex flex-col bg-[#efeae2] relative">
                {/* Background Pattern */}
                <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'url("https://static.whatsapp.net/env/6486/media/01f40cd2dfa8.png")', backgroundRepeat: 'repeat' }}></div>

                {activeConvId ? (
                    <>
                        {/* Chat Header */}
                        <div className="p-4 bg-white border-b border-slate-200 flex justify-between items-center z-10 shadow-sm">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center text-slate-500">
                                    <User size={20} />
                                </div>
                                <div>
                                    <h3 className="font-bold text-slate-800 leading-tight">{activeConv?.Lead.businessName || 'Cargando...'}</h3>
                                    <p className="text-xs text-slate-500 font-mono">{activeConv?.Lead.phone}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className={`text-[10px] font-black uppercase px-2 py-1 rounded shadow-inner tracking-widest ${
                                    activeConv?.status === 'BOT_HANDLED' ? 'bg-wc-purple/10 text-wc-purple' : 'bg-emerald-100 text-emerald-700'
                                }`}>
                                    {activeConv?.status === 'BOT_HANDLED' ? '🤖 IA Activa' : '👤 Agente Manual'}
                                </span>
                            </div>
                        </div>

                        {/* Messages Area */}
                        <div className="flex-1 p-6 overflow-y-auto flex flex-col gap-4 z-10">
                            {messages.map((msg, index) => {
                                const isOut = msg.direction === 'OUTGOING';
                                return (
                                    <div key={msg.id || index} className={`flex flex-col max-w-[75%] ${isOut ? 'self-end' : 'self-start'}`}>
                                        <div className={`p-3 rounded-2xl shadow-sm relative group ${
                                            isOut ? 'bg-[#d9fdd3] rounded-tr-none' : 'bg-white rounded-tl-none'
                                        }`}>
                                            {msg.sender === 'AI' && (
                                                <div className="text-[10px] font-black text-wc-purple mb-1 flex items-center gap-1">
                                                    <Bot size={10} /> IA Generativa
                                                </div>
                                            )}
                                            <p className="text-sm text-slate-800 break-words whitespace-pre-wrap">{msg.content}</p>
                                            <div className="flex justify-end items-center gap-1 mt-1">
                                                <span className="text-[9px] text-slate-400 font-mono">
                                                    {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </span>
                                                {isOut && (
                                                    <span className="text-slate-400">
                                                        {msg.status === 'READ' ? <CheckCheck size={12} className="text-blue-500" /> : 
                                                         msg.status === 'SENDING' ? <Clock size={10} /> : <Check size={12} />}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Input Area */}
                        <div className="p-4 bg-[#f0f2f5] z-10">
                            <form onSubmit={handleSendMessage} className="flex gap-2 items-end">
                                <textarea 
                                    value={inputText}
                                    onChange={(e) => setInputText(e.target.value)}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter' && !e.shiftKey) {
                                            e.preventDefault();
                                            handleSendMessage(e);
                                        }
                                    }}
                                    placeholder="Escribe un mensaje..."
                                    className="flex-1 bg-white border-none rounded-xl px-4 py-3 text-sm focus:ring-0 outline-none resize-none overflow-hidden max-h-32"
                                    rows={1}
                                    style={{ minHeight: '44px' }}
                                />
                                <button 
                                    type="submit" 
                                    disabled={!inputText.trim() || isLoading}
                                    className="bg-wc-blue hover:bg-blue-600 text-white p-3 rounded-xl transition-all shadow-md disabled:opacity-50 flex items-center justify-center flex-shrink-0"
                                >
                                    <Send size={18} />
                                </button>
                            </form>
                            <p className="text-center text-[10px] text-slate-400 mt-2 font-black uppercase tracking-widest">
                                AL RESPONDER, EL CHAT PASARÁ A MODO <span className="text-emerald-500 font-bold">MANUAL</span>
                            </p>
                        </div>
                    </>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-slate-400 z-10 p-8 text-center">
                        <div className="bg-white p-6 rounded-full shadow-sm mb-4">
                            <MessageSquare size={48} className="text-slate-300" />
                        </div>
                        <h3 className="text-xl font-black text-slate-700 mb-2">WhatsCloud Web</h3>
                        <p className="text-sm max-w-sm">Selecciona un chat de la lista izquierda para iniciar una conversación manual y tomar control del bot.</p>
                    </div>
                )}
            </div>
        </div>
    );
};
