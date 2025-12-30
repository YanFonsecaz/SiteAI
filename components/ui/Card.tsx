import Link from "next/link";
import { cn } from "@/lib/utils";
import { ArrowRight } from "lucide-react";

interface CardProps {
  title: string;
  description: string;
  image?: string;
  href: string;
  date?: string;
  className?: string;
}

export function Card({ title, description, image, href, date, className }: CardProps) {
  return (
    <Link 
      href={href}
      className={cn(
        "group block h-full bg-surface border border-primary/10 rounded-xl overflow-hidden hover:border-primary/50 transition-all duration-300 hover:shadow-xl hover:shadow-primary/5",
        className
      )}
    >
      {image && (
        <div className="aspect-video w-full overflow-hidden">
          <img 
            src={image} 
            alt={title} 
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        </div>
      )}
      <div className="p-6">
        {date && (
          <div className="text-xs text-primary font-bold mb-3 uppercase tracking-wider">
            {date}
          </div>
        )}
        <h3 className="text-xl font-bold text-foreground mb-3 group-hover:text-primary transition-colors line-clamp-2 font-display">
          {title}
        </h3>
        <p className="text-muted text-sm leading-relaxed line-clamp-3 mb-4">
          {description}
        </p>
        <div className="flex items-center text-primary text-sm font-bold">
          Ler mais <ArrowRight className="ml-2 w-4 h-4 transition-transform group-hover:translate-x-1" />
        </div>
      </div>
    </Link>
  );
}
