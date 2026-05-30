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
import { demoAgents } from "@/lib/mock/demo-data";
import {
  AGENT_STATUS_INTENT,
  AGENT_STATUS_LABELS,
  RISK_LEVEL_INTENT,
  RISK_LEVEL_LABELS,
} from "@/lib/constants/status";
import { formatCurrency, formatPercent } from "@/lib/utils";

export function AgentHealth() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Agent health</CardTitle>
        <CardDescription>
          Status, risk, evaluation pass rate, and cost per agent
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Agent</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Risk</TableHead>
              <TableHead>Eval pass</TableHead>
              <TableHead>Error rate</TableHead>
              <TableHead>Monthly cost</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {demoAgents.map((agent) => (
              <TableRow key={agent.id}>
                <TableCell className="font-medium">{agent.name}</TableCell>
                <TableCell>
                  <StatusBadge
                    label={AGENT_STATUS_LABELS[agent.status]}
                    intent={AGENT_STATUS_INTENT[agent.status]}
                  />
                </TableCell>
                <TableCell>
                  <StatusBadge
                    label={RISK_LEVEL_LABELS[agent.riskLevel]}
                    intent={RISK_LEVEL_INTENT[agent.riskLevel]}
                  />
                </TableCell>
                <TableCell>{formatPercent(agent.evaluationPassRate)}</TableCell>
                <TableCell>{formatPercent(agent.errorRate)}</TableCell>
                <TableCell>{formatCurrency(agent.monthlyCost)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
