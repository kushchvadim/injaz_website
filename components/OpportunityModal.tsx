'use client';

import opportunitiesData from '@/src/data/opportunities.json';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Award, CheckCircle2, DollarSign, MapPin, Target, Users } from 'lucide-react';
import type { Opportunity, SeekBotCard } from '@/src/lib/seekbot/types';

interface OpportunityModalProps {
  card: SeekBotCard | null;
  isOpen: boolean;
  onClose: () => void;
}

const opportunities = opportunitiesData as Opportunity[];

function formatCurrencyRange(opportunity: Opportunity): string {
  return `AED ${opportunity.budget_min.toLocaleString()} – AED ${opportunity.budget_max.toLocaleString()}`;
}

export function OpportunityModal({ card, isOpen, onClose }: OpportunityModalProps) {
  if (!card) return null;

  const opportunity = opportunities.find((item) => item.id === card.id);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open) onClose(); }}>
      <DialogContent className="max-h-[90vh] max-w-3xl overflow-y-auto">
        <DialogHeader>
          <div className="mb-3 flex flex-wrap items-center gap-2">
            <Badge variant="outline" className="border-primary/50 text-primary">
              {card.match_score}% match
            </Badge>
            <Badge variant="secondary">{card.recommended_package}</Badge>
          </div>
          <DialogTitle className="text-2xl">{card.title}</DialogTitle>
          <DialogDescription>{card.why_match}</DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="flex items-center gap-3 rounded-lg border border-border bg-muted/40 p-3">
              <DollarSign className="h-5 w-5 text-primary" />
              <div>
                <p className="text-xs text-muted-foreground">Suggested Budget</p>
                <p className="font-medium">{card.suggested_budget}</p>
              </div>
            </div>
            {opportunity && (
              <div className="flex items-center gap-3 rounded-lg border border-border bg-muted/40 p-3">
                <Award className="h-5 w-5 text-primary" />
                <div>
                  <p className="text-xs text-muted-foreground">Package Range</p>
                  <p className="font-medium">{formatCurrencyRange(opportunity)}</p>
                </div>
              </div>
            )}
            {opportunity && (
              <>
                <div className="flex items-center gap-3 rounded-lg border border-border bg-muted/40 p-3">
                  <MapPin className="h-5 w-5 text-primary" />
                  <div>
                    <p className="text-xs text-muted-foreground">Location</p>
                    <p className="font-medium">{opportunity.location}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 rounded-lg border border-border bg-muted/40 p-3">
                  <Users className="h-5 w-5 text-primary" />
                  <div>
                    <p className="text-xs text-muted-foreground">Estimated Reach</p>
                    <p className="font-medium">{opportunity.estimated_reach.toLocaleString()} people</p>
                  </div>
                </div>
              </>
            )}
          </div>

          {opportunity && (
            <>
              <div>
                <h3 className="mb-2 flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                  <Target className="h-4 w-4" />
                  Opportunity Details
                </h3>
                <p className="leading-relaxed text-foreground/90">{opportunity.full_description}</p>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
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
                  <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
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
                <ul className="grid gap-2 sm:grid-cols-2">
                  {opportunity.sponsorship_benefits.map((benefit) => (
                    <li key={benefit} className="flex items-start gap-2 rounded-lg border border-border bg-muted/30 p-3">
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
            </>
          )}

          <Button className="w-full" onClick={onClose}>
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
