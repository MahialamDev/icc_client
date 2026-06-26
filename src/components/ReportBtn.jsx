'use client';

import React from 'react';
import { MdWarning } from 'react-icons/md';
import Swal from 'sweetalert2';

const ReportBtn = ({ client }) => {
  
  const handleReportProblem = () => {
    Swal.fire({
      title: 'সমস্যা রিপোর্ট করুন',
      input: 'textarea',
      inputLabel: `${client?.client_name || 'গ্রাহক'}-এর সমস্যাটি নিচে বাংলায় লিখুন`,
      inputPlaceholder: 'এখানে বিস্তারিত সমস্যাটি টাইপ করুন...',
      showCancelButton: true,
      confirmButtonColor: '#2563eb', // প্রিমিয়াম ব্লু
      cancelButtonColor: '#6b7280',
      confirmButtonText: '📋 কপি করুন ও গ্রুপে যান', 
      cancelButtonText: 'বাতিল',
      preConfirm: (problemText) => {
        if (!problemText || !problemText.trim()) {
          Swal.showValidationMessage('অনুগ্রহ করে আগে সমস্যার বিবরণটি লিখুন!');
        }
        return problemText;
      }
    }).then((result) => {
      if (result.isConfirmed) {
        const problem = result.value;
        const formattedSl = String(client?.sl || 0).padStart(3, '0');
        
        // 📋 নামসহ টেক্সট ফরম্যাট (বাংলায় আউটপুট)
        const finalMessage = `ID: ${formattedSl}\n\nName: ${client?.client_name || 'N/A'}\n\nNumber: ${client?.mobile || 'N/A'}\n\nAddress: ${client?.zone || client?.address || 'N/A'}\n\nProblem: ${problem}`;

        // ১. ক্লিপবোর্ডে কপি করা
        navigator.clipboard.writeText(finalMessage)
          .then(() => {
            
            // আপনার দেওয়া নির্দিষ্ট হোয়াটসঅ্যাপ বিজনেস গ্রুপের লিঙ্ক 🎯
            const groupBaseUrl = "https://chat.whatsapp.com/DmcuMThSPGWHVb3LxRPYDS";

            // সফলতার মেসেজ দেখিয়ে গ্রুপ ওপেন করা
            Swal.fire({
              icon: 'success',
              title: 'কপি হয়েছে!',
              text: 'হোয়াটসঅ্যাপ গ্রুপ ওপেন হচ্ছে, সেখানে মেসেজটি Paste (পেস্ট) করুন।',
              timer: 2000,
              showConfirmButton: false
            });

            // নতুন ট্যাবে সরাসরি আপনার ওই হোয়াটসঅ্যাপ গ্রুপটি ওপেন হবে
            window.open(groupBaseUrl, '_blank');
          })
          .catch((err) => {
            console.error("Copy error: ", err);
            Swal.fire({
              icon: 'error',
              title: 'ব্যর্থ হয়েছে',
              text: 'কপি করার সময় কোনো একটি সমস্যা হয়েছে।',
              confirmButtonColor: '#ef4444'
            });
          });
      }
    });
  };

  return (
    <button 
      onClick={handleReportProblem} 
      className="px-2.5 py-1 text-[11px] font-bold rounded-md bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-100 flex items-center gap-1 shadow-xs transition-all duration-200 cursor-pointer"
    >
      <MdWarning size={13} className="text-amber-600" /> Report
    </button>
  );
};

export default ReportBtn;