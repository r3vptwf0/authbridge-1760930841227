"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"
import { getSupabaseClient } from "@/lib/supabase"
import { Pencil, Trash2, Plus, DollarSign, TrendingDown, TrendingUp, Calendar, User, CheckCircle2, Clock, ArrowLeft } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface Debt {
  id: string
  person_name: string
  amount: number
  amount_paid: number
  description: string | null
  due_date: string | null
  status: string
  type: string
}

export default function DebtsPage() {
  const [debts, setDebts] = useState<Debt[]>([])
  const [activeTab, setActiveTab] = useState<'to_me' | 'to_others'>('to_others')
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isPayDialogOpen, setIsPayDialogOpen] = useState(false)
  const [editingDebt, setEditingDebt] = useState<Debt | null>(null)
  const [payingDebt, setPayingDebt] = useState<Debt | null>(null)
  const [personName, setPersonName] = useState("")
  const [amount, setAmount] = useState("")
  const [description, setDescription] = useState("")
  const [dueDate, setDueDate] = useState("")
  const [paymentAmount, setPaymentAmount] = useState("")
  const { toast } = useToast()
  const router = useRouter()

  useEffect(() => {
    loadDebts()
  }, [])

  const loadDebts = async () => {
    try {
      const supabase = getSupabaseClient()
      const { data, error } = await supabase
        .from('debts')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setDebts(data || [])
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      })
    }
  }

  const handleAddDebt = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const supabase = getSupabaseClient()
      const { error } = await supabase.from('debts').insert({
        person_name: personName,
        amount: parseFloat(amount),
        description: description || null,
        due_date: dueDate ? new Date(dueDate).toISOString() : null,
        status: 'pending',
        type: activeTab,
      })

      if (error) throw error

      toast({ title: "Success", description: "Debt added successfully!" })
      resetForm()
      setIsAddDialogOpen(false)
      loadDebts()
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" })
    }
  }

  const handleEditDebt = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingDebt) return

    try {
      const supabase = getSupabaseClient()
      const { error } = await supabase.from('debts').update({
        person_name: personName,
        amount: parseFloat(amount),
        description: description || null,
        due_date: dueDate ? new Date(dueDate).toISOString() : null,
      }).eq('id', editingDebt.id)

      if (error) throw error

      toast({ title: "Success", description: "Debt updated successfully!" })
      resetForm()
      setEditingDebt(null)
      setIsEditDialogOpen(false)
      loadDebts()
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" })
    }
  }

  const handlePayDebt = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!payingDebt) return

    const payment = parseFloat(paymentAmount)
    if (payment <= 0) {
      toast({ title: "Error", description: "Payment must be greater than 0", variant: "destructive" })
      return
    }

    const newAmountPaid = payingDebt.amount_paid + payment
    if (newAmountPaid > payingDebt.amount) {
      toast({ title: "Error", description: "Payment exceeds debt amount", variant: "destructive" })
      return
    }

    try {
      const supabase = getSupabaseClient()
      const newStatus = newAmountPaid >= payingDebt.amount ? 'paid' : 'pending'
      
      const [debtUpdate, transactionInsert] = await Promise.all([
        supabase.from('debts').update({
          amount_paid: newAmountPaid,
          status: newStatus,
        }).eq('id', payingDebt.id),
        
        payingDebt.type === 'to_others'
          ? supabase.from('expenses').insert({
              description: `Paid $${payment.toFixed(2)} to ${payingDebt.person_name}`,
              amount: payment,
              category: 'Debt Payment',
              date: new Date().toISOString(),
            })
          : supabase.from('incomes').insert({
              description: `Received $${payment.toFixed(2)} from ${payingDebt.person_name}`,
              amount: payment,
              category: 'Debt Collection',
              date: new Date().toISOString(),
            })
      ])

      if (debtUpdate.error) throw debtUpdate.error
      if (transactionInsert.error) throw transactionInsert.error

      const recordType = payingDebt.type === 'to_others' ? 'expenses' : 'incomes'
      toast({ 
        title: "Success", 
        description: `Payment of $${payment.toFixed(2)} recorded. Added to ${recordType}.` 
      })
      
      setPaymentAmount("")
      setPayingDebt(null)
      setIsPayDialogOpen(false)
      loadDebts()
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" })
    }
  }

  const handleDeleteDebt = async (id: string) => {
    try {
      const supabase = getSupabaseClient()
      const { error } = await supabase.from('debts').delete().eq('id', id)
      if (error) throw error
      toast({ title: "Success", description: "Debt deleted successfully!" })
      loadDebts()
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" })
    }
  }

  const openEditDialog = (debt: Debt) => {
    setEditingDebt(debt)
    setPersonName(debt.person_name)
    setAmount(debt.amount.toString())
    setDescription(debt.description || "")
    setDueDate(debt.due_date ? new Date(debt.due_date).toISOString().split('T')[0] : "")
    setIsEditDialogOpen(true)
  }

  const openPayDialog = (debt: Debt) => {
    setPayingDebt(debt)
    setPaymentAmount("")
    setIsPayDialogOpen(true)
  }

  const resetForm = () => {
    setPersonName("")
    setAmount("")
    setDescription("")
    setDueDate("")
  }

  const getRemainingAmount = (debt: Debt) => debt.amount - debt.amount_paid
  
  const getStats = (type: 'to_me' | 'to_others') => {
    const filtered = debts.filter(d => d.type === type)
    return {
      debts: filtered,
      total: filtered.reduce((sum, d) => sum + d.amount, 0),
      paid: filtered.reduce((sum, d) => sum + d.amount_paid, 0),
      remaining: filtered.reduce((sum, d) => sum + (d.amount - d.amount_paid), 0),
      pending: filtered.filter(d => d.status === 'pending').length,
    }
  }

  const renderDebtTable = (type: 'to_me' | 'to_others') => {
    const { debts: filteredDebts } = getStats(type)
    
    if (filteredDebts.length === 0) {
      return (
        <div className="text-center py-16">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 mb-4">
            <CheckCircle2 className="h-8 w-8 text-green-600" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No debts recorded</h3>
          <p className="text-gray-500">You're all clear! {type === 'to_others' ? 'You don\'t owe anyone.' : 'No one owes you.'}</p>
        </div>
      )
    }

    return (
      <div className="space-y-4">
        {filteredDebts.map((debt) => {
          const remaining = getRemainingAmount(debt)
          const progress = (debt.amount_paid / debt.amount) * 100
          const isPaid = debt.status === 'paid'
          
          return (
            <div key={debt.id} className="group relative bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-all duration-300 hover:border-gray-300">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-start gap-4 flex-1">
                  <div className="h-12 w-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg shadow-lg">
                    {debt.person_name.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-1">
                      <h3 className="text-xl font-bold text-gray-900">{debt.person_name}</h3>
                      <Badge 
                        variant={isPaid ? 'default' : 'secondary'}
                        className={isPaid ? 'bg-green-100 text-green-700 border-green-300' : 'bg-orange-100 text-orange-700 border-orange-300'}
                      >
                        {isPaid ? '✓ Paid' : 'Pending'}
                      </Badge>
                    </div>
                    {debt.description && (
                      <p className="text-gray-600 text-sm mb-2">{debt.description}</p>
                    )}
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      {debt.due_date && (
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          <span>Due: {new Date(debt.due_date).toLocaleDateString()}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  {!isPaid && (
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => openPayDialog(debt)}
                      className="bg-green-50 hover:bg-green-100 border-green-300 text-green-700"
                    >
                      <DollarSign className="h-4 w-4 mr-1" />
                      Pay
                    </Button>
                  )}
                  <Button variant="ghost" size="icon" onClick={() => openEditDialog(debt)}>
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => handleDeleteDebt(debt.id)} className="hover:bg-red-50 hover:text-red-600">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4 mb-3">
                <div>
                  <p className="text-xs text-gray-500 mb-1">Total Amount</p>
                  <p className="text-lg font-bold text-gray-900">${debt.amount.toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">Paid</p>
                  <p className="text-lg font-bold text-green-600">${debt.amount_paid.toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">Remaining</p>
                  <p className="text-lg font-bold text-orange-600">${remaining.toFixed(2)}</p>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-gray-500">Progress</span>
                  <span className="font-semibold text-gray-700">{progress.toFixed(0)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-green-500 to-emerald-600 rounded-full transition-all duration-500"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            </div>
          )
        })}
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-gray-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
          <div>
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Debt Management</h1>
            <p className="text-gray-600 mt-2">Track and manage your financial obligations</p>
          </div>
          <Button onClick={() => router.push('/dashboard')} variant="outline" className="w-fit">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Dashboard
          </Button>
        </div>

        <Tabs defaultValue="to_others" className="space-y-6" onValueChange={(v) => setActiveTab(v as 'to_me' | 'to_others')}>
          <TabsList className="grid w-full max-w-md grid-cols-2 h-12 bg-white shadow-sm">
            <TabsTrigger value="to_others" className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-red-500 data-[state=active]:to-orange-500 data-[state=active]:text-white">
              <TrendingDown className="h-4 w-4" />
              <span className="font-semibold">I Owe</span>
            </TabsTrigger>
            <TabsTrigger value="to_me" className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-500 data-[state=active]:to-emerald-500 data-[state=active]:text-white">
              <TrendingUp className="h-4 w-4" />
              <span className="font-semibold">They Owe</span>
            </TabsTrigger>
          </TabsList>

          {(['to_others', 'to_me'] as const).map((type) => {
            const stats = getStats(type)
            return (
              <TabsContent key={type} value={type} className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <Card className="border-none shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-blue-500 to-blue-600 text-white">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium text-blue-100">Total Amount</CardTitle>
                      <div className="h-10 w-10 rounded-full bg-white/20 flex items-center justify-center">
                        <DollarSign className="h-5 w-5" />
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-3xl font-bold">${stats.total.toFixed(2)}</p>
                      <p className="text-xs text-blue-100 mt-1">Total {type === 'to_others' ? 'owed' : 'receivable'}</p>
                    </CardContent>
                  </Card>

                  <Card className="border-none shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-green-500 to-emerald-600 text-white">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium text-green-100">Paid</CardTitle>
                      <div className="h-10 w-10 rounded-full bg-white/20 flex items-center justify-center">
                        <CheckCircle2 className="h-5 w-5" />
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-3xl font-bold">${stats.paid.toFixed(2)}</p>
                      <p className="text-xs text-green-100 mt-1">{stats.total > 0 ? Math.round((stats.paid / stats.total) * 100) : 0}% completed</p>
                    </CardContent>
                  </Card>

                  <Card className="border-none shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-orange-500 to-red-600 text-white">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium text-orange-100">Remaining</CardTitle>
                      <div className="h-10 w-10 rounded-full bg-white/20 flex items-center justify-center">
                        <Clock className="h-5 w-5" />
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-3xl font-bold">${stats.remaining.toFixed(2)}</p>
                      <p className="text-xs text-orange-100 mt-1">Outstanding balance</p>
                    </CardContent>
                  </Card>

                  <Card className="border-none shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-purple-500 to-indigo-600 text-white">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium text-purple-100">Pending</CardTitle>
                      <div className="h-10 w-10 rounded-full bg-white/20 flex items-center justify-center">
                        <span className="text-xl font-bold">{stats.pending}</span>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-3xl font-bold">{stats.pending}</p>
                      <p className="text-xs text-purple-100 mt-1">Active {stats.pending === 1 ? 'debt' : 'debts'}</p>
                    </CardContent>
                  </Card>
                </div>

                <Card className="border-none shadow-xl">
                  <CardHeader className="bg-gradient-to-r from-gray-50 to-white">
                    <div className="flex justify-between items-center">
                      <div>
                        <CardTitle className="text-2xl">{type === 'to_others' ? 'Money I Owe' : 'Money Owed to Me'}</CardTitle>
                        <CardDescription className="text-base mt-1">
                          {type === 'to_others' ? 'Track debts you need to pay' : 'Track money others owe you'}
                        </CardDescription>
                      </div>
                      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                        <DialogTrigger asChild>
                          <Button onClick={resetForm} className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg">
                            <Plus className="mr-2 h-4 w-4" />
                            Add Debt
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Add New Debt</DialogTitle>
                            <DialogDescription>
                              {activeTab === 'to_others' ? 'Enter the details of your debt' : 'Enter the details of debt owed to you'}
                            </DialogDescription>
                          </DialogHeader>
                          <form onSubmit={handleAddDebt} className="space-y-4">
                            <div className="space-y-2">
                              <Label htmlFor="person">Person Name</Label>
                              <Input id="person" value={personName} onChange={(e) => setPersonName(e.target.value)} required />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="amount">Amount</Label>
                              <Input id="amount" type="number" step="0.01" value={amount} onChange={(e) => setAmount(e.target.value)} required />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="description">Description (Optional)</Label>
                              <Input id="description" value={description} onChange={(e) => setDescription(e.target.value)} />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="due-date">Due Date (Optional)</Label>
                              <Input id="due-date" type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
                            </div>
                            <Button type="submit" className="w-full">Add Debt</Button>
                          </form>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {renderDebtTable(type)}
                  </CardContent>
                </Card>
              </TabsContent>
            )
          })}
        </Tabs>

        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Debt</DialogTitle>
              <DialogDescription>Update the details of your debt</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleEditDebt} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="edit-person">Person Name</Label>
                <Input id="edit-person" value={personName} onChange={(e) => setPersonName(e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-amount">Amount</Label>
                <Input id="edit-amount" type="number" step="0.01" value={amount} onChange={(e) => setAmount(e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-description">Description (Optional)</Label>
                <Input id="edit-description" value={description} onChange={(e) => setDescription(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-due-date">Due Date (Optional)</Label>
                <Input id="edit-due-date" type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
              </div>
              <Button type="submit" className="w-full">Update Debt</Button>
            </form>
          </DialogContent>
        </Dialog>

        <Dialog open={isPayDialogOpen} onOpenChange={setIsPayDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Pay Debt</DialogTitle>
              <DialogDescription>
                {payingDebt && `Pay ${payingDebt.person_name} (Remaining: $${getRemainingAmount(payingDebt).toFixed(2)})`}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handlePayDebt} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="payment">Payment Amount</Label>
                <Input 
                  id="payment" 
                  type="number" 
                  step="0.01" 
                  value={paymentAmount} 
                  onChange={(e) => setPaymentAmount(e.target.value)} 
                  placeholder={`Max: $${payingDebt ? getRemainingAmount(payingDebt).toFixed(2) : '0.00'}`}
                  required 
                />
              </div>
              {paymentAmount && payingDebt && parseFloat(paymentAmount) > 0 && (
                <div className="p-4 bg-gray-50 rounded-lg space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Current Paid:</span>
                    <span className="font-semibold">${payingDebt.amount_paid.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Payment:</span>
                    <span className="font-semibold text-green-600">+${parseFloat(paymentAmount).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between border-t pt-2">
                    <span className="text-sm font-medium">New Paid Total:</span>
                    <span className="font-bold">${(payingDebt.amount_paid + parseFloat(paymentAmount)).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm font-medium">Remaining:</span>
                    <span className="font-bold text-orange-600">
                      ${(getRemainingAmount(payingDebt) - parseFloat(paymentAmount)).toFixed(2)}
                    </span>
                  </div>
                </div>
              )}
              <Button type="submit" className="w-full">Confirm Payment</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
