export const PIPELINE_STATUS_LABELS: Record<string, string> = {
  POTENTIAL: "潛在商機",
  CONTACTING: "接洽中",
  QUOTATION: "報價中",
  WON: "成交",
  LOST: "失敗",
};

export const PIPELINE_TYPE_LABELS: Record<string, string> = {
  NEW_DEVELOPMENT: "新開發",
  MAINTENANCE: "維護",
  CONSULTING: "顧問",
  OTHER: "其他",
};

export const PROJECT_STATUS_LABELS: Record<string, string> = {
  PLANNING: "規劃中",
  EXECUTING: "執行中",
  ACCEPTANCE: "驗收中",
  CLOSED: "已結案",
};

export const TASK_STATUS_LABELS: Record<string, string> = {
  TODO: "待辦",
  DOING: "進行中",
  REVIEW: "審核中",
  DONE: "完成",
};

export const TASK_PRIORITY_LABELS: Record<string, string> = {
  LOW: "低",
  MEDIUM: "中",
  HIGH: "高",
  URGENT: "緊急",
};

export const TRANSFER_TYPE_LABELS: Record<string, string> = {
  NORMAL: "一般",
  HOLIDAY: "假日",
  ADDITIONAL: "追加",
  ADJUSTMENT: "調整",
};

export const QUOTATION_STATUS_LABELS: Record<string, string> = {
  DRAFT: "草稿",
  SENT: "已送出",
  ACCEPTED: "已接受",
  REJECTED: "已拒絕",
};

export const ROLE_LABELS: Record<string, string> = {
  ADMIN: "管理員",
  SALES: "業務",
  PM: "專案經理",
  RD: "研發",
  FINANCE: "財務",
};
