import { analyzeMedicationRisk } from "@/lib/analysis/engine";
import type { AnalysisRequest } from "@/lib/types";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as AnalysisRequest;

    if (!body.medications || body.medications.length < 2) {
      return NextResponse.json(
        { error: "At least 2 medications are required" },
        { status: 400 }
      );
    }

    const symptoms = body.symptoms ?? [];

    await new Promise((resolve) => setTimeout(resolve, 2200));

    const result = analyzeMedicationRisk({ medications: body.medications, symptoms });
    return NextResponse.json(result);
  } catch {
    return NextResponse.json(
      { error: "Failed to analyze medications" },
      { status: 500 }
    );
  }
}
