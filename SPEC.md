# M122 專案與營收管理平台 (Project Revenue Management Platform)

> Version: v1.0
> Type: Product Requirement Document (PRD)
> Target: Cursor AI / Full Stack Development
> Goal: 建立一套以「營收管理」為核心，而非單純任務管理的內部專案管理平台。

---

# 一、專案背景

目前部門工作流程分散於：

- Microsoft Project Center (PWA)
- Excel
- 報價單
- 工作支援單
- Power BI

資料彼此沒有串聯，造成：

- Pipeline 無法即時追蹤
- 報價與成本分離管理困難
- 專案毛利難以計算
- 業務轉撥紀錄容易遺漏
- 無法快速產出管理報表

本系統目的為整合整個專案生命週期。

---

# 二、產品定位

## ❌ 不是

- Jira Clone
- Trello Clone
- 純任務管理系統

## ✅ 而是

Revenue Driven Project Management Platform

核心設計思想：

> 每一個專案都代表一筆營收。

系統所有流程皆圍繞：

- 商機
- 報價
- 成本
- 專案執行
- 轉撥
- 毛利
- 業績

---

# 三、系統流程

```text
Pipeline (商機)
        │
        ▼
Quotation (報價)
        │
        ▼
Project (成交)
        │
        ▼
Task / Work Order
        │
        ├──────────────┐
        ▼              │
Transfer(可多次)       │
        │              │
        └──────────────┘
               │
               ▼
            Close
```

---

# 四、角色權限

## Admin

- 全部權限
- 管理使用者
- 查看所有資料

---

## Sales

可：

- 建立 Pipeline
- 建立報價
- 建立客戶
- 查看自己的業績
- 建立轉撥

不可：

- 修改內部成本

---

## PM

可：

- 管理專案
- 建立任務
- 建立工單
- 查看成本

---

## RD

可：

- 更新任務
- 填寫工時
- 建立工作支援單

不可：

- 修改金額

---

## Finance

可：

- 查看成本
- 查看毛利
- 匯出報表

---

# 五、核心模組

---

# 5.1 Pipeline 管理

## 功能

建立商機

欄位：

|欄位|型別|
|------|------|
|Customer|Relation|
|Project Name|string|
|Type|enum|
|Cost|decimal|
|Success Rate|int|
|Expected Revenue|computed|
|Owner|User|
|Status|enum|

---

## Status

```
Potential
↓

Contacting
↓

Quotation

↓

Won

↓

Lost
```

---

## 計算公式

Expected Revenue

```
Cost × Success Rate
```

例如：

```
1,000,000
×

70%

=

700,000
```

---

# 5.2 Quotation（報價）

## 功能

- 建立報價
- 多版本
- PDF 匯出
- 報價歷程

---

## Quotation

```text
Quotation

id

pipeline_id

version

customer

payment_terms

total_price

created_at
```

---

## Quotation Item

```text
Item

name

description

unit_price

man_day

amount
```

---

## Internal Cost（內部）

> 注意：

此資料不可提供客戶。

```text
Labor Cost

Travel Cost

Risk Cost

Misc Cost
```

系統必須完全分離：

```
External Quotation

≠

Internal Cost
```

---

# 5.3 Project

成交後自動建立 Project。

Project 包含：

- 負責人
- 專案狀態
- 工時
- 成本
- 收入

---

Project Status

```
Planning

↓

Executing

↓

Acceptance

↓

Closed
```

---

# 5.4 Task 管理

採 Kanban。

```
Todo

↓

Doing

↓

Review

↓

Done
```

功能：

- 指派
- 優先度
- 工時
- Due Date
- 留言
- 附件

---

# 5.5 Work Order（工作支援單）

用途：

專案執行紀錄。

欄位：

```
Customer

Project

Service Date

Description

Engineer

Attachment

Customer Signature

Status
```

支援：

- PDF
- 上傳照片
- 上傳簽核

---

# 5.6 Transfer（轉撥）

本系統最重要特色。

## 設計理念

轉撥：

不是結案才發生。

可能：

- 多次
- 追加
- 假日
- 額外需求

---

Transfer

```
id

project_id

amount

type

date

remark

created_by
```

Type

```
Normal

Holiday

Additional

Adjustment
```

---

Project

可以：

```
1 Project

↓

N Transfers
```

---

# 5.7 Dashboard

首頁 Dashboard。

包含：

---

Pipeline

- 商機數
- Pipeline 金額
- 成案率
- 預估收入

---

Revenue

- 本月收入
- 本月成本
- 毛利

---

Transfer

- 本月轉撥
- 各業務轉撥

---

Project

- 執行中
- 即將到期
- 已完成

---

Task

- Todo
- Doing
- Delay

---

# 六、資料模型

## Customer

```text
Customer

id

name

tax_id

contact

phone

email

address
```

---

## Pipeline

```text
Pipeline

id

customer_id

title

type

cost

success_rate

expected_revenue

status

owner

created_at
```

---

## Quotation

```text
Quotation

id

pipeline_id

version

payment_terms

total_price

status
```

---

## Quotation Item

```text
QuotationItem

id

quotation_id

name

unit_price

man_day

amount
```

---

## Internal Cost

```text
InternalCost

quotation_id

labor

travel

risk

misc
```

---

## Project

```text
Project

id

quotation_id

manager

status

start_date

end_date

income

cost
```

---

## Task

```text
Task

id

project_id

title

status

priority

assignee

work_hour
```

---

## Work Order

```text
WorkOrder

id

project_id

customer

service_date

description

attachment
```

---

## Transfer

```text
Transfer

id

project_id

amount

type

remark

date
```

---

# 七、Business Rules

## Rule 1

Pipeline 可以沒有報價。

---

## Rule 2

一個 Pipeline

可以有多份報價。

```
Pipeline

↓

Quotation v1

Quotation v2

Quotation v3
```

---

## Rule 3

成交後

只能建立一個正式 Project。

---

## Rule 4

Project

可有多筆：

- Task
- WorkOrder
- Transfer

---

## Rule 5

Transfer

不限制：

- 次數
- 日期
- 專案狀態

即使未結案也能建立。

---

## Rule 6

Internal Cost

只有：

Admin

Finance

PM

可查看。

Sales 不可。

---

# 八、技術需求

## Frontend

- Next.js
- React
- TypeScript
- TailwindCSS
- shadcn/ui
- TanStack Query
- React Hook Form
- Zod
- Zustand

---

## Backend

- NestJS
- TypeScript
- Prisma ORM
- PostgreSQL

---

## Authentication

- JWT
- Refresh Token
- Role Based Access Control (RBAC)

---

## Storage

- S3 Compatible Storage
- MinIO

---

## PDF

- Quotation PDF
- Work Order PDF

---

## Charts

- Recharts

---

## Deployment

Docker Compose

包含：

- frontend
- backend
- postgres
- minio
- nginx

---

# 九、未來擴充

- Power BI API
- Outlook Calendar
- Email 通知
- Teams 通知
- 簽核流程
- OCR 報價辨識
- AI 報價建議
- AI 毛利分析
- AI Pipeline 預測
- AI 專案風險分析

---

# 十、設計原則

本系統的核心不是任務，而是營收。

所有資料最終都應能回溯至：

```
Pipeline
      ↓
Quotation
      ↓
Project
      ↓
Revenue
      ↓
Profit
```

因此，整個系統應以「商機 → 收入 → 成本 → 毛利」為主軸，而非僅提供任務追蹤功能。這也是本平台與 Jira、Trello、ClickUp 等專案管理工具最大的差異。