import { Link, useNavigate } from "react-router-dom"
import { useStore } from "@/store/useStore"
import { Button } from "@/components/ui/button"
import { ShoppingCart, LogOut, User as UserIcon, Trash2, Plus, Minus } from "lucide-react"
import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog"
import { toast } from "sonner"
import axios from "axios"

export function Navbar() {
  const { user, cart, logout, removeFromCart, updateCartQuantity, clearCart } = useStore()
  const navigate = useNavigate()
  const [isOpen, setIsOpen] = useState(false)
  const API_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8972/api"

  const handleLogout = () => {
    logout()
    navigate("/login")
  }

  const cartCount = cart.reduce((acc, item) => acc + item.quantity, 0)
  const total = cart.reduce((acc, item) => {
    const effectivePrice = item.discount_price != null ? item.discount_price : item.price
    return acc + effectivePrice * item.quantity
  }, 0)

  const handleCheckout = async () => {
    try {
      if (!user) return
      await axios.post(`${API_URL}/orders`, {
        user_id: user.id,
        items: cart,
        total_price: total
      })
      toast.success("下单成功！", {
        description: "您已下单成功，等待出餐"
      })
      clearCart()
      setIsOpen(false)
    } catch (error: any) {
      const message =
        error?.response?.data?.error ||
        error?.response?.data?.message ||
        "请稍后重试"
      toast.error("结账失败", { description: message })
    }
  }

  return (
    <nav className="border-b bg-white shadow-sm">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link to="/" className="text-xl font-bold text-gray-800">
          小爽子包子铺
        </Link>

        <div className="flex items-center gap-4">
          <Link to="/" className="text-sm font-medium hover:text-primary">
            首页
          </Link>
          <Link to="/shop" className="text-sm font-medium hover:text-primary">
            商城
          </Link>
          <Link to="/messages" className="text-sm font-medium hover:text-primary">
            留言板
          </Link>
          {user && (
            <Link to="/orders" className="text-sm font-medium hover:text-primary">
              我的订单
            </Link>
          )}

          {user?.role === "admin" && (
            <Link to="/admin" className="text-sm font-medium hover:text-primary">
              管理后台
            </Link>
          )}
        </div>

        <div className="flex items-center gap-4">
          {user ? (
            <>
              <span className="text-sm text-gray-600 flex items-center gap-2">
                <UserIcon className="w-4 h-4" />
                {user.username}
              </span>

              <Dialog open={isOpen} onOpenChange={setIsOpen}>
                <DialogTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <div className="relative">
                       <ShoppingCart className="w-5 h-5" />
                       {cartCount > 0 && (
                           <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center">
                               {cartCount}
                           </span>
                       )}
                    </div>
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                  <DialogHeader>
                    <DialogTitle>购物车</DialogTitle>
                  </DialogHeader>
                  <div className="py-4 space-y-4 max-h-[60vh] overflow-y-auto">
                    {cart.length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground">您的购物车是空的</div>
                    ) : (
                      cart.map((item) => (
                        <div key={item.id} className="flex items-center justify-between border-b pb-2">
                          <div>
                            <p className="font-medium">{item.name}</p>
                            <div className="flex items-center gap-2 mt-1">
                                <Button 
                                    variant="outline" 
                                    size="icon" 
                                    className="h-6 w-6" 
                                    onClick={() => updateCartQuantity(item.id, item.quantity - 1)}
                                >
                                    <Minus className="w-3 h-3" />
                                </Button>
                                <span className="text-sm w-4 text-center">{item.quantity}</span>
                                <Button 
                                    variant="outline" 
                                    size="icon" 
                                    className="h-6 w-6" 
                                    onClick={() => updateCartQuantity(item.id, item.quantity + 1)}
                                >
                                    <Plus className="w-3 h-3" />
                                </Button>
                                {item.discount_price != null ? (
                                  <span className="text-xs ml-2">
                                    <span className="text-muted-foreground line-through">¥{item.price.toFixed(2)}</span>
                                    <span className="text-red-500 ml-1">¥{item.discount_price.toFixed(2)}</span>
                                  </span>
                                ) : (
                                  <span className="text-xs text-muted-foreground ml-2">x ¥{item.price.toFixed(2)}</span>
                                )}
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold">¥{((item.discount_price != null ? item.discount_price : item.price) * item.quantity).toFixed(2)}</span>
                            <Button variant="ghost" size="icon" onClick={() => removeFromCart(item.id)}>
                              <Trash2 className="w-4 h-4 text-red-500" />
                            </Button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                  {cart.length > 0 && (
                    <>
                      <div className="flex justify-between text-lg font-bold">
                        <span>总计</span>
                        <span>¥{total.toFixed(2)}</span>
                      </div>
                      <DialogFooter>
                        <Button className="w-full" onClick={handleCheckout}>立即结账</Button>
                      </DialogFooter>
                    </>
                  )}
                </DialogContent>
              </Dialog>

              <Button variant="outline" size="sm" onClick={handleLogout}>
                <LogOut className="w-4 h-4 mr-2" />
                退出登录
              </Button>
            </>
          ) : (
            <div className="flex gap-2">
              <Button variant="ghost" asChild>
                <Link to="/login">登录</Link>
              </Button>
              <Button asChild>
                <Link to="/register">注册</Link>
              </Button>
            </div>
          )}
        </div>
      </div>
    </nav>
  )
}
