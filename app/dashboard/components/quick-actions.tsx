import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useRouter } from "next/navigation"
import { Wallet, Package, AlertCircle, Clock, Calendar, Plus } from "lucide-react"

export function QuickActions() {
  const router = useRouter()

  const actions = [
    {
      title: "Add Income",
      description: "Record new income",
      icon: Wallet,
      action: () => router.push("/wallet"),
      color: "bg-green-100 text-green-600 hover:bg-green-200"
    },
    {
      title: "Add Expense",
      description: "Record new expense",
      icon: Wallet,
      action: () => router.push("/wallet"),
      color: "bg-red-100 text-red-600 hover:bg-red-200"
    },
    {
      title: "Add Product",
      description: "Add new stock item",
      icon: Package,
      action: () => router.push("/stock"),
      color: "bg-blue-100 text-blue-600 hover:bg-blue-200"
    },
    {
      title: "Add Debt",
      description: "Track money owed",
      icon: AlertCircle,
      action: () => router.push("/debts"),
      color: "bg-orange-100 text-orange-600 hover:bg-orange-200"
    },
    {
      title: "Clock In",
      description: "Start work session",
      icon: Clock,
      action: () => router.push("/work-hours"),
      color: "bg-purple-100 text-purple-600 hover:bg-purple-200"
    },
    {
      title: "Add Event",
      description: "Schedule calendar event",
      icon: Calendar,
      action: () => router.push("/calendar"),
      color: "bg-indigo-100 text-indigo-600 hover:bg-indigo-200"
    }
  ]

  return (
    <Card className="border-none shadow-sm hover:shadow-md transition-all bg-white">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 font-light">
          <Plus className="h-5 w-5" />
          Quick Actions
        </CardTitle>
        <CardDescription className="font-light">Common tasks to get you started</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {actions.map((action, index) => (
            <Button
              key={index}
              variant="outline"
              className="h-auto p-4 flex flex-col items-center gap-2 hover:shadow-sm transition-all border-gray-200 hover:border-gray-300"
              onClick={action.action}
            >
              <div className={`p-2 rounded-full ${action.color}`}>
                <action.icon className="h-4 w-4" />
              </div>
              <div className="text-center">
                <div className="font-medium text-sm">{action.title}</div>
                <div className="text-xs text-gray-500 font-light">{action.description}</div>
              </div>
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}