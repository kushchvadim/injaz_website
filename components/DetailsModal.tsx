'use client';

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Award, CheckCircle2, DollarSign, MapPin, Target, Users } from 'lucide-react';
import { formatBudgetRange, formatReach } from '@/src/lib/opportunities/catalog';
import type { Opportunity } from '@/src/lib/seekbot/types';

interface DetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  opportunity: Opportunity | null;
  onConnect: () => void;
}

export function DetailsModal({ isOpen, onClose, opportunity, onConnect }: DetailsModalProps) {
  if (!opportunity) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open) onClose(); }}>
      <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
        <DialogHeader>
          <div className="mb-2 flex items-start justify-between gap-3">
            <DialogTitle className="text-2xl leading-tight">{opportunity.title}</DialogTitle>
            <Badge variant="outline" className="shrink-0 border-primary/50 text-primary">
              <CheckCircle2 className="mr-1 h-3 w-3" />
              Verified
            </Badge>
          </div>
          <DialogDescription className="text-base">
            {opportunity.category.length > 0 ? opportunity.category.join(' • ') : 'Sponsorship Opportunity'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="flex items-center gap-3 rounded-lg border border-border bg-muted/50 p-3">
              <MapPin className="h-5 w-5 text-primary" />
              <div>
                <p className="text-xs text-muted-foreground">Location</p>
                <p className="font-medium">{opportunity.location}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 rounded-lg border border-border bg-muted/50 p-3">
              <Award className="h-5 w-5 text-primary" />
              <div>
                <p className="text-xs text-muted-foreground">Estimated Reach</p>
                <p className="font-medium">{formatReach(opportunity)}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 rounded-lg border border-border bg-muted/50 p-3 sm:col-span-2">
              <DollarSign className="h-5 w-5 text-primary" />
              <div>
                <p className="text-xs text-muted-foreground">Budget Range</p>
                <p className="font-medium">{formatBudgetRange(opportunity)}</p>
              </div>
            </div>
          </div>

          <div>
            <h3 className="mb-2 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              Description
            </h3>
            <p className="leading-relaxed">{opportunity.full_description}</p>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                <Users className="h-4 w-4" />
                Target Audience
              </h3>
              <div className="flex flex-wrap gap-2">
                {opportunity.audience.map((audience) => (
                  <Badge key={audience} variant="outline">
                    {audience}
                  </Badge>
                ))}
              </div>
            </div>
            <div>
              <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                <Target className="h-4 w-4" />
                Categories
              </h3>
              <div className="flex flex-wrap gap-2">
                {opportunity.category.map((category) => (
                  <Badge key={category} variant="outline">
                    {category}
                  </Badge>
                ))}
              </div>
            </div>
          </div>

          <div>
            <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              Sponsorship Benefits
            </h3>
            <ul className="space-y-2">
              {opportunity.sponsorship_benefits.map((benefit) => (
                <li key={benefit} className="flex items-start gap-2">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                  <span className="text-sm">{benefit}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="flex flex-wrap gap-2">
            {opportunity.tags.map((tag) => (
              <Badge key={tag} variant="secondary">
                {tag}
              </Badge>
            ))}
          </div>

          <Button
            className="w-full"
            onClick={() => {
              onClose();
              onConnect();
            }}
          >
            Request to Connect
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
