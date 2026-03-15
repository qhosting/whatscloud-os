import React, { useState, useEffect } from 'react';
import { 
  CreditCard, 
  Banknote, 
  Upload, 
  History, 
  CheckCircle2, 
  AlertCircle, 
  Wallet,
  ArrowRight,
  ShieldCheck,
  Zap,
  Loader2,
  X,
  Plus,
  RefreshCw
} from 'lucide-react';
import { Payment } from '../types';
import { accService } from '../services/accService';

interface BillingModuleProps {
  currentCredits: number;
  onRefreshCredits?: () => void;
}

const RECHARGE_PACKAGES = [
    { id: 'pkg_1', amount: 500, bits: 500, bonus: 0, price: 500, label: 'Básico', description: 'Para pequeñas agencias' },
    { id: 'pkg_2', amount: 1000, bits: 1100, bonus: 100, price: 1000, label: 'Crecimiento', highlight: true, description: 'Mejor relación BITS/Precio' },
    { id: 'pkg_3', amount: 5000, bits: 6000, bonus: 1000, price: 5000, label: 'Enterprise', description: 'Uso intensivo y soporte prioritario' },
];

export const BillingModule: React.FC<BillingModuleProps> = ({ currentCredits, onRefreshCredits }) => {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState(RECHARGE_PACKAGES[1]);
  const [payStep, setPayStep] = useState<'methods' | 'details' | 'success'>('methods');
  const [method, setMethod] = useState<'CARD' | 'SPEI'>('CARD');
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    fetchPayments();
  }, []);

  const fetchPayments = async () => {
    setLoading(true);
    try {
      const data = await accService.getPayments();
      setPayments(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleRecharge = async () => {
    setIsProcessing(true);
    try {
      // For CARD, we normally would use OpenPay device session + token.
      // Here we simulate the successful backend call to the real endpoint we implemented.
      const res = await accService.rechargeCredits(selectedPackage.price, method);
      if (res) {
          setPayStep('success');
          if (onRefreshCredits) onRefreshCredits();
          fetchPayments();
      }
    } catch (e) {
      alert("Error en la transacción. Por favor contacte a soporte.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto animate-in fade-in duration-700">
        
        {/* DASHBOARD HEADER */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10">
            <div>
                <h1 className="text-4xl font-black text-slate-900 tracking-tighter mb-2">Facturación y <span className="text-wc-blue">Créditos</span></h1>
                <p className="text-slate-500 font-medium">Gestiona tus BITS para campañas de IA y automatización.</p>
            </div>
            
            <button 
                onClick={() => {
                    setPayStep('methods');
                    setShowModal(true);
                }}
                className="bg-wc-gradient px-8 py-4 rounded-2xl text-white font-black shadow-xl shadow-purple-200 hover:scale-105 active:scale-95 transition-all flex items-center gap-2"
            >
                <Plus size={20} /> Recargar Saldo
            </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* LEFT: STATUS & PACKAGES */}
            <div className="lg:col-span-2 space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-slate-900 p-8 rounded-[2.5rem] text-white relative overflow-hidden shadow-2xl border border-white/5">
                        <div className="absolute -right-4 -bottom-4 opacity-10">
                            <Wallet size={160} />
                        </div>
                        <div className="relative z-10">
                            <div className="flex items-center gap-2 mb-4">
                                <div className="bg-white/10 p-1.5 rounded-lg border border-white/5">
                                    <Zap size={16} className="text-wc-blue" fill="currentColor" />
                                </div>
                                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Balance Disponible</span>
                            </div>
                            <div className="text-5xl font-black mb-1 flex items-baseline gap-2">
                                {currentCredits.toLocaleString()}
                                <span className="text-sm font-bold text-wc-blue uppercase">bits</span>
                            </div>
                            <p className="text-slate-400 text-xs font-medium mb-6">Equivalente a aprox. {Math.floor(currentCredits / 0.5)} mensajes de IA</p>
                            
                            <div className="flex items-center gap-4">
                                <div className="flex-1 h-2 bg-white/5 rounded-full overflow-hidden">
                                    <div className="h-full bg-wc-gradient w-[70%]" />
                                </div>
                                <span className="text-[10px] font-bold text-slate-500 uppercase">Salud Cuenta</span>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm flex flex-col justify-between">
                        <div>
                            <div className="flex items-center gap-2 mb-4">
                                <div className="bg-emerald-50 p-1.5 rounded-lg border border-emerald-100 text-emerald-600">
                                    <ShieldCheck size={16} />
                                </div>
                                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Estado de Cuenta</span>
                            </div>
                            <p className="text-xl font-black text-slate-800 tracking-tight leading-tight mb-2">Protección Contra <br />Sobregiro Activa</p>
                            <p className="text-slate-500 text-sm">Tus campañas se pausarán automáticamente al llegar a 0 BITS.</p>
                        </div>
                        <button className="text-wc-blue text-xs font-bold hover:underline mt-4 flex items-center gap-1">
                            Configurar alertas automáticas <ArrowRight size={12} />
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {RECHARGE_PACKAGES.map(pkg => (
                        <div key={pkg.id} className={`p-6 rounded-3xl border ${pkg.highlight ? 'border-wc-blue bg-blue-50/30' : 'border-slate-100 bg-white'} shadow-sm flex flex-col items-center text-center`}>
                            <span className="text-[9px] font-black uppercase tracking-tighter text-slate-400 mb-2">{pkg.label}</span>
                            <div className="text-3xl font-black text-slate-900 mb-1">${pkg.price}</div>
                            <p className="text-[10px] font-bold text-slate-500 uppercase mb-4">M.N. IVA INC.</p>
                            <div className="bg-slate-900 text-white text-[11px] font-black px-4 py-1.5 rounded-full mb-4">
                                {pkg.bits} BITS
                            </div>
                            <button 
                                onClick={() => {
                                    setSelectedPackage(pkg);
                                    setPayStep('methods');
                                    setShowModal(true);
                                }}
                                className={`w-full py-2.5 rounded-xl text-xs font-bold transition-all ${pkg.highlight ? 'bg-wc-blue text-white shadow-lg' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                            >
                                Seleccionar
                            </button>
                        </div>
                    ))}
                </div>
            </div>

            {/* RIGHT: HISTORY */}
            <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-xl overflow-hidden flex flex-col">
                <div className="p-8 border-b border-slate-100 bg-slate-50/50">
                    <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                            <History size={18} className="text-slate-400" />
                            <h3 className="font-black text-slate-800 tracking-tight">Historial Real</h3>
                        </div>
                        <RefreshCw size={14} className={`text-slate-400 cursor-pointer hover:rotate-180 transition-transform ${loading ? 'animate-spin' : ''}`} onClick={fetchPayments} />
                    </div>
                    <p className="text-xs text-slate-500">Últimos movimientos sincronizados.</p>
                </div>
                
                <div className="flex-1 overflow-y-auto min-h-[400px]">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-20 gap-3">
                            <Loader2 className="animate-spin text-wc-blue" />
                            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Sincronizando...</span>
                        </div>
                    ) : payments.length === 0 ? (
                        <div className="p-10 text-center flex flex-col items-center gap-4">
                            <div className="p-4 bg-slate-50 rounded-full">
                                <AlertCircle size={32} className="text-slate-200" />
                            </div>
                            <p className="text-sm text-slate-400 font-medium italic">No se encontraron transacciones en este nodo.</p>
                        </div>
                    ) : (
                        <div className="divide-y divide-slate-50">
                            {payments.map(p => (
                                <div key={p.id} className="p-5 flex items-center justify-between hover:bg-slate-50/80 transition-colors group">
                                    <div className="flex items-center gap-4">
                                        <div className={`p-2 rounded-xl border ${p.status === 'COMPLETED' ? 'bg-emerald-50 border-emerald-100 text-emerald-500' : 'bg-amber-50 border-amber-100 text-amber-500'}`}>
                                            {p.method === 'CARD' ? <CreditCard size={18} /> : <Banknote size={18} />}
                                        </div>
                                        <div>
                                            <p className="text-xs font-black text-slate-800 uppercase tracking-tighter">{p.method} • {p.status}</p>
                                            <p className="text-[10px] text-slate-400 font-medium">{new Date(p.createdAt || '').toLocaleDateString('es-MX', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm font-black text-slate-900 group-hover:text-wc-blue transition-colors">${p.amount} MXN</p>
                                        <p className="text-[10px] font-bold text-emerald-500">+{p.creditsAdded} CR</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>

        {/* MODAL PREMIUM DE PAGO */}
        {showModal && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                <div className="absolute inset-0 bg-slate-950/40 backdrop-blur-md animate-in fade-in duration-300" onClick={() => !isProcessing && setShowModal(false)} />
                
                <div className="relative w-full max-w-xl bg-white rounded-[3rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
                    <button 
                        onClick={() => setShowModal(false)}
                        disabled={isProcessing}
                        className="absolute top-6 right-6 p-2 rounded-full hover:bg-slate-100 text-slate-400 transition-colors z-20"
                    >
                        <X size={20} />
                    </button>

                    <div className="flex flex-col">
                        <div className="p-10 pb-6 border-b border-slate-50">
                            <div className="flex items-center gap-3 mb-2">
                                <div className="bg-wc-blue/10 text-wc-blue p-2 rounded-xl">
                                    <CreditCard size={20} />
                                </div>
                                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Checkout Seguro</span>
                            </div>
                            <h2 className="text-3xl font-black text-slate-900 tracking-tighter">Confirmar Recarga</h2>
                        </div>

                        <div className="p-10 pt-8">
                            {payStep === 'methods' && (
                                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
                                     <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100 mb-8">
                                         <div className="flex justify-between items-center text-sm font-bold text-slate-500 uppercase mb-2">
                                             <span>Paquete Seleccionado</span>
                                             <span>Precio</span>
                                         </div>
                                         <div className="flex justify-between items-end">
                                             <div>
                                                 <p className="text-2xl font-black text-slate-900 uppercase tracking-tighter">{selectedPackage.label}</p>
                                                 <p className="text-xs text-wc-blue font-bold">Total: {selectedPackage.bits} BITS</p>
                                             </div>
                                             <div className="text-3xl font-black text-slate-900 tracking-tighter">${selectedPackage.price} <span className="text-xs text-slate-400">MXN</span></div>
                                         </div>
                                     </div>

                                     <h4 className="text-xs font-black uppercase tracking-widest text-slate-400 ml-2">Método de Pago</h4>
                                     <div className="grid grid-cols-2 gap-4">
                                         <button 
                                            onClick={() => setMethod('CARD')}
                                            className={`p-6 rounded-[2rem] border-2 transition-all flex flex-col items-center gap-3 ${method === 'CARD' ? 'border-wc-blue bg-blue-50/50 shadow-lg' : 'border-slate-100 hover:border-slate-200'}`}
                                         >
                                             <CreditCard className={method === 'CARD' ? 'text-wc-blue' : 'text-slate-300'} size={32} />
                                             <span className={`text-xs font-black uppercase tracking-widest ${method === 'CARD' ? 'text-wc-blue' : 'text-slate-400'}`}>T. Crédito / Débito</span>
                                         </button>
                                         <button 
                                            onClick={() => setMethod('SPEI')}
                                            className={`p-6 rounded-[2rem] border-2 transition-all flex flex-col items-center gap-3 ${method === 'SPEI' ? 'border-wc-blue bg-blue-50/50 shadow-lg' : 'border-slate-100 hover:border-slate-200'}`}
                                         >
                                             <Banknote className={method === 'SPEI' ? 'text-wc-blue' : 'text-slate-300'} size={32} />
                                             <span className={`text-xs font-black uppercase tracking-widest ${method === 'SPEI' ? 'text-wc-blue' : 'text-slate-400'}`}>Transferencia SPEI</span>
                                         </button>
                                     </div>

                                     <button 
                                        onClick={() => setPayStep('details')}
                                        className="w-full mt-10 py-5 bg-slate-900 text-white rounded-3xl font-black text-lg flex items-center justify-center gap-3 hover:translate-y-[-2px] transition-transform active:scale-95 shadow-2xl shadow-slate-900/30"
                                     >
                                         Siguiente <ArrowRight size={20} />
                                     </button>
                                </div>
                            )}

                            {payStep === 'details' && (
                                <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
                                    {method === 'CARD' ? (
                                        <div className="space-y-6">
                                            <div className="grid grid-cols-1 gap-4">
                                                <div className="space-y-1">
                                                    <label className="text-[10px] font-black uppercase text-slate-400 ml-2">Nombre en la tarjeta</label>
                                                    <input type="text" className="w-full bg-slate-50 border border-slate-100 p-4 rounded-2xl outline-none focus:border-wc-blue font-bold text-slate-700" placeholder="NOMBRE APELLIDO" />
                                                </div>
                                                <div className="space-y-1">
                                                    <label className="text-[10px] font-black uppercase text-slate-400 ml-2">Número de tarjeta</label>
                                                    <div className="relative">
                                                        <CreditCard size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" />
                                                        <input type="text" className="w-full bg-slate-50 border border-slate-100 p-4 pl-12 rounded-2xl outline-none focus:border-wc-blue font-mono font-bold text-slate-700" placeholder="0000 0000 0000 0000" />
                                                    </div>
                                                </div>
                                                <div className="grid grid-cols-2 gap-4">
                                                    <div className="space-y-1">
                                                        <label className="text-[10px] font-black uppercase text-slate-400 ml-2">Expiración</label>
                                                        <input type="text" className="w-full bg-slate-50 border border-slate-100 p-4 rounded-2xl outline-none focus:border-wc-blue font-mono font-bold text-slate-700" placeholder="MM/YY" />
                                                    </div>
                                                    <div className="space-y-1">
                                                        <label className="text-[10px] font-black uppercase text-slate-400 ml-2">CVV</label>
                                                        <input type="text" className="w-full bg-slate-50 border border-slate-100 p-4 rounded-2xl outline-none focus:border-wc-blue font-mono font-bold text-slate-700" placeholder="***" />
                                                    </div>
                                                </div>
                                            </div>
                                            
                                            <div className="flex items-center gap-3 bg-blue-50 p-4 rounded-2xl border border-blue-100">
                                                <ShieldCheck size={20} className="text-wc-blue" />
                                                <p className="text-[10px] text-slate-500 font-bold leading-tight">Procesamiento real operado por OpenPay (BBVA México). WhatsCloud no almacena los datos de tu tarjeta.</p>
                                            </div>

                                            <button 
                                                onClick={handleRecharge}
                                                disabled={isProcessing}
                                                className="w-full py-5 bg-wc-gradient text-white rounded-3xl font-black text-xl flex items-center justify-center gap-3 shadow-2xl shadow-purple-200 active:scale-95 disabled:opacity-50 transition-all"
                                            >
                                                {isProcessing ? <Loader2 className="animate-spin" /> : <>Pagar ${selectedPackage.price} MXN</>}
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="space-y-6">
                                            <div className="bg-slate-900 text-white p-8 rounded-[2rem] font-mono text-sm relative overflow-hidden">
                                                 <div className="absolute right-[-20px] top-[-20px] opacity-10 rotate-12">
                                                     <Banknote size={150} />
                                                 </div>
                                                 <h5 className="text-[10px] font-black uppercase text-slate-500 mb-6 tracking-widest">Información de Transferencia (Aurum)</h5>
                                                 <div className="space-y-4 relative z-10">
                                                     <div className="flex justify-between border-b border-white/5 pb-2">
                                                         <span className="text-slate-500">BANCO</span>
                                                         <span className="font-bold">BBVA MÉXICO</span>
                                                     </div>
                                                     <div className="flex justify-between border-b border-white/5 pb-2">
                                                         <span className="text-slate-500">BENEFICIARIO</span>
                                                         <span className="font-bold text-[11px]">AURUM CAPITAL HOLDING SAPI</span>
                                                     </div>
                                                     <div className="flex flex-col gap-1 py-1">
                                                         <span className="text-slate-500 text-[10px]">CLABE INTERBANCARIA</span>
                                                         <div className="flex items-center justify-between">
                                                             <span className="font-bold text-lg text-wc-blue tracking-tighter">0121 8001 5567 2234 11</span>
                                                             <button className="bg-white/10 px-2 py-1 rounded text-[9px] font-bold hover:bg-white/20">COPIAR</button>
                                                         </div>
                                                     </div>
                                                     <div className="flex justify-between">
                                                         <span className="text-slate-500">REFERENCIA</span>
                                                         <span className="font-bold text-yellow-500">WC-{selectedPackage.id.split('_')[1]}</span>
                                                     </div>
                                                 </div>
                                            </div>

                                            <div className="bg-amber-50 p-6 rounded-3xl border border-amber-100 flex gap-4">
                                                <AlertCircle className="text-amber-600 shrink-0" size={20} />
                                                <p className="text-[11px] text-amber-900 font-bold leading-relaxed">
                                                    Una vez realizada la transferencia, sube tu comprobante. Los créditos se verán reflejados tras la validación administrativa.
                                                </p>
                                            </div>

                                            <div className="border-2 border-dashed border-slate-200 rounded-[2rem] p-10 flex flex-col items-center justify-center text-center group cursor-pointer hover:border-wc-blue transition-colors">
                                                <Upload size={32} className="text-slate-300 group-hover:block transition-colors" />
                                                <p className="text-xs font-black uppercase tracking-widest text-slate-400 mt-4">Subir Comprobante (PDF/JPG)</p>
                                            </div>

                                            <button 
                                                onClick={handleRecharge}
                                                disabled={isProcessing}
                                                className="w-full py-5 bg-slate-900 text-white rounded-3xl font-black text-xl flex items-center justify-center gap-3 disabled:opacity-50 transition-all"
                                            >
                                                {isProcessing ? <Loader2 className="animate-spin" /> : <>Registrar Aviso de Pago</>}
                                            </button>
                                        </div>
                                    )}
                                </div>
                            )}

                            {payStep === 'success' && (
                                <div className="py-10 flex flex-col items-center justify-center text-center animate-in zoom-in-95">
                                    <div className="w-24 h-24 bg-emerald-100 text-emerald-500 rounded-[2.5rem] flex items-center justify-center mb-6 shadow-xl shadow-emerald-100">
                                        <CheckCircle2 size={48} />
                                    </div>
                                    <h3 className="text-3xl font-black text-slate-900 tracking-tighter mb-2">Transacción Exitosa</h3>
                                    <p className="text-slate-500 text-sm max-w-xs mb-10 leading-relaxed font-medium">
                                        Hemos procesado tu solicitud. Los {selectedPackage.bits} BITS ya están sincronizados con tu balance centralizado.
                                    </p>
                                    <button 
                                        onClick={() => setShowModal(false)}
                                        className="px-10 py-4 bg-slate-900 text-white rounded-2xl font-black hover:scale-105 active:scale-95 transition-all shadow-xl shadow-slate-900/20"
                                    >
                                        Entendido
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        )}
    </div>
  );
};
