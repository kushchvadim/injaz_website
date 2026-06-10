'use client';

import { FormEvent, useEffect, useMemo, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Bookmark, BookmarkCheck, Bot, Loader2, RefreshCcw, Send, Sparkles, Trash2, UserRound } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Textarea } from '@/components/ui/textarea';
import { OpportunityModal } from '@/components/OpportunityModal';
import { RequestConnectModal } from '@/components/RequestConnectModal';
import { cn } from '@/lib/utils';
import { formatBudgetRange, formatReach, getOpportunityById } from '@/src/lib/opportunities/catalog';
import { useShortlist } from '@/src/lib/opportunities/shortlist';
import { buildSponsorshipPlanDisplayMessage, buildSponsorshipPlanPrompt } from '@/src/lib/seekbot/sponsorship_plan';
import { buildSeekBotStartSearchPrompt, type SeekBotSponsorProfile } from '@/src/lib/seekbot/start_search';
import type { Opportunity, SeekBotCard, SeekBotResponse } from '@/src/lib/seekbot/types';

type ChatRole = 'user' | 'assistant';

interface SeekBotChatMessage {
  role: ChatRole;
  content: string;
  apiContent?: string;
  cards?: SeekBotCard[];
  createdAt: string;
}

interface SendMessageOptions {
  displayContent?: string;
  initialProfileSearch?: boolean;
}

interface StarterProfile {
  label: string;
  profile: SeekBotSponsorProfile;
}

const MESSAGES_KEY = 'seekbot_messages';
const SESSION_ID_KEY = 'seekbot_session_id';
const PROFILE_KEY = 'seekbot_sponsor_profile';
const EMPTY_PROFILE: SeekBotSponsorProfile = {
  audience: '',
  budget: '',
  location: '',
  goals: '',
  businessType: '',
};
const STARTER_PROFILES: StarterProfile[] = [
  {
    label: 'Bank + university CSR',
    profile: {
      businessType: 'Bank or financial services sponsor',
      audience: 'University students and young professionals',
      budget: 'AED 25,000–75,000',
      location: 'Dubai, UAE',
      goals: 'CSR impact, financial literacy, youth engagement, and trusted brand visibility',
    },
  },
  {
    label: 'Local sports visibility',
    profile: {
      businessType: 'Consumer brand looking for family-friendly community visibility',
      audience: 'Youth athletes, parents, families, and local community members',
      budget: 'AED 10,000–40,000',
      location: 'UAE, preferably Dubai or Abu Dhabi',
      goals: 'Local visibility, community goodwill, youth sports support, and practical sponsorship value',
    },
  },
  {
    label: 'Education + entrepreneurship',
    profile: {
      businessType: 'Technology or innovation-focused company',
      audience: 'Students, young entrepreneurs, startup founders, and educators',
      budget: 'AED 30,000–100,000',
      location: 'UAE-wide',
      goals: 'Education, entrepreneurship, STEM talent, mentorship, and recruitment visibility',
    },
  },
];

function createSessionId(): string {
  const randomString = Math.random().toString(36).slice(2, 10);
  return `seekbot_${Date.now()}_${randomString}`;
}

function getCookie(name: string): string | undefined {
  if (typeof document === 'undefined') return undefined;
  const value = document.cookie
    .split('; ')
    .find((row) => row.startsWith(`${name}=`))
    ?.split('=')[1];
  return value ? decodeURIComponent(value) : undefined;
}

function setCookie(name: string, value: string): void {
  if (typeof document === 'undefined') return;
  document.cookie = `${name}=${encodeURIComponent(value)}; path=/; max-age=2592000; SameSite=Lax`;
}

function clearCookie(name: string): void {
  if (typeof document === 'undefined') return;
  document.cookie = `${name}=; path=/; max-age=0; SameSite=Lax`;
}

export function getOrCreateSeekbotSessionId(): string {
  if (typeof window === 'undefined') return createSessionId();

  const storedSessionId = window.localStorage.getItem(SESSION_ID_KEY) || getCookie(SESSION_ID_KEY);
  if (storedSessionId) {
    window.localStorage.setItem(SESSION_ID_KEY, storedSessionId);
    setCookie(SESSION_ID_KEY, storedSessionId);
    return storedSessionId;
  }

  const sessionId = createSessionId();
  window.localStorage.setItem(SESSION_ID_KEY, sessionId);
  setCookie(SESSION_ID_KEY, sessionId);
  return sessionId;
}

export function clearSeekbotSession(): void {
  if (typeof window !== 'undefined') {
    window.localStorage.removeItem(MESSAGES_KEY);
    window.localStorage.removeItem(SESSION_ID_KEY);
    window.localStorage.removeItem(PROFILE_KEY);
  }
  clearCookie(SESSION_ID_KEY);
}

function readStoredMessages(): SeekBotChatMessage[] {
  if (typeof window === 'undefined') return [];

  try {
    const parsed = JSON.parse(window.localStorage.getItem(MESSAGES_KEY) || '[]') as unknown;
    if (!Array.isArray(parsed)) return [];

    return parsed
      .filter((message): message is SeekBotChatMessage => {
        if (!message || typeof message !== 'object') return false;
        const record = message as Record<string, unknown>;
        return (record.role === 'user' || record.role === 'assistant') && typeof record.content === 'string';
      })
      .map((message) => ({
        role: message.role,
        content: message.content.slice(0, 4000),
        apiContent: typeof message.apiContent === 'string' ? message.apiContent.slice(0, 4000) : undefined,
        cards: Array.isArray(message.cards) ? message.cards.slice(0, 5) : undefined,
        createdAt: typeof message.createdAt === 'string' ? message.createdAt : new Date().toISOString(),
      }))
      .slice(-30);
  } catch {
    return [];
  }
}

function readStoredProfile(): SeekBotSponsorProfile | null {
  if (typeof window === 'undefined') return null;

  try {
    const parsed = JSON.parse(window.localStorage.getItem(PROFILE_KEY) || 'null') as unknown;
    if (!parsed || typeof parsed !== 'object') return null;
    const record = parsed as Record<string, unknown>;

    return {
      audience: typeof record.audience === 'string' ? record.audience.slice(0, 500) : '',
      budget: typeof record.budget === 'string' ? record.budget.slice(0, 250) : '',
      location: typeof record.location === 'string' ? record.location.slice(0, 250) : '',
      goals: typeof record.goals === 'string' ? record.goals.slice(0, 700) : '',
      businessType: typeof record.businessType === 'string' ? record.businessType.slice(0, 300) : '',
    };
  } catch {
    return null;
  }
}

function isSeekBotResponse(value: unknown): value is Partial<SeekBotResponse> & { reply: string } {
  if (!value || typeof value !== 'object') return false;
  const record = value as Record<string, unknown>;
  return typeof record.reply === 'string';
}

function hasProfileInput(profile: SeekBotSponsorProfile): boolean {
  return Object.values(profile).some((value) => value.trim().length > 0);
}

function summarizeProfile(profile: SeekBotSponsorProfile): string {
  const parts = [
    profile.businessType && `business type: ${profile.businessType.trim()}`,
    profile.audience && `audience: ${profile.audience.trim()}`,
    profile.budget && `budget: ${profile.budget.trim()}`,
    profile.location && `location: ${profile.location.trim()}`,
    profile.goals && `goals: ${profile.goals.trim()}`,
  ].filter(Boolean);

  return `Use my sponsor profile to find the 3 best opportunity matches${parts.length > 0 ? ` (${parts.join('; ')})` : ''}.`;
}

function profileFields(profile: SeekBotSponsorProfile): Array<{ label: string; value: string }> {
  return [
    { label: 'Business type', value: profile.businessType },
    { label: 'Audience', value: profile.audience },
    { label: 'Budget', value: profile.budget },
    { label: 'Location', value: profile.location },
    { label: 'Goals', value: profile.goals },
  ];
}

interface RecommendationCardProps {
  card: SeekBotCard;
  onOpen: (card: SeekBotCard) => void;
}

function RecommendationCard({ card, onOpen }: RecommendationCardProps) {
  const { isShortlisted, toggleShortlist } = useShortlist();
  const shortlisted = isShortlisted(card.id);
  return (
    <Card className="border-primary/20 bg-background/80 transition-all hover:border-primary/50 hover:shadow-lg hover:shadow-primary/10">
      <CardHeader className="space-y-3 pb-3">
        <div className="flex items-start justify-between gap-3">
          <CardTitle className="text-base leading-snug">{card.title}</CardTitle>
          <Badge className="shrink-0 bg-primary text-primary-foreground">{card.match_score}%</Badge>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-muted">
          <div className="h-full rounded-full bg-primary" style={{ width: `${Math.min(100, Math.max(0, card.match_score))}%` }} />
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm leading-relaxed text-muted-foreground">{card.why_match}</p>
        <div className="grid gap-2 text-sm sm:grid-cols-2">
          <div className="rounded-lg border border-border bg-muted/40 p-3">
            <p className="text-xs text-muted-foreground">Recommended package</p>
            <p className="font-medium">{card.recommended_package}</p>
          </div>
          <div className="rounded-lg border border-border bg-muted/40 p-3">
            <p className="text-xs text-muted-foreground">Suggested budget</p>
            <p className="font-medium">{card.suggested_budget}</p>
          </div>
        </div>
        <div className="grid gap-2 sm:grid-cols-2">
          <Button className="w-full" onClick={() => onOpen(card)}>
            {card.cta_label || 'View opportunity'}
          </Button>
          <Button variant={shortlisted ? 'secondary' : 'outline'} className="w-full" onClick={() => toggleShortlist(card.id)}>
            {shortlisted ? <BookmarkCheck className="mr-2 h-4 w-4" /> : <Bookmark className="mr-2 h-4 w-4" />}
            {shortlisted ? 'Shortlisted' : 'Shortlist'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export function SeekBotChat() {
  const [messages, setMessages] = useState<SeekBotChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId, setSessionId] = useState('');
  const [suggestedQuestions, setSuggestedQuestions] = useState<string[]>([]);
  const [selectedCard, setSelectedCard] = useState<SeekBotCard | null>(null);
  const [connectModalOpen, setConnectModalOpen] = useState(false);
  const [connectOpportunityTitle, setConnectOpportunityTitle] = useState('');
  const [hasHydrated, setHasHydrated] = useState(false);
  const [profile, setProfile] = useState<SeekBotSponsorProfile | null>(null);
  const [profileDraft, setProfileDraft] = useState<SeekBotSponsorProfile>(EMPTY_PROFILE);
  const { shortlistedIds, removeFromShortlist, clearShortlist } = useShortlist();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const shortlistedOpportunities = useMemo(
    () => shortlistedIds.map((id) => getOpportunityById(id)).filter((opportunity): opportunity is NonNullable<typeof opportunity> => Boolean(opportunity)),
    [shortlistedIds],
  );

  useEffect(() => {
    setSessionId(getOrCreateSeekbotSessionId());
    setMessages(readStoredMessages());
    const storedProfile = readStoredProfile();
    if (storedProfile) {
      setProfile(storedProfile);
      setProfileDraft(storedProfile);
    }
    setHasHydrated(true);
  }, []);

  useEffect(() => {
    if (!hasHydrated || typeof window === 'undefined') return;
    if (messages.length === 0) {
      window.localStorage.removeItem(MESSAGES_KEY);
      return;
    }
    window.localStorage.setItem(MESSAGES_KEY, JSON.stringify(messages));
  }, [hasHydrated, messages]);

  useEffect(() => {
    if (!hasHydrated || typeof window === 'undefined') return;
    if (!profile) {
      window.localStorage.removeItem(PROFILE_KEY);
      return;
    }
    window.localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
  }, [hasHydrated, profile]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [messages, isLoading]);

  async function sendMessage(rawMessage?: string, options: SendMessageOptions = {}): Promise<void> {
    const currentMessage = (rawMessage ?? input).trim().slice(0, 4000);
    if (!currentMessage || isLoading) return;

    const previousMessages = messages;
    const userMessage: SeekBotChatMessage = {
      role: 'user',
      content: (options.displayContent ?? currentMessage).slice(0, 4000),
      apiContent: options.displayContent ? currentMessage : undefined,
      createdAt: new Date().toISOString(),
    };

    setMessages((current) => [...current, userMessage]);
    setInput('');
    setSuggestedQuestions([]);
    setIsLoading(true);

    try {
      const response = await fetch('/api/seekbot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: currentMessage,
          messages: previousMessages.slice(-20).map(({ role, content, apiContent }) => ({ role, content: apiContent ?? content })),
          clientContext: {
            sessionId: sessionId || getOrCreateSeekbotSessionId(),
            cookieConsent: true,
          },
        }),
      });

      const payload = (await response.json().catch(() => undefined)) as unknown;
      if (!response.ok || !isSeekBotResponse(payload)) {
        throw new Error('Invalid SeekBot response');
      }

      const cardLimit = options.initialProfileSearch ? 3 : 5;
      const assistantMessage: SeekBotChatMessage = {
        role: 'assistant',
        content: payload.reply,
        cards: Array.isArray(payload.cards) ? payload.cards.slice(0, cardLimit) : [],
        createdAt: new Date().toISOString(),
      };

      setMessages((current) => [...current, assistantMessage]);
      setSuggestedQuestions(Array.isArray(payload.suggested_questions) ? payload.suggested_questions.slice(0, 4) : []);
    } catch {
      setMessages((current) => [
        ...current,
        {
          role: 'assistant',
          content: 'SeekBot could not complete the search right now. Please try again.',
          cards: [],
          createdAt: new Date().toISOString(),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>): void {
    event.preventDefault();
    void sendMessage();
  }

  function handleProfileSubmit(event: FormEvent<HTMLFormElement>): void {
    event.preventDefault();
    if (!hasProfileInput(profileDraft) || isLoading) return;

    const confirmedProfile = {
      audience: profileDraft.audience.trim().slice(0, 500),
      budget: profileDraft.budget.trim().slice(0, 250),
      location: profileDraft.location.trim().slice(0, 250),
      goals: profileDraft.goals.trim().slice(0, 700),
      businessType: profileDraft.businessType.trim().slice(0, 300),
    };

    setProfile(confirmedProfile);
    void sendMessage(buildSeekBotStartSearchPrompt(confirmedProfile), {
      displayContent: summarizeProfile(confirmedProfile),
      initialProfileSearch: true,
    });
  }

  function handleBuildSponsorshipPlan(): void {
    if (shortlistedOpportunities.length === 0 || isLoading) return;

    const planPrompt = buildSponsorshipPlanPrompt(profile, shortlistedOpportunities);
    void sendMessage(planPrompt, {
      displayContent: buildSponsorshipPlanDisplayMessage(shortlistedOpportunities),
    });
  }

  function handleConnectFromRecommendation(opportunity: Opportunity | null, card: SeekBotCard): void {
    setConnectOpportunityTitle(opportunity?.title ?? card.title);
    setSelectedCard(null);
    setConnectModalOpen(true);
  }

  function handleClearChat(): void {
    clearSeekbotSession();
    setSessionId('');
    setMessages([]);
    setSuggestedQuestions([]);
    setInput('');
    setProfile(null);
    setProfileDraft(EMPTY_PROFILE);
  }

  function updateProfileDraft(field: keyof SeekBotSponsorProfile, value: string): void {
    setProfileDraft((current) => ({ ...current, [field]: value }));
  }

  return (
    <section id="seekbot" className="rounded-3xl border border-primary/20 bg-card/60 p-4 shadow-2xl shadow-primary/5 backdrop-blur md:p-6">
      <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <Bot className="h-6 w-6" />
          </div>
          <div>
            <div className="mb-2 flex flex-wrap items-center gap-2">
              <h2 className="text-2xl font-bold tracking-tight">Start Sponsorship Search</h2>
              <Badge variant="outline" className="border-primary/50 text-primary">
                AI sponsorship strategist
              </Badge>
            </div>
            <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground md:text-base">
              Start with a sponsor profile so SeekBot can search real demo opportunities, return the top 3 strongest matches, and keep refining through chat.
            </p>
          </div>
        </div>
        <Button variant="outline" size="sm" onClick={handleClearChat} disabled={isLoading}>
          <RefreshCcw className="mr-2 h-4 w-4" />
          Clear chat
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-[280px_minmax(0,1fr)_320px]">
        <aside className="space-y-4">
          {profile ? (
            <Card className="border-primary/20 bg-primary/5">
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Your Profile</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {profileFields(profile).map(({ label, value }) => (
                  <div key={label} className="rounded-lg border border-primary/15 bg-background/70 p-3">
                    <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</p>
                    <p className="mt-1 text-sm leading-relaxed">{value || 'Not specified'}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          ) : (
            <Card className="border-primary/20 bg-primary/5">
              <CardContent className="space-y-3 p-4">
                <div className="flex items-center gap-2 font-medium">
                  <Sparkles className="h-4 w-4 text-primary" />
                  Profile first
                </div>
                <p className="text-sm text-muted-foreground">
                  Fill the profile to automatically start a top-3 SeekBot search. You can still refine with free-form chat afterwards.
                </p>
              </CardContent>
            </Card>
          )}
        </aside>

        <Card className="min-h-[640px] border-border/60 bg-background/70">
          <CardContent className="flex h-full min-h-[640px] flex-col p-0">
            <ScrollArea className="h-[460px] flex-1 p-4 md:p-6">
              <div className="space-y-5">
                {messages.length === 0 && (
                  <form onSubmit={handleProfileSubmit} className="rounded-2xl border border-dashed border-primary/30 bg-primary/5 p-5">
                    <div className="mb-3 flex items-center gap-2 font-medium">
                      <Sparkles className="h-4 w-4 text-primary" />
                      Let&apos;s define your sponsor profile
                    </div>
                    <p className="mb-4 text-sm text-muted-foreground">
                      Tell SeekBot who you are trying to reach and what success looks like. Confirming this starts the same chat engine with a structured top-3 search prompt.
                    </p>

                    <div className="mb-5 grid gap-3 md:grid-cols-2">
                      <div className="space-y-2">
                        <label className="text-xs font-medium uppercase tracking-wide text-muted-foreground" htmlFor="seekbot-business-type">
                          Business type
                        </label>
                        <Input
                          id="seekbot-business-type"
                          value={profileDraft.businessType}
                          onChange={(event) => updateProfileDraft('businessType', event.target.value.slice(0, 300))}
                          placeholder="e.g. Bank, telco, tech employer"
                          disabled={isLoading}
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-medium uppercase tracking-wide text-muted-foreground" htmlFor="seekbot-location">
                          Location
                        </label>
                        <Input
                          id="seekbot-location"
                          value={profileDraft.location}
                          onChange={(event) => updateProfileDraft('location', event.target.value.slice(0, 250))}
                          placeholder="e.g. Dubai, Abu Dhabi, UAE-wide"
                          disabled={isLoading}
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-medium uppercase tracking-wide text-muted-foreground" htmlFor="seekbot-budget">
                          Budget
                        </label>
                        <Input
                          id="seekbot-budget"
                          value={profileDraft.budget}
                          onChange={(event) => updateProfileDraft('budget', event.target.value.slice(0, 250))}
                          placeholder="e.g. AED 25,000–75,000"
                          disabled={isLoading}
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-medium uppercase tracking-wide text-muted-foreground" htmlFor="seekbot-audience">
                          Target audience
                        </label>
                        <Textarea
                          id="seekbot-audience"
                          value={profileDraft.audience}
                          onChange={(event) => updateProfileDraft('audience', event.target.value.slice(0, 500))}
                          placeholder="e.g. University students, youth athletes, parents"
                          className="min-h-[82px] resize-none"
                          disabled={isLoading}
                        />
                      </div>
                      <div className="space-y-2 md:col-span-2">
                        <label className="text-xs font-medium uppercase tracking-wide text-muted-foreground" htmlFor="seekbot-goals">
                          Goals
                        </label>
                        <Textarea
                          id="seekbot-goals"
                          value={profileDraft.goals}
                          onChange={(event) => updateProfileDraft('goals', event.target.value.slice(0, 700))}
                          placeholder="e.g. CSR impact, local visibility, recruitment, youth engagement"
                          className="min-h-[92px] resize-none"
                          disabled={isLoading}
                        />
                      </div>
                    </div>

                    <div className="mb-5">
                      <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">Quick profile examples</p>
                      <div className="flex flex-wrap gap-2">
                        {STARTER_PROFILES.map((starter) => (
                          <button
                            key={starter.label}
                            type="button"
                            className="rounded-full border border-border bg-background px-3 py-2 text-left text-xs transition hover:border-primary/50 hover:bg-primary/10"
                            onClick={() => setProfileDraft(starter.profile)}
                            disabled={isLoading}
                          >
                            {starter.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    <Button type="submit" disabled={isLoading || !hasProfileInput(profileDraft)}>
                      {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
                      Confirm profile and start search
                    </Button>
                  </form>
                )}

                {messages.map((message, index) => (
                  <motion.div
                    key={`${message.createdAt}-${index}`}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={cn('flex gap-3', message.role === 'user' ? 'justify-end' : 'justify-start')}
                  >
                    {message.role === 'assistant' && (
                      <div className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                        <Bot className="h-4 w-4" />
                      </div>
                    )}
                    <div className={cn('max-w-[90%] space-y-3 md:max-w-[78%]', message.role === 'user' && 'items-end')}>
                      <div
                        className={cn(
                          'rounded-2xl px-4 py-3 text-sm leading-relaxed',
                          message.role === 'user'
                            ? 'bg-primary text-primary-foreground'
                            : 'border border-border bg-card text-card-foreground',
                        )}
                      >
                        {message.content}
                      </div>
                      {message.cards && message.cards.length > 0 && (
                        <div className="grid gap-3">
                          {message.cards.map((card) => (
                            <RecommendationCard key={card.id} card={card} onOpen={setSelectedCard} />
                          ))}
                        </div>
                      )}
                    </div>
                    {message.role === 'user' && (
                      <div className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground">
                        <UserRound className="h-4 w-4" />
                      </div>
                    )}
                  </motion.div>
                ))}

                {isLoading && (
                  <div className="flex gap-3">
                    <div className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                      <Bot className="h-4 w-4" />
                    </div>
                    <div className="flex items-center gap-2 rounded-2xl border border-border bg-card px-4 py-3 text-sm text-muted-foreground">
                      <Loader2 className="h-4 w-4 animate-spin text-primary" />
                      Searching opportunities and preparing recommendations...
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>

            {suggestedQuestions.length > 0 && !isLoading && (
              <div className="border-t border-border px-4 py-3 md:px-6">
                <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">Suggested next questions</p>
                <div className="flex flex-wrap gap-2">
                  {suggestedQuestions.map((question) => (
                    <button
                      key={question}
                      type="button"
                      className="rounded-full border border-primary/30 bg-primary/5 px-3 py-2 text-left text-xs transition hover:bg-primary/10"
                      onClick={() => void sendMessage(question)}
                    >
                      {question}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="border-t border-border p-4 md:p-6">
              <div className="flex flex-col gap-3 md:flex-row">
                <Textarea
                  value={input}
                  onChange={(event) => setInput(event.target.value.slice(0, 2000))}
                  placeholder={profile ? 'Refine the recommendations, ask for comparisons, or request a different angle...' : 'Confirm your sponsor profile first, then use chat for follow-up refinement...'}
                  className="min-h-[72px] resize-none"
                  disabled={isLoading || messages.length === 0}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter' && !event.shiftKey) {
                      event.preventDefault();
                      void sendMessage();
                    }
                  }}
                />
                <Button type="submit" size="lg" className="md:self-end" disabled={isLoading || input.trim().length === 0 || messages.length === 0}>
                  {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
                  Send
                </Button>
              </div>
              <div className="mt-2 flex items-center justify-between gap-3 text-xs text-muted-foreground">
                <span>{input.length}/2000 characters</span>
                <span>Only demo chat state and your sponsor profile are stored locally.</span>
              </div>
            </form>
          </CardContent>
        </Card>

        <aside className="space-y-4">
          <Card className="border-primary/20 bg-primary/5">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between gap-3">
                <CardTitle className="text-base">Shortlist</CardTitle>
                {shortlistedOpportunities.length > 0 && (
                  <Button variant="ghost" size="sm" onClick={clearShortlist} disabled={isLoading}>
                    Clear
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {shortlistedOpportunities.length > 0 ? (
                shortlistedOpportunities.map((opportunity) => (
                  <div key={opportunity.id} className="rounded-xl border border-border bg-card p-3">
                    <div className="mb-2 flex items-start justify-between gap-2">
                      <p className="line-clamp-2 text-sm font-medium">{opportunity.title}</p>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 shrink-0 p-0"
                        onClick={() => removeFromShortlist(opportunity.id)}
                        disabled={isLoading}
                        aria-label={`Remove ${opportunity.title} from shortlist`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="space-y-1 text-xs text-muted-foreground">
                      <p>{formatBudgetRange(opportunity)}</p>
                      <p>{formatReach(opportunity)}</p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">Shortlist manual opportunities or SeekBot cards to build a sponsorship plan.</p>
              )}

              <Button className="w-full" onClick={handleBuildSponsorshipPlan} disabled={isLoading || shortlistedOpportunities.length === 0}>
                {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
                Build Sponsorship Plan
              </Button>
              <p className="text-xs leading-relaxed text-muted-foreground">
                Plan generation uses your shortlist and the existing SeekBot chat route. Your OpenAI credentials stay server-side.
              </p>
            </CardContent>
          </Card>
        </aside>
      </div>

      <OpportunityModal
        card={selectedCard}
        isOpen={Boolean(selectedCard)}
        onClose={() => setSelectedCard(null)}
        onConnect={handleConnectFromRecommendation}
      />
      <RequestConnectModal
        isOpen={connectModalOpen}
        onClose={() => setConnectModalOpen(false)}
        opportunityTitle={connectOpportunityTitle}
      />
    </section>
  );
}
