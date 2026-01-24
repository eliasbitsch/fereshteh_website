import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { validateSession } from "~/lib/auth";
import {
  getProjectPdfItems,
  saveProjectsOrder,
  deleteProjectPdf,
} from "~/lib/projects-pdf";

async function checkAuth(): Promise<boolean> {
  const cookieStore = await cookies();
  const token = cookieStore.get("admin_session")?.value;
  if (!token) return false;
  return validateSession(token) !== null;
}

export async function GET() {
  try {
    const items = getProjectPdfItems();
    return NextResponse.json({ items });
  } catch (error) {
    console.error("Get project PDFs error:", error);
    return NextResponse.json(
      { error: "Failed to get project PDFs" },
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

    if (!order || !Array.isArray(order)) {
      return NextResponse.json(
        { error: "Order array is required" },
        { status: 400 }
      );
    }

    saveProjectsOrder(order);

    const items = getProjectPdfItems();
    return NextResponse.json({ success: true, items });
  } catch (error) {
    console.error("Update project PDFs order error:", error);
    return NextResponse.json(
      { error: "Failed to update order" },
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
      return NextResponse.json(
        { error: "Title is required" },
        { status: 400 }
      );
    }

    deleteProjectPdf(title);

    const items = getProjectPdfItems();
    return NextResponse.json({ success: true, items });
  } catch (error) {
    console.error("Delete project PDF error:", error);
    return NextResponse.json(
      { error: "Failed to delete project PDF" },
      { status: 500 }
    );
  }
}
