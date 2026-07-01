export function SectionTitle({ title, description }: { title: string; description?: string }) {
  return (
    <div className="mb-1">
      <h2 className="text-lg font-semibold tracking-tight text-foreground">{title}</h2>
      {description && <p className="text-sm text-muted-foreground">{description}</p>}
    </div>
  );
}
