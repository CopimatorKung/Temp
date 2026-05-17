import { FiCalendar, FiUsers } from 'react-icons/fi';
import { Button } from '../../../components/ui/Button';

export function DashboardHeader() {
  return (
    <header className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Good morning, Pimnara</h1>
        <p className="mt-1 text-sm leading-6 text-muted-foreground">
          Here is how your team is improving and getting ready to win more deals.
        </p>
      </div>
      <div className="flex flex-wrap gap-2">
        <Button variant="secondary">
          <FiUsers className="h-4 w-4" />
          All Teams
        </Button>
        <Button variant="secondary">
          <FiCalendar className="h-4 w-4" />
          May 12 - Jun 11, 2025
        </Button>
      </div>
    </header>
  );
}
