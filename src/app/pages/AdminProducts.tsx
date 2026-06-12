import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { ArrowLeft, Plus, Edit3, Trash2, Search, Upload, Loader2 } from 'lucide-react';
import { productService } from '../services/productService';
import { toast } from 'sonner';
import api from '../services/api';
import axios from 'axios';

export function AdminProducts() {
  const navigate = useNavigate();
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [form, setForm] = useState({ name: '', description: '', price: '', originalPrice: '', stock: '', category: '', image: '' });
  const [uploading, setUploading] = useState(false);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const apiKey = import.meta.env.VITE_IMGBB_API_KEY || '600a7523f557d34d8efd20a8c2794c77';
    setUploading(true);
    const formData = new FormData();
    formData.append('image', file);

    try {
      const response = await axios.post(`https://api.imgbb.com/1/upload?key=${apiKey}`, formData);
      const url = response.data.data.url;
      setForm(f => ({ ...f, image: url }));
      toast.success('Image uploaded successfully!');
    } catch (err: any) {
      console.error('Upload error:', err);
      const msg = err.response?.data?.error?.message || 'Failed to upload image. Please try again.';
      toast.error(msg);
    } finally {
      setUploading(false);
    }
  };

  const fetchProducts = () => {
    setLoading(true);
    productService.getProducts({ limit: 100, search })
      .then(res => setProducts(res.data.products))
      .catch(() => toast.error('Failed to load products'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchProducts();
    api.get('/categories').then(res => setCategories(res.data)).catch(() => {});
  }, [search]);

  const openEdit = (product: any) => {
    setForm({
      name: product.name,
      description: product.description,
      price: String(product.price),
      originalPrice: product.originalPrice ? String(product.originalPrice) : '',
      stock: String(product.stock),
      category: product.category?._id || product.category || '',
      image: product.images?.[0] || '',
    });
    setEditing(product);
    setShowForm(true);
  };

  const openCreate = () => {
    setForm({ name: '', description: '', price: '', originalPrice: '', stock: '0', category: '', image: '' });
    setEditing(null);
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!form.name || !form.price || !form.description || !form.category) {
      toast.error('Name, description, price, and category are required');
      return;
    }
    try {
      const payload = {
        name: form.name,
        description: form.description,
        price: Number(form.price),
        originalPrice: form.originalPrice ? Number(form.originalPrice) : undefined,
        stock: Number(form.stock) || 0,
        category: form.category,
        images: form.image ? [form.image] : [],
      };
      if (editing) {
        await productService.updateProduct(editing._id, payload);
        toast.success('Product updated');
      } else {
        await productService.createProduct(payload);
        toast.success('Product created');
      }
      setShowForm(false);
      setEditing(null);
      fetchProducts();
    } catch {
      toast.error('Failed to save product');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this product?')) return;
    try {
      await productService.deleteProduct(id);
      toast.success('Product deleted');
      fetchProducts();
    } catch {
      toast.error('Failed to delete');
    }
  };

  return (
    <div className="min-h-full bg-gray-50 dark:bg-background transition-colors duration-300">
      <div className="bg-white dark:bg-surface px-6 pt-12 pb-4 lg:pt-0 border-b border-gray-100 dark:border-border-light">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate('/admin')} className="w-10 h-10 -ml-2 rounded-full flex items-center justify-center text-gray-900 dark:text-text-primary">
              <ArrowLeft size={24} />
            </button>
            <h1 className="text-xl font-bold text-gray-900 dark:text-text-primary">Products</h1>
          </div>
          <button onClick={openCreate} className="bg-blue-600 text-white rounded-xl p-2.5">
            <Plus size={20} />
          </button>
        </div>
        <div className="relative mt-3">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-text-tertiary" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search products..."
            className="w-full bg-gray-50 dark:bg-background rounded-xl pl-10 pr-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-200"
          />
        </div>
      </div>

      <div className="p-6 overflow-y-auto">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : products.length === 0 ? (
          <p className="text-center text-gray-400 dark:text-text-tertiary py-20">No products found</p>
        ) : (
          <div className="space-y-3">
            {products.map(product => (
              <div key={product._id} className="bg-white dark:bg-surface rounded-2xl shadow-sm border border-gray-100 dark:border-border-light p-4 flex gap-4">
                <div className="w-16 h-16 bg-gray-50 dark:bg-background rounded-xl overflow-hidden shrink-0">
                  {product.images?.[0] ? (
                    <img src={product.images[0]} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-300 dark:text-text-tertiary text-xs">No img</div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-gray-900 dark:text-text-primary text-sm truncate">{product.name}</p>
                  <p className="text-xs text-gray-400 dark:text-text-tertiary mt-0.5">₹{product.price} · Stock: {product.stock}</p>
                  <p className="text-xs text-gray-400 dark:text-text-tertiary">{product.category?.name || ''}</p>
                </div>
                <div className="flex flex-col gap-1.5">
                  <button onClick={() => openEdit(product)} className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-500/20 text-blue-600 flex items-center justify-center">
                    <Edit3 size={14} />
                  </button>
                  <button onClick={() => handleDelete(product._id)} className="w-8 h-8 rounded-lg bg-red-50 text-red-500 flex items-center justify-center">
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-black/40">
          <div className="bg-white dark:bg-surface w-full md:max-w-md md:rounded-2xl rounded-t-2xl p-6 max-h-[85vh] overflow-y-auto">
            <h2 className="text-lg font-bold text-gray-900 dark:text-text-primary mb-4">{editing ? 'Edit Product' : 'Add Product'}</h2>
            <div className="space-y-3">
              <div>
                <label className="text-xs font-medium text-gray-500 dark:text-text-secondary">Name *</label>
                <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} className="w-full bg-gray-50 dark:bg-background rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-200" />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500 dark:text-text-secondary">Description</label>
                <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} rows={3} className="w-full bg-gray-50 dark:bg-background rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-200 resize-none" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-gray-500 dark:text-text-secondary">Price *</label>
                  <input type="number" value={form.price} onChange={e => setForm(f => ({ ...f, price: e.target.value }))} className="w-full bg-gray-50 dark:bg-background rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-200" />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-500 dark:text-text-secondary">Original Price</label>
                  <input type="number" value={form.originalPrice} onChange={e => setForm(f => ({ ...f, originalPrice: e.target.value }))} className="w-full bg-gray-50 dark:bg-background rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-200" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-gray-500 dark:text-text-secondary">Stock</label>
                  <input type="number" value={form.stock} onChange={e => setForm(f => ({ ...f, stock: e.target.value }))} className="w-full bg-gray-50 dark:bg-background rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-200" />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-500 dark:text-text-secondary">Category *</label>
                  <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))} className="w-full bg-gray-50 dark:bg-background rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-200">
                    <option value="">Select category</option>
                    {categories.map(c => (
                      <option key={c._id} value={c._id}>{c.name}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500 dark:text-text-secondary block mb-1">Product Image</label>
                <div className="flex gap-2">
                  <input
                    value={form.image}
                    onChange={e => setForm(f => ({ ...f, image: e.target.value }))}
                    placeholder="Paste image URL here..."
                    className="flex-1 bg-gray-50 dark:bg-background rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-200"
                  />
                  <div>
                    <input
                      type="file"
                      accept="image/*"
                      id="admin-image-upload"
                      onChange={handleImageUpload}
                      disabled={uploading}
                      className="hidden"
                    />
                    <label
                      htmlFor="admin-image-upload"
                      className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-semibold rounded-xl border border-gray-200 dark:border-border-medium bg-white dark:bg-surface-secondary text-gray-700 dark:text-text-primary cursor-pointer hover:bg-gray-50 active:scale-[0.98] transition-all ${uploading ? 'opacity-60 cursor-not-allowed' : ''}`}
                    >
                      {uploading ? (
                        <Loader2 size={16} className="animate-spin text-blue-600" />
                      ) : (
                        <Upload size={16} className="text-blue-600" />
                      )}
                      <span>Upload</span>
                    </label>
                  </div>
                </div>
                {form.image && (
                  <div className="mt-2 w-16 h-16 rounded-xl overflow-hidden border border-gray-150 relative group">
                    <img src={form.image} alt="Preview" className="w-full h-full object-cover" />
                    <button 
                      type="button" 
                      onClick={() => setForm(f => ({ ...f, image: '' }))} 
                      className="absolute inset-0 bg-black/40 text-white text-[10px] font-bold flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      Remove
                    </button>
                  </div>
                )}
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setShowForm(false)} className="flex-1 bg-gray-100 dark:bg-surface-tertiary text-gray-700 dark:text-text-primary font-semibold rounded-xl py-3">Cancel</button>
              <button onClick={handleSave} className="flex-1 bg-blue-600 text-white font-semibold rounded-xl py-3">Save</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
