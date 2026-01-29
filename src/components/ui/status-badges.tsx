import { Priority, VehicleStatus } from '@/types';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface PriorityBadgeProps {
  priority: Priority;
  className?: string;
}

const priorityConfig: Record<Priority, { label: string; className: string }> = {
  1: { label: 'Niedrig', className: 'bg-muted text-muted-foreground' },
  2: { label: 'Gering', className: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300' },
  3: { label: 'Mittel', className: 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300' },
  4: { label: 'Hoch', className: 'bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300' },
  5: { label: 'Sehr hoch', className: 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300' },
};

export function PriorityBadge({ priority, className }: PriorityBadgeProps) {
  const config = priorityConfig[priority];
  return (
    <Badge className={cn(config.className, 'font-medium', className)} variant="secondary">
      {priority} - {config.label}
    </Badge>
  );
}

interface StatusBadgeProps {
  status: VehicleStatus;
  className?: string;
}

const statusConfig: Record<VehicleStatus, { label: string; className: string }> = {
  open: { label: 'Offen', className: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300' },
  visited: { label: 'Besucht', className: 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300' },
  excluded: { label: 'Ausgeschlossen', className: 'bg-muted text-muted-foreground line-through' },
};

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = statusConfig[status];
  return (
    <Badge className={cn(config.className, 'font-medium', className)} variant="secondary">
      {config.label}
    </Badge>
  );
}
