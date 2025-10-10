'use client';

import { motion } from 'framer-motion';
import { Search, Sparkles, Handshake, BarChart3 } from 'lucide-react';

const steps = [
  {
    icon: Search,
    title: 'Browse Opportunities',
    description: 'Explore curated sponsorship opportunities that align with your brand values and goals.',
  },
  {
    icon: Sparkles,
    title: 'Get Matched by AI',
    description: 'Our SeekBot intelligently filters opportunities based on your objectives.',
  },
  {
    icon: Handshake,
    title: 'Connect & Collaborate',
    description: 'Request connections directly and build meaningful partnerships.',
  },
  {
    icon: BarChart3,
    title: 'Track Impact',
    description: 'Monitor your sponsorship outcomes and community engagement.',
  },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="py-24 md:py-32">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="mb-16 text-center"
        >
          <h2 className="mb-4 text-3xl font-bold tracking-tight md:text-5xl">How It Works</h2>
          <p className="text-lg text-muted-foreground">
            Four simple steps to meaningful sponsorship partnerships
          </p>
        </motion.div>

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <motion.div
                key={step.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="group relative"
              >
                <div className="rounded-lg border border-border bg-card p-6 transition-all hover:border-primary/50 hover:shadow-lg hover:shadow-primary/10">
                  <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary transition-all group-hover:bg-primary group-hover:text-primary-foreground">
                    <Icon className="h-6 w-6" />
                  </div>
                  <h3 className="mb-2 text-xl font-semibold">{step.title}</h3>
                  <p className="text-sm text-muted-foreground">{step.description}</p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
