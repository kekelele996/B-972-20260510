import { useState } from "react"
import { useNavigate, Link } from "react-router-dom"
import axios from "axios"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

export function Register() {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [email, setEmail] = useState("")
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const API_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8972/api"
      const res = await axios.post(`${API_URL}/register`, { username, password, email })
      toast.success("注册成功", { description: "您现在可以使用该账号登录。" })
      navigate("/login")
    } catch (error: any) {
      toast.error("注册失败", { description: error.response?.data?.error || "发生了一些错误" })
    }
  }

  return (
    <div className="flex items-center justify-center py-12">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>创建账户</CardTitle>
          <CardDescription>欢迎加入小爽子包子铺</CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">用户名</Label>
              <Input 
                id="username" 
                value={username} 
                onChange={(e) => setUsername(e.target.value)} 
                required 
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">电子邮箱</Label>
              <Input 
                id="email" 
                type="email" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                required 
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">密码</Label>
              <Input 
                id="password" 
                type="password" 
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                required 
              />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-4">
            <Button type="submit" className="w-full">注 册</Button>
            <div className="text-sm text-center text-muted-foreground">
              已有账号？ <Link to="/login" className="text-primary hover:underline">立即登录</Link>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
