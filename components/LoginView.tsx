import React, { useState } from 'react';
import { accService } from '../services/accService';
import { Mail, Lock, AlertCircle, Loader2, ArrowRight, ArrowLeft } from 'lucide-react';
import { ACCProfile } from '../types';

interface LoginViewProps {
  onLoginSuccess: (profile: ACCProfile) => void;
  onBack: () => void;
}

export const LoginView: React.FC<LoginViewProps> = ({ onLoginSuccess, onBack }) => {
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      if (isLoginMode) {
        const profile = await accService.login(email, password);
        onLoginSuccess(profile);
      } else {
        const profile = await accService.register(email, password);
        onLoginSuccess(profile);
      }
    } catch (err: any) {
      setError(err.message || 'Error en la autenticación');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center p-4">
      {/* Back to Home Button */}
      <button 
        onClick={onBack}
        className="absolute top-4 left-4 md:top-8 md:left-8 p-2 rounded-full bg-white border border-slate-200 shadow-sm text-slate-500 hover:text-wc-blue transition-colors flex items-center gap-2"
        aria-label="Volver al inicio"
      >
        <ArrowLeft size={20} />
      </button>

      <div className="w-full max-w-md bg-white text-slate-900 rounded-2xl shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-300">
        <div className="p-6 md:p-8">
            <h3 className="text-2xl font-black tracking-tight mb-2">
                {isLoginMode ? 'Bienvenido a WhatsCloud' : 'Crea tu Cuenta'}
            </h3>
            <p className="text-slate-500 text-sm mb-6">
                {isLoginMode ? 'Inicia sesión para gestionar tus herramientas.' : 'Únete a ecosistema líder en IA.'}
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-1">
                    <label className="text-[10px] md:text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Email Corporativo</label>
                    <div className="relative">
                        <Mail className="absolute left-3 top-3 text-slate-400" size={18} />
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-wc-blue/20 focus:border-wc-blue focus:bg-white transition-all outline-none text-base"
                            placeholder="tu@empresa.com"
                            required
                        />
                    </div>
                </div>

                <div className="space-y-1">
                    <label className="text-[10px] md:text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Password</label>
                    <div className="relative">
                        <Lock className="absolute left-3 top-3 text-slate-400" size={18} />
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-wc-blue/20 focus:border-wc-blue focus:bg-white transition-all outline-none text-base"
                            placeholder="••••••••"
                            required
                        />
                    </div>
                </div>

                {error && (
                    <div className="p-3 bg-red-50 text-red-600 text-sm font-medium rounded-lg flex items-center gap-2">
                        <AlertCircle size={16} /> {error}
                    </div>
                )}

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-wc-gradient hover:bg-wc-gradient-hover text-white font-bold py-3.5 rounded-xl shadow-lg shadow-wc-blue/20 active:scale-95 transition-all flex items-center justify-center gap-2 mt-4"
                >
                    {loading ? <Loader2 className="animate-spin" size={20} /> : (
                        <>
                            {isLoginMode ? 'Entrar a WhatsCloud' : 'Iniciar Trial Ahora'}
                            <ArrowRight size={18} />
                        </>
                    )}
                </button>
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
        <div className="bg-slate-50 p-4 text-center text-xs font-medium text-slate-400 border-t border-slate-100">
            Protected by WhatsCloud Secure Auth
        </div>
      </div>
    </div>
  );
};
