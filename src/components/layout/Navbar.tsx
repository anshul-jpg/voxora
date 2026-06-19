"use client";

import {
  Home,
  Zap,
  BarChart3,
  DollarSign,
  Mail,
  Play,
} from "lucide-react";
import { NavBar } from "@/components/ui/tubelight-navbar";
import Link from "next/link";

const NAV_ITEMS = [
  { name: "Home", url: "/", icon: Home },
  { name: "Features", url: "/#features", icon: Zap },
  { name: "Pricing", url: "/pricing", icon: DollarSign },
  { name: "Demo", url: "/#demo", icon: Play },
  { name: "Contact", url: "/#contact", icon: Mail },
];

export function Navbar() {
  return (
    <>
      {/* Center floating pill */}
      <NavBar items={NAV_ITEMS} />
    </>
  );
}
