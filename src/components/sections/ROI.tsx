"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { FadeIn } from "@/components/ui/FadeIn";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { ROI_METRICS } from "@/lib/constants";

function AnimatedMetric({ value, suffix }: { value: string; suffix: string }) {
  return (
    <span className="text-3xl font-semibold text-white md:text-4xl">
      {value}
      <span className="text-lg text-[rgba(254,254,254,0.5)]">{suffix}</span>
    </span>
  );
}

export function ROI() {
  const chartRef = useRef(null);
  const isInView = useInView(chartRef, { once: true });

  const chartData = [
    { month: "Jan", recovered: 85, booked: 52 },
    { month: "Feb", recovered: 102, booked: 61 },
    { month: "Mar", recovered: 118, booked: 74 },
    { month: "Apr", recovered: 127, booked: 89 },
  ];

  return (
    <section className="relative py-24 md:py-32 overflow-hidden">
      {/* Ambient background glow */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute bottom-10 left-1/3 w-[600px] h-[600px] bg-ambient-pink rounded-full blur-[140px] animate-ambient" style={{ animationDelay: "-5s" }} />
        <div className="absolute top-10 right-1/4 w-[500px] h-[500px] bg-ambient-blue rounded-full blur-[110px] animate-ambient" />
      </div>

      <div className="relative mx-auto max-w-7xl px-6 lg:px-8">
        <FadeIn>
          <SectionHeader
            badge="ROI"
            title="Real Results,"
            highlight="Real Revenue"
            description="See the impact an AI receptionist delivers for a typical multi-location practice."
          />
        </FadeIn>

        <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {ROI_METRICS.map((metric, i) => (
            <FadeIn key={metric.label} delay={i * 0.08}>
              <div className="rounded-2xl border border-[rgba(254,254,254,0.08)] bg-transparent p-6">
                <AnimatedMetric value={metric.value} suffix={metric.suffix} />
                <p className="mt-2 text-sm font-medium text-white">{metric.label}</p>
                <p className="mt-1 text-xs text-[rgba(254,254,254,0.5)]">{metric.description}</p>
              </div>
            </FadeIn>
          ))}
        </div>

        <FadeIn delay={0.3} className="mt-8">
          <div
            ref={chartRef}
            className="overflow-hidden rounded-2xl border border-[rgba(254,254,254,0.08)] bg-transparent p-6 md:p-8"
          >
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-white">Monthly Performance</h3>
                <p className="text-sm text-[rgba(254,254,254,0.5)]">Missed calls recovered vs. appointments booked</p>
              </div>
              <div className="flex gap-4 text-xs">
                <span className="flex items-center gap-1.5 text-white">
                  <span className="h-2.5 w-2.5 rounded-sm bg-gradient-gemini" />
                  Recovered
                </span>
                <span className="flex items-center gap-1.5 text-[rgba(254,254,254,0.5)]">
                  <span className="h-2.5 w-2.5 rounded-sm bg-gradient-gemini opacity-40" />
                  Booked
                </span>
              </div>
            </div>

            <div className="relative flex h-56 md:h-64 gap-4 items-stretch select-none">
              {/* Y-Axis Labels */}
              <div className="flex flex-col justify-between text-[10px] font-mono text-[rgba(254,254,254,0.3)] pb-6 pt-1 text-right w-8">
                <span>150</span>
                <span>100</span>
                <span>50</span>
                <span>0</span>
              </div>

              {/* Chart Grid & Columns Area */}
              <div className="relative flex-grow flex flex-col justify-between">
                {/* Horizontal Grid Lines */}
                <div className="absolute inset-0 flex flex-col justify-between pointer-events-none pb-6 pt-1">
                  <div className="w-full border-t border-[rgba(254,254,254,0.04)]" />
                  <div className="w-full border-t border-[rgba(254,254,254,0.04)]" />
                  <div className="w-full border-t border-[rgba(254,254,254,0.04)]" />
                  <div className="w-full border-t border-[rgba(254,254,254,0.08)]" />
                </div>

                {/* Columns */}
                <div className="relative flex flex-grow items-end gap-4 md:gap-8 pb-6">
                  {chartData.map((data, i) => (
                    <div key={data.month} className="flex flex-1 flex-col items-center justify-end h-full relative">
                      {/* Bars container */}
                      <div className="relative flex w-full items-end justify-center gap-1.5 h-full">
                        {/* Recovered Bar */}
                        <div className="relative w-full max-w-[28px] md:max-w-[36px] flex flex-col items-center justify-end h-full group">
                          {/* Hover Tooltip */}
                          <span className="absolute -top-6 text-[10px] font-mono font-semibold text-black bg-white px-1.5 py-0.5 rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-20 whitespace-nowrap">
                            {data.recovered} Rec
                          </span>
                          <motion.div
                            className="w-full rounded-t-sm border-t border-x"
                            style={{
                              background: "linear-gradient(to top, rgba(var(--accent-color-3-rgb), 0.4), var(--accent-color-1))",
                              boxShadow: "0 0 15px rgba(var(--accent-color-1-rgb), 0.3)",
                              borderColor: "rgba(var(--accent-color-1-rgb), 0.3)"
                            }}
                            initial={{ height: 0 }}
                            animate={isInView ? { height: `${(data.recovered / 150) * 100}%` } : { height: 0 }}
                            transition={{ duration: 0.8, delay: i * 0.12, ease: [0.21, 0.47, 0.32, 0.98] }}
                          />
                        </div>

                        {/* Booked Bar */}
                        <div className="relative w-full max-w-[28px] md:max-w-[36px] flex flex-col items-center justify-end h-full group">
                          {/* Hover Tooltip */}
                          <span className="absolute -top-6 text-[10px] font-mono font-semibold text-white/70 bg-neutral-900 border border-white/10 px-1.5 py-0.5 rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-20 whitespace-nowrap">
                            {data.booked} Bkd
                          </span>
                          <motion.div
                            className="w-full rounded-t-sm border-t border-x"
                            style={{
                              background: "linear-gradient(to top, rgba(var(--accent-color-3-rgb), 0.05), rgba(var(--accent-color-3-rgb), 0.4))",
                              borderColor: "rgba(var(--accent-color-3-rgb), 0.2)"
                            }}
                            initial={{ height: 0 }}
                            animate={isInView ? { height: `${(data.booked / 150) * 100}%` } : { height: 0 }}
                            transition={{ duration: 0.8, delay: i * 0.12 + 0.08, ease: [0.21, 0.47, 0.32, 0.98] }}
                          />
                        </div>
                      </div>
                      
                      {/* Month Label */}
                      <span className="absolute -bottom-6 text-[11px] font-medium tracking-wider text-[rgba(254,254,254,0.4)]">
                        {data.month}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </FadeIn>
      </div>
    </section>
  );
}

