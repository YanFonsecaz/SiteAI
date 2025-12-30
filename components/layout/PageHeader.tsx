import { cn } from "@/lib/utils";

interface PageHeaderProps {
  title: string;
  description?: string;
  className?: string;
  centered?: boolean;
}

export default function PageHeader({ title, description, className, centered = true }: PageHeaderProps) {
  return (
    <section className={cn("pt-32 pb-16 px-4 bg-primary/5 border-b border-primary/10", className)}>
      <div className={cn("container mx-auto max-w-4xl", centered && "text-center")}>
        <h1 className="font-display text-4xl md:text-5xl font-bold mb-6 text-foreground">{title}</h1>
        {description && (
          <p className="text-xl text-muted leading-relaxed max-w-2xl mx-auto">
            {description}
          </p>
        )}
      </div>
    </section>
  );
}
