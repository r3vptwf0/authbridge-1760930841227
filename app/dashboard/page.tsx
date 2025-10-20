"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useRouter } from "next/navigation"
import { getSupabaseClient } from "@/lib/supabase"
import { Wallet, Package, TrendingUp, TrendingDown, DollarSign, ArrowRight, AlertCircle, LogOut, Plus, Activity, Clock, Calendar } from "lucide-react"

interface DashboardStats {
  totalIncome: number
  totalExpenses: number
  balance: number
  totalProducts: number
  totalStockValue: number
  totalStockCost: number
  potentialProfit: number
  totalDebtToOthers: number
  totalDebtToOthersPaid: number
  totalDebtToOthersRemaining: number
  totalDebtToMe: number
  totalDebtToMePaid: number
  totalDebtToMeRemaining: number
  pendingDebts: number
}

export default function DashboardPage() {
  const router = useRouter()
  const [stats, setStats] = useState<DashboardStats>({
    totalIncome: 0,
    totalExpenses: 0,
    balance: 0,
    totalProducts: 0,
    totalStockValue: 0,
    totalStockCost: 0,
    potentialProfit: 0,
    totalDebtToOthers: 0,
    totalDebtToOthersPaid: 0,
    totalDebtToOthersRemaining: 0,
    totalDebtToMe: 0,
    totalDebtToMePaid: 0,
    totalDebtToMeRemaining: 0,
    pendingDebts: 0,
  })
  const [loading, setLoading] = useState(true)
  const [recentTransactions, setRecentTransactions] = useState<any[]>([])

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    try {
      const supabase = getSupabaseClient()
      
      const [incomesResult, expensesResult, productsResult, debtsResult, recentIncomesResult, recentExpensesResult] = await Promise.all([
        supabase.from('incomes').select('amount'),
        supabase.from('expenses').select('amount'),
        supabase.from('products').select('stock_grams, cost_per_gram, price_per_gram'),
        supabase.from('debts').select('amount, amount_paid, status, type'),
        supabase.from('incomes').select('*').order('created_at', { ascending: false }).limit(5),
        supabase.from('expenses').select('*').order('created_at', { ascending: false }).limit(5)
      ])

      const totalIncome = (incomesResult.data || []).reduce((sum, item) => sum + item.amount, 0)
      const totalExpenses = (expensesResult.data || []).reduce((sum, item) => sum + item.amount, 0)
      const balance = totalIncome - totalExpenses

      const products = productsResult.data || []
      const totalProducts = products.length
      const totalStockCost = products.reduce((sum, p) => sum + (p.stock_grams * p.cost_per_gram), 0)
      const totalStockValue = products.reduce((sum, p) => sum + (p.stock_grams * p.price_per_gram), 0)
      const potentialProfit = totalStockValue - totalStockCost

      const debts = debtsResult.data || []
      const debtsToOthers = debts.filter(d => d.type === 'to_others')
      const debtsToMe = debts.filter(d => d.type === 'to_me')
      
      const totalDebtToOthers = debtsToOthers.reduce((sum, d) => sum + d.amount, 0)
      const totalDebtToOthersPaid = debtsToOthers.reduce((sum, d) => sum + d.amount_paid, 0)
      const totalDebtToOthersRemaining = totalDebtToOthers - totalDebtToOthersPaid
      
      const totalDebtToMe = debtsToMe.reduce((sum, d) => sum + d.amount, 0)
      const totalDebtToMePaid = debtsToMe.reduce((sum, d) => sum + d.amount_paid, 0)
      const totalDebtToMeRemaining = totalDebtToMe - totalDebtToMePaid
      
      const pendingDebts = debts.filter(d => d.status === 'pending').length

      const recentIncomes = (recentIncomesResult.data || []).map(item => ({ ...item, type: 'income' }))
      const recentExpenses = (recentExpensesResult.data || []).map(item => ({ ...item, type: 'expense' }))
      const allRecent = [...recentIncomes, ...recentExpenses]
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        .slice(0, 8)

      setRecentTransactions(allRecent)
      setStats({
        totalIncome,
        totalExpenses,
        balance,
        totalProducts,
        totalStockValue,
        totalStockCost,
        potentialProfit,
        totalDebtToOthers,
        totalDebtToOthersPaid,
        totalDebtToOthersRemaining,
        totalDebtToMe,
        totalDebtToMePaid,
        totalDebtToMeRemaining,
        pendingDebts,
      })
      setLoading(false)
    } catch (error) {
      console.error('Error loading dashboard data:', error)
      setLoading(false)
    }
  }

  const handleLogout = () => {
    router.push('/login')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-gray-100 to-white p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="flex justify-between items-center pb-4 border-b border-gray-200">
          <div>
            <h1 className="text-4xl md:text-5xl font-light tracking-tight text-gray-900">Dashboard</h1>
            <p className="text-gray-500 mt-2 font-light">Overview of your finances and inventory</p>
          </div>
          <Button onClick={handleLogout} variant="outline" className="border-gray-300 hover:bg-gray-100">
            <LogOut className="mr-2 h-4 w-4" />
            Logout
          </Button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          <Button onClick={() => router.push('/wallet')} className="h-20 bg-white hover:bg-gray-50 text-gray-900 border border-gray-200 shadow-sm" variant="outline">
            <Plus className="mr-2 h-5 w-5" />
            <span className="font-light">Add Income</span>
          </Button>
          <Button onClick={() => router.push('/wallet')} className="h-20 bg-white hover:bg-gray-50 text-gray-900 border border-gray-200 shadow-sm" variant="outline">
            <TrendingDown className="mr-2 h-5 w-5" />
            <span className="font-light">Add Expense</span>
          </Button>
          <Button onClick={() => router.push('/stock')} className="h-20 bg-white hover:bg-gray-50 text-gray-900 border border-gray-200 shadow-sm" variant="outline">
            <Package className="mr-2 h-5 w-5" />
            <span className="font-light">Add Product</span>
          </Button>
          <Button onClick={() => router.push('/debts')} className="h-20 bg-white hover:bg-gray-50 text-gray-900 border border-gray-200 shadow-sm" variant="outline">
            <AlertCircle className="mr-2 h-5 w-5" />
            <span className="font-light">Add Debt</span>
          </Button>
          <Button onClick={() => router.push('/work-hours')} className="h-20 bg-white hover:bg-gray-50 text-gray-900 border border-gray-200 shadow-sm" variant="outline">
            <Clock className="mr-2 h-5 w-5" />
            <span className="font-light">Work Hours</span>
          </Button>
          <Button onClick={() => router.push('/calendar')} className="h-20 bg-white hover:bg-gray-50 text-gray-900 border border-gray-200 shadow-sm" variant="outline">
            <Calendar className="mr-2 h-5 w-5" />
            <span className="font-light">Calendar</span>
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="border-none shadow-sm bg-white hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs font-light text-gray-500 uppercase tracking-wider">Total Income</CardTitle>
              <div className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center">
                <TrendingUp className="h-4 w-4 text-gray-700" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-light text-gray-900">
                ${loading ? '...' : stats.totalIncome.toFixed(2)}
              </div>
              <p className="text-xs text-gray-400 mt-1 font-light">From all sources</p>
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm bg-white hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs font-light text-gray-500 uppercase tracking-wider">Total Expenses</CardTitle>
              <div className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center">
                <TrendingDown className="h-4 w-4 text-gray-700" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-light text-gray-900">
                ${loading ? '...' : stats.totalExpenses.toFixed(2)}
              </div>
              <p className="text-xs text-gray-400 mt-1 font-light">All spending</p>
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm bg-white hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs font-light text-gray-500 uppercase tracking-wider">Balance</CardTitle>
              <div className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center">
                <DollarSign className="h-4 w-4 text-gray-700" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-light text-gray-900">
                ${loading ? '...' : stats.balance.toFixed(2)}
              </div>
              <p className="text-xs text-gray-400 mt-1 font-light">Current balance</p>
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm bg-white hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs font-light text-gray-500 uppercase tracking-wider">Products</CardTitle>
              <div className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center">
                <Package className="h-4 w-4 text-gray-700" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-light text-gray-900">
                {loading ? '...' : stats.totalProducts}
              </div>
              <p className="text-xs text-gray-400 mt-1 font-light">In inventory</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="border-none shadow-sm bg-white hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs font-light text-gray-500 uppercase tracking-wider">Stock Value</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-light text-gray-900">
                ${loading ? '...' : stats.totalStockValue.toFixed(2)}
              </div>
              <p className="text-xs text-gray-400 mt-1 font-light">Potential sales value</p>
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm bg-white hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs font-light text-gray-500 uppercase tracking-wider">Stock Cost</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-light text-gray-900">
                ${loading ? '...' : stats.totalStockCost.toFixed(2)}
              </div>
              <p className="text-xs text-gray-400 mt-1 font-light">Investment in stock</p>
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm bg-white hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs font-light text-gray-500 uppercase tracking-wider">Potential Profit</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-light text-gray-900">
                ${loading ? '...' : stats.potentialProfit.toFixed(2)}
              </div>
              <p className="text-xs text-gray-400 mt-1 font-light">If all stock sold</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="border-none shadow-sm bg-white hover:shadow-md transition-shadow border-l-2 border-l-gray-900">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="font-light">I Owe (Debts to Others)</span>
                <TrendingDown className="h-5 w-5 text-gray-700" />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500 font-light">Total:</span>
                  <span className="font-light text-gray-900">${loading ? '...' : stats.totalDebtToOthers.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500 font-light">Paid:</span>
                  <span className="font-light text-gray-600">${loading ? '...' : stats.totalDebtToOthersPaid.toFixed(2)}</span>
                </div>
                <div className="flex justify-between border-t pt-2">
                  <span className="text-sm font-light">Remaining:</span>
                  <span className="font-medium text-gray-900">
                    ${loading ? '...' : stats.totalDebtToOthersRemaining.toFixed(2)}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm bg-white hover:shadow-md transition-shadow border-l-2 border-l-gray-400">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="font-light">They Owe Me</span>
                <TrendingUp className="h-5 w-5 text-gray-700" />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500 font-light">Total:</span>
                  <span className="font-light text-gray-900">${loading ? '...' : stats.totalDebtToMe.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500 font-light">Received:</span>
                  <span className="font-light text-gray-600">${loading ? '...' : stats.totalDebtToMePaid.toFixed(2)}</span>
                </div>
                <div className="flex justify-between border-t pt-2">
                  <span className="text-sm font-light">Remaining:</span>
                  <span className="font-medium text-gray-900">
                    ${loading ? '...' : stats.totalDebtToMeRemaining.toFixed(2)}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="cursor-pointer border-none shadow-sm bg-white hover:shadow-md transition-all" onClick={() => router.push('/wallet')}>
            <CardHeader>
              <CardTitle className="flex items-center justify-between font-light text-gray-900">
                Wallet
                <ArrowRight className="h-5 w-5" />
              </CardTitle>
              <CardDescription className="font-light">Manage your income and expenses</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500 font-light">Income:</span>
                  <span className="font-light text-gray-900">${stats.totalIncome.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500 font-light">Expenses:</span>
                  <span className="font-light text-gray-900">${stats.totalExpenses.toFixed(2)}</span>
                </div>
                <div className="flex justify-between border-t pt-2">
                  <span className="text-sm font-light">Balance:</span>
                  <span className="font-medium text-gray-900">
                    ${stats.balance.toFixed(2)}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="cursor-pointer border-none shadow-sm bg-white hover:shadow-md transition-all" onClick={() => router.push('/stock')}>
            <CardHeader>
              <CardTitle className="flex items-center justify-between font-light text-gray-900">
                Stock Management
                <ArrowRight className="h-5 w-5" />
              </CardTitle>
              <CardDescription className="font-light">Track your inventory and profits</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500 font-light">Products:</span>
                  <span className="font-light text-gray-900">{stats.totalProducts}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500 font-light">Stock Value:</span>
                  <span className="font-light text-gray-900">${stats.totalStockValue.toFixed(2)}</span>
                </div>
                <div className="flex justify-between border-t pt-2">
                  <span className="text-sm font-light">Potential Profit:</span>
                  <span className="font-medium text-gray-900">
                    ${stats.potentialProfit.toFixed(2)}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="cursor-pointer border-none shadow-sm bg-white hover:shadow-md transition-all" onClick={() => router.push('/debts')}>
            <CardHeader>
              <CardTitle className="flex items-center justify-between font-light text-gray-900">
                Debt Management
                <ArrowRight className="h-5 w-5" />
              </CardTitle>
              <CardDescription className="font-light">Track debts to/from others</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500 font-light">I Owe:</span>
                  <span className="font-light text-gray-900">${stats.totalDebtToOthersRemaining.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500 font-light">They Owe Me:</span>
                  <span className="font-light text-gray-900">${stats.totalDebtToMeRemaining.toFixed(2)}</span>
                </div>
                <div className="flex justify-between border-t pt-2">
                  <span className="text-sm font-light">Net Position:</span>
                  <span className="font-medium text-gray-900">
                    ${(stats.totalDebtToMeRemaining - stats.totalDebtToOthersRemaining).toFixed(2)}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="border-none shadow-sm bg-white">
          <CardHeader>
            <CardTitle className="flex items-center font-light text-gray-900">
              <Activity className="mr-2 h-5 w-5" />
              Recent Activity
            </CardTitle>
            <CardDescription className="font-light">Your latest transactions</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8 text-gray-400 font-light">Loading...</div>
            ) : recentTransactions.length === 0 ? (
              <div className="text-center py-8 text-gray-400 font-light">No recent transactions</div>
            ) : (
              <div className="space-y-2">
                {recentTransactions.map((transaction) => (
                  <div 
                    key={transaction.id} 
                    className="flex items-center justify-between p-4 border border-gray-100 rounded-lg hover:border-gray-200 transition-all"
                  >
                    <div className="flex items-center gap-3">
                      {transaction.type === 'income' ? (
                        <div className="p-2 bg-gray-100 rounded-full">
                          <TrendingUp className="h-4 w-4 text-gray-700" />
                        </div>
                      ) : (
                        <div className="p-2 bg-gray-100 rounded-full">
                          <TrendingDown className="h-4 w-4 text-gray-700" />
                        </div>
                      )}
                      <div>
                        <p className="font-light text-gray-900">{transaction.description}</p>
                        <p className="text-sm text-gray-400 font-light">{transaction.category}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-light text-gray-900">
                        {transaction.type === 'income' ? '+' : '-'}${transaction.amount.toFixed(2)}
                      </p>
                      <p className="text-xs text-gray-400 font-light">
                        {new Date(transaction.date || transaction.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
