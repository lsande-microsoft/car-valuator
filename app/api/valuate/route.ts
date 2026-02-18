import { NextRequest, NextResponse } from "next/server";
import { valuateRequestSchema } from "@/lib/validation";
import { computeValuation } from "@/lib/valuation";
import { ZodError } from "zod";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const input = valuateRequestSchema.parse(body);
    const result = computeValuation(input);
    return NextResponse.json(result, { status: 200 });
  } catch (err) {
    if (err instanceof ZodError) {
      const messages = err.issues.map((e) => `${e.path.join(".")}: ${e.message}`);
      return NextResponse.json(
        { error: "Validation failed", details: messages },
        { status: 400 }
      );
    }
    if (err instanceof SyntaxError) {
      return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }
    console.error("[valuate] Unexpected error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
