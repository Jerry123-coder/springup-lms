/**
 * Student workspace — Scholar Ascent / stitch “main_dashboard” & catalog shell.
 * Layered surfaces, no harsh chrome; content width capped for editorial layout.
 */
export default function StudentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="student-canvas min-h-full bg-gradient-to-b from-muted/50 via-background to-muted/30">
      {children}
    </div>
  );
}
