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
  const balanceExpenses = expenses
    .filter(expense => expense.category !== 'Stock Consumption')
    .reduce((sum, expense) => sum + expense.amount, 0)
  const balance = totalIncome - balanceExpenses

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-gray-100 to-white p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex justify-between items-center pb-4 border-b border-gray-200">
          <div>
            <h1 className="text-4xl md:text-5xl font-light tracking-tight text-gray-900">Wallet</h1>
            <p className="text-gray-500 mt-2 font-light">Manage your income and expenses</p>
          </div>
          <Button onClick={() => router.push('/dashboard')} variant="outline" className="border-gray-300 hover:bg-gray-100">
            Back to Dashboard
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="border-none shadow-sm hover:shadow-md transition-all bg-white">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs font-light text-gray-500 uppercase tracking-wider">Total Income</CardTitle>
              <div className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center">
                <TrendingUp className="h-4 w-4 text-gray-700" />
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-light text-gray-900">${totalIncome.toFixed(2)}</p>
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm hover:shadow-md transition-all bg-white">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs font-light text-gray-500 uppercase tracking-wider">Total Expenses</CardTitle>
              <div className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center">
                <TrendingDown className="h-4 w-4 text-gray-700" />
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-light text-gray-900">${totalExpenses.toFixed(2)}</p>
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm hover:shadow-md transition-all bg-white">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs font-light text-gray-500 uppercase tracking-wider">Balance</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-light text-gray-900">
                ${balance.toFixed(2)}
              </p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="expenses" className="w-full">
          <TabsList className="grid w-full grid-cols-2 h-12 bg-white border border-gray-200">
            <TabsTrigger value="expenses" className="data-[state=active]:bg-gray-900 data-[state=active]:text-white font-light">Expenses</TabsTrigger>
            <TabsTrigger value="incomes" className="data-[state=active]:bg-gray-900 data-[state=active]:text-white font-light">Incomes</TabsTrigger>
          </TabsList>

          <TabsContent value="expenses">
            <Card className="border-none shadow-sm bg-white">
              <CardHeader className="border-b border-gray-100">
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle className="text-2xl font-light text-gray-900">Expenses</CardTitle>
                    <CardDescription className="font-light">Manage your expenses</CardDescription>
                  </div>
                  <Dialog open={isAddExpenseDialogOpen} onOpenChange={setIsAddExpenseDialogOpen}>
                    <DialogTrigger asChild>
                      <Button onClick={resetForm} className="bg-gray-900 hover:bg-gray-800 text-white">
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
                        <TableCell colSpan={5} className="text-center text-gray-400 py-8 font-light">
                          No expenses yet. Add your first expense!
                        </TableCell>
                      </TableRow>
                    ) : (
                      expenses.map((expense) => (
                        <TableRow key={expense.id} className="hover:bg-gray-50">
                          <TableCell className="font-light text-gray-600">{new Date(expense.date).toLocaleDateString()}</TableCell>
                          <TableCell className="font-light text-gray-900">{expense.description}</TableCell>
                          <TableCell className="font-light text-gray-600">{expense.category}</TableCell>
                          <TableCell className="text-right font-light text-gray-900">${expense.amount.toFixed(2)}</TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button variant="ghost" size="icon" onClick={() => openEditExpenseDialog(expense)} className="hover:bg-gray-100">
                                <Pencil className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="icon" onClick={() => handleDeleteExpense(expense.id)} className="hover:bg-gray-100">
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
            <Card className="border-none shadow-sm bg-white">
              <CardHeader className="border-b border-gray-100">
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle className="text-2xl font-light text-gray-900">Incomes</CardTitle>
                    <CardDescription className="font-light">Manage your incomes</CardDescription>
                  </div>
                  <Dialog open={isAddIncomeDialogOpen} onOpenChange={setIsAddIncomeDialogOpen}>
                    <DialogTrigger asChild>
                      <Button onClick={resetForm} className="bg-gray-900 hover:bg-gray-800 text-white">
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
                        <TableCell colSpan={5} className="text-center text-gray-400 py-8 font-light">
                          No incomes yet. Add your first income!
                        </TableCell>
                      </TableRow>
                    ) : (
                      incomes.map((income) => (
                        <TableRow key={income.id} className="hover:bg-gray-50">
                          <TableCell className="font-light text-gray-600">{new Date(income.date).toLocaleDateString()}</TableCell>
                          <TableCell className="font-light text-gray-900">{income.description}</TableCell>
                          <TableCell className="font-light text-gray-600">{income.category}</TableCell>
                          <TableCell className="text-right font-light text-gray-900">${income.amount.toFixed(2)}</TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button variant="ghost" size="icon" onClick={() => openEditIncomeDialog(income)} className="hover:bg-gray-100">
                                <Pencil className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="icon" onClick={() => handleDeleteIncome(income.id)} className="hover:bg-gray-100">
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
