"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"
import { getSupabaseClient } from "@/lib/supabase"
import { Pencil, Trash2, Plus, Package, DollarSign, UserMinus } from "lucide-react"

interface Product {
  id: string
  name: string
  stock_grams: number
  cost_per_gram: number
  price_per_gram: number
}

export default function StockPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isSellDialogOpen, setIsSellDialogOpen] = useState(false)
  const [isConsumeDialogOpen, setIsConsumeDialogOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [sellingProduct, setSellingProduct] = useState<Product | null>(null)
  const [consumingProduct, setConsumingProduct] = useState<Product | null>(null)
  const [name, setName] = useState("")
  const [stockGrams, setStockGrams] = useState("")
  const [costPerGram, setCostPerGram] = useState("")
  const [pricePerGram, setPricePerGram] = useState("")
  const [sellQuantity, setSellQuantity] = useState("")
  const [consumeQuantity, setConsumeQuantity] = useState("")
  const { toast } = useToast()
  const router = useRouter()

  useEffect(() => {
    loadProducts()
  }, [])

  const loadProducts = async () => {
    try {
      const supabase = getSupabaseClient()
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setProducts(data || [])
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      })
    }
  }

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const supabase = getSupabaseClient()
      const { error } = await supabase.from('products').insert({
        name,
        stock_grams: parseFloat(stockGrams),
        cost_per_gram: parseFloat(costPerGram),
        price_per_gram: parseFloat(pricePerGram),
      })

      if (error) throw error

      toast({ title: "Success", description: "Product added successfully!" })
      resetForm()
      setIsAddDialogOpen(false)
      loadProducts()
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" })
    }
  }

  const handleEditProduct = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingProduct) return

    try {
      const supabase = getSupabaseClient()
      const { error } = await supabase.from('products').update({
        name,
        stock_grams: parseFloat(stockGrams),
        cost_per_gram: parseFloat(costPerGram),
        price_per_gram: parseFloat(pricePerGram),
      }).eq('id', editingProduct.id)

      if (error) throw error

      toast({ title: "Success", description: "Product updated successfully!" })
      resetForm()
      setEditingProduct(null)
      setIsEditDialogOpen(false)
      loadProducts()
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" })
    }
  }

  const handleDeleteProduct = async (id: string) => {
    try {
      const supabase = getSupabaseClient()
      const { error } = await supabase.from('products').delete().eq('id', id)
      if (error) throw error
      toast({ title: "Success", description: "Product deleted successfully!" })
      loadProducts()
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" })
    }
  }

  const openEditDialog = (product: Product) => {
    setEditingProduct(product)
    setName(product.name)
    setStockGrams(product.stock_grams.toString())
    setCostPerGram(product.cost_per_gram.toString())
    setPricePerGram(product.price_per_gram.toString())
    setIsEditDialogOpen(true)
  }

  const resetForm = () => {
    setName("")
    setStockGrams("")
    setCostPerGram("")
    setPricePerGram("")
  }

  const openSellDialog = (product: Product) => {
    setSellingProduct(product)
    setSellQuantity("")
    setIsSellDialogOpen(true)
  }

  const openConsumeDialog = (product: Product) => {
    setConsumingProduct(product)
    setConsumeQuantity("")
    setIsConsumeDialogOpen(true)
  }

  const handleSellProduct = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!sellingProduct) return

    const quantity = parseFloat(sellQuantity)
    if (quantity <= 0) {
      toast({ title: "Error", description: "Quantity must be greater than 0", variant: "destructive" })
      return
    }

    if (quantity > sellingProduct.stock_grams) {
      toast({ title: "Error", description: "Not enough stock to sell", variant: "destructive" })
      return
    }

    try {
      const supabase = getSupabaseClient()
      
      const newStock = sellingProduct.stock_grams - quantity
      const saleAmount = quantity * sellingProduct.price_per_gram
      
      const [updateResult, incomeResult] = await Promise.all([
        supabase.from('products').update({
          stock_grams: newStock
        }).eq('id', sellingProduct.id),
        
        supabase.from('incomes').insert({
          description: `Sold ${quantity}g of ${sellingProduct.name}`,
          amount: saleAmount,
          category: 'Product Sale',
          date: new Date().toISOString(),
        })
      ])

      if (updateResult.error) throw updateResult.error
      if (incomeResult.error) throw incomeResult.error

      toast({ 
        title: "Success", 
        description: `Sold ${quantity}g for $${saleAmount.toFixed(2)}. Added to wallet as income.` 
      })
      
      setSellQuantity("")
      setSellingProduct(null)
      setIsSellDialogOpen(false)
      loadProducts()
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" })
    }
  }

  const handleConsumeProduct = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!consumingProduct) return

    const quantity = parseFloat(consumeQuantity)
    if (quantity <= 0) {
      toast({ title: "Error", description: "Quantity must be greater than 0", variant: "destructive" })
      return
    }

    if (quantity > consumingProduct.stock_grams) {
      toast({ title: "Error", description: "Not enough stock to consume", variant: "destructive" })
      return
    }

    try {
      const supabase = getSupabaseClient()
      
      const newStock = consumingProduct.stock_grams - quantity
      
      const { error } = await supabase.from('products').update({
        stock_grams: newStock
      }).eq('id', consumingProduct.id)

      if (error) throw error

      toast({ 
        title: "Success", 
        description: `Consumed ${quantity}g of ${consumingProduct.name}. Stock updated.` 
      })
      
      setConsumeQuantity("")
      setConsumingProduct(null)
      setIsConsumeDialogOpen(false)
      loadProducts()
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" })
    }
  }

  const calculateTotalCost = (product: Product) => {
    return product.stock_grams * product.cost_per_gram
  }

  const calculateTotalValue = (product: Product) => {
    return product.stock_grams * product.price_per_gram
  }

  const calculateProfit = (product: Product) => {
    return calculateTotalValue(product) - calculateTotalCost(product)
  }

  const totalStockValue = products.reduce((sum, p) => sum + calculateTotalValue(p), 0)
  const totalCost = products.reduce((sum, p) => sum + calculateTotalCost(p), 0)
  const totalProfit = totalStockValue - totalCost
  const totalGrams = products.reduce((sum, p) => sum + p.stock_grams, 0)

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-gray-100 to-white p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex justify-between items-center pb-4 border-b border-gray-200">
          <div>
            <h1 className="text-4xl md:text-5xl font-light tracking-tight text-gray-900">Stock Management</h1>
            <p className="text-gray-500 mt-2 font-light">Manage your product inventory</p>
          </div>
          <Button onClick={() => router.push('/dashboard')} variant="outline" className="border-gray-300 hover:bg-gray-100">
            Back to Dashboard
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="border-none shadow-sm hover:shadow-md transition-all bg-white">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs font-light text-gray-500 uppercase tracking-wider">Total Stock</CardTitle>
              <div className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center">
                <Package className="h-4 w-4 text-gray-700" />
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-light text-gray-900">{totalGrams.toFixed(2)}g</p>
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm hover:shadow-md transition-all bg-white">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs font-light text-gray-500 uppercase tracking-wider">Total Cost</CardTitle>
              <div className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center">
                <DollarSign className="h-4 w-4 text-gray-700" />
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-light text-gray-900">${totalCost.toFixed(2)}</p>
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm hover:shadow-md transition-all bg-white">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs font-light text-gray-500 uppercase tracking-wider">Stock Value</CardTitle>
              <div className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center">
                <DollarSign className="h-4 w-4 text-gray-700" />
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-light text-gray-900">${totalStockValue.toFixed(2)}</p>
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm hover:shadow-md transition-all bg-white">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs font-light text-gray-500 uppercase tracking-wider">Potential Profit</CardTitle>
              <div className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center">
                <DollarSign className="h-4 w-4 text-gray-700" />
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-light text-gray-900">
                ${totalProfit.toFixed(2)}
              </p>
            </CardContent>
          </Card>
        </div>

        <Card className="border-none shadow-sm bg-white">
          <CardHeader className="border-b border-gray-100">
            <div className="flex justify-between items-center">
              <div>
                <CardTitle className="text-2xl font-light text-gray-900">Products</CardTitle>
                <CardDescription className="font-light">Manage your product inventory</CardDescription>
              </div>
              <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                <DialogTrigger asChild>
                  <Button onClick={resetForm} className="bg-gray-900 hover:bg-gray-800 text-white">
                    <Plus className="mr-2 h-4 w-4" />
                    Add Product
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add New Product</DialogTitle>
                    <DialogDescription>Enter the details of your product</DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleAddProduct} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Product Name</Label>
                      <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="stock">Stock (grams)</Label>
                      <Input id="stock" type="number" step="0.01" value={stockGrams} onChange={(e) => setStockGrams(e.target.value)} required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="cost">Cost per Gram ($)</Label>
                      <Input id="cost" type="number" step="0.01" value={costPerGram} onChange={(e) => setCostPerGram(e.target.value)} required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="price">Selling Price per Gram ($)</Label>
                      <Input id="price" type="number" step="0.01" value={pricePerGram} onChange={(e) => setPricePerGram(e.target.value)} required />
                    </div>
                    <Button type="submit" className="w-full">Add Product</Button>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product Name</TableHead>
                  <TableHead className="text-right">Stock (g)</TableHead>
                  <TableHead className="text-right">Cost/g</TableHead>
                  <TableHead className="text-right">Price/g</TableHead>
                  <TableHead className="text-right">Total Cost</TableHead>
                  <TableHead className="text-right">Total Value</TableHead>
                  <TableHead className="text-right">Profit</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {products.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center text-gray-400 py-8 font-light">
                      No products yet. Add your first product!
                    </TableCell>
                  </TableRow>
                ) : (
                  products.map((product) => (
                    <TableRow key={product.id} className="hover:bg-gray-50">
                      <TableCell className="font-light text-gray-900">{product.name}</TableCell>
                      <TableCell className="text-right font-light">{product.stock_grams.toFixed(2)}g</TableCell>
                      <TableCell className="text-right font-light">${product.cost_per_gram.toFixed(2)}</TableCell>
                      <TableCell className="text-right font-light">${product.price_per_gram.toFixed(2)}</TableCell>
                      <TableCell className="text-right font-light">${calculateTotalCost(product).toFixed(2)}</TableCell>
                      <TableCell className="text-right font-light">${calculateTotalValue(product).toFixed(2)}</TableCell>
                      <TableCell className="text-right font-light text-gray-900">
                        ${calculateProfit(product).toFixed(2)}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <Button variant="ghost" size="icon" onClick={() => openSellDialog(product)} title="Sell" className="hover:bg-gray-100">
                            <DollarSign className="h-4 w-4 text-gray-700" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => openConsumeDialog(product)} title="Consume" className="hover:bg-gray-100">
                            <UserMinus className="h-4 w-4 text-gray-700" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => openEditDialog(product)} title="Edit" className="hover:bg-gray-100">
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => handleDeleteProduct(product.id)} title="Delete" className="hover:bg-gray-100">
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

        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Product</DialogTitle>
              <DialogDescription>Update the details of your product</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleEditProduct} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="edit-name">Product Name</Label>
                <Input id="edit-name" value={name} onChange={(e) => setName(e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-stock">Stock (grams)</Label>
                <Input id="edit-stock" type="number" step="0.01" value={stockGrams} onChange={(e) => setStockGrams(e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-cost">Cost per Gram ($)</Label>
                <Input id="edit-cost" type="number" step="0.01" value={costPerGram} onChange={(e) => setCostPerGram(e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-price">Selling Price per Gram ($)</Label>
                <Input id="edit-price" type="number" step="0.01" value={pricePerGram} onChange={(e) => setPricePerGram(e.target.value)} required />
              </div>
              <Button type="submit" className="w-full">Update Product</Button>
            </form>
          </DialogContent>
        </Dialog>

        <Dialog open={isSellDialogOpen} onOpenChange={setIsSellDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Sell Product</DialogTitle>
              <DialogDescription>
                {sellingProduct && `Sell ${sellingProduct.name} (Available: ${sellingProduct.stock_grams.toFixed(2)}g)`}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSellProduct} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="sell-quantity">Quantity (grams)</Label>
                <Input 
                  id="sell-quantity" 
                  type="number" 
                  step="0.01" 
                  value={sellQuantity} 
                  onChange={(e) => setSellQuantity(e.target.value)} 
                  placeholder={`Max: ${sellingProduct?.stock_grams.toFixed(2)}g`}
                  required 
                />
              </div>
              {sellQuantity && sellingProduct && parseFloat(sellQuantity) > 0 && (
                <div className="p-4 bg-gray-50 rounded-lg space-y-2 border border-gray-200">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500 font-light">Sale Amount:</span>
                    <span className="font-light text-gray-900">${(parseFloat(sellQuantity) * sellingProduct.price_per_gram).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500 font-light">Cost:</span>
                    <span className="font-light text-gray-900">-${(parseFloat(sellQuantity) * sellingProduct.cost_per_gram).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between border-t border-gray-200 pt-2">
                    <span className="text-sm font-light">Profit:</span>
                    <span className="font-medium text-gray-900">
                      ${(parseFloat(sellQuantity) * (sellingProduct.price_per_gram - sellingProduct.cost_per_gram)).toFixed(2)}
                    </span>
                  </div>
                </div>
              )}
              <Button type="submit" className="w-full">Confirm Sale</Button>
            </form>
          </DialogContent>
        </Dialog>

        <Dialog open={isConsumeDialogOpen} onOpenChange={setIsConsumeDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Consume Product</DialogTitle>
              <DialogDescription>
                {consumingProduct && `Remove ${consumingProduct.name} from stock for personal use (Available: ${consumingProduct.stock_grams.toFixed(2)}g)`}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleConsumeProduct} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="consume-quantity">Quantity (grams)</Label>
                <Input 
                  id="consume-quantity" 
                  type="number" 
                  step="0.01" 
                  value={consumeQuantity} 
                  onChange={(e) => setConsumeQuantity(e.target.value)} 
                  placeholder={`Max: ${consumingProduct?.stock_grams.toFixed(2)}g`}
                  required 
                />
              </div>
              {consumeQuantity && consumingProduct && parseFloat(consumeQuantity) > 0 && (
                <div className="p-4 bg-gray-50 rounded-lg space-y-2 border border-gray-200">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500 font-light">Consuming:</span>
                    <span className="font-light text-gray-900">{parseFloat(consumeQuantity).toFixed(2)}g</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500 font-light">Remaining Stock:</span>
                    <span className="font-light text-gray-900">{(consumingProduct.stock_grams - parseFloat(consumeQuantity)).toFixed(2)}g</span>
                  </div>
                  <div className="flex justify-between border-t border-gray-200 pt-2">
                    <span className="text-sm font-light">Cost Value:</span>
                    <span className="font-medium text-gray-900">
                      ${(parseFloat(consumeQuantity) * consumingProduct.cost_per_gram).toFixed(2)}
                    </span>
                  </div>
                </div>
              )}
              <Button type="submit" className="w-full bg-gray-900 hover:bg-gray-800">Confirm Consumption</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
