"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, Star } from "lucide-react";
import Link from "next/link";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

interface PricingPlan {
  name: string;
  price: string;
  yearlyPrice: string;
  period: string;
  features: string[];
  description: string;
  buttonText: string;
  href: string;
  isPopular: boolean;
  setupFee?: string;
  yearlySavings?: string;
}

interface PricingProps {
  plans: PricingPlan[];
  title?: string;
  description?: string;
}

export function Pricing({
  plans,
  title = "Simple, Transparent Pricing",
  description = "Choose the plan that works for you. All plans include access to our platform and dedicated support.",
}: PricingProps) {
  const [isMonthly, setIsMonthly] = useState(true);

  // Default to the most popular plan if found, otherwise default to the first plan
  const initialPopularIndex = plans.findIndex((plan) => plan.isPopular);
  const [activeMobilePlan, setActiveMobilePlan] = useState(
    initialPopularIndex !== -1 ? initialPopularIndex : 0
  );

  const renderPlanCard = (plan: PricingPlan, i: number, animate: boolean) => {
    const cardContent = (
      <div
        className={cn(
          "relative flex flex-col rounded-2xl p-6 sm:p-8 transition-all duration-300 h-full text-left",
          plan.isPopular
            ? "bg-[#fefefe] text-[#0a0a0a]"
            : "bg-[#191919] text-[#fefefe]"
        )}
        style={{
          border: plan.isPopular
            ? "none"
            : "1px solid rgba(254,254,254,0.08)",
        }}
      >
        {plan.isPopular && (
          <div className="absolute -top-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5 px-4 py-1 rounded-full bg-[#0a0a0a] text-[#fefefe] text-xs font-semibold whitespace-nowrap">
            <Star className="h-3 w-3 fill-current" />
            Most Popular
          </div>
        )}

        <h3
          className={cn(
            "text-xl font-semibold",
            plan.isPopular ? "text-[#0a0a0a]" : "text-[#fefefe]"
          )}
        >
          {plan.name}
        </h3>
        <p
          className={cn(
            "mt-2 text-sm leading-relaxed",
            plan.isPopular
              ? "text-[rgba(10,10,10,0.6)]"
              : "text-[rgba(254,254,254,0.5)]"
          )}
        >
          {plan.description}
        </p>

        {/* Price */}
        <div className="mt-6 flex flex-col gap-1.5">
          <div className="flex items-baseline gap-1">
            <span
              className={cn(
                "text-4xl font-bold tracking-tight",
                plan.isPopular ? "text-[#0a0a0a]" : "text-[#fefefe]"
              )}
            >
              {isMonthly ? plan.price : plan.yearlyPrice}
            </span>
            <span
              className={cn(
                "text-sm font-medium",
                plan.isPopular
                  ? "text-[rgba(10,10,10,0.5)]"
                  : "text-[rgba(254,254,254,0.4)]"
              )}
            >
              {plan.price === "Custom" ? "" : (isMonthly ? "/mo" : "/yr")}
            </span>
          </div>
          
          {plan.setupFee && (
            <div
              className={cn(
                "text-xs font-semibold uppercase tracking-wider",
                plan.isPopular
                  ? "text-[rgba(10,10,10,0.5)]"
                  : "text-[rgba(254,254,254,0.4)]"
              )}
            >
              + {plan.setupFee} Setup Fee
            </div>
          )}

          {!isMonthly && plan.yearlySavings && (
            <div className="mt-1">
              <span
                className={cn(
                  "inline-flex items-center px-2 py-0.5 rounded text-xs font-bold",
                  plan.isPopular
                    ? "bg-emerald-600/15 text-emerald-800 border border-emerald-600/25"
                    : "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                )}
              >
                {plan.yearlySavings}
              </span>
            </div>
          )}
        </div>

        {/* Features */}
        <ul className="mt-8 flex-1 space-y-3">
          {plan.features.map((feature) => (
            <li key={feature} className="flex items-start gap-2.5 text-sm">
              <Check
                className={cn(
                  "mt-0.5 h-4 w-4 shrink-0",
                  plan.isPopular
                    ? "text-[#0a0a0a]"
                    : "text-[rgba(254,254,254,0.7)]"
                )}
              />
              <span
                className={
                  plan.isPopular
                    ? "text-[rgba(10,10,10,0.8)]"
                    : "text-[rgba(254,254,254,0.7)]"
                }
              >
                {feature}
              </span>
            </li>
          ))}
        </ul>

        {/* CTA */}
        <Link
          href={plan.href}
          data-magnetic
          className={cn(
            "mt-8 block w-full py-3 px-6 rounded-xl text-sm font-semibold text-center transition-all duration-200",
            plan.isPopular
              ? "bg-[#0a0a0a] text-[#fefefe] hover:bg-[#191919]"
              : "border border-[rgba(254,254,254,0.15)] text-[#fefefe] hover:bg-[rgba(254,254,254,0.05)]"
          )}
        >
          {plan.buttonText}
        </Link>
      </div>
    );

    if (animate) {
      return (
        <motion.div
          key={plan.name}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: i * 0.1 }}
          className="h-full w-full"
        >
          {cardContent}
        </motion.div>
      );
    }

    return cardContent;
  };

  return (
    <section id="pricing" className="py-24 md:py-32 w-full max-w-[100vw] overflow-clip">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 w-full">
        {/* Header */}
        <div className="text-center mb-12">

          <h2 className="text-4xl font-semibold text-[#fefefe] md:text-5xl">{title}</h2>
          <p className="mt-4 text-[rgba(254,254,254,0.5)] max-w-xl mx-auto">{description}</p>
        </div>

        {/* Toggle */}
        <div className="flex items-center justify-center gap-2 sm:gap-4 flex-wrap mb-12">
          <Label
            htmlFor="billing-toggle"
            className={cn(
              "text-sm transition-colors cursor-pointer",
              isMonthly ? "text-[#fefefe]" : "text-[rgba(254,254,254,0.4)]"
            )}
          >
            Monthly
          </Label>
          <Switch
            id="billing-toggle"
            checked={!isMonthly}
            onCheckedChange={(v) => setIsMonthly(!v)}
          />
          <Label
            htmlFor="billing-toggle"
            className={cn(
              "text-sm transition-colors cursor-pointer flex items-center gap-2",
              !isMonthly ? "text-[#fefefe]" : "text-[rgba(254,254,254,0.4)]"
            )}
          >
            Yearly
            <span className="text-xs px-2 py-0.5 rounded-full bg-[rgba(254,254,254,0.08)] text-[rgba(254,254,254,0.7)]">
              2 Months Free
            </span>
          </Label>
        </div>

        {/* Desktop View (Standard Side-by-Side Grid) */}
        <div className="hidden md:grid md:grid-cols-2 lg:grid-cols-3 gap-8 w-full">
          {plans.map((plan, i) => renderPlanCard(plan, i, true))}
        </div>

        {/* Mobile View (Sleek Tab Switcher) */}
        <div className="md:hidden w-full flex flex-col items-center">
          {/* Tab buttons */}
          <div 
            className="flex items-center justify-center p-1 border rounded-full mb-8 w-full max-w-[280px] mx-auto"
            style={{
              background: "rgba(25,25,25,0.75)",
              borderColor: "rgba(254,254,254,0.06)",
              backdropFilter: "blur(8px)",
              WebkitBackdropFilter: "blur(8px)",
            }}
          >
            {plans.map((plan, idx) => {
              const isTabActive = activeMobilePlan === idx;
              return (
                <button
                  key={plan.name}
                  onClick={() => setActiveMobilePlan(idx)}
                  className={cn(
                    "relative flex-1 py-2 text-xs font-semibold rounded-full transition-colors duration-200 cursor-none select-none outline-none",
                    isTabActive ? "text-[#0a0a0a] font-bold" : "text-[rgba(254,254,254,0.4)] hover:text-white"
                  )}
                >
                  <span className="relative z-10">{plan.name}</span>
                  {isTabActive && (
                    <motion.div
                      layoutId="active-mobile-plan-tab"
                      className="absolute inset-0 bg-[#fefefe] rounded-full"
                      transition={{ type: "spring", stiffness: 380, damping: 30 }}
                    />
                  )}
                </button>
              );
            })}
          </div>

          {/* Active Card display with smooth fade/slide transition */}
          <div className="w-full min-h-[480px] px-4 overflow-visible">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeMobilePlan}
                initial={{ opacity: 0, x: 15 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -15 }}
                transition={{ duration: 0.2, ease: "easeInOut" }}
                className="w-full h-full pt-4"
              >
                {renderPlanCard(plans[activeMobilePlan], activeMobilePlan, false)}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  );
}
