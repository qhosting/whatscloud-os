import React, { useState, useEffect } from 'react';
import { 
  Bot, 
  Search, 
  MessageCircle, 
  Zap, 
  Globe, 
  ArrowRight,
  ShieldCheck,
  Smartphone
} from 'lucide-react';

interface LandingPageProps {
  onNavigateToLogin: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onNavigateToLogin }) => {
  const [supportNumber, setSupportNumber] = useState('');

  useEffect(() => {
    fetch('/api/public/settings')
      .then(res => res.json())
      .then(data => {
        if (data.support_whatsapp) setSupportNumber(data.support_whatsapp);
      })
      .catch(err => console.error("Error fetching public settings", err));
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 text-white font-sans selection:bg-wc-purple selection:text-white overflow-x-hidden flex flex-col">
      
      {/* FLOATING WHATSAPP BUTTON (PWA OPTIMIZED) */}
      <a 
        href={`https://wa.me/${supportNumber || '5219991234567'}`}
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-6 right-6 md:bottom-8 md:right-8 z-[999] bg-[#25D366] text-white p-3.5 md:p-4 rounded-full shadow-[0_0_20px_rgba(37,211,102,0.4)] hover:scale-110 active:scale-95 transition-all flex items-center justify-center group"
        title="Soporte WhatsApp"
      >
        <MessageCircle size={28} className="md:w-8 md:h-8" />
        <span className="max-w-0 overflow-hidden whitespace-nowrap group-hover:max-w-xs group-hover:ml-3 transition-all duration-500 font-bold hidden md:inline">
          Soporte WhatsCloud
        </span>
      </a>

      {/* NAVBAR */}
      <nav className="fixed top-0 w-full z-50 bg-slate-950/80 backdrop-blur-md border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 md:px-6 h-16 md:h-20 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-wc-gradient flex items-center justify-center shadow-lg shadow-wc-blue/20">
               <Globe className="text-white" size={18} />
            </div>
            <span className="font-black text-xl tracking-tight hidden sm:block">WhatsCloud <span className="text-wc-blue">OS</span></span>
          </div>
          <div>
              <button 
                onClick={onNavigateToLogin}
                className="bg-white/10 hover:bg-white/20 text-white px-5 py-2 rounded-full font-bold text-sm md:text-base border border-white/10 backdrop-blur-sm transition-all active:scale-95"
              >
                  Acceder
              </button>
          </div>
        </div>
      </nav>

      {/* HERO SECTION (MOBILE FIRST) */}
      <main className="flex-1 flex flex-col justify-center relative pt-24 pb-16 px-4 md:px-6">
        
        {/* BACKGROUND EFFECTS */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-full max-w-lg h-[400px] bg-wc-blue/20 blur-[120px] rounded-full pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-wc-purple/10 blur-[100px] rounded-full pointer-events-none" />

        <div className="max-w-4xl mx-auto w-full text-center relative z-10 flex flex-col items-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900 border border-slate-800 text-wc-green text-[10px] md:text-xs font-black mb-6 md:mb-8 animate-in fade-in slide-in-from-bottom-4 shadow-xl">
            <Zap size={14} fill="currentColor" />
            SISTEMA OMNICANAL EN PRODUCCIÓN
          </div>
          
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black tracking-tighter mb-6 md:mb-8 leading-[1.1] animate-in fade-in slide-in-from-bottom-6 duration-700">
            Automatización <br className="md:hidden" /> Inteligente <br />
            <span className="text-transparent bg-clip-text bg-wc-gradient relative inline-block">
                Para tu Negocio
                <div className="absolute -bottom-2 left-0 w-full h-1 bg-gradient-to-r from-wc-blue to-wc-purple opacity-30 blur-sm"></div>
            </span>
          </h1>
          
          <p className="text-base sm:text-lg md:text-xl text-slate-400 mb-10 max-w-2xl leading-relaxed animate-in fade-in slide-in-from-bottom-8 duration-1000">
            Convierte tu dispositivo en una centralita de ventas. Combina <strong>IA, Scraping y Comunicaciones</strong> en una sola PWA optimizada para tu día a día.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto px-4 sm:px-0">
              <button 
                  onClick={onNavigateToLogin}
                  className="w-full sm:w-auto bg-wc-gradient hover:bg-wc-gradient-hover text-white px-8 py-4 rounded-2xl font-black text-lg shadow-xl shadow-wc-blue/30 active:scale-95 transition-all flex items-center justify-center gap-2"
              >
                  Iniciar Sesión <ArrowRight size={20} />
              </button>
              <a 
                  href={`https://wa.me/${supportNumber || '5219991234567'}?text=Hola,%20me%20interesa%20WhatsCloud%20OS`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full sm:w-auto bg-slate-900 hover:bg-slate-800 text-white px-8 py-4 rounded-2xl font-bold text-lg border border-slate-800 shadow-xl active:scale-95 transition-all flex items-center justify-center gap-2"
              >
                  Contactar Ventas <Bot size={20} />
              </a>
          </div>
        </div>

        {/* FEATURE PUMA (PWA) */}
        <div className="mt-20 md:mt-32 max-w-5xl mx-auto w-full grid grid-cols-1 sm:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-12 duration-1000 delay-300">
            <FeatureCard 
                icon={<Smartphone className="text-wc-blue" />}
                title="PWA Nativo"
                description="Instalable en cualquier móvil, experiencia app nativa (iOS/Android)."
            />
            <FeatureCard 
                icon={<Search className="text-wc-purple" />}
                title="Lead Scrapper IA"
                description="Encuentra prospectos en Google Maps con 1 click."
            />
            <FeatureCard 
                icon={<ShieldCheck className="text-emerald-400" />}
                title="100% Seguro"
                description="Datos cifrados. Monitoreo en tiempo real de toda tu operación."
            />
        </div>

      </main>

      {/* FOOTER */}
      <footer className="py-8 md:py-10 border-t border-slate-900 bg-slate-950 text-slate-500 text-xs md:text-sm text-center">
        <div className="max-w-7xl mx-auto px-6">
            <p>&copy; {new Date().getFullYear()} WhatsCloud OS. Todos los derechos reservados.</p>
        </div>
      </footer>
    </div>
  );
};

const FeatureCard = ({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) => (
    <div className="bg-slate-900/50 backdrop-blur-sm border border-slate-800 p-6 rounded-2xl hover:bg-slate-800/80 transition-colors text-left flex flex-col gap-3">
        <div className="w-12 h-12 rounded-xl bg-slate-950 flex items-center justify-center shadow-inner border border-white/5">
            {icon}
        </div>
        <h3 className="font-bold text-lg text-white">{title}</h3>
        <p className="text-sm text-slate-400 leading-relaxed">{description}</p>
    </div>
);
