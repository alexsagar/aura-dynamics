export function MaterialChip({ children }: { children: string }) {
  return (
    <span className="inline-flex items-center rounded-md border border-border bg-surface px-2 py-0.5 text-micro font-medium whitespace-nowrap text-muted">
      {children}
    </span>
  )
}

export function MaterialChipGroup({ materials }: { materials: string[] }) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {materials.map((m) => (
        <MaterialChip key={m}>{m}</MaterialChip>
      ))}
    </div>
  )
}
