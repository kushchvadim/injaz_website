'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { NavBar } from '@/components/NavBar';
import { Footer } from '@/components/Footer';
import { OpportunityCard } from '@/components/OpportunityCard';
import { SeekBotPanel } from '@/components/SeekBotPanel';
import { DetailsModal } from '@/components/DetailsModal';
import { RequestConnectModal } from '@/components/RequestConnectModal';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Bot, X } from 'lucide-react';
import { studentProjects, communityCompetitions, type StudentProject, type CommunityCompetition } from '@/lib/data';

type Category = 'projects' | 'competitions';
type OpportunityType = StudentProject | CommunityCompetition;

export default function OpportunitiesPage() {
  const [category, setCategory] = useState<Category>('projects');
  const [seekBotOpen, setSeekBotOpen] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState<string | null>(null);
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [connectModalOpen, setConnectModalOpen] = useState(false);
  const [selectedOpportunity, setSelectedOpportunity] = useState<OpportunityType | null>(null);

  const opportunities = category === 'projects' ? studentProjects : communityCompetitions;

  const filteredOpportunities = selectedGoal
    ? opportunities.filter((opp) => opp.tags.includes(selectedGoal))
    : opportunities;

  const handleSelectGoal = (goal: string) => {
    setSelectedGoal(goal === selectedGoal ? null : goal);
  };

  const handleDetails = (opportunity: OpportunityType) => {
    setSelectedOpportunity(opportunity);
    setDetailsModalOpen(true);
  };

  const handleConnect = (opportunity: OpportunityType) => {
    setSelectedOpportunity(opportunity);
    setConnectModalOpen(true);
  };

  return (
    <main className="min-h-screen">
      <NavBar />

      <div className="container mx-auto px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8"
        >
          <h1 className="mb-4 text-4xl font-bold tracking-tight md:text-5xl">
            Browse Opportunities
          </h1>
          <p className="text-lg text-muted-foreground">
            Curated listings for CSR impact, visibility, and youth engagement.
          </p>
        </motion.div>

        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex gap-2">
            <Button
              variant={category === 'projects' ? 'default' : 'outline'}
              onClick={() => setCategory('projects')}
            >
              Student Projects
            </Button>
            <Button
              variant={category === 'competitions' ? 'default' : 'outline'}
              onClick={() => setCategory('competitions')}
            >
              Community Competitions
            </Button>
          </div>

          <Button
            variant="outline"
            className="border-primary/50 hover:bg-primary/10"
            onClick={() => setSeekBotOpen(true)}
          >
            <Bot className="mr-2 h-4 w-4" />
            Ask SeekBot
          </Button>
        </div>

        {selectedGoal && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 flex items-center gap-2"
          >
            <Badge variant="secondary" className="text-sm">
              Filtered by: {selectedGoal}
              <button
                onClick={() => setSelectedGoal(null)}
                className="ml-2 hover:text-destructive"
                aria-label="Clear filter"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          </motion.div>
        )}

        <div className="mb-8 rounded-lg border border-primary/20 bg-primary/5 p-4">
          <p className="text-sm text-foreground/80">
            <strong>Commission Secured:</strong> All deals are processed securely through
            SponsorSeek&apos;s platform to ensure fair sponsorship management.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredOpportunities.map((opportunity, index) => (
            <OpportunityCard
              key={opportunity.id}
              opportunity={opportunity}
              type={category === 'projects' ? 'project' : 'competition'}
              onDetails={() => handleDetails(opportunity)}
              onConnect={() => handleConnect(opportunity)}
              index={index}
            />
          ))}
        </div>

        {filteredOpportunities.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="py-12 text-center"
          >
            <p className="text-lg text-muted-foreground">
              No opportunities match your selected filters. Try adjusting your criteria.
            </p>
          </motion.div>
        )}
      </div>

      <Footer />

      <SeekBotPanel
        isOpen={seekBotOpen}
        onClose={() => setSeekBotOpen(false)}
        selectedGoal={selectedGoal}
        onSelectGoal={handleSelectGoal}
      />

      <DetailsModal
        isOpen={detailsModalOpen}
        onClose={() => setDetailsModalOpen(false)}
        opportunity={selectedOpportunity}
        type={category === 'projects' ? 'project' : 'competition'}
        onConnect={() => {
          if (selectedOpportunity) handleConnect(selectedOpportunity);
        }}
      />

      <RequestConnectModal
        isOpen={connectModalOpen}
        onClose={() => setConnectModalOpen(false)}
        opportunityTitle={
          selectedOpportunity
            ? 'title' in selectedOpportunity
              ? selectedOpportunity.title
              : selectedOpportunity.name
            : ''
        }
      />
    </main>
  );
}
