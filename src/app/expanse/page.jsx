'use client';

import useAxios from '@/hook/useAxios';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import React, { useState } from 'react';

const ExpansePage = () => {
    const instance = useAxios();
    const queryClient = useQueryClient();

    const [formData, setFormData] = useState({
        title: '',
        amount: '',
        category: '',
        note: ''
    });

    const { data: expensesData, isLoading } = useQuery({
        queryKey: ['expenses'],
        queryFn: async () => {
            const res = await instance.get('/expenses');
            return res.data;
        }
    });

    const { data: totalExpenseData } = useQuery({
        queryKey: ['expense-total'],
        queryFn: async () => {
            const res = await instance.get('/expenses-total');
            return res.data;
        }
    });

    const addExpense = useMutation({
        mutationFn: async (data) => {
            const res = await instance.post('/expenses', data);
            return res.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['expenses']);
            queryClient.invalidateQueries(['expense-total']);

            setFormData({
                title: '',
                amount: '',
                category: '',
                note: ''
            });
        }
    });

    const deleteExpense = useMutation({
        mutationFn: async (id) => {
            const res = await instance.delete(`/expenses/${id}`);
            return res.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['expenses']);
            queryClient.invalidateQueries(['expense-total']);
        }
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        addExpense.mutate(formData);
    };

    const handlePrint = () => {
        window.print();
    };

    return (
        <div className="container mx-auto p-4">

            {/* Header */}
            <div className="flex justify-between items-center mb-6 no-print">
                <h1 className="text-2xl font-bold">
                    Expense Management
                </h1>

                <button
                    onClick={handlePrint}
                    className="btn btn-primary"
                >
                    Print Report
                </button>
            </div>

            {/* Summary */}
            <div className="grid md:grid-cols-3 gap-4 mb-6">
                <div className="bg-white rounded-xl shadow p-5">
                    <h3 className="text-gray-500 text-sm">
                        Total Expense
                    </h3>

                    <p className="text-3xl font-bold text-red-600">
                        ৳ {totalExpenseData?.totalExpense || 0}
                    </p>
                </div>

                <div className="bg-white rounded-xl shadow p-5">
                    <h3 className="text-gray-500 text-sm">
                        Total Entries
                    </h3>

                    <p className="text-3xl font-bold">
                        {expensesData?.data?.length || 0}
                    </p>
                </div>

                <div className="bg-white rounded-xl shadow p-5">
                    <h3 className="text-gray-500 text-sm">
                        Latest Category
                    </h3>

                    <p className="text-lg font-semibold">
                        {expensesData?.data?.[0]?.category || 'N/A'}
                    </p>
                </div>
            </div>

            {/* Add Expense */}
            <div className="bg-white rounded-xl shadow p-6 mb-6 no-print">
                <h2 className="font-bold text-lg mb-4">
                    Add New Expense
                </h2>

                <form
                    onSubmit={handleSubmit}
                    className="grid md:grid-cols-2 gap-4"
                >
                    <input
                        type="text"
                        placeholder="Expense Title"
                        className="input input-bordered w-full"
                        value={formData.title}
                        onChange={(e) =>
                            setFormData({
                                ...formData,
                                title: e.target.value
                            })
                        }
                    />

                    <input
                        type="number"
                        placeholder="Amount"
                        className="input input-bordered w-full"
                        value={formData.amount}
                        onChange={(e) =>
                            setFormData({
                                ...formData,
                                amount: e.target.value
                            })
                        }
                    />

                    <input
                        type="text"
                        placeholder="Category"
                        className="input input-bordered w-full"
                        value={formData.category}
                        onChange={(e) =>
                            setFormData({
                                ...formData,
                                category: e.target.value
                            })
                        }
                    />

                    <input
                        type="text"
                        placeholder="Note"
                        className="input input-bordered w-full"
                        value={formData.note}
                        onChange={(e) =>
                            setFormData({
                                ...formData,
                                note: e.target.value
                            })
                        }
                    />

                    <button
                        type="submit"
                        className="btn btn-success col-span-full"
                    >
                        Save Expense
                    </button>
                </form>
            </div>

            {/* Expense Table */}
            <div
                id="print-area"
                className="bg-white rounded-xl shadow overflow-hidden"
            >
                <div className="p-4 border-b">
                    <h2 className="font-bold text-lg">
                        Expense History
                    </h2>
                </div>

                <div className="overflow-x-auto">
                    <table className="table table-zebra">
                        <thead>
                            <tr>
                                <th>#</th>
                                <th>Title</th>
                                <th>Category</th>
                                <th>Amount</th>
                                <th>Note</th>
                                <th>Date</th>
                                <th className="no-print">
                                    Action
                                </th>
                            </tr>
                        </thead>

                        <tbody>
                            {expensesData?.data?.map((expense, index) => (
                                <tr key={expense._id}>
                                    <td>{index + 1}</td>

                                    <td>{expense.title}</td>

                                    <td>{expense.category}</td>

                                    <td>
                                        ৳ {expense.amount}
                                    </td>

                                    <td>{expense.note}</td>

                                    <td>
                                        {new Date(
                                            expense.expenseDate
                                        ).toLocaleDateString()}
                                    </td>

                                    <td className="no-print">
                                        <button
                                            onClick={() =>
                                                deleteExpense.mutate(
                                                    expense._id
                                                )
                                            }
                                            className="btn btn-error btn-sm"
                                        >
                                            Delete
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    {!isLoading &&
                        expensesData?.data?.length === 0 && (
                            <div className="text-center py-10">
                                No Expense Found
                            </div>
                        )}
                </div>
            </div>
        </div>
    );
};

export default ExpansePage;