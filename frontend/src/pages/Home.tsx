import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Sparkles, Leaf, Zap, ArrowRight } from "lucide-react"
import { Link } from "react-router-dom"

export function Home() {
  return (
    <div className="space-y-10">
      <section className="relative overflow-hidden rounded-2xl border bg-gradient-to-b from-white via-white to-slate-50/60 shadow-sm">
        {/* subtle futuristic blobs */}
        <div className="pointer-events-none absolute -top-24 -left-24 h-72 w-72 rounded-full bg-sky-200/30 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-28 -right-20 h-80 w-80 rounded-full bg-indigo-200/25 blur-3xl" />

        <div className="relative px-8 py-14 sm:px-12 sm:py-16">
          <div className="mx-auto max-w-3xl text-center space-y-6">
            <div className="inline-flex items-center gap-2 rounded-full border bg-white/70 px-4 py-1.5 text-sm text-slate-600 shadow-sm">
              <Sparkles className="h-4 w-4" />
              现代工艺 · 传统味道 · 每日新鲜
            </div>

            <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 sm:text-6xl">
              新鲜出炉，<span className="text-primary">每日限定</span>
            </h1>

            <p className="mx-auto max-w-2xl text-base leading-relaxed text-slate-600 sm:text-lg">
              欢迎来到小爽子包子铺。用心手工制作，匠心蒸制；在轻盈留白的界面里，快速完成选购与下单。
            </p>

            <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Button size="lg" asChild className="w-full sm:w-auto">
                <Link to="/shop">
                  立即下单 <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild className="w-full sm:w-auto bg-white/60">
                <Link to="/messages">去留言板看看</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {[
          {
            icon: Leaf,
            title: "新鲜食材",
            desc: "每日清晨严选本地食材，低负担更安心。",
          },
          {
            icon: Sparkles,
            title: "传统工艺",
            desc: "发面、拌馅、蒸制三段把控，口感更稳定。",
          },
          {
            icon: Zap,
            title: "闪电出餐",
            desc: "下单后同步出餐状态，热腾腾更及时。",
          },
        ].map((f, i) => {
          const Icon = f.icon
          return (
            <Card
              key={i}
              className="group bg-white/80 backdrop-blur transition-all hover:-translate-y-0.5 hover:shadow-md"
            >
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="rounded-xl border bg-gradient-to-b from-slate-50 to-white p-3 shadow-sm">
                    <Icon className="h-5 w-5 text-slate-700" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-base font-semibold text-slate-900">{f.title}</h3>
                    <p className="text-sm leading-relaxed text-slate-600">{f.desc}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </section>
    </div>
  )
}
