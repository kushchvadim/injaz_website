'use client';

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CheckCircle2, MapPin, Users, DollarSign, Award, Building2 } from 'lucide-react';
import type { StudentProject, CommunityCompetition } from '@/lib/data';

interface DetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  opportunity: StudentProject | CommunityCompetition | null;
  type: 'project' | 'competition';
  onConnect: () => void;
}

export function DetailsModal({ isOpen, onClose, opportunity, type, onConnect }: DetailsModalProps) {
  if (!opportunity) return null;

  const isProject = type === 'project';
  const project = isProject ? (opportunity as StudentProject) : null;
  const competition = !isProject ? (opportunity as CommunityCompetition) : null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
        <DialogHeader>
          <div className="mb-2 flex items-start justify-between">
            <DialogTitle className="text-2xl">
              {isProject ? project?.title : competition?.name}
            </DialogTitle>
            {opportunity.verified && (
              <Badge variant="outline" className="border-primary/50 text-primary">
                <CheckCircle2 className="mr-1 h-3 w-3" />
                Verified
              </Badge>
            )}
          </div>
          <DialogDescription className="text-base">
            {isProject ? project?.category : competition?.type}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {isProject && project && (
            <>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="flex items-center gap-3 rounded-lg border border-border bg-muted/50 p-3">
                  <Building2 className="h-5 w-5 text-primary" />
                  <div>
                    <p className="text-xs text-muted-foreground">Institution</p>
                    <p className="font-medium">{project.institution}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 rounded-lg border border-border bg-muted/50 p-3">
                  <Users className="h-5 w-5 text-primary" />
                  <div>
                    <p className="text-xs text-muted-foreground">Age Group</p>
                    <p className="font-medium">{project.ageGroup}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 rounded-lg border border-border bg-muted/50 p-3">
                  <DollarSign className="h-5 w-5 text-primary" />
                  <div>
                    <p className="text-xs text-muted-foreground">Funding Needed</p>
                    <p className="font-medium">{project.fundingNeeded}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 rounded-lg border border-border bg-muted/50 p-3">
                  <Award className="h-5 w-5 text-primary" />
                  <div>
                    <p className="text-xs text-muted-foreground">Expected Reach</p>
                    <p className="font-medium">{project.expectedReach}</p>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="mb-2 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                  Description
                </h3>
                <p className="leading-relaxed">{project.description}</p>
              </div>

              <div>
                <h3 className="mb-2 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                  Why Sponsor This?
                </h3>
                <p className="leading-relaxed">{project.whySponsor}</p>
              </div>

              <div>
                <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                  Sponsor Benefits
                </h3>
                <ul className="space-y-2">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                    <span className="text-sm">Brand visibility across school and local media</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                    <span className="text-sm">CSR impact documentation and reporting</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                    <span className="text-sm">Recognition in project presentations</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                    <span className="text-sm">Partnership certificate and digital badges</span>
                  </li>
                </ul>
              </div>
            </>
          )}

          {!isProject && competition && (
            <>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="flex items-center gap-3 rounded-lg border border-border bg-muted/50 p-3">
                  <MapPin className="h-5 w-5 text-primary" />
                  <div>
                    <p className="text-xs text-muted-foreground">Location</p>
                    <p className="font-medium">{competition.location}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 rounded-lg border border-border bg-muted/50 p-3">
                  <Users className="h-5 w-5 text-primary" />
                  <div>
                    <p className="text-xs text-muted-foreground">Audience Size</p>
                    <p className="font-medium">{competition.audienceSize}</p>
                  </div>
                </div>
                <div className="sm:col-span-2">
                  <div className="flex items-center gap-3 rounded-lg border border-border bg-muted/50 p-3">
                    <DollarSign className="h-5 w-5 text-primary" />
                    <div>
                      <p className="text-xs text-muted-foreground">Sponsorship Packages</p>
                      <p className="font-medium">{competition.packages}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="mb-2 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                  Description
                </h3>
                <p className="leading-relaxed">{competition.description}</p>
              </div>

              <div>
                <h3 className="mb-2 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                  Visibility Perks
                </h3>
                <p className="leading-relaxed">{competition.visibilityPerks}</p>
              </div>

              <div>
                <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                  Sponsor Benefits
                </h3>
                <ul className="space-y-2">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                    <span className="text-sm">Premium brand placement at event venue</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                    <span className="text-sm">Social media promotion and tagging</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                    <span className="text-sm">Direct engagement with target audience</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                    <span className="text-sm">Post-event impact report and metrics</span>
                  </li>
                </ul>
              </div>
            </>
          )}

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
