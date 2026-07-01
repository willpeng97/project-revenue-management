import {
  PrismaClient,
  Role,
  Prisma,
  PipelineStatus,
  PipelineType,
  QuotationStatus,
  ProjectStatus,
  TaskStatus,
  TaskPriority,
  TransferType,
  WorkOrderStatus,
} from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import { subMonths, subDays, addDays } from "date-fns";
import "dotenv/config";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });
const D = (v: number) => new Prisma.Decimal(v);
const now = new Date();

async function main() {
  // --- Reset demo data (children first). Real Clerk-provisioned users are kept. ---
  await prisma.transfer.deleteMany();
  await prisma.task.deleteMany();
  await prisma.workOrder.deleteMany();
  await prisma.project.deleteMany();
  await prisma.quotation.deleteMany(); // cascades items + internalCost
  await prisma.pipeline.deleteMany();
  await prisma.customer.deleteMany();
  await prisma.user.deleteMany({ where: { clerkId: { startsWith: "seed_" } } });

  // --- Users (demo; fake clerkId so they never collide with real SSO users) ---
  const userDefs = [
    { key: "admin", name: "王大明", role: Role.ADMIN },
    { key: "sales1", name: "陳美玲", role: Role.SALES },
    { key: "sales2", name: "林志豪", role: Role.SALES },
    { key: "pm", name: "張家豪", role: Role.PM },
    { key: "rd", name: "李小華", role: Role.RD },
    { key: "finance", name: "黃淑芬", role: Role.FINANCE },
  ];
  const users: Record<string, { id: string }> = {};
  for (const u of userDefs) {
    const created = await prisma.user.create({
      data: {
        clerkId: `seed_${u.key}`,
        email: `seed_${u.key}@systexsoftware.com.tw`,
        name: u.name,
        role: u.role,
        lastLoginAt: subDays(now, Math.floor(Math.random() * 10)),
      },
    });
    users[u.key] = created;
  }

  // --- Customers ---
  const customerNames = ["台積電", "鴻海精密", "中華電信", "國泰金控", "統一企業"];
  const customers = [];
  for (const name of customerNames) {
    customers.push(
      await prisma.customer.create({
        data: { name: `${name}股份有限公司`, contact: "採購窗口", phone: "02-1234-5678" },
      })
    );
  }

  // --- Pipelines across all statuses ---
  const pipelineDefs: {
    title: string;
    type: PipelineType;
    c: number;
    owner: string;
    cost: number;
    rate: number;
    status: PipelineStatus;
  }[] = [
    { title: "ERP 系統建置案", type: PipelineType.NEW_DEVELOPMENT, c: 0, owner: "sales1", cost: 8000000, rate: 70, status: PipelineStatus.WON },
    { title: "智慧製造 MES 平台", type: PipelineType.NEW_DEVELOPMENT, c: 1, owner: "sales2", cost: 6500000, rate: 60, status: PipelineStatus.WON },
    { title: "電信計費系統維護", type: PipelineType.MAINTENANCE, c: 2, owner: "sales1", cost: 3200000, rate: 80, status: PipelineStatus.WON },
    { title: "金融風控儀表板", type: PipelineType.CONSULTING, c: 3, owner: "sales2", cost: 4500000, rate: 55, status: PipelineStatus.WON },
    { title: "供應鏈整合平台", type: PipelineType.NEW_DEVELOPMENT, c: 4, owner: "sales1", cost: 5200000, rate: 65, status: PipelineStatus.WON },
    { title: "資料倉儲升級案", type: PipelineType.CONSULTING, c: 0, owner: "sales2", cost: 2800000, rate: 50, status: PipelineStatus.QUOTATION },
    { title: "客服 AI 導入評估", type: PipelineType.CONSULTING, c: 2, owner: "sales1", cost: 1800000, rate: 45, status: PipelineStatus.QUOTATION },
    { title: "行動 App 改版", type: PipelineType.NEW_DEVELOPMENT, c: 3, owner: "sales2", cost: 2200000, rate: 40, status: PipelineStatus.CONTACTING },
    { title: "資安滲透測試", type: PipelineType.OTHER, c: 1, owner: "sales1", cost: 900000, rate: 35, status: PipelineStatus.CONTACTING },
    { title: "雲端遷移顧問", type: PipelineType.CONSULTING, c: 4, owner: "sales2", cost: 3500000, rate: 30, status: PipelineStatus.POTENTIAL },
    { title: "BI 報表平台", type: PipelineType.NEW_DEVELOPMENT, c: 0, owner: "sales1", cost: 2600000, rate: 25, status: PipelineStatus.POTENTIAL },
    { title: "舊系統汰換評估", type: PipelineType.OTHER, c: 2, owner: "sales2", cost: 1200000, rate: 20, status: PipelineStatus.LOST },
  ];

  const wonPipelines: { id: string; ownerId: string; cost: number }[] = [];
  for (const p of pipelineDefs) {
    const created = await prisma.pipeline.create({
      data: {
        customerId: customers[p.c].id,
        title: p.title,
        type: p.type,
        cost: D(p.cost),
        successRate: p.rate,
        expectedRevenue: D((p.cost * p.rate) / 100),
        status: p.status,
        ownerId: users[p.owner].id,
        createdAt: subDays(now, Math.floor(Math.random() * 60) + 1),
      },
    });
    if (p.status === PipelineStatus.WON) {
      wonPipelines.push({ id: created.id, ownerId: users[p.owner].id, cost: p.cost });
    }
  }

  // --- Quotations + Projects for WON pipelines ---
  const projectStatuses = [
    ProjectStatus.EXECUTING,
    ProjectStatus.EXECUTING,
    ProjectStatus.ACCEPTANCE,
    ProjectStatus.PLANNING,
    ProjectStatus.CLOSED,
  ];
  // endDate offsets (days from now): overdue (delayed), soon (risk), future (normal), n/a
  const endOffsets = [-8, 10, 60, 40, -30];

  const projects: { id: string; ownerId: string; income: number }[] = [];
  for (let i = 0; i < wonPipelines.length; i++) {
    const wp = wonPipelines[i];
    const total = Math.round(wp.cost * 1.25);
    const internal = {
      labor: Math.round(wp.cost * 0.5),
      travel: Math.round(wp.cost * 0.08),
      risk: Math.round(wp.cost * 0.05),
      misc: Math.round(wp.cost * 0.04),
    };
    const internalTotal = internal.labor + internal.travel + internal.risk + internal.misc;

    const quotation = await prisma.quotation.create({
      data: {
        pipelineId: wp.id,
        version: 1,
        paymentTerms: "簽約 30% / 交付 50% / 驗收 20%",
        totalPrice: D(total),
        status: QuotationStatus.ACCEPTED,
        createdAt: subDays(now, 50 - i * 5),
        items: {
          create: [
            { name: "系統開發", unitPrice: D(total * 0.6), manDay: D(120), amount: D(total * 0.6) },
            { name: "教育訓練", unitPrice: D(total * 0.15), manDay: D(20), amount: D(total * 0.15) },
            { name: "維運支援", unitPrice: D(total * 0.25), manDay: D(40), amount: D(total * 0.25) },
          ],
        },
        internalCost: { create: { labor: D(internal.labor), travel: D(internal.travel), risk: D(internal.risk), misc: D(internal.misc) } },
      },
    });

    const status = projectStatuses[i % projectStatuses.length];
    const project = await prisma.project.create({
      data: {
        quotationId: quotation.id,
        managerId: users.pm.id,
        status,
        startDate: subMonths(now, 4),
        endDate: addDays(now, endOffsets[i % endOffsets.length]),
        income: D(total),
        cost: D(internalTotal),
      },
    });
    projects.push({ id: project.id, ownerId: wp.ownerId, income: total });
  }

  // --- Tasks across statuses ---
  const taskDefs: { title: string; status: TaskStatus; priority: TaskPriority; due: number }[] = [
    { title: "需求訪談與規格確認", status: TaskStatus.DONE, priority: TaskPriority.HIGH, due: -20 },
    { title: "系統架構設計", status: TaskStatus.DONE, priority: TaskPriority.HIGH, due: -10 },
    { title: "核心模組開發", status: TaskStatus.DOING, priority: TaskPriority.URGENT, due: 5 },
    { title: "介面串接與整合", status: TaskStatus.DOING, priority: TaskPriority.MEDIUM, due: 12 },
    { title: "測試案例撰寫", status: TaskStatus.REVIEW, priority: TaskPriority.MEDIUM, due: 8 },
    { title: "使用者教育訓練", status: TaskStatus.TODO, priority: TaskPriority.LOW, due: 25 },
    { title: "上線部署準備", status: TaskStatus.TODO, priority: TaskPriority.HIGH, due: 30 },
  ];
  const assignees = [users.rd.id, users.pm.id, users.sales1.id];
  for (const project of projects) {
    const count = 4 + Math.floor(Math.random() * 3);
    for (let t = 0; t < count; t++) {
      const def = taskDefs[t % taskDefs.length];
      await prisma.task.create({
        data: {
          projectId: project.id,
          title: def.title,
          status: def.status,
          priority: def.priority,
          assigneeId: assignees[t % assignees.length],
          workHour: D(Math.round(Math.random() * 40) + 8),
          dueDate: addDays(now, def.due),
        },
      });
    }
  }

  // --- Transfers across the last 6 months (drives revenue trend + sales ranking) ---
  const transferCreators = ["sales1", "sales2", "pm", "admin", "rd"];
  let ci = 0;
  for (const project of projects) {
    const chunks = 3;
    for (let m = 0; m < chunks; m++) {
      const monthAgo = Math.floor(Math.random() * 6);
      await prisma.transfer.create({
        data: {
          projectId: project.id,
          amount: D(Math.round((project.income / chunks) * (0.7 + Math.random() * 0.6))),
          type: TransferType.NORMAL,
          date: subMonths(now, monthAgo),
          remark: "階段性請款",
          createdBy: users[transferCreators[ci % transferCreators.length]].id,
        },
      });
      ci++;
    }
  }

  // --- Work orders ---
  for (let i = 0; i < Math.min(3, projects.length); i++) {
    await prisma.workOrder.create({
      data: {
        projectId: projects[i].id,
        customerId: customers[i % customers.length].id,
        serviceDate: subDays(now, i * 3 + 1),
        description: "現場系統維護與問題排除",
        engineerId: users.rd.id,
        status: WorkOrderStatus.SUBMITTED,
      },
    });
  }

  const counts = {
    users: await prisma.user.count(),
    customers: await prisma.customer.count(),
    pipelines: await prisma.pipeline.count(),
    quotations: await prisma.quotation.count(),
    projects: await prisma.project.count(),
    tasks: await prisma.task.count(),
    transfers: await prisma.transfer.count(),
    workOrders: await prisma.workOrder.count(),
  };
  console.log("Seed complete:", counts);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await pool.end();
  });
