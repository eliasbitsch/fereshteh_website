import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { validateSession } from "~/lib/auth";
import {
  deleteExperience,
  type ExperienceContent,
  reorderExperiences,
  updateExperience,
} from "~/lib/content";

async function checkAuth(): Promise<boolean> {
  const cookieStore = await cookies();
  const token = cookieStore.get("admin_session")?.value;
  if (!token) return false;
  return validateSession(token) !== null;
}

export async function POST(request: Request) {
  try {
    if (!(await checkAuth())) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const experience: ExperienceContent = await request.json();

    // Generate ID if not provided
    if (!experience.id) {
      experience.id = `exp-${Date.now()}`;
    }

    const content = updateExperience(experience);

    return NextResponse.json({ success: true, content });
  } catch (error) {
    console.error("Create experience error:", error);
    return NextResponse.json(
      { error: "Failed to create experience" },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    if (!(await checkAuth())) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const experience: ExperienceContent = await request.json();
    const content = updateExperience(experience);

    return NextResponse.json({ success: true, content });
  } catch (error) {
    console.error("Update experience error:", error);
    return NextResponse.json(
      { error: "Failed to update experience" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    if (!(await checkAuth())) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await request.json();

    if (!id) {
      return NextResponse.json(
        { error: "Experience ID is required" },
        { status: 400 }
      );
    }

    const content = deleteExperience(id);

    return NextResponse.json({ success: true, content });
  } catch (error) {
    console.error("Delete experience error:", error);
    return NextResponse.json(
      { error: "Failed to delete experience" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  try {
    if (!(await checkAuth())) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { ids } = await request.json();

    if (!Array.isArray(ids)) {
      return NextResponse.json(
        { error: "IDs array is required" },
        { status: 400 }
      );
    }

    const content = reorderExperiences(ids);

    return NextResponse.json({ success: true, content });
  } catch (error) {
    console.error("Reorder experiences error:", error);
    return NextResponse.json(
      { error: "Failed to reorder experiences" },
      { status: 500 }
    );
  }
}
