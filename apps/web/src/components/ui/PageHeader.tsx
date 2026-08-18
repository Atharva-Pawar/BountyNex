import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { cn } from "../../lib/utils";

export function PageHeader({
  title,
  subtitle,
  eyebrow,
  actions,
}: {
  title: string;
  subtitle?: string;
  eyebrow?: string;
  actions?: React.ReactNode;
}) {
  return (
    <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
      <div>
        {eyebrow && (
          <p className="mb-1 font-mono text-[11px] uppercase tracking-wider text-ash">{eyebrow}</p>
        )}
        <h1 className="text-2xl font-medium tracking-tight text-paper">{title}</h1>
        {subtitle && <p className="mt-1 text-sm text-fog">{subtitle}</p>}
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  );
}

export function SectionHeading({
  eyebrow,
  title,
  description,
  actionHref,
  actionLabel,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  actionHref?: string;
  actionLabel?: string;
}) {
  return (
    <div className={cn("mb-6 flex items-end justify-between gap-4", !actionHref && "mb-8")}>
      <div className="max-w-2xl">
        {eyebrow && (
          <p className="mb-1 font-mono text-[11px] uppercase tracking-wider text-ash">{eyebrow}</p>
        )}
        <h2 className="text-lg font-medium tracking-tight text-paper">{title}</h2>
        {description && <p className="mt-1 text-sm leading-relaxed text-fog">{description}</p>}
      </div>
      {actionHref && actionLabel && (
        <Link
          to={actionHref}
          className="group inline-flex shrink-0 items-center gap-1 text-[13px] font-medium text-mist transition-colors duration-150 hover:text-paper"
        >
          {actionLabel}
          <ArrowRight className="h-3.5 w-3.5 transition-transform duration-150 group-hover:translate-x-0.5" />
        </Link>
      )}
    </div>
  );
}