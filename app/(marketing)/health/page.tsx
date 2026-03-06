import { createClient } from "@/lib/supabase/server";

export default async function HealthPage() {
  const checks: { label: string; status: string; detail: string }[] = [];

  try {
    const supabase = await createClient();

    // 1. Can we reach Supabase at all?
    const { data: authData, error: authError } =
      await supabase.auth.getSession();
    if (authError) {
      checks.push({
        label: "Supabase Connection",
        status: "FAIL",
        detail: authError.message,
      });
    } else {
      checks.push({
        label: "Supabase Connection",
        status: "OK",
        detail: authData.session
          ? `Logged in as ${authData.session.user.email}`
          : "Connected (no active session)",
      });
    }

    // 2. Does the profiles table exist?
    const { error: tableError } = await supabase
      .from("profiles")
      .select("id")
      .limit(1);
    if (tableError) {
      checks.push({
        label: "Profiles Table",
        status: "FAIL",
        detail: tableError.message,
      });
    } else {
      checks.push({
        label: "Profiles Table",
        status: "OK",
        detail: "Table exists and is queryable",
      });
    }

    // 3. Does the courses table exist?
    const { error: coursesError } = await supabase
      .from("courses")
      .select("id")
      .limit(1);
    if (coursesError) {
      checks.push({
        label: "Courses Table",
        status: "FAIL",
        detail: coursesError.message,
      });
    } else {
      checks.push({
        label: "Courses Table",
        status: "OK",
        detail: "Table exists and is queryable",
      });
    }

    // 4. Count users in auth (via profiles as proxy)
    const { count, error: countError } = await supabase
      .from("profiles")
      .select("*", { count: "exact", head: true });
    if (countError) {
      checks.push({
        label: "Profile Count",
        status: "WARN",
        detail: countError.message,
      });
    } else {
      checks.push({
        label: "Profile Count",
        status: "INFO",
        detail: `${count ?? 0} profile(s) in the database`,
      });
    }
  } catch (err) {
    checks.push({
      label: "Unexpected Error",
      status: "FAIL",
      detail: err instanceof Error ? err.message : String(err),
    });
  }

  return (
    <div className="mx-auto max-w-xl px-4 py-16">
      <h1 className="mb-6 text-2xl font-bold">Supabase Health Check</h1>
      <div className="space-y-3">
        {checks.map((check) => (
          <div key={check.label} className="rounded-lg border p-4">
            <div className="flex items-center justify-between">
              <span className="font-medium">{check.label}</span>
              <span
                className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                  check.status === "OK"
                    ? "bg-green-100 text-green-800"
                    : check.status === "FAIL"
                    ? "bg-red-100 text-red-800"
                    : check.status === "WARN"
                    ? "bg-yellow-100 text-yellow-800"
                    : "bg-blue-100 text-blue-800"
                }`}
              >
                {check.status}
              </span>
            </div>
            <p className="mt-1 text-sm text-muted-foreground">
              {check.detail}
            </p>
          </div>
        ))}
      </div>
      <p className="mt-6 text-xs text-muted-foreground">
        Delete this page once everything is working.
      </p>
    </div>
  );
}
