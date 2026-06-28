"use client";

import { useState } from "react";
import * as Tabs from "@radix-ui/react-tabs";
import { Mic, Calendar, Zap, Clock, UserCheck, Phone } from "lucide-react";
import { motion } from "framer-motion";


interface TabContent {
  badge: string;
  title: string;
  description: string;
  bulletPoints: string[];
  icon: React.ReactNode;
}

interface FeatureTab {
  value: string;
  icon: React.ReactNode;
  label: string;
  content: TabContent;
}

const tabs: FeatureTab[] = [
  {
    value: "receptionist",
    icon: <Phone className="h-4 w-4 shrink-0" />,
    label: "AI Receptionist",
    content: {
      badge: "Core Technology",
      title: "Conversations that sound completely human.",
      description:
        "Our AI voice agents handle complex multi-turn conversations with natural pacing, emotional awareness, and industry-specific vocabulary — callers rarely know they're speaking to an AI.",
      bulletPoints: [
        "Sub-200ms response latency",
        "Natural, context-aware dialogue",
        "Custom voice cloning available",
        "Live call transcription & tagging",
      ],
      icon: <Phone className="h-10 w-10" />,
    },
  },
  {
    value: "availability",
    icon: <Clock className="h-4 w-4 shrink-0" />,
    label: "24/7 Answering",
    content: {
      badge: "Availability",
      title: "Always on, day or night.",
      description:
        "Every call is answered instantly — nights, weekends, and holidays included. No voicemails, no hold times, just instant responses.",
      bulletPoints: [
        "100% answer rate",
        "Simultaneous call handling (no busy signals)",
        "After-hours and holiday coverage",
        "Zero wait times for callers",
      ],
      icon: <Clock className="h-10 w-10" />,
    },
  },
  {
    value: "booking",
    icon: <Calendar className="h-4 w-4 shrink-0" />,
    label: "Booking",
    content: {
      badge: "Automation",
      title: "Book, reschedule, cancel — without human touch.",
      description:
        "Real-time calendar sync means every appointment is confirmed during the call. SMS reminders, waitlist management, and conflict detection all happen automatically.",
      bulletPoints: [
        "Integrates with Google Calendar, Calendly, CRM",
        "Automated SMS & email confirmations",
        "Smart waitlists & rescheduling",
        "Real-time slot availability checks",
      ],
      icon: <Calendar className="h-10 w-10" />,
    },
  },
  {
    value: "qualification",
    icon: <UserCheck className="h-4 w-4 shrink-0" />,
    label: "Lead Qualification",
    content: {
      badge: "Sales Automation",
      title: "Qualify leads before they reach your team.",
      description:
        "Filter out spam and capture caller intent, budget, timeline, and contact info. Automatically prioritize and log high-value leads.",
      bulletPoints: [
        "Intent and budget qualification",
        "Instant high-value lead routing",
        "Zero-friction customer screening",
        "Immediate team notifications via SMS/Email",
      ],
      icon: <UserCheck className="h-10 w-10" />,
    },
  },
  {
    value: "integrations",
    icon: <Zap className="h-4 w-4 shrink-0" />,
    label: "Integrations",
    content: {
      badge: "Ecosystem",
      title: "Plugs into the tools you already use.",
      description:
        "Voxora connects to your CRM, practice management software, and communication stack in days — not months. No engineering lift required.",
      bulletPoints: [
        "Salesforce, HubSpot, Zoho CRM",
        "Zapier & Make automation bridges",
        "REST API + webhooks for custom builds",
        "HIPAA-compliant data handling",
      ],
      icon: <Zap className="h-10 w-10" />,
    },
  },
];

export function Feature108() {
  const [active, setActive] = useState(tabs[0].value);
  const activeTab = tabs.find((t) => t.value === active) ?? tabs[0];

  return (
    <section id="features" className="relative py-24 md:py-32 overflow-hidden bg-[#050505]">
      {/* Ambient background glow */}
      <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-[550px] h-[550px] bg-ambient-pink rounded-full blur-[130px] animate-ambient" style={{ animationDelay: "-8s" }} />
        <div className="absolute top-1/3 right-1/4 w-[450px] h-[450px] bg-ambient-blue rounded-full blur-[110px] animate-ambient" />
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">

          <h2 className="text-4xl font-semibold text-[#fefefe] md:text-5xl max-w-2xl mx-auto">
            Everything you need to{" "}
            <span className="text-[rgba(254,254,254,0.4)]">never miss a call</span>
          </h2>
        </div>

        <Tabs.Root value={active} onValueChange={setActive}>
          {/* Tab list */}
          <Tabs.List className="flex flex-wrap items-center justify-center gap-2 mb-10">
            {tabs.map((tab) => (
              <Tabs.Trigger
                key={tab.value}
                value={tab.value}
                data-magnetic
                className="flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-200 cursor-none outline-none"
                style={{
                  border:
                    active === tab.value
                      ? "1px solid rgba(254,254,254,0.3)"
                      : "1px solid rgba(254,254,254,0.08)",
                  background:
                    active === tab.value
                      ? "rgba(254,254,254,0.08)"
                      : "transparent",
                  color:
                    active === tab.value
                      ? "#fefefe"
                      : "rgba(254,254,254,0.45)",
                }}
              >
                {tab.icon}
                {tab.label}
              </Tabs.Trigger>
            ))}
          </Tabs.List>

          {/* Content panel */}
          <div
            className="rounded-2xl p-8 md:p-12 lg:p-16"
            style={{
              background: "rgba(25,25,25,0.5)",
              border: "1px solid rgba(254,254,254,0.06)",
            }}
          >
            {tabs.map((tab) => (
              <Tabs.Content key={tab.value} value={tab.value} asChild>
                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.35, ease: "easeOut" }}
                  className="grid gap-12 lg:grid-cols-2 lg:gap-16 items-center"
                >
                  {/* Left: text */}
                  <div>

                    <h3 className="text-3xl font-semibold text-[#fefefe] leading-tight md:text-4xl">
                      {tab.content.title}
                    </h3>
                    <p className="mt-4 text-[rgba(254,254,254,0.5)] leading-relaxed">
                      {tab.content.description}
                    </p>
                    <ul className="mt-6 space-y-2.5">
                      {tab.content.bulletPoints.map((point) => (
                        <li key={point} className="flex items-center gap-3 text-sm text-[rgba(254,254,254,0.7)]">
                          <span className="h-1.5 w-1.5 rounded-full bg-[#fefefe] shrink-0" />
                          {point}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Right: visual */}
                  <div
                    className="flex items-center justify-center rounded-2xl aspect-video"
                    style={{
                      background: "rgba(10,10,10,0.6)",
                      border: "1px solid rgba(254,254,254,0.06)",
                    }}
                  >
                    <div className="text-[rgba(254,254,254,0.12)]">
                      {tab.content.icon}
                    </div>
                  </div>
                </motion.div>
              </Tabs.Content>
            ))}
          </div>
        </Tabs.Root>
      </div>
    </section>
  );
}
