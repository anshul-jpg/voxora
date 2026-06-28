"use client";

import { Play } from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";

import { NeonButton } from "@/components/ui/neon-button";
import { BackgroundPaths } from "@/components/ui/background-paths";
import { ConversationUI } from "@/components/mockups/ConversationUI";
import { DashboardMockup } from "@/components/mockups/DashboardMockup";
import { StatCard } from "@/components/mockups/StatCard";
import { HERO_STATS } from "@/lib/constants";

export function Hero() {
  return (
    <section className="relative overflow-hidden pt-20 pb-20 sm:pt-32 md:pt-40 md:pb-32">
      <BackgroundPaths />
      <div className="mx-auto max-w-7xl px-6 lg:px-8 relative z-10">
        <div className="grid items-center gap-16 lg:grid-cols-2">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.21, 0.47, 0.32, 0.98] }}
          >


            <h1 className="text-4xl font-semibold leading-[1.1] tracking-tight text-foreground sm:text-5xl lg:text-6xl">
              Never Miss Another{" "}
              <span className="text-muted-foreground">Customer Call</span>
            </h1>

            <p className="mt-6 max-w-xl text-lg leading-relaxed text-muted-foreground md:text-xl">
              AI voice agents that answer calls, book appointments, qualify leads,
              and support customers 24/7.
            </p>

            <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:items-start">
              <Link href="#contact">
                <NeonButton variant="solid" size="lg" data-magnetic>
                  Book Demo
                </NeonButton>
              </Link>
              <Link href="#demo">
                <NeonButton variant="ghost" size="lg" data-magnetic className="flex items-center justify-center gap-2">
                  <Play className="h-4 w-4 fill-current" />
                  Watch Live Demo
                </NeonButton>
              </Link>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2, ease: [0.21, 0.47, 0.32, 0.98] }}
            className="relative"
          >
            <div className="relative z-10">
              <ConversationUI />
            </div>

            <div className="absolute -top-6 -right-4 z-20 hidden md:block">
              <StatCard
                label={HERO_STATS[0].label}
                value={HERO_STATS[0].value}
                icon={HERO_STATS[0].icon}
                delay={0.6}
              />
            </div>

            <div className="absolute -bottom-4 -left-4 z-20 hidden md:block">
              <StatCard
                label={HERO_STATS[1].label}
                value={HERO_STATS[1].value}
                icon={HERO_STATS[1].icon}
                delay={0.8}
              />
            </div>

            <div className="mt-6 hidden lg:block">
              <DashboardMockup />
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

