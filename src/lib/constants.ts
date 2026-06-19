import {
  Phone,
  Clock,
  Calendar,
  UserCheck,
  Database,
  Mic,
  MessageSquare,
  ArrowRightLeft,
  Globe,
  BarChart3,
  BookOpen,
  Stethoscope,
  Sparkles,
  Scale,
  Home,
  Wrench,
  Brain,
  Shield,
} from "lucide-react";
import type { Demo, FAQItem, HowItWorksStep, Industry, PricingPlan, ROIMetric, TrustItem } from "@/types";

export const SITE = {
  name: "Voxora",
  tagline: "AI Receptionists & Voice Agents for Business",
  email: "hello@voxora.ai",
  phone: "7860135069",
};

export const NAV_LINKS = [
  { label: "Features", href: "#features" },
  { label: "Demo", href: "#demo" },
  { label: "Industries", href: "#industries" },
  { label: "Pricing", href: "#pricing" },
  { label: "Contact", href: "#contact" },
];

export const TRUST_ITEMS: TrustItem[] = [
  {
    icon: Brain,
    title: "AI-Powered Conversations",
    description: "Natural, context-aware dialogue that handles complex caller requests with ease.",
  },
  {
    icon: Clock,
    title: "24/7 Availability",
    description: "Every call answered — nights, weekends, and holidays included.",
  },
  {
    icon: Calendar,
    title: "Appointment Booking",
    description: "Real-time scheduling synced with your calendar and booking systems.",
  },
  {
    icon: UserCheck,
    title: "Lead Qualification",
    description: "Capture intent, budget, and timeline before your team follows up.",
  },
  {
    icon: Database,
    title: "CRM Integration",
    description: "Caller data flows directly into your existing tools and workflows.",
  },
];

export const DEMOS: Demo[] = [
  {
    id: "dental",
    title: "Dental Receptionist",
    description: "Handles scheduling, insurance questions, and new patient intake for dental practices.",
    video: "/videos/dental-receptionist.mp4",
    category: "Healthcare",
  },
  {
    id: "law",
    title: "Law Firm Intake Agent",
    description: "Qualifies potential clients, collects case details, and schedules consultations.",
    video: "/videos/law-firm-intake.mp4",
    category: "Legal",
  },
  {
    id: "realestate",
    title: "Real Estate Lead Qualification",
    description: "Captures buyer and seller intent, property preferences, and viewing requests.",
    video: "/videos/real-estate-leads.mp4",
    category: "Real Estate",
  },
  {
    id: "afterhours",
    title: "After-Hours Call Answering",
    description: "Ensures no call goes unanswered outside business hours with full booking capability.",
    video: "/videos/after-hours.mp4",
    category: "All Industries",
  },
];

export const HOW_IT_WORKS: HowItWorksStep[] = [
  {
    step: 1,
    title: "Customer Calls",
    description: "A patient, client, or lead reaches your business line — day or night.",
  },
  {
    step: 2,
    title: "AI Answers Naturally",
    description: "Your voice agent greets callers with a warm, human-like tone tailored to your brand.",
  },
  {
    step: 3,
    title: "AI Books or Captures Info",
    description: "Appointments are scheduled, leads qualified, and caller details logged in real time.",
  },
  {
    step: 4,
    title: "You Get Notified",
    description: "Instant alerts via SMS, email, or CRM sync so your team never misses an opportunity.",
  },
];

export const FEATURES = [
  {
    icon: Mic,
    title: "Human-Like Voice Conversations",
    description: "Advanced speech synthesis with natural pacing, pauses, and industry-specific vocabulary.",
  },
  {
    icon: Calendar,
    title: "Appointment Scheduling",
    description: "Book directly into Google Calendar, Calendly, or your practice management system.",
  },
  {
    icon: Database,
    title: "CRM Integrations",
    description: "Sync with HubSpot, Salesforce, Clio, Dentrix, and 50+ business platforms.",
  },
  {
    icon: MessageSquare,
    title: "SMS Follow-Ups",
    description: "Automatic confirmation texts and follow-up messages sent after every call.",
  },
  {
    icon: ArrowRightLeft,
    title: "Call Transfers",
    description: "Seamlessly route urgent calls to the right team member when human help is needed.",
  },
  {
    icon: Globe,
    title: "Multi-Language Support",
    description: "Serve diverse communities with agents fluent in English, Spanish, and more.",
  },
  {
    icon: BarChart3,
    title: "Analytics Dashboard",
    description: "Track call volume, booking rates, lead quality, and ROI in one unified view.",
  },
  {
    icon: BookOpen,
    title: "Custom Business Knowledge",
    description: "Train your agent on services, pricing, policies, and FAQs specific to your business.",
  },
];

export const INDUSTRIES: Industry[] = [
  {
    icon: Stethoscope,
    title: "Dental Clinics",
    description: "Reduce front desk workload while capturing every new patient inquiry.",
    benefits: ["Reduce no-shows with SMS reminders", "Capture after-hours patients", "Free staff for in-office care"],
  },
  {
    icon: Sparkles,
    title: "Cosmetic Clinics",
    description: "Handle high-value consultation requests with a premium, professional experience.",
    benefits: ["Qualify treatment interest", "Book consultation slots", "Maintain brand consistency"],
  },
  {
    icon: Scale,
    title: "Law Firms",
    description: "Screen intake calls and collect case details before attorney follow-up.",
    benefits: ["Pre-qualify potential clients", "Capture case details accurately", "Schedule consultations"],
  },
  {
    icon: Home,
    title: "Real Estate",
    description: "Qualify buyers and sellers and schedule property viewings around the clock.",
    benefits: ["Capture lead intent instantly", "Schedule property viewings", "Never miss a hot lead"],
  },
  {
    icon: Wrench,
    title: "Home Services",
    description: "Book service calls and dispatch technicians without tying up your team.",
    benefits: ["Book service appointments", "Capture job details", "Route emergency calls"],
  },
];

export const ROI_METRICS: ROIMetric[] = [
  {
    label: "Missed Calls Recovered",
    value: "127",
    suffix: "/mo",
    description: "Calls answered that would have gone to voicemail",
  },
  {
    label: "Appointments Booked",
    value: "89",
    suffix: "/mo",
    description: "Scheduled automatically by your AI receptionist",
  },
  {
    label: "Hours Saved",
    value: "42",
    suffix: " hrs/mo",
    description: "Front desk time redirected to high-value work",
  },
  {
    label: "Revenue Captured",
    value: "$34.2K",
    suffix: "/mo",
    description: "Estimated from recovered calls and bookings",
  },
];

export const PRICING_PLANS: PricingPlan[] = [
  {
    name: "Starter",
    setupFee: "$199",
    monthlyFee: "$149",
    description: "Perfect for local businesses wanting to automate incoming calls.",
    features: [
      "AI receptionist",
      "Business hours handling",
      "FAQ answering",
      "Appointment booking",
      "Call summaries",
    ],
    cta: "Get Started",
  },
  {
    name: "Professional",
    setupFee: "$299",
    monthlyFee: "$249",
    description: "For growing businesses that need integrations and custom workflows.",
    features: [
      "Everything above",
      "CRM integration",
      "SMS confirmations",
      "After-hours answering",
      "Custom workflows",
    ],
    highlighted: true,
    cta: "Book Demo",
  },
  {
    name: "Enterprise",
    setupFee: "Custom",
    monthlyFee: "Custom",
    description: "Tailored solutions for multi-location and high-volume operations.",
    features: [
      "Unlimited call volume",
      "Dedicated success manager",
      "Custom voice & personality",
      "SLA guarantees",
      "Advanced analytics & API",
      "White-glove onboarding",
    ],
    cta: "Contact Sales",
  },
];

export const FAQ_ITEMS: FAQItem[] = [
  {
    question: "Does it sound human?",
    answer:
      "Yes. Our voice agents use advanced conversational AI with natural pacing, pauses, and industry-specific vocabulary. Most callers don't realize they're speaking with AI. We customize the voice, tone, and greeting to match your brand.",
  },
  {
    question: "Can it book appointments?",
    answer:
      "Absolutely. Voxora integrates with Google Calendar, Calendly, Dentrix, and most practice management systems. The AI checks real-time availability and books appointments during the call, then sends SMS confirmations automatically.",
  },
  {
    question: "Can it transfer calls?",
    answer:
      "Yes. You define transfer rules — urgent matters go to your on-call team, specific departments get routed correctly, and the AI provides context to the receiving person before connecting.",
  },
  {
    question: "Can it answer after hours?",
    answer:
      "This is one of our core strengths. Your AI receptionist works 24/7/365 — nights, weekends, and holidays. After-hours callers get the same quality experience as during business hours, with full booking capability.",
  },
  {
    question: "How long does setup take?",
    answer:
      "Most businesses go live within 5–7 business days. We handle agent training, integration setup, and testing. Enterprise deployments with custom integrations typically take 2–3 weeks.",
  },
];

export const FOOTER_LINKS = {
  company: [
    { label: "About", href: "#" },
    { label: "Careers", href: "#" },
    { label: "Blog", href: "#" },
  ],
  product: [
    { label: "Features", href: "#features" },
    { label: "Demo", href: "#demo" },
    { label: "Industries", href: "#industries" },
    { label: "Pricing", href: "#pricing" },
  ],
  legal: [
    { label: "Privacy Policy", href: "/privacy" },
    { label: "Terms of Service", href: "/terms" },
  ],
};

export const HERO_STATS = [
  { label: "Call Answer Rate", value: "98%", icon: Phone },
  { label: "Appointments This Week", value: "+47", icon: Calendar },
  { label: "Avg. Response Time", value: "<2s", icon: Shield },
];
