import { useEffect, useState } from "react"
import axios from "axios"
import { useStore } from "@/store/useStore"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { toast } from "sonner"
import { Pencil, Trash2, Plus, Package, CheckCircle2, Tag } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"

interface Product {
  id: number
  name: string
  description: string
  price: number
  image_url: string
  stock: number
}

interface OrderItem {
  id: number;
  product_id: number;
  product_name: string;
  quantity: number;
  price: string;
  image_url: string;
}

interface Order {
  id: number;
  user_id: number | null;
  customer_name: string | null;
  total_price: string;
  status: 'pending' | 'completed' | 'cancelled';
  created_at: string;
  items: OrderItem[];
}

interface Promotion {
  id: number
  product_id: number
  product_name: string | null
  original_price: string | null
  discount_price: string
  start_time: string
  end_time: string
  is_active: boolean
  created_at: string
}

export function Admin() {
  const [products, setProducts] = useState<Product[]>([])
  const [orders, setOrders] = useState<Order[]>([])
  const [promotions, setPromotions] = useState<Promotion[]>([])
  const [allProducts, setAllProducts] = useState<Product[]>([])
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isPromoDialogOpen, setIsPromoDialogOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [editingPromotion, setEditingPromotion] = useState<Promotion | null>(null)
  
  // Confirmation Dialog State
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean
    message: string
    onConfirm: () => void
  }>({
    open: false,
    message: "",
    onConfirm: () => {}
  })
  
  // Form State
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    image_url: "",
    stock: ""
  })

  const [promoFormData, setPromoFormData] = useState({
    product_id: "",
    discount_price: "",
    start_time: "",
    end_time: ""
  })

  // Pagination for products
  const [productPage, setProductPage] = useState(1)
  const [productTotalPages, setProductTotalPages] = useState(1)
  const [productLimit] = useState(10)

  // Bulk Selection
  const [selectedIds, setSelectedIds] = useState<number[]>([])

  // Pagination for orders
  const [orderPage, setOrderPage] = useState(1)
  const [orderTotalPages, setOrderTotalPages] = useState(1)
  const [orderLimit] = useState(10)

  const toggleSelect = (id: number) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    )
  }

  const { user } = useStore()
  const API_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8972/api"

  const fetchProducts = async (page = productPage) => {
    try {
      const res = await axios.get(`${API_URL}/products?page=${page}&limit=${productLimit}`)
      if (res.data && res.data.products) {
        setProducts(res.data.products)
        setProductTotalPages(res.data.total_pages)
      } else {
        setProducts(res.data)
      }
    } catch (error) {
      toast.error("加载商品失败")
    }
  }

  const fetchOrders = async (page = orderPage) => {
    try {
      const res = await axios.get(`${API_URL}/orders?page=${page}&limit=${orderLimit}`)
      if (res.data && res.data.orders) {
        setOrders(res.data.orders)
        setOrderTotalPages(res.data.total_pages)
      } else {
        setOrders(res.data)
      }
    } catch (error) {
      toast.error("加载订单失败")
    }
  }

  const fetchPromotions = async () => {
    try {
      const res = await axios.get(`${API_URL}/promotions`)
      setPromotions(res.data)
    } catch (error) {
      toast.error("加载促销活动失败")
    }
  }

  const fetchAllProducts = async () => {
    try {
      const res = await axios.get(`${API_URL}/products`)
      if (res.data && res.data.products) {
        setAllProducts(res.data.products)
      } else {
        setAllProducts(res.data)
      }
    } catch (error) {
      toast.error("加载商品列表失败")
    }
  }

  useEffect(() => {
    if (user?.role === 'admin') {
      fetchProducts(productPage)
      fetchOrders(orderPage)
      fetchPromotions()
    }
  }, [user, productPage, orderPage])

  const handleDelete = async (id: number) => {
    setConfirmDialog({
      open: true,
      message: "确定要删除该商品吗？",
      onConfirm: async () => {
        try {
          await axios.delete(`${API_URL}/products?id=${id}`)
          toast.success("商品已删除")
          fetchProducts()
          setConfirmDialog({ open: false, message: "", onConfirm: () => {} })
        } catch (error) {
          toast.error("删除失败")
          setConfirmDialog({ open: false, message: "", onConfirm: () => {} })
        }
      }
    })
  }

  const handleBulkDelete = async () => {
    setConfirmDialog({
      open: true,
      message: `确定要删除选中的 ${selectedIds.length} 个商品吗？`,
      onConfirm: async () => {
        try {
          await axios.delete(`${API_URL}/products`, { data: { ids: selectedIds } })
          toast.success("选中的商品已删除")
          setSelectedIds([])
          fetchProducts()
          setConfirmDialog({ open: false, message: "", onConfirm: () => {} })
        } catch (error) {
          toast.error("批量删除失败")
          setConfirmDialog({ open: false, message: "", onConfirm: () => {} })
        }
      }
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const payload = {
        ...formData,
        price: Number(formData.price),
        stock: Number(formData.stock)
      }
      
      if (editingProduct) {
        await axios.put(`${API_URL}/products?id=${editingProduct.id}`, payload)
        toast.success("商品已更新")
      } else {
        await axios.post(`${API_URL}/products`, payload)
        toast.success("商品已创建")
      }
      setIsDialogOpen(false)
      setEditingProduct(null)
      setFormData({ name: "", description: "", price: "", image_url: "", stock: "" })
      fetchProducts()
    } catch (error) {
      toast.error("操作失败")
    }
  }

  const updateOrderStatus = async (id: number, status: string) => {
    try {
      await axios.put(`${API_URL}/orders`, { id, status })
      toast.success("订单状态已更新")
      fetchOrders()
      fetchProducts() // Stock might have changed if we implement stock return on cancellation (not yet)
    } catch (error) {
      toast.error("更新失败")
    }
  }

  const openEdit = (product: Product) => {
    setEditingProduct(product)
    setFormData({
      name: product.name,
      description: product.description,
      price: String(product.price),
      image_url: product.image_url,
      stock: String(product.stock)
    })
    setIsDialogOpen(true)
  }

  const openCreate = () => {
    setEditingProduct(null)
    setFormData({ name: "", description: "", price: "", image_url: "", stock: "" })
    setIsDialogOpen(true)
  }

  const handlePromoSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const payload = {
        product_id: Number(promoFormData.product_id),
        discount_price: Number(promoFormData.discount_price),
        start_time: promoFormData.start_time,
        end_time: promoFormData.end_time,
      }
      if (editingPromotion) {
        await axios.put(`${API_URL}/promotions?id=${editingPromotion.id}`, payload)
        toast.success("促销活动已更新")
      } else {
        await axios.post(`${API_URL}/promotions`, payload)
        toast.success("促销活动已创建")
      }
      setIsPromoDialogOpen(false)
      setEditingPromotion(null)
      setPromoFormData({ product_id: "", discount_price: "", start_time: "", end_time: "" })
      fetchPromotions()
    } catch (error: any) {
      const msg = error?.response?.data?.error || "操作失败"
      toast.error(msg)
    }
  }

  const handlePromoDelete = async (id: number) => {
    setConfirmDialog({
      open: true,
      message: "确定要删除该促销活动吗？",
      onConfirm: async () => {
        try {
          await axios.delete(`${API_URL}/promotions?id=${id}`)
          toast.success("促销活动已删除")
          fetchPromotions()
          setConfirmDialog({ open: false, message: "", onConfirm: () => {} })
        } catch (error) {
          toast.error("删除失败")
          setConfirmDialog({ open: false, message: "", onConfirm: () => {} })
        }
      }
    })
  }

  const openPromoCreate = async () => {
    await fetchAllProducts()
    setEditingPromotion(null)
    setPromoFormData({ product_id: "", discount_price: "", start_time: "", end_time: "" })
    setIsPromoDialogOpen(true)
  }

  const openPromoEdit = async (promo: Promotion) => {
    await fetchAllProducts()
    setEditingPromotion(promo)
    setPromoFormData({
      product_id: String(promo.product_id),
      discount_price: String(promo.discount_price),
      start_time: promo.start_time.slice(0, 16),
      end_time: promo.end_time.slice(0, 16),
    })
    setIsPromoDialogOpen(true)
  }



  if (user?.role !== 'admin') {
    return <div className="text-center py-20 text-red-500 font-bold">权限不足</div>
  }

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold">后台管理</h2>

      <Tabs defaultValue="products">
        <TabsList className="mb-4">
          <TabsTrigger value="products">商品管理</TabsTrigger>
          <TabsTrigger value="promotions">限时特价</TabsTrigger>
          <TabsTrigger value="orders">订单管理</TabsTrigger>
        </TabsList>

        <TabsContent value="products">
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-xl font-bold">商品管理</h3>
              <div className="flex gap-2">
                {selectedIds.length > 0 && (
                   <Button variant="destructive" onClick={handleBulkDelete}>
                     批量删除 ({selectedIds.length})
                   </Button>
                )}
                <Button onClick={openCreate}><Plus className="w-4 h-4 mr-2"/> 添加商品</Button>
              </div>
            </div>

            <div className="border rounded-md bg-white">
              <table className="w-full text-sm text-left">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="p-4 w-10">
                      <input 
                        type="checkbox" 
                        onChange={(e) => {
                          if (e.target.checked) setSelectedIds(products.map(p => p.id))
                          else setSelectedIds([])
                        }}
                        checked={selectedIds.length === products.length && products.length > 0}
                      />
                    </th>
                    <th className="p-4">名称</th>
                    <th className="p-4">价格</th>
                    <th className="p-4">库存</th>
                    <th className="p-4 text-right">操作</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map(product => (
                    <tr key={product.id} className="border-b hover:bg-gray-50">
                      <td className="p-4">
                        <input 
                          type="checkbox" 
                          checked={selectedIds.includes(product.id)}
                          onChange={() => toggleSelect(product.id)}
                        />
                      </td>
                      <td className="p-4 font-medium">{product.name}</td>
                      <td className="p-4">¥{Number(product.price).toFixed(2)}</td>
                      <td className="p-4">{product.stock}</td>
                      <td className="p-4 text-right flex justify-end gap-2">
                        <Button variant="ghost" size="icon" onClick={() => openEdit(product)}>
                          <Pencil className="w-4 h-4 text-blue-500"/>
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDelete(product.id)}>
                          <Trash2 className="w-4 h-4 text-red-500"/>
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {productTotalPages > 1 && (
                <div className="flex justify-center items-center gap-4 p-4 border-t">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setProductPage(p => Math.max(1, p - 1))}
                    disabled={productPage === 1}
                  >
                    上一页
                  </Button>
                  <span className="text-xs font-medium">
                    第 {productPage} 页，共 {productTotalPages} 页
                  </span>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setProductPage(p => Math.min(productTotalPages, p + 1))}
                    disabled={productPage === productTotalPages}
                  >
                    下一页
                  </Button>
                </div>
              )}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="promotions">
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-xl font-bold">限时特价</h3>
              <Button onClick={openPromoCreate}><Plus className="w-4 h-4 mr-2"/> 添加促销</Button>
            </div>

            <div className="border rounded-md bg-white">
              <table className="w-full text-sm text-left">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="p-4">商品</th>
                    <th className="p-4">原价</th>
                    <th className="p-4">折扣价</th>
                    <th className="p-4">开始时间</th>
                    <th className="p-4">结束时间</th>
                    <th className="p-4">状态</th>
                    <th className="p-4 text-right">操作</th>
                  </tr>
                </thead>
                <tbody>
                  {promotions.map(promo => (
                    <tr key={promo.id} className="border-b hover:bg-gray-50">
                      <td className="p-4 font-medium">{promo.product_name || `商品#${promo.product_id}`}</td>
                      <td className="p-4">¥{promo.original_price ? Number(promo.original_price).toFixed(2) : '-'}</td>
                      <td className="p-4 text-red-500 font-medium">¥{Number(promo.discount_price).toFixed(2)}</td>
                      <td className="p-4 text-xs">{new Date(promo.start_time).toLocaleString()}</td>
                      <td className="p-4 text-xs">{new Date(promo.end_time).toLocaleString()}</td>
                      <td className="p-4">
                        {promo.is_active ? (
                          <Badge variant="outline" className="text-green-600 border-green-600 bg-green-50">进行中</Badge>
                        ) : (
                          <Badge variant="outline" className="text-gray-500 border-gray-300 bg-gray-50">未开始/已结束</Badge>
                        )}
                      </td>
                      <td className="p-4 text-right flex justify-end gap-2">
                        <Button variant="ghost" size="icon" onClick={() => openPromoEdit(promo)}>
                          <Pencil className="w-4 h-4 text-blue-500"/>
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handlePromoDelete(promo.id)}>
                          <Trash2 className="w-4 h-4 text-red-500"/>
                        </Button>
                      </td>
                    </tr>
                  ))}
                  {promotions.length === 0 && (
                    <tr>
                      <td colSpan={7} className="p-8 text-center text-gray-500">
                        <Tag className="w-8 h-8 mx-auto mb-2 opacity-20"/>
                        暂无促销活动
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="orders">
          <div className="space-y-6">
            <h3 className="text-xl font-bold">订单流水</h3>
            
            <div className="border rounded-md bg-white">
              <table className="w-full text-sm text-left">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="p-4">订单ID</th>
                    <th className="p-4">顾客</th>
                    <th className="p-4">商品详情</th>
                    <th className="p-4">总额</th>
                    <th className="p-4">状态</th>
                    <th className="p-4 text-right">管理</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map(order => (
                    <tr key={order.id} className="border-b hover:bg-gray-50 align-top">
                      <td className="p-4">#{order.id}</td>
                      <td className="p-4">
                        <div className="flex flex-col">
                          <span className="font-medium">{order.customer_name || '游客'}</span>
                          <span className="text-xs text-gray-500">{new Date(order.created_at).toLocaleString()}</span>
                        </div>
                      </td>
                      <td className="p-4">
                        <ul className="list-disc list-inside text-xs">
                          {order.items.map(item => (
                            <li key={item.id}>{item.product_name} x {item.quantity}</li>
                          ))}
                        </ul>
                      </td>
                      <td className="p-4 font-medium">¥{parseFloat(order.total_price).toFixed(2)}</td>
                      <td className="p-4">
                        {order.status === 'pending' && <Badge variant="outline" className="text-yellow-600 border-yellow-600 bg-yellow-50">待出餐</Badge>}
                        {order.status === 'completed' && <Badge variant="outline" className="text-green-600 border-green-600 bg-green-50">已出餐</Badge>}
                        {order.status === 'cancelled' && <Badge variant="outline" className="text-red-600 border-red-600 bg-red-50">已取消</Badge>}
                      </td>
                      <td className="p-4 text-right space-x-2">
                        {order.status === 'pending' && (
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="text-green-600 border-green-600 hover:bg-green-50"
                            onClick={() => updateOrderStatus(order.id, 'completed')}
                          >
                            <CheckCircle2 className="w-4 h-4 mr-1"/> 出餐完成
                          </Button>
                        )}
                      </td>
                    </tr>
                  ))}
                  {orders.length === 0 && (
                    <tr>
                      <td colSpan={6} className="p-8 text-center text-gray-500">
                        <Package className="w-8 h-8 mx-auto mb-2 opacity-20"/>
                        暂无订单记录
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
              {orderTotalPages > 1 && (
                <div className="flex justify-center items-center gap-4 p-4 border-t">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setOrderPage(p => Math.max(1, p - 1))}
                    disabled={orderPage === 1}
                  >
                    上一页
                  </Button>
                  <span className="text-xs font-medium">
                    第 {orderPage} 页，共 {orderTotalPages} 页
                  </span>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setOrderPage(p => Math.min(orderTotalPages, p + 1))}
                    disabled={orderPage === orderTotalPages}
                  >
                    下一页
                  </Button>
                </div>
              )}
            </div>
          </div>
        </TabsContent>
      </Tabs>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{editingProduct ? "编辑商品" : "添加商品"}</DialogTitle>
            <DialogDescription>
              在此处更新您的商品信息。
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4 py-4">
             <div className="space-y-2">
               <Label>名称</Label>
               <Input value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required />
             </div>
             <div className="space-y-2">
               <Label>描述</Label>
               <Input value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} />
             </div>
             <div className="grid grid-cols-2 gap-4">
               <div className="space-y-2">
                 <Label>价格 (¥)</Label>
                 <Input type="number" step="0.01" value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} required />
               </div>
               <div className="space-y-2">
                 <Label>库存</Label>
                 <Input type="number" value={formData.stock} onChange={e => setFormData({...formData, stock: e.target.value})} required />
               </div>
             </div>
             <div className="space-y-2">
               <Label>图片链接</Label>
               <div className="space-y-4">
                 <Input value={formData.image_url} onChange={e => setFormData({...formData, image_url: e.target.value})} placeholder="输入链接或选择下方图片" />
                 <div className="flex gap-4">
                   <button type="button" onClick={() => setFormData({...formData, image_url: '/images/meat_bun.png'})} className={`h-16 w-16 border-2 rounded p-1 ${formData.image_url === '/images/meat_bun.png' ? 'border-primary ring-2 ring-primary/20' : 'border-gray-200 hover:border-gray-300'}`}>
                     <img src="/images/meat_bun.png" alt="肉包" className="h-full w-full object-cover" />
                   </button>
                   <button type="button" onClick={() => setFormData({...formData, image_url: '/images/veggie_bun.png'})} className={`h-16 w-16 border-2 rounded p-1 ${formData.image_url === '/images/veggie_bun.png' ? 'border-primary ring-2 ring-primary/20' : 'border-gray-200 hover:border-gray-300'}`}>
                     <img src="/images/veggie_bun.png" alt="菜包" className="h-full w-full object-cover" />
                   </button>
                   <button type="button" onClick={() => setFormData({...formData, image_url: '/images/bean_bun.png'})} className={`h-16 w-16 border-2 rounded p-1 ${formData.image_url === '/images/bean_bun.png' ? 'border-primary ring-2 ring-primary/20' : 'border-gray-200 hover:border-gray-300'}`}>
                     <img src="/images/bean_bun.png" alt="豆沙" className="h-full w-full object-cover" />
                   </button>
                 </div>
               </div>
             </div>
             <DialogFooter>
               <Button type="submit">保存修改</Button>
             </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={isPromoDialogOpen} onOpenChange={setIsPromoDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{editingPromotion ? "编辑促销活动" : "添加促销活动"}</DialogTitle>
            <DialogDescription>
              设置限时特价折扣价和活动起止时间。
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handlePromoSubmit} className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>商品</Label>
              <select
                className="w-full border rounded-md px-3 py-2 text-sm"
                value={promoFormData.product_id}
                onChange={e => setPromoFormData({...promoFormData, product_id: e.target.value})}
                disabled={!!editingPromotion}
                required
              >
                <option value="">选择商品</option>
                {allProducts.map(p => (
                  <option key={p.id} value={p.id}>{p.name} (¥{Number(p.price).toFixed(2)})</option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label>折扣价 (¥)</Label>
              <Input
                type="number"
                step="0.01"
                value={promoFormData.discount_price}
                onChange={e => setPromoFormData({...promoFormData, discount_price: e.target.value})}
                required
              />
            </div>
            <div className="space-y-2">
              <Label>开始时间</Label>
              <Input
                type="datetime-local"
                value={promoFormData.start_time}
                onChange={e => setPromoFormData({...promoFormData, start_time: e.target.value})}
                required
              />
            </div>
            <div className="space-y-2">
              <Label>结束时间</Label>
              <Input
                type="datetime-local"
                value={promoFormData.end_time}
                onChange={e => setPromoFormData({...promoFormData, end_time: e.target.value})}
                required
              />
            </div>
            <DialogFooter>
              <Button type="submit">保存</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* 确认对话框 */}
      <Dialog open={confirmDialog.open} onOpenChange={(open: boolean) => {
        if (!open) {
          setConfirmDialog({ open: false, message: "", onConfirm: () => {} })
        }
      }}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>确认操作</DialogTitle>
            <DialogDescription>
              {confirmDialog.message}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setConfirmDialog({ open: false, message: "", onConfirm: () => {} })}
            >
              取消
            </Button>
            <Button 
              variant="destructive" 
              onClick={() => confirmDialog.onConfirm()}
            >
              确定
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
