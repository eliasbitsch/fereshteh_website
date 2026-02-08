import { existsSync, readFileSync, unlinkSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { validateSession } from "~/lib/auth";
import { getPortfolioItems } from "~/lib/portfolio";

// Cache for 30 seconds - balances performance with CMS freshness
export const revalidate = 30;

const PORTFOLIO_ORDER_FILE = join(
  process.cwd(),
  "src/content/data/portfolio-order.json"
);

async function checkAuth(): Promise<boolean> {
  const cookieStore = await cookies();
  const token = cookieStore.get("admin_session")?.value;
  if (!token) return false;
  return validateSession(token) !== null;
}

function getPortfolioOrder(): { order: string[] } {
  try {
    if (existsSync(PORTFOLIO_ORDER_FILE)) {
      const data = readFileSync(PORTFOLIO_ORDER_FILE, "utf-8");
      return JSON.parse(data);
    }
  } catch (error) {
    console.error("Failed to read portfolio order:", error);
  }
  return { order: [] };
}

function savePortfolioOrder(order: string[]): void {
  writeFileSync(
    PORTFOLIO_ORDER_FILE,
    JSON.stringify({ order }, null, 2),
    "utf-8"
  );
}

export async function GET() {
  try {
    const items = getPortfolioItems();
    const orderData = getPortfolioOrder();

    return NextResponse.json({
      items,
      order: orderData.order,
    });
  } catch (error) {
    console.error("Get portfolio error:", error);
    return NextResponse.json(
      { error: "Failed to get portfolio items" },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    if (!(await checkAuth())) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { order } = body as { order: string[] };

    if (!Array.isArray(order)) {
      return NextResponse.json(
        { error: "Order must be an array" },
        { status: 400 }
      );
    }

    savePortfolioOrder(order);

    return NextResponse.json({ success: true, order });
  } catch (error) {
    console.error("Update portfolio order error:", error);
    return NextResponse.json(
      { error: "Failed to update portfolio order" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    if (!(await checkAuth())) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { title } = body as { title: string };

    if (!title) {
      return NextResponse.json({ error: "Title is required" }, { status: 400 });
    }

    const portfolioDir = join(process.cwd(), "public", "portfolio");
    const pdfPath = join(portfolioDir, `${title}.pdf`);

    if (existsSync(pdfPath)) {
      unlinkSync(pdfPath);
    }

    // Remove from order
    const orderData = getPortfolioOrder();
    const newOrder = orderData.order.filter((t) => t !== title);
    savePortfolioOrder(newOrder);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete portfolio item error:", error);
    return NextResponse.json(
      { error: "Failed to delete portfolio item" },
      { status: 500 }
    );
  }
}
