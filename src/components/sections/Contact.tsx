"use client";

import { useState } from "react";
import { CheckCircle } from "lucide-react";
import { FadeIn } from "@/components/ui/FadeIn";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { Button } from "@/components/ui/button";
import { SITE } from "@/lib/constants";
import { cn } from "@/lib/utils";

import SmartPhoneLink from "@/components/ui/SmartPhoneLink";

export function Contact() {
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const formData = new FormData(e.currentTarget);
    const payload = {
      name: formData.get("name") as string,
      email: formData.get("email") as string,
      company: formData.get("business") as string,
      phone: formData.get("phone") as string,
      message: formData.get("message") as string,
    };

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (data.success) {
        setSubmitted(true);
      } else {
        setError(data.message || "Failed to submit contact. Please try again.");
      }
    } catch {
      setError("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section id="contact" className="border-t border-[rgba(254,254,254,0.08)] bg-[#0a0a0a] py-24 md:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="grid gap-16 lg:grid-cols-2">
          <FadeIn>
            <SectionHeader
              badge="Contact"
              title="Book Your"
              highlight="Free Demo"
              description="See how Voxora can transform your call handling. We'll walk you through a live demo tailored to your industry."
              align="left"
            />

            <div className="mt-8 space-y-4">
              <div>
                <p className="text-sm text-[rgba(254,254,254,0.5)]">Email</p>
                <a
                  href={`mailto:${SITE.email}`}
                  data-magnetic
                  className="text-white transition-colors hover:text-[rgba(254,254,254,0.7)] hover:underline cursor-none inline-block"
                >
                  {SITE.email}
                </a>
              </div>
              <div>
                <p className="text-sm text-[rgba(254,254,254,0.5)]">Phone</p>
                <SmartPhoneLink
                  phoneRaw={SITE.phone}
                  displayLabel={SITE.phone}
                  data-magnetic
                  className="text-white transition-colors hover:text-[rgba(254,254,254,0.7)] hover:underline cursor-none inline-block"
                />
              </div>
            </div>
          </FadeIn>

          <FadeIn delay={0.2}>
            {submitted ? (
              <div className="flex flex-col items-center justify-center rounded-2xl border border-[rgba(254,254,254,0.08)] bg-[#191919] p-12 text-center">
                <CheckCircle className="h-12 w-12 text-[#fefefe]" />
                <h3 className="mt-4 text-xl font-semibold text-white">Thank you!</h3>
                <p className="mt-2 text-sm text-[rgba(254,254,254,0.5)]">
                  We&apos;ll be in touch within one business day to schedule your demo.
                </p>
              </div>
            ) : (
              <form
                onSubmit={handleSubmit}
                className="rounded-2xl border border-[rgba(254,254,254,0.08)] bg-transparent p-8"
              >
                <div className="grid gap-5 sm:grid-cols-2">
                  <div>
                    <label htmlFor="name" className="mb-2 block text-sm text-[rgba(254,254,254,0.5)]">
                      Name
                    </label>
                    <input
                      id="name"
                      name="name"
                      type="text"
                      required
                      className={inputClass}
                      placeholder="John Smith"
                    />
                  </div>
                  <div>
                    <label htmlFor="business" className="mb-2 block text-sm text-[rgba(254,254,254,0.5)]">
                      Business
                    </label>
                    <input
                      id="business"
                      name="business"
                      type="text"
                      required
                      className={inputClass}
                      placeholder="Smile Dental Clinic"
                    />
                  </div>
                  <div>
                    <label htmlFor="email" className="mb-2 block text-sm text-[rgba(254,254,254,0.5)]">
                      Email
                    </label>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      required
                      className={inputClass}
                      placeholder="john@smiledental.com"
                    />
                  </div>
                  <div>
                    <label htmlFor="phone" className="mb-2 block text-sm text-[rgba(254,254,254,0.5)]">
                      Phone
                    </label>
                    <input
                      id="phone"
                      name="phone"
                      type="tel"
                      required
                      className={inputClass}
                      placeholder="(555) 123-4567"
                    />
                  </div>
                </div>
                <div className="mt-5">
                  <label htmlFor="message" className="mb-2 block text-sm text-[rgba(254,254,254,0.5)]">
                    Message
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    rows={4}
                    className={cn(inputClass, "resize-none")}
                    placeholder="Tell us about your business and call volume..."
                  />
                </div>
                {error && (
                  <p className="mt-4 text-sm text-[#ff4d4d] text-center">{error}</p>
                )}
                <Button 
                  type="submit" 
                  size="lg" 
                  className="mt-6 w-full cursor-none" 
                  data-magnetic
                  disabled={loading}
                >
                  {loading ? "Submitting..." : "Book Demo"}
                </Button>
              </form>
            )}
          </FadeIn>
        </div>
      </div>
    </section>
  );
}

const inputClass =
  "w-full rounded-xl border border-[rgba(254,254,254,0.08)] bg-[rgba(254,254,254,0.03)] px-4 py-3 text-sm text-white placeholder:text-[rgba(254,254,254,0.3)] transition-colors focus:border-[#fefefe]/50 focus:outline-none focus:ring-1 focus:ring-[#fefefe]/30";

