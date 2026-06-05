'use client';

import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Bot, Filter, Search, X } from 'lucide-react';
import { NavBar } from '@/components/NavBar';
import { Footer } from '@/components/Footer';
import { OpportunityCard } from '@/components/OpportunityCard';
import { SeekBotChat } from '@/components/SeekBotChat';
import { DetailsModal } from '@/components/DetailsModal';
import { RequestConnectModal } from '@/components/RequestConnectModal';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  getFilterOptions,
  getOpportunitySearchText,
  opportunities as catalogOpportunities,
} from '@/src/lib/opportunities/catalog';
import { ShortlistProvider } from '@/src/lib/opportunities/shortlist';
import type { Opportunity } from '@/src/lib/seekbot/types';

type SortOption = 'title' | 'reach' | 'budget-min' | 'budget-max';

const ALL_VALUE = 'all';

function parseBudget(value: string): number | undefined {
  if (!value.trim()) return undefined;
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : undefined;
}

function opportunityMatchesBudget(opportunity: Opportunity, budgetMin?: number, budgetMax?: number): boolean {
  if (budgetMin === undefined && budgetMax === undefined) return true;

  const requestedMin = budgetMin ?? 0;
  const requestedMax = budgetMax ?? Number.MAX_SAFE_INTEGER;

  return requestedMin <= opportunity.budget_max && requestedMax >= opportunity.budget_min;
}

function sortOpportunities(items: Opportunity[], sortBy: SortOption): Opportunity[] {
  return [...items].sort((first, second) => {
    switch (sortBy) {
      case 'reach':
        return second.estimated_reach - first.estimated_reach || first.title.localeCompare(second.title);
      case 'budget-min':
        return first.budget_min - second.budget_min || first.title.localeCompare(second.title);
      case 'budget-max':
        return second.budget_max - first.budget_max || first.title.localeCompare(second.title);
      case 'title':
      default:
        return first.title.localeCompare(second.title);
    }
  });
}

export default function OpportunitiesPage() {
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [connectModalOpen, setConnectModalOpen] = useState(false);
  const [selectedOpportunity, setSelectedOpportunity] = useState<Opportunity | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState(ALL_VALUE);
  const [locationFilter, setLocationFilter] = useState(ALL_VALUE);
  const [audienceFilter, setAudienceFilter] = useState(ALL_VALUE);
  const [budgetMin, setBudgetMin] = useState('');
  const [budgetMax, setBudgetMax] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<SortOption>('title');

  const filterOptions = useMemo(() => getFilterOptions(catalogOpportunities), []);
  const visibleGoalTags = filterOptions.tags.slice(0, 18);

  const filteredOpportunities = useMemo(() => {
    const searchTokens = searchQuery.trim().toLowerCase().split(/\s+/).filter(Boolean);
    const parsedBudgetMin = parseBudget(budgetMin);
    const parsedBudgetMax = parseBudget(budgetMax);

    const filtered = catalogOpportunities.filter((opportunity) => {
      const searchText = getOpportunitySearchText(opportunity);
      if (searchTokens.length > 0 && !searchTokens.every((token) => searchText.includes(token))) {
        return false;
      }

      if (categoryFilter !== ALL_VALUE && !opportunity.category.includes(categoryFilter)) {
        return false;
      }

      if (locationFilter !== ALL_VALUE && opportunity.location !== locationFilter) {
        return false;
      }

      if (audienceFilter !== ALL_VALUE && !opportunity.audience.includes(audienceFilter)) {
        return false;
      }

      if (selectedTags.length > 0 && !selectedTags.every((tag) => opportunity.tags.includes(tag))) {
        return false;
      }

      return opportunityMatchesBudget(opportunity, parsedBudgetMin, parsedBudgetMax);
    });

    return sortOpportunities(filtered, sortBy);
  }, [audienceFilter, budgetMax, budgetMin, categoryFilter, locationFilter, searchQuery, selectedTags, sortBy]);

  const hasActiveFilters = Boolean(
    searchQuery.trim() ||
    categoryFilter !== ALL_VALUE ||
    locationFilter !== ALL_VALUE ||
    audienceFilter !== ALL_VALUE ||
    budgetMin.trim() ||
    budgetMax.trim() ||
    selectedTags.length > 0,
  );

  const handleDetails = (opportunity: Opportunity) => {
    setSelectedOpportunity(opportunity);
    setDetailsModalOpen(true);
  };

  const handleConnect = (opportunity: Opportunity) => {
    setSelectedOpportunity(opportunity);
    setConnectModalOpen(true);
  };

  const clearFilters = () => {
    setSearchQuery('');
    setCategoryFilter(ALL_VALUE);
    setLocationFilter(ALL_VALUE);
    setAudienceFilter(ALL_VALUE);
    setBudgetMin('');
    setBudgetMax('');
    setSelectedTags([]);
    setSortBy('title');
  };

  const toggleTag = (tag: string) => {
    setSelectedTags((current) => current.includes(tag) ? current.filter((item) => item !== tag) : [...current, tag]);
  };

  return (
    <ShortlistProvider>
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
            Explore verified sponsorship opportunities matched to CSR, visibility, and youth engagement goals.
          </p>
        </motion.div>

        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-medium">{filteredOpportunities.length} of {catalogOpportunities.length} opportunities</p>
            <p className="text-sm text-muted-foreground">Browse opportunities or ask SeekBot for a guided recommendation.</p>
          </div>

          <Button
            variant="outline"
            className="border-primary/50 hover:bg-primary/10"
            onClick={() => document.getElementById('seekbot')?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
          >
            <Bot className="mr-2 h-4 w-4" />
            Ask SeekBot
          </Button>
        </div>

        <div className="mb-10">
          <SeekBotChat />
        </div>

        <div className="mb-8 rounded-lg border border-primary/20 bg-primary/5 p-4">
          <p className="text-sm text-foreground/80">
            <strong>Commission Secured:</strong> All deals are processed securely through
            SponsorSeek&apos;s platform to ensure fair sponsorship management.
          </p>
        </div>

        <section className="mb-8 rounded-2xl border border-border bg-card/60 p-4 shadow-sm md:p-6">
          <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-2">
              <Filter className="h-5 w-5 text-primary" />
              <div>
                <h2 className="text-lg font-semibold">Search and filter opportunities</h2>
                <p className="text-sm text-muted-foreground">Search titles, descriptions, categories, audiences, tags, and benefits.</p>
              </div>
            </div>
            {hasActiveFilters && (
              <Button variant="ghost" size="sm" onClick={clearFilters}>
                <X className="mr-2 h-4 w-4" />
                Clear filters
              </Button>
            )}
          </div>

          <div className="grid gap-4 lg:grid-cols-[minmax(0,1.5fr)_repeat(3,minmax(0,1fr))]">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder="Search opportunities, goals, audiences..."
                className="pl-9"
              />
            </div>

            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ALL_VALUE}>All categories</SelectItem>
                {filterOptions.categories.map((category) => (
                  <SelectItem key={category} value={category}>{category}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={locationFilter} onValueChange={setLocationFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Location" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ALL_VALUE}>All locations</SelectItem>
                {filterOptions.locations.map((location) => (
                  <SelectItem key={location} value={location}>{location}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={audienceFilter} onValueChange={setAudienceFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Audience" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ALL_VALUE}>All audiences</SelectItem>
                {filterOptions.audiences.map((audience) => (
                  <SelectItem key={audience} value={audience}>{audience}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="mt-4 grid gap-4 md:grid-cols-3">
            <Input
              type="number"
              min={0}
              value={budgetMin}
              onChange={(event) => setBudgetMin(event.target.value)}
              placeholder={`Min budget (${filterOptions.budgetMin.toLocaleString()}+)`}
            />
            <Input
              type="number"
              min={0}
              value={budgetMax}
              onChange={(event) => setBudgetMax(event.target.value)}
              placeholder={`Max budget (up to ${filterOptions.budgetMax.toLocaleString()})`}
            />
            <Select value={sortBy} onValueChange={(value) => setSortBy(value as SortOption)}>
              <SelectTrigger>
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="title">Sort by title</SelectItem>
                <SelectItem value="reach">Sort by estimated reach</SelectItem>
                <SelectItem value="budget-min">Sort by budget min</SelectItem>
                <SelectItem value="budget-max">Sort by budget max</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="mt-5">
            <p className="mb-3 text-sm font-medium text-muted-foreground">Goal / tag chips</p>
            <div className="flex flex-wrap gap-2">
              {visibleGoalTags.map((tag) => {
                const isSelected = selectedTags.includes(tag);
                return (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => toggleTag(tag)}
                    className="rounded-full"
                  >
                    <Badge variant={isSelected ? 'default' : 'secondary'} className="cursor-pointer transition hover:bg-primary/80 hover:text-primary-foreground">
                      {tag}
                    </Badge>
                  </button>
                );
              })}
            </div>
          </div>
        </section>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredOpportunities.map((opportunity, index) => (
            <OpportunityCard
              key={opportunity.id}
              opportunity={opportunity}
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

      <DetailsModal
        isOpen={detailsModalOpen}
        onClose={() => setDetailsModalOpen(false)}
        opportunity={selectedOpportunity}
        onConnect={() => {
          if (selectedOpportunity) handleConnect(selectedOpportunity);
        }}
      />

      <RequestConnectModal
        isOpen={connectModalOpen}
        onClose={() => setConnectModalOpen(false)}
        opportunityTitle={selectedOpportunity?.title ?? ''}
      />
      </main>
    </ShortlistProvider>
  );
}
