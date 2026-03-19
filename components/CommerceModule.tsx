import React, { useState, useEffect } from 'react';
import { ShoppingBag, ShoppingCart, Tag, Plus, Edit2, Trash2, PackageSearch } from 'lucide-react';

interface Category {
    id: string;
    name: string;
    Products?: Product[];
}

interface Product {
    id: string;
    name: string;
    description: string;
    price: string | number;
    imageUrl: string;
    isActive: boolean;
    categoryId: string;
    Category?: Category;
}

interface Order {
    id: string;
    totalAmount: string | number;
    status: string;
    paymentMethod: string;
    createdAt: string;
    Lead: {
        id: string;
        businessName: string;
        phone: string;
    };
    items: OrderItem[];
}

interface OrderItem {
    id: string;
    quantity: number;
    unitPrice: string | number;
    Product: {
        name: string;
        imageUrl: string;
    };
}

export const CommerceModule: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'catalog' | 'orders'>('catalog');
    
    // State lists
    const [categories, setCategories] = useState<Category[]>([]);
    const [products, setProducts] = useState<Product[]>([]);
    const [orders, setOrders] = useState<Order[]>([]);

    // Modals & Forms
    const [showProductModal, setShowProductModal] = useState(false);
    const [showCategoryModal, setShowCategoryModal] = useState(false);
    const [editItemId, setEditItemId] = useState<string | null>(null);

    const [catForm, setCatForm] = useState({ name: '' });
    const [prodForm, setProdForm] = useState({ name: '', description: '', price: '0', categoryId: '', imageUrl: '', isActive: true });

    useEffect(() => {
        fetchCategories();
        fetchProducts();
        fetchOrders();
    }, []);

    const fetchCategories = async () => {
        const token = localStorage.getItem('wc_auth_token');
        const res = await fetch('/api/commerce/categories', { headers: { 'Authorization': `Bearer ${token}` } });
        if (res.ok) setCategories(await res.json());
    };

    const fetchProducts = async () => {
        const token = localStorage.getItem('wc_auth_token');
        const res = await fetch('/api/commerce/products', { headers: { 'Authorization': `Bearer ${token}` } });
        if (res.ok) setProducts(await res.json());
    };

    const fetchOrders = async () => {
        const token = localStorage.getItem('wc_auth_token');
        const res = await fetch('/api/commerce/orders', { headers: { 'Authorization': `Bearer ${token}` } });
        if (res.ok) setOrders(await res.json());
    };

    const handleSaveCategory = async (e: React.FormEvent) => {
        e.preventDefault();
        const token = localStorage.getItem('wc_auth_token');
        const method = editItemId ? 'PUT' : 'POST';
        const url = editItemId ? `/api/commerce/categories/${editItemId}` : '/api/commerce/categories';

        await fetch(url, {
            method,
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify(catForm)
        });

        setShowCategoryModal(false);
        setEditItemId(null);
        setCatForm({ name: '' });
        fetchCategories();
    };

    const handleDeleteCategory = async (id: string) => {
        if (!confirm('Eliminar esta categoría? Asegúrate de que no tenga productos asociados.')) return;
        const token = localStorage.getItem('wc_auth_token');
        await fetch(`/api/commerce/categories/${id}`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` } });
        fetchCategories();
    };

    const handleSaveProduct = async (e: React.FormEvent) => {
        e.preventDefault();
        const token = localStorage.getItem('wc_auth_token');
        const method = editItemId ? 'PUT' : 'POST';
        const url = editItemId ? `/api/commerce/products/${editItemId}` : '/api/commerce/products';

        await fetch(url, {
            method,
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify(prodForm)
        });

        setShowProductModal(false);
        setEditItemId(null);
        setProdForm({ name: '', description: '', price: '0', categoryId: '', imageUrl: '', isActive: true });
        fetchProducts();
    };

    const handleDeleteProduct = async (id: string) => {
        if (!confirm('Seguro que deseas eliminar este producto?')) return;
        const token = localStorage.getItem('wc_auth_token');
        await fetch(`/api/commerce/products/${id}`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` } });
        fetchProducts();
    };

    const updateOrderStatus = async (id: string, status: string) => {
        const token = localStorage.getItem('wc_auth_token');
        await fetch(`/api/commerce/orders/${id}/status`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify({ status })
        });
        fetchOrders();
    };

    return (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden animate-in fade-in duration-500 flex flex-col h-[calc(100vh-12rem)]">
            {/* Header / Tabs */}
            <div className="border-b border-slate-200 flex p-4 bg-slate-50 justify-between items-center">
                <div className="flex gap-4">
                    <button 
                        onClick={() => setActiveTab('catalog')}
                        className={`font-black flex items-center gap-2 px-4 py-2 rounded-xl transition-all ${
                            activeTab === 'catalog' ? 'bg-wc-blue text-white shadow-md' : 'text-slate-500 hover:bg-slate-200'
                        }`}
                    >
                        <Tag size={18} /> Catálogo de Productos
                    </button>
                    <button 
                        onClick={() => setActiveTab('orders')}
                        className={`font-black flex items-center gap-2 px-4 py-2 rounded-xl transition-all ${
                            activeTab === 'orders' ? 'bg-wc-green text-white shadow-md' : 'text-slate-500 hover:bg-slate-200'
                        }`}
                    >
                        <ShoppingCart size={18} /> Pedidos Whatsapp
                    </button>
                </div>
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-y-auto p-8 relative">
                {activeTab === 'catalog' && (
                    <div className="space-y-8">
                        {/* Categorías */}
                        <div>
                            <div className="flex justify-between items-end mb-4">
                                <div>
                                    <h3 className="text-xl font-black text-slate-800">Categorías</h3>
                                    <p className="text-sm text-slate-500">Agrupa tus productos (Ej: Pizzas, Bebidas)</p>
                                </div>
                                <button onClick={() => { setEditItemId(null); setCatForm({ name: ''}); setShowCategoryModal(true); }} className="flex items-center gap-2 bg-slate-100 px-4 py-2 rounded-xl text-slate-700 font-bold hover:bg-slate-200 transition-colors">
                                    <Plus size={16} /> Nueva Categoría
                                </button>
                            </div>
                            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                                {categories.map(cat => (
                                    <div key={cat.id} className="bg-white border border-slate-200 rounded-xl p-4 flex justify-between items-center shadow-sm hover:border-wc-blue transition-colors group">
                                        <span className="font-bold text-slate-700 truncate">{cat.name}</span>
                                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button onClick={() => { setEditItemId(cat.id); setCatForm({ name: cat.name }); setShowCategoryModal(true); }} className="text-slate-400 hover:text-wc-blue"><Edit2 size={14} /></button>
                                            <button onClick={() => handleDeleteCategory(cat.id)} className="text-slate-400 hover:text-red-500"><Trash2 size={14} /></button>
                                        </div>
                                    </div>
                                ))}
                                {categories.length === 0 && <span className="text-slate-400 text-sm">No hay categorías.</span>}
                            </div>
                        </div>

                        {/* Productos */}
                        <div>
                            <div className="flex justify-between items-end mb-4 mt-8">
                                <div>
                                    <h3 className="text-xl font-black text-slate-800">Productos</h3>
                                    <p className="text-sm text-slate-500">Lo que tu Bot de IA puede vender a los clientes.</p>
                                </div>
                                <button onClick={() => { setEditItemId(null); setProdForm({ name: '', description: '', price: '0', categoryId: categories[0]?.id || '', imageUrl: '', isActive: true}); setShowProductModal(true); }} className="flex items-center gap-2 bg-wc-blue text-white px-4 py-2 rounded-xl font-bold hover:bg-blue-600 transition-colors shadow-md">
                                    <Plus size={16} /> Nuevo Producto
                                </button>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {products.map(prod => (
                                    <div key={prod.id} className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow group flex flex-col">
                                        <div className="h-40 bg-slate-100 relative">
                                            {prod.imageUrl ? (
                                                <img src={prod.imageUrl} alt={prod.name} className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-slate-300">
                                                    <PackageSearch size={48} />
                                                </div>
                                            )}
                                            <div className="absolute top-2 right-2 flex gap-1 bg-white/90 backdrop-blur-sm p-1 rounded-lg">
                                                <button onClick={() => { setEditItemId(prod.id); setProdForm({ name: prod.name, description: prod.description || '', price: prod.price.toString(), categoryId: prod.categoryId, imageUrl: prod.imageUrl || '', isActive: prod.isActive }); setShowProductModal(true); }} className="p-1 text-slate-500 hover:text-wc-blue"><Edit2 size={16} /></button>
                                                <button onClick={() => handleDeleteProduct(prod.id)} className="p-1 text-slate-500 hover:text-red-500"><Trash2 size={16} /></button>
                                            </div>
                                        </div>
                                        <div className="p-4 flex-1 flex flex-col">
                                            <div className="flex justify-between items-start mb-2">
                                                <h4 className="font-bold text-slate-800">{prod.name}</h4>
                                                <span className="font-black text-wc-green">${parseFloat(prod.price as string).toFixed(2)}</span>
                                            </div>
                                            <p className="text-xs text-slate-500 mb-4 line-clamp-2">{prod.description || 'Sin descripción'}</p>
                                            <div className="mt-auto flex justify-between items-center text-[10px] font-bold uppercase tracking-widest text-slate-400">
                                                <span>{prod.Category?.name || 'Uncategorized'}</span>
                                                <span className={prod.isActive ? "text-wc-blue" : "text-red-400"}>{prod.isActive ? 'Activo' : 'Inactivo'}</span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                                {products.length === 0 && <span className="text-slate-400 text-sm">No hay productos. Agrega categorías primero.</span>}
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'orders' && (
                    <div className="space-y-6">
                        <div className="flex justify-between items-center">
                            <h3 className="text-xl font-black text-slate-800">Tablero de Pedidos</h3>
                        </div>
                        {orders.length === 0 ? (
                            <div className="text-center py-12 text-slate-400">
                                <ShoppingBag size={48} className="mx-auto mb-4 opacity-20" />
                                <p>Aún no has recibido ningún pedido vía WhatsApp.</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {orders.map(order => (
                                    <div key={order.id} className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col md:flex-row gap-6">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-3 mb-2">
                                                <span className={`px-3 py-1 text-[10px] font-black uppercase rounded-full ${
                                                    order.status === 'PENDING' ? 'bg-amber-100 text-amber-700' :
                                                    order.status === 'PAID' ? 'bg-wc-blue/10 text-wc-blue' :
                                                    order.status === 'SHIPPED' ? 'bg-wc-green/10 text-wc-green' : 'bg-slate-100 text-slate-500'
                                                }`}>{order.status}</span>
                                                <span className="text-xs font-mono text-slate-400">ID: {order.id.split('-')[0]}</span>
                                                <span className="text-xs text-slate-400 block">{new Date(order.createdAt).toLocaleString()}</span>
                                            </div>
                                            <h4 className="text-lg font-bold text-slate-800">{order.Lead.businessName || order.Lead.phone}</h4>
                                            <p className="text-sm font-mono text-slate-500 mb-4">{order.Lead.phone}</p>
                                            
                                            <div className="space-y-2">
                                                {order.items?.map(item => (
                                                    <div key={item.id} className="flex justify-between text-sm items-center border-b border-slate-100 pb-2">
                                                        <span className="text-slate-700 flex items-center gap-2">
                                                            <span className="font-black text-slate-400">{item.quantity}x</span> 
                                                            {item.Product?.name || 'Producto Eliminado'}
                                                        </span>
                                                        <span className="font-bold text-slate-800">${parseFloat(item.unitPrice as string).toFixed(2)}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                        <div className="w-full md:w-64 bg-slate-50 rounded-xl p-4 border border-slate-100 flex flex-col justify-between">
                                            <div>
                                                <span className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Total Pedido</span>
                                                <span className="text-3xl font-black text-wc-green">${parseFloat(order.totalAmount as string).toFixed(2)}</span>
                                            </div>
                                            <div className="mt-6 flex flex-col gap-2">
                                                <select 
                                                    value={order.status}
                                                    onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                                                    className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm font-bold text-slate-700 focus:outline-none focus:border-wc-blue"
                                                >
                                                    <option value="PENDING">Pendiente (Bot recogió orden)</option>
                                                    <option value="PAID">Pagado (Checkout exitoso)</option>
                                                    <option value="SHIPPED">Enviado / Preparando</option>
                                                    <option value="COMPLETED">Completado</option>
                                                    <option value="CANCELLED">Cancelado</option>
                                                </select>
                                                <button className="w-full bg-wc-blue text-white rounded-lg px-3 py-2 text-sm font-bold hover:bg-blue-600">Ver Chat</button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Category Modal */}
            {showCategoryModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl overflow-hidden animate-in zoom-in-95 p-6">
                         <h3 className="font-bold text-lg mb-4 text-slate-800">{editItemId ? 'Editar Categoría' : 'Nueva Categoría'}</h3>
                         <form onSubmit={handleSaveCategory} className="space-y-4">
                             <div>
                                 <label className="text-xs font-bold text-slate-500 uppercase">Nombre</label>
                                 <input required type="text" value={catForm.name} onChange={e => setCatForm({...catForm, name: e.target.value})} className="w-full border border-slate-200 rounded-lg p-2 mt-1 focus:border-wc-blue outline-none text-sm"/>
                             </div>
                             <div className="flex justify-end gap-2 pt-2">
                                 <button type="button" onClick={() => setShowCategoryModal(false)} className="px-4 py-2 text-slate-500 font-bold hover:bg-slate-100 rounded-lg text-sm">Cancelar</button>
                                 <button type="submit" className="px-4 py-2 bg-wc-blue text-white font-bold rounded-lg text-sm">Guardar</button>
                             </div>
                         </form>
                    </div>
                </div>
            )}

            {/* Product Modal */}
            {showProductModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden animate-in zoom-in-95 p-6">
                         <h3 className="font-bold text-lg mb-4 text-slate-800">{editItemId ? 'Editar Producto' : 'Nuevo Producto'}</h3>
                         <form onSubmit={handleSaveProduct} className="space-y-4">
                             <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-xs font-bold text-slate-500 uppercase">Nombre</label>
                                    <input required type="text" value={prodForm.name} onChange={e => setProdForm({...prodForm, name: e.target.value})} className="w-full border border-slate-200 rounded-lg p-2 mt-1 focus:border-wc-blue outline-none text-sm"/>
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-slate-500 uppercase">Categoría</label>
                                    <select required value={prodForm.categoryId} onChange={e => setProdForm({...prodForm, categoryId: e.target.value})} className="w-full border border-slate-200 rounded-lg p-2 mt-1 focus:border-wc-blue outline-none text-sm bg-white">
                                        <option value="" disabled>Selecciona...</option>
                                        {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                    </select>
                                </div>
                             </div>
                             <div>
                                <label className="text-xs font-bold text-slate-500 uppercase">Precio ($)</label>
                                <input required type="number" step="0.01" value={prodForm.price} onChange={e => setProdForm({...prodForm, price: e.target.value})} className="w-full border border-slate-200 rounded-lg p-2 mt-1 focus:border-wc-blue outline-none text-sm"/>
                             </div>
                             <div>
                                <label className="text-xs font-bold text-slate-500 uppercase">Descripción</label>
                                <textarea value={prodForm.description} onChange={e => setProdForm({...prodForm, description: e.target.value})} className="w-full border border-slate-200 rounded-lg p-2 mt-1 focus:border-wc-blue outline-none text-sm" rows={2}/>
                             </div>
                             <div>
                                <label className="text-xs font-bold text-slate-500 uppercase">URL de Imagen</label>
                                <input type="url" value={prodForm.imageUrl} onChange={e => setProdForm({...prodForm, imageUrl: e.target.value})} placeholder="https://..." className="w-full border border-slate-200 rounded-lg p-2 mt-1 focus:border-wc-blue outline-none text-sm"/>
                             </div>
                             <div className="flex justify-end gap-2 pt-4">
                                 <button type="button" onClick={() => setShowProductModal(false)} className="px-4 py-2 text-slate-500 font-bold hover:bg-slate-100 rounded-lg text-sm">Cancelar</button>
                                 <button type="submit" disabled={!prodForm.categoryId} className="px-4 py-2 bg-wc-blue text-white font-bold rounded-lg text-sm disabled:opacity-50">Guardar</button>
                             </div>
                         </form>
                    </div>
                </div>
            )}
        </div>
    );
};
