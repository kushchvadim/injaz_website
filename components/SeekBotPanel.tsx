'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { X, Bot } from 'lucide-react';

interface SeekBotPanelProps {
  isOpen: boolean;
  onClose: () => void;
  selectedGoal: string | null;
  onSelectGoal: (goal: string) => void;
}

const goals = [
  { id: 'visibility', label: 'Visibility', tag: 'Visibility' },
  { id: 'csr', label: 'CSR Impact', tag: 'CSR Impact' },
  { id: 'youth', label: 'Youth Engagement', tag: 'Youth Engagement' },
];

export function SeekBotPanel({ isOpen, onClose, selectedGoal, onSelectGoal }: SeekBotPanelProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm"
          />
          <motion.div
            initial={{ x: 300, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 300, opacity: 0 }}
            transition={{ type: 'spring', damping: 25 }}
            className="fixed right-0 top-0 z-50 h-full w-full max-w-md border-l border-border bg-card p-6 shadow-2xl"
          >
            <div className="mb-6 flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                  <Bot className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h2 className="text-xl font-bold">SeekBot</h2>
                  <p className="text-xs text-muted-foreground">AI-Powered Matching</p>
                </div>
              </div>
              <Button variant="ghost" size="icon" onClick={onClose}>
                <X className="h-4 w-4" />
              </Button>
            </div>

            <div className="space-y-6">
              <div className="rounded-lg border border-primary/20 bg-primary/5 p-4">
                <p className="text-sm leading-relaxed">
                  Hi! I&apos;m SeekBot. Tell me your goal - do you want{' '}
                  <strong>Visibility</strong>, <strong>CSR Impact</strong>, or{' '}
                  <strong>Youth Engagement</strong>?
                </p>
              </div>

              <div>
                <p className="mb-4 text-sm font-medium">Select Your Goal:</p>
                <div className="space-y-3">
                  {goals.map((goal) => (
                    <Button
                      key={goal.id}
                      variant={selectedGoal === goal.tag ? 'default' : 'outline'}
                      className="w-full justify-start"
                      onClick={() => onSelectGoal(goal.tag)}
                    >
                      {goal.label}
                    </Button>
                  ))}
                </div>
              </div>

              {selectedGoal && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="rounded-lg border border-border bg-muted/50 p-4"
                >
                  <p className="text-sm text-muted-foreground">
                    Filtering opportunities for: <strong className="text-foreground">{selectedGoal}</strong>
                  </p>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onSelectGoal('')}
                    className="mt-2"
                  >
                    Clear Filter
                  </Button>
                </motion.div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
