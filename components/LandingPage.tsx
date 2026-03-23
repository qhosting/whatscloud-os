import React, { useState } from 'react';
import { accService } from '../services/accService';
import { 
  Bot, 
  Search, 
  MessageCircle, 
  Zap, 
  Globe, 
  ArrowRight, 
  PhoneCall,
  Loader2,
  Lock,
  Mail
} from 'lucide-react';
import { ACCProfile } from '../types';

interface LandingPageProps {
  onLoginSuccess: (profile: ACCProfile) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onLoginSuccess }) => {
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [supportNumber, setSupportNumber] = useState('');

  React.useEffect(() => {
    fetch('/api/public/settings')
      .then(res => res.json())
      .then(data => {
        if (data.support_whatsapp) setSupportNumber(data.support_whatsapp);
      })
      .catch(err => console.error("Error fetching public settings", err));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    // ... (previous logic)
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
            <span className="font-bold text-xl tracking-tight">WhatsCloud</span>
          </div>
        </div>
      </nav>

      {/* HERO SECTION WITH LOGIN FORM */}
      <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 px-6 flex flex-col lg:flex-row items-center justify-center gap-12">

        {/* TEXT CONTENT */}
        <div className="max-w-2xl text-center lg:text-left relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-wc-green text-xs font-bold mb-6 animate-in fade-in slide-in-from-bottom-4">
            <Zap size={12} fill="currentColor" />
            PRODUCCIÓN: WHATSCLOUD-OS ONLINE
          </div>
          
          <h1 className="text-5xl lg:text-6xl font-bold tracking-tight mb-6 leading-tight animate-in fade-in slide-in-from-bottom-6 duration-700">
            Automatización Total <br />
            <span className="text-transparent bg-clip-text bg-wc-gradient">Sin Límites Técnicos.</span>
          </h1>
          
          <p className="text-lg text-slate-400 mb-10 leading-relaxed animate-in fade-in slide-in-from-bottom-8 duration-1000">
            El ecosistema definitivo que combina <strong>Google Maps Scraping</strong>, <strong>Gemini IA</strong> y <strong>Marketing Omnicanal</strong> en una sola consola.
          </p>
        </div>

        {/* LOGIN CARD */}
        <div className="w-full max-w-md bg-white text-slate-900 rounded-2xl shadow-2xl overflow-hidden animate-in slide-in-from-right duration-700">
            <div className="p-8">
                <h3 className="text-2xl font-bold mb-2">{isLoginMode ? 'Iniciar Sesión' : 'Crear Cuenta'}</h3>
                <p className="text-slate-500 text-sm mb-6">Accede a tu consola WhatsCloud.</p>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* ... (form inputs) ... */}
                </form>

                <div className="mt-6 text-center text-sm text-slate-500">
                    {isLoginMode ? "¿No tienes cuenta?" : "¿Ya tienes cuenta?"}
                    <button
                        onClick={() => setIsLoginMode(!isLoginMode)}
                        className="ml-2 font-bold text-wc-blue hover:underline"
                    >
                        {isLoginMode ? "Regístrate aquí" : "Inicia sesión"}
                    </button>
                </div>
            </div>
            <div className="bg-slate-50 p-4 text-center text-xs text-slate-400 border-t border-slate-100">
                Protected by WhatsCloud Secure Auth
            </div>
        </div>

      </section>

      {/* FLOATING WHATSAPP BUTTON */}
      {supportNumber && (
        <a 
          href={`https://wa.me/${supportNumber}`}
          target="_blank"
          rel="noopener noreferrer"
          className="fixed bottom-8 right-8 z-[100] bg-[#25D366] text-white p-4 rounded-full shadow-2xl hover:scale-110 active:scale-95 transition-all flex items-center justify-center group"
          title="Soporte WhatsApp"
        >
          <MessageCircle size={28} fill="currentColor" />
          <span className="max-w-0 overflow-hidden whitespace-nowrap group-hover:max-w-xs group-hover:ml-3 transition-all duration-500 font-bold">
            Soporte WhatsCloud
          </span>
        </a>
      )}

      {/* FOOTER */}
      <footer className="py-12 border-t border-slate-900 bg-slate-950 text-slate-500 text-sm">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <Globe size={16} />
            <span className="font-bold text-slate-300">WhatsCloud</span>
          </div>
          <div>
            &copy; {new Date().getFullYear()} WhatsCloud. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
};
