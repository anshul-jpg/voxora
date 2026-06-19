"use client";

import { useState } from "react";
import * as Tabs from "@radix-ui/react-tabs";
import { Mic, Calendar, BarChart3, Zap } from "lucide-react";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/Badge";

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
    value: "voice",
    icon: <Mic className="h-4 w-4 shrink-0" />,
    label: "Voice AI",
    content: {
      badge: "Core Technology",
      title: "Conversations that sound completely human.",
      description:
        "Our AI voice agents handle complex multi-turn conversations with natural pacing, emotional awareness, and industry-specific vocabulary — callers rarely know they're speaking to an AI.",
      bulletPoints: [
        "Sub-200ms response latency",
        "40+ supported languages",
        "Custom voice cloning available",
        "Live call transcription & tagging",
      ],
      icon: <Mic className="h-10 w-10" />,
    },
  },
  {
    value: "scheduling",
    icon: <Calendar className="h-4 w-4 shrink-0" />,
    label: "Scheduling",
    content: {
      badge: "Automation",
      title: "Book, reschedule, cancel — without human touch.",
      description:
        "Real-time calendar sync means every appointment is confirmed during the call. SMS reminders, waitlist management, and conflict detection all happen automatically.",
      bulletPoints: [
        "Integrates with Google Calendar, Calendly, Dentrix",
        "Automated SMS & email confirmations",
        "Smart waitlist with auto-fill",
        "Recurring appointment series support",
      ],
      icon: <Calendar className="h-10 w-10" />,
    },
  },
  {
    value: "analytics",
    icon: <BarChart3 className="h-4 w-4 shrink-0" />,
    label: "Analytics",
    content: {
      badge: "Insights",
      title: "Every call surfaces actionable intelligence.",
      description:
        "Turn your call volume into a competitive advantage. Track call outcomes, lead quality scores, missed-revenue attribution, and agent performance in a single dashboard.",
      bulletPoints: [
        "Real-time call outcome scoring",
        "Missed-revenue attribution reports",
        "Custom KPI dashboards",
        "Weekly AI-generated business briefs",
      ],
      icon: <BarChart3 className="h-10 w-10" />,
    },
  },
  {
    value: "integrations",
    icon: <Zap className="h-4 w-4 shrink-0" />,
    label: "Integrations",
    content: {
      badge: "Ecosystem",
      title: "Plugs into the tools your team already uses.",
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
    <section id="features" className="py-24 md:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <Badge
            variant="outline"
            className="mb-4 border-[rgba(254,254,254,0.12)] text-[rgba(254,254,254,0.5)] bg-transparent"
          >
            Features
          </Badge>
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
                    <Badge
                      variant="outline"
                      className="mb-4 border-[rgba(254,254,254,0.12)] text-[rgba(254,254,254,0.5)] bg-transparent"
                    >
                      {tab.content.badge}
                    </Badge>
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
