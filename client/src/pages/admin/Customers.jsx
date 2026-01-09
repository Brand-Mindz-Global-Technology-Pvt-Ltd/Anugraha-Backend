// import React, { useState } from 'react';
// import { Search, Edit2, Trash2, Plus, Download } from 'lucide-react';

// const initialCustomers = [
//   { id: 1, name: 'Liam Jacob', email: 'liamjacob@gmail.com', phone: '+11 636 792 373', country: 'USA', status: 'Active' },
//   { id: 2, name: 'Noah Christ', email: 'noahchrist@gmail.com', phone: '+11 947 849 938', country: 'USA', status: 'Inactive' },
//   { id: 3, name: 'Michael Davis', email: 'michaeldavis@gmail.com', phone: '+44 738 839 373', country: 'China', status: 'Active' },
//   { id: 4, name: 'Mason William', email: 'masonwilliam@gmail.com', phone: '+22 747 373 738', country: 'Italy', status: 'Active' },
//   { id: 5, name: 'Elijah James', email: 'elijahjames@gmail.com', phone: '+44 637 388 388', country: 'France', status: 'Active' },
//   { id: 6, name: 'Rucas Garth', email: 'rucasgarth@gmail.com', phone: '+66 647 839 939', country: 'Japan', status: 'Inactive' },
// ];

// function Customers() {
//   const [customers, setCustomers] = useState(initialCustomers);
//   const [searchTerm, setSearchTerm] = useState('');
//   const [statusFilter, setStatusFilter] = useState('All Status');
//   const [isAddModalOpen, setIsAddModalOpen] = useState(false);
//   const [editingCustomer, setEditingCustomer] = useState(null);
//   const [selectedCustomers, setSelectedCustomers] = useState([]);
//   const [formData, setFormData] = useState({
//     name: '', email: '', phone: '', country: '', status: 'Active'
//   });

//   const handleDelete = (id) => {
//     if (window.confirm('Are you sure you want to delete this customer?')) {
//       setCustomers(customers.filter(c => c.id !== id));
//     }
//   };

//   const handleEdit = (customer) => {
//     setEditingCustomer(customer);
//     setFormData(customer);
//     setIsAddModalOpen(true);
//   };

//   const handleSubmit = () => {
//     if (!formData.name || !formData.email || !formData.phone || !formData.country) {
//       alert('Please fill all required fields');
//       return;
//     }
    
//     if (editingCustomer) {
//       setCustomers(customers.map(c => 
//         c.id === editingCustomer.id ? { ...formData, id: c.id } : c
//       ));
//     } else {
//       const newCustomer = {
//         ...formData,
//         id: Math.max(...customers.map(c => c.id)) + 1
//       };
//       setCustomers([...customers, newCustomer]);
//     }
//     setIsAddModalOpen(false);
//     setEditingCustomer(null);
//     setFormData({ name: '', email: '', phone: '', country: '', status: 'Active' });
//   };

//   const handleExport = () => {
//     const headers = ['Name', 'Email', 'Phone', 'Country', 'Status'];
//     const csvContent = [
//       headers.join(','),
//       ...customers.map(c => 
//         [c.name, c.email, c.phone, c.country, c.status]
//           .map(field => `"${field}"`)
//           .join(',')
//       )
//     ].join('\n');

//     const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
//     const link = document.createElement('a');
//     const url = URL.createObjectURL(blob);
//     link.setAttribute('href', url);
//     link.setAttribute('download', `customers_${new Date().toISOString().split('T')[0]}.csv`);
//     link.style.visibility = 'hidden';
//     document.body.appendChild(link);
//     link.click();
//     document.body.removeChild(link);
//   };

//   const handleBulkDelete = () => {
//     if (selectedCustomers.length === 0) {
//       alert('Please select customers to delete');
//       return;
//     }
//     if (window.confirm(`Are you sure you want to delete ${selectedCustomers.length} customer(s)?`)) {
//       setCustomers(customers.filter(c => !selectedCustomers.includes(c.id)));
//       setSelectedCustomers([]);
//     }
//   };

//   const toggleSelectAll = () => {
//     if (selectedCustomers.length === filteredCustomers.length) {
//       setSelectedCustomers([]);
//     } else {
//       setSelectedCustomers(filteredCustomers.map(c => c.id));
//     }
//   };

//   const toggleSelect = (id) => {
//     if (selectedCustomers.includes(id)) {
//       setSelectedCustomers(selectedCustomers.filter(sid => sid !== id));
//     } else {
//       setSelectedCustomers([...selectedCustomers, id]);
//     }
//   };

//   const filteredCustomers = customers.filter(c => {
//     const matchesSearch = c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
//                          c.email.toLowerCase().includes(searchTerm.toLowerCase());
//     const matchesStatus = statusFilter === 'All Status' || c.status === statusFilter;
//     return matchesSearch && matchesStatus;
//   });

//   return (
//     <div className="min-h-screen bg-gray-50 p-6">
//       <div className="max-w-7xl mx-auto">
//         {/* Header */}
//         <div className="flex items-start justify-between mb-6">
//           <div>
//             <h1 className="text-2xl font-semibold text-gray-900 mb-1">Customer Management</h1>
//             <p className="text-sm text-gray-500">{customers.length} customers available</p>
//           </div>
//           <button
//             onClick={handleExport}
//             className="flex items-center gap-2 bg-gray-900 text-white px-4 py-2 rounded text-sm hover:bg-gray-800"
//           >
//             <Download size={16} />
//             Export
//           </button>
//         </div>

//         {/* Filters */}
//         <div className="flex flex-wrap gap-3 mb-6">
//           <div className="relative flex-1 min-w-[300px]">
//             <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
//             <input
//               type="text"
//               placeholder="Search product..."
//               value={searchTerm}
//               onChange={(e) => setSearchTerm(e.target.value)}
//               className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:border-gray-400"
//             />
//           </div>
//           <select
//             value={statusFilter}
//             onChange={(e) => setStatusFilter(e.target.value)}
//             className="px-4 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:border-gray-400 bg-white"
//           >
//             <option>All Status</option>
//             <option>Active</option>
//             <option>Inactive</option>
//           </select>
//           {selectedCustomers.length > 0 && (
//             <button
//               onClick={handleBulkDelete}
//               className="flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded text-sm hover:bg-red-700"
//             >
//               <Trash2 size={16} />
//               Delete ({selectedCustomers.length})
//             </button>
//           )}
//           <button
//             onClick={() => {
//               setEditingCustomer(null);
//               setFormData({ name: '', email: '', phone: '', country: '', status: 'Active' });
//               setIsAddModalOpen(true);
//             }}
//             className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded text-sm hover:bg-blue-700"
//           >
//             <Plus size={16} />
//             Add Customer
//           </button>
//         </div>

//         {/* Table */}
//         <div className="bg-white rounded border border-gray-200">
//           <table className="w-full">
//             <thead>
//               <tr className="bg-gray-50 border-b border-gray-200">
//                 <th className="text-left p-4 w-12">
//                   <input 
//                     type="checkbox" 
//                     checked={selectedCustomers.length === filteredCustomers.length && filteredCustomers.length > 0}
//                     onChange={toggleSelectAll}
//                     className="w-4 h-4 rounded border-gray-300"
//                   />
//                 </th>
//                 <th className="text-left p-4 text-sm font-medium text-gray-700">Customer</th>
//                 <th className="text-left p-4 text-sm font-medium text-gray-700">Email</th>
//                 <th className="text-left p-4 text-sm font-medium text-gray-700">Phone</th>
//                 <th className="text-left p-4 text-sm font-medium text-gray-700">Country</th>
//                 <th className="text-left p-4 text-sm font-medium text-gray-700">Status</th>
//                 <th className="text-left p-4 text-sm font-medium text-gray-700">Action</th>
//               </tr>
//             </thead>
//             <tbody>
//               {filteredCustomers.map((customer) => (
//                 <tr key={customer.id} className="border-b border-gray-100 hover:bg-gray-50">
//                   <td className="p-4">
//                     <input 
//                       type="checkbox" 
//                       checked={selectedCustomers.includes(customer.id)}
//                       onChange={() => toggleSelect(customer.id)}
//                       className="w-4 h-4 rounded border-gray-300"
//                     />
//                   </td>
//                   <td className="p-4">
//                     <div className="font-medium text-gray-900 text-sm">{customer.name}</div>
//                   </td>
//                   <td className="p-4 text-sm text-gray-600">{customer.email}</td>
//                   <td className="p-4 text-sm text-gray-600">{customer.phone}</td>
//                   <td className="p-4 text-sm text-gray-600">{customer.country}</td>
//                   <td className="p-4">
//                     <span className={`inline-block px-3 py-1 rounded text-xs font-medium ${
//                       customer.status === 'Active' 
//                         ? 'bg-red-50 text-red-700' 
//                         : 'bg-yellow-50 text-yellow-700'
//                     }`}>
//                       {customer.status === 'Active' ? 'Active' : 'Inactive'}
//                     </span>
//                   </td>
//                   <td className="p-4">
//                     <div className="flex items-center gap-2">
//                       <button
//                         onClick={() => handleEdit(customer)}
//                         className="p-1.5 hover:bg-gray-100 rounded"
//                       >
//                         <Edit2 size={16} className="text-gray-600" />
//                       </button>
//                       <button
//                         onClick={() => handleDelete(customer.id)}
//                         className="p-1.5 hover:bg-gray-100 rounded"
//                       >
//                         <Trash2 size={16} className="text-gray-600" />
//                       </button>
//                     </div>
//                   </td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//         </div>

//         {/* Pagination */}
//         <div className="flex items-center justify-between mt-4">
//           <span className="text-sm text-gray-600">Page 1 of 2</span>
//           <div className="flex items-center gap-1">
//             <button className="p-2 hover:bg-gray-100 rounded">
//               <span className="text-gray-600">‹</span>
//             </button>
//             <button className="p-2 hover:bg-gray-100 rounded">
//               <span className="text-gray-600">›</span>
//             </button>
//           </div>
//         </div>
//       </div>

//       {/* Modal */}
//       {isAddModalOpen && (
//         <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center p-4 z-50">
//           <div className="bg-white rounded-lg max-w-md w-full p-6">
//             <h2 className="text-lg font-semibold mb-4 text-gray-900">
//               {editingCustomer ? 'Edit Customer' : 'Add Customer'}
//             </h2>
//             <div className="space-y-4">
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
//                 <input
//                   type="text"
//                   value={formData.name}
//                   onChange={(e) => setFormData({ ...formData, name: e.target.value })}
//                   className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:border-gray-400"
//                 />
//               </div>
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
//                 <input
//                   type="email"
//                   value={formData.email}
//                   onChange={(e) => setFormData({ ...formData, email: e.target.value })}
//                   className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:border-gray-400"
//                 />
//               </div>
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
//                 <input
//                   type="text"
//                   value={formData.phone}
//                   onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
//                   className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:border-gray-400"
//                 />
//               </div>
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-1">Country</label>
//                 <input
//                   type="text"
//                   value={formData.country}
//                   onChange={(e) => setFormData({ ...formData, country: e.target.value })}
//                   className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:border-gray-400"
//                 />
//               </div>
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
//                 <select
//                   value={formData.status}
//                   onChange={(e) => setFormData({ ...formData, status: e.target.value })}
//                   className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:border-gray-400 bg-white"
//                 >
//                   <option>Active</option>
//                   <option>Inactive</option>
//                 </select>
//               </div>
//               <div className="flex gap-3 pt-2">
//                 <button
//                   onClick={() => {
//                     setIsAddModalOpen(false);
//                     setEditingCustomer(null);
//                   }}
//                   className="flex-1 px-4 py-2 border border-gray-300 rounded text-sm hover:bg-gray-50"
//                 >
//                   Cancel
//                 </button>
//                 <button
//                   onClick={handleSubmit}
//                   className="flex-1 px-4 py-2 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
//                 >
//                   {editingCustomer ? 'Update' : 'Add'}
//                 </button>
//               </div>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }

// export default Customers;


import { useState, useEffect, useCallback, useMemo } from 'react';
import { Search, Edit2, Trash2, Plus, Download } from 'lucide-react';

/* =================== TYPES =================== */
const CUSTOMER_STATUS = {
  ACTIVE: 'Active',
  INACTIVE: 'Inactive',
};

const FILTER_OPTIONS = {
  ALL: 'All Status',
  ...CUSTOMER_STATUS,
};

/* =================== MOCK DATA =================== */
const initialCustomers = [
  { id: 1, name: 'Liam Jacob', email: 'liamjacob@gmail.com', phone: '+11 636 792 373', country: 'USA', status: 'Active' },
  { id: 2, name: 'Noah Christ', email: 'noahchrist@gmail.com', phone: '+11 947 849 938', country: 'USA', status: 'Inactive' },
  { id: 3, name: 'Michael Davis', email: 'michaeldavis@gmail.com', phone: '+44 738 839 373', country: 'China', status: 'Active' },
  { id: 4, name: 'Mason William', email: 'masonwilliam@gmail.com', phone: '+22 747 373 738', country: 'Italy', status: 'Active' },
  { id: 5, name: 'Elijah James', email: 'elijahjames@gmail.com', phone: '+44 637 388 388', country: 'France', status: 'Active' },
  { id: 6, name: 'Rucas Garth', email: 'rucasgarth@gmail.com', phone: '+66 647 839 939', country: 'Japan', status: 'Inactive' },
];

/* =================== SKELETON COMPONENTS =================== */
const Skeleton = ({ className = '', width = '100%' }) => (
  <div 
    className={`animate-pulse bg-gray-200 rounded ${className}`} 
    style={{ width }}
  />
);

const TableRowSkeleton = () => (
  <tr className="border-b border-gray-100">
    <td className="p-4">
      <Skeleton className="w-4 h-4" />
    </td>
    <td className="p-4">
      <Skeleton className="h-4" width="60%" />
    </td>
    <td className="p-4">
      <Skeleton className="h-4" width="80%" />
    </td>
    <td className="p-4">
      <Skeleton className="h-4" width="70%" />
    </td>
    <td className="p-4">
      <Skeleton className="h-4" width="50%" />
    </td>
    <td className="p-4">
      <Skeleton className="h-6 w-16 rounded-full" />
    </td>
    <td className="p-4">
      <div className="flex items-center gap-2">
        <Skeleton className="w-8 h-8 rounded" />
        <Skeleton className="w-8 h-8 rounded" />
      </div>
    </td>
  </tr>
);

const TableSkeleton = ({ rows = 6 }) => (
  <div className="bg-white rounded border border-gray-200">
    <table className="w-full">
      <thead>
        <tr className="bg-gray-50 border-b border-gray-200">
          <th className="text-left p-4 w-12">
            <Skeleton className="w-4 h-4" />
          </th>
          <th className="text-left p-4">
            <Skeleton className="h-4" width="80px" />
          </th>
          <th className="text-left p-4">
            <Skeleton className="h-4" width="60px" />
          </th>
          <th className="text-left p-4">
            <Skeleton className="h-4" width="60px" />
          </th>
          <th className="text-left p-4">
            <Skeleton className="h-4" width="70px" />
          </th>
          <th className="text-left p-4">
            <Skeleton className="h-4" width="60px" />
          </th>
          <th className="text-left p-4">
            <Skeleton className="h-4" width="60px" />
          </th>
        </tr>
      </thead>
      <tbody>
        {Array.from({ length: rows }).map((_, i) => (
          <TableRowSkeleton key={i} />
        ))}
      </tbody>
    </table>
  </div>
);

/* =================== UTILITY FUNCTIONS =================== */
const generateCSV = (customers) => {
  const headers = ['Name', 'Email', 'Phone', 'Country', 'Status'];
  return [
    headers.join(','),
    ...customers.map(c => 
      [c.name, c.email, c.phone, c.country, c.status]
        .map(field => `"${field}"`)
        .join(',')
    )
  ].join('\n');
};

const downloadCSV = (content, filename) => {
  const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.href = url;
  link.download = filename;
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

/* =================== CUSTOM HOOKS =================== */
const useCustomerFilters = (customers, searchTerm, statusFilter) => {
  return useMemo(() => {
    return customers.filter(customer => {
      const matchesSearch = 
        customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer.email.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = 
        statusFilter === FILTER_OPTIONS.ALL || customer.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [customers, searchTerm, statusFilter]);
};

/* =================== MAIN COMPONENT =================== */
export default function Customers() {
  const [isLoading, setIsLoading] = useState(true);
  const [customers, setCustomers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState(FILTER_OPTIONS.ALL);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState(null);
  const [selectedCustomers, setSelectedCustomers] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    country: '',
    status: CUSTOMER_STATUS.ACTIVE
  });

  // Simulate data loading
  useEffect(() => {
    const timer = setTimeout(() => {
      setCustomers(initialCustomers);
      setIsLoading(false);
    }, 1200);

    return () => clearTimeout(timer);
  }, []);

  const filteredCustomers = useCustomerFilters(customers, searchTerm, statusFilter);

  const resetForm = useCallback(() => {
    setFormData({
      name: '',
      email: '',
      phone: '',
      country: '',
      status: CUSTOMER_STATUS.ACTIVE
    });
    setEditingCustomer(null);
  }, []);

  const handleDelete = useCallback((id) => {
    if (window.confirm('Are you sure you want to delete this customer?')) {
      setCustomers(prev => prev.filter(c => c.id !== id));
      setSelectedCustomers(prev => prev.filter(sid => sid !== id));
    }
  }, []);

  const handleEdit = useCallback((customer) => {
    setEditingCustomer(customer);
    setFormData(customer);
    setIsAddModalOpen(true);
  }, []);

  const validateForm = useCallback(() => {
    const { name, email, phone, country } = formData;
    if (!name?.trim() || !email?.trim() || !phone?.trim() || !country?.trim()) {
      alert('Please fill all required fields');
      return false;
    }
    
    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      alert('Please enter a valid email address');
      return false;
    }
    
    return true;
  }, [formData]);

  const handleSubmit = useCallback(() => {
    if (!validateForm()) return;
    
    if (editingCustomer) {
      setCustomers(prev => prev.map(c => 
        c.id === editingCustomer.id ? { ...formData, id: c.id } : c
      ));
    } else {
      const newCustomer = {
        ...formData,
        id: customers.length > 0 ? Math.max(...customers.map(c => c.id)) + 1 : 1
      };
      setCustomers(prev => [...prev, newCustomer]);
    }
    
    setIsAddModalOpen(false);
    resetForm();
  }, [formData, editingCustomer, customers.length, validateForm, resetForm]);

  const handleExport = useCallback(() => {
    const csvContent = generateCSV(customers);
    const filename = `customers_${new Date().toISOString().split('T')[0]}.csv`;
    downloadCSV(csvContent, filename);
  }, [customers]);

  const handleBulkDelete = useCallback(() => {
    if (selectedCustomers.length === 0) {
      alert('Please select customers to delete');
      return;
    }
    if (window.confirm(`Are you sure you want to delete ${selectedCustomers.length} customer(s)?`)) {
      setCustomers(prev => prev.filter(c => !selectedCustomers.includes(c.id)));
      setSelectedCustomers([]);
    }
  }, [selectedCustomers]);

  const toggleSelectAll = useCallback(() => {
    setSelectedCustomers(prev => 
      prev.length === filteredCustomers.length 
        ? [] 
        : filteredCustomers.map(c => c.id)
    );
  }, [filteredCustomers]);

  const toggleSelect = useCallback((id) => {
    setSelectedCustomers(prev => 
      prev.includes(id) 
        ? prev.filter(sid => sid !== id) 
        : [...prev, id]
    );
  }, []);

  const openAddModal = useCallback(() => {
    resetForm();
    setIsAddModalOpen(true);
  }, [resetForm]);

  const closeModal = useCallback(() => {
    setIsAddModalOpen(false);
    resetForm();
  }, [resetForm]);

  const isAllSelected = useMemo(() => 
    selectedCustomers.length === filteredCustomers.length && filteredCustomers.length > 0,
    [selectedCustomers.length, filteredCustomers.length]
  );

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900 mb-1">
              Customer Management
            </h1>
            {isLoading ? (
              <Skeleton className="h-4 mt-1" width="150px" />
            ) : (
              <p className="text-sm text-gray-500">
                {customers.length} customer{customers.length !== 1 ? 's' : ''} available
              </p>
            )}
          </div>
          <button
            onClick={handleExport}
            disabled={isLoading || customers.length === 0}
            className="flex items-center gap-2 bg-gray-900 text-white px-4 py-2 rounded text-sm hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Download size={16} />
            Export
          </button>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-3 mb-6">
          <div className="relative flex-1 min-w-[300px]">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Search customer..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              disabled={isLoading}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:border-gray-400 disabled:bg-gray-100 disabled:cursor-not-allowed"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            disabled={isLoading}
            className="px-4 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:border-gray-400 bg-white disabled:bg-gray-100 disabled:cursor-not-allowed"
          >
            <option>{FILTER_OPTIONS.ALL}</option>
            <option>{CUSTOMER_STATUS.ACTIVE}</option>
            <option>{CUSTOMER_STATUS.INACTIVE}</option>
          </select>
          {selectedCustomers.length > 0 && (
            <button
              onClick={handleBulkDelete}
              className="flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded text-sm hover:bg-red-700 transition-colors"
            >
              <Trash2 size={16} />
              Delete ({selectedCustomers.length})
            </button>
          )}
          <button
            onClick={openAddModal}
            disabled={isLoading}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded text-sm hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Plus size={16} />
            Add Customer
          </button>
        </div>

        {/* Table */}
        {isLoading ? (
          <TableSkeleton rows={6} />
        ) : (
          <div className="bg-white rounded border border-gray-200">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="text-left p-4 w-12">
                    <input 
                      type="checkbox" 
                      checked={isAllSelected}
                      onChange={toggleSelectAll}
                      className="w-4 h-4 rounded border-gray-300 cursor-pointer"
                    />
                  </th>
                  <th className="text-left p-4 text-sm font-medium text-gray-700">Customer</th>
                  <th className="text-left p-4 text-sm font-medium text-gray-700">Email</th>
                  <th className="text-left p-4 text-sm font-medium text-gray-700">Phone</th>
                  <th className="text-left p-4 text-sm font-medium text-gray-700">Country</th>
                  <th className="text-left p-4 text-sm font-medium text-gray-700">Status</th>
                  <th className="text-left p-4 text-sm font-medium text-gray-700">Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredCustomers.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="p-8 text-center text-gray-500">
                      No customers found
                    </td>
                  </tr>
                ) : (
                  filteredCustomers.map((customer) => (
                    <tr key={customer.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                      <td className="p-4">
                        <input 
                          type="checkbox" 
                          checked={selectedCustomers.includes(customer.id)}
                          onChange={() => toggleSelect(customer.id)}
                          className="w-4 h-4 rounded border-gray-300 cursor-pointer"
                        />
                      </td>
                      <td className="p-4">
                        <div className="font-medium text-gray-900 text-sm">{customer.name}</div>
                      </td>
                      <td className="p-4 text-sm text-gray-600">{customer.email}</td>
                      <td className="p-4 text-sm text-gray-600">{customer.phone}</td>
                      <td className="p-4 text-sm text-gray-600">{customer.country}</td>
                      <td className="p-4">
                        <span className={`inline-block px-3 py-1 rounded text-xs font-medium ${
                          customer.status === CUSTOMER_STATUS.ACTIVE
                            ? 'bg-green-50 text-green-700' 
                            : 'bg-yellow-50 text-yellow-700'
                        }`}>
                          {customer.status}
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleEdit(customer)}
                            className="p-1.5 hover:bg-gray-100 rounded transition-colors"
                            aria-label="Edit customer"
                          >
                            <Edit2 size={16} className="text-gray-600" />
                          </button>
                          <button
                            onClick={() => handleDelete(customer.id)}
                            className="p-1.5 hover:bg-gray-100 rounded transition-colors"
                            aria-label="Delete customer"
                          >
                            <Trash2 size={16} className="text-gray-600" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        <div className="flex items-center justify-between mt-4">
          {isLoading ? (
            <Skeleton className="h-4" width="80px" />
          ) : (
            <span className="text-sm text-gray-600">Page 1 of 1</span>
          )}
          <div className="flex items-center gap-1">
            <button 
              disabled={isLoading}
              className="p-2 hover:bg-gray-100 rounded disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <span className="text-gray-600">‹</span>
            </button>
            <button 
              disabled={isLoading}
              className="p-2 hover:bg-gray-100 rounded disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <span className="text-gray-600">›</span>
            </button>
          </div>
        </div>
      </div>

      {/* Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h2 className="text-lg font-semibold mb-4 text-gray-900">
              {editingCustomer ? 'Edit Customer' : 'Add Customer'}
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  placeholder="Enter customer name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  placeholder="Enter email address"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.phone}
                  onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  placeholder="Enter phone number"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Country <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.country}
                  onChange={(e) => setFormData(prev => ({ ...prev, country: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  placeholder="Enter country"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 bg-white"
                >
                  <option>{CUSTOMER_STATUS.ACTIVE}</option>
                  <option>{CUSTOMER_STATUS.INACTIVE}</option>
                </select>
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  onClick={closeModal}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded text-sm hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmit}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 transition-colors"
                >
                  {editingCustomer ? 'Update' : 'Add'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}