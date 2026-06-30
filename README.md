# M122 專案與營收管理平台

以「營收管理」為核心的內部專案管理平台，整合商機 Pipeline、報價、專案執行、轉撥與毛利分析。

## 技術棧

- **Frontend**: Next.js 16、React、TypeScript、TailwindCSS、TanStack Query、Zustand、Recharts
- **Backend**: Next.js API Routes、Prisma ORM
- **Database**: PostgreSQL（建議使用 [Neon](https://neon.tech)）
- **Auth**: JWT + RBAC（Admin / Sales / PM / RD / Finance）
- **Deploy**: Vercel

## 功能模組

| 模組 | 說明 |
|------|------|
| Pipeline | 商機管理、預估營收計算 |
| Quotation | 多版本報價、內部成本分離 |
| Project | 成交後專案、收入/成本追蹤 |
| Task | Kanban 任務看板 |
| Work Order | 工作支援單 |
| Transfer | 多次轉撥紀錄 |
| Dashboard | 營收、毛利、轉撥統計圖表 |

## 本地開發

```bash
# 1. 安裝依賴
npm install

# 2. 設定環境變數（複製範例檔）
cp .env.example .env
# 編輯 .env，填入 DATABASE_URL 與 JWT 密鑰

# 3. 同步資料庫結構
npx prisma db push

# 4. 填入測試資料
npm run db:seed

# 5. 啟動開發伺服器
npm run dev
```

開啟 http://localhost:3000/login

### 測試帳號（密碼皆為 `password123`）

| 角色 | Email |
|------|-------|
| 管理員 | admin@m122.com |
| 業務 | sales@m122.com |
| 專案經理 | pm@m122.com |
| 研發 | rd@m122.com |
| 財務 | finance@m122.com |

## Neon 資料庫設定

1. 前往 [Neon Console](https://console.neon.tech) 建立新專案
2. 在 **Connection Details** 複製 PostgreSQL 連線字串（需含 `?sslmode=require`）
3. 格式範例：
   ```
   postgresql://user:password@ep-xxx.region.aws.neon.tech/neondb?sslmode=require
   ```

## Vercel 部署

### 方式一：GitHub 整合（建議）

1. 將程式碼推送到 GitHub
2. 前往 [Vercel Dashboard](https://vercel.com/new) 匯入此 Repository
3. 在 **Environment Variables** 設定：

| 變數 | 說明 |
|------|------|
| `DATABASE_URL` | Neon PostgreSQL 連線字串 |
| `JWT_SECRET` | JWT 簽章密鑰（至少 32 字元隨機字串） |
| `JWT_REFRESH_SECRET` | Refresh Token 密鑰（至少 32 字元隨機字串） |

4. 點擊 **Deploy**（build 會自動執行 `prisma db push` 同步資料表）
5. 部署完成後，在本機執行 seed 寫入初始資料：
   ```bash
   DATABASE_URL="你的 Neon 連線字串" npm run db:seed
   ```

### 方式二：Vercel CLI

```bash
npx vercel login
npx vercel link
npx vercel env add DATABASE_URL
npx vercel env add JWT_SECRET
npx vercel env add JWT_REFRESH_SECRET
npx vercel --prod
```

## 專案結構

```
src/
├── app/
│   ├── (dashboard)/     # 主要功能頁面
│   ├── api/             # REST API
│   └── login/           # 登入頁
├── components/          # UI 元件
└── lib/                 # 工具、認證、Prisma
prisma/
├── schema.prisma        # 資料模型
└── seed.ts              # 測試資料
```

## 業務流程

```
Pipeline (商機) → Quotation (報價) → Project (成交) → Task / Work Order
                                                          ↓
                                                    Transfer (轉撥)
                                                          ↓
                                                       Close
```

詳細需求請參閱 [SPEC.md](./SPEC.md)。
