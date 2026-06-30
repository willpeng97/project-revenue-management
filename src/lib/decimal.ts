import { Prisma } from "@prisma/client";

export function toDecimal(value: number | string) {
  return new Prisma.Decimal(value);
}

export function calcExpectedRevenue(cost: number, successRate: number) {
  return toDecimal(cost).mul(successRate).div(100);
}
