'use client';

import { FormEvent, useEffect, useMemo, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Bot, Loader2, RefreshCcw, Send, ShieldCheck, Sparkles, UserRound } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Textarea } from '@/components/ui/textarea';
import { OpportunityModal } from '@/components/OpportunityModal';
import { cn } from '@/lib/utils';
import type { SeekBotCard, SeekBotResponse } from '@/src/lib/seekbot/types';

type ChatRole = 'user' | 'assistant';

interface SeekBotChatMessage {
  role: ChatRole;
  content: string;
  cards?: SeekBotCard[];
  createdAt: string;
}

const MESSAGES_KEY = 'seekbot_messages';
const LAST_CARDS_KEY = 'seekbot_last_cards';
const SESSION_ID_KEY = 'seekbot_session_id';
const STARTER_PROMPTS = [
  'We are a bank targeting university students in Dubai with CSR goals.',
  'Find youth sports sponsorship opportunities with strong local visibility.',
  'We want to support education and entrepreneurship events in the UAE.',
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
    window.localStorage.removeItem(LAST_CARDS_KEY);
    window.localStorage.removeItem(SESSION_ID_KEY);
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
        cards: Array.isArray(message.cards) ? message.cards.slice(0, 5) : undefined,
        createdAt: typeof message.createdAt === 'string' ? message.createdAt : new Date().toISOString(),
      }))
      .slice(-30);
  } catch {
    return [];
  }
}

function isSeekBotResponse(value: unknown): value is Partial<SeekBotResponse> & { reply: string } {
  if (!value || typeof value !== 'object') return false;
  const record = value as Record<string, unknown>;
  return typeof record.reply === 'string';
}

interface RecommendationCardProps {
  card: SeekBotCard;
  onOpen: (card: SeekBotCard) => void;
}

function RecommendationCard({ card, onOpen }: RecommendationCardProps) {
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
        <Button className="w-full" onClick={() => onOpen(card)}>
          {card.cta_label || 'View opportunity'}
        </Button>
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
  const [hasHydrated, setHasHydrated] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const lastCards = useMemo(
    () => messages.flatMap((message) => message.cards ?? []).slice(-5),
    [messages],
  );

  useEffect(() => {
    setSessionId(getOrCreateSeekbotSessionId());
    setMessages(readStoredMessages());
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
    if (lastCards.length === 0) {
      window.localStorage.removeItem(LAST_CARDS_KEY);
      return;
    }
    window.localStorage.setItem(LAST_CARDS_KEY, JSON.stringify(lastCards));
  }, [hasHydrated, lastCards]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [messages, isLoading]);

  async function sendMessage(rawMessage?: string): Promise<void> {
    const currentMessage = (rawMessage ?? input).trim().slice(0, 2000);
    if (!currentMessage || isLoading) return;

    const previousMessages = messages;
    const userMessage: SeekBotChatMessage = {
      role: 'user',
      content: currentMessage,
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
          messages: previousMessages.slice(-20).map(({ role, content }) => ({ role, content })),
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

      const assistantMessage: SeekBotChatMessage = {
        role: 'assistant',
        content: payload.reply,
        cards: Array.isArray(payload.cards) ? payload.cards.slice(0, 5) : [],
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

  function handleClearChat(): void {
    clearSeekbotSession();
    setSessionId('');
    setMessages([]);
    setSuggestedQuestions([]);
    setInput('');
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
              <h2 className="text-2xl font-bold tracking-tight">Try SeekBot</h2>
              <Badge variant="outline" className="border-primary/50 text-primary">
                AI sponsorship strategist
              </Badge>
            </div>
            <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground md:text-base">
              Describe your sponsor profile, audience, budget, or impact goal. SeekBot searches real demo opportunities through the secure backend and returns matched cards.
            </p>
          </div>
        </div>
        <Button variant="outline" size="sm" onClick={handleClearChat} disabled={isLoading}>
          <RefreshCcw className="mr-2 h-4 w-4" />
          Clear chat
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        <Card className="min-h-[640px] border-border/60 bg-background/70">
          <CardContent className="flex h-full min-h-[640px] flex-col p-0">
            <ScrollArea className="h-[460px] flex-1 p-4 md:p-6">
              <div className="space-y-5">
                {messages.length === 0 && (
                  <div className="rounded-2xl border border-dashed border-primary/30 bg-primary/5 p-5">
                    <div className="mb-3 flex items-center gap-2 font-medium">
                      <Sparkles className="h-4 w-4 text-primary" />
                      Start with a sponsorship objective
                    </div>
                    <p className="mb-4 text-sm text-muted-foreground">
                      Try one of these prompts or write your own request.
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {STARTER_PROMPTS.map((prompt) => (
                        <button
                          key={prompt}
                          type="button"
                          className="rounded-full border border-border bg-background px-3 py-2 text-left text-xs transition hover:border-primary/50 hover:bg-primary/10"
                          onClick={() => void sendMessage(prompt)}
                          disabled={isLoading}
                        >
                          {prompt}
                        </button>
                      ))}
                    </div>
                  </div>
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
                  placeholder="Tell SeekBot what kind of sponsor or opportunity you’re looking for..."
                  className="min-h-[72px] resize-none"
                  disabled={isLoading}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter' && !event.shiftKey) {
                      event.preventDefault();
                      void sendMessage();
                    }
                  }}
                />
                <Button type="submit" size="lg" className="md:self-end" disabled={isLoading || input.trim().length === 0}>
                  {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
                  Send
                </Button>
              </div>
              <div className="mt-2 flex items-center justify-between gap-3 text-xs text-muted-foreground">
                <span>{input.length}/2000 characters</span>
                <span>Only demo chat state is stored locally.</span>
              </div>
            </form>
          </CardContent>
        </Card>

        <aside className="space-y-4">
          <Card className="border-primary/20 bg-primary/5">
            <CardContent className="space-y-3 p-4">
              <div className="flex items-center gap-2 font-medium">
                <ShieldCheck className="h-4 w-4 text-primary" />
                Secure by design
              </div>
              <p className="text-sm text-muted-foreground">
                The browser only calls <code className="rounded bg-background px-1">/api/seekbot</code>. OpenAI credentials stay server-side in the Netlify Function.
              </p>
            </CardContent>
          </Card>

          <Card className="border-border/60 bg-background/70">
            <CardHeader>
              <CardTitle className="text-base">Latest matched cards</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {lastCards.length > 0 ? (
                lastCards.map((card, index) => (
                  <button
                    key={`${card.id}-${card.match_score}-${index}`}
                    type="button"
                    className="w-full rounded-xl border border-border bg-card p-3 text-left transition hover:border-primary/50"
                    onClick={() => setSelectedCard(card)}
                  >
                    <div className="mb-1 flex items-center justify-between gap-2">
                      <span className="line-clamp-1 text-sm font-medium">{card.title}</span>
                      <Badge variant="secondary" className="shrink-0">{card.match_score}%</Badge>
                    </div>
                    <p className="line-clamp-2 text-xs text-muted-foreground">{card.suggested_budget}</p>
                  </button>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">Your latest recommendations will appear here after SeekBot returns matches.</p>
              )}
            </CardContent>
          </Card>
        </aside>
      </div>

      <OpportunityModal card={selectedCard} isOpen={Boolean(selectedCard)} onClose={() => setSelectedCard(null)} />
    </section>
  );
}
