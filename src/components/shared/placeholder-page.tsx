import { PageHeader } from "@/components/shared/page-header";
import { PhaseNotice } from "@/components/shared/phase-notice";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface PlaceholderPageProps {
  title: string;
  description: string;
  phase: string;
  upcoming: string[];
  summary?: { label: string; value: string }[];
}

// A consistent shell for primary areas that are scheduled for later phases.
// It looks intentional and states clearly what will be built, without
// pretending the area is complete.
export function PlaceholderPage({
  title,
  description,
  phase,
  upcoming,
  summary,
}: PlaceholderPageProps) {
  return (
    <>
      <PageHeader title={title} description={description} />

      <PhaseNotice phase={phase}>
        This area is part of the Agent Control roadmap. The shell and navigation
        are in place. The items below describe what will be built here.
      </PhaseNotice>

      {summary && summary.length > 0 ? (
        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {summary.map((item) => (
            <Card key={item.label}>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {item.label}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-semibold">{item.value}</p>
              </CardContent>
            </Card>
          ))}
        </section>
      ) : null}

      <Card>
        <CardHeader>
          <CardTitle>Planned for this area</CardTitle>
          <CardDescription>
            Capabilities arriving in upcoming phases
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="list-disc space-y-2 pl-5 text-sm text-muted-foreground">
            {upcoming.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </>
  );
}
