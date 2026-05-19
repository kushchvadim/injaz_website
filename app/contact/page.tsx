'use client';

import Link from 'next/link';
import { FormEvent } from 'react';
import { motion } from 'framer-motion';
import { Mail, Phone, MapPin, Clock, ArrowRight, MessageCircle, Instagram, Linkedin } from 'lucide-react';

import { NavBar } from '@/components/NavBar';
import { Footer } from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

const contactDetails = [
  {
    icon: Mail,
    title: 'Email',
    description: 'Reach our partnerships team anytime.',
    value: 'sponsorseek.ceo@gmail.com',
    href: 'mailto:sponsorseek.ceo@gmail.com',
  },
  {
    icon: Phone,
    title: 'Phone',
    description: 'Chat with us Monday to Friday, 9am – 5pm.',
    value: '(04) 265 0792',
    href: 'tel:+97142650792',
  },
  {
    icon: MapPin,
    title: 'Location',
    description: 'Our headquarters in the UAE.',
    value: 'Dubai, UAE',
  },
  {
    icon: Clock,
    title: 'Response Time',
    description: 'We aim to respond within one business day.',
    value: '24 hours',
  },
  {
    icon: MessageCircle,
    title: 'WhatsApp',
    description: 'Message us directly for quick responses.',
    value: '+971 50 756 2271',
    href: 'https://wa.me/971507562271',
  },
  {
    icon: Instagram,
    title: 'Instagram',
    description: 'Follow our latest sponsorship stories.',
    value: 'instagram.com/sponsorseek',
    href: 'https://instagram.com/sponsorseek',
  },
  {
    icon: Linkedin,
    title: 'LinkedIn',
    description: 'Connect with us for professional updates.',
    value: 'linkedin.com/in/sponsor-seek-609a62389',
    href: 'https://ae.linkedin.com/in/sponsor-seek-609a62389',
  },
];

export default function ContactPage() {
  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);
    const name = formData.get('name')?.toString().trim() ?? '';
    const email = formData.get('email')?.toString().trim() ?? '';
    const organization = formData.get('organization')?.toString().trim() ?? '';
    const message = formData.get('message')?.toString().trim() ?? '';

    const subjectSuffix = name ? ` from ${name}` : '';
    const subject = `SponsorSeek inquiry${subjectSuffix}`;

    const bodyLines = [
      name && `Name: ${name}`,
      email && `Email: ${email}`,
      organization && `Organization: ${organization}`,
      message && `Message:\n${message}`,
    ].filter(Boolean);

    const params = new URLSearchParams({ subject });
    if (bodyLines.length > 0) {
      params.set('body', bodyLines.join('\n'));
    }

    window.location.href = `mailto:sponsorseek.ceo@gmail.com?${params.toString()}`;
    event.currentTarget.reset();
  };

  return (
    <main className="min-h-screen">
      <NavBar />

      <section className="relative overflow-hidden py-16 sm:py-24">
        <div className="absolute inset-0 -z-10">
          <div className="absolute inset-0 bg-gradient-radial from-primary/10 via-transparent to-transparent opacity-40" />
        </div>

        <div className="container mx-auto grid gap-12 px-4 lg:grid-cols-[1.1fr,0.9fr]">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-6"
          >
            <div className="space-y-4">
              <h1 className="text-4xl font-bold tracking-tight text-balance md:text-5xl">
                Let&apos;s build your next meaningful sponsorship
              </h1>
              <p className="max-w-2xl text-lg text-muted-foreground">
                Whether you&apos;re a brand planning your next activation or a community organizer looking for
                partners, our team is here to help you craft collaborations that resonate.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              {contactDetails.map((detail) => (
                <Card key={detail.title} className="border-primary/10 bg-background/90">
                  <CardContent className="flex items-start gap-4 p-5">
                    <detail.icon className="mt-1 h-5 w-5 text-primary" />
                    <div>
                      <p className="text-sm font-semibold uppercase tracking-wide text-primary/80">{detail.title}</p>
                      {detail.href ? (
                        <Link
                          href={detail.href}
                          className="mt-1 block text-base font-medium text-foreground transition-colors hover:text-primary"
                        >
                          {detail.value}
                        </Link>
                      ) : (
                        <p className="mt-1 text-base font-medium text-foreground">{detail.value}</p>
                      )}
                      <p className="mt-2 text-sm text-muted-foreground">{detail.description}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="rounded-lg border border-primary/20 bg-primary/5 p-6">
              <p className="text-sm text-foreground/80">
                Looking to showcase your initiative? Share your program details and we&apos;ll tailor a sponsorship
                roadmap aligned with your impact goals.
              </p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <Card className="border-primary/20 bg-background/95 shadow-xl backdrop-blur">
              <CardHeader>
                <CardTitle>Tell us about your goals</CardTitle>
                <CardDescription>
                  Fill out the form and a SponsorSeek specialist will reach out with curated opportunities.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form className="space-y-4" onSubmit={handleSubmit}>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="name">Full name</Label>
                      <Input id="name" name="name" placeholder="Your name" required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Work email</Label>
                      <Input id="email" name="email" type="email" placeholder="you@company.com" required />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="organization">Organization</Label>
                    <Input id="organization" name="organization" placeholder="Company or initiative" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="message">How can we help?</Label>
                    <Textarea
                      id="message"
                      name="message"
                      rows={4}
                      placeholder="Share your sponsorship needs, preferred audience, and timeline."
                    />
                  </div>
                  <Button type="submit" className="glow-green w-full">
                    Send message
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </form>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </section>

      <section className="pb-20">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="flex flex-col items-start justify-between gap-6 rounded-xl border border-primary/20 bg-primary/5 p-8 sm:flex-row sm:items-center"
          >
            <div>
              <h2 className="text-2xl font-semibold tracking-tight">Prefer a guided walkthrough?</h2>
              <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
                Book a 30-minute strategy session with our partnerships team to explore activation ideas and success
                metrics tailored to your objectives.
              </p>
            </div>
            <Link href="mailto:sponsorseek.ceo@gmail.com">
              <Button size="lg" className="glow-green-sm">
                Schedule a call
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
