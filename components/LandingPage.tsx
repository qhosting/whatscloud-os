import React, { useState } from 'react';
import { 
  Bot, 
  Search, 
  MessageCircle, 
  Zap, 
  Globe, 
  ArrowRight, 
  PhoneCall,
  Lock,
  Mail,
  Key,
  X,
  Loader2,
  ShieldCheck
} from 'lucide-react';
import { accService } from '../services/accService';
import { ACCProfile } from '../types';

interface LandingPageProps {
  onLoginSuccess: (profile: ACCProfile) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onLoginSuccess }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const profile = await accService.login(email, password);
      onLoginSuccess(profile);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white font-sans selection:bg-wc-purple selection:text-white overflow-x-hidden">
      
      {/* NAVBAR */}
      <nav className="fixed top-0 w-full z-50 bg-slate-950/80 backdrop-blur-md border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-wc-gradient flex items-center justify-center">
               <Globe className="text-white" size={20} />
            </div>
            <span className="font-bold text-xl tracking-tight">WhatsCloud<span className="text-wc-blue">.MX</span></span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-300">
            <a href="#features" className="hover:text-white transition-colors">Soluciones</a>
            <a href="#engine" className="hover:text-white transition-colors">Motor IA</a>
            <a href="#pricing" className="hover:text-white transition-colors">Precios</a>
          </div>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="px-5 py-2.5 bg-white text-slate-950 font-bold rounded-lg hover:bg-slate-200 transition-colors flex items-center gap-2 text-sm"
          >
            Console Login <ArrowRight size={16} />
          </button>
        </div>
      </nav>

      {/* HERO SECTION */}
      <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 px-6">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full max-w-7xl opacity-20 pointer-events-none">
           <div className="absolute top-20 left-10 w-96 h-96 bg-wc-purple rounded-full blur-[128px]"></div>
           <div className="absolute top-40 right-10 w-96 h-96 bg-wc-blue rounded-full blur-[128px]"></div>
        </div>

        <div className="max-w-4xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-wc-green text-xs font-bold mb-6 animate-in fade-in slide-in-from-bottom-4">
            <Zap size={12} fill="currentColor" />
            PRODUCCIÓN: whatscloud-os-db ONLINE
          </div>
          
          <h1 className="text-5xl lg:text-7xl font-bold tracking-tight mb-6 leading-tight animate-in fade-in slide-in-from-bottom-6 duration-700">
            Automatización Total <br />
            <span className="text-transparent bg-clip-text bg-wc-gradient">Sin Límites Técnicos.</span>
          </h1>
          
          <p className="text-lg text-slate-400 mb-10 max-w-2xl mx-auto leading-relaxed animate-in fade-in slide-in-from-bottom-8 duration-1000">
            El ecosistema definitivo que combina <strong>Google Maps Scraping</strong>, <strong>Gemini IA</strong> y <strong>Marketing Omnicanal</strong> en una sola consola. Diseñado para escalas masivas.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-in fade-in slide-in-from-bottom-10 duration-1000 delay-200">
            <button 
              onClick={() => setIsModalOpen(true)}
              className="w-full sm:w-auto px-8 py-4 bg-wc-gradient text-white font-bold rounded-xl shadow-lg shadow-wc-blue/25 hover:scale-105 transition-transform flex items-center justify-center gap-2"
            >
              Acceder al Ecosistema <Zap size={18} />
            </button>
            <button className="w-full sm:w-auto px-8 py-4 bg-slate-900 border border-slate-800 text-slate-300 font-bold rounded-xl hover:bg-slate-800 transition-colors flex items-center justify-center gap-2">
              <PhoneCall size={18} /> Agendar Demo
            </button>
          </div>
        </div>
      </section>

      {/* LOGIN MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
          <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-xl animate-in fade-in duration-300" onClick={() => !loading && setIsModalOpen(false)}></div>
          
          <div className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
             <div className="absolute top-0 inset-x-0 h-1.5 bg-wc-gradient"></div>
             
             <div className="p-8">
                <div className="flex justify-between items-center mb-8">
                   <div className="flex items-center gap-2">
                      <ShieldCheck className="text-wc-blue" size={24} />
                      <h3 className="text-xl font-bold">Inicia Sesión</h3>
                   </div>
                   <button onClick={() => setIsModalOpen(false)} className="text-slate-500 hover:text-white"><X /></button>
                </div>

                <form onSubmit={handleLogin} className="space-y-6">
                   <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-500 uppercase">Email Corporativo</label>
                      <div className="relative">
                         <Mail className="absolute left-3 top-3 text-slate-600" size={18} />
                         <input 
                           type="email" 
                           required
                           value={email}
                           onChange={(e) => setEmail(e.target.value)}
                           placeholder="admin@qhosting.net"
                           className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-3 text-sm focus:border-wc-blue outline-none transition-all"
                         />
                      </div>
                   </div>

                   <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-500 uppercase">Contraseña de Acceso</label>
                      <div className="relative">
                         <Key className="absolute left-3 top-3 text-slate-600" size={18} />
                         <input 
                           type="password" 
                           required
                           value={password}
                           onChange={(e) => setPassword(e.target.value)}
                           placeholder="••••••••"
                           className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-3 text-sm focus:border-wc-blue outline-none transition-all"
                         />
                      </div>
                   </div>

                   {error && (
                     <div className="p-3 bg-red-500/10 border border-red-500/50 rounded-lg text-red-500 text-xs font-bold flex items-center gap-2 animate-in shake duration-500">
                        <Lock size={14} /> {error}
                     </div>
                   )}

                   <button 
                     type="submit"
                     disabled={loading}
                     className="w-full py-4 bg-wc-gradient text-white font-bold rounded-xl shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                   >
                     {loading ? <Loader2 className="animate-spin" size={20} /> : <Zap size={18} fill="currentColor" />}
                     {loading ? 'Autenticando...' : 'Entrar al Console'}
                   </button>
                </form>

                <div className="mt-8 text-center">
                   <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Ecosistema Seguro WhatsCloud.MX</p>
                   <p className="text-[9px] text-slate-600 mt-2">© 2024 Aurum Capital Holding - Infraestructura PostgreSQL 16</p>
                </div>
             </div>
          </div>
        </div>
      )}

      {/* REST OF LANDING (Simplified for concise code, same as before) */}
      <section className="py-24 bg-slate-950 relative">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <FeatureCard 
              icon={<Search className="text-wc-blue" size={32} />}
              title="Lead Scrapper 2.0"
              desc="Extrae prospectos de Google Maps con IA. Sincronización nativa con el cluster OS-DB."
            />
            <FeatureCard 
              icon={<Bot className="text-wc-purple" size={32} />}
              title="BotBuilder Neural"
              desc="Flujos de chat avanzados con memoria Redis de baja latencia."
            />
            <FeatureCard 
              icon={<MessageCircle className="text-wc-green" size={32} />}
              title="Omnicanal"
              desc="SMS, Robocalling y WhatsApp API integrados bajo un mismo panel ACC."
            />
          </div>
        </div>
      </section>

      <footer className="py-12 border-t border-slate-900 bg-slate-950 text-slate-500 text-sm">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <Globe size={16} />
            <span className="font-bold text-slate-300">WhatsCloud.MX</span>
          </div>
          <div>&copy; 2024 Aurum Capital Holding.</div>
        </div>
      </footer>
    </div>
  );
};

const FeatureCard = ({ icon, title, desc }: { icon: React.ReactNode, title: string, desc: string }) => (
  <div className="p-8 rounded-2xl bg-slate-900 border border-slate-800 hover:border-wc-blue/50 transition-colors group">
    <div className="mb-6 p-4 bg-slate-950 rounded-xl w-fit border border-slate-800 group-hover:scale-110 transition-transform duration-300">
      {icon}
    </div>
    <h3 className="text-xl font-bold mb-3 text-slate-100">{title}</h3>
    <p className="text-slate-400 leading-relaxed text-sm">{desc}</p>
  </div>
);