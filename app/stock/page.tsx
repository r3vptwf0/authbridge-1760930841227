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
import { Pencil, Trash2, Plus, Package } from "lucide-react"

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
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [name, setName] = useState("")
  const [stockGrams, setStockGrams] = useState("")
  const [costPerGram, setCostPerGram] = useState("")
  const [pricePerGram, setPricePerGram] = useState("")
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
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-4xl font-bold">Stock Management</h1>
          <Button onClick={() => router.push('/dashboard')} variant="outline">
            Back to Dashboard
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Stock</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{totalGrams.toFixed(2)}g</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Cost</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-red-600">${totalCost.toFixed(2)}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Stock Value</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-blue-600">${totalStockValue.toFixed(2)}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Potential Profit</CardTitle>
            </CardHeader>
            <CardContent>
              <p className={`text-3xl font-bold ${totalProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                ${totalProfit.toFixed(2)}
              </p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle>Products</CardTitle>
                <CardDescription>Manage your product inventory</CardDescription>
              </div>
              <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                <DialogTrigger asChild>
                  <Button onClick={resetForm}>
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
                    <TableCell colSpan={8} className="text-center text-gray-500">
                      No products yet. Add your first product!
                    </TableCell>
                  </TableRow>
                ) : (
                  products.map((product) => (
                    <TableRow key={product.id}>
                      <TableCell className="font-medium">{product.name}</TableCell>
                      <TableCell className="text-right">{product.stock_grams.toFixed(2)}g</TableCell>
                      <TableCell className="text-right">${product.cost_per_gram.toFixed(2)}</TableCell>
                      <TableCell className="text-right">${product.price_per_gram.toFixed(2)}</TableCell>
                      <TableCell className="text-right">${calculateTotalCost(product).toFixed(2)}</TableCell>
                      <TableCell className="text-right">${calculateTotalValue(product).toFixed(2)}</TableCell>
                      <TableCell className={`text-right font-semibold ${calculateProfit(product) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        ${calculateProfit(product).toFixed(2)}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="ghost" size="icon" onClick={() => openEditDialog(product)}>
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => handleDeleteProduct(product.id)}>
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
      </div>
    </div>
  )
}
