import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import { NextResponse } from "next/server";

import { createClient } from "@/lib/supabase/server";

function buildCertificateNumber(opts: {
  userId: string;
  courseId: string;
  issuedAtISO: string;
}) {
  // Stable, readable, and unique-enough for display.
  const date = opts.issuedAtISO.slice(0, 10).replaceAll("-", "");
  return `SU-${date}-${opts.courseId.slice(0, 6)}-${opts.userId.slice(0, 6)}`.toUpperCase();
}

export async function GET(
  _req: Request,
  ctx: { params: Promise<{ courseId: string }> }
) {
  const { courseId } = await ctx.params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const [{ data: profile }, { data: course }] = await Promise.all([
    supabase.from("profiles").select("full_name").eq("id", user.id).maybeSingle(),
    supabase.from("courses").select("id, title, pillar").eq("id", courseId).maybeSingle(),
  ]);

  if (!course) {
    return NextResponse.json({ error: "Course not found" }, { status: 404 });
  }

  const { data: lessons, error: lessonsError } = await supabase
    .from("lessons")
    .select("id")
    .eq("course_id", courseId);

  if (lessonsError) {
    return NextResponse.json({ error: lessonsError.message }, { status: 500 });
  }

  const lessonIds = (lessons ?? []).map((l) => l.id);
  if (lessonIds.length === 0) {
    return NextResponse.json(
      { error: "This course has no lessons yet." },
      { status: 400 }
    );
  }

  const { data: submissions, error: subsError } = await supabase
    .from("submissions")
    .select("lesson_id")
    .eq("student_id", user.id)
    .in("lesson_id", lessonIds);

  if (subsError) {
    return NextResponse.json({ error: subsError.message }, { status: 500 });
  }

  const submittedLessonIds = new Set((submissions ?? []).map((s) => s.lesson_id));
  const isComplete = lessonIds.every((id) => submittedLessonIds.has(id));

  if (!isComplete) {
    return NextResponse.json(
      { error: "Complete all lessons to download your certificate." },
      { status: 403 }
    );
  }

  const { data: existingCert } = await supabase
    .from("certificates")
    .select("certificate_number, issued_at")
    .eq("student_id", user.id)
    .eq("course_id", courseId)
    .maybeSingle();

  const issuedAt = existingCert?.issued_at ?? new Date().toISOString();
  const certificateNumber =
    existingCert?.certificate_number ??
    buildCertificateNumber({ userId: user.id, courseId, issuedAtISO: issuedAt });

  if (!existingCert) {
    // Best effort. If it fails (e.g. race), we still return the PDF.
    await supabase.from("certificates").insert({
      student_id: user.id,
      course_id: courseId,
      certificate_number: certificateNumber,
      issued_at: issuedAt,
    });
  }

  const doc = await PDFDocument.create();
  const page = doc.addPage([842, 595]); // A4 landscape-ish
  const { width, height } = page.getSize();

  const font = await doc.embedFont(StandardFonts.Helvetica);
  const fontBold = await doc.embedFont(StandardFonts.HelveticaBold);

  // Background
  page.drawRectangle({
    x: 0,
    y: 0,
    width,
    height,
    color: rgb(0.03, 0.07, 0.14),
  });
  page.drawRectangle({
    x: 36,
    y: 36,
    width: width - 72,
    height: height - 72,
    borderColor: rgb(0.32, 0.76, 0.98),
    borderWidth: 2,
    color: rgb(0.05, 0.12, 0.22),
    opacity: 0.96,
  });

  const title = "Certificate of Completion";
  const name = (profile?.full_name || user.email || "Student").trim();
  const courseTitle = course.title;
  const pillarLine = `Pillar: ${course.pillar}`;

  // Title
  const titleWidth = fontBold.widthOfTextAtSize(title, 34);
  page.drawText(title, {
    x: (width - titleWidth) / 2,
    y: height - 140,
    size: 34,
    font: fontBold,
    color: rgb(0.95, 0.98, 1),
  });

  // Recipient
  const t1 = font.widthOfTextAtSize("This certifies that", 16);
  page.drawText("This certifies that", {
    x: (width - t1) / 2,
    y: height - 210,
    size: 16,
    font,
    color: rgb(0.75, 0.86, 0.95),
  });

  const nameWidth = fontBold.widthOfTextAtSize(name, 30);
  page.drawText(name, {
    x: (width - nameWidth) / 2,
    y: height - 255,
    size: 30,
    font: fontBold,
    color: rgb(0.32, 0.9, 0.7),
  });

  const t2 = font.widthOfTextAtSize("has successfully completed", 16);
  page.drawText("has successfully completed", {
    x: (width - t2) / 2,
    y: height - 300,
    size: 16,
    font,
    color: rgb(0.75, 0.86, 0.95),
  });

  // Course title
  const courseSize = courseTitle.length > 44 ? 20 : 24;
  const courseWidth = fontBold.widthOfTextAtSize(courseTitle, courseSize);
  page.drawText(courseTitle, {
    x: (width - courseWidth) / 2,
    y: height - 345,
    size: courseSize,
    font: fontBold,
    color: rgb(0.95, 0.98, 1),
  });

  // Meta
  const issued = new Date(issuedAt).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
  const metaLeft = `Issued: ${issued}`;
  const metaRight = `Certificate #: ${certificateNumber}`;

  page.drawText(metaLeft, {
    x: 64,
    y: 80,
    size: 12,
    font,
    color: rgb(0.75, 0.86, 0.95),
  });
  page.drawText(pillarLine, {
    x: 64,
    y: 60,
    size: 12,
    font,
    color: rgb(0.75, 0.86, 0.95),
  });

  const metaRightWidth = font.widthOfTextAtSize(metaRight, 12);
  page.drawText(metaRight, {
    x: width - 64 - metaRightWidth,
    y: 80,
    size: 12,
    font,
    color: rgb(0.75, 0.86, 0.95),
  });

  const pdfBytes = await doc.save();
  const safeCourseName = course.title
    .toLowerCase()
    .replaceAll(/[^a-z0-9]+/g, "-")
    .replaceAll(/^-|-$/g, "");

  return new NextResponse(pdfBytes, {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="springup-certificate-${safeCourseName}.pdf"`,
      "Cache-Control": "no-store",
    },
  });
}

