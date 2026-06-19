import Image from "next/image";
import Link from "next/link";
import { FOOTER_LINKS, SITE } from "@/lib/constants";

export function Footer() {
  return (
    <footer className="border-t border-[rgba(254,254,254,0.08)] bg-[#0a0a0a]">
      <div className="mx-auto max-w-7xl px-6 py-16 lg:px-8">
        <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-4">
          <div>
            <Link href="/" className="flex items-center gap-2">
              <Image src="/logo.svg" alt="Voxora Logo" width={24} height={24} className="h-6 w-6 text-white" />
              <span className="text-lg font-semibold text-white">{SITE.name}</span>
            </Link>
            <p className="mt-4 text-sm leading-relaxed text-[rgba(254,254,254,0.5)]">
              AI voice agents that answer calls, book appointments, and qualify leads — 24/7.
            </p>
          </div>

          <div>
            <h3 className="mb-4 text-sm font-semibold text-white">Company</h3>
            <ul className="space-y-3">
              {FOOTER_LINKS.company.map((link) => (
                <li key={link.label}>
                  <Link href={link.href} data-magnetic className="text-sm text-[rgba(254,254,254,0.5)] transition-colors hover:text-white cursor-none">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="mb-4 text-sm font-semibold text-white">Product</h3>
            <ul className="space-y-3">
              {FOOTER_LINKS.product.map((link) => (
                <li key={link.label}>
                  <Link href={link.href} data-magnetic className="text-sm text-[rgba(254,254,254,0.5)] transition-colors hover:text-white cursor-none">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="mb-4 text-sm font-semibold text-white">Legal</h3>
            <ul className="space-y-3">
              {FOOTER_LINKS.legal.map((link) => (
                <li key={link.label}>
                  <Link href={link.href} data-magnetic className="text-sm text-[rgba(254,254,254,0.5)] transition-colors hover:text-white cursor-none">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-[rgba(254,254,254,0.08)] pt-8 md:flex-row">
          <p className="text-sm text-[rgba(254,254,254,0.5)]">
            &copy; {new Date().getFullYear()} {SITE.name}. All rights reserved.
          </p>
          <div className="flex gap-6 text-sm text-[rgba(254,254,254,0.5)]">
            <a href={`mailto:${SITE.email}`} data-magnetic className="transition-colors hover:text-white cursor-none">
              {SITE.email}
            </a>
            <a href={`tel:${SITE.phone}`} data-magnetic className="transition-colors hover:text-white cursor-none">
              {SITE.phone}
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}

