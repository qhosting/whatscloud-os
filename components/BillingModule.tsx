import React, { useState } from 'react';
import { 
  CreditCard, 
  Banknote, 
  Upload, 
  History, 
  CheckCircle2, 
  AlertCircle, 
  Wallet,
  ArrowRight,
  ShieldCheck
} from 'lucide-react';
import { Payment } from '../types';

interface BillingModuleProps {
  currentCredits: number;
  onRecharge: (amount: number, method: 'CARD' | 'SPEI') => void;
  onUploadReceipt: (paymentId: string, url: string) => void;
}

const RECHARGE_PACKAGES = [
    { id: 'pkg_1', amount: 500, bits: 500, bonus: 0, price: 500, label: 'Básico' },
    { id: 'pkg_2', amount: 1000, bits: 1100, bonus: 100, price: 1000, label: 'Popular', highlight: true },
    { id: 'pkg_3', amount: 5000, bits: 6000, bonus: 1000, price: 5000, label: 'Enterprise' },
];

export const BillingModule: React.FC<BillingModuleProps> = ({ currentCredits, onRecharge, onUploadReceipt }) => {
  const [selectedPackage, setSelectedPackage] = useState(RECHARGE_PACKAGES[1]);
  const [method, setMethod] = useState<'CARD' | 'SPEI'>('CARD');
  const [step, setStep] = useState<'plans' | 'payment' | 'confirmation'>('plans');

  // SPEI Instructions (Mock)
  const bankDetails = {
      bank: 'BBVA México',
      clabe: '0121 8001 2345 6789 01',
      beneficiary: 'AURUM CAPITAL HOLDING S.A.P.I.',
      reference: 'WHATSCLOUD-992'
  };

  return (
    <div className="flex flex-col h-[calc(100vh-140px)] animate-in fade-in slide-in-from-bottom-4">
        
        {/* HEADER STATS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-gradient-to-br from-wc-purple to-purple-600 p-6 rounded-3xl text-white shadow-xl shadow-purple-200/50 relative overflow-hidden">
                <div className="absolute -right-4 -bottom-4 opacity-10">
                    <Wallet size={120} />
                </div>
                <p className="text-white/70 text-sm font-bold uppercase tracking-wider mb-1">Balance Actual</p>
                <div className="text-4xl font-extrabold flex items-baseline gap-2">
                    {currentCredits} <span className="text-xl font-medium text-white/60 text-sm">BITS</span>
                </div>
                <div className="mt-4 inline-flex items-center gap-2 px-3 py-1 bg-white/20 rounded-full text-xs font-bold backdrop-blur-sm">
                    <ShieldCheck size={14} /> Sistema Protegido
                </div>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex flex-col justify-center">
                <p className="text-slate-400 text-xs font-bold uppercase mb-2">Próxima Recarga Sugerida</p>
                <p className="text-xl font-bold text-slate-800 tracking-tight">Recibe +10% Gratis</p>
                <p className="text-sm text-slate-500 mt-1">En el paquete de $1,000 MXN</p>
            </div>

            <div className="bg-emerald-50 p-6 rounded-3xl border border-emerald-100 flex flex-col justify-center">
                <p className="text-emerald-700 text-xs font-bold uppercase mb-2">Promoción Activa</p>
                <p className="text-xl font-bold text-emerald-800 tracking-tight">Doble de BITS en SPEI</p>
                <p className="text-sm text-emerald-600 mt-1">Aplica en montos {'>'} $5,000</p>
            </div>
        </div>

        {/* MAIN CONTENT */}
        <div className="flex-1 overflow-y-auto pr-2 pb-10">
            {step === 'plans' && (
                <div className="space-y-6">
                    <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                        <h2 className="text-2xl font-bold text-slate-800">Selecciona un Paquete</h2>
                        <div className="flex bg-slate-100 p-1 rounded-xl">
                            <button 
                                onClick={() => setMethod('CARD')}
                                className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${method === 'CARD' ? 'bg-white text-wc-purple shadow-sm' : 'text-slate-500'}`}
                            >
                                <CreditCard size={14} className="inline mr-1" /> Tarjeta (OpenPay)
                            </button>
                            <button 
                                onClick={() => setMethod('SPEI')}
                                className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${method === 'SPEI' ? 'bg-white text-wc-purple shadow-sm' : 'text-slate-500'}`}
                            >
                                <Banknote size={14} className="inline mr-1" /> SPEI / Manual
                            </button>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {RECHARGE_PACKAGES.map(pkg => (
                            <button 
                                key={pkg.id}
                                onClick={() => setSelectedPackage(pkg)}
                                className={`relative group p-8 rounded-[2rem] border-2 transition-all flex flex-col items-center text-center ${selectedPackage.id === pkg.id ? 'border-wc-purple bg-purple-50/50' : 'border-slate-100 bg-white hover:border-slate-200 shadow-sm'}`}
                            >
                                {pkg.highlight && (
                                    <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-wc-purple text-white text-[10px] font-black uppercase px-3 py-1 rounded-full shadow-lg shadow-purple-200">Recomendado</span>
                                )}
                                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">{pkg.label}</span>
                                <div className="text-5xl font-black text-slate-900 mb-2">
                                    <span className="text-2xl font-medium text-slate-400">$</span>{pkg.price}
                                </div>
                                <p className="text-sm font-bold text-slate-500 mb-6">M.N. IVA Incluido</p>
                                
                                <div className="w-full h-px bg-slate-100 mb-6" />
                                
                                <ul className="space-y-3 mb-8">
                                    <li className="flex items-center gap-2 text-sm text-slate-600">
                                        <CheckCircle2 size={16} className="text-emerald-500" /> 
                                        <strong>{pkg.bits} BITS</strong> de crédito
                                    </li>
                                    {pkg.bonus > 0 && (
                                        <li className="flex items-center gap-2 text-sm text-emerald-600 font-bold">
                                            <CheckCircle2 size={16} /> 
                                            Bonus +{pkg.bonus} Gratis
                                        </li>
                                    )}
                                    <li className="flex items-center gap-2 text-sm text-slate-500">
                                        <CheckCircle2 size={16} className="text-slate-200" /> Acceso a IA Gemini
                                    </li>
                                </ul>

                                <div className={`w-full py-3 rounded-2xl font-bold transition-all ${selectedPackage.id === pkg.id ? 'bg-wc-purple text-white shadow-xl shadow-purple-200' : 'bg-slate-100 text-slate-400 group-hover:bg-slate-200 group-hover:text-slate-600'}`}>
                                    Seleccionar
                                </div>
                            </button>
                        ))}
                    </div>

                    <div className="bg-slate-900 rounded-3xl p-8 flex flex-col md:flex-row items-center justify-between gap-6 text-white relative overflow-hidden">
                         <div className="space-y-1 relative z-10">
                             <h3 className="text-xl font-bold">Continuar con la Recarga</h3>
                             <p className="text-slate-400 text-sm">Transferencia segura procesada por {method === 'CARD' ? 'OpenPay de BBVA' : 'Aurum Finance'}</p>
                         </div>
                         <button 
                            onClick={() => setStep('payment')}
                            className="relative z-10 bg-white text-slate-900 px-8 py-4 rounded-2xl font-extrabold flex items-center gap-2 hover:scale-105 transition-transform shadow-2xl"
                         >
                            Pagar {selectedPackage.price} MXN <ArrowRight size={20} />
                         </button>
                    </div>
                </div>
            )}

            {step === 'payment' && (
                <div className="max-w-2xl mx-auto space-y-8 animate-in zoom-in-95 duration-300">
                    <button onClick={() => setStep('plans')} className="text-slate-400 hover:text-slate-600 text-sm font-bold flex items-center gap-1">← Regresar a paquetes</button>
                    
                    {method === 'CARD' ? (
                        <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-xl space-y-6">
                            <div className="flex items-center gap-3">
                                <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl"><CreditCard /></div>
                                <div>
                                    <h3 className="font-bold text-slate-800">Checkout Seguro (OpenPay)</h3>
                                    <p className="text-xs text-slate-400 uppercase font-bold tracking-widest">Pago con Tarjeta de Crédito/Débito</p>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div className="bg-slate-50 p-6 rounded-2xl border border-dashed border-slate-200 flex items-center justify-center text-slate-400 italic text-sm">
                                    [ INTEGRACIÓN LIBRERÍA OPENPAY JS ]
                                </div>
                                <p className="text-[10px] text-slate-400 text-center">Tus datos están protegidos por encriptación de 256 bits y certificados PCI-DSS.</p>
                            </div>

                            <button 
                                onClick={() => {
                                    onRecharge(selectedPackage.price, 'CARD');
                                    setStep('confirmation');
                                }}
                                className="w-full py-4 bg-wc-purple text-white rounded-2xl font-black text-lg shadow-xl shadow-purple-200 transition-all hover:-translate-y-1 active:scale-95"
                            >
                                Pagar ${selectedPackage.price} Ahora
                            </button>
                        </div>
                    ) : (
                        <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-xl space-y-6">
                            <div className="flex items-center gap-3">
                                <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl"><Banknote /></div>
                                <div>
                                    <h3 className="font-bold text-slate-800">Transferencia SPEI</h3>
                                    <p className="text-xs text-slate-400 uppercase font-bold tracking-widest">Información Bancaria</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="p-4 bg-slate-50 rounded-2xl">
                                    <span className="text-[10px] font-bold text-slate-400 uppercase block">Banco</span>
                                    <span className="font-bold text-slate-700">{bankDetails.bank}</span>
                                </div>
                                <div className="p-4 bg-slate-50 rounded-2xl">
                                    <span className="text-[10px] font-bold text-slate-400 uppercase block">Referencia</span>
                                    <span className="font-bold text-slate-700">{bankDetails.reference}</span>
                                </div>
                                <div className="p-4 bg-slate-50 rounded-2xl md:col-span-2 relative">
                                    <span className="text-[10px] font-bold text-slate-400 uppercase block">CLABE Interbancaria</span>
                                    <span className="font-mono font-bold text-slate-700 text-lg">{bankDetails.clabe}</span>
                                    <button className="absolute right-4 top-1/2 -translate-y-1/2 text-wc-purple text-xs font-bold">Copiar</button>
                                </div>
                            </div>

                            <div className="bg-amber-50 p-4 rounded-2xl border border-amber-100 flex gap-3">
                                <AlertCircle className="text-amber-600 shrink-0" />
                                <p className="text-xs text-amber-800 leading-relaxed">
                                    <strong>Importante:</strong> Al terminar la transferencia, sube tu comprobante para que un administrador valide y cargue tus créditos manualmente (Horario: Lun-Vie 9-18h).
                                </p>
                            </div>

                            <div className="border-2 border-dashed border-slate-200 rounded-3xl p-8 flex flex-col items-center justify-center text-center group cursor-pointer hover:border-wc-purple transition-colors">
                                <Upload size={40} className="text-slate-300 group-hover:text-wc-purple mb-4 transition-colors" />
                                <p className="text-sm font-bold text-slate-600">Subir Comprobante (PDF/JPG)</p>
                                <p className="text-xs text-slate-400 mt-1">Máximo 10MB</p>
                            </div>

                            <button 
                                onClick={() => {
                                    onRecharge(selectedPackage.price, 'SPEI');
                                    setStep('confirmation');
                                }}
                                className="w-full py-4 bg-slate-800 text-white rounded-2xl font-black text-lg transition-all hover:bg-slate-900"
                            >
                                Registrar Intento de Pago
                            </button>
                        </div>
                    )}
                </div>
            )}

            {step === 'confirmation' && (
                <div className="flex flex-col items-center justify-center py-20 animate-in zoom-in-95">
                    <div className="w-24 h-24 bg-emerald-100 text-emerald-600 rounded-[2rem] flex items-center justify-center mb-6">
                        <CheckCircle2 size={48} />
                    </div>
                    <h2 className="text-2xl font-extrabold text-slate-800 mb-2">Solicitud Enviada</h2>
                    <p className="text-slate-500 text-center max-w-sm mb-8">
                        {method === 'CARD' 
                          ? 'Tu recarga ha sido procesada e impactará en tu balance en unos segundos.' 
                          : 'Hemos registrado tu aviso de transferencia. En cuanto subas el comprobante y sea validado, tendrás tus BITS.'}
                    </p>
                    <button 
                         onClick={() => setStep('plans')}
                         className="px-8 py-3 bg-slate-100 text-slate-600 rounded-2xl font-bold hover:bg-slate-200 transition-colors"
                    >
                        Volver a Facturación
                    </button>
                </div>
            )}
        </div>
        
        {/* HISTORY MINI PANEL */}
        <div className="bg-white border-t border-slate-100 p-6 -mx-2 -mb-2">
            <h3 className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-2 tracking-tight"><History size={16} /> Actividad Reciente</h3>
            <div className="space-y-3">
                 <div className="flex items-center justify-between p-3 bg-slate-50 rounded-2xl border border-slate-100">
                     <div className="flex items-center gap-3">
                         <div className="p-2 bg-white rounded-lg shadow-sm border border-slate-100"><Banknote size={16} className="text-emerald-500" /></div>
                         <div>
                             <p className="text-xs font-bold text-slate-700">Recarga SPEI - Pendiente</p>
                             <p className="text-[10px] text-slate-400">Hace 2 horas</p>
                         </div>
                     </div>
                     <span className="text-sm font-black text-slate-900">$500 MXN</span>
                 </div>
            </div>
        </div>

    </div>
  );
};
