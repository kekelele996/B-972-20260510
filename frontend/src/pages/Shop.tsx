import { useEffect, useState } from "react"
import axios from "axios"
import { useStore } from "@/store/useStore"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "sonner"

interface Product {
  id: number
  name: string
  description: string
  price: number
  image_url: string
  stock: number
}

export function Shop() {
  const [products, setProducts] = useState<Product[]>([])
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [loading, setLoading] = useState(false)
  const { addToCart } = useStore()

  const fetchProducts = async (currentPage: number) => {
    setLoading(true)
    try {
      const API_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8972/api"
      const res = await axios.get(`${API_URL}/products?page=${currentPage}&limit=6`)
      if (res.data && res.data.products) {
        setProducts(res.data.products)
        setTotalPages(res.data.total_pages)
      } else {
        setProducts(res.data)
      }
    } catch (error) {
      console.error("Failed to fetch products", error)
      toast.error("加载商品失败")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchProducts(page)
  }, [page])

  const handleAddToCart = (product: Product) => {
    addToCart(product)
    toast.success(`已将 ${product.name} 加入购物车`)
  }

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h2 className="text-3xl font-bold tracking-tight">美味菜单</h2>
        <p className="text-muted-foreground mt-2">匠心手工制作，满足您的各种口味需求。</p>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((product) => (
              <Card key={product.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                <div className="aspect-video w-full overflow-hidden bg-gray-100">
                  <img 
                    src={product.image_url || "https://via.placeholder.com/300x200?text=Bun"} 
                    alt={product.name}
                    className="w-full h-full object-cover transition-transform hover:scale-105"
                  />
                </div>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <CardTitle>{product.name}</CardTitle>
                    <span className="font-bold text-primary">¥{Number(product.price).toFixed(2)}</span>
                  </div>
                  <CardDescription>{product.description}</CardDescription>
                </CardHeader>
                <CardFooter>
                  <Button 
                    className="w-full" 
                    onClick={() => handleAddToCart(product)} 
                    disabled={product.stock <= 0 || !useStore.getState().user}
                  >
                    {!useStore.getState().user ? "请登录后购买" : (product.stock > 0 ? "加入购物车" : "暂时无货")}
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>

          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-4 mt-8">
              <Button 
                variant="outline" 
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
              >
                上一页
              </Button>
              <span className="text-sm font-medium">
                第 {page} 页，共 {totalPages} 页
              </span>
              <Button 
                variant="outline" 
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
              >
                下一页
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  )
}
