'use client';

import { motion } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle2, MapPin, Users, DollarSign, Award } from 'lucide-react';
import type { StudentProject, CommunityCompetition } from '@/lib/data';

interface OpportunityCardProps {
  opportunity: StudentProject | CommunityCompetition;
  type: 'project' | 'competition';
  onDetails: () => void;
  onConnect: () => void;
  index: number;
}

export function OpportunityCard({ opportunity, type, onDetails, onConnect, index }: OpportunityCardProps) {
  const isProject = type === 'project';
  const project = isProject ? (opportunity as StudentProject) : null;
  const competition = !isProject ? (opportunity as CommunityCompetition) : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.1 }}
      whileHover={{ y: -4 }}
      className="h-full"
    >
      <Card className="group h-full border-border/50 bg-card/50 backdrop-blur transition-all hover:border-primary/50 hover:shadow-lg hover:shadow-primary/10">
        <CardHeader>
          <div className="mb-2 flex items-start justify-between">
            <CardTitle className="text-xl">
              {isProject ? project?.title : competition?.name}
            </CardTitle>
            {opportunity.verified && (
              <Badge variant="outline" className="border-primary/50 text-primary">
                <CheckCircle2 className="mr-1 h-3 w-3" />
                Verified
              </Badge>
            )}
          </div>
          <CardDescription className="text-base">
            {isProject ? project?.category : competition?.type}
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          {isProject && project && (
            <>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Users className="h-4 w-4" />
                <span>{project.institution} • {project.ageGroup}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <DollarSign className="h-4 w-4" />
                <span>{project.fundingNeeded}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Award className="h-4 w-4" />
                <span>{project.expectedReach}</span>
              </div>
              <p className="text-sm leading-relaxed">{project.description}</p>
            </>
          )}

          {!isProject && competition && (
            <>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <MapPin className="h-4 w-4" />
                <span>{competition.location}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Users className="h-4 w-4" />
                <span>{competition.audienceSize}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <DollarSign className="h-4 w-4" />
                <span>{competition.packages}</span>
              </div>
              <p className="text-sm leading-relaxed">{competition.description}</p>
            </>
          )}

          <div className="flex flex-wrap gap-2">
            {opportunity.tags.map((tag) => (
              <Badge key={tag} variant="secondary" className="text-xs">
                {tag}
              </Badge>
            ))}
          </div>
        </CardContent>

        <CardFooter className="flex gap-2">
          <Button variant="outline" onClick={onDetails} className="flex-1">
            Details
          </Button>
          <Button onClick={onConnect} className="flex-1">
            Request to Connect
          </Button>
        </CardFooter>
      </Card>
    </motion.div>
  );
}
