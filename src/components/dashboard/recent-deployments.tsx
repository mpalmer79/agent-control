import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { StatusBadge } from "@/components/shared/status-badge";
import { demoDeployments } from "@/lib/mock/demo-data";
import {
  DEPLOYMENT_STATUS_INTENT,
  DEPLOYMENT_STATUS_LABELS,
} from "@/lib/constants/status";
import { formatDate } from "@/lib/utils";

export function RecentDeployments() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent deployment activity</CardTitle>
        <CardDescription>
          Promotions and rollbacks across environments
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Agent</TableHead>
              <TableHead>Version</TableHead>
              <TableHead>Environment</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>When</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {demoDeployments.map((deployment) => (
              <TableRow key={deployment.id}>
                <TableCell className="font-medium">
                  {deployment.agentName}
                </TableCell>
                <TableCell>{deployment.version}</TableCell>
                <TableCell className="capitalize">
                  {deployment.environment}
                </TableCell>
                <TableCell>
                  <StatusBadge
                    label={DEPLOYMENT_STATUS_LABELS[deployment.status]}
                    intent={DEPLOYMENT_STATUS_INTENT[deployment.status]}
                  />
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {formatDate(deployment.occurredAt)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
