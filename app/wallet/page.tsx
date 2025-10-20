"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"
import { getSupabaseClient } from "@/lib/supabase"
import { Pencil, Trash2, Plus, TrendingUp, TrendingDown } from "lucide-react"

interface Transaction {
  id: string
  description: string
  amount: number
  category: string
  date: string
}

const expenseCategories = ["Food", "Transport", "Entertainment", "Bills", "Shopping", "Health", "Other"]
const incomeCategories = ["Salary", "Freelance", "Investment", "Gift", "Bonus", "Other"]

export default function WalletPage() {
  const [expenses, setExpenses] = useState<Transaction[]>([])
  const [incomes, setIncomes] = useState<Transaction[]>([])
  const [isAddExpenseDialogOpen, setIsAddExpenseDialogOpen] = useState(false)
  const [isAddIncomeDialogOpen, setIsAddIncomeDialogOpen] = useState(false)
  const [isEditExpenseDialogOpen, setIsEditExpenseDialogOpen] = useState(false)
  const [isEditIncomeDialogOpen, setIsEditIncomeDialogOpen] = useState(false)
  const [editingExpense, setEditingExpense] = useState<Transaction | null>(null)
  const [editingIncome, setEditingIncome] = useState<Transaction | null>(null)
  const [description, setDescription] = useState("")
  const [amount, setAmount] = useState("")
  const [category, setCategory] = useState("")
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const { toast } = useToast()
  const router = useRouter()

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const supabase = getSupabaseClient()
      
      const [expensesResult, incomesResult] = await Promise.all([
        supabase.from('expenses').select('*').order('date', { ascending: false }),
        supabase.from('incomes').select('*').order('date', { ascending: false })
      ])

      if (expensesResult.error) throw expensesResult.error
      if (incomesResult.error) throw incomesResult.error

      setExpenses(expensesResult.data || [])
      setIncomes(incomesResult.data || [])
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      })
    }
  }

  const handleAddExpense = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const supabase = getSupabaseClient()
      const { error } = await supabase.from('expenses').insert({
        description,
        amount: parseFloat(amount),
        category,
        date: new Date(date).toISOString(),
      })

      if (error) throw error

      toast({ title: "Success", description: "Expense added successfully!" })
      resetForm()
      setIsAddExpenseDialogOpen(false)
      loadData()
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" })
    }
  }

  const handleAddIncome = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const supabase = getSupabaseClient()
      const { error } = await supabase.from('incomes').insert({
        description,
        amount: parseFloat(amount),
        category,
        date: new Date(date).toISOString(),
      })

      if (error) throw error

      toast({ title: "Success", description: "Income added successfully!" })
      resetForm()
      setIsAddIncomeDialogOpen(false)
      loadData()
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" })
    }
  }

  const handleEditExpense = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingExpense) return

    try {
      const supabase = getSupabaseClient()
      const { error } = await supabase.from('expenses').update({
        description,
        amount: parseFloat(amount),
        category,
        date: new Date(date).toISOString(),
      }).eq('id', editingExpense.id)

      if (error) throw error

      toast({ title: "Success", description: "Expense updated successfully!" })
      resetForm()
      setEditingExpense(null)
      setIsEditExpenseDialogOpen(false)
      loadData()
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" })
    }
  }

  const handleEditIncome = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingIncome) return

    try {
      const supabase = getSupabaseClient()
      const { error } = await supabase.from('incomes').update({
        description,
        amount: parseFloat(amount),
        category,
        date: new Date(date).toISOString(),
      }).eq('id', editingIncome.id)

      if (error) throw error

      toast({ title: "Success", description: "Income updated successfully!" })
      resetForm()
      setEditingIncome(null)
      setIsEditIncomeDialogOpen(false)
      loadData()
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" })
    }
  }

  const handleDeleteExpense = async (id: string) => {
    try {
      const supabase = getSupabaseClient()
      const { error } = await supabase.from('expenses').delete().eq('id', id)
      if (error) throw error
      toast({ title: "Success", description: "Expense deleted successfully!" })
      loadData()
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" })
    }
  }

  const handleDeleteIncome = async (id: string) => {
    try {
      const supabase = getSupabaseClient()
      const { error } = await supabase.from('incomes').delete().eq('id', id)
      if (error) throw error
      toast({ title: "Success", description: "Income deleted successfully!" })
      loadData()
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" })
    }
  }

  const openEditExpenseDialog = (expense: Transaction) => {
    setEditingExpense(expense)
    setDescription(expense.description)
    setAmount(expense.amount.toString())
    setCategory(expense.category)
    setDate(new Date(expense.date).toISOString().split('T')[0])
    setIsEditExpenseDialogOpen(true)
  }

  const openEditIncomeDialog = (income: Transaction) => {
    setEditingIncome(income)
    setDescription(income.description)
    setAmount(income.amount.toString())
    setCategory(income.category)
    setDate(new Date(income.date).toISOString().split('T')[0])
    setIsEditIncomeDialogOpen(true)
  }

  const resetForm = () => {
    setDescription("")
    setAmount("")
    setCategory("")
    setDate(new Date().toISOString().split('T')[0])
  }

  const totalIncome = incomes.reduce((sum, income) => sum + income.amount, 0)
  const totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0)
  const balance = totalIncome - totalExpenses

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-4xl font-bold">Wallet</h1>
          <Button onClick={() => router.push('/dashboard')} variant="outline">
            Back to Dashboard
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Income</CardTitle>
              <TrendingUp className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-green-600">${totalIncome.toFixed(2)}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
              <TrendingDown className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-red-600">${totalExpenses.toFixed(2)}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Balance</CardTitle>
            </CardHeader>
            <CardContent>
              <p className={`text-3xl font-bold ${balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                ${balance.toFixed(2)}
              </p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="expenses" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="expenses">Expenses</TabsTrigger>
            <TabsTrigger value="incomes">Incomes</TabsTrigger>
          </TabsList>

          <TabsContent value="expenses">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>Expenses</CardTitle>
                    <CardDescription>Manage your expenses</CardDescription>
                  </div>
                  <Dialog open={isAddExpenseDialogOpen} onOpenChange={setIsAddExpenseDialogOpen}>
                    <DialogTrigger asChild>
                      <Button onClick={resetForm}>
                        <Plus className="mr-2 h-4 w-4" />
                        Add Expense
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Add New Expense</DialogTitle>
                        <DialogDescription>Enter the details of your expense</DialogDescription>
                      </DialogHeader>
                      <form onSubmit={handleAddExpense} className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="expense-description">Description</Label>
                          <Input id="expense-description" value={description} onChange={(e) => setDescription(e.target.value)} required />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="expense-amount">Amount</Label>
                          <Input id="expense-amount" type="number" step="0.01" value={amount} onChange={(e) => setAmount(e.target.value)} required />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="expense-category">Category</Label>
                          <Select value={category} onValueChange={setCategory} required>
                            <SelectTrigger>
                              <SelectValue placeholder="Select category" />
                            </SelectTrigger>
                            <SelectContent>
                              {expenseCategories.map((cat) => (
                                <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="expense-date">Date</Label>
                          <Input id="expense-date" type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
                        </div>
                        <Button type="submit" className="w-full">Add Expense</Button>
                      </form>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead className="text-right">Amount</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {expenses.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center text-gray-500">
                          No expenses yet. Add your first expense!
                        </TableCell>
                      </TableRow>
                    ) : (
                      expenses.map((expense) => (
                        <TableRow key={expense.id}>
                          <TableCell>{new Date(expense.date).toLocaleDateString()}</TableCell>
                          <TableCell>{expense.description}</TableCell>
                          <TableCell>{expense.category}</TableCell>
                          <TableCell className="text-right">${expense.amount.toFixed(2)}</TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button variant="ghost" size="icon" onClick={() => openEditExpenseDialog(expense)}>
                                <Pencil className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="icon" onClick={() => handleDeleteExpense(expense.id)}>
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="incomes">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>Incomes</CardTitle>
                    <CardDescription>Manage your incomes</CardDescription>
                  </div>
                  <Dialog open={isAddIncomeDialogOpen} onOpenChange={setIsAddIncomeDialogOpen}>
                    <DialogTrigger asChild>
                      <Button onClick={resetForm}>
                        <Plus className="mr-2 h-4 w-4" />
                        Add Income
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Add New Income</DialogTitle>
                        <DialogDescription>Enter the details of your income</DialogDescription>
                      </DialogHeader>
                      <form onSubmit={handleAddIncome} className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="income-description">Description</Label>
                          <Input id="income-description" value={description} onChange={(e) => setDescription(e.target.value)} required />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="income-amount">Amount</Label>
                          <Input id="income-amount" type="number" step="0.01" value={amount} onChange={(e) => setAmount(e.target.value)} required />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="income-category">Category</Label>
                          <Select value={category} onValueChange={setCategory} required>
                            <SelectTrigger>
                              <SelectValue placeholder="Select category" />
                            </SelectTrigger>
                            <SelectContent>
                              {incomeCategories.map((cat) => (
                                <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="income-date">Date</Label>
                          <Input id="income-date" type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
                        </div>
                        <Button type="submit" className="w-full">Add Income</Button>
                      </form>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead className="text-right">Amount</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {incomes.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center text-gray-500">
                          No incomes yet. Add your first income!
                        </TableCell>
                      </TableRow>
                    ) : (
                      incomes.map((income) => (
                        <TableRow key={income.id}>
                          <TableCell>{new Date(income.date).toLocaleDateString()}</TableCell>
                          <TableCell>{income.description}</TableCell>
                          <TableCell>{income.category}</TableCell>
                          <TableCell className="text-right">${income.amount.toFixed(2)}</TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button variant="ghost" size="icon" onClick={() => openEditIncomeDialog(income)}>
                                <Pencil className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="icon" onClick={() => handleDeleteIncome(income.id)}>
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <Dialog open={isEditExpenseDialogOpen} onOpenChange={setIsEditExpenseDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Expense</DialogTitle>
              <DialogDescription>Update the details of your expense</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleEditExpense} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="edit-expense-description">Description</Label>
                <Input id="edit-expense-description" value={description} onChange={(e) => setDescription(e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-expense-amount">Amount</Label>
                <Input id="edit-expense-amount" type="number" step="0.01" value={amount} onChange={(e) => setAmount(e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-expense-category">Category</Label>
                <Select value={category} onValueChange={setCategory} required>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {expenseCategories.map((cat) => (
                      <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-expense-date">Date</Label>
                <Input id="edit-expense-date" type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
              </div>
              <Button type="submit" className="w-full">Update Expense</Button>
            </form>
          </DialogContent>
        </Dialog>

        <Dialog open={isEditIncomeDialogOpen} onOpenChange={setIsEditIncomeDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Income</DialogTitle>
              <DialogDescription>Update the details of your income</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleEditIncome} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="edit-income-description">Description</Label>
                <Input id="edit-income-description" value={description} onChange={(e) => setDescription(e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-income-amount">Amount</Label>
                <Input id="edit-income-amount" type="number" step="0.01" value={amount} onChange={(e) => setAmount(e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-income-category">Category</Label>
                <Select value={category} onValueChange={setCategory} required>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {incomeCategories.map((cat) => (
                      <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-income-date">Date</Label>
                <Input id="edit-income-date" type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
              </div>
              <Button type="submit" className="w-full">Update Income</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
