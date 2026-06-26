'use client';

import PrintExpenseReport from '@/components/PrintExpenseReport';
import useAxios from '@/hook/useAxios';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import React, { useState } from 'react';
import { MdTrendingUp, MdListAlt, MdCategory, MdAddCircle } from 'react-icons/md';
import Swal from 'sweetalert2';

const ExpansePage = () => {
    const instance = useAxios();
    const queryClient = useQueryClient();
    
    // ফিল্টার স্টেটটি কন্ট্রোল করবে কোন এপিআই কল হবে ('all' | 'today' | 'month')
    const [filterType, setFilterType] = useState('all');

    const [formData, setFormData] = useState({
        title: '',
        amount: '',
        category: '',
        note: ''
    });

    // 📦 ডাইনামিক এপিআই রুট সিলেকশন
    const getApiEndpoint = () => {
        if (filterType === 'today') return '/expenses/today';
        if (filterType === 'month') return '/expenses/this-month';
        return '/expenses';
    };

    // 📦 এক্সপেন্স ডেটা ফেচ (ফিল্টার টাইপ চেঞ্জ হলে অটোমেটিক রি-ফেচ হবে)
    const { data: responseData, isLoading } = useQuery({
        queryKey: ['expenses', filterType],
        queryFn: async () => {
            const res = await instance.get(getApiEndpoint());
            return res.data;
        }
    });

    // টোটাল লাইফটাইম খরচের সামারি কার্ডের জন্য আলাদা কুয়েরি
    const { data: totalExpenseSummary } = useQuery({
        queryKey: ['expense-total'],
        queryFn: async () => {
            const res = await instance.get('/expenses-total');
            return res.data;
        }
    });

    // 🛠️ ফিক্স ১: ব্যাকএন্ড রেসপন্স অবজেক্ট বা সরাসরি অ্যারে উভয় ফরম্যাটই হ্যান্ডেল করার সেফটি মেথড
    const expensesList = Array.isArray(responseData) 
        ? responseData 
        : (responseData?.data || []);
    
    // বর্তমান ভিউ এর টোটাল হিসাব
    const viewTotalAmount = responseData?.totalAmount ?? expensesList.reduce((sum, item) => sum + (Number(item.amount) || 0), 0) ?? 0;

    // ➕ অ্যাড এক্সপেন্স মিউটেশন
    const addExpense = useMutation({
        mutationFn: async (data) => {
            const res = await instance.post('/expenses', data);
            return res.data;
        },
        onSuccess: () => {
            // 🛠️ ফিক্স ২: এক্সপেন্সের সব কুয়েরি একসাথে রি-ফেচ করার জন্য জেনেরিক কি ইনভ্যালিডেশন
            queryClient.invalidateQueries({ queryKey: ['expenses'] });
            queryClient.invalidateQueries({ queryKey: ['expense-total'] });

            Swal.fire({
                icon: 'success',
                title: 'Saved Successfully',
                timer: 1500,
                showConfirmButton: false,
            });

            setFormData({ title: '', amount: '', category: '', note: '' });
        },
        onError: (error) => {
            Swal.fire({
                icon: 'error',
                title: 'Failed to save',
                text: error?.response?.data?.message || 'Something went wrong!',
            });
        }
    });

    // ❌ ডিলিট এক্সপেন্স মিউটেশন
    const deleteExpense = useMutation({
        mutationFn: async (id) => {
            const res = await instance.delete(`/expenses/${id}`);
            return res.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['expenses'] });
            queryClient.invalidateQueries({ queryKey: ['expense-total'] });
            
            Swal.fire({
                icon: 'success',
                title: 'Deleted Successfully',
                timer: 1000,
                showConfirmButton: false,
            });
        }
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!formData.title || !formData.amount) {
            Swal.fire({ icon: 'warning', title: 'Title & Amount are required!' });
            return;
        }
        addExpense.mutate({ ...formData, amount: Number(formData.amount) });
    };

    return (
        <div className="min-h-screen bg-slate-50/50 text-slate-600 p-4 md:p-6">
            <div className="container mx-auto max-w-6xl">

                {/* --- HEADER --- */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 no-print bg-white p-4 rounded-2xl border border-slate-100 shadow-xs">
                    <div>
                        <h1 className="text-xl md:text-2xl font-bold text-slate-900 tracking-tight">Expense Panel</h1>
                        <p className="text-xs text-slate-400">Filter, Print and Export reports dynamically</p>
                    </div>

                    <div className="flex items-center gap-2 w-full sm:w-auto">
                        <PrintExpenseReport data={expensesList} reportTitle={`${filterType.toUpperCase()} Expense Report`} />
                    </div>
                </div>

                {/* --- FILTER TABS --- */}
                <div className="flex gap-2 mb-6 no-print bg-slate-100 p-1.5 rounded-xl w-fit">
                    {['all', 'today', 'month'].map((type) => (
                        <button
                            key={type}
                            onClick={() => setFilterType(type)}
                            className={`px-4 py-1.5 rounded-lg text-xs md:text-sm font-bold transition-all cursor-pointer ${filterType === type ? 'bg-white text-blue-600 shadow-xs' : 'text-slate-500 hover:text-slate-800'}`}
                        >
                            {type === 'all' ? 'All Expenses' : type === 'today' ? 'Today' : 'This Month'}
                        </button>
                    ))}
                </div>

                {/* --- SUMMARY CARDS --- */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <div className="bg-white rounded-2xl border border-slate-100 p-5 flex items-center justify-between">
                        <div>
                            <h3 className="text-slate-400 text-xs font-bold uppercase">
                                {filterType === 'all' ? 'Total Expense' : filterType === 'today' ? "Today's Expense" : "This Month's Cost"}
                            </h3>
                            <p className="text-2xl md:text-3xl font-extrabold text-red-600 mt-1 font-mono">
                                ৳ {viewTotalAmount}
                            </p>
                        </div>
                        <div className="p-3 bg-red-50 text-red-500 rounded-xl">
                            <MdTrendingUp size={24} />
                        </div>
                    </div>

                    <div className="bg-white rounded-2xl border border-slate-100 p-5 flex items-center justify-between">
                        <div>
                            <h3 className="text-slate-400 text-xs font-bold uppercase">Filtered Entries</h3>
                            <p className="text-2xl md:text-3xl font-extrabold text-slate-800 mt-1 font-mono">
                                {expensesList.length}
                            </p>
                        </div>
                        <div className="p-3 bg-blue-50 text-blue-500 rounded-xl">
                            <MdListAlt size={24} />
                        </div>
                    </div>

                    <div className="bg-white rounded-2xl border border-slate-100 p-5 flex items-center justify-between">
                        <div>
                            <h3 className="text-slate-400 text-xs font-bold uppercase">Latest Category</h3>
                            <p className="text-base md:text-lg font-bold text-slate-700 mt-1.5 truncate max-w-[150px]">
                                {/* 🛠️ ফিক্স ৩: ইনডেক্স ০ দিয়ে প্রথম অবজেক্টের ক্যাটাগরি সেফলি রিড করা */}
                                {expensesList?.category || 'N/A'}
                            </p>
                        </div>
                        <div className="p-3 bg-purple-50 text-purple-500 rounded-xl">
                            <MdCategory size={24} />
                        </div>
                    </div>
                </div>

                {/* --- INPUT FORM --- */}
                <div className="bg-white rounded-2xl border border-slate-100 p-6 mb-6 no-print">
                    <h2 className="font-bold text-slate-800 text-xs md:text-sm mb-4 flex items-center gap-1.5">
                        <MdAddCircle className="text-blue-500" size={18} /> Add New Entry
                    </h2>
                    <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                        <input required type="text" placeholder="Title" className="w-full px-3 py-2 text-xs md:text-sm border border-slate-200 rounded-xl" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} />
                        <input required type="number" placeholder="Amount" className="w-full px-3 py-2 text-xs md:text-sm border border-slate-200 rounded-xl" value={formData.amount} onChange={(e) => setFormData({ ...formData, amount: e.target.value })} />
                        <input type="text" placeholder="Category" className="w-full px-3 py-2 text-xs md:text-sm border border-slate-200 rounded-xl" value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })} />
                        <input type="text" placeholder="Note" className="w-full px-3 py-2 text-xs md:text-sm border border-slate-200 rounded-xl" value={formData.note} onChange={(e) => setFormData({ ...formData, note: e.target.value })} />
                        <button type="submit" disabled={addExpense.isPending} className="sm:col-span-2 md:col-span-4 bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 text-white py-2 rounded-xl text-xs md:text-sm font-bold cursor-pointer transition-all">
                            {addExpense.isPending ? 'Saving...' : 'Save Expense'}
                        </button>
                    </form>
                </div>

                {/* --- DATA TABLE --- */}
                <div id="print-area" className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-50 text-slate-500 text-[11px] uppercase font-bold tracking-wider border-b border-slate-100">
                                    <th className="py-3 px-4 text-center w-12">#</th>
                                    <th className="py-3 px-4">Title</th>
                                    <th className="py-3 px-4">Category</th>
                                    <th className="py-3 px-4 text-right">Amount</th>
                                    <th className="py-3 px-4">Note</th>
                                    <th className="py-3 px-4 text-center">Date</th>
                                    <th className="py-3 px-4 text-center no-print w-24">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 text-xs md:text-sm font-medium">
                                {expensesList.map((expense, index) => (
                                    <tr key={expense._id || index} className="hover:bg-slate-50/50">
                                        <td className="py-3 px-4 text-center font-bold text-slate-400 font-mono">{index + 1}</td>
                                        <td className="py-3 px-4 font-bold text-slate-800">{expense.title}</td>
                                        <td className="py-3 px-4"><span className="bg-blue-50 text-blue-600 rounded-lg px-2.5 py-0.5 text-xs font-semibold">{expense.category || 'General'}</span></td>
                                        <td className="py-3 px-4 text-right font-extrabold text-red-600 font-mono">৳ {expense.amount}</td>
                                        <td className="py-3 px-4 text-slate-400 max-w-xs truncate">{expense.note || '-'}</td>
                                        <td className="py-3 px-4 text-center text-xs text-slate-400 font-mono">{expense.expenseDate ? new Date(expense.expenseDate).toLocaleDateString() : 'N/A'}</td>
                                        <td className="py-3 px-4 text-center no-print">
                                            <button onClick={() => deleteExpense.mutate(expense._id)} className="bg-rose-50 text-rose-600 hover:bg-rose-100 p-1.5 rounded-lg text-xs font-bold border border-rose-100 cursor-pointer">Delete</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {(isLoading || expensesList.length === 0) && (
                            <div className="text-center py-12 text-slate-400">
                                {isLoading ? 'Loading expenses...' : 'No Expense Entries Found for this filter.'}
                            </div>
                        )}
                    </div>
                </div>

            </div>
        </div>
    );
};

export default ExpansePage;