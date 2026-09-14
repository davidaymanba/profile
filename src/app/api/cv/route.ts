import { NextResponse } from "next/server";
import { getPortfolioData } from "@/lib/portfolio-data";

export async function GET() {
  const data = await getPortfolioData();
  const cvUrl = data.profile.cvUrl?.trim();

  if (!cvUrl) {
    return NextResponse.json({ error: "CV not available" }, { status: 404 });
  }

  try {
    const response = await fetch(cvUrl, { cache: "no-store" });
    if (!response.ok) {
      return NextResponse.json({ error: "Failed to fetch CV" }, { status: 502 });
    }

    const bytes = await response.arrayBuffer();
    const contentType = response.headers.get("content-type") || "application/pdf";

    return new NextResponse(bytes, {
      headers: {
        "Content-Type": contentType,
        "Content-Disposition":
          'attachment; filename="David_Ayman_Full_Stack_Developer.pdf"',
        "Cache-Control": "public, max-age=3600",
      },
    });
  } catch {
    return NextResponse.json({ error: "Failed to download CV" }, { status: 500 });
  }
}
