import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

interface DecisionReasonFieldProps {
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  disabled?: boolean;
}

export function DecisionReasonField({
  value,
  onChange,
  required,
  disabled,
}: DecisionReasonFieldProps) {
  return (
    <div className="space-y-1">
      <Label htmlFor="decision-reason">
        Decision reason{required ? " (required to reject)" : " (optional)"}
      </Label>
      <Input
        id="decision-reason"
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Explain the decision"
      />
    </div>
  );
}
