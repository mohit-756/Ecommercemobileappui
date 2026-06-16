import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router';
import {
  ArrowLeft, ChevronDown, ChevronUp, CheckSquare, Square, Package,
  ClipboardList, Plus, Search, Calendar, Printer, Download,
  Trash2, CheckCircle, Info, RefreshCw, X, ShoppingCart
} from 'lucide-react';
import { orderService } from '../services/orderService';
import { productService } from '../services/productService';
import { categoryService } from '../services/categoryService';
import { adminService } from '../services/adminService';
import { toast } from 'sonner';
import { cn } from '../lib/utils';

const STATUS_OPTIONS = [
  { value: 'received', label: 'Received', color: 'bg-yellow-50 text-yellow-700 dark:bg-yellow-500/20 dark:text-yellow-400' },
  { value: 'not_packed', label: 'Not Packed', color: 'bg-orange-50 text-orange-700 dark:bg-orange-500/20 dark:text-orange-400' },
  { value: 'packed', label: 'Packed', color: 'bg-blue-50 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400' },
  { value: 'processed', label: 'Processed', color: 'bg-indigo-50 text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-400' },
  { value: 'out_for_delivery', label: 'Out for Delivery', color: 'bg-purple-50 text-purple-700 dark:bg-purple-500/20 dark:text-purple-400' },
  { value: 'completed', label: 'Completed', color: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400' },
  { value: 'cancelled', label: 'Cancelled', color: 'bg-red-50 text-red-600 dark:bg-red-500/20 dark:text-red-400' }
];

export function AdminOrders() {
  const navigate = useNavigate();
  const [activeView, setActiveView] = useState<'dashboard' | 'history'>('dashboard');

  // Stats Counters
  const [stats, setStats] = useState<any>({
    all: 0, received: 0, not_packed: 0, packed: 0, processed: 0, out_for_delivery: 0, completed: 0, cancelled: 0
  });

  // Analytics
  const [analytics, setAnalytics] = useState<any>({
    totalOrders: 0, pickupOrders: 0, deliveryOrders: 0, cancelledOrders: 0,
    totalRevenue: 0, netSales: 0, taxes: 0, fees: 0, tips: 0,
    averageOrderValue: 0, averageItemsPerOrder: 0
  });

  // Master Data
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);

  // List States
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedRows, setExpandedRows] = useState<Record<string, boolean>>({});

  // Pagination & Filters State
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [limit] = useState(10);
  const [sortField, setSortField] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc');

  // Active filters
  const [filters, setFilters] = useState({
    status: '',
    fulfillmentType: '',
    timeSlot: '',
    packingStatus: '',
    category: '',
    customer: '',
    startDate: '',
    endDate: ''
  });

  // Modal / Operations States
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newOrderNotes, setNewOrderNotes] = useState('');
  const [refundAmount, setRefundAmount] = useState('');
  const [refundReason, setRefundReason] = useState('');

  // Create Order Form State
  const [createForm, setCreateForm] = useState({
    customerId: '',
    fulfillmentType: 'delivery' as 'delivery' | 'pickup',
    timeSlot: '09:00 AM - 11:00 AM',
    notes: '',
    fees: 0,
    tips: 0,
    paymentMethod: 'cod' as 'cod' | 'razorpay',
    shippingAddress: {
      fullName: '',
      phone: '',
      addressLine1: '',
      addressLine2: '',
      city: '',
      state: '',
      pincode: '',
      landmark: ''
    }
  });
  const [createItems, setCreateItems] = useState<Array<{ productId: string; quantity: number; specialInstructions: string }>>([]);
  const [newItemSelection, setNewItemSelection] = useState({ productId: '', quantity: 1, instructions: '' });

  // Initial Fetch Data
  const fetchMasterData = useCallback(() => {
    productService.getProducts({ limit: 1000 }).then(res => setProducts(res.data.products || []));
    categoryService.getCategories().then(res => setCategories(res.data || []));
    adminService.getCustomers().then(res => setCustomers(res.data || []));
  }, []);

  const fetchStats = useCallback(() => {
    orderService.getAdminDashboardStats()
      .then(res => setStats(res.data))
      .catch(() => toast.error('Failed to load status stats'));
  }, []);

  const fetchAnalytics = useCallback(() => {
    const params = {
      startDate: filters.startDate || undefined,
      endDate: filters.endDate || undefined,
      customer: filters.customer || undefined,
      fulfillmentType: filters.fulfillmentType || undefined
    };
    orderService.getAdminAnalytics(params)
      .then(res => setAnalytics(res.data))
      .catch(() => toast.error('Failed to load analytics'));
  }, [filters.startDate, filters.endDate, filters.customer, filters.fulfillmentType]);

  const fetchOrders = useCallback(() => {
    setLoading(true);
    const sortParam = sortOrder === 'desc' ? `-${sortField}` : sortField;
    const params = {
      page,
      limit,
      sort: sortParam,
      status: filters.status || undefined,
      fulfillmentType: filters.fulfillmentType || undefined,
      timeSlot: filters.timeSlot || undefined,
      packingStatus: filters.packingStatus || undefined,
      category: filters.category || undefined,
      customer: filters.customer || undefined,
      startDate: filters.startDate || undefined,
      endDate: filters.endDate || undefined
    };

    orderService.getAllOrders(params)
      .then(res => {
        setOrders(res.data.orders);
        setTotalPages(res.data.pagination.pages);
      })
      .catch(() => toast.error('Failed to fetch orders list'))
      .finally(() => setLoading(false));
  }, [page, limit, sortField, sortOrder, filters]);

  useEffect(() => {
    fetchMasterData();
  }, [fetchMasterData]);

  useEffect(() => {
    fetchStats();
    fetchAnalytics();
  }, [filters, fetchStats, fetchAnalytics]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  // Click handler for status cards on dashboard
  const handleStatusCardClick = (statusValue: string) => {
    setFilters(prev => ({ ...prev, status: statusValue }));
    setPage(1);
    setActiveView('history');
  };

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortOrder(prev => prev === 'desc' ? 'asc' : 'desc');
    } else {
      setSortField(field);
      setSortOrder('desc');
    }
  };

  // Optimistic Item Packing Status Checkbox Toggle
  const handleItemPackingToggle = async (orderId: string, itemId: string, currentStatus: string) => {
    const newStatus = currentStatus === 'packed' ? 'not_packed' : 'packed';
    const originalOrders = [...orders];

    // Optimistic Update
    setOrders(prev => prev.map(order => {
      if (order._id !== orderId) return order;

      const updatedItems = order.items.map((it: any) => {
        if (it._id === itemId) return { ...it, packingStatus: newStatus };
        return it;
      });

      let overallStatus = order.status;
      const allItemsPacked = updatedItems.every((it: any) => it.packingStatus === 'packed');

      if (allItemsPacked && (overallStatus === 'received' || overallStatus === 'not_packed' || overallStatus === 'processing')) {
        overallStatus = 'packed';
      } else if (!allItemsPacked && overallStatus === 'packed') {
        overallStatus = 'not_packed';
      }

      return { ...order, items: updatedItems, status: overallStatus };
    }));

    // Update selectedOrder view immediately if modal is open
    if (selectedOrder && selectedOrder._id === orderId) {
      setSelectedOrder((prev: any) => {
        const updatedItems = prev.items.map((it: any) => {
          if (it._id === itemId) return { ...it, packingStatus: newStatus };
          return it;
        });
        let overallStatus = prev.status;
        const allItemsPacked = updatedItems.every((it: any) => it.packingStatus === 'packed');
        if (allItemsPacked && (overallStatus === 'received' || overallStatus === 'not_packed' || overallStatus === 'processing')) {
          overallStatus = 'packed';
        } else if (!allItemsPacked && overallStatus === 'packed') {
          overallStatus = 'not_packed';
        }
        return { ...prev, items: updatedItems, status: overallStatus };
      });
    }

    try {
      const res = await orderService.updateItemPackingStatus(orderId, itemId, newStatus);
      toast.success(`Item updated to ${newStatus === 'packed' ? 'Packed' : 'Not Packed'}`);

      // Update with exact response from server
      setOrders(prev => prev.map(o => o._id === orderId ? res.data : o));
      if (selectedOrder && selectedOrder._id === orderId) {
        setSelectedOrder(res.data);
      }
      fetchStats();
    } catch {
      toast.error('Failed to update packing status. Rolling back...');
      setOrders(originalOrders);
      if (selectedOrder && selectedOrder._id === orderId) {
        const revertedOrder = originalOrders.find(o => o._id === orderId);
        if (revertedOrder) setSelectedOrder(revertedOrder);
      }
    }
  };

  const handleUpdateOrderStatus = async (orderId: string, status: string) => {
    try {
      const label = status.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
      const res = await orderService.updateOrderStatus(orderId, status, `Order status updated to ${label}`);
      toast.success(`Order status updated to ${label}`);
      setOrders(prev => prev.map(o => o._id === orderId ? res.data : o));
      if (selectedOrder && selectedOrder._id === orderId) {
        setSelectedOrder(res.data);
      }
      fetchStats();
    } catch {
      toast.error('Failed to update order status');
    }
  };

  // Add notes
  const handleSaveNotes = async () => {
    if (!selectedOrder) return;
    try {
      const res = await orderService.updateOrderNotes(selectedOrder._id, { notes: newOrderNotes });
      toast.success('Notes updated successfully');
      setSelectedOrder(res.data);
      setOrders(prev => prev.map(o => o._id === selectedOrder._id ? res.data : o));
    } catch {
      toast.error('Failed to update notes');
    }
  };

  // Log refund
  const handleIssueRefund = async () => {
    if (!selectedOrder || !refundAmount) return;
    const amount = Number(refundAmount);
    if (isNaN(amount) || amount <= 0) {
      toast.error('Enter a valid refund amount');
      return;
    }

    try {
      const res = await orderService.addOrderRefund(selectedOrder._id, { amount, reason: refundReason });
      toast.success('Refund recorded successfully');
      setSelectedOrder(res.data);
      setOrders(prev => prev.map(o => o._id === selectedOrder._id ? res.data : o));
      setRefundAmount('');
      setRefundReason('');
    } catch {
      toast.error('Failed to issue refund');
    }
  };

  // Create Order Handlers
  const handleAddCreateItem = () => {
    if (!newItemSelection.productId) {
      toast.error('Select a product to add');
      return;
    }
    const exists = createItems.find(it => it.productId === newItemSelection.productId);
    if (exists) {
      toast.error('Product already added to list');
      return;
    }
    setCreateItems(prev => [...prev, {
      productId: newItemSelection.productId,
      quantity: newItemSelection.quantity,
      specialInstructions: newItemSelection.instructions
    }]);
    setNewItemSelection({ productId: '', quantity: 1, instructions: '' });
  };

  const handleRemoveCreateItem = (idx: number) => {
    setCreateItems(prev => prev.filter((_, i) => i !== idx));
  };

  const handleAdminCreateOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!createForm.customerId) {
      toast.error('Select a customer');
      return;
    }
    if (createItems.length === 0) {
      toast.error('Add at least one product item');
      return;
    }

    try {
      const payload = {
        ...createForm,
        items: createItems,
        fees: Number(createForm.fees),
        tips: Number(createForm.tips)
      };

      await orderService.adminCreateOrder(payload);
      toast.success('Order created successfully!');
      setIsCreateOpen(false);

      // Reset form
      setCreateItems([]);
      setCreateForm({
        customerId: '',
        fulfillmentType: 'delivery',
        timeSlot: '09:00 AM - 11:00 AM',
        notes: '',
        fees: 0,
        tips: 0,
        paymentMethod: 'cod',
        shippingAddress: {
          fullName: '', phone: '', addressLine1: '', addressLine2: '', city: '', state: '', pincode: '', landmark: ''
        }
      });
      fetchStats();
      fetchOrders();
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Failed to create order';
      toast.error(msg);
    }
  };

  // CSV Exports
  const exportOrdersCSV = () => {
    const headers = ['Order ID', 'Customer', 'Email', 'Phone', 'Fulfillment', 'Time Slot', 'Date', 'Status', 'Subtotal', 'Tax', 'Fees', 'Tips', 'Total'];
    const rows = orders.map(o => [
      o._id,
      o.user?.name || 'N/A',
      o.user?.email || 'N/A',
      o.user?.phone || 'N/A',
      o.fulfillmentType,
      o.timeSlot || 'N/A',
      new Date(o.createdAt).toLocaleDateString(),
      o.status,
      o.subtotal,
      o.tax,
      o.fees || 0,
      o.tips || 0,
      o.total
    ]);

    const csvContent = "data:text/csv;charset=utf-8,"
      + [headers.join(','), ...rows.map(e => e.map(val => `"${val}"`).join(","))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `orders_export_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Orders CSV exported');
  };

  const exportItemsCSV = () => {
    const headers = ['Order ID', 'Product Name', 'SKU', 'Category', 'Quantity', 'Unit Price', 'Total Price', 'Packing Status', 'Special Instructions'];
    const rows: any[] = [];

    orders.forEach(o => {
      o.items.forEach((item: any) => {
        rows.push([
          o._id,
          item.name,
          item.sku || 'N/A',
          item.category || 'N/A',
          item.quantity,
          item.price,
          item.price * item.quantity,
          item.packingStatus,
          item.specialInstructions || ''
        ]);
      });
    });

    const csvContent = "data:text/csv;charset=utf-8,"
      + [headers.join(','), ...rows.map(e => e.map(val => `"${val}"`).join(","))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `order_items_export_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Order items CSV exported');
  };

  // Document Printing
  const printPicklists = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const html = `
      <html>
        <head>
          <title>Order Picking Sheets</title>
          <style>
            body { font-family: system-ui, sans-serif; font-size: 13px; color: #333; padding: 20px; }
            .order-page { page-break-after: always; border-bottom: 2px dashed #ccc; padding-bottom: 30px; margin-bottom: 30px; }
            .order-page:last-child { border-bottom: none; }
            .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 15px; }
            table { width: 100%; border-collapse: collapse; margin-top: 15px; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background: #f5f5f5; font-weight: bold; }
          </style>
        </head>
        <body>
          ${orders.map(order => `
            <div class="order-page">
              <h2 style="margin:0 0 10px 0;">Order Picking Sheet - #${order._id.slice(-6).toUpperCase()}</h2>
              <div class="grid">
                <div>
                  <p><strong>Customer:</strong> ${order.user?.name || 'Guest'} (${order.user?.phone || 'N/A'})</p>
                  <p><strong>Fulfillment:</strong> ${order.fulfillmentType.toUpperCase()} (${order.timeSlot || 'Anytime'})</p>
                </div>
                <div>
                  <p><strong>Date:</strong> ${new Date(order.createdAt).toLocaleDateString()}</p>
                  <p><strong>Payment:</strong> ${order.paymentMethod.toUpperCase()}</p>
                </div>
              </div>
              ${order.notes ? `<p><strong>Order Notes:</strong> ${order.notes}</p>` : ''}
              <table>
                <thead>
                  <tr>
                    <th>Product Name</th>
                    <th>SKU/UPC</th>
                    <th>Weight</th>
                    <th>Qty Required</th>
                    <th>Special Instructions</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  ${order.items.map((it: any) => `
                    <tr>
                      <td>${it.name}</td>
                      <td>${it.sku || 'N/A'}</td>
                      <td>${it.weight || 'N/A'}</td>
                      <td><strong>${it.quantity}</strong></td>
                      <td>${it.specialInstructions || 'None'}</td>
                      <td>[ ] Packed</td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            </div>
          `).join('')}
          <script>
            window.onload = function() { window.print(); window.close(); }
          </script>
        </body>
      </html>
    `;

    printWindow.document.write(html);
    printWindow.document.close();
    toast.success('Invoices generated for print');
  };

  const printSingleOrder = (order: any) => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const html = `
      <html>
        <head>
          <title>Invoice - Order #${order._id.slice(-6).toUpperCase()}</title>
          <style>
            body { font-family: system-ui, sans-serif; font-size: 13px; color: #333; padding: 30px; }
            .header { text-align: center; margin-bottom: 30px; }
            .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 40px; margin-bottom: 30px; }
            table { width: 100%; border-collapse: collapse; margin-top: 15px; }
            th, td { border-bottom: 1px solid #ddd; padding: 12px; text-align: left; }
            th { font-weight: bold; }
            .totals { float: right; width: 300px; margin-top: 30px; }
            .totals table td { border: none; padding: 5px 12px; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1 style="margin:0;">DryFruit Hub</h1>
            <p style="color:#777;">Store Invoice</p>
          </div>
          <div style="display:flex; justify-content:space-between; margin-bottom: 20px;">
            <div>
              <h3>Invoice To:</h3>
              <p><strong>${order.shippingAddress?.fullName || order.user?.name || 'Customer'}</strong></p>
              <p>Phone: ${order.shippingAddress?.phone || order.user?.phone || 'N/A'}</p>
              <p>${order.shippingAddress?.addressLine1 || 'Store Pickup'}</p>
              ${order.shippingAddress?.addressLine2 ? `<p>${order.shippingAddress.addressLine2}</p>` : ''}
              <p>${order.shippingAddress?.city || ''}, ${order.shippingAddress?.state || ''} - ${order.shippingAddress?.pincode || ''}</p>
            </div>
            <div>
              <h3>Order Details:</h3>
              <p><strong>Order ID:</strong> #${order._id.toUpperCase()}</p>
              <p><strong>Date:</strong> ${new Date(order.createdAt).toLocaleString()}</p>
              <p><strong>Fulfillment:</strong> ${order.fulfillmentType.toUpperCase()} (${order.timeSlot || 'Anytime'})</p>
              <p><strong>Payment Status:</strong> ${order.paymentDetails?.status.toUpperCase()}</p>
            </div>
          </div>
          <table>
            <thead>
              <tr>
                <th>Product</th>
                <th>SKU</th>
                <th>Quantity</th>
                <th>Unit Price</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              ${order.items.map((it: any) => `
                <tr>
                  <td>${it.name} (${it.weight || 'N/A'})</td>
                  <td>${it.sku || 'N/A'}</td>
                  <td>${it.quantity}</td>
                  <td>₹${it.price.toFixed(2)}</td>
                  <td>₹${(it.price * it.quantity).toFixed(2)}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
          <div class="totals">
            <table style="width:100%;">
              <tr>
                <td>Subtotal:</td>
                <td style="text-align:right;">₹${order.subtotal.toFixed(2)}</td>
              </tr>
              <tr>
                <td>Taxes (8%):</td>
                <td style="text-align:right;">₹${order.tax.toFixed(2)}</td>
              </tr>
              <tr>
                <td>Delivery Cost:</td>
                <td style="text-align:right;">₹${order.shippingCost.toFixed(2)}</td>
              </tr>
              <tr>
                <td>Fees:</td>
                <td style="text-align:right;">₹${(order.fees || 0).toFixed(2)}</td>
              </tr>
              <tr>
                <td>Tips:</td>
                <td style="text-align:right;">₹${(order.tips || 0).toFixed(2)}</td>
              </tr>
              <tr style="font-weight:bold; border-top:1px solid #333;">
                <td>Grand Total:</td>
                <td style="text-align:right; font-size:16px;">₹${order.total.toFixed(2)}</td>
              </tr>
            </table>
          </div>
          <script>
            window.onload = function() { window.print(); window.close(); }
          </script>
        </body>
      </html>
    `;

    printWindow.document.write(html);
    printWindow.document.close();
    toast.success('Order receipt printing...');
  };

  const handleOpenDetails = (order: any) => {
    setSelectedOrder(order);
    setNewOrderNotes(order.notes || '');
    setIsDetailsOpen(true);
  };

  const toggleRowExpanded = (orderId: string) => {
    setExpandedRows(prev => ({ ...prev, [orderId]: !prev[orderId] }));
  };

  // Helper status color matching
  const getStatusBadge = (status: string) => {
    const opt = STATUS_OPTIONS.find(o => o.value === status);
    return opt ? opt.color : 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="min-h-full bg-gray-50 dark:bg-background transition-colors duration-300 flex flex-col">
      {/* Top sticky header */}
      <div className="bg-white dark:bg-surface px-6 pt-12 pb-4 lg:pt-4 border-b border-gray-100 dark:border-border-light flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate('/admin')} className="w-10 h-10 -ml-2 rounded-full flex items-center justify-center text-gray-900 dark:text-text-primary hover:bg-gray-50 dark:hover:bg-surface-secondary">
              <ArrowLeft size={24} />
            </button>
            <div>
              <h1 className="text-xl font-black text-gray-900 dark:text-text-primary uppercase tracking-wide">Orders Console</h1>
              <p className="text-xs text-gray-500 dark:text-text-secondary">Extend operations & metrics checklist</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveView('dashboard')}
              className={cn(
                "px-4 py-2 text-xs font-bold rounded-xl transition-all border",
                activeView === 'dashboard'
                  ? "bg-blue-600 border-blue-600 text-white shadow-md shadow-blue-100 dark:shadow-blue-900/30"
                  : "bg-white dark:bg-surface border-gray-200 dark:border-border-medium text-gray-600 dark:text-text-secondary hover:bg-gray-50"
              )}
            >
              Dashboard Stats
            </button>
            <button
              onClick={() => setActiveView('history')}
              className={cn(
                "px-4 py-2 text-xs font-bold rounded-xl transition-all border",
                activeView === 'history'
                  ? "bg-blue-600 border-blue-600 text-white shadow-md shadow-blue-100 dark:shadow-blue-900/30"
                  : "bg-white dark:bg-surface border-gray-200 dark:border-border-medium text-gray-600 dark:text-text-secondary hover:bg-gray-50"
              )}
            >
              Order List & History
            </button>
            <button
              onClick={() => setIsCreateOpen(true)}
              className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-4 py-2 rounded-xl flex items-center gap-1.5 shadow-md shadow-emerald-100 dark:shadow-emerald-900/30"
            >
              <Plus size={16} /> Create Order
            </button>
          </div>
        </div>
      </div>

      {activeView === 'dashboard' ? (
        /* ==================== SUB-VIEW: DASHBOARD ==================== */
        <div className="flex-1 p-6 overflow-y-auto space-y-6">
          <h2 className="text-sm font-bold uppercase tracking-wider text-gray-400 dark:text-text-tertiary">Fulfillment Pipeline</h2>

          <div className="grid grid-cols-2 lg:grid-cols-6 gap-4">
            {[
              { key: 'all', label: 'All Orders', count: stats.all, icon: Package, color: 'from-blue-500 to-blue-600 text-white shadow-blue-100 dark:shadow-blue-900/20' },
              { key: 'received', label: 'Received', count: stats.received, icon: Info, color: 'from-yellow-500 to-yellow-600 text-white shadow-yellow-100 dark:shadow-yellow-900/20' },
              { key: 'not_packed', label: 'Not Packed', count: stats.not_packed, icon: ClipboardList, color: 'from-orange-500 to-orange-600 text-white shadow-orange-100 dark:shadow-orange-900/20' },
              { key: 'packed', label: 'Packed', count: stats.packed, icon: CheckSquare, color: 'from-sky-500 to-sky-600 text-white shadow-sky-100 dark:shadow-sky-900/20' },
              { key: 'processed', label: 'Processed', count: stats.processed, icon: CheckCircle, color: 'from-indigo-500 to-indigo-600 text-white shadow-indigo-100 dark:shadow-indigo-900/20' },
              { key: 'out_for_delivery', label: 'Out for Delivery', count: stats.out_for_delivery, icon: RefreshCw, color: 'from-purple-500 to-purple-600 text-white shadow-purple-100 dark:shadow-purple-900/20' },
            ].map(card => (
              <button
                key={card.key}
                onClick={() => handleStatusCardClick(card.key === 'all' ? '' : card.key)}
                className="bg-white dark:bg-surface border border-gray-100 dark:border-border-light p-4 rounded-2xl text-left hover:scale-[1.02] active:scale-[0.98] transition-all shadow-sm cursor-pointer group"
              >
                <div className={cn("w-10 h-10 rounded-xl bg-gradient-to-br flex items-center justify-center mb-4 shadow-md", card.color)}>
                  <card.icon size={20} />
                </div>
                <p className="text-3xl font-black text-gray-900 dark:text-text-primary leading-none">{card.count}</p>
                <p className="text-xs text-gray-500 dark:text-text-secondary font-bold mt-2 group-hover:text-blue-600">{card.label}</p>
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Quick stats details */}
            <div className="bg-white dark:bg-surface p-5 rounded-2xl border border-gray-100 dark:border-border-light shadow-sm">
              <h3 className="font-bold text-gray-900 dark:text-text-primary mb-4 flex items-center gap-2">
                <ShoppingCart size={18} className="text-blue-600" />
                <span>Today's Target Metrics</span>
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-gray-50 dark:bg-surface-tertiary rounded-xl">
                  <p className="text-xs font-bold text-gray-500 uppercase">Completed Orders</p>
                  <p className="text-2xl font-black text-emerald-600 mt-1">{stats.completed || 0}</p>
                </div>
                <div className="p-4 bg-gray-50 dark:bg-surface-tertiary rounded-xl">
                  <p className="text-xs font-bold text-gray-500 uppercase">Cancelled Orders</p>
                  <p className="text-2xl font-black text-red-500 mt-1">{stats.cancelled || 0}</p>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-surface p-5 rounded-2xl border border-gray-100 dark:border-border-light shadow-sm flex flex-col justify-center text-center">
              <p className="text-gray-400 dark:text-text-tertiary text-sm">Need a comprehensive analysis?</p>
              <button
                onClick={() => setActiveView('history')}
                className="mt-3 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-xl text-sm self-center shadow-lg shadow-blue-100 dark:shadow-blue-900/30 transition-all"
              >
                Go to Order History & Charts
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* ==================== SUB-VIEW: LIST & HISTORY ==================== */
        <div className="flex-1 p-6 overflow-y-auto space-y-6">

          {/* Advanced Filters Panel */}
          <div className="bg-white dark:bg-surface p-5 rounded-2xl border border-gray-100 dark:border-border-light shadow-sm space-y-4">
            <div className="flex justify-between items-center pb-2 border-b border-gray-50 dark:border-border-light">
              <h3 className="font-bold text-gray-900 dark:text-text-primary text-sm uppercase tracking-wide">Advanced Filters</h3>
              <button
                onClick={() => setFilters({
                  status: '', fulfillmentType: '', timeSlot: '', packingStatus: '', category: '', customer: '', startDate: '', endDate: ''
                })}
                className="text-xs font-bold text-blue-600 hover:underline cursor-pointer"
              >
                Reset All Filters
              </button>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-[10px] font-bold uppercase text-gray-400 mb-1">Status</label>
                <select
                  value={filters.status}
                  onChange={e => setFilters(p => ({ ...p, status: e.target.value }))}
                  className="w-full bg-gray-50 dark:bg-background rounded-xl border border-gray-200 dark:border-border-medium px-3 py-2 text-xs outline-none focus:ring-2 focus:ring-blue-100"
                >
                  <option value="">All Statuses</option>
                  {STATUS_OPTIONS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase text-gray-400 mb-1">Fulfillment</label>
                <select
                  value={filters.fulfillmentType}
                  onChange={e => setFilters(p => ({ ...p, fulfillmentType: e.target.value }))}
                  className="w-full bg-gray-50 dark:bg-background rounded-xl border border-gray-200 dark:border-border-medium px-3 py-2 text-xs outline-none focus:ring-2 focus:ring-blue-100"
                >
                  <option value="">All Types</option>
                  <option value="pickup">Pickup</option>
                  <option value="delivery">Delivery</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase text-gray-400 mb-1">Time Slot</label>
                <select
                  value={filters.timeSlot}
                  onChange={e => setFilters(p => ({ ...p, timeSlot: e.target.value }))}
                  className="w-full bg-gray-50 dark:bg-background rounded-xl border border-gray-200 dark:border-border-medium px-3 py-2 text-xs outline-none focus:ring-2 focus:ring-blue-100"
                >
                  <option value="">All Slots</option>
                  {timeSlots.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase text-gray-400 mb-1">Packing Status</label>
                <select
                  value={filters.packingStatus}
                  onChange={e => setFilters(p => ({ ...p, packingStatus: e.target.value }))}
                  className="w-full bg-gray-50 dark:bg-background rounded-xl border border-gray-200 dark:border-border-medium px-3 py-2 text-xs outline-none focus:ring-2 focus:ring-blue-100"
                >
                  <option value="">All Packing States</option>
                  <option value="packed">Packed</option>
                  <option value="not_packed">Not Packed</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase text-gray-400 mb-1">Category</label>
                <select
                  value={filters.category}
                  onChange={e => setFilters(p => ({ ...p, category: e.target.value }))}
                  className="w-full bg-gray-50 dark:bg-background rounded-xl border border-gray-200 dark:border-border-medium px-3 py-2 text-xs outline-none focus:ring-2 focus:ring-blue-100"
                >
                  <option value="">All Categories</option>
                  {categories.map(c => <option key={c._id} value={c.name}>{c.name}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase text-gray-400 mb-1">Customer Search</label>
                <div className="relative">
                  <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    value={filters.customer}
                    onChange={e => setFilters(p => ({ ...p, customer: e.target.value }))}
                    placeholder="Search name/ID..."
                    className="w-full bg-gray-50 dark:bg-background rounded-xl border border-gray-200 dark:border-border-medium pl-9 pr-3 py-2 text-xs outline-none focus:ring-2 focus:ring-blue-100"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase text-gray-400 mb-1">Start Date</label>
                <div className="relative">
                  <Calendar size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="date"
                    value={filters.startDate}
                    onChange={e => setFilters(p => ({ ...p, startDate: e.target.value }))}
                    className="w-full bg-gray-50 dark:bg-background rounded-xl border border-gray-200 dark:border-border-medium pl-9 pr-3 py-2 text-xs outline-none focus:ring-2 focus:ring-blue-100"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase text-gray-400 mb-1">End Date</label>
                <div className="relative">
                  <Calendar size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="date"
                    value={filters.endDate}
                    onChange={e => setFilters(p => ({ ...p, endDate: e.target.value }))}
                    className="w-full bg-gray-50 dark:bg-background rounded-xl border border-gray-200 dark:border-border-medium pl-9 pr-3 py-2 text-xs outline-none focus:ring-2 focus:ring-blue-100"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Analytics Statistics Panel */}
          <div className="bg-white dark:bg-surface p-5 rounded-2xl border border-gray-100 dark:border-border-light shadow-sm">
            <h3 className="font-bold text-gray-900 dark:text-text-primary text-sm uppercase tracking-wide mb-4">Financial & Operations Metrics</h3>

            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <div className="p-3 bg-blue-50/40 dark:bg-blue-950/20 rounded-xl border border-blue-100/50">
                <span className="text-[10px] font-bold uppercase text-blue-600">Total Orders</span>
                <p className="text-xl font-black text-blue-900 dark:text-text-primary mt-1">{analytics.totalOrders}</p>
                <span className="text-[9px] text-gray-400 font-medium">{analytics.pickupOrders} Pickups | {analytics.deliveryOrders} Deliveries</span>
              </div>
              <div className="p-3 bg-emerald-50/40 dark:bg-emerald-950/20 rounded-xl border border-emerald-100/50">
                <span className="text-[10px] font-bold uppercase text-emerald-600">Net Sales</span>
                <p className="text-xl font-black text-emerald-900 dark:text-text-primary mt-1">₹{analytics.netSales?.toFixed(2)}</p>
                <span className="text-[9px] text-gray-400 font-medium">Exc. Taxes & Fees</span>
              </div>
              <div className="p-3 bg-amber-50/40 dark:bg-amber-950/20 rounded-xl border border-amber-100/50">
                <span className="text-[10px] font-bold uppercase text-amber-600">Taxes & Tips</span>
                <p className="text-xl font-black text-amber-900 dark:text-text-primary mt-1">₹{(analytics.taxes + analytics.tips)?.toFixed(2)}</p>
                <span className="text-[9px] text-gray-400 font-medium">Tips: ₹{analytics.tips?.toFixed(2)}</span>
              </div>
              <div className="p-3 bg-purple-50/40 dark:bg-purple-950/20 rounded-xl border border-purple-100/50">
                <span className="text-[10px] font-bold uppercase text-purple-600">Avg. Order Value</span>
                <p className="text-xl font-black text-purple-900 dark:text-text-primary mt-1">₹{analytics.averageOrderValue?.toFixed(2)}</p>
                <span className="text-[9px] text-gray-400 font-medium">Total sales / Orders</span>
              </div>
              <div className="p-3 bg-orange-50/40 dark:bg-orange-950/20 rounded-xl border border-orange-100/50">
                <span className="text-[10px] font-bold uppercase text-orange-600">Avg. Items/Order</span>
                <p className="text-xl font-black text-orange-900 dark:text-text-primary mt-1">{analytics.averageItemsPerOrder?.toFixed(1)}</p>
                <span className="text-[9px] text-gray-400 font-medium">Items count / Orders</span>
              </div>
            </div>
          </div>

          {/* Action toolbar for exports/prints */}
          <div className="flex justify-between items-center">
            <h3 className="font-bold text-gray-900 dark:text-text-primary text-sm uppercase tracking-wide">Order Operations List</h3>
            <div className="flex gap-2">
              <button
                onClick={exportOrdersCSV}
                className="bg-white dark:bg-surface border border-gray-200 dark:border-border-medium hover:bg-gray-50 text-gray-700 dark:text-text-secondary text-xs font-bold px-3 py-2 rounded-xl flex items-center gap-1.5 cursor-pointer shadow-sm"
              >
                <Download size={14} /> Export Orders CSV
              </button>
              <button
                onClick={exportItemsCSV}
                className="bg-white dark:bg-surface border border-gray-200 dark:border-border-medium hover:bg-gray-50 text-gray-700 dark:text-text-secondary text-xs font-bold px-3 py-2 rounded-xl flex items-center gap-1.5 cursor-pointer shadow-sm"
              >
                <Download size={14} /> Export Items CSV
              </button>
              <button
                onClick={printPicklists}
                className="bg-white dark:bg-surface border border-gray-200 dark:border-border-medium hover:bg-gray-50 text-gray-700 dark:text-text-secondary text-xs font-bold px-3 py-2 rounded-xl flex items-center gap-1.5 cursor-pointer shadow-sm"
              >
                <Printer size={14} /> Print Pick Sheets
              </button>
            </div>
          </div>

          {/* Main Orders Table */}
          <div className="bg-white dark:bg-surface rounded-2xl border border-gray-100 dark:border-border-light shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-gray-50 dark:bg-surface-tertiary text-gray-500 uppercase font-bold tracking-wider select-none border-b border-gray-100 dark:border-border-medium">
                  <tr>
                    <th className="p-4 w-12"></th>
                    <th className="p-4 cursor-pointer hover:bg-gray-100" onClick={() => handleSort('createdAt')}>
                      Date {sortField === 'createdAt' && (sortOrder === 'desc' ? '▼' : '▲')}
                    </th>
                    <th className="p-4">Customer</th>
                    <th className="p-4">Fulfillment</th>
                    <th className="p-4">Time Slot</th>
                    <th className="p-4 cursor-pointer hover:bg-gray-100" onClick={() => handleSort('status')}>
                      Status {sortField === 'status' && (sortOrder === 'desc' ? '▼' : '▲')}
                    </th>
                    <th className="p-4 cursor-pointer hover:bg-gray-100 text-right" onClick={() => handleSort('total')}>
                      Total {sortField === 'total' && (sortOrder === 'desc' ? '▼' : '▲')}
                    </th>
                    <th className="p-4 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-border-light">
                  {loading ? (
                    <tr>
                      <td colSpan={8} className="p-10 text-center">
                        <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
                      </td>
                    </tr>
                  ) : orders.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="p-10 text-center text-gray-400">No orders found matching the filter criteria.</td>
                    </tr>
                  ) : (
                    orders.map(order => {
                      const isExpanded = !!expandedRows[order._id];
                      return (
                        <>
                          <tr key={order._id} className="hover:bg-gray-50/50 dark:hover:bg-surface-secondary/40 transition-colors">
                            <td className="p-4 text-center">
                              <button onClick={() => toggleRowExpanded(order._id)} className="text-gray-400 hover:text-gray-600">
                                {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                              </button>
                            </td>
                            <td className="p-4 font-medium text-gray-500 font-mono">
                              {new Date(order.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                            </td>
                            <td className="p-4">
                              <p className="font-bold text-gray-900 dark:text-text-primary">{order.user?.name || 'Guest User'}</p>
                              <p className="text-[10px] text-gray-400">{order.user?.email || 'N/A'}</p>
                            </td>
                            <td className="p-4 capitalize font-semibold">{order.fulfillmentType}</td>
                            <td className="p-4 text-gray-500">{order.timeSlot || 'Anytime'}</td>
                            <td className="p-4">
                              <span className={cn("text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider", getStatusBadge(order.status))}>
                                {order.status.replace(/_/g, ' ')}
                              </span>
                            </td>
                            <td className="p-4 text-right font-black text-gray-900 dark:text-text-primary">
                              ₹{order.total?.toFixed(2)}
                            </td>
                            <td className="p-4 text-center flex justify-center gap-2">
                              <button
                                onClick={() => handleOpenDetails(order)}
                                className="bg-blue-50 text-blue-600 hover:bg-blue-100 text-[10px] font-bold px-2.5 py-1.5 rounded-lg cursor-pointer"
                              >
                                View Details
                              </button>
                              <button
                                onClick={() => printSingleOrder(order)}
                                className="bg-gray-50 text-gray-600 hover:bg-gray-100 text-[10px] font-bold p-1.5 rounded-lg cursor-pointer"
                                title="Print Invoice"
                              >
                                <Printer size={14} />
                              </button>
                            </td>
                          </tr>

                          {isExpanded && (
                            <tr className="bg-gray-50/40 dark:bg-surface-secondary/20">
                              <td colSpan={8} className="p-4 border-l-2 border-blue-500">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                  <div>
                                    <h4 className="font-bold text-gray-700 uppercase text-[10px] mb-2">Delivery Address</h4>
                                    <p className="font-medium text-gray-900 dark:text-text-primary">{order.shippingAddress?.fullName || 'N/A'}</p>
                                    <p className="text-gray-500">{order.shippingAddress?.addressLine1}, {order.shippingAddress?.city}</p>
                                    <p className="text-gray-500">Pincode: {order.shippingAddress?.pincode} | Phone: {order.shippingAddress?.phone}</p>
                                  </div>
                                  <div>
                                    <h4 className="font-bold text-gray-700 uppercase text-[10px] mb-2">Order Items ({order.items.length})</h4>
                                    <ul className="space-y-1 text-gray-600">
                                      {order.items.map((it: any) => (
                                        <li key={it._id} className="flex justify-between">
                                          <span>{it.name} (x{it.quantity})</span>
                                          <span className="font-mono text-[10px]">₹{(it.price * it.quantity).toFixed(2)}</span>
                                        </li>
                                      ))}
                                    </ul>
                                  </div>
                                  <div>
                                    <h4 className="font-bold text-gray-700 uppercase text-[10px] mb-2">Internal Notes & Info</h4>
                                    <p className="text-gray-500 italic text-[11px]">"{order.notes || 'No notes added'}"</p>
                                    <div className="mt-3 flex gap-2">
                                      <select
                                        value={order.status}
                                        onChange={e => handleUpdateOrderStatus(order._id, e.target.value)}
                                        className="bg-white dark:bg-background border border-gray-200 dark:border-border-medium rounded-lg px-2 py-1 text-[11px] outline-none"
                                      >
                                        {STATUS_OPTIONS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                                      </select>
                                    </div>
                                  </div>
                                </div>
                              </td>
                            </tr>
                          )}
                        </>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            <div className="p-4 bg-gray-50 dark:bg-surface-tertiary border-t border-gray-100 dark:border-border-medium flex items-center justify-between text-xs">
              <span className="text-gray-500">Page {page} of {totalPages}</span>
              <div className="flex gap-2">
                <button
                  disabled={page <= 1}
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  className="px-3 py-1.5 bg-white dark:bg-surface border border-gray-200 dark:border-border-medium rounded-lg disabled:opacity-50 font-bold cursor-pointer"
                >
                  Prev
                </button>
                <button
                  disabled={page >= totalPages}
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  className="px-3 py-1.5 bg-white dark:bg-surface border border-gray-200 dark:border-border-medium rounded-lg disabled:opacity-50 font-bold cursor-pointer"
                >
                  Next
                </button>
              </div>
            </div>

          </div>

        </div>
      )}

      {/* ==================== MODAL: ORDER DETAILS & PACKING CHECKLIST ==================== */}
      {isDetailsOpen && selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-end p-0 bg-black/50 backdrop-blur-sm">
          <div className="w-full max-w-4xl h-full bg-white dark:bg-surface-secondary shadow-2xl flex flex-col animate-in slide-in-from-right duration-200">
            {/* Modal Header */}
            <div className="p-5 border-b border-gray-100 dark:border-border-light flex justify-between items-center">
              <div>
                <p className="text-[10px] font-mono text-gray-400 uppercase">Order Details</p>
                <h3 className="text-lg font-black text-gray-900 dark:text-text-primary uppercase">Order ID: #{selectedOrder._id}</h3>
              </div>
              <button onClick={() => setIsDetailsOpen(false)} className="w-8 h-8 rounded-full bg-gray-50 dark:bg-surface flex items-center justify-center text-gray-500 hover:text-gray-800">
                <X size={18} />
              </button>
            </div>

            {/* Modal Scroll Content */}
            <div className="flex-1 overflow-y-auto p-6 grid grid-cols-1 lg:grid-cols-2 gap-8">

              {/* Left Column - Meta & Finances */}
              <div className="space-y-6">

                {/* Customer & Fulfillment Card */}
                <div className="bg-gray-50 dark:bg-surface-tertiary p-4 rounded-2xl border border-gray-100 dark:border-border-medium space-y-3">
                  <h4 className="font-bold uppercase tracking-wider text-[10px] text-gray-400">Customer & Shipping Information</h4>
                  <div className="text-xs space-y-1 text-gray-600">
                    <p><strong className="text-gray-900 dark:text-text-primary">Name:</strong> {selectedOrder.user?.name || 'Guest'}</p>
                    <p><strong>Email:</strong> {selectedOrder.user?.email || 'N/A'}</p>
                    <p><strong>Phone:</strong> {selectedOrder.user?.phone || 'N/A'}</p>
                    <hr className="my-2 border-gray-200" />
                    <p><strong className="text-gray-900 dark:text-text-primary">Fulfillment:</strong> {selectedOrder.fulfillmentType.toUpperCase()} - {selectedOrder.timeSlot || 'Anytime'}</p>
                    <p><strong>Address:</strong> {selectedOrder.shippingAddress?.fullName}, {selectedOrder.shippingAddress?.phone}</p>
                    <p>{selectedOrder.shippingAddress?.addressLine1}, {selectedOrder.shippingAddress?.addressLine2 || ''}</p>
                    <p>{selectedOrder.shippingAddress?.city}, {selectedOrder.shippingAddress?.state} - {selectedOrder.shippingAddress?.pincode}</p>
                  </div>
                </div>

                {/* Financial Summary Card */}
                <div className="bg-gray-50 dark:bg-surface-tertiary p-4 rounded-2xl border border-gray-100 dark:border-border-medium space-y-3">
                  <h4 className="font-bold uppercase tracking-wider text-[10px] text-gray-400">Payment & Invoicing Totals</h4>
                  <div className="text-xs space-y-2">
                    <div className="flex justify-between text-gray-600">
                      <span>Subtotal</span>
                      <span>₹{selectedOrder.subtotal?.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-gray-600">
                      <span>Taxes (8%)</span>
                      <span>₹{selectedOrder.tax?.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-gray-600">
                      <span>Delivery Cost</span>
                      <span>₹{selectedOrder.shippingCost?.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-gray-600">
                      <span>Fees</span>
                      <span>₹{(selectedOrder.fees || 0).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-gray-600">
                      <span>Tips</span>
                      <span>₹{(selectedOrder.tips || 0).toFixed(2)}</span>
                    </div>
                    <hr className="border-gray-200" />
                    <div className="flex justify-between font-black text-gray-900 dark:text-text-primary text-sm">
                      <span>Grand Total</span>
                      <span>₹{selectedOrder.total?.toFixed(2)}</span>
                    </div>
                    <hr className="border-gray-200" />
                    <div className="text-[10px] flex justify-between text-gray-500">
                      <span>Payment Method: {selectedOrder.paymentMethod.toUpperCase()}</span>
                      <span>Status: {selectedOrder.paymentDetails?.status.toUpperCase()}</span>
                    </div>
                  </div>
                </div>

                {/* Internal Notes Editor */}
                <div className="space-y-2">
                  <label className="block text-[10px] font-bold uppercase text-gray-400">Order Notes (Staff Only)</label>
                  <textarea
                    value={newOrderNotes}
                    onChange={e => setNewOrderNotes(e.target.value)}
                    rows={3}
                    placeholder="Enter special packing or courier notes here..."
                    className="w-full text-xs bg-gray-50 dark:bg-surface border border-gray-200 dark:border-border-medium rounded-xl p-3 outline-none focus:ring-2 focus:ring-blue-100"
                  />
                  <button
                    onClick={handleSaveNotes}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-4 py-2 rounded-xl"
                  >
                    Save Notes
                  </button>
                </div>

                {/* Refund Logger Card */}
                <div className="bg-red-50/40 dark:bg-red-950/10 p-4 rounded-2xl border border-red-100/50 space-y-3">
                  <h4 className="font-bold uppercase tracking-wider text-[10px] text-red-700">Issue Refund</h4>
                  <div className="grid grid-cols-2 gap-3">
                    <input
                      type="number"
                      placeholder="Amount (₹)"
                      value={refundAmount}
                      onChange={e => setRefundAmount(e.target.value)}
                      className="bg-white border border-gray-200 rounded-lg p-2 text-xs outline-none"
                    />
                    <input
                      type="text"
                      placeholder="Reason for refund"
                      value={refundReason}
                      onChange={e => setRefundReason(e.target.value)}
                      className="bg-white border border-gray-200 rounded-lg p-2 text-xs outline-none"
                    />
                  </div>
                  <button
                    onClick={handleIssueRefund}
                    className="w-full bg-red-600 hover:bg-red-700 text-white text-xs font-bold py-2 rounded-lg"
                  >
                    Log Refund Action
                  </button>

                  {selectedOrder.refundHistory && selectedOrder.refundHistory.length > 0 && (
                    <div className="mt-3 space-y-1.5">
                      <p className="text-[9px] font-bold uppercase text-red-700">Refund Log history:</p>
                      {selectedOrder.refundHistory.map((ref: any, idx: number) => (
                        <div key={idx} className="text-[10px] flex justify-between text-red-950/60 bg-red-100/30 p-1.5 rounded">
                          <span>₹{ref.amount} ({ref.reason})</span>
                          <span>{new Date(ref.timestamp).toLocaleDateString()}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

              </div>

              {/* Right Column - Items Packing Checklist & Activity Timeline */}
              <div className="space-y-6">

                {/* Items packing checklist */}
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <h4 className="font-bold uppercase tracking-wider text-[10px] text-gray-400">Order Items Packing Checklist</h4>
                    <span className="text-[9px] font-bold text-gray-500 uppercase">Optimistic checkouts</span>
                  </div>

                  <div className="space-y-2">
                    {selectedOrder.items.map((item: any) => {
                      const isPacked = item.packingStatus === 'packed';
                      return (
                        <div
                          key={item._id}
                          onClick={() => handleItemPackingToggle(selectedOrder._id, item._id, item.packingStatus)}
                          className={cn(
                            "flex items-center gap-3 p-3 rounded-xl border cursor-pointer hover:bg-gray-50 transition-colors select-none",
                            isPacked
                              ? "bg-emerald-50/20 border-emerald-100"
                              : "bg-gray-50/50 border-gray-100"
                          )}
                        >
                          {isPacked ? (
                            <CheckSquare size={20} className="text-emerald-600 shrink-0" />
                          ) : (
                            <Square size={20} className="text-gray-300 shrink-0" />
                          )}
                          <div className="flex-1 min-w-0">
                            <p className={cn("text-xs font-bold truncate", isPacked ? "text-emerald-700 dark:text-emerald-500 line-through" : "text-gray-800 dark:text-text-primary")}>
                              {item.name}
                            </p>
                            <div className="flex items-center gap-2 mt-1 text-[10px] text-gray-400">
                              <span>SKU: {item.sku || 'N/A'}</span>
                              <span>•</span>
                              <span>Category: {item.category || 'N/A'}</span>
                            </div>
                            {item.specialInstructions && (
                              <p className="text-[9px] bg-amber-50 text-amber-700 p-1 rounded border border-amber-100/50 mt-1.5 italic font-medium">
                                * {item.specialInstructions}
                              </p>
                            )}
                          </div>
                          <div className="text-right shrink-0">
                            <p className="text-xs font-black text-gray-900 dark:text-text-primary">x{item.quantity}</p>
                            <p className="text-[10px] text-gray-400">₹{(item.price * item.quantity).toFixed(2)}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Audit Trail Activity logs timeline */}
                <div className="space-y-3">
                  <h4 className="font-bold uppercase tracking-wider text-[10px] text-gray-400">Timeline Logs (Audit Trail)</h4>

                  <div className="border-l border-gray-200 pl-4 space-y-4">
                    {selectedOrder.activityLogs && selectedOrder.activityLogs.length > 0 ? (
                      selectedOrder.activityLogs.map((log: any, idx: number) => (
                        <div key={idx} className="relative text-[11px] leading-relaxed">
                          {/* Dot marker */}
                          <div className="absolute w-2 h-2 rounded-full bg-blue-600 -left-[21px] top-1.5" />
                          <div className="flex justify-between items-start">
                            <span className="font-bold text-gray-800 dark:text-text-primary">{log.action}</span>
                            <span className="text-[9px] text-gray-400">{new Date(log.timestamp).toLocaleString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</span>
                          </div>
                          <p className="text-gray-500 mt-0.5">{log.details}</p>
                          <p className="text-[9px] text-gray-400 mt-0.5">By: {log.actor}</p>
                        </div>
                      ))
                    ) : (
                      <p className="text-xs text-gray-400 italic">No timeline events recorded.</p>
                    )}
                  </div>
                </div>

              </div>

            </div>
          </div>
        </div>
      )}

      {/* ==================== MODAL: CREATE ORDER ==================== */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="w-full max-w-2xl max-h-[90vh] bg-white dark:bg-surface-secondary rounded-2xl border border-gray-200 dark:border-border-medium/60 shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-150">
            {/* Header */}
            <div className="p-5 border-b border-gray-100 dark:border-border-light flex justify-between items-center shrink-0">
              <h3 className="font-black text-gray-900 dark:text-text-primary uppercase tracking-wide">Create Store Order (Admin Override)</h3>
              <button onClick={() => setIsCreateOpen(false)} className="w-8 h-8 rounded-full bg-gray-50 dark:bg-surface flex items-center justify-center text-gray-500 hover:text-gray-800">
                <X size={18} />
              </button>
            </div>

            {/* Form scroll wrapper */}
            <form onSubmit={handleAdminCreateOrder} className="flex-1 overflow-y-auto p-6 space-y-6">

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold uppercase text-gray-400 mb-1">Select Customer *</label>
                  <select
                    required
                    value={createForm.customerId}
                    onChange={e => setCreateForm(p => ({ ...p, customerId: e.target.value }))}
                    className="w-full bg-gray-50 dark:bg-background border border-gray-200 dark:border-border-medium rounded-xl p-2.5 text-xs outline-none focus:ring-2 focus:ring-blue-100"
                  >
                    <option value="">Choose registered user</option>
                    {customers.map(c => <option key={c._id} value={c._id}>{c.name} ({c.email})</option>)}
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase text-gray-400 mb-1">Fulfillment Mode *</label>
                  <select
                    value={createForm.fulfillmentType}
                    onChange={e => setCreateForm(p => ({ ...p, fulfillmentType: e.target.value as any }))}
                    className="w-full bg-gray-50 dark:bg-background border border-gray-200 dark:border-border-medium rounded-xl p-2.5 text-xs outline-none focus:ring-2 focus:ring-blue-100"
                  >
                    <option value="delivery">Delivery</option>
                    <option value="pickup">Store Pickup</option>
                  </select>
                </div>
              </div>

              {/* Items Section */}
              <div className="bg-gray-50 dark:bg-surface-tertiary p-4 rounded-2xl border border-gray-100 dark:border-border-medium space-y-4">
                <h4 className="font-bold uppercase text-[10px] text-gray-400">Order items</h4>

                {/* Items selection inputs */}
                <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-end">
                  <div className="sm:col-span-6">
                    <label className="block text-[9px] font-bold uppercase text-gray-400 mb-1">Select Product</label>
                    <select
                      value={newItemSelection.productId}
                      onChange={e => setNewItemSelection(p => ({ ...p, productId: e.target.value }))}
                      className="w-full bg-white border border-gray-200 rounded-lg p-2 text-xs outline-none"
                    >
                      <option value="">Select dry fruit/spice...</option>
                      {products.map(p => <option key={p._id} value={p._id}>{p.name} (Stock: {p.stock || 0}) - ₹{p.price}</option>)}
                    </select>
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-[9px] font-bold uppercase text-gray-400 mb-1">Quantity</label>
                    <input
                      type="number"
                      min={1}
                      value={newItemSelection.quantity}
                      onChange={e => setNewItemSelection(p => ({ ...p, quantity: Math.max(1, Number(e.target.value)) }))}
                      className="w-full bg-white border border-gray-200 rounded-lg p-2 text-xs outline-none"
                    />
                  </div>
                  <div className="sm:col-span-3">
                    <label className="block text-[9px] font-bold uppercase text-gray-400 mb-1">Instructions</label>
                    <input
                      type="text"
                      placeholder="Instructions..."
                      value={newItemSelection.instructions}
                      onChange={e => setNewItemSelection(p => ({ ...p, instructions: e.target.value }))}
                      className="w-full bg-white border border-gray-200 rounded-lg p-2 text-xs outline-none"
                    />
                  </div>
                  <div className="sm:col-span-1">
                    <button
                      type="button"
                      onClick={handleAddCreateItem}
                      className="w-full bg-blue-600 text-white rounded-lg p-2 flex items-center justify-center font-bold"
                    >
                      Add
                    </button>
                  </div>
                </div>

                {/* Added items list */}
                {createItems.length > 0 ? (
                  <div className="divide-y divide-gray-200 text-xs">
                    {createItems.map((item, idx) => {
                      const prod = products.find(p => p._id === item.productId);
                      return (
                        <div key={idx} className="py-2.5 flex justify-between items-center gap-4">
                          <div className="flex-1 min-w-0">
                            <p className="font-bold text-gray-900 truncate">{prod?.name || 'Product'}</p>
                            {item.specialInstructions && <p className="text-[10px] text-amber-600 italic">Instructions: {item.specialInstructions}</p>}
                          </div>
                          <div className="flex items-center gap-4">
                            <span>x{item.quantity}</span>
                            <span className="font-black text-gray-900">₹{((prod?.price || 0) * item.quantity).toFixed(2)}</span>
                            <button
                              type="button"
                              onClick={() => handleRemoveCreateItem(idx)}
                              className="text-red-500 hover:text-red-700"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-xs text-gray-400 italic">No products added to this order yet.</p>
                )}
              </div>

              {/* Shipping Address (Conditional on Delivery) */}
              {createForm.fulfillmentType === 'delivery' && (
                <div className="bg-gray-50 dark:bg-surface-tertiary p-4 rounded-2xl border border-gray-100 dark:border-border-medium space-y-4">
                  <h4 className="font-bold uppercase text-[10px] text-gray-400">Shipping Address</h4>
                  <div className="grid grid-cols-2 gap-3">
                    <input
                      required
                      type="text"
                      placeholder="Receiver Full Name *"
                      value={createForm.shippingAddress.fullName}
                      onChange={e => setCreateForm(p => ({ ...p, shippingAddress: { ...p.shippingAddress, fullName: e.target.value } }))}
                      className="bg-white border border-gray-200 rounded-lg p-2 text-xs outline-none"
                    />
                    <input
                      required
                      type="tel"
                      placeholder="Phone Number *"
                      value={createForm.shippingAddress.phone}
                      onChange={e => setCreateForm(p => ({ ...p, shippingAddress: { ...p.shippingAddress, phone: e.target.value } }))}
                      className="bg-white border border-gray-200 rounded-lg p-2 text-xs outline-none"
                    />
                    <input
                      required
                      type="text"
                      placeholder="Address Line 1 *"
                      value={createForm.shippingAddress.addressLine1}
                      onChange={e => setCreateForm(p => ({ ...p, shippingAddress: { ...p.shippingAddress, addressLine1: e.target.value } }))}
                      className="bg-white border border-gray-200 rounded-lg p-2 text-xs outline-none"
                    />
                    <input
                      type="text"
                      placeholder="Address Line 2"
                      value={createForm.shippingAddress.addressLine2}
                      onChange={e => setCreateForm(p => ({ ...p, shippingAddress: { ...p.shippingAddress, addressLine2: e.target.value } }))}
                      className="bg-white border border-gray-200 rounded-lg p-2 text-xs outline-none"
                    />
                    <input
                      required
                      type="text"
                      placeholder="City *"
                      value={createForm.shippingAddress.city}
                      onChange={e => setCreateForm(p => ({ ...p, shippingAddress: { ...p.shippingAddress, city: e.target.value } }))}
                      className="bg-white border border-gray-200 rounded-lg p-2 text-xs outline-none"
                    />
                    <input
                      required
                      type="text"
                      placeholder="State *"
                      value={createForm.shippingAddress.state}
                      onChange={e => setCreateForm(p => ({ ...p, shippingAddress: { ...p.shippingAddress, state: e.target.value } }))}
                      className="bg-white border border-gray-200 rounded-lg p-2 text-xs outline-none"
                    />
                    <input
                      required
                      type="text"
                      placeholder="Pincode *"
                      value={createForm.shippingAddress.pincode}
                      onChange={e => setCreateForm(p => ({ ...p, shippingAddress: { ...p.shippingAddress, pincode: e.target.value } }))}
                      className="bg-white border border-gray-200 rounded-lg p-2 text-xs outline-none"
                    />
                    <input
                      type="text"
                      placeholder="Landmark"
                      value={createForm.shippingAddress.landmark}
                      onChange={e => setCreateForm(p => ({ ...p, shippingAddress: { ...p.shippingAddress, landmark: e.target.value } }))}
                      className="bg-white border border-gray-200 rounded-lg p-2 text-xs outline-none"
                    />
                  </div>
                </div>
              )}

              {/* Timing slots, payment, & finances */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-[10px] font-bold uppercase text-gray-400 mb-1">Fulfillment Time Slot</label>
                  <select
                    value={createForm.timeSlot}
                    onChange={e => setCreateForm(p => ({ ...p, timeSlot: e.target.value }))}
                    className="w-full bg-gray-50 border border-gray-200 rounded-lg p-2 text-xs outline-none"
                  >
                    {timeSlots.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase text-gray-400 mb-1">Payment Method</label>
                  <select
                    value={createForm.paymentMethod}
                    onChange={e => setCreateForm(p => ({ ...p, paymentMethod: e.target.value as any }))}
                    className="w-full bg-gray-50 border border-gray-200 rounded-lg p-2 text-xs outline-none"
                  >
                    <option value="cod">Cash on Delivery (COD)</option>
                    <option value="razorpay">Razorpay Online</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase text-gray-400 mb-1">Additional Fees (₹)</label>
                  <input
                    type="number"
                    min={0}
                    value={createForm.fees}
                    onChange={e => setCreateForm(p => ({ ...p, fees: Math.max(0, Number(e.target.value)) }))}
                    className="w-full bg-gray-50 border border-gray-200 rounded-lg p-2 text-xs outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase text-gray-400 mb-1">Tips to Delivery Rider (₹)</label>
                  <input
                    type="number"
                    min={0}
                    value={createForm.tips}
                    onChange={e => setCreateForm(p => ({ ...p, tips: Math.max(0, Number(e.target.value)) }))}
                    className="w-full bg-gray-50 border border-gray-200 rounded-lg p-2 text-xs outline-none"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-[10px] font-bold uppercase text-gray-400 mb-1">Internal Notes</label>
                  <input
                    type="text"
                    placeholder="Courier guidelines or instructions..."
                    value={createForm.notes}
                    onChange={e => setCreateForm(p => ({ ...p, notes: e.target.value }))}
                    className="w-full bg-gray-50 border border-gray-200 rounded-lg p-2 text-xs outline-none"
                  />
                </div>
              </div>

              {/* Submit footer */}
              <div className="pt-4 border-t border-gray-100 flex justify-end gap-3 shrink-0">
                <button
                  type="button"
                  onClick={() => setIsCreateOpen(false)}
                  className="bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold px-4 py-2.5 rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-5 py-2.5 rounded-xl cursor-pointer shadow-md"
                >
                  Submit Order
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
}

const timeSlots = [
  '09:00 AM - 11:00 AM',
  '11:00 AM - 01:00 PM',
  '01:00 PM - 03:00 PM',
  '03:00 PM - 05:00 PM',
  '05:00 PM - 07:00 PM'
];
