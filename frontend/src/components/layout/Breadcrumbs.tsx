import { FiChevronRight, FiHome } from 'react-icons/fi';
import { match } from 'path-to-regexp';
import { Link, useLocation } from 'react-router-dom';
import { routeLabels, routes } from '../../app/routes';

export function Breadcrumbs() {
  const location = useLocation();
  const entries = Object.entries(routeLabels);
  const current = entries.find(([path]) => path === location.pathname || Boolean(match(path)(location.pathname)));
  const currentLabel = current?.[1] ?? 'Not Found';
  const isSenarioDetail =
    location.pathname.startsWith(`${routes.voiceRoleplay}/`) && location.pathname !== routes.voiceRoleplay;

  return (
    <div className="sticky top-0 z-30 border-b border-border bg-card/95 px-5 py-3 shadow-sm backdrop-blur lg:px-8">
      <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-2 text-sm">
        <Link to={routes.dashboard} aria-label="Platform home" className="inline-flex items-center text-muted-foreground hover:text-foreground">
          <FiHome className="h-4 w-4" />
        </Link>
        <FiChevronRight className="h-4 w-4 text-muted-foreground" />
        {isSenarioDetail ? (
          <>
            <Link to={routes.voiceRoleplay} className="font-medium text-muted-foreground hover:text-foreground">
              Senario
            </Link>
            <FiChevronRight className="h-4 w-4 text-muted-foreground" />
          </>
        ) : null}
        <span className="font-medium text-foreground">{currentLabel}</span>
      </nav>
    </div>
  );
}
