import { cn } from "@/lib/utils";

interface SectionHeaderProps {
  badge?: string;
  title: string;
  highlight?: string;
  description?: string;
  className?: string;
  align?: "left" | "center";
}

export function SectionHeader({
  badge,
  title,
  highlight,
  description,
  className,
  align = "center",
}: SectionHeaderProps) {
  return (
    <div
      className={cn(
        "max-w-3xl",
        align === "center" && "mx-auto text-center",
        className
      )}
    >
      <h2 className="text-3xl font-semibold tracking-tight text-foreground md:text-4xl lg:text-5xl">
        {title}
        {highlight && (
          <>
            {" "}
            <span className="text-[rgba(254,254,254,0.5)]">{highlight}</span>
          </>
        )}
      </h2>
      {description && (
        <p className="mt-4 text-lg leading-relaxed text-[rgba(254,254,254,0.5)] md:text-xl">
          {description}
        </p>
      )}
    </div>
  );
}

