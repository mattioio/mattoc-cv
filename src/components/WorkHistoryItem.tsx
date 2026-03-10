type Props = {
  company: string
  jobTitle: string
  startDate: string
  endDate?: string | null
  description: string
  companyUrl?: string | null
  index?: number
}

export function WorkHistoryItem({
  company,
  jobTitle,
  startDate,
  endDate,
  description,
  companyUrl,
}: Props) {
  return (
    <div
      data-timeline-item
      className="timeline-item relative grid gap-1 pb-10 pl-7 last:pb-0 sm:grid-cols-[180px_1fr] sm:gap-8 sm:pl-0"
    >
      {/* Timeline dot */}
      <div className="timeline-dot absolute left-0 top-[7px] z-10 h-[11px] w-[11px] rounded-full border-2 border-foreground bg-background sm:left-[194px]" />

      <div className="text-sm text-muted-foreground">
        {startDate}
        {endDate ? ` \u2014 ${endDate}` : ''}
      </div>
      <div>
        <h3
          className="text-lg font-semibold"
          style={{ fontFamily: 'var(--font-display)' }}
        >
          {companyUrl ? (
            <a
              href={companyUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="transition-opacity hover:opacity-70"
            >
              {company}
            </a>
          ) : (
            company
          )}
        </h3>
        <p className="mt-0.5 text-sm text-muted-foreground">{jobTitle}</p>
        <p className="mt-3 text-sm leading-relaxed text-foreground/80">{description}</p>
      </div>
    </div>
  )
}
