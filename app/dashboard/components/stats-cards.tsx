import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Wallet, Package, TrendingUp, TrendingDown, DollarSign, AlertCircle } from "lucide-react"

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

interface StatsCardsProps {
  stats: DashboardStats
  loading: boolean
}

export function StatsCards({ stats, loading }: StatsCardsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <Card className="border-none shadow-sm hover:shadow-md transition-all bg-white">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-xs font-light text-gray-500 uppercase tracking-wider">Balance</CardTitle>
          <div className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center">
            <Wallet className="h-4 w-4 text-gray-700" />
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-3xl font-light text-gray-900">
            ${loading ? '...' : stats.balance.toFixed(2)}
          </p>
          <p className="text-xs text-gray-400 mt-1 font-light">Current balance</p>
        </CardContent>
      </Card>

      <Card className="border-none shadow-sm hover:shadow-md transition-all bg-white">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-xs font-light text-gray-500 uppercase tracking-wider">Stock Value</CardTitle>
          <div className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center">
            <Package className="h-4 w-4 text-gray-700" />
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-3xl font-light text-gray-900">
            ${loading ? '...' : stats.totalStockValue.toFixed(2)}
          </p>
          <p className="text-xs text-gray-400 mt-1 font-light">Potential profit: ${loading ? '...' : stats.potentialProfit.toFixed(2)}</p>
        </CardContent>
      </Card>

      <Card className="border-none shadow-sm hover:shadow-md transition-all bg-white">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-xs font-light text-gray-500 uppercase tracking-wider">Debts</CardTitle>
          <div className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center">
            <AlertCircle className="h-4 w-4 text-gray-700" />
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-3xl font-light text-gray-900">
            ${loading ? '...' : stats.totalDebtToMeRemaining.toFixed(2)}
          </p>
          <p className="text-xs text-gray-400 mt-1 font-light">Owed to you</p>
        </CardContent>
      </Card>

      <Card className="border-none shadow-sm hover:shadow-md transition-all bg-white">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-xs font-light text-gray-500 uppercase tracking-wider">Pending</CardTitle>
          <div className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center">
            <DollarSign className="h-4 w-4 text-gray-700" />
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-3xl font-light text-gray-900">
            ${loading ? '...' : stats.totalDebtToOthersRemaining.toFixed(2)}
          </p>
          <p className="text-xs text-gray-400 mt-1 font-light">You owe</p>
        </CardContent>
      </Card>
    </div>
  )
}