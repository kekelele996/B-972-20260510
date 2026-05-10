import { useEffect, useState } from "react"
import axios from "axios"
import { useStore } from "@/store/useStore"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { toast } from "sonner"
import { Trash2 } from "lucide-react"

interface Message {
  id: number
  username: string
  content: string
  created_at: string
}

export function Messages() {
  const [messages, setMessages] = useState<Message[]>([])
  const [content, setContent] = useState("")
  const { user } = useStore()
  const API_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8972/api"
  
  // 确认对话框状态
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean
    message: string
    onConfirm: () => void
  }>({
    open: false,
    message: "",
    onConfirm: () => {}
  })

  const fetchMessages = async () => {
    try {
      const res = await axios.get(`${API_URL}/messages`)
      setMessages(res.data)
    } catch (error) {
      toast.error("加载留言失败")
    }
  }

  useEffect(() => {
    fetchMessages()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!content.trim()) return

    try {
      await axios.post(`${API_URL}/messages`, {
        user_id: user?.id || null,
        username: user?.username || "游客",
        content
      })
      toast.success("留言已发布")
      setContent("")
      fetchMessages()
    } catch (error) {
      toast.error("发布留言失败")
    }
  }

  const handleDelete = async (id: number) => {
    setConfirmDialog({
      open: true,
      message: "确定要删除这条留言吗？",
      onConfirm: async () => {
        try {
          await axios.delete(`${API_URL}/messages?id=${id}`)
          toast.success("留言已删除")
          fetchMessages()
          setConfirmDialog({ open: false, message: "", onConfirm: () => {} })
        } catch (error) {
          toast.error("删除失败")
          setConfirmDialog({ open: false, message: "", onConfirm: () => {} })
        }
      }
    })
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="text-center">
        <h2 className="text-3xl font-bold">留言板</h2>
        <p className="text-muted-foreground mt-2">给大厨或者其他食客留个言吧！</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>发表留言</CardTitle>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent>
            <Input 
              placeholder="在此输入您的留言..." 
              value={content} 
              onChange={(e) => setContent(e.target.value)} 
              required
            />
          </CardContent>
          <CardFooter>
            <Button type="submit">发布留言</Button>
          </CardFooter>
        </form>
      </Card>

      <div className="grid gap-4">
        {messages.map((msg) => (
          <Card key={msg.id}>
            <CardHeader className="py-4">
              <div className="flex justify-between items-center">
                <span className="font-semibold text-primary">{msg.username}</span>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">{new Date(msg.created_at).toLocaleString()}</span>
                  {user?.role === 'admin' && (
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={() => handleDelete(msg.id)}
                      className="h-8 w-8"
                    >
                      <Trash2 className="w-4 h-4 text-red-500"/>
                    </Button>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent className="py-2 pb-4">
              <p>{msg.content}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* 确认对话框 */}
      <Dialog open={confirmDialog.open} onOpenChange={(open) => {
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
