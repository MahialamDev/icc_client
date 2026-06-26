'use client';
import useAxios from '@/hook/useAxios';
import { useQuery } from '@tanstack/react-query';
import React, { useState } from 'react';
import { MdNavigateBefore, MdNavigateNext, MdLocationOn, MdDevices, MdPrint } from 'react-icons/md';
import Swal from 'sweetalert2';

export default function PromisesPage() {
  const instance = useAxios();
  
  // 🔍 ফিল্টার স্টেট (সরাসরি তারিখের ওপর নির্ভরশীল)
  const [promiseDate, setPromiseDate] = useState('');
  const [addressSearch, setAddressSearch] = useState('');
  const [page, setPage] = useState(1);

  // 🔄 নির্দিষ্ট তারিখের প্রমিজ ডেটা ফেচ করা
  const { data: serverResponse = {}, refetch, isLoading } = useQuery({
    queryKey: ['promises-data', promiseDate, addressSearch, page],
    queryFn: async () => {
      const res = await instance.get(`/get-promises-data?date=${promiseDate}&address=${addressSearch}&page=${page}`);
      return res.data; 
    },
    keepPreviousData: true
  });

  const promisesList = serverResponse?.data || [];
  const totalPromises = serverResponse?.totalPromises || 0;
  const totalPages = serverResponse?.totalPages || 1;

  // 🖨️ প্রিন্ট অল রিপোর্ট জেনারেটর
  const handlePrintAllReport = () => {
    if (promisesList.length === 0) {
      return Swal.fire({ icon: 'info', title: 'No data to print!', text: 'Select a valid target date first.' });
    }

    const iframe = document.createElement('iframe');
    iframe.style.position = 'fixed';
    iframe.style.right = '0';
    iframe.style.bottom = '0';
    iframe.style.width = '0';
    iframe.style.height = '0';
    iframe.style.border = '0';
    document.body.appendChild(iframe);

    const doc = iframe.contentWindow.document;

    const tableRows = promisesList.map((item, index) => `
      <tr>
        <td style="text-align: center;">${(page - 1) * 30 + index + 1}</td>
        <td>
          <strong>${item?.client_name || 'N/A'}</strong><br/>
          <span style="font-size: 11px; color: #555; font-family: monospace;">IP: ${item?.ip || 'N/A'}</span>
        </td>
        <td>${item?.address || 'N/A'}</td>
        <td style="text-align: center; font-weight: bold;">
          ${item?.promise_date ? new Date(item.promise_date).toLocaleDateString('en-GB') : 'N/A'}
        </td>
        <td style="font-size: 11px; font-style: italic;">${item?.promise_note || '-'}</td>
      </tr>
    `).join('');

    const printContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Payment Promise Collection Report</title>
          <style>
            body { font-family: 'Segoe UI', Arial, sans-serif; padding: 20px; color: #333; }
            .report-header { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2px solid #d97706; padding-bottom: 10px; margin-bottom: 20px; }
            .report-title { font-size: 20px; font-weight: bold; color: #b45309; }
            .filter-meta { font-size: 12px; color: #666; margin-top: 5px; }
            .report-table { width: 100%; border-collapse: collapse; margin-top: 10px; }
            .report-table th, .report-table td { border: 1px solid #e5e7eb; padding: 10px; text-align: left; font-size: 13px; }
            .report-table th { background-color: #f3f4f6; color: #374151; font-weight: bold; text-transform: uppercase; font-size: 11px; }
            .report-table tr:nth-child(even) { background-color: #fafafa; }
            .footer { position: fixed; bottom: 10px; left: 0; right: 0; text-align: center; font-size: 10px; color: #9ca3af; border-top: 1px dashed #e5e7eb; padding-top: 5px; }
          </style>
        </head>
        <body>
          <div class="report-header">
            <div>
              <div class="report-title">🤝 Payment Promise Collection Report</div>
              <div class="filter-meta">
                ${promiseDate ? `<strong>Target Date:</strong> ${new Date(promiseDate).toLocaleDateString('en-GB')} | ` : '<strong>Target Date:</strong> All Dates | '}
                ${addressSearch ? `<strong>Location Filter:</strong> "${addressSearch}" | ` : ''}
                <strong>Page:</strong> ${page} of ${totalPages}
              </div>
            </div>
            <div style="text-align: right; font-size: 12px; color: #666;">
              <strong>Total Records:</strong> ${totalPromises} <br/>
              <strong>Print Date:</strong> ${new Date().toLocaleString('en-GB')}
            </div>
          </div>
          
          <table class="report-table">
            <thead>
              <tr>
                <th style="width: 5%; text-align: center;">No</th>
                <th style="width: 25%;">Client & IP info</th>
                <th style="width: 30%;">Location / Address</th>
                <th style="width: 15%; text-align: center;">Promise Date</th>
                <th style="width: 25%;">Collection Note</th>
              </tr>
            </thead>
            <tbody>
              ${tableRows}
            </tbody>
          </table>
          <script>
            window.onload = function() {
              window.print();
              setTimeout(function() { window.frameElement.remove(); }, 100);
            };
          </script>
        </body>
      </html>
    `;

    doc.open();
    doc.write(printContent);
    doc.close();
  };

  return (
    <div className="container mx-auto p-4 md:p-6 bg-gray-50 min-h-screen">
      
      {/* হেডার */}
      <div className="mb-6 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 border-b pb-4">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-amber-600 flex items-center gap-2">
            🤝 Payment Promise Directory
          </h1>
          <p className="text-xs md:text-sm text-gray-500">
            Strictly date-based filtering. Select any year or month from calendar.
          </p>
        </div>

        {/* ফিল্টারিং প্যানেল */}
        <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto flex-grow max-w-3xl justify-end items-center">
          
          {/* সার্চ এরিয়া */}
          <div className="relative w-full sm:flex-grow">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"><MdLocationOn size={16} /></span>
            <input 
              type="text" 
              value={addressSearch}
              onChange={(e) => { setAddressSearch(e.target.value); setPage(1); }} 
              placeholder="Search by Area/Address..." 
              className="w-full pl-9 pr-3 py-2 text-xs md:text-sm bg-white border border-gray-300 rounded-lg shadow-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-amber-500" 
            />
          </div>
          
          {/* 📅 ডাইনামিক ডেট ইনপুট (যেকোনো মাস/বছর সিলেক্ট করা যাবে) */}
          <div className="relative w-full sm:w-48">
            <input 
              type="date" 
              value={promiseDate} 
              onChange={(e) => { setPromiseDate(e.target.value); setPage(1); }} 
              className="w-full px-3 py-2 text-xs md:text-sm bg-amber-50 border border-amber-300 rounded-lg shadow-sm text-amber-900 focus:outline-none focus:ring-2 focus:ring-amber-500 font-medium" 
            />
            {promiseDate && (
              <button 
                onClick={() => { setPromiseDate(''); setPage(1); }} 
                className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-red-500 text-xs font-bold px-1"
              >
                ✕
              </button>
            )}
          </div>

          {/* প্রিন্ট বাটন */}
          <button
            onClick={handlePrintAllReport}
            className="btn btn-sm bg-blue-600 hover:bg-blue-700 text-white font-semibold flex items-center gap-1.5 shadow-md w-full sm:w-auto px-4 border-none"
          >
            <MdPrint size={16} /> Print Report
          </button>
        </div>

        <div className="bg-amber-500 text-white px-4 py-2 rounded-lg shadow text-xs md:text-sm font-medium whitespace-nowrap">
          Total Found: {totalPromises}
        </div>
      </div>

      {/* রেন্ডারিং এরিয়া */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center min-h-[300px] bg-white rounded-xl shadow-sm">
          <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-amber-500 mb-3"></div>
          <p className="text-gray-500 text-sm">Fetching scheduled logs...</p>
        </div>
      ) : promisesList.length === 0 ? (
        <div className="flex flex-col items-center justify-center min-h-[300px] bg-white rounded-xl p-6 border text-center shadow-sm">
          <p className="text-gray-400 text-lg font-semibold">No Bills Scheduled on This Date</p>
          <p className="text-gray-400 text-xs mt-1">Please change the calendar date filter to search past/future logs.</p>
        </div>
      ) : (
        <>
          {/* মোবাইল ভিউ */}
          <div className="grid grid-cols-1 gap-4 md:hidden">
            {promisesList.map((item, idx) => (
              <div key={item?._id || idx} className="bg-white p-4 rounded-xl shadow-sm border border-amber-100 flex flex-col gap-2">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-base font-bold text-gray-800">{item?.client_name}</h3>
                    <p className="text-xs font-mono text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded-sm inline-block mt-0.5">
                      IP: {item?.ip || 'N/A'}
                    </p>
                  </div>
                  <span className="bg-amber-100 text-amber-800 font-bold px-2 py-0.5 rounded text-xs">
                    📅 {item?.promise_date ? new Date(item.promise_date).toLocaleDateString('en-GB') : 'N/A'}
                  </span>
                </div>
                <p className="text-xs text-gray-600"><b>Address:</b> {item?.address || 'N/A'}</p>
                <div className="bg-gray-50 p-2 rounded text-xs text-gray-700 border italic">
                  " {item?.promise_note || 'No custom note.'} "
                </div>
              </div>
            ))}
          </div>

          {/* ডেক্সটপ টেবিল */}
          <div className="hidden md:block bg-white rounded-xl shadow-md overflow-hidden border border-gray-100">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-100 text-gray-700 text-xs uppercase font-semibold border-b border-gray-200">
                    <th className="py-4 px-6 text-center w-16">No</th>
                    <th className="py-4 px-6">Client Info & IP</th>
                    <th className="py-4 px-6">Follow-up Location</th>
                    <th className="py-4 px-6 text-center">Promise Date</th>
                    <th className="py-4 px-6">Collection Note</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-sm text-gray-600">
                  {promisesList.map((item, index) => (
                    <tr key={item?._id || index} className="hover:bg-amber-50/30 transition-colors">
                      <td className="py-4 px-6 text-center text-gray-400 font-mono">{(page - 1) * 30 + index + 1}</td>
                      <td className="py-4 px-6">
                        <div className="font-semibold text-gray-800">{item?.client_name}</div>
                        <div className="text-xs font-mono text-gray-400 flex items-center gap-1 mt-0.5">
                          <MdDevices size={12} /> {item?.ip || 'N/A'}
                        </div>
                      </td>
                      <td className="py-4 px-6 max-w-xs truncate" title={item?.address}>{item?.address || 'N/A'}</td>
                      <td className="py-4 px-6 text-center">
                        <span className="bg-amber-100 text-amber-800 font-bold px-2.5 py-1 rounded text-xs">
                          📅 {item?.promise_date ? new Date(item.promise_date).toLocaleDateString('en-GB') : 'N/A'}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-xs text-gray-500 italic max-w-xs truncate" title={item?.promise_note}>
                        {item?.promise_note || 'No explicit description.'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* প্যাগিনেশন */}
          <div className="flex justify-center items-center gap-4 mt-6 pb-10">
            <button 
              disabled={page === 1} 
              onClick={() => setPage(prev => Math.max(prev - 1, 1))} 
              className="btn btn-sm btn-outline flex items-center gap-1"
            >
              <MdNavigateBefore size={18} /> Previous
            </button>
            <span className="text-xs md:text-sm font-semibold text-gray-700">
              Page {page} of {totalPages}
            </span>
            <button 
              disabled={page === totalPages} 
              onClick={() => setPage(prev => Math.min(prev + 1, totalPages))} 
              className="btn btn-sm btn-outline flex items-center gap-1"
            >
              Next <MdNavigateNext size={18} />
            </button>
          </div>
        </>
      )}
    </div>
  );
}