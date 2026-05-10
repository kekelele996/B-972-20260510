# 小爽子包子铺（BunShop）

一个基于 **React + PHP + MySQL** 的全栈电商小项目：商城浏览、购物车弹窗操作、留言板、后台商品管理、订单出餐管理。

## ✨ 本次更新亮点 (Label-972 修复)

1.  **实物图片同步**：商品图片已替换为真实的包子实物图，提升视觉真实感。
2.  **购物车数量调节**：购物车支持直接通过 `+` / `-` 按钮修改商品数量，操作更丝滑。
3.  **精确登录反馈**：登录失败逻辑区分“用户名不存在”与“密码错误”，提升用户引导体验。
4.  **商品管理增强**：后台商品编辑对话框集成了“推荐图片”快速选择器，支持一键关联包子预览图。
5.  **安全配置同步**：统一了容器环境与应用层的数据库 root 密码配置（已修改为 `root`）。

## 🛠 技术栈

- **Frontend**: React, TypeScript, TailwindCSS, Radix UI, Zustand, Vite
- **Backend**: PHP 8.2 (Pure, No Framework), Nginx, Composer
- **ORM**: Eloquent ORM (Illuminate Database)
- **Database**: MySQL 8.0
- **Infrastructure**: Docker, Docker Compose

## 🚀 Docker 一键启动

在本目录下执行：

```bash
# 情况 1：首次启动
docker-compose up -d --build

# 情况 2：若需应用最新的数据库/密码配置（清理旧卷并重建）
docker-compose down -v
docker-compose up -d --build
```

访问：

- **前端**：`http://localhost:972`
- **后端 API**：`http://localhost:8972/api`

## 🔑 账号配置说明

### 数据库账号

- **MySQL Root 密码**: `root`
- **应用数据库用户**：`user`
- **应用数据库密码**：`root`
- **数据库名**：`bunshop`

### 系统测试账号

| 角色 | 用户名 | 密码 |
|---|---|---|
| 管理员 | `admin` | `root123` |
| 普通用户 | `testuser` | `123456` |

## 📂 项目结构

```
label-972/
├── frontend/
│   ├── public/images/          # 商品实物预设图片
│   └── src/
│       ├── components/Navbar.tsx # 包含数量增减逻辑的购物车
│       ├── store/useStore.ts    # 数量更新接口定义
│       └── pages/Admin.tsx      # 图片快速选择器后台
├── backend/
│   ├── src/Controllers/Auth.php # 精确错误反馈逻辑
├── database/init.sql            # 已置入实物图路径
└── docker-compose.yml          # 已修正为 root/root 配置
```

## 🔌 API

- `POST /api/login` (返回特定错误文本)
- `POST /api/register`
- `GET/POST/PUT/DELETE /api/products`
- `GET/POST /api/messages`
- `GET/POST/PUT /api/orders`
