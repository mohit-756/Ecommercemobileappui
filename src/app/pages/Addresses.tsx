import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { ChevronLeft, Plus, MapPin, Home, Briefcase, MoreHorizontal, Pencil, Trash2, Star, Zap } from 'lucide-react';
import { addressService } from '../services/addressService';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'motion/react';
import { LocationPicker } from '../components/LocationPicker';

interface Address {
  _id: string;
  fullName: string;
  phone: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  pincode: string;
  landmark?: string;
  isDefault: boolean;
  label: 'home' | 'work' | 'other';
  location?: {
    type: string;
    coordinates: [number, number];
  };
}

const emptyForm = {
  fullName: '', phone: '', addressLine1: '', addressLine2: '',
  city: '', state: '', pincode: '', landmark: '', isDefault: false, label: 'home' as const,
  latitude: undefined as number | undefined,
  longitude: undefined as number | undefined,
};

export function Addresses() {
  const navigate = useNavigate();
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [menuOpenId, setMenuOpenId] = useState<string | null>(null);

  useEffect(() => {
    fetchAddresses();
  }, []);

  async function fetchAddresses() {
    try {
      const res = await addressService.getAddresses();
      setAddresses(res.data);
    } catch {
      toast.error('Failed to load addresses');
    } finally {
      setLoading(false);
    }
  }

  const [showMap, setShowMap] = useState(false);

  function openAddForm() {
    setForm(emptyForm);
    setEditingId(null);
    setShowForm(true);
  }

  function handleUseLocation() {
    setShowMap(true);
  }

  function handleConfirmMap(location: {
    latitude: number;
    longitude: number;
    addressLine1: string;
    addressLine2: string;
    city: string;
    state: string;
    pincode: string;
  }) {
    setForm({
      ...emptyForm,
      addressLine1: location.addressLine1,
      addressLine2: location.addressLine2,
      city: location.city,
      state: location.state,
      pincode: location.pincode,
      label: 'other',
      latitude: location.latitude,
      longitude: location.longitude,
    });
    setShowMap(false);
    setShowForm(true);
    toast.success('Location detected from map!');
  }

  function openEditForm(addr: Address) {
    setForm({
      fullName: addr.fullName,
      phone: addr.phone,
      addressLine1: addr.addressLine1,
      addressLine2: addr.addressLine2 || '',
      city: addr.city,
      state: addr.state,
      pincode: addr.pincode,
      landmark: addr.landmark || '',
      isDefault: addr.isDefault,
      label: addr.label,
      latitude: addr.location?.coordinates?.[1],
      longitude: addr.location?.coordinates?.[0],
    });
    setEditingId(addr._id);
    setShowForm(true);
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      if (editingId) {
        await addressService.updateAddress(editingId, form);
        toast.success('Address updated');
      } else {
        await addressService.createAddress(form);
        toast.success('Address added');
      }
      setShowForm(false);
      await fetchAddresses();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to save address');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    try {
      await addressService.deleteAddress(id);
      toast.success('Address deleted');
      setMenuOpenId(null);
      await fetchAddresses();
    } catch {
      toast.error('Failed to delete address');
    }
  }

  async function handleSetDefault(id: string) {
    try {
      await addressService.setDefaultAddress(id);
      setMenuOpenId(null);
      await fetchAddresses();
      toast.success('Default address updated');
    } catch {
      toast.error('Failed to set default');
    }
  }

  const labelConfig = {
    home: { icon: Home, bg: 'bg-blue-50 text-blue-600' },
    work: { icon: Briefcase, bg: 'bg-amber-50 text-amber-600' },
    other: { icon: MapPin, bg: 'bg-gray-50 text-gray-600' },
  };

  return (
    <div className="min-h-full flex flex-col bg-gray-50">
      <div className="bg-white pt-12 pb-4 px-6 sticky top-0 z-30 lg:pt-0 border-b border-gray-100 flex items-center justify-between">
        <div className="flex items-center">
          <button onClick={() => navigate(-1)} className="w-10 h-10 -ml-2 rounded-full flex items-center justify-center text-gray-900">
            <ChevronLeft size={24} />
          </button>
          <h1 className="text-xl font-bold text-gray-900 ml-2">Shipping Addresses</h1>
        </div>
        <button onClick={openAddForm} className="w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center shadow-sm">
          <Plus size={20} />
        </button>
      </div>

      <div className="flex-1 px-6 py-6 space-y-4 overflow-y-auto">
        <button
          onClick={handleUseLocation}
          className="w-full bg-white p-4 rounded-2xl border border-dashed border-blue-300 flex items-center justify-center gap-2 text-blue-600 font-bold hover:bg-blue-50 transition-colors shadow-sm"
        >
          <Zap size={18} className="fill-blue-600" /> Use Current Location
        </button>

        {loading ? (
          <div className="flex justify-center py-12"><div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" /></div>
        ) : addresses.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <MapPin size={36} className="text-gray-400" />
            </div>
            <h2 className="text-lg font-bold text-gray-900 mb-2">No addresses saved</h2>
            <p className="text-gray-500 text-sm mb-6">Add your first shipping address</p>
            <button onClick={openAddForm} className="bg-blue-600 text-white font-semibold rounded-xl py-3 px-8 hover:bg-blue-700 transition-colors">
              Add Address
            </button>
          </div>
        ) : (
          <AnimatePresence>
            {addresses.map((addr) => {
              const cfg = labelConfig[addr.label] || labelConfig.other;
              const Icon = cfg.icon;
              return (
                <motion.div key={addr._id} layout initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 relative">
                  <div className="flex items-start gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${cfg.bg}`}>
                      <Icon size={20} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="font-semibold text-gray-900 capitalize">{addr.label}</span>
                        {addr.isDefault && (
                          <span className="flex items-center gap-0.5 text-[10px] font-bold text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded-sm">
                            <Star size={10} /> DEFAULT
                          </span>
                        )}
                      </div>
                      <p className="text-sm font-medium text-gray-900">{addr.fullName}</p>
                      <p className="text-sm text-gray-500 leading-relaxed">
                        {addr.addressLine1}{addr.addressLine2 ? `, ${addr.addressLine2}` : ''}<br />
                        {addr.city}, {addr.state} - {addr.pincode}
                        {addr.landmark ? <><br />Landmark: {addr.landmark}</> : ''}
                      </p>
                      <p className="text-sm text-gray-400 mt-1">Phone: {addr.phone}</p>
                    </div>
                    <div className="relative">
                      <button onClick={() => setMenuOpenId(menuOpenId === addr._id ? null : addr._id)} className="w-8 h-8 rounded-full flex items-center justify-center text-gray-400 hover:bg-gray-100">
                        <MoreHorizontal size={18} />
                      </button>
                      {menuOpenId === addr._id && (
                        <>
                          <div className="fixed inset-0 z-10" onClick={() => setMenuOpenId(null)} />
                          <div className="absolute right-0 top-10 bg-white rounded-xl shadow-xl border border-gray-100 py-2 z-20 w-40">
                            <button onClick={() => { openEditForm(addr); setMenuOpenId(null); }} className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50">
                              <Pencil size={16} /> Edit
                            </button>
                            {!addr.isDefault && (
                              <button onClick={() => handleSetDefault(addr._id)} className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50">
                                <Star size={16} /> Set as Default
                              </button>
                            )}
                            <button onClick={() => handleDelete(addr._id)} className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50">
                              <Trash2 size={16} /> Delete
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        )}
      </div>

      {showMap && (
        <LocationPicker onConfirm={handleConfirmMap} onClose={() => setShowMap(false)} />
      )}

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-end md:items-center md:justify-center">
          <div className="fixed inset-0 bg-black/40" onClick={() => setShowForm(false)} />
          <motion.div initial={{ y: '100%' }} animate={{ y: 0 }} transition={{ type: 'spring', damping: 30, stiffness: 300 }} className="relative bg-white w-full md:max-w-[393px] rounded-t-3xl md:rounded-3xl max-h-[85vh] overflow-y-auto p-6 pb-10">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-900">{editingId ? 'Edit Address' : 'Add Address'}</h2>
              <button onClick={() => setShowForm(false)} className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500">
                <span className="text-lg leading-none">✕</span>
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              <div className="flex gap-3">
                {(['home', 'work', 'other'] as const).map((lbl) => {
                  const cfg = labelConfig[lbl];
                  const Icon = cfg.icon;
                  return (
                    <button key={lbl} type="button" onClick={() => setForm({ ...form, label: lbl })} className={`flex-1 flex flex-col items-center gap-1.5 py-3 rounded-xl border-2 transition-all ${form.label === lbl ? 'border-blue-600 bg-blue-50' : 'border-gray-200'}`}>
                      <Icon size={20} className={form.label === lbl ? 'text-blue-600' : 'text-gray-400'} />
                      <span className={`text-xs font-medium capitalize ${form.label === lbl ? 'text-blue-600' : 'text-gray-500'}`}>{lbl}</span>
                    </button>
                  );
                })}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                  <input type="text" required value={form.fullName} onChange={e => setForm({ ...form, fullName: e.target.value })} className="w-full bg-gray-50 border border-gray-200 text-gray-900 rounded-xl py-3 px-4 focus:ring-2 focus:ring-blue-600 outline-none transition-all" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                  <input type="tel" required value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} className="w-full bg-gray-50 border border-gray-200 text-gray-900 rounded-xl py-3 px-4 focus:ring-2 focus:ring-blue-600 outline-none transition-all" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Pincode</label>
                  <input type="text" required value={form.pincode} onChange={e => setForm({ ...form, pincode: e.target.value })} className="w-full bg-gray-50 border border-gray-200 text-gray-900 rounded-xl py-3 px-4 focus:ring-2 focus:ring-blue-600 outline-none transition-all" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Address Line 1</label>
                <input type="text" required value={form.addressLine1} onChange={e => setForm({ ...form, addressLine1: e.target.value })} placeholder="House/Flat No., Street" className="w-full bg-gray-50 border border-gray-200 text-gray-900 rounded-xl py-3 px-4 focus:ring-2 focus:ring-blue-600 outline-none transition-all" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Address Line 2</label>
                <input type="text" value={form.addressLine2} onChange={e => setForm({ ...form, addressLine2: e.target.value })} placeholder="Area, Landmark (optional)" className="w-full bg-gray-50 border border-gray-200 text-gray-900 rounded-xl py-3 px-4 focus:ring-2 focus:ring-blue-600 outline-none transition-all" />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                  <input type="text" required value={form.city} onChange={e => setForm({ ...form, city: e.target.value })} className="w-full bg-gray-50 border border-gray-200 text-gray-900 rounded-xl py-3 px-4 focus:ring-2 focus:ring-blue-600 outline-none transition-all" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
                  <input type="text" required value={form.state} onChange={e => setForm({ ...form, state: e.target.value })} className="w-full bg-gray-50 border border-gray-200 text-gray-900 rounded-xl py-3 px-4 focus:ring-2 focus:ring-blue-600 outline-none transition-all" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Landmark</label>
                  <input type="text" value={form.landmark} onChange={e => setForm({ ...form, landmark: e.target.value })} className="w-full bg-gray-50 border border-gray-200 text-gray-900 rounded-xl py-3 px-4 focus:ring-2 focus:ring-blue-600 outline-none transition-all" />
                </div>
              </div>

              <label className="flex items-center gap-3 py-2">
                <input type="checkbox" checked={form.isDefault} onChange={e => setForm({ ...form, isDefault: e.target.checked })} className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                <span className="text-sm font-medium text-gray-700">Set as default address</span>
              </label>

              <button type="submit" disabled={saving} className="w-full bg-blue-600 text-white font-semibold rounded-xl py-3.5 hover:bg-blue-700 transition-colors disabled:opacity-60">
                {saving ? 'Saving...' : editingId ? 'Update Address' : 'Save Address'}
              </button>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}
