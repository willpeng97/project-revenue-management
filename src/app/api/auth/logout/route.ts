import { NextResponse } from "next/server";
import { jsonSuccess } from "@/lib/api-helpers";

export async function POST() {
  const response = jsonSuccess({ ok: true });
  response.cookies.set("access_token", "", { maxAge: 0, path: "/" });
  return response;
}
