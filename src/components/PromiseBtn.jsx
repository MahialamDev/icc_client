'use client';

import React, { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import useAxios from '@/hook/useAxios';
import { MdHandshake } from 'react-icons/md';

const PromiseBtn = ({ client, refetch }) => {
  const instance = useAxios();
  const [isOpen, setIsOpen] = useState(false);
  const [promiseDate, setPromiseDate] = useState('');
  const [promiseNote, setPromiseNote] = useState('');

  // 🔍 প্রমিজ ডেটা সেফলি রিড করা
  const hasPromise = client?.promise_date || client?.promiseInfo?.promise_date || null;

  // 🎯 ফিক্সড useEffect: ডিপেন্ডেন্সি অ্যারে স্টেবল করা হয়েছে
  useEffect(() => {
    if (isOpen) {
      if (hasPromise) {
        setPromiseDate(client?.promise_date || client?.promiseInfo?.promise_date || '');
        setPromiseNote(client?.promise_note || client?.promiseInfo?.promise_note || '');
      } else {
        setPromiseDate('');
        setPromiseNote('');
      }
    }
  }, [isOpen, hasPromise]); // 👈 'client' অবজেক্টটি সরিয়ে নেওয়া হয়েছে সাইজ এরর বন্ধ করতে

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!promiseDate) {
      return Swal.fire({ 
        icon: 'warning', 
        title: 'Please select a date!', 
        confirmButtonColor: '#2563eb' 
      });
    }

    try {
      // তারিখ থেকে শুধু "দিন" (Day) আলাদা করা
      let dayOnly = '';
      if (promiseDate) {
        const parts = promiseDate.split('-');
        if (parts.length === 3) {
          dayOnly = parts;
        }
      }

      // 🎯 ফিক্সড এপিআই পাথ: নিখুঁত স্ল্যাশসহ সলিড রিকোয়েস্ট
      const res = await instance.patch('/update-promise-date', {
        id: client?._id,
        client_name: client?.client_name,
        ip: client?.ip || 'N/A',
        address: client?.zone || client?.address || 'N/A', 
        promise_date: promiseDate,
        promise_day: dayOnly, 
        promise_note: promiseNote
      });

      if (res.data?.success || res.status === 200) {
        Swal.fire({
          icon: 'success',
          title: hasPromise ? 'Promise Updated!' : 'Promise Recorded!',
          text: `Promise successfully saved for ${client?.client_name}`,
          confirmButtonColor: '#2563eb'
        });
        setIsOpen(false);
        if (refetch) refetch(); 
      }
    } catch (error) {
      console.error("Promise API Error:", error);
      Swal.fire({
        icon: 'error',
        title: 'Failed!',
        text: error.response?.data?.message || 'Server route not found (404) or database error.',
        confirmButtonColor: '#ef4444'
      });
    }
  };

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)} 
        className={`px-2.5 py-1 text-[11px] font-bold rounded-md flex items-center gap-1 shadow-xs transition-all duration-200 border cursor-pointer ${
          hasPromise 
            ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100' 
            : 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100' 
        }`}
      >
        <MdHandshake size={13} className={hasPromise ? 'text-emerald-600' : 'text-amber-600'} /> 
        {hasPromise ? 'Promised' : 'Promise'}
      </button>

      {/* মোডাল */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 text-left backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-xl max-w-sm w-full overflow-hidden border border-slate-100">
            
            <div className={`px-5 py-3.5 flex justify-between items-center text-white ${hasPromise ? 'bg-emerald-600' : 'bg-blue-600'}`}>
              <h3 className="font-bold text-sm flex items-center gap-1.5 tracking-tight">
                <MdHandshake size={16} /> {hasPromise ? 'Update Payment Promise' : 'New Payment Promise'}
              </h3>
              <button 
                type="button" 
                onClick={() => setIsOpen(false)} 
                className="text-white hover:text-slate-200 text-lg font-bold leading-none cursor-pointer"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-5 flex flex-col gap-4">
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 text-xs flex flex-col gap-1 font-medium">
                <p className="text-slate-500">Client: <span className="font-bold text-slate-800">{client?.client_name}</span></p>
                <p className="text-slate-400">IP Address: <span className="font-mono bg-white border border-slate-200 px-1.5 py-0.5 rounded text-blue-600 font-semibold">{client?.ip || 'N/A'}</span></p>
              </div>
              
              <div>
                {hasPromise && (
                  <p className="text-[11px] bg-emerald-50 text-emerald-800 px-2.5 py-1.5 rounded-xl mb-3 border border-emerald-100 font-semibold">
                    Current Promise: <span className="font-mono">{hasPromise}</span>
                  </p>
                )}

                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">Expected Payment Date</label>
                <input 
                  type="date" 
                  value={promiseDate} 
                  onChange={(e) => setPromiseDate(e.target.value)} 
                  className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-800 transition-all font-medium"
                  required 
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">Short Note / Follow up</label>
                <textarea 
                  value={promiseNote} 
                  onChange={(e) => setPromiseNote(e.target.value)} 
                  placeholder="e.g., Will pay via bKash" 
                  rows="2" 
                  className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-800 transition-all placeholder:text-slate-400 font-medium"
                ></textarea>
              </div>

              <div className="flex justify-end gap-1.5 border-t border-slate-100 pt-3 mt-1">
                <button 
                  type="button" 
                  onClick={() => setIsOpen(false)} 
                  className="px-3 py-1.5 bg-white border border-slate-200 text-slate-600 rounded-xl text-xs font-semibold hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className={`px-4 py-1.5 text-white font-semibold rounded-xl text-xs shadow-xs cursor-pointer border-none transition-all ${
                    hasPromise ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-blue-600 hover:bg-blue-700'
                  }`}
                >
                  {hasPromise ? 'Update Promise' : 'Save Promise'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default PromiseBtn;