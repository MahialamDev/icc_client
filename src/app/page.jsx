'use client';

import useAxios from '@/hook/useAxios';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import React, { useState } from 'react';
import { MdLocalPhone, MdNavigateBefore, MdNavigateNext, MdSearch, MdPersonAdd } from 'react-icons/md';
import Swal from 'sweetalert2';
import ClientReportActions from '@/components/ClientReportActions'; 
import PaidBtns from '@/components/PaidBtns';
import EditClientBtn from '@/components/EditClientBtn'; 
import PromiseBtn from '@/components/PromiseBtn';
import ReportBtn from '@/components/ReportBtn';

export default function ResponsiveClientList() {
  const instance = useAxios();
  
  const [filters, setFilters] = useState({
    name: '',
    mobile: '',
    ip: '',
    address: '',
    status: ''
  });
  const [page, setPage] = useState(1);
  const limit = 10;

  const { data: allClients = [], refetch, isLoading } = useQuery({
    queryKey: ['client-tables'],
    queryFn: async () => {
      const res = await instance.get('/get-client-data');
      return res.data; 
    },
  });

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
    setPage(1); 
  };

  const filteredClients = allClients.filter(client => {
    const matchesName = client?.client_name?.toLowerCase().includes(filters.name.toLowerCase());
    const matchesMobile = client?.mobile?.toLowerCase().includes(filters.mobile.toLowerCase());
    const matchesIp = client?.ip?.toLowerCase().includes(filters.ip.toLowerCase());
    const matchesAddress = client?.address?.toLowerCase().includes(filters.address.toLowerCase());
    const matchesStatus = filters.status === '' || client?.status === filters.status;
    
    return matchesName && matchesMobile && matchesIp && matchesAddress && matchesStatus;
  });

  const totalClients = filteredClients.length;
  const totalPages = Math.ceil(totalClients / limit) || 1;
  
  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + limit;
  const clientsData = filteredClients.slice(startIndex, endIndex);

  const handleStatusUpdate = async (id, status) => {
    const sat = status === 'Active' ? 'Inactive' : 'Active';
    await instance.patch('update-status', { id, status: sat });
    refetch();
  };

  return (
    <div className="min-h-screen bg-slate-50/50 text-slate-600 antialiased selection:bg-blue-500 selection:text-white">
      <div className="container mx-auto p-3 md:p-6 max-w-[1600px] flex flex-col h-screen max-h-screen overflow-hidden">
        
        {/* --- HEADER SECTION --- */}
        <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4 mb-4 shrink-0">
          <div>
            <h1 className="text-xl md:text-2xl font-bold bg-gradient-to-r bg-clip-text text-transparent from-slate-900 to-slate-700 tracking-tight">
              ISP Client Management
            </h1>
            <p className="text-xs md:text-sm text-slate-400 mt-0.5 font-medium">
              Manage network subscribers layout optimized for all screens
            </p>
          </div>

          {/* 🔍 সার্চ ফিল্ডসমূহ (মোবাইলে এখন ডানে-বামে সুন্দর স্ক্রল হবে, পিসিতে গ্রিড থাকবে) */}
          <div className="w-full xl:w-auto overflow-x-auto no-scrollbar -mx-3 px-3 md:mx-0 md:px-0">
            <div className="flex xl:grid xl:grid-cols-5 gap-2 min-w-[750px] xl:min-w-0 pb-1 xl:pb-0">
              <input
                type="text"
                name="name"
                value={filters.name}
                onChange={handleFilterChange}
                placeholder="Search by Name..."
                className="w-[160px] xl:w-full px-3 py-2 text-xs md:text-sm bg-white border border-slate-200 rounded-xl shadow-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-slate-800"
              />
              <input
                type="text"
                name="mobile"
                value={filters.mobile}
                onChange={handleFilterChange}
                placeholder="Search by Mobile..."
                className="w-[150px] xl:w-full px-3 py-2 text-xs md:text-sm bg-white border border-slate-200 rounded-xl shadow-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-slate-800"
              />
              <input
                type="text"
                name="ip"
                value={filters.ip}
                onChange={handleFilterChange}
                placeholder="Search by IP..."
                className="w-[140px] xl:w-full px-3 py-2 text-xs md:text-sm bg-white border border-slate-200 rounded-xl shadow-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-slate-800"
              />
              <input
                type="text"
                name="address"
                value={filters.address}
                onChange={handleFilterChange}
                placeholder="Search by Address..."
                className="w-[160px] xl:w-full px-3 py-2 text-xs md:text-sm bg-white border border-slate-200 rounded-xl shadow-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-slate-800"
              />
              <select
                name="status"
                value={filters.status}
                onChange={handleFilterChange}
                className="w-[130px] xl:w-full px-3 py-2 text-xs md:text-sm bg-white border border-slate-200 rounded-xl shadow-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-slate-700 font-medium cursor-pointer"
              >
                <option value="">All Status</option>
                <option value="Active">🟢 Active</option>
                <option value="Inactive">🔴 Inactive</option>
              </select>
            </div>
          </div>
        </div>

        {/* --- ACTION BUTTONS & BADGE (গিজিগিজি দূর করতে রেসপন্সিভ লেআউট) --- */}
        <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3 mb-4 shrink-0 bg-white p-3 rounded-2xl border border-slate-100 shadow-xs">
          <div className="flex items-center justify-between sm:justify-start gap-2 w-full sm:w-auto">
            <Link href={'/post'} className="inline-flex items-center justify-center gap-1.5 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white px-4 py-2 rounded-xl text-xs md:text-sm font-semibold shadow-xs transition-all shrink-0">
              <MdPersonAdd size={16} /> Add New
            </Link>
            {/* মোবাইল স্ক্রিনে টোটাল কাউন্টারটি এখানে চলে আসবে যাতে স্পেস বাঁচে */}
            <div className="sm:hidden bg-slate-100 text-slate-700 px-3 py-2 rounded-xl text-xs font-bold border border-slate-200 font-mono">
              TOTAL: {totalClients}
            </div>
          </div>
          
          <div className="flex items-center justify-end gap-2 w-full sm:w-auto border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-100">
            <ClientReportActions filteredData={filteredClients} />
            <div className="hidden sm:block bg-slate-100 text-slate-700 px-3 py-2 rounded-xl text-xs font-bold border border-slate-200 font-mono tracking-wide">
              TOTAL: {totalClients}
            </div>
          </div>
        </div>

        {/* --- MAIN CONTENT AREA --- */}
        <div className="flex-grow overflow-hidden min-h-0 flex flex-col">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center flex-grow bg-white rounded-2xl shadow-xs border border-slate-100">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600 mb-3"></div>
              <p className="text-slate-400 font-semibold animate-pulse text-xs uppercase tracking-wider">Loading Subscriber Database...</p>
            </div>
          ) : clientsData.length === 0 ? (
            <div className="flex flex-col items-center justify-center flex-grow bg-white rounded-2xl shadow-xs border border-slate-100 p-6">
              <div className="p-3 bg-slate-50 rounded-full text-slate-400 mb-2">
                <MdSearch size={28} />
              </div>
              <p className="text-slate-700 font-bold text-base">No Clients Match Filters</p>
              <p className="text-slate-400 text-xs mt-0.5">Please check your spelling or adjust search criteria</p>
            </div>
          ) : (
            <>
              {/* 📱 Mobile Box/Card View */}
              <div className="grid grid-cols-1 gap-3 md:hidden overflow-y-auto pb-4 flex-grow">
                {clientsData.map(client => (
                  <div key={client?._id} className="bg-white p-4 rounded-2xl shadow-xs border border-slate-100 flex flex-col gap-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded font-mono mr-1">SL {client?.sl}</span>
                        <h3 className="text-sm font-bold text-slate-800 inline-block mt-1">{client?.client_name}</h3>
                        <p className="text-xs text-slate-400 font-medium mt-0.5">{client.zone}</p>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <ReportBtn client={client} />
                        <span 
                          onClick={() => handleStatusUpdate(client?._id, client?.status)} 
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold border transition-colors cursor-pointer ${
                            client?.status === 'Active' 
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100' 
                              : 'bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100'
                          }`}
                        >
                          {client?.status}
                        </span>
                      </div>
                    </div>
                    
                    <div className="text-xs flex flex-col gap-2 text-slate-500 bg-slate-50/50 p-3 rounded-xl border border-slate-100 font-medium">
                      <div className="flex justify-between items-center">
                        <span className="text-slate-400">IP Address:</span>
                        <span className="bg-blue-50 text-blue-600 px-2 py-0.5 rounded-lg font-mono text-xs font-semibold">{client?.ip || 'N/A'}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-slate-400">Mobile:</span>
                        {client?.mobile ? (
                          <a href={`tel:${client.mobile}`} className="text-blue-600 hover:underline flex items-center gap-1 font-mono text-xs bg-white border border-slate-200 px-2 py-0.5 rounded-md shadow-xs">
                            <MdLocalPhone size={12} className="text-emerald-500" /> {client.mobile}
                          </a>
                        ) : (
                          <span className="text-slate-400">N/A</span>
                        )}
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-slate-400">Monthly Bill:</span>
                        <span className="text-slate-900 font-extrabold text-sm">৳{client?.amount || 0}</span>
                      </div>
                      {client?.promise_date && (
                        <div className="flex justify-between items-center bg-amber-50/60 p-2 rounded-lg border border-amber-100 text-amber-800 text-[11px]">
                          <span className="font-bold">Promise Date:</span>
                          <span className="font-semibold">{client?.promise_date}</span>
                        </div>
                      )}
                    </div>

                    <div className="text-xs flex flex-col gap-1 text-slate-500">
                      <p><strong className="text-slate-700">Address:</strong> {client?.address}</p>
                      {client?.promise_note && <p className="text-xs italic text-slate-400"><strong className="text-slate-500">Note:</strong> {client?.promise_note}</p>}
                    </div>

                    <div className="flex flex-wrap gap-1.5 pt-2 justify-end border-t border-slate-100">
                      <EditClientBtn client={client} refetch={refetch} />
                      <PromiseBtn client={client} refetch={refetch} />
                      <PaidBtns client={client} refetch={refetch} />
                    </div>
                  </div>
                ))}
              </div>

              {/* 🖥️ Desktop Table View */}
              <div id="printable-client-table" className="hidden md:block bg-white rounded-2xl shadow-xs overflow-hidden border border-slate-100 flex-grow min-h-0">
                <div className="overflow-y-auto max-h-full h-full custom-scrollbar">
                  <table className="w-full text-left border-collapse relative">
                    <thead>
                      <tr className="bg-slate-50/70 backdrop-blur-md text-slate-500 text-[11px] uppercase font-bold tracking-wider border-b border-slate-100 sticky top-0 z-10">
                        <th className="py-3 px-4 text-center w-12">SL</th>
                        <th className="py-3 px-4">Client Name</th>
                        <th className="py-3 px-4">Address</th>
                        <th className="py-3 px-4">Mobile</th>
                        <th className="py-3 px-4">IP Address</th>
                        <th className="py-3 px-4">Zone</th>
                        <th className="py-3 px-4 text-center">Speed</th>
                        <th className="py-3 px-4 text-right">Amount</th>
                        <th className="py-3 px-4 text-center">Conn. Date</th>
                        <th className="py-3 px-4 text-center">Status</th>
                        <th className="py-3 px-4 max-w-[200px]">Notes / Promises</th>
                        <th className="py-3 px-4 text-center no-print">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-xs md:text-sm text-slate-600 font-medium">
                      {clientsData.map(client => (
                        <tr key={client?._id} className="hover:bg-slate-50/50 transition-colors group">
                          <td className="py-2.5 px-4 text-center font-bold text-slate-400 font-mono">{client?.sl}</td>
                          <td className="py-2.5 px-4 font-bold text-slate-800 tracking-tight">{client?.client_name}</td>
                          <td className="py-2.5 px-4 max-w-xs truncate text-slate-500" title={client?.address}>{client?.address}</td>
                          <td className="py-2.5 px-4 font-mono text-xs">
                            <a href={`tel:${client.mobile}`} className="text-blue-600 hover:underline flex items-center gap-1 w-fit">
                              <MdLocalPhone className="text-slate-400 group-hover:text-emerald-500 transition-colors" /> {client.mobile}
                            </a>
                          </td>
                          <td className="py-2.5 px-4 font-mono text-xs">
                            <span className="bg-blue-50/70 text-blue-600 rounded-lg px-2 py-0.5 font-semibold">{client?.ip}</span>
                          </td>
                          <td className="py-2.5 px-4 text-slate-500">{client.zone}</td>
                          <td className="py-2.5 px-4 text-center">
                            <span className="bg-purple-50 text-purple-700 font-bold px-2 py-0.5 rounded-md text-[11px] border border-purple-100">{client?.speed}</span>
                          </td>
                          <td className="py-2.5 px-4 text-right font-extrabold text-slate-900">৳{client?.amount}</td>
                          <td className="py-2.5 px-4 text-center text-xs text-slate-400 font-mono">{client?.connection_date}</td>
                          <td className="py-2.5 px-4 text-center">
                            <div className="flex flex-col items-center justify-center gap-1">
                              <span 
                                onClick={() => handleStatusUpdate(client?._id, client?.status)} 
                                className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border transition-all cursor-pointer ${
                                  client?.status === 'Active' 
                                    ? 'bg-emerald-50 text-emerald-700 border-emerald-100 hover:bg-emerald-100' 
                                    : 'bg-rose-50 text-rose-700 border-rose-100 hover:bg-rose-100'
                                }`}
                              >
                                {client?.status}
                              </span>
                              <ReportBtn client={client} />
                            </div>
                          </td>
                          <td className="py-2.5 px-4 text-xs font-normal">
                            {client?.promise_date ? (
                              <span className="block bg-amber-50/60 text-amber-900 p-2 rounded-xl border border-amber-100 line-clamp-2">
                                <strong>Promise:</strong> {client.promise_date} <br />
                                <span className="text-slate-400 italic font-medium">{client?.promise_note}</span>
                              </span>
                            ) : (
                              <span className="block bg-slate-50 text-slate-400 p-1.5 rounded-lg border border-slate-100/70 truncate text-center font-medium">Standard Client</span>
                            )}
                          </td>
                          <td className="py-2.5 px-4 text-center no-print">
                            <div className="flex items-center justify-center gap-1">
                              <EditClientBtn client={client} refetch={refetch} />
                              <PromiseBtn client={client} refetch={refetch} />
                              <PaidBtns client={client} refetch={refetch} />
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}
        </div>

        {/* --- PAGINATION FOOTER --- */}
        <div className="flex justify-center items-center gap-4 py-4 shrink-0 bg-transparent">
          <button 
            disabled={page === 1} 
            onClick={() => setPage(prev => prev - 1)} 
            className="inline-flex items-center gap-1 px-3 py-1.5 bg-white border border-slate-200 text-slate-600 rounded-xl text-xs font-semibold shadow-xs disabled:opacity-50 disabled:pointer-events-none hover:bg-slate-50 transition-all"
          >
            <MdNavigateBefore size={16} /> Previous
          </button>
          <span className="text-xs font-bold text-slate-500 bg-white px-3 py-1.5 rounded-xl border border-slate-200 shadow-xs">
            Page {page} of {totalPages}
          </span>
          <button 
            disabled={page === totalPages} 
            onClick={() => setPage(prev => prev + 1)} 
            className="inline-flex items-center gap-1 px-3 py-1.5 bg-white border border-slate-200 text-slate-600 rounded-xl text-xs font-semibold shadow-xs disabled:opacity-50 disabled:pointer-events-none hover:bg-slate-50 transition-all"
          >
            Next <MdNavigateNext size={16} />
          </button>
        </div>

      </div>
    </div>
  );
}