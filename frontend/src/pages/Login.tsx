import { useState } from "react"
import { useNavigate, Link } from "react-router-dom"
import axios from "axios"
import { toast } from "sonner"
import { useStore } from "@/store/useStore"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

export function Login() {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const navigate = useNavigate()
  const login = useStore((state) => state.login)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      // In dev, vite proxy or full URL. Docker compose maps backend to 8972. 
      // We'll use relative path '/api' and assume proxy is set up in vite.config or full URL.
      // For now, let's use full URL from env or default to localhost:8972
      const API_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8972/api"
      
      const res = await axios.post(`${API_URL}/login`, { username, password })
      if (res.data.user) {
        login(res.data.user)
        toast.success("欢迎回来！", { description: `当前登录身份：${res.data.user.username}` })
        navigate(res.data.user.role === 'admin' ? '/admin' : '/')
      }
    } catch (error: any) {
      const errorMsg = error.response?.data?.error || "登录失败，请稍后重试"
      toast.error("登录失败", { description: errorMsg })
    }
  }

  return (
    <div className="flex items-center justify-center py-12">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>登录</CardTitle>
          <CardDescription>请输入您的账号信息访问您的账户</CardDescription>
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
            <Button type="submit" className="w-full">登 录</Button>
            <Button type="button" variant="outline" className="w-full" onClick={() => {
                login({ id: 0, username: '游客用户', email: '', role: 'guest' })
                navigate('/')
            }}>
                游客登录
            </Button>
            <div className="text-sm text-center text-muted-foreground">
              还没有账号？ <Link to="/register" className="text-primary hover:underline">立即注册</Link>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
