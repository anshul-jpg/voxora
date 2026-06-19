"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface NavItem {
  name: string;
  url: string;
  icon: LucideIcon;
}

interface NavBarProps {
  items: NavItem[];
  className?: string;
}

export function NavBar({ items, className }: NavBarProps) {
  const pathname = usePathname();
  const [activeTab, setActiveTab] = useState(items[0].name);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    if (pathname === "/pricing") {
      setActiveTab("Pricing");
      return;
    }

    if (pathname !== "/") return;

    const sections = ["features", "demo", "contact"];
    const options = {
      root: null,
      rootMargin: "-40% 0px -50% 0px",
      threshold: 0,
    };

    const observerCallback = (entries: IntersectionObserverEntry[]) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const id = entry.target.id;
          const matchingItem = items.find(
            (item) => item.url.endsWith(`#${id}`) || item.url.endsWith(id)
          );
          if (matchingItem) {
            setActiveTab(matchingItem.name);
          }
        }
      });
    };

    const observer = new IntersectionObserver(observerCallback, options);

    const handleScroll = () => {
      if (window.scrollY < 120) {
        setActiveTab("Home");
      }
    };

    window.addEventListener("scroll", handleScroll);

    sections.forEach((id) => {
      const element = document.getElementById(id);
      if (element) {
        observer.observe(element);
      }
    });

    // Handle initial hash on load
    const hash = window.location.hash;
    if (hash) {
      const id = hash.replace("#", "");
      const matchingItem = items.find(
        (item) => item.url.endsWith(`#${id}`) || item.url.endsWith(id)
      );
      if (matchingItem) {
        setActiveTab(matchingItem.name);
      }
    }

    return () => {
      observer.disconnect();
      window.removeEventListener("scroll", handleScroll);
    };
  }, [pathname, items]);

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>, item: typeof items[0]) => {
    setActiveTab(item.name);

    if (
      pathname === "/" &&
      (item.url.startsWith("#") || item.url.startsWith("/#") || item.url === "/")
    ) {
      const hash = item.url.includes("#") ? item.url.split("#")[1] : "";
      if (hash) {
        e.preventDefault();
        const element = document.getElementById(hash);
        if (element) {
          element.scrollIntoView({ behavior: "smooth" });
          window.history.pushState(null, "", `#${hash}`);
        }
      } else if (item.url === "/" || item.url === "/#") {
        e.preventDefault();
        window.scrollTo({ top: 0, behavior: "smooth" });
        window.history.pushState(null, "", "/");
      }
    }
  };

  return (
    <div
      className={cn(
        "fixed bottom-4 sm:bottom-auto sm:top-0 left-1/2 -translate-x-1/2 z-50 mb-6 sm:pt-6 w-auto max-w-[95vw]",
        className
      )}
    >
      <div
        className="flex items-center gap-1 sm:gap-2 py-1.5 px-2 rounded-full shadow-2xl"
        style={{
          background: "rgba(10,10,10,0.75)",
          border: "1px solid rgba(254,254,254,0.10)",
          backdropFilter: "blur(16px)",
          WebkitBackdropFilter: "blur(16px)",
        }}
      >
        {items.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.name;

          return (
            <Link
              key={item.name}
              href={item.url}
              onClick={(e) => handleClick(e, item)}
              data-magnetic
              className={cn(
                "relative cursor-none text-xs sm:text-sm font-medium px-4 sm:px-5 py-2 rounded-full transition-colors duration-300 select-none",
                "text-[rgba(254,254,254,0.55)] hover:text-[#fefefe]",
                isActive && "text-[#fefefe]"
              )}
            >
              <span className="hidden sm:inline">{item.name}</span>
              <span className="sm:hidden flex items-center justify-center">
                <Icon size={16} strokeWidth={2} />
              </span>

              {isActive && (
                <motion.div
                  layoutId="tubelight-lamp"
                  className="absolute inset-0 w-full rounded-full -z-10"
                  style={{ background: "rgba(254,254,254,0.08)" }}
                  initial={false}
                  transition={{ type: "spring", stiffness: 350, damping: 35 }}
                >
                  {/* Tubelight glow bar */}
                  <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-8 h-[3px] rounded-t-full bg-[#fefefe]">
                    <div className="absolute w-16 h-8 bg-[rgba(254,254,254,0.15)] rounded-full blur-md -top-3 -left-4" />
                    <div className="absolute w-10 h-6 bg-[rgba(254,254,254,0.10)] rounded-full blur-md -top-2 -left-1" />
                  </div>
                </motion.div>
              )}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
