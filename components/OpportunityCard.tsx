'use client';

import { motion } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Award, Bookmark, BookmarkCheck, CheckCircle2, DollarSign, MapPin, Users } from 'lucide-react';
import { formatBudgetRange, formatReach } from '@/src/lib/opportunities/catalog';
import { useShortlist } from '@/src/lib/opportunities/shortlist';
import type { Opportunity } from '@/src/lib/seekbot/types';

interface OpportunityCardProps {
  opportunity: Opportunity;
  onDetails: () => void;
  onConnect: () => void;
  index: number;
}

export function OpportunityCard({ opportunity, onDetails, onConnect, index }: OpportunityCardProps) {
  const visibleTags = opportunity.tags.slice(0, 4);
  const remainingTags = opportunity.tags.length - visibleTags.length;
  const { isShortlisted, toggleShortlist } = useShortlist();
  const shortlisted = isShortlisted(opportunity.id);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: Math.min(index, 8) * 0.06 }}
      whileHover={{ y: -4 }}
      className="h-full"
    >
      <Card className="group h-full border-border/50 bg-card/50 backdrop-blur transition-all hover:border-primary/50 hover:shadow-lg hover:shadow-primary/10">
        <CardHeader>
          <div className="mb-2 flex items-start justify-between gap-3">
            <CardTitle className="text-xl leading-tight">{opportunity.title}</CardTitle>
            <Badge variant="outline" className="shrink-0 border-primary/50 text-primary">
              <CheckCircle2 className="mr-1 h-3 w-3" />
              Verified
            </Badge>
          </div>
          <CardDescription className="text-base">
            {opportunity.category.length > 0 ? opportunity.category.join(' • ') : 'Sponsorship Opportunity'}
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <MapPin className="h-4 w-4" />
            <span>{opportunity.location}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Users className="h-4 w-4" />
            <span>{opportunity.audience.slice(0, 2).join(', ') || 'Youth and community audience'}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Award className="h-4 w-4" />
            <span>{formatReach(opportunity)}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <DollarSign className="h-4 w-4" />
            <span>{formatBudgetRange(opportunity)}</span>
          </div>

          <p className="text-sm leading-relaxed">{opportunity.short_summary}</p>

          <div className="flex flex-wrap gap-2">
            {visibleTags.map((tag) => (
              <Badge key={tag} variant="secondary" className="text-xs">
                {tag}
              </Badge>
            ))}
            {remainingTags > 0 && (
              <Badge variant="outline" className="text-xs">
                +{remainingTags} more
              </Badge>
            )}
          </div>
        </CardContent>

        <CardFooter className="flex flex-col gap-2 sm:flex-row">
          <Button variant="outline" onClick={onDetails} className="w-full sm:flex-1">
            Details
          </Button>
          <Button
            variant={shortlisted ? 'secondary' : 'outline'}
            onClick={() => toggleShortlist(opportunity.id)}
            className="w-full sm:flex-1"
          >
            {shortlisted ? <BookmarkCheck className="mr-2 h-4 w-4" /> : <Bookmark className="mr-2 h-4 w-4" />}
            {shortlisted ? 'Shortlisted' : 'Shortlist'}
          </Button>
          <Button onClick={onConnect} className="w-full sm:flex-1">
            Request to Connect
          </Button>
        </CardFooter>
      </Card>
    </motion.div>
  );
}
