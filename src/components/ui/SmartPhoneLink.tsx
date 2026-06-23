"use client";

import React, { useState } from "react";
import { cn } from "@/lib/utils";

interface SmartPhoneLinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  phoneRaw: string;
  displayLabel: string;
}

export default function SmartPhoneLink({
  phoneRaw,
  displayLabel,
  className,
  ...props
}: SmartPhoneLinkProps) {
  const [copied, setCopied] = useState(false);

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    const isDesktopPC = window.innerWidth > 1024;

    if (isDesktopPC) {
      e.preventDefault();
      navigator.clipboard.writeText(phoneRaw);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <a
      href={`tel:${phoneRaw}`}
      onClick={handleClick}
      className={cn("relative inline-block transition-opacity hover:opacity-80", className)}
      {...props}
    >
      {displayLabel}
      {copied && (
        <span className="absolute -top-8 left-1/2 -translate-x-1/2 rounded bg-white px-2 py-0.5 text-[10px] font-bold text-black shadow-lg whitespace-nowrap z-50">
          Copied!
        </span>
      )}
    </a>
  );
}
