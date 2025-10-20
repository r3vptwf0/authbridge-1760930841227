"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useRouter } from "next/navigation"
import { getSupabaseClient } from "@/lib/supabase"
import { Wallet, Package, TrendingUp, TrendingDown, DollarSign, ArrowRight, AlertCircle } from "lucide-react"

interface DashboardStats {
  totalIncome: number
  totalExpenses: number
  balance: number
  totalProducts: number
  totalStockValue: number
  totalStockCost: number
  potentialProfit: number
  totalDebt: number
  totalDebtPaid: number
  totalDebtRemaining: number
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
    totalDebt: 0,
    totalDebtPaid: 0,
    totalDebtRemaining: 0,
    pendingDebts: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    try {
      const supabase = getSupabaseClient()
      
      const [incomesResult, expensesResult, productsResult, debtsResult] = await Promise.all([
        supabase.from('incomes').select('amount'),
        supabase.from('expenses').select('amount'),
        supabase.from('products').select('stock_grams, cost_per_gram, price_per_gram'),
        supabase.from('debts').select('amount, amount_paid, status')
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
      const totalDebt = debts.reduce((sum, d) => sum + d.amount, 0)
      const totalDebtPaid = debts.reduce((sum, d) => sum + d.amount_paid, 0)
      const totalDebtRemaining = totalDebt - totalDebtPaid
      const pendingDebts = debts.filter(d => d.status === 'pending').length

      setStats({
        totalIncome,
        totalExpenses,
        balance,
        totalProducts,
        totalStockValue,
        totalStockCost,
        potentialProfit,
        totalDebt,
        totalDebtPaid,
        totalDebtRemaining,
        pendingDebts,
      })
      setLoading(false)
    } catch (error) {
      console.error('Error loading dashboard data:', error)
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <div>
          <h1 className="text-4xl font-bold">Dashboard</h1>
          <p className="text-gray-600 mt-2">Overview of your finances and inventory</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Income</CardTitle>
              <TrendingUp className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                ${loading ? '...' : stats.totalIncome.toFixed(2)}
              </div>
              <p className="text-xs text-muted-foreground mt-1">From all sources</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
              <TrendingDown className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">
                ${loading ? '...' : stats.totalExpenses.toFixed(2)}
              </div>
              <p className="text-xs text-muted-foreground mt-1">All spending</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Balance</CardTitle>
              <DollarSign className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${stats.balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                ${loading ? '...' : stats.balance.toFixed(2)}
              </div>
              <p className="text-xs text-muted-foreground mt-1">Current balance</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Products</CardTitle>
              <Package className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600">
                {loading ? '...' : stats.totalProducts}
              </div>
              <p className="text-xs text-muted-foreground mt-1">In inventory</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Stock Value</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                ${loading ? '...' : stats.totalStockValue.toFixed(2)}
              </div>
              <p className="text-xs text-muted-foreground mt-1">Potential sales value</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Stock Cost</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">
                ${loading ? '...' : stats.totalStockCost.toFixed(2)}
              </div>
              <p className="text-xs text-muted-foreground mt-1">Investment in stock</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Potential Profit</CardTitle>
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${stats.potentialProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                ${loading ? '...' : stats.potentialProfit.toFixed(2)}
              </div>
              <p className="text-xs text-muted-foreground mt-1">If all stock sold</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Debt</CardTitle>
              <AlertCircle className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">
                ${loading ? '...' : stats.totalDebt.toFixed(2)}
              </div>
              <p className="text-xs text-muted-foreground mt-1">Money you owe</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Debt Remaining</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">
                ${loading ? '...' : stats.totalDebtRemaining.toFixed(2)}
              </div>
              <p className="text-xs text-muted-foreground mt-1">Still to pay</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Debts</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                {loading ? '...' : stats.pendingDebts}
              </div>
              <p className="text-xs text-muted-foreground mt-1">Active debts</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => router.push('/wallet')}>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                Wallet
                <ArrowRight className="h-5 w-5" />
              </CardTitle>
              <CardDescription>Manage your income and expenses</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Income:</span>
                  <span className="font-semibold text-green-600">${stats.totalIncome.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Expenses:</span>
                  <span className="font-semibold text-red-600">${stats.totalExpenses.toFixed(2)}</span>
                </div>
                <div className="flex justify-between border-t pt-2">
                  <span className="text-sm font-medium">Balance:</span>
                  <span className={`font-bold ${stats.balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    ${stats.balance.toFixed(2)}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => router.push('/stock')}>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                Stock Management
                <ArrowRight className="h-5 w-5" />
              </CardTitle>
              <CardDescription>Track your inventory and profits</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Products:</span>
                  <span className="font-semibold text-purple-600">{stats.totalProducts}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Stock Value:</span>
                  <span className="font-semibold text-blue-600">${stats.totalStockValue.toFixed(2)}</span>
                </div>
                <div className="flex justify-between border-t pt-2">
                  <span className="text-sm font-medium">Potential Profit:</span>
                  <span className={`font-bold ${stats.potentialProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    ${stats.potentialProfit.toFixed(2)}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => router.push('/debts')}>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                Debt Management
                <ArrowRight className="h-5 w-5" />
              </CardTitle>
              <CardDescription>Track and pay your debts</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Total Debt:</span>
                  <span className="font-semibold text-red-600">${stats.totalDebt.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Paid:</span>
                  <span className="font-semibold text-green-600">${stats.totalDebtPaid.toFixed(2)}</span>
                </div>
                <div className="flex justify-between border-t pt-2">
                  <span className="text-sm font-medium">Remaining:</span>
                  <span className="font-bold text-orange-600">
                    ${stats.totalDebtRemaining.toFixed(2)}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
