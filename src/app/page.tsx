import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Hero } from "@/components/sections/Hero";
import { DemoSection } from "@/components/sections/DemoSection";
import { HowItWorks } from "@/components/sections/HowItWorks";
import { Features } from "@/components/sections/Features";
import { Industries } from "@/components/sections/Industries";
import { ROI } from "@/components/sections/ROI";
import { FAQ } from "@/components/sections/FAQ";
import { Contact } from "@/components/sections/Contact";
import { MagneticCursor } from "@/components/ui/magnetic-cursor";

export default function Home() {
  return (
    <MagneticCursor magneticFactor={0.3} cursorSize={28} blendMode="exclusion">
      <Navbar />
      <main>
        <Hero />
        <DemoSection />
        <HowItWorks />
        <Features />
        <Industries />
        <ROI />
        <FAQ />
        <Contact />
      </main>
      <Footer />
    </MagneticCursor>
  );
}




