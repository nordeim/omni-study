"use client";

import * as React from "react";
import { Ellipsis, Layers, Pencil, Plus, Search, Trash2 } from "lucide-react";
import { useDataStore, mutations, type FlashcardDeck, type Flashcard } from "@/lib/data";
import { EmptyState, useSubjectMap } from "./shared";
import { apiSend } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input, Label, Textarea } from "@/components/ui/input";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { toast } from "@/components/ui/toast";
import { cn } from "@/lib/utils";

// Flashcards — measured session-7 against the live reference (with a real
// reference deck + card). Layout: a two-panel `flex h-[calc(100vh-8rem)] gap-6`
// with a 320px border-r sidebar (h1 + gradient new-deck icon button + search
// with an inline icon + `space-y-2` slate-50 r12 deck rows with 40px colored
// icon blocks) and a detail pane (h2 20px + AI Generate + Add Card + Study;
// `lg:grid-cols-3` card grid with difficulty badges; a 3D-flip study mode).

/** The reference's 6-swatch picker (measured): violet/blue/emerald/amber/red/pink-500. */
export const DECK_COLORS = [
  { value: "#8b5cf6", label: "Violet" },
  { value: "#3b82f6", label: "Blue" },
  { value: "#10b981", label: "Emerald" },
  { value: "#f59e0b", label: "Amber" },
  { value: "#ef4444", label: "Red" },
  { value: "#ec4899", label: "Pink" },
] as const;

interface DeckWithCount extends FlashcardDeck {
  cardCount: number;
}

const DIFFICULTY_BADGE: Record<string, string> = {
  easy: "bg-emerald-100 text-emerald-700",
  medium: "bg-yellow-100 text-yellow-700",
  hard: "bg-red-100 text-red-700",
};

function ColorSwatches({
  value,
  onChange,
  label = "Color",
  swatchLabel,
}: {
  value: string;
  onChange: (v: string) => void;
  label?: string;
  swatchLabel: string;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <Label>{label}</Label>
      <div className="flex items-center gap-2" role="group" aria-label={swatchLabel}>
        {DECK_COLORS.map((c) => (
          <button
            key={c.value}
            type="button"
            aria-label={`${c.label} swatch`}
            aria-pressed={value === c.value}
            onClick={() => onChange(c.value)}
            className={cn(
              "h-8 w-8 rounded-full transition-transform",
              value === c.value && "scale-110 outline outline-2 outline-offset-2 outline-slate-300",
            )}
            style={{ backgroundColor: c.value }}
          />
        ))}
      </div>
    </div>
  );
}

export function FlashcardsView() {
  const decks = useDataStore((s) => s.data.decks) as DeckWithCount[];
  const cards = useDataStore((s) => s.data.cards);
  const loadAll = useDataStore((s) => s.loadAll);
  const subjectMap = useSubjectMap();

  const [selectedId, setSelectedId] = React.useState<string | null>(null);
  const [search, setSearch] = React.useState("");
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [editingDeck, setEditingDeck] = React.useState<FlashcardDeck | null>(null);
  const [deckName, setDeckName] = React.useState("");
  const [deckDesc, setDeckDesc] = React.useState("");
  const [deckColor, setDeckColor] = React.useState<string>(DECK_COLORS[0].value);
  const [deckSubject, setDeckSubject] = React.useState("");
  const [cardDialogOpen, setCardDialogOpen] = React.useState(false);
  const [cardFront, setCardFront] = React.useState("");
  const [cardBack, setCardBack] = React.useState("");
  const [cardDifficulty, setCardDifficulty] = React.useState<"easy" | "medium" | "hard">("medium");
  const [generating, setGenerating] = React.useState(false);

  // study state
  const [studying, setStudying] = React.useState(false);
  const [studyIndex, setStudyIndex] = React.useState(0);
  const [flipped, setFlipped] = React.useState(false);

  React.useEffect(() => {
    void loadAll(["decks", "cards", "subjects"]);
  }, [loadAll]);

  const visibleDecks = decks.filter((d) =>
    search ? d.name.toLowerCase().includes(search.toLowerCase()) : true,
  );

  const selected = decks.find((d) => d.id === selectedId) ?? null;
  const deckCards = React.useMemo(
    () => (selected ? cards.filter((c) => c.deckId === selected.id) : []),
    [cards, selected],
  );
  const currentCard = deckCards[studyIndex] ?? null;

  function openDeck(deckId: string) {
    setSelectedId(deckId);
    setStudying(false);
    setStudyIndex(0);
    setFlipped(false);
  }

  function openCreateDeck() {
    setEditingDeck(null);
    setDeckName("");
    setDeckDesc("");
    setDeckColor(DECK_COLORS[0].value);
    setDeckSubject("");
    setDialogOpen(true);
  }

  function openEditDeck(deck: FlashcardDeck) {
    setEditingDeck(deck);
    setDeckName(deck.name);
    setDeckDesc(deck.description ?? "");
    setDeckColor(deck.color ?? DECK_COLORS[0].value);
    setDeckSubject(deck.subjectId ?? "");
    setDialogOpen(true);
  }

  async function submitDeck(e: React.FormEvent) {
    e.preventDefault();
    if (!deckName.trim()) return;
    try {
      if (editingDeck) {
        await mutations.updateDeck(editingDeck.id, {
          name: deckName.trim(),
          description: deckDesc.trim(),
          color: deckColor,
          subjectId: deckSubject || null,
        });
        toast.success("Deck updated");
      } else {
        await mutations.createDeck({
          name: deckName.trim(),
          description: deckDesc.trim(),
          color: deckColor,
          subjectId: deckSubject || null,
        });
        toast.success("Deck created");
      }
      setDialogOpen(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not save the deck");
    }
  }

  async function submitCard(e: React.FormEvent) {
    e.preventDefault();
    if (!selected || !cardFront.trim() || !cardBack.trim()) return;
    try {
      await mutations.createCard({
        deckId: selected.id,
        front: cardFront.trim(),
        back: cardBack.trim(),
        difficulty: cardDifficulty,
        order: deckCards.length,
      });
      setCardFront("");
      setCardBack("");
      setCardDifficulty("medium");
      setCardDialogOpen(false);
      toast.success("Card added");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not add the card");
    }
  }

  // S7-A: AI Generate — the reference's deck-detail button, wired to our
  // server-side generator; a functional superset (cards persist).
  async function aiGenerate() {
    if (!selected || generating) return;
    setGenerating(true);
    try {
      const subject = selected.subjectId ? subjectMap.get(selected.subjectId) : undefined;
      const res = await apiSend<{ cards: { front: string; back: string; difficulty: "easy" | "medium" | "hard" }[] }>(
        "POST",
        "/api/ai/generate-cards",
        { deckId: selected.id, count: 6 },
        // S13-A2: same generous AI deadline as the assistant/solver.
        { timeoutMs: 120_000 },
      );
      let order = deckCards.length;
      for (const c of res.cards) {
        await mutations.createCard({ deckId: selected.id, ...c, order: order++ });
      }
      toast.success(`Added ${res.cards.length} cards`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "AI generation failed");
    } finally {
      setGenerating(false);
    }
  }

  return (
    <div className="flex h-[calc(100vh-8rem)] flex-col gap-6 lg:flex-row">
      {/* Deck sidebar (measured: w-80 border-r, not a card) */}
      <div className="flex w-full shrink-0 flex-col border-r border-slate-100 pr-6 lg:w-80 dark:border-slate-800">
        <div className="mb-4 flex items-center justify-between">
          <h1 className="flex items-center gap-2 text-2xl font-bold text-slate-800 dark:text-slate-100">
            <Layers className="h-6 w-6 text-sf-primary" strokeWidth={2} aria-hidden="true" />
            Flashcards
          </h1>
          <Button
            variant="gradient"
            size="icon"
            aria-label="New Deck"
            onClick={openCreateDeck}
            className="h-9 w-9"
          >
            <Plus className="h-4 w-4" strokeWidth={2} />
          </Button>
        </div>
        <div className="relative mb-4">
          <Search
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
            strokeWidth={2}
            aria-hidden="true"
          />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search decks..."
            aria-label="Search decks"
            className="h-9 pl-9"
          />
        </div>

        {visibleDecks.length === 0 ? (
          <SimpleSidebarEmpty onCreate={openCreateDeck} />
        ) : (
          <div className="sf-scroll flex-1 space-y-2 overflow-y-auto" aria-label="Deck rows">
            {visibleDecks.map((deck) => (
              // S9-O (measured): the row carries a hover-revealed h-8 w-8
              // ghost ellipsis menu (opacity-0 group-hover:opacity-100) as a
              // flex child at the row's right — nested buttons are invalid
              // HTML, so the row is a div and selection rides the inner
              // button (the reference nests buttons inside its row).
              <div
                key={deck.id}
                className={cn(
                  "group flex w-full items-center gap-3 rounded-xl border-2 border-transparent p-4 text-left transition-all",
                  selectedId === deck.id
                    ? "border-sf-primary/40 bg-slate-100"
                    : "bg-slate-50 hover:bg-slate-100 dark:bg-slate-800/60 dark:hover:bg-slate-800",
                )}
              >
                <button
                  type="button"
                  onClick={() => openDeck(deck.id)}
                  aria-pressed={selectedId === deck.id}
                  className="sf-focus flex min-w-0 flex-1 items-center gap-3 text-left"
                >
                  <span
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-white"
                    style={{ backgroundColor: deck.color || "#8b5cf6" }}
                    aria-hidden="true"
                  >
                    <Layers className="h-5 w-5" strokeWidth={2} />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate font-semibold text-slate-800 dark:text-slate-100">
                      {deck.name}
                    </span>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {deck.cardCount} {deck.cardCount === 1 ? "card" : "cards"}
                    </p>
                  </span>
                </button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button
                      type="button"
                      aria-label={`Options for ${deck.name}`}
                      className="sf-focus flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-slate-400 opacity-0 transition-opacity hover:bg-slate-200/70 hover:text-slate-600 group-hover:opacity-100 dark:text-slate-500 dark:hover:bg-slate-700 dark:hover:text-slate-300"
                    >
                      <Ellipsis className="h-4 w-4" strokeWidth={2} aria-hidden="true" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => openEditDeck(deck)}>
                      <Pencil className="h-4 w-4" aria-hidden="true" />
                      Edit deck
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => {
                        void mutations.deleteDeck(deck.id).then(() => {
                          toast.success(`Deleted "${deck.name}"`);
                          if (selectedId === deck.id) setSelectedId(null);
                        });
                      }}
                      className="text-red-600 focus:text-red-600"
                    >
                      <Trash2 className="h-4 w-4" aria-hidden="true" />
                      Delete deck
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Deck detail / study mode */}
      <div className="sf-scroll min-w-0 flex-1 overflow-y-auto" aria-label="Deck detail">
        {selected ? (
          studying ? (
            <StudyMode
              deck={selected}
              cards={deckCards}
              index={studyIndex}
              flipped={flipped}
              onFlip={() => setFlipped((v) => !v)}
              onPrev={() => {
                setStudyIndex((i) => Math.max(0, i - 1));
                setFlipped(false);
              }}
              onNext={() => {
                setStudyIndex((i) => Math.min(deckCards.length - 1, i + 1));
                setFlipped(false);
              }}
              onExit={() => {
                setStudying(false);
                setStudyIndex(0);
                setFlipped(false);
              }}
              onMastered={() => {
                if (!currentCard) return;
                void mutations.updateCard(currentCard.id, { mastered: !currentCard.mastered });
                setFlipped(false);
                if (!currentCard.mastered && studyIndex < deckCards.length - 1) {
                  setStudyIndex((i) => i + 1);
                }
              }}
            />
          ) : (
            <>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">{selected.name}</h2>
                  {selected.description && (
                    <p className="text-slate-500 dark:text-slate-400">{selected.description}</p>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" onClick={aiGenerate} disabled={generating}>
                    <span className={generating ? "animate-pulse" : undefined}>✦</span>
                    {generating ? "Generating…" : "AI Generate"}
                  </Button>
                  <Button variant="gradient" onClick={() => setCardDialogOpen(true)}>
                    <Plus className="h-4 w-4" /> Add Card
                  </Button>
                  {deckCards.length > 0 && (
                    <Button
                      variant="gradient"
                      onClick={() => {
                        setStudying(true);
                        setStudyIndex(0);
                        setFlipped(false);
                      }}
                    >
                      Study
                    </Button>
                  )}
                </div>
              </div>

              {deckCards.length === 0 ? (
                <div className="flex flex-col items-center justify-center px-4 py-16 text-center">
                  <h3 className="mb-2 text-xl font-semibold text-slate-800 dark:text-slate-100">
                    No cards in this deck
                  </h3>
                  <p className="mb-4 text-slate-500 dark:text-slate-400">
                    Add your first card or generate a set with AI.
                  </p>
                  <Button variant="gradient" className="sf-gradient-shadow-lg" onClick={() => setCardDialogOpen(true)}>
                    Add Card
                  </Button>
                </div>
              ) : (
                <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-3" aria-label="Card grid">
                  {deckCards.map((card) => (
                    <CardTile key={card.id} card={card} />
                  ))}
                </div>
              )}
            </>
          )
        ) : (
          <EmptyState
            icon={Layers}
            title="Select a deck"
            hint="Choose a flashcard deck from the sidebar"
          />
        )}
      </div>

      {/* Deck dialog (measured fields: Deck Name * / Description / Color swatches) */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingDeck ? "Edit Deck" : "Create Deck"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={submitDeck} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="deck-name">Deck Name *</Label>
              <Input
                id="deck-name"
                value={deckName}
                onChange={(e) => setDeckName(e.target.value)}
                placeholder="e.g., Biology Chapter 5"
                maxLength={120}
                required
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="deck-desc">Description</Label>
              <Textarea
                id="deck-desc"
                value={deckDesc}
                onChange={(e) => setDeckDesc(e.target.value)}
                placeholder="What's this deck about?"
                rows={2}
                maxLength={1000}
              />
            </div>
            <ColorSwatches
              value={deckColor}
              onChange={setDeckColor}
              swatchLabel="Deck color swatches"
            />
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="deck-subject">Subject</Label>
              <select
                id="deck-subject"
                value={deckSubject}
                onChange={(e) => setDeckSubject(e.target.value)}
                className="flex h-9 w-full rounded-md border border-input bg-card px-3 py-2 text-sm shadow-sm"
              >
                <option value="">None</option>
                {[...subjectMap.values()].map((s) => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
              <Button type="submit" variant="gradient" disabled={!deckName.trim()}>
                {editingDeck ? "Save changes" : "Create Deck"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Card dialog (measured placeholders) */}
      <Dialog open={cardDialogOpen} onOpenChange={setCardDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Card — {selected?.name}</DialogTitle>
          </DialogHeader>
          <form onSubmit={submitCard} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="card-front">Front</Label>
              <Textarea
                id="card-front"
                value={cardFront}
                onChange={(e) => setCardFront(e.target.value)}
                placeholder="What do you want to remember?"
                rows={2}
                maxLength={2000}
                required
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="card-back">Back</Label>
              <Textarea
                id="card-back"
                value={cardBack}
                onChange={(e) => setCardBack(e.target.value)}
                placeholder="The answer..."
                rows={3}
                maxLength={2000}
                required
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="card-difficulty">Difficulty</Label>
              <select
                id="card-difficulty"
                value={cardDifficulty}
                onChange={(e) => setCardDifficulty(e.target.value as "easy" | "medium" | "hard")}
                className="flex h-9 w-full rounded-md border border-input bg-card px-3 py-2 text-sm shadow-sm"
              >
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </select>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setCardDialogOpen(false)}>Cancel</Button>
              <Button type="submit" variant="gradient" disabled={!cardFront.trim() || !cardBack.trim()}>
                Add Card
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function SimpleSidebarEmpty({ onCreate }: { onCreate: () => void }) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center rounded-xl bg-slate-50 px-4 py-10 text-center dark:bg-slate-800/60">
      <Layers className="mb-2 h-8 w-8 text-slate-300 dark:text-slate-600" strokeWidth={2} aria-hidden="true" />
      <h3 className="mb-1 font-semibold text-slate-700 dark:text-slate-200">No decks yet</h3>
      <p className="mb-3 text-sm text-slate-500 dark:text-slate-400">Create your first flashcard deck.</p>
      <Button variant="gradient" size="sm" className="sf-gradient-shadow-lg" onClick={onCreate}>
        Create Deck
      </Button>
    </div>
  );
}

function CardTile({ card }: { card: Flashcard }) {
  return (
    <div className="group rounded-xl border border-slate-200 bg-white p-4 transition-shadow hover:shadow-md dark:border-slate-700 dark:bg-slate-900">
      <div className="mb-3 flex items-start justify-between gap-2">
        <span
          className={cn(
            "rounded-full px-2 py-0.5 text-xs capitalize",
            DIFFICULTY_BADGE[card.difficulty] ?? DIFFICULTY_BADGE.medium,
          )}
        >
          {card.difficulty}
        </span>
        <div className="flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
          <Button
            variant="ghost"
            size="iconSm"
            aria-label={`Edit card ${card.front.slice(0, 24)}`}
            className="h-7 w-7"
            onClick={() => toast.info("Use the study mode to review and master cards")}
          >
            <Pencil className="h-3.5 w-3.5" strokeWidth={2} />
          </Button>
          <Button
            variant="ghost"
            size="iconSm"
            aria-label={`Delete card ${card.front.slice(0, 24)}`}
            className="h-7 w-7 text-red-500 hover:text-red-600"
            onClick={() => {
              void mutations.deleteCard(card.id);
              toast.success("Card deleted");
            }}
          >
            <Trash2 className="h-3.5 w-3.5" strokeWidth={2} />
          </Button>
        </div>
      </div>
      <p className="mb-2 font-medium text-slate-800 dark:text-slate-100">{card.front}</p>
      <p className="line-clamp-2 text-sm text-slate-500 dark:text-slate-400">{card.back}</p>
    </div>
  );
}

function StudyMode({
  deck,
  cards,
  index,
  flipped,
  onFlip,
  onPrev,
  onNext,
  onExit,
  onMastered,
}: {
  deck: FlashcardDeck;
  cards: Flashcard[];
  index: number;
  flipped: boolean;
  onFlip: () => void;
  onPrev: () => void;
  onNext: () => void;
  onExit: () => void;
  onMastered: () => void;
}) {
  const card = cards[index] ?? null;
  const masteredCount = cards.filter((c) => c.mastered).length;
  return (
    <div className="flex w-full max-w-2xl flex-col items-center gap-6" aria-label="Study mode">
      <div className="flex w-full items-center justify-between">
        <Button variant="outline" onClick={onExit}>
          Exit Study
        </Button>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          {masteredCount}/{cards.length} mastered
        </p>
      </div>
      {card && (
        <button
          type="button"
          data-flip-card
          onClick={onFlip}
          aria-label={flipped ? "Show question" : "Show answer"}
          className="relative h-80 w-full cursor-pointer [perspective:1000px]"
        >
          <div
            className="absolute inset-0 rounded-2xl shadow-xl transition-transform duration-500 [transform-style:preserve-3d]"
            style={{ transform: flipped ? "rotateY(180deg)" : "none" }}
          >
            {/* front — sRGB-exact gradient per the Tailwind v4 oklab trap */}
            <div
              data-flip-front
              className="absolute inset-0 flex items-center justify-center rounded-2xl p-8 [backface-visibility:hidden]"
              style={{
                backgroundImage:
                  "linear-gradient(to bottom right, rgb(139, 92, 246), rgb(79, 70, 229))",
              }}
            >
              <p className="text-center text-2xl font-medium text-white">{card.front}</p>
            </div>
            {/* back */}
            <div
              data-flip-back
              className="absolute inset-0 flex items-center justify-center rounded-2xl border-2 border-violet-200 bg-white p-8 [backface-visibility:hidden] [transform:rotateY(180deg)] dark:border-violet-900 dark:bg-slate-900"
            >
              <p className="whitespace-pre-wrap text-center text-xl text-slate-700 dark:text-slate-200">
                {card.back}
              </p>
            </div>
          </div>
        </button>
      )}
      <div className="flex items-center gap-4">
        <Button
          variant="outline"
          onClick={onPrev}
          disabled={index === 0}
          className="h-10 rounded-md px-8"
          aria-label="Previous card"
        >
          ←
        </Button>
        <span className="text-sm text-slate-500 dark:text-slate-400">
          {index + 1} / {cards.length}
        </span>
        <Button
          variant="outline"
          onClick={onNext}
          disabled={index >= cards.length - 1}
          className="h-10 rounded-md px-8"
          aria-label="Next card"
        >
          →
        </Button>
        <Button variant={card?.mastered ? "default" : "secondary"} size="sm" onClick={onMastered}>
          {card?.mastered ? "Mastered ✓" : "Mark mastered"}
        </Button>
      </div>
      <p className="text-xs text-slate-400">
        Studying <span className="font-medium text-slate-600 dark:text-slate-300">{deck.name}</span> —
        click the card to flip
      </p>
    </div>
  );
}
