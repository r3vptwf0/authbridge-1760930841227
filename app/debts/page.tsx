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
import { Pencil, Trash2, Plus, DollarSign, TrendingDown, TrendingUp } from "lucide-react"
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
    
    return (
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Person</TableHead>
            <TableHead>Description</TableHead>
            <TableHead className="text-right">Amount</TableHead>
            <TableHead className="text-right">Paid</TableHead>
            <TableHead className="text-right">Remaining</TableHead>
            <TableHead>Due Date</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredDebts.length === 0 ? (
            <TableRow>
              <TableCell colSpan={8} className="text-center text-gray-500 py-8">
                No debts recorded. Good for you!
              </TableCell>
            </TableRow>
          ) : (
            filteredDebts.map((debt) => (
              <TableRow key={debt.id}>
                <TableCell className="font-medium">{debt.person_name}</TableCell>
                <TableCell>{debt.description || '-'}</TableCell>
                <TableCell className="text-right">${debt.amount.toFixed(2)}</TableCell>
                <TableCell className="text-right text-green-600">${debt.amount_paid.toFixed(2)}</TableCell>
                <TableCell className="text-right font-semibold text-orange-600">
                  ${getRemainingAmount(debt).toFixed(2)}
                </TableCell>
                <TableCell>{debt.due_date ? new Date(debt.due_date).toLocaleDateString() : '-'}</TableCell>
                <TableCell>
                  <Badge variant={debt.status === 'paid' ? 'default' : 'secondary'}>
                    {debt.status === 'paid' ? 'Paid' : 'Pending'}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    {debt.status === 'pending' && (
                      <Button variant="ghost" size="icon" onClick={() => openPayDialog(debt)} title="Pay">
                        <DollarSign className="h-4 w-4 text-green-600" />
                      </Button>
                    )}
                    <Button variant="ghost" size="icon" onClick={() => openEditDialog(debt)} title="Edit">
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDeleteDebt(debt.id)} title="Delete">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-4xl font-bold">Debt Management</h1>
          <Button onClick={() => router.push('/dashboard')} variant="outline">
            Back to Dashboard
          </Button>
        </div>

        <Tabs defaultValue="to_others" className="space-y-6" onValueChange={(v) => setActiveTab(v as 'to_me' | 'to_others')}>
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="to_others" className="flex items-center gap-2">
              <TrendingDown className="h-4 w-4" />
              I Owe
            </TabsTrigger>
            <TabsTrigger value="to_me" className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              They Owe
            </TabsTrigger>
          </TabsList>

          {(['to_others', 'to_me'] as const).map((type) => {
            const stats = getStats(type)
            return (
              <TabsContent key={type} value={type} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Total</CardTitle>
                      <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <p className="text-2xl font-bold">${stats.total.toFixed(2)}</p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Paid</CardTitle>
                      <DollarSign className="h-4 w-4 text-green-600" />
                    </CardHeader>
                    <CardContent>
                      <p className="text-2xl font-bold text-green-600">${stats.paid.toFixed(2)}</p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Remaining</CardTitle>
                      <DollarSign className="h-4 w-4 text-orange-600" />
                    </CardHeader>
                    <CardContent>
                      <p className="text-2xl font-bold text-orange-600">${stats.remaining.toFixed(2)}</p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Pending</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-2xl font-bold text-blue-600">{stats.pending}</p>
                    </CardContent>
                  </Card>
                </div>

                <Card>
                  <CardHeader>
                    <div className="flex justify-between items-center">
                      <div>
                        <CardTitle>{type === 'to_others' ? 'Money I Owe' : 'Money Owed to Me'}</CardTitle>
                        <CardDescription>
                          {type === 'to_others' ? 'Track debts you need to pay' : 'Track money others owe you'}
                        </CardDescription>
                      </div>
                      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                        <DialogTrigger asChild>
                          <Button onClick={resetForm}>
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
