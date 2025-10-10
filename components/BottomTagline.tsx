'use client';

import { motion } from 'framer-motion';

export function BottomTagline() {
  return (
    <section className="py-24">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="mx-auto max-w-3xl rounded-lg border border-primary/20 bg-gradient-to-br from-primary/10 to-transparent p-12 text-center"
        >
          <p className="text-2xl font-medium leading-relaxed text-balance md:text-3xl">
            For brands that believe in impact. For projects that deserve to be seen.{' '}
            <span className="text-primary">Welcome to SponsorSeek.</span>
          </p>
        </motion.div>
      </div>
    </section>
  );
}
