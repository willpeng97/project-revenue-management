# M122 專案與營收管理平台

以「營收管理」為核心的內部專案管理平台，整合商機 Pipeline、報價、專案執行、轉撥與毛利分析。

## 技術棧

- **Frontend**: Next.js 16、React、TypeScript、TailwindCSS、TanStack Query、Zustand、Recharts
- **Backend**: Next.js API Routes、Prisma ORM
- **Database**: PostgreSQL（建議使用 [Neon](https://neon.tech)）
- **Auth**: [Clerk](https://clerk.com) + Microsoft Entra ID（Azure AD）SSO，搭配資料庫端 RBAC（Admin / Sales / PM / RD / Finance）
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
# 編輯 .env，填入 DATABASE_URL、Clerk 金鑰與 MICROSOFT_TENANT_ID

# 3. 同步資料庫結構
npx prisma db push

# 4. 啟動開發伺服器
npm run dev
```

開啟 http://localhost:3000/login，並使用公司 Microsoft 帳號登入。

> 首次以某個 Microsoft 帳號登入時，系統會自動在資料庫建立對應的 `User`（預設角色 `SALES`）。
> 角色（權限）儲存於資料庫，不存放於 Clerk；如需調整角色，請直接更新 `User.role` 欄位。

## 認證架構（Clerk + Microsoft Entra ID）

```
Microsoft Entra ID → Clerk → Session → Prisma User → Role → Permission
```

- 認證完全委派給 Clerk + Microsoft Entra ID，**不支援帳號/密碼登入**。
- 僅允許指定 Microsoft Entra 租戶（`MICROSOFT_TENANT_ID`）且電子郵件網域為 `@systexsoftware.com.tw` 的使用者；其餘一律回傳 HTTP 403。
- 認證抽象層位於 `src/lib/auth/`（`current-user.ts`、`require-auth.ts`、`require-role.ts`、`sync-user.ts`、`permissions.ts`）。業務程式碼一律從此層匯入，不直接呼叫 Clerk API。
- 路由保護由 `src/proxy.ts`（Clerk middleware，Next.js 16 的 `proxy` 慣例）負責。

### Clerk 設定

1. 前往 [Clerk Dashboard](https://dashboard.clerk.com) 開啟對應的應用程式。
2. **API Keys**：複製 `Publishable key`（`pk_...`）與 `Secret key`（`sk_...`），填入 `.env` 的 `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` 與 `CLERK_SECRET_KEY`。
3. **User & Authentication → Email, Phone, Username**：關閉所有 Email/Password、用戶名等本地登入方式。
4. **User & Authentication → SSO Connections**：啟用 **Microsoft** 連線，僅保留 Microsoft 一種登入方式。
5. **Sessions → Customize session token**：加入自訂宣告，將 Microsoft 的租戶 ID 帶入 Session，例如：
   ```json
   { "tid": "{{user.public_metadata.tenant_id}}" }
   ```
   或透過 Clerk 的 OAuth 宣告對應，使 Session token 內含 `tid`，供後端驗證租戶。

### Microsoft Entra ID 設定

1. 在 [Azure Portal](https://portal.azure.com) → **Microsoft Entra ID → App registrations** 建立應用程式註冊。
2. **Supported account types** 選擇「Accounts in this organizational directory only（單一租戶）」，以限制僅本租戶可登入。
3. **Redirect URI**：填入 Clerk 提供的 Microsoft 連線回呼網址（於 Clerk Dashboard 的 Microsoft SSO 設定頁取得）。
4. 建立 **Client secret**，將 `Application (client) ID` 與 secret 填入 Clerk 的 Microsoft SSO 連線設定。
5. 將該租戶的 `Directory (tenant) ID` 填入 `.env` 的 `MICROSOFT_TENANT_ID`。

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
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Clerk Publishable key（`pk_...`） |
| `CLERK_SECRET_KEY` | Clerk Secret key（`sk_...`） |
| `NEXT_PUBLIC_CLERK_SIGN_IN_URL` | 登入路由，設為 `/login` |
| `MICROSOFT_TENANT_ID` | 允許登入的 Microsoft Entra 租戶 ID |
| `ALLOWED_EMAIL_DOMAIN` | 允許的公司信箱網域（預設 `systexsoftware.com.tw`） |

4. 點擊 **Deploy**（build 會自動執行 `prisma db push` 同步資料表）

### 方式二：Vercel CLI

```bash
npx vercel login
npx vercel link
npx vercel env add DATABASE_URL
npx vercel env add NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
npx vercel env add CLERK_SECRET_KEY
npx vercel env add MICROSOFT_TENANT_ID
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
