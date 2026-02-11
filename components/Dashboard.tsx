import React, { useState, useEffect } from 'react';
import { Transaction, Account, UserData } from '../types';
import { analyzeFinances } from '../services/gemini';
import { StorageService } from '../services/storage';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Legend } from 'recharts';
import { Plus, Wallet, TrendingUp, TrendingDown, Wand2, Trash2, Sparkles, AlertTriangle, Calendar, Target, Settings, Cpu, X, Pencil, Check, ListFilter, Save, Landmark, CreditCard, PieChart as PieIcon, BarChart3, Loader2 } from 'lucide-react';

const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff8042', '#a4de6c', '#ff6b6b', '#4ecdc4', '#45b7d1'];

interface DashboardProps {
    userId: string;
}

const Dashboard: React.FC<DashboardProps> = ({ userId }) => {
  const [loading, setLoading] = useState(true);
  
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [insight, setInsight] = useState<string>('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showBudgetAlert, setShowBudgetAlert] = useState(false);
  const [overBudgetCategory, setOverBudgetCategory] = useState<string | null>(null);
  
  // Category State
  const [categories, setCategories] = useState<string[]>([]);
  const [showCategoryManager, setShowCategoryManager] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [editingCategory, setEditingCategory] = useState<{ index: number; text: string } | null>(null);

  // Category Budget Limits State
  const [categoryLimits, setCategoryLimits] = useState<{ [key: string]: number }>({});

  // Bank Accounts State
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [showAddAccount, setShowAddAccount] = useState(false);
  const [editingAccount, setEditingAccount] = useState<Account | null>(null);
  const [newAccountName, setNewAccountName] = useState('');
  const [newAccountType, setNewAccountType] = useState('Savings');
  const [newAccountBalance, setNewAccountBalance] = useState('');

  // Transaction Edit State
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);

  // Budget State
  const [budgetMode, setBudgetMode] = useState<'smart' | 'custom'>('smart');
  const [customLimit, setCustomLimit] = useState<string>('10000');
  
  // Chart View State
  const [chartView, setChartView] = useState<'breakdown' | 'trends'>('trends');

  // Form state
  const [desc, setDesc] = useState('');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [cat, setCat] = useState('Food');
  const [type, setType] = useState<'income' | 'expense'>('expense');

  // --- Data Persistence Effects ---
  
  // 1. Load Data
  useEffect(() => {
    setLoading(true);
    const data = StorageService.getUserData(userId);
    setTransactions(data.transactions);
    setAccounts(data.accounts);
    setCategories(data.categories);
    setCategoryLimits(data.categoryLimits);
    setBudgetMode(data.budgetMode);
    setCustomLimit(data.customLimit);
    
    // Ensure default category is selected if available
    if (data.categories.length > 0) {
        setCat(data.categories[0]);
    }
    setLoading(false);
  }, [userId]);

  // 2. Save Data Helper
  const persistData = (partialData: Partial<UserData>) => {
      StorageService.updateUserData(userId, partialData);
  };

  // --- Derived state ---
  const totalIncome = transactions.filter(t => t.type === 'income').reduce((acc, curr) => acc + curr.amount, 0);
  const totalExpense = transactions.filter(t => t.type === 'expense').reduce((acc, curr) => acc + curr.amount, 0);
  const totalInitialBalance = accounts.reduce((acc, curr) => acc + curr.balance, 0);
  const currentBalance = totalInitialBalance + totalIncome - totalExpense;

  // Budget Calculations
  const effectiveLimit = budgetMode === 'smart' ? totalIncome : (parseFloat(customLimit) || 0);
  const isOverBudget = totalExpense > effectiveLimit && effectiveLimit > 0;
  const budgetUsagePercent = effectiveLimit > 0 ? Math.min((totalExpense / effectiveLimit) * 100, 100) : 0;

  const expensesByCategory = transactions
    .filter(t => t.type === 'expense')
    .reduce((acc, curr) => {
      const found = acc.find(item => item.name === curr.category);
      if (found) {
        found.value += curr.amount;
      } else {
        acc.push({ name: curr.category, value: curr.amount });
      }
      return acc;
    }, [] as { name: string; value: number }[]);

  // Chart Data: Income vs Expense by Date
  const dailyStats = transactions.reduce((acc, curr) => {
    const d = curr.date;
    const existing = acc.find(item => item.date === d);
    if (existing) {
        if (curr.type === 'income') existing.income += curr.amount;
        else existing.expense += curr.amount;
    } else {
        acc.push({
            date: d,
            income: curr.type === 'income' ? curr.amount : 0,
            expense: curr.type === 'expense' ? curr.amount : 0
        });
    }
    return acc;
  }, [] as { date: string; income: number; expense: number }[])
  .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  // Category Stats for Budgeting
  const categoryStats = categories
    .filter(c => c !== 'Income')
    .map(cat => {
      const spent = transactions
        .filter(t => t.type === 'expense' && t.category === cat)
        .reduce((sum, t) => sum + t.amount, 0);
      const limit = categoryLimits[cat] || 0;
      const progress = limit > 0 ? Math.min((spent / limit) * 100, 100) : 0;
      const isOver = limit > 0 && spent > limit;
      return { category: cat, spent, limit, progress, isOver };
    });

  // Helper map for O(1) category status lookup in the list
  const categoryStatus = categoryStats.reduce((acc, curr) => {
    acc[curr.category] = curr.isOver;
    return acc;
  }, {} as Record<string, boolean>);

  // --- Handlers ---

  const handleAddTransaction = (e: React.FormEvent) => {
    e.preventDefault();
    if (!desc || !amount || !date) return;

    const val = parseFloat(amount);

    // Check if this transaction triggers a budget breach
    if (type === 'expense') {
        const currentExpense = transactions.filter(t => t.type === 'expense').reduce((acc, curr) => acc + curr.amount, 0);
        const limit = budgetMode === 'smart' ? totalIncome : (parseFloat(customLimit) || 0);

        if (limit > 0 && (currentExpense + val) > limit) {
            setShowBudgetAlert(true);
        }

        // Category Limit Check
        const catLimit = categoryLimits[cat] || 0;
        if (catLimit > 0) {
             const currentCategorySpent = transactions
                .filter(t => t.type === 'expense' && t.category === cat)
                .reduce((acc, curr) => acc + curr.amount, 0);
            
            if (currentCategorySpent + val > catLimit) {
                setOverBudgetCategory(cat);
            }
        }
    }

    const newTx: Transaction = {
      id: Date.now().toString(),
      description: desc,
      amount: val,
      date: date,
      category: cat,
      type: type
    };

    const updated = [newTx, ...transactions];
    setTransactions(updated);
    persistData({ transactions: updated });

    setDesc('');
    setAmount('');
    setDate(new Date().toISOString().split('T')[0]);
  };

  const handleAddAccount = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAccountName || !newAccountBalance) return;
    
    const colors = [
        'from-purple-600 to-purple-400',
        'from-pink-600 to-pink-400',
        'from-orange-600 to-orange-400',
        'from-teal-600 to-teal-400'
    ];
    const randomColor = colors[Math.floor(Math.random() * colors.length)];

    const newAccounts = [...accounts, {
        id: Date.now().toString(),
        name: newAccountName,
        type: newAccountType,
        balance: parseFloat(newAccountBalance),
        color: randomColor
    }];
    
    setAccounts(newAccounts);
    persistData({ accounts: newAccounts });
    
    setShowAddAccount(false);
    setNewAccountName('');
    setNewAccountBalance('');
  };

  const handleDeleteAccount = (id: string) => {
    const updated = accounts.filter(a => a.id !== id);
    setAccounts(updated);
    persistData({ accounts: updated });
  };

  const handleUpdateAccount = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingAccount || !editingAccount.name) return;

    const updated = accounts.map(acc => 
        acc.id === editingAccount.id ? editingAccount : acc
    );
    setAccounts(updated);
    persistData({ accounts: updated });
    setEditingAccount(null);
  };

  const handleUpdateTransaction = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTransaction) return;

    const updated = transactions.map(t => 
        t.id === editingTransaction.id ? editingTransaction : t
    );
    setTransactions(updated);
    persistData({ transactions: updated });
    setEditingTransaction(null);
  };

  const handleDelete = (id: string) => {
    const updated = transactions.filter(t => t.id !== id);
    setTransactions(updated);
    persistData({ transactions: updated });
  }

  // Category Management Handlers
  const handleAddCategory = () => {
    if (newCategoryName.trim() && !categories.includes(newCategoryName.trim())) {
      const updated = [...categories, newCategoryName.trim()];
      setCategories(updated);
      persistData({ categories: updated });
      setNewCategoryName('');
    }
  };

  const handleDeleteCategory = (index: number) => {
    const categoryToDelete = categories[index];
    const newCategories = categories.filter((_, i) => i !== index);
    setCategories(newCategories);
    persistData({ categories: newCategories });
    
    if (cat === categoryToDelete && newCategories.length > 0) {
      setCat(newCategories[0]);
    }
  };

  const startEditingCategory = (index: number) => {
    setEditingCategory({ index, text: categories[index] });
  };

  const saveEditedCategory = () => {
    if (editingCategory && editingCategory.text.trim()) {
        const oldName = categories[editingCategory.index];
        const newName = editingCategory.text.trim();

        if (!categories.includes(newName) || oldName === newName) {
            const newCategories = [...categories];
            newCategories[editingCategory.index] = newName;
            setCategories(newCategories);
            
            // Update transactions with the new category name
            const updatedTransactions = transactions.map(t => 
                t.category === oldName ? { ...t, category: newName } : t
            );
            setTransactions(updatedTransactions);
            
            // Persist both
            persistData({ categories: newCategories, transactions: updatedTransactions });

            // Update current selection if needed
            if (cat === oldName) {
                setCat(newName);
            }
        }
        setEditingCategory(null);
    }
  };

  const handleUpdateCategoryLimit = (category: string, value: number) => {
      const newLimits = { ...categoryLimits, [category]: value };
      setCategoryLimits(newLimits);
      persistData({ categoryLimits: newLimits });
  };
  
  const handleBudgetModeChange = (mode: 'smart' | 'custom') => {
      setBudgetMode(mode);
      persistData({ budgetMode: mode });
  };
  
  const handleCustomLimitChange = (val: string) => {
      setCustomLimit(val);
      persistData({ customLimit: val });
  };

  const handleAnalyze = async () => {
    setIsAnalyzing(true);
    const result = await analyzeFinances(transactions);
    setInsight(result);
    setIsAnalyzing(false);
  };

  const formatDate = (dateStr: string) => {
    try {
        const options: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'short', year: 'numeric' };
        return new Date(dateStr).toLocaleDateString('en-IN', options);
    } catch (e) {
        return dateStr;
    }
  };

  if (loading) {
      return (
          <div className="min-h-screen bg-[#050507] flex items-center justify-center">
              <Loader2 className="w-10 h-10 animate-spin text-purple-500" />
          </div>
      );
  }

  return (
    <div className="pt-24 pb-12 px-6 min-h-screen bg-[#050507]">
      <div className="container mx-auto max-w-7xl">
        <div className="flex justify-between items-end mb-8">
            <div>
                <h1 className="text-3xl font-serif italic mb-2">Financial Dashboard</h1>
                <p className="text-gray-400">Track, Manage, and Optimize your wealth.</p>
            </div>
            <button 
                onClick={handleAnalyze}
                disabled={isAnalyzing}
                className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors text-white text-sm font-medium"
            >
                {isAnalyzing ? <Wand2 className="w-4 h-4 animate-spin" /> : <Wand2 className="w-4 h-4" />}
                {isAnalyzing ? 'Analyzing...' : 'AI Analysis'}
            </button>
        </div>

        {/* AI Over Budget Notification (Inline) */}
        {isOverBudget && (
          <div className="mb-8 p-4 bg-red-900/20 border border-red-500/50 rounded-xl flex items-start gap-4 animate-pulse">
            <div className="p-2 bg-red-500/20 rounded-full text-red-400">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-red-400 font-semibold mb-1">BudgetBuddy Alert: Budget Limit Exceeded</h3>
              <p className="text-gray-300 text-sm">
                You have spent <span className="text-white font-bold">₹{totalExpense.toFixed(2)}</span>, which exceeds your {budgetMode === 'smart' ? 'income' : 'custom budget'} limit of <span className="text-white font-bold">₹{effectiveLimit.toFixed(2)}</span>. 
                I recommend reviewing your recent purchases and pausing non-essential spending.
              </p>
            </div>
          </div>
        )}

        {/* AI Insight Section */}
        {insight && (
            <div className="mb-8 p-6 glass-card rounded-2xl border border-purple-500/30 animate-in fade-in slide-in-from-top-4">
                <h3 className="text-lg font-semibold text-purple-300 mb-2 flex items-center gap-2">
                    <Sparkles className="w-4 h-4" /> AI Insights
                </h3>
                <div className="prose prose-invert prose-sm max-w-none text-gray-300">
                    <pre className="whitespace-pre-wrap font-sans">{insight}</pre>
                </div>
            </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {/* Balance Cards */}
            <div className="glass-card p-6 rounded-2xl">
                <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-blue-500/20 rounded-lg text-blue-400">
                        <Wallet className="w-5 h-5" />
                    </div>
                    <span className="text-gray-400 text-sm">Total Balance</span>
                </div>
                <p className="text-3xl font-bold text-white">₹{currentBalance.toFixed(2)}</p>
            </div>
            <div className="glass-card p-6 rounded-2xl">
                 <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-green-500/20 rounded-lg text-green-400">
                        <TrendingUp className="w-5 h-5" />
                    </div>
                    <span className="text-gray-400 text-sm">Income</span>
                </div>
                <p className="text-3xl font-bold text-green-400">+₹{totalIncome.toFixed(2)}</p>
            </div>
            <div className="glass-card p-6 rounded-2xl">
                 <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-red-500/20 rounded-lg text-red-400">
                        <TrendingDown className="w-5 h-5" />
                    </div>
                    <span className="text-gray-400 text-sm">Expenses</span>
                </div>
                <p className="text-3xl font-bold text-red-400">-₹{totalExpense.toFixed(2)}</p>
            </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column (Shifted): Charts & Category Budgets */}
            <div className="space-y-8">
                {/* Charts Card */}
                <div className="glass-card p-6 rounded-2xl flex flex-col h-[500px]">
                     <div className="flex items-center justify-between mb-6">
                        <h3 className="text-xl font-medium">Analytics</h3>
                        <div className="flex bg-white/5 rounded-lg p-1">
                            <button 
                                onClick={() => setChartView('trends')}
                                className={`p-2 rounded-md transition-colors ${chartView === 'trends' ? 'bg-white/10 text-white' : 'text-gray-400 hover:text-white'}`}
                                title="Trends"
                            >
                                <BarChart3 className="w-4 h-4" />
                            </button>
                            <button 
                                onClick={() => setChartView('breakdown')}
                                className={`p-2 rounded-md transition-colors ${chartView === 'breakdown' ? 'bg-white/10 text-white' : 'text-gray-400 hover:text-white'}`}
                                title="Breakdown"
                            >
                                <PieIcon className="w-4 h-4" />
                            </button>
                        </div>
                     </div>
                     
                     <div className="flex-1 w-full flex items-center justify-center">
                        {chartView === 'breakdown' ? (
                            expensesByCategory.length > 0 ? (
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={expensesByCategory}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={60}
                                            outerRadius={80}
                                            paddingAngle={5}
                                            dataKey="value"
                                        >
                                            {expensesByCategory.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                            ))}
                                        </Pie>
                                        <Tooltip 
                                            contentStyle={{ backgroundColor: '#121215', borderRadius: '8px', border: '1px solid #333' }}
                                            itemStyle={{ color: '#fff' }}
                                            formatter={(value: number) => `₹${value.toFixed(2)}`}
                                        />
                                        <Legend verticalAlign="bottom" height={36} iconType="circle" />
                                    </PieChart>
                                </ResponsiveContainer>
                            ) : (
                                <p className="text-gray-500 text-sm">No expenses yet</p>
                            )
                        ) : (
                             dailyStats.length > 0 ? (
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={dailyStats}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
                                        <XAxis 
                                            dataKey="date" 
                                            tickFormatter={(date) => new Date(date).toLocaleDateString('en-IN', { day: '2-digit', month: '2-digit' })}
                                            stroke="#666" 
                                            fontSize={12}
                                        />
                                        <YAxis stroke="#666" fontSize={12} tickFormatter={(value) => `₹${value}`} />
                                        <Tooltip 
                                            contentStyle={{ backgroundColor: '#121215', borderRadius: '8px', border: '1px solid #333' }}
                                            labelStyle={{ color: '#ccc' }}
                                        />
                                        <Legend />
                                        <Bar dataKey="income" name="Income" fill="#4ade80" radius={[4, 4, 0, 0]} />
                                        <Bar dataKey="expense" name="Expense" fill="#f87171" radius={[4, 4, 0, 0]} />
                                    </BarChart>
                                </ResponsiveContainer>
                             ) : (
                                <p className="text-gray-500 text-sm">No transaction data yet</p>
                             )
                        )}
                     </div>
                </div>

                {/* Category Budgets Card */}
                <div className="glass-card p-6 rounded-2xl">
                    <h3 className="text-xl font-medium mb-4 flex items-center gap-2">
                        <Target className="w-5 h-5 text-purple-400" /> Category Budgets
                    </h3>
                    <div className="space-y-4 max-h-96 overflow-y-auto pr-2 custom-scrollbar">
                        {categoryStats.length === 0 ? (
                             <p className="text-gray-500 text-sm">Add categories to set budgets.</p>
                        ) : (
                            categoryStats.map((stat) => (
                                <div key={stat.category} className="p-4 bg-white/5 rounded-xl border border-white/5 hover:bg-white/10 transition-colors">
                                    <div className="flex justify-between items-start mb-3">
                                        <div>
                                            <span className="font-medium text-gray-200 block">{stat.category}</span>
                                            {stat.limit > 0 && (
                                                <span className={`text-xs ${stat.isOver ? 'text-red-400' : 'text-green-400'}`}>
                                                    {stat.isOver ? 'Over Budget' : 'Within Budget'}
                                                </span>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-2 bg-black/20 rounded-lg px-2 py-1">
                                             <span className="text-xs text-gray-500">Limit: ₹</span>
                                             <input 
                                                type="number"
                                                className="w-16 bg-transparent text-right text-sm focus:outline-none focus:border-b focus:border-purple-500 text-white"
                                                placeholder="0"
                                                value={categoryLimits[stat.category] || ''}
                                                onChange={(e) => {
                                                    const val = parseFloat(e.target.value);
                                                    handleUpdateCategoryLimit(stat.category, isNaN(val) ? 0 : val);
                                                }}
                                             />
                                        </div>
                                    </div>
                                    
                                    {/* Progress Bar Area */}
                                    {stat.limit > 0 ? (
                                        <div className="space-y-2">
                                             <div className="flex justify-between text-xs text-gray-400">
                                                <span>₹{stat.spent.toFixed(0)} spent</span>
                                                <span>₹{stat.limit.toFixed(0)}</span>
                                             </div>
                                             <div className="relative w-full h-2 bg-white/10 rounded-full overflow-hidden">
                                                 <div 
                                                    className={`absolute top-0 left-0 h-full rounded-full transition-all duration-500 ${stat.isOver ? 'bg-red-500' : 'bg-gradient-to-r from-purple-500 to-pink-500'}`}
                                                    style={{ width: `${stat.progress}%` }}
                                                 />
                                             </div>
                                        </div>
                                    ) : (
                                        <div className="text-xs text-gray-500 italic mt-2">
                                            Set a limit above to track spending
                                        </div>
                                    )}
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>

            {/* Right Column (Shifted): Budget Control, Input & List */}
            <div className="lg:col-span-2 space-y-8">
                
                {/* Linked Accounts Section (NEW) */}
                <div className="glass-card p-6 rounded-2xl">
                    <div className="flex justify-between items-center mb-6">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-blue-500/20 rounded-lg text-blue-400">
                                <Landmark className="w-5 h-5" />
                            </div>
                            <div>
                                <h3 className="text-xl font-medium">Linked Accounts</h3>
                                <p className="text-xs text-gray-400">Manage your assets</p>
                            </div>
                        </div>
                        <button 
                            onClick={() => setShowAddAccount(true)}
                            className="flex items-center gap-2 px-3 py-1.5 bg-white/10 hover:bg-white/20 rounded-lg text-sm transition-colors"
                        >
                            <Plus className="w-4 h-4" /> Add
                        </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {accounts.map(acc => (
                            <div key={acc.id} className="relative overflow-hidden p-5 rounded-xl border border-white/5 group">
                                <div className={`absolute inset-0 bg-gradient-to-br ${acc.color} opacity-10 group-hover:opacity-20 transition-opacity`}></div>
                                <div className="relative z-10 flex justify-between items-start">
                                    <div className="flex items-center gap-3 mb-3">
                                        <div className="p-2 bg-white/10 rounded-full backdrop-blur-sm">
                                            <CreditCard className="w-4 h-4 text-white" />
                                        </div>
                                        <div>
                                            <p className="font-semibold text-white">{acc.name}</p>
                                            <p className="text-xs text-gray-400">{acc.type}</p>
                                        </div>
                                    </div>
                                    
                                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button 
                                            onClick={() => setEditingAccount(acc)}
                                            className="p-1.5 hover:bg-white/20 text-gray-300 hover:text-white rounded-lg transition-colors bg-black/20 backdrop-blur-sm"
                                            title="Edit"
                                        >
                                            <Pencil className="w-3.5 h-3.5" />
                                        </button>
                                        <button 
                                            onClick={() => handleDeleteAccount(acc.id)}
                                            className="p-1.5 hover:bg-white/20 text-gray-300 hover:text-red-400 rounded-lg transition-colors bg-black/20 backdrop-blur-sm"
                                            title="Delete"
                                        >
                                            <Trash2 className="w-3.5 h-3.5" />
                                        </button>
                                    </div>
                                </div>
                                <div className="relative z-10">
                                     <p className="text-2xl font-bold text-white tracking-tight">₹{acc.balance.toLocaleString('en-IN')}</p>
                                </div>
                            </div>
                        ))}
                         <button 
                            onClick={() => setShowAddAccount(true)}
                            className="border border-dashed border-white/10 hover:border-white/30 rounded-xl p-5 flex flex-col items-center justify-center gap-2 text-gray-500 hover:text-gray-300 transition-colors h-full min-h-[120px]"
                        >
                            <Plus className="w-6 h-6" />
                            <span className="text-sm">Connect New</span>
                        </button>
                    </div>
                </div>

                {/* Budget Management Card */}
                <div className="glass-card p-6 rounded-2xl">
                    <div className="flex flex-col md:flex-row md:items-center justify-between mb-4 gap-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-purple-500/20 rounded-lg text-purple-400">
                                <Target className="w-5 h-5" />
                            </div>
                            <div>
                                <h3 className="text-xl font-medium">Total Budget Goals</h3>
                                <p className="text-xs text-gray-400">Manage your spending limits</p>
                            </div>
                        </div>
                        
                        <div className="flex bg-white/5 p-1 rounded-lg">
                             <button 
                                onClick={() => handleBudgetModeChange('smart')}
                                className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm transition-all ${budgetMode === 'smart' ? 'bg-purple-600 text-white shadow-lg' : 'text-gray-400 hover:text-white'}`}
                             >
                                <Cpu className="w-4 h-4" /> Smart (Income)
                             </button>
                             <button 
                                onClick={() => handleBudgetModeChange('custom')}
                                className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm transition-all ${budgetMode === 'custom' ? 'bg-purple-600 text-white shadow-lg' : 'text-gray-400 hover:text-white'}`}
                             >
                                <Settings className="w-4 h-4" /> Custom Limit
                             </button>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div className="flex justify-between items-end">
                             <div>
                                <p className="text-sm text-gray-400 mb-1">
                                    {budgetMode === 'smart' ? 'Budget based on Total Income' : 'Your Custom Budget Limit'}
                                </p>
                                <div className="flex items-center gap-2">
                                    <span className="text-2xl font-bold">
                                        ₹{effectiveLimit.toFixed(2)}
                                    </span>
                                    {budgetMode === 'custom' && (
                                        <input 
                                            type="number" 
                                            value={customLimit} 
                                            onChange={(e) => handleCustomLimitChange(e.target.value)}
                                            className="bg-transparent border-b border-gray-600 w-32 text-sm focus:outline-none focus:border-purple-500 text-gray-300 ml-2"
                                            placeholder="Set limit"
                                        />
                                    )}
                                </div>
                             </div>
                             <div className="text-right">
                                <p className="text-sm text-gray-400">Spent so far</p>
                                <p className={`text-xl font-bold ${isOverBudget ? 'text-red-400' : 'text-white'}`}>
                                    ₹{totalExpense.toFixed(2)}
                                </p>
                             </div>
                        </div>

                        {/* Progress Bar */}
                        <div className="relative w-full h-3 bg-white/10 rounded-full overflow-hidden">
                            <div 
                                className={`absolute top-0 left-0 h-full rounded-full transition-all duration-500 ${isOverBudget ? 'bg-red-500' : 'bg-gradient-to-r from-blue-500 to-purple-500'}`}
                                style={{ width: `${budgetUsagePercent}%` }}
                            ></div>
                        </div>
                        <div className="flex justify-between text-xs text-gray-500">
                            <span>0%</span>
                            <span>{budgetUsagePercent.toFixed(1)}% Used</span>
                        </div>
                    </div>
                </div>

                {/* Input Form */}
                <div className="glass-card p-6 rounded-2xl">
                    <h3 className="text-xl font-medium mb-4">Add Transaction</h3>
                    <form onSubmit={handleAddTransaction} className="flex flex-col md:flex-row gap-4 flex-wrap">
                        <input
                            type="date"
                            value={date}
                            onChange={(e) => setDate(e.target.value)}
                            className="w-full md:w-auto bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-purple-500 transition-colors text-white scheme-dark"
                        />
                        <input 
                            type="text" 
                            placeholder="Description" 
                            value={desc}
                            onChange={(e) => setDesc(e.target.value)}
                            className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-purple-500 transition-colors"
                        />
                        <input 
                            type="number" 
                            placeholder="Amount" 
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            className="w-full md:w-32 bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-purple-500 transition-colors"
                        />
                        
                        {/* Dynamic Category Selector with Edit Button */}
                        <div className="flex items-center gap-2">
                            <select 
                                value={cat}
                                onChange={(e) => setCat(e.target.value)}
                                className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-purple-500 transition-colors w-32 md:w-auto"
                            >
                                {categories.map((c) => (
                                    <option key={c} value={c} className="bg-[#121215]">{c}</option>
                                ))}
                            </select>
                            <button 
                                type="button"
                                onClick={() => setShowCategoryManager(true)}
                                className="p-3 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-colors text-gray-400 hover:text-white"
                                title="Manage Categories"
                            >
                                <ListFilter className="w-5 h-5" />
                            </button>
                        </div>

                        <select 
                            value={type}
                            onChange={(e) => setType(e.target.value as any)}
                            className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-purple-500 transition-colors"
                        >
                            <option value="expense" className="bg-[#121215]">Expense</option>
                            <option value="income" className="bg-[#121215]">Income</option>
                        </select>
                        <button type="submit" className="p-3 bg-white text-black rounded-xl hover:bg-gray-200 transition-colors">
                            <Plus className="w-6 h-6" />
                        </button>
                    </form>
                </div>

                {/* Recent Transactions */}
                <div className="glass-card p-6 rounded-2xl">
                    <h3 className="text-xl font-medium mb-4">Recent Transactions</h3>
                    <div className="space-y-3">
                        {transactions.map((t) => (
                            <div key={t.id} className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/5 hover:border-white/10 transition-colors group">
                                <div className="flex items-center gap-4">
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${t.type === 'income' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                                        {t.type === 'income' ? <TrendingUp className="w-5 h-5" /> : <TrendingDown className="w-5 h-5" />}
                                    </div>
                                    <div>
                                        <p className="font-medium">{t.description}</p>
                                        <div className="flex items-center gap-2 text-xs text-gray-500 mt-1">
                                            <Calendar className="w-3 h-3" />
                                            <span>{formatDate(t.date)}</span>
                                            <span className="w-1 h-1 rounded-full bg-gray-600"></span>
                                            <span>{t.category}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4">
                                     {/* Budget Warnings */}
                                     {t.type === 'expense' && (
                                        <div className="flex flex-col items-end gap-1">
                                            {isOverBudget && (
                                                <span className="text-[10px] text-red-400 flex items-center gap-1 bg-red-400/10 px-1.5 py-0.5 rounded border border-red-500/20">
                                                    <AlertTriangle className="w-3 h-3" /> Total Over
                                                </span>
                                            )}
                                            {categoryStatus[t.category] && (
                                                 <span className="text-[10px] text-orange-400 flex items-center gap-1 bg-orange-400/10 px-1.5 py-0.5 rounded border border-orange-500/20">
                                                    <AlertTriangle className="w-3 h-3" /> Cat. Over
                                                </span>
                                            )}
                                        </div>
                                     )}

                                     <p className={`font-bold ${t.type === 'income' ? 'text-green-400' : 'text-white'}`}>
                                        {t.type === 'income' ? '+' : '-'}₹{t.amount.toFixed(2)}
                                    </p>
                                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all">
                                        <button 
                                            onClick={() => setEditingTransaction(t)}
                                            className="p-2 text-gray-500 hover:text-blue-400 transition-all"
                                            title="Edit"
                                        >
                                            <Pencil className="w-4 h-4" />
                                        </button>
                                        <button 
                                            onClick={() => handleDelete(t.id)}
                                            className="p-2 text-gray-500 hover:text-red-400 transition-all"
                                            title="Delete"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                        {transactions.length === 0 && <p className="text-gray-500 text-center py-4">No transactions yet.</p>}
                    </div>
                </div>
            </div>
        </div>
        
        {/* Over Budget Popup Modal */}
        {showBudgetAlert && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
                <div className="bg-[#121215] border border-red-500/30 rounded-2xl p-6 max-w-sm w-full shadow-2xl relative animate-in zoom-in-95 duration-200">
                    <button 
                        onClick={() => setShowBudgetAlert(false)}
                        className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                    
                    <div className="flex flex-col items-center text-center">
                        <div className="w-14 h-14 bg-red-500/10 rounded-full flex items-center justify-center mb-4 text-red-500 ring-1 ring-red-500/40">
                            <AlertTriangle className="w-7 h-7" />
                        </div>
                        
                        <h3 className="text-xl font-bold text-white mb-2">Spending Limit Exceeded</h3>
                        <p className="text-gray-400 text-sm mb-6 leading-relaxed">
                            Your recent transaction has pushed your total spending over your defined budget limit.
                        </p>
                        
                        <button 
                             onClick={() => setShowBudgetAlert(false)}
                             className="w-full py-3 bg-red-600 hover:bg-red-700 rounded-xl text-white font-medium transition-all shadow-lg shadow-red-900/20"
                        >
                            I Understand
                        </button>
                    </div>
                </div>
            </div>
        )}

        {/* Category Budget Alert Popup */}
        {overBudgetCategory && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
                <div className="bg-[#121215] border border-orange-500/30 rounded-2xl p-6 max-w-sm w-full shadow-2xl relative animate-in zoom-in-95 duration-200">
                    <button 
                        onClick={() => setOverBudgetCategory(null)}
                        className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                    
                    <div className="flex flex-col items-center text-center">
                        <div className="w-14 h-14 bg-orange-500/10 rounded-full flex items-center justify-center mb-4 text-orange-500 ring-1 ring-orange-500/40">
                            <AlertTriangle className="w-7 h-7" />
                        </div>
                        
                        <h3 className="text-xl font-bold text-white mb-2">Category Limit Exceeded</h3>
                        <p className="text-gray-400 text-sm mb-6 leading-relaxed">
                            You've exceeded your budget for <span className="text-white font-bold">{overBudgetCategory}</span>.
                        </p>
                        
                        <button 
                                onClick={() => setOverBudgetCategory(null)}
                                className="w-full py-3 bg-orange-600 hover:bg-orange-700 rounded-xl text-white font-medium transition-all shadow-lg shadow-orange-900/20"
                        >
                            Acknowledge
                        </button>
                    </div>
                </div>
            </div>
        )}

        {/* Add Account Modal */}
        {showAddAccount && (
             <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
                 <div className="bg-[#121215] border border-white/10 rounded-2xl p-6 max-w-md w-full shadow-2xl relative animate-in zoom-in-95 duration-200">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-xl font-medium text-white flex items-center gap-2">
                             Add Bank Account
                        </h3>
                        <button 
                            onClick={() => setShowAddAccount(false)}
                            className="p-1 hover:text-white text-gray-400 transition-colors"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    <form onSubmit={handleAddAccount} className="space-y-4">
                        <div>
                            <label className="block text-xs text-gray-400 mb-1">Account Name</label>
                            <input 
                                type="text" 
                                placeholder="e.g. HDFC Savings" 
                                value={newAccountName}
                                onChange={(e) => setNewAccountName(e.target.value)}
                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-purple-500 transition-colors"
                            />
                        </div>

                        <div>
                            <label className="block text-xs text-gray-400 mb-1">Account Type</label>
                            <select 
                                value={newAccountType}
                                onChange={(e) => setNewAccountType(e.target.value)}
                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-purple-500 transition-colors"
                            >
                                <option value="Savings" className="bg-[#121215]">Savings</option>
                                <option value="Current" className="bg-[#121215]">Current</option>
                                <option value="Credit Card" className="bg-[#121215]">Credit Card</option>
                                <option value="Cash" className="bg-[#121215]">Cash</option>
                                <option value="Investment" className="bg-[#121215]">Investment</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-xs text-gray-400 mb-1">Initial Balance</label>
                            <input 
                                type="number" 
                                placeholder="0.00" 
                                value={newAccountBalance}
                                onChange={(e) => setNewAccountBalance(e.target.value)}
                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-purple-500 transition-colors"
                            />
                        </div>

                        <button 
                            type="submit" 
                            disabled={!newAccountName || !newAccountBalance}
                            className="w-full py-3 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl text-white font-medium transition-all flex items-center justify-center gap-2 mt-4"
                        >
                            <Plus className="w-5 h-5" /> Add Account
                        </button>
                    </form>
                 </div>
             </div>
        )}

        {/* Edit Account Modal */}
        {editingAccount && (
             <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
                 <div className="bg-[#121215] border border-white/10 rounded-2xl p-6 max-w-md w-full shadow-2xl relative animate-in zoom-in-95 duration-200">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-xl font-medium text-white flex items-center gap-2">
                             Edit Account
                        </h3>
                        <button 
                            onClick={() => setEditingAccount(null)}
                            className="p-1 hover:text-white text-gray-400 transition-colors"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    <form onSubmit={handleUpdateAccount} className="space-y-4">
                        <div>
                            <label className="block text-xs text-gray-400 mb-1">Account Name</label>
                            <input 
                                type="text" 
                                placeholder="e.g. HDFC Savings" 
                                value={editingAccount.name}
                                onChange={(e) => setEditingAccount({...editingAccount, name: e.target.value})}
                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-purple-500 transition-colors"
                            />
                        </div>

                        <div>
                            <label className="block text-xs text-gray-400 mb-1">Account Type</label>
                            <select 
                                value={editingAccount.type}
                                onChange={(e) => setEditingAccount({...editingAccount, type: e.target.value})}
                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-purple-500 transition-colors"
                            >
                                <option value="Savings" className="bg-[#121215]">Savings</option>
                                <option value="Current" className="bg-[#121215]">Current</option>
                                <option value="Credit Card" className="bg-[#121215]">Credit Card</option>
                                <option value="Cash" className="bg-[#121215]">Cash</option>
                                <option value="Investment" className="bg-[#121215]">Investment</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-xs text-gray-400 mb-1">Balance</label>
                            <input 
                                type="number" 
                                placeholder="0.00" 
                                value={editingAccount.balance}
                                onChange={(e) => setEditingAccount({...editingAccount, balance: parseFloat(e.target.value) || 0})}
                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-purple-500 transition-colors"
                            />
                        </div>

                        <button 
                            type="submit" 
                            className="w-full py-3 bg-purple-600 hover:bg-purple-700 rounded-xl text-white font-medium transition-all flex items-center justify-center gap-2 mt-4"
                        >
                            <Save className="w-5 h-5" /> Save Changes
                        </button>
                    </form>
                 </div>
             </div>
        )}

        {/* Edit Transaction Modal */}
        {editingTransaction && (
             <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
                 <div className="bg-[#121215] border border-white/10 rounded-2xl p-6 max-w-md w-full shadow-2xl relative animate-in zoom-in-95 duration-200">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-xl font-medium text-white flex items-center gap-2">
                             Edit Transaction
                        </h3>
                        <button 
                            onClick={() => setEditingTransaction(null)}
                            className="p-1 hover:text-white text-gray-400 transition-colors"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    <form onSubmit={handleUpdateTransaction} className="space-y-4">
                        <div>
                            <label className="block text-xs text-gray-400 mb-1">Date</label>
                            <input
                                type="date"
                                value={editingTransaction.date}
                                onChange={(e) => setEditingTransaction({...editingTransaction, date: e.target.value})}
                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-purple-500 text-white scheme-dark"
                            />
                        </div>

                        <div>
                            <label className="block text-xs text-gray-400 mb-1">Description</label>
                            <input 
                                type="text" 
                                placeholder="Description" 
                                value={editingTransaction.description}
                                onChange={(e) => setEditingTransaction({...editingTransaction, description: e.target.value})}
                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-purple-500 transition-colors"
                            />
                        </div>

                        <div>
                            <label className="block text-xs text-gray-400 mb-1">Amount</label>
                            <input 
                                type="number" 
                                placeholder="Amount" 
                                value={editingTransaction.amount}
                                onChange={(e) => setEditingTransaction({...editingTransaction, amount: parseFloat(e.target.value) || 0})}
                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-purple-500 transition-colors"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs text-gray-400 mb-1">Category</label>
                                <select 
                                    value={editingTransaction.category}
                                    onChange={(e) => setEditingTransaction({...editingTransaction, category: e.target.value})}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-purple-500 transition-colors"
                                >
                                    {categories.map((c) => (
                                        <option key={c} value={c} className="bg-[#121215]">{c}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs text-gray-400 mb-1">Type</label>
                                <select 
                                    value={editingTransaction.type}
                                    onChange={(e) => setEditingTransaction({...editingTransaction, type: e.target.value as any})}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-purple-500 transition-colors"
                                >
                                    <option value="expense" className="bg-[#121215]">Expense</option>
                                    <option value="income" className="bg-[#121215]">Income</option>
                                </select>
                            </div>
                        </div>

                        <button 
                            type="submit" 
                            className="w-full py-3 bg-purple-600 hover:bg-purple-700 rounded-xl text-white font-medium transition-all flex items-center justify-center gap-2 mt-2"
                        >
                            <Save className="w-5 h-5" /> Save Changes
                        </button>
                    </form>
                 </div>
             </div>
        )}

        {/* Category Manager Modal */}
        {showCategoryManager && (
             <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
                 <div className="bg-[#121215] border border-white/10 rounded-2xl p-6 max-w-md w-full shadow-2xl relative animate-in zoom-in-95 duration-200 max-h-[80vh] flex flex-col">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-xl font-medium text-white flex items-center gap-2">
                            <ListFilter className="w-5 h-5" /> Manage Categories
                        </h3>
                        <button 
                            onClick={() => setShowCategoryManager(false)}
                            className="p-1 hover:text-white text-gray-400 transition-colors"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    <div className="flex-1 overflow-y-auto space-y-2 mb-6 pr-2 custom-scrollbar">
                        {categories.map((c, index) => (
                            <div key={index} className="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-white/5 group">
                                {editingCategory?.index === index ? (
                                    <div className="flex items-center flex-1 gap-2">
                                        <input 
                                            type="text" 
                                            value={editingCategory.text}
                                            onChange={(e) => setEditingCategory({...editingCategory, text: e.target.value})}
                                            className="flex-1 bg-black border border-white/20 rounded px-2 py-1 text-sm focus:outline-none focus:border-purple-500"
                                            autoFocus
                                        />
                                        <button 
                                            onClick={saveEditedCategory}
                                            className="p-1.5 bg-green-500/20 text-green-400 rounded hover:bg-green-500/30 transition-colors"
                                        >
                                            <Check className="w-4 h-4" />
                                        </button>
                                        <button 
                                            onClick={() => setEditingCategory(null)}
                                            className="p-1.5 hover:bg-white/10 rounded transition-colors text-gray-400"
                                        >
                                            <X className="w-4 h-4" />
                                        </button>
                                    </div>
                                ) : (
                                    <>
                                        <span className="text-gray-200">{c}</span>
                                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button 
                                                onClick={() => startEditingCategory(index)}
                                                className="p-1.5 hover:bg-white/10 text-gray-400 hover:text-blue-400 rounded transition-colors"
                                            >
                                                <Pencil className="w-4 h-4" />
                                            </button>
                                            <button 
                                                onClick={() => handleDeleteCategory(index)}
                                                className="p-1.5 hover:bg-white/10 text-gray-400 hover:text-red-400 rounded transition-colors"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </>
                                )}
                            </div>
                        ))}
                    </div>

                    <div className="flex gap-2 border-t border-white/10 pt-4">
                        <input 
                            type="text" 
                            placeholder="New category name"
                            value={newCategoryName}
                            onChange={(e) => setNewCategoryName(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleAddCategory()}
                            className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2 focus:outline-none focus:border-purple-500 transition-colors"
                        />
                        <button 
                            onClick={handleAddCategory}
                            disabled={!newCategoryName.trim()}
                            className="p-2 bg-purple-600 text-white rounded-xl hover:bg-purple-700 disabled:opacity-50 transition-colors"
                        >
                            <Plus className="w-6 h-6" />
                        </button>
                    </div>
                 </div>
             </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;