import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { ArrowLeft, Plus, Edit3, Trash2, LayoutGrid, Apple, Cherry, ShoppingBag, Sprout, Leaf, Cookie, Loader2 } from 'lucide-react';
import { categoryService } from '../services/categoryService';
import { toast } from 'sonner';
import { cn } from '../lib/utils';

const iconOptions = [
  { value: 'LayoutGrid', label: 'General / Grid', icon: LayoutGrid },
  { value: 'Apple', label: 'Fruits & Nuts', icon: Apple },
  { value: 'Cherry', label: 'Dried Fruits & Berries', icon: Cherry },
  { value: 'ShoppingBag', label: 'Mixed / Combo Packs', icon: ShoppingBag },
  { value: 'Sprout', label: 'Spices & Seeds', icon: Sprout },
  { value: 'Leaf', label: 'Herbs & Teas', icon: Leaf },
  { value: 'Cookie', label: 'Chocolates & Sweets', icon: Cookie },
];

const iconMap: Record<string, any> = {
  LayoutGrid,
  Apple,
  Cherry,
  ShoppingBag,
  Sprout,
  Leaf,
  Cookie,
};

export function AdminCategories() {
  const navigate = useNavigate();
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<any>(null);
  const [form, setForm] = useState({ name: '', icon: 'LayoutGrid' });
  const [saving, setSaving] = useState(false);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const res = await categoryService.getCategories();
      // Case-insensitive sort on the fetched categories
      const sorted = (res.data || []).sort((a: any, b: any) =>
        a.name.localeCompare(b.name, undefined, { sensitivity: 'base', numeric: true })
      );
      setCategories(sorted);
    } catch {
      toast.error('Failed to load categories');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const openCreate = () => {
    setForm({ name: '', icon: 'LayoutGrid' });
    setEditingCategory(null);
    setShowModal(true);
  };

  const openEdit = (category: any) => {
    setForm({ name: category.name, icon: category.icon || 'LayoutGrid' });
    setEditingCategory(category);
    setShowModal(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) {
      toast.error('Category name is required');
      return;
    }

    setSaving(true);
    try {
      if (editingCategory) {
        await categoryService.updateCategory(editingCategory._id, {
          name: form.name.trim(),
          icon: form.icon,
        });
        toast.success('Category updated successfully');
      } else {
        await categoryService.createCategory({
          name: form.name.trim(),
          icon: form.icon,
        });
        toast.success('Category created successfully');
      }
      setShowModal(false);
      fetchCategories();
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Failed to save category. Ensure name is unique.';
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (category: any) => {
    const confirmMessage = category.productCount > 0
      ? `This category contains ${category.productCount} products and cannot be deleted.`
      : `Are you sure you want to delete the category "${category.name}"?`;

    if (category.productCount > 0) {
      toast.error(confirmMessage);
      return;
    }

    if (!confirm(confirmMessage)) return;

    try {
      await categoryService.deleteCategory(category._id);
      toast.success('Category deleted successfully');
      fetchCategories();
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Failed to delete category';
      toast.error(msg);
    }
  };

  return (
    <div className="min-h-full bg-gray-50 dark:bg-background transition-colors duration-300">
      {/* Header */}
      <div className="bg-white dark:bg-surface px-6 pt-12 pb-4 lg:pt-0 border-b border-gray-100 dark:border-border-light">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate('/admin')} className="w-10 h-10 -ml-2 rounded-full flex items-center justify-center text-gray-900 dark:text-text-primary hover:bg-gray-100 dark:hover:bg-surface-secondary transition-colors">
              <ArrowLeft size={24} />
            </button>
            <h1 className="text-xl font-bold text-gray-900 dark:text-text-primary">Manage Categories</h1>
          </div>
          <button
            onClick={openCreate}
            className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl px-4 py-2.5 flex items-center gap-2 font-semibold text-sm cursor-pointer shadow-md hover:shadow-lg transition-all active:scale-[0.98]"
          >
            <Plus size={18} />
            <span>Add Category</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-6 max-w-5xl mx-auto border-t-0">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 border-4 text-blue-600 animate-spin" />
          </div>
        ) : categories.length === 0 ? (
          <div className="text-center py-20 bg-white dark:bg-surface rounded-2xl border border-gray-100 dark:border-border-light p-6">
            <LayoutGrid size={48} className="mx-auto text-gray-300 dark:text-text-tertiary mb-3" />
            <p className="text-gray-500 dark:text-text-secondary font-medium">No categories found</p>
            <button onClick={openCreate} className="mt-4 text-sm text-blue-600 font-bold hover:underline">
              Create your first category
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 animate-fade-in">
            {categories.map((category) => {
              const IconComponent = iconMap[category.icon] || LayoutGrid;
              return (
                <div
                  key={category._id}
                  className="bg-white dark:bg-surface rounded-2xl shadow-sm border border-gray-100 dark:border-border-light p-5 flex items-center justify-between group hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center gap-4 min-w-0">
                    <div className="w-12 h-12 rounded-xl bg-gray-50 dark:bg-surface-secondary text-gray-700 dark:text-text-secondary flex items-center justify-center shrink-0 border border-gray-100 dark:border-border-medium">
                      <IconComponent size={24} />
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-bold text-gray-900 dark:text-text-primary text-sm sm:text-base truncate">
                        {category.name}
                      </h3>
                      <p className="text-xs text-gray-400 dark:text-text-tertiary font-medium mt-0.5">
                        {category.productCount ?? 0} {category.productCount === 1 ? 'product' : 'products'}
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => openEdit(category)}
                      className="w-8.5 h-8.5 rounded-lg bg-blue-50 dark:bg-blue-500/20 text-blue-600 flex items-center justify-center cursor-pointer hover:bg-blue-100 transition-colors"
                      title="Edit Category"
                    >
                      <Edit3 size={15} />
                    </button>
                    <button
                      onClick={() => handleDelete(category)}
                      className={cn(
                        "w-8.5 h-8.5 rounded-lg flex items-center justify-center cursor-pointer transition-colors",
                        category.productCount > 0
                          ? "bg-gray-100 text-gray-400 dark:bg-surface-tertiary dark:text-text-tertiary opacity-50 cursor-not-allowed"
                          : "bg-red-50 text-red-500 hover:bg-red-100"
                      )}
                      title={category.productCount > 0 ? "Cannot delete category with products" : "Delete Category"}
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 p-4">
          <div className="bg-white dark:bg-surface w-full sm:max-w-md rounded-t-2xl sm:rounded-2xl p-6 shadow-2xl transition-all animate-fade-in">
            <h2 className="text-lg font-bold text-gray-900 dark:text-text-primary mb-4">
              {editingCategory ? 'Edit Category' : 'Add New Category'}
            </h2>
            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-gray-500 dark:text-text-secondary block mb-1">
                  Category Name *
                </label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g. Spices, Dates"
                  className="w-full bg-gray-50 dark:bg-background border border-gray-150 dark:border-border-medium rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-200 text-gray-900 dark:text-text-primary"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-500 dark:text-text-secondary block mb-2">
                  Select Visual Icon *
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {iconOptions.map((opt) => {
                    const OptIcon = opt.icon;
                    const isSelected = form.icon === opt.value;
                    return (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => setForm((prev) => ({ ...prev, icon: opt.value }))}
                        className={cn(
                          "flex flex-col items-center gap-1.5 p-3 rounded-xl border text-center transition-all cursor-pointer",
                          isSelected
                            ? "border-blue-600 bg-blue-50/50 dark:bg-blue-600/10 text-blue-600 animate-scale-in"
                            : "border-gray-150 dark:border-border-medium hover:border-gray-300 dark:hover:border-border-light text-gray-600 dark:text-text-secondary"
                        )}
                        title={opt.label}
                      >
                        <OptIcon size={20} />
                        <span className="text-[9px] font-semibold truncate w-full">{opt.label.split(' ')[0]}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-gray-100 dark:border-border-light">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 bg-gray-100 dark:bg-surface-secondary text-gray-700 dark:text-text-secondary rounded-xl text-sm font-semibold hover:bg-gray-200 dark:hover:bg-surface-tertiary transition-colors cursor-pointer"
                  disabled={saving}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 flex items-center justify-center gap-2 cursor-pointer shadow-md"
                  disabled={saving}
                >
                  {saving && <Loader2 size={16} className="animate-spin" />}
                  <span>Save</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
export default AdminCategories;
