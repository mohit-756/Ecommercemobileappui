import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { ArrowLeft, Plus, Edit3, Trash2, Search, Upload, Loader2, HelpCircle } from 'lucide-react';
import { productService } from '../services/productService';
import { toast } from 'sonner';
import api from '../services/api';
import axios from 'axios';
import { cn } from '../lib/utils';

export function AdminProducts() {
  const navigate = useNavigate();
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [form, setForm] = useState({ name: '', description: '', price: '', offerPercentage: '', originalPrice: '', stock: '', category: '', image: '', variants: [] as any[] });
  const [uploading, setUploading] = useState(false);
  const [bulkUploading, setBulkUploading] = useState(false);
  const [showBulkHelp, setShowBulkHelp] = useState(false);
  const [activeFormTab, setActiveFormTab] = useState<'general' | 'variants'>('general');

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

  const handleBulkUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('File size exceeds the 5MB limit. Please upload a smaller file.');
      e.target.value = '';
      return;
    }

    // Validate format
    const ext = file.name.split('.').pop()?.toLowerCase();
    if (ext !== 'xlsx' && ext !== 'xls' && ext !== 'csv') {
      toast.error('Invalid file format. Please upload an Excel (.xlsx, .xls) or CSV (.csv) file.');
      e.target.value = '';
      return;
    }

    setBulkUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await api.post('/products/bulk-upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      toast.success(`Successfully imported ${res.data.productsCreated} products!`);
      fetchProducts();
    } catch (err: any) {
      console.error('Bulk upload error:', err);
      const msg = err.response?.data?.message || 'Failed to import products. Ensure columns match the template.';
      toast.error(msg);
    } finally {
      setBulkUploading(false);
      e.target.value = '';
    }
  };

  const downloadSampleTemplate = () => {
    const headers = 'Name,Description,Price,OriginalPrice,Stock,Category,Image,Variants\n';
    const sampleRow = 'Premium Walnuts,Organic walnuts rich in omega-3,649,749,50,Nuts,https://res.cloudinary.com/dcdpve12g/image/upload/v1781063664/walnuts_ux9wue.webp,"100g:149,250g:349,500g:649"\n';
    const csvContent = "data:text/csv;charset=utf-8," + encodeURIComponent(headers + sampleRow);
    const link = document.createElement("a");
    link.setAttribute("href", csvContent);
    link.setAttribute("download", "bulk_product_template.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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
    api.get('/categories').then(res => {
      const sorted = (res.data || []).sort((a: any, b: any) =>
        a.name.localeCompare(b.name, undefined, { sensitivity: 'base', numeric: true })
      );
      setCategories(sorted);
    }).catch(() => {});
  }, [search]);

  const openEdit = (product: any) => {
    setActiveFormTab('general');
    let mainOfferPct = '';
    if (product.originalPrice && product.originalPrice > product.price) {
      mainOfferPct = String(Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100));
    }
    
    const loadedVariants = (product.variants || []).map((v: any) => {
      let varOfferPct = '';
      if (v.originalPrice && v.originalPrice > v.price) {
        varOfferPct = String(Math.round(((v.originalPrice - v.price) / v.originalPrice) * 100));
      }
      return {
        ...v,
        price: String(v.price),
        originalPrice: v.originalPrice ? String(v.originalPrice) : '',
        offerPercentage: varOfferPct,
        stock: String(v.stock),
      };
    });

    setForm({
      name: product.name,
      description: product.description,
      price: String(product.price),
      offerPercentage: mainOfferPct,
      originalPrice: product.originalPrice ? String(product.originalPrice) : '',
      stock: String(product.stock),
      category: product.category?._id || product.category || '',
      image: product.images?.[0] || '',
      variants: loadedVariants,
    });
    setEditing(product);
    setShowForm(true);
  };

  const openCreate = () => {
    setActiveFormTab('general');
    setForm({ name: '', description: '', price: '', offerPercentage: '', originalPrice: '', stock: '0', category: '', image: '', variants: [] });
    setEditing(null);
    setShowForm(true);
  };

  const handleAddNewCategory = async () => {
    const name = prompt('Enter new category name:');
    if (!name || !name.trim()) return;
    try {
      const res = await api.post('/categories', { name: name.trim(), icon: 'LayoutGrid' });
      const newCat = res.data;
      setCategories(prev => {
        const updated = [...prev, newCat];
        return updated.sort((a: any, b: any) =>
          a.name.localeCompare(b.name, undefined, { sensitivity: 'base', numeric: true })
        );
      });
      setForm(f => ({ ...f, category: newCat._id }));
      toast.success(`Category "${name}" created!`);
    } catch {
      toast.error('Failed to create category');
    }
  };

  const handleAddVariant = () => {
    setForm(f => {
      const mainPct = f.offerPercentage;
      return {
        ...f,
        variants: [...(f.variants || []), { weight: '', price: '', offerPercentage: mainPct, originalPrice: '', stock: '0' }]
      };
    });
  };

  const handleUpdateVariant = (index: number, key: string, value: string) => {
    setForm(f => {
      const updated = [...(f.variants || [])];
      const currentVar = { ...updated[index], [key]: value };
      
      if (key === 'price' || key === 'offerPercentage') {
        const vPrice = Number(currentVar.price);
        const vPct = Number(currentVar.offerPercentage);
        if (vPrice && vPct) {
          currentVar.originalPrice = String(Math.round(vPrice / (1 - vPct / 100)));
        } else {
          currentVar.originalPrice = '';
        }
      }
      
      updated[index] = currentVar;
      return { ...f, variants: updated };
    });
  };

  const handleRemoveVariant = (index: number) => {
    setForm(f => ({
      ...f,
      variants: (f.variants || []).filter((_: any, idx: number) => idx !== index)
    }));
  };

  const handleSave = async () => {
    if (!form.name || !form.price || !form.description || !form.category) {
      toast.error('Name, description, price, and category are required');
      return;
    }

    // Validate variants
    for (const v of (form.variants || [])) {
      if (!v.weight || !v.weight.trim()) {
        toast.error('Each variant must have a weight specified (e.g. 250g)');
        return;
      }
      if (!v.price || Number(v.price) <= 0) {
        toast.error(`Variant "${v.weight}" must have a valid price`);
        return;
      }
    }

    try {
      const priceVal = Number(form.price);
      const originalPriceVal = form.originalPrice ? Number(form.originalPrice) : undefined;
      let discount: string | null = null;
      if (originalPriceVal && originalPriceVal > priceVal) {
        const pct = Math.round(((originalPriceVal - priceVal) / originalPriceVal) * 100);
        discount = `${pct}%`;
      }

      const mappedVariants = (form.variants || []).map((v: any) => ({
        weight: v.weight.trim(),
        price: Number(v.price) || 0,
        originalPrice: v.originalPrice ? Number(v.originalPrice) : undefined,
        stock: Number(v.stock) || 0,
      }));

      const payload = {
        name: form.name,
        description: form.description,
        price: priceVal,
        originalPrice: originalPriceVal,
        discount,
        stock: Number(form.stock) || 0,
        category: form.category,
        images: form.image ? [form.image] : [],
        variants: mappedVariants,
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
          <div className="flex items-center gap-2">
            <input
              type="file"
              accept=".xlsx,.xls,.csv"
              id="admin-bulk-upload"
              onChange={handleBulkUpload}
              disabled={bulkUploading}
              className="hidden"
            />
            <button
              type="button"
              onClick={() => setShowBulkHelp(true)}
              className="w-9 h-9 rounded-xl border border-gray-200 dark:border-border-medium flex items-center justify-center text-gray-500 dark:text-text-secondary hover:bg-gray-50 hover:text-blue-600 transition-colors"
              title="Bulk Import Help"
            >
              <HelpCircle size={18} />
            </button>
            <label
              htmlFor="admin-bulk-upload"
              className={cn(
                "flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-xl border border-gray-200 dark:border-border-medium bg-white dark:bg-surface-secondary text-gray-700 dark:text-text-primary cursor-pointer hover:bg-gray-50 active:scale-[0.98] transition-all",
                bulkUploading ? 'opacity-60 cursor-not-allowed' : ''
              )}
            >
              {bulkUploading ? (
                <Loader2 size={14} className="animate-spin text-blue-600" />
              ) : (
                <Upload size={14} className="text-blue-600" />
              )}
              <span className="hidden sm:inline">Bulk Import</span>
            </label>
            <button onClick={openCreate} className="bg-blue-600 text-white rounded-xl p-2.5 flex items-center justify-center cursor-pointer">
              <Plus size={20} />
            </button>
          </div>
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
        <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-black/40 p-4">
          <div className="bg-white dark:bg-surface w-full md:max-w-3xl md:rounded-2xl rounded-t-2xl p-6 md:p-8 max-h-[90vh] md:max-h-[85vh] overflow-y-auto shadow-2xl transition-all duration-300">
            <h2 className="text-xl font-bold text-gray-900 dark:text-text-primary mb-6">{editing ? 'Edit Product' : 'Add Product'}</h2>
            
            {/* Tab Navigation */}
            <div className="flex border-b border-gray-150 dark:border-border-medium mb-6">
              <button
                type="button"
                onClick={() => setActiveFormTab('general')}
                className={cn(
                  "pb-3 text-sm font-bold border-b-2 px-4 transition-colors cursor-pointer",
                  activeFormTab === 'general'
                    ? "border-blue-600 text-blue-600"
                    : "border-transparent text-gray-400 hover:text-gray-600 dark:text-text-tertiary dark:hover:text-text-secondary"
                )}
              >
                General Info
              </button>
              <button
                type="button"
                onClick={() => setActiveFormTab('variants')}
                className={cn(
                  "pb-3 text-sm font-bold border-b-2 px-4 transition-colors flex items-center gap-1.5 cursor-pointer",
                  activeFormTab === 'variants'
                    ? "border-blue-600 text-blue-600"
                    : "border-transparent text-gray-400 hover:text-gray-600 dark:text-text-tertiary dark:hover:text-text-secondary"
                )}
              >
                Weight Variants
                {form.variants && form.variants.length > 0 && (
                  <span className="bg-blue-100 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 text-[10px] font-black px-2 py-0.5 rounded-full">
                    {form.variants.length}
                  </span>
                )}
              </button>
            </div>

            {/* General Info Tab */}
            {activeFormTab === 'general' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fade-in">
                {/* Left Column (Details) */}
                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-semibold text-gray-500 dark:text-text-secondary block mb-1">Name *</label>
                    <input 
                      value={form.name} 
                      onChange={e => setForm(f => ({ ...f, name: e.target.value }))} 
                      placeholder="Enter product name"
                      className="w-full bg-gray-50 dark:bg-background border border-gray-150 dark:border-border-medium rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-200 text-gray-900 dark:text-text-primary" 
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-gray-500 dark:text-text-secondary block mb-1">Description *</label>
                    <textarea 
                      value={form.description} 
                      onChange={e => setForm(f => ({ ...f, description: e.target.value }))} 
                      placeholder="Write product description, health benefits, etc."
                      rows={4} 
                      className="w-full bg-gray-50 dark:bg-background border border-gray-150 dark:border-border-medium rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-200 resize-none text-gray-900 dark:text-text-primary" 
                    />
                  </div>
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <label className="text-xs font-semibold text-gray-500 dark:text-text-secondary">Category *</label>
                      <button
                        type="button"
                        onClick={handleAddNewCategory}
                        className="text-xs text-blue-600 font-bold hover:underline cursor-pointer"
                      >
                        + Add Category
                      </button>
                    </div>
                    <select 
                      value={form.category} 
                      onChange={e => setForm(f => ({ ...f, category: e.target.value }))} 
                      className="w-full bg-gray-50 dark:bg-background border border-gray-150 dark:border-border-medium rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-200 text-gray-900 dark:text-text-primary"
                    >
                      <option value="">Select category</option>
                      {categories.map(c => (
                        <option key={c._id} value={c._id}>{c.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Right Column (Price & Media) */}
                <div className="space-y-4">
                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="text-xs font-semibold text-gray-500 dark:text-text-secondary block mb-1">Price *</label>
                      <input 
                        type="number" 
                        value={form.price} 
                        onChange={e => {
                          const price = e.target.value;
                          setForm(f => {
                            const priceVal = Number(price);
                            const pctVal = Number(f.offerPercentage);
                            let origPrice = '';
                            if (priceVal && pctVal) {
                              origPrice = String(Math.round(priceVal / (1 - pctVal / 100)));
                            }
                            return { ...f, price: price, originalPrice: origPrice };
                          });
                        }} 
                        placeholder="₹"
                        className="w-full bg-gray-50 dark:bg-background border border-gray-150 dark:border-border-medium rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-200 text-gray-900 dark:text-text-primary" 
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-gray-500 dark:text-text-secondary block mb-1">Offer %</label>
                      <input 
                        type="number" 
                        min="0"
                        max="99"
                        value={form.offerPercentage} 
                        onChange={e => {
                          const pct = e.target.value;
                          setForm(f => {
                            const priceVal = Number(f.price);
                            const pctVal = Number(pct);
                            let origPrice = '';
                            if (priceVal && pctVal) {
                              origPrice = String(Math.round(priceVal / (1 - pctVal / 100)));
                            }
                            
                            const updatedVariants = (f.variants || []).map((v: any) => {
                              const varPriceVal = Number(v.price);
                              let varOrigPrice = v.originalPrice;
                              if (varPriceVal && pctVal) {
                                varOrigPrice = String(Math.round(varPriceVal / (1 - pctVal / 100)));
                              }
                              return {
                                ...v,
                                offerPercentage: pct,
                                originalPrice: varOrigPrice
                              };
                            });

                            return { 
                              ...f, 
                              offerPercentage: pct, 
                              originalPrice: origPrice,
                              variants: updatedVariants
                            };
                          });
                        }} 
                        placeholder="%"
                        className="w-full bg-gray-50 dark:bg-background border border-gray-150 dark:border-border-medium rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-200 text-gray-900 dark:text-text-primary" 
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-gray-500 dark:text-text-secondary block mb-1">Original Price</label>
                      <div className="w-full bg-gray-100 dark:bg-surface border border-gray-150 dark:border-border-medium rounded-xl px-4 py-2.5 text-sm text-gray-500 dark:text-text-secondary font-medium min-h-[42px] flex items-center">
                        {form.originalPrice ? `₹${form.originalPrice}` : '—'}
                      </div>
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-gray-500 dark:text-text-secondary block mb-1">Stock</label>
                    <input 
                      type="number" 
                      value={form.stock} 
                      onChange={e => setForm(f => ({ ...f, stock: e.target.value }))} 
                      className="w-full bg-gray-50 dark:bg-background border border-gray-150 dark:border-border-medium rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-200 text-gray-900 dark:text-text-primary" 
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-gray-500 dark:text-text-secondary block mb-1">Product Image</label>
                    <div className="flex gap-2">
                      <input
                        value={form.image}
                        onChange={e => setForm(f => ({ ...f, image: e.target.value }))}
                        placeholder="Paste image URL here..."
                        className="flex-1 bg-gray-50 dark:bg-background border border-gray-150 dark:border-border-medium rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-200 text-gray-900 dark:text-text-primary"
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
                      <div className="mt-3 w-24 h-24 rounded-2xl overflow-hidden border border-gray-200 relative group shadow-sm">
                        <img src={form.image} alt="Preview" className="w-full h-full object-cover" />
                        <button 
                          type="button" 
                          onClick={() => setForm(f => ({ ...f, image: '' }))} 
                          className="absolute inset-0 bg-black/45 text-white text-[10px] font-bold flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                        >
                          Remove
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Weight Variants Tab */}
            {activeFormTab === 'variants' && (
              <div className="space-y-6 animate-fade-in">
                <div className="flex justify-between items-center bg-gray-50 dark:bg-background/40 p-4 rounded-2xl border border-gray-100 dark:border-border-light">
                  <div>
                    <h3 className="text-sm font-black text-gray-955 dark:text-text-primary">Enable Multiple Pack Sizes</h3>
                    <p className="text-[11px] text-gray-400 dark:text-text-tertiary mt-0.5">Define variants like 250g, 500g, 1kg. If variants are added, customers will select from these on the shop page.</p>
                  </div>
                  <button
                    type="button"
                    onClick={handleAddVariant}
                    className="bg-blue-600 text-white text-xs font-bold px-4 py-2 rounded-xl hover:bg-blue-700 active:scale-95 transition-all shadow-md shadow-blue-200 dark:shadow-blue-900/30 cursor-pointer flex items-center gap-1"
                  >
                    <Plus size={14} /> Add Variant
                  </button>
                </div>

                {form.variants && form.variants.length > 0 ? (
                  <div className="border border-gray-150 dark:border-border-medium rounded-2xl overflow-hidden bg-white dark:bg-surface-secondary shadow-sm">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-gray-50 dark:bg-background/60 text-gray-500 dark:text-text-secondary text-[10px] font-extrabold uppercase tracking-wider border-b border-gray-150 dark:border-border-medium">
                          <th className="px-4 py-3">Weight (e.g. 500g) *</th>
                          <th className="px-4 py-3 w-[110px]">Price (₹) *</th>
                          <th className="px-4 py-3 w-[90px]">Offer %</th>
                          <th className="px-4 py-3 w-[130px]">Original Price (₹)</th>
                          <th className="px-4 py-3 w-[90px]">Stock</th>
                          <th className="px-4 py-3 w-[50px] text-center">Delete</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100 dark:divide-border-light">
                        {form.variants.map((v: any, index: number) => (
                          <tr key={index} className="hover:bg-gray-50/50 dark:hover:bg-surface-tertiary/20 transition-colors">
                            <td className="px-4 py-3">
                              <input
                                type="text"
                                placeholder="e.g. 500g"
                                value={v.weight}
                                onChange={(e) => handleUpdateVariant(index, 'weight', e.target.value)}
                                className="w-full bg-gray-50 dark:bg-background border border-gray-250 dark:border-border-medium rounded-xl px-3 py-2 text-xs outline-none text-gray-900 dark:text-text-primary focus:ring-2 focus:ring-blue-100"
                                required
                              />
                            </td>
                            <td className="px-4 py-3">
                              <input
                                type="number"
                                placeholder="₹"
                                value={v.price}
                                onChange={(e) => handleUpdateVariant(index, 'price', e.target.value)}
                                className="w-full bg-gray-50 dark:bg-background border border-gray-250 dark:border-border-medium rounded-xl px-3 py-2 text-xs outline-none text-gray-900 dark:text-text-primary focus:ring-2 focus:ring-blue-100"
                                required
                              />
                            </td>
                            <td className="px-4 py-3">
                              <input
                                type="number"
                                placeholder="%"
                                min="0"
                                max="99"
                                value={v.offerPercentage || ''}
                                onChange={(e) => handleUpdateVariant(index, 'offerPercentage', e.target.value)}
                                className="w-full bg-gray-50 dark:bg-background border border-gray-250 dark:border-border-medium rounded-xl px-3 py-2 text-xs outline-none text-gray-900 dark:text-text-primary focus:ring-2 focus:ring-blue-100"
                              />
                            </td>
                            <td className="px-4 py-3">
                              <div className="w-full bg-gray-100 dark:bg-surface border border-gray-250 dark:border-border-medium rounded-xl px-3 py-2 text-xs text-gray-500 dark:text-text-secondary min-h-[34px] flex items-center">
                                {v.originalPrice ? `₹${v.originalPrice}` : '—'}
                              </div>
                            </td>
                            <td className="px-4 py-3">
                              <input
                                type="number"
                                placeholder="0"
                                value={v.stock}
                                onChange={(e) => handleUpdateVariant(index, 'stock', e.target.value)}
                                className="w-full bg-gray-50 dark:bg-background border border-gray-250 dark:border-border-medium rounded-xl px-3 py-2 text-xs outline-none text-gray-900 dark:text-text-primary focus:ring-2 focus:ring-blue-100"
                              />
                            </td>
                            <td className="px-4 py-3 text-center">
                              <button
                                type="button"
                                onClick={() => handleRemoveVariant(index)}
                                className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 p-2 rounded-xl transition-colors inline-flex justify-center items-center"
                              >
                                <Trash2 size={15} />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-center py-10 border border-dashed border-gray-200 dark:border-border-medium rounded-3xl bg-gray-50/50 dark:bg-background/20">
                    <p className="text-xs text-gray-400 dark:text-text-tertiary">No variants added yet.</p>
                    <p className="text-[11px] text-gray-400 dark:text-text-tertiary mt-1">If you don't add variants, customers will purchase at the base price.</p>
                    <button
                      type="button"
                      onClick={handleAddVariant}
                      className="mt-3 bg-white dark:bg-surface border border-gray-200 dark:border-border-medium text-gray-700 dark:text-text-primary text-xs font-semibold px-4 py-2 rounded-xl hover:bg-gray-50 active:scale-95 transition-all shadow-sm"
                    >
                      + Add First Variant
                    </button>
                  </div>
                )}
              </div>
            )}

            <div className="flex gap-3 mt-8 justify-end border-t border-gray-100 dark:border-border-light pt-6">
              <button 
                onClick={() => setShowForm(false)} 
                className="px-6 py-3 rounded-xl bg-gray-100 dark:bg-surface-tertiary text-gray-700 dark:text-text-primary font-semibold text-sm hover:bg-gray-200 active:scale-95 transition-all"
              >
                Cancel
              </button>
              <button 
                onClick={handleSave} 
                className="px-8 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm shadow-md shadow-blue-200 dark:shadow-blue-900/30 active:scale-95 transition-all"
              >
                Save Product
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Help Modal for Bulk Upload */}
      {showBulkHelp && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fadeIn">
          <div className="bg-white dark:bg-surface w-full max-w-xl rounded-3xl p-6 md:p-8 max-h-[85vh] overflow-y-auto shadow-2xl transition-all border border-gray-150 dark:border-border-light text-left">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="text-lg font-black text-gray-900 dark:text-text-primary">Bulk Upload Guide</h3>
                <p className="text-xs text-gray-400 dark:text-text-tertiary mt-1">Import products easily using Excel/CSV templates</p>
              </div>
              <button
                onClick={() => setShowBulkHelp(false)}
                className="w-8 h-8 rounded-full bg-gray-50 dark:bg-surface-secondary flex items-center justify-center text-gray-600 dark:text-text-secondary hover:bg-gray-100 cursor-pointer text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <div className="space-y-5">
              <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-150 dark:border-blue-900/30 rounded-2xl p-4 space-y-2">
                <h4 className="text-xs font-bold text-blue-900 dark:text-blue-200 uppercase tracking-wide">Rules & Constraints</h4>
                <ul className="list-disc list-inside text-xs text-blue-800 dark:text-blue-300 space-y-1">
                  <li>Supported Formats: <strong>Excel (.xlsx, .xls)</strong> or <strong>CSV (.csv)</strong></li>
                  <li>Max File Size: <strong>5 MB</strong></li>
                  <li>Categories are automatically created if they don't exist in the store</li>
                </ul>
              </div>

              <div>
                <h4 className="text-xs font-bold text-gray-900 dark:text-text-primary uppercase tracking-wide mb-2">Required Columns</h4>
                <div className="overflow-x-auto border border-gray-100 dark:border-border-light rounded-xl">
                  <table className="w-full text-xs text-left">
                    <thead>
                      <tr className="bg-gray-50 dark:bg-surface-secondary text-gray-650 dark:text-text-secondary border-b border-gray-100 dark:border-border-light font-bold">
                        <th className="p-3">Column Name</th>
                        <th className="p-3">Description</th>
                        <th className="p-3">Example</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-border-light">
                      <tr>
                        <td className="p-3 font-semibold text-gray-900 dark:text-text-primary">Name</td>
                        <td className="p-3 text-gray-550 dark:text-text-secondary">Product display title</td>
                        <td className="p-3 text-gray-700 dark:text-text-primary">Premium Almonds</td>
                      </tr>
                      <tr>
                        <td className="p-3 font-semibold text-gray-900 dark:text-text-primary">Description</td>
                        <td className="p-3 text-gray-550 dark:text-text-secondary">Health info & descriptions</td>
                        <td className="p-3 text-gray-700 dark:text-text-primary">Fresh handpicked almonds...</td>
                      </tr>
                      <tr>
                        <td className="p-3 font-semibold text-gray-900 dark:text-text-primary">Price</td>
                        <td className="p-3 text-gray-550 dark:text-text-secondary">Selling price in INR</td>
                        <td className="p-3 text-gray-700 dark:text-text-primary">499</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              <div>
                <h4 className="text-xs font-bold text-gray-900 dark:text-text-primary uppercase tracking-wide mb-2">Optional Columns</h4>
                <ul className="text-xs text-gray-600 dark:text-text-secondary space-y-1.5 list-disc list-inside">
                  <li><strong>OriginalPrice:</strong> Strikeout price (used for calculating discounts)</li>
                  <li><strong>Stock:</strong> Inventory count (defaults to 0 if not provided)</li>
                  <li><strong>Category:</strong> Folder/Category group (defaults to "Mixed")</li>
                  <li><strong>Image:</strong> Public image URL link</li>
                  <li><strong>Variants:</strong> Pack size variants. Format: <code>weight:price</code> comma-separated, e.g. <code>250g:299,500g:499</code></li>
                </ul>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  onClick={downloadSampleTemplate}
                  className="flex-1 bg-gray-50 dark:bg-surface-secondary border border-gray-200 dark:border-border-medium hover:bg-gray-100 text-gray-700 dark:text-text-primary font-bold py-3.5 rounded-xl text-xs flex items-center justify-center gap-1.5 active:scale-[0.98] transition-all cursor-pointer"
                >
                  Download Sample Template
                </button>
                <button
                  onClick={() => setShowBulkHelp(false)}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 rounded-xl text-xs active:scale-[0.98] transition-all cursor-pointer"
                >
                  Got It
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
