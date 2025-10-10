'use client';

import { motion } from 'framer-motion';
import { Building2, Users, Award } from 'lucide-react';

export function SocialProof() {
  return (
    <section className="py-16">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <p className="mb-8 text-sm font-medium uppercase tracking-wider text-muted-foreground">
            Trusted by forward-thinking SMEs & CSR teams
          </p>
          <div className="flex flex-wrap items-center justify-center gap-8 opacity-50">
            <div className="flex items-center gap-2">
              <Building2 className="h-8 w-8" />
              <span className="text-lg font-semibold">Brands</span>
            </div>
            <div className="flex items-center gap-2">
              <Users className="h-8 w-8" />
              <span className="text-lg font-semibold">Communities</span>
            </div>
            <div className="flex items-center gap-2">
              <Award className="h-8 w-8" />
              <span className="text-lg font-semibold">Impact</span>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
