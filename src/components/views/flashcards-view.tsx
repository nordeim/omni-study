"use client";

import * as React from "react";
import { Layers, Plus, RotateCcw, Trash2 } from "lucide-react";
import { useDataStore, mutations, type FlashcardDeck, type Flashcard } from "@/lib/data";
import { useSubjectMap, EmptyState, SubjectChip } from "./shared";
import { Button } from "@/components/ui/button";
import { Input, Label, Textarea } from "@/components/ui/input";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Progress } from "@/components/ui/primitives";
import { toast } from "@/components/ui/toast";
import { cn } from "@/lib/utils";

// Flashcards — deck list + deck detail with a study mode (flip cards,
// mastered toggle, prev/next). Superset of the reference's "Select a deck".

interface DeckWithCount extends FlashcardDeck {
  cardCount: number;
}

export function FlashcardsView() {
  const decks = useDataStore((s) => s.data.decks) as DeckWithCount[];
  const cards = useDataStore((s) => s.data.cards);
  const subjects = useDataStore((s) => s.data.subjects);
  const loadAll = useDataStore((s) => s.loadAll);
  const subjectMap = useSubjectMap();

  const [selectedId, setSelectedId] = React.useState<string | null>(null);
  const [search, setSearch] = React.useState("");
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [editingDeck, setEditingDeck] = React.useState<FlashcardDeck | null>(null);
  const [deckName, setDeckName] = React.useState("");
  const [deckDesc, setDeckDesc] = React.useState("");
  const [deckSubject, setDeckSubject] = React.useState("");
  const [cardDialogOpen, setCardDialogOpen] = React.useState(false);
  const [cardFront, setCardFront] = React.useState("");
  const [cardBack, setCardBack] = React.useState("");

  // study state
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
  const masteredCount = deckCards.filter((c) => c.mastered).length;

  function openCreateDeck() {
    setEditingDeck(null);
    setDeckName("");
    setDeckDesc("");
    setDeckSubject("");
    setDialogOpen(true);
  }

  function openEditDeck(deck: FlashcardDeck) {
    setEditingDeck(deck);
    setDeckName(deck.name);
    setDeckDesc(deck.description ?? "");
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
          subjectId: deckSubject || null,
        });
        toast.success("Deck updated");
      } else {
        await mutations.createDeck({
          name: deckName.trim(),
          description: deckDesc.trim(),
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
        order: deckCards.length,
      });
      setCardFront("");
      setCardBack("");
      setCardDialogOpen(false);
      toast.success("Card added");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not add the card");
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-50">Flashcards</h1>
          <p className="mt-1 text-sm text-slate-500">Spaced-repetition style deck practice</p>
        </div>
        <Button onClick={openCreateDeck}><Plus className="h-4 w-4" /> Create Deck</Button>
      </div>

      <div className="relative max-w-md">
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search decks..."
          aria-label="Search decks"
          className="h-9"
        />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[340px_1fr]">
        {/* Deck list */}
        <div className="sf-card flex max-h-[70vh] flex-col overflow-hidden">
          {visibleDecks.length === 0 ? (
            <EmptyState
              icon={Layers}
              title="No decks yet"
              action={<Button variant="outline" onClick={openCreateDeck}>Create Deck</Button>}
            />
          ) : (
            <ul className="sf-scroll flex-1 divide-y divide-slate-100 overflow-y-auto dark:divide-slate-800">
              {visibleDecks.map((deck) => {
                const subject = deck.subjectId ? subjectMap.get(deck.subjectId) : undefined;
                const deckMastered = cards.filter((c) => c.deckId === deck.id && c.mastered).length;
                return (
                  <li key={deck.id}>
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedId(deck.id);
                        setStudyIndex(0);
                        setFlipped(false);
                      }}
                      aria-pressed={selectedId === deck.id}
                      className={cn(
                        "flex w-full flex-col gap-1.5 px-4 py-4 text-left transition-colors",
                        selectedId === deck.id
                          ? "bg-sf-primary-soft dark:bg-sf-primary-soft-dark"
                          : "hover:bg-slate-50 dark:hover:bg-slate-800/40",
                      )}
                    >
                      <span className="flex items-center justify-between gap-2">
                        <span className="min-w-0 flex-1 truncate text-sm font-semibold text-slate-800 dark:text-slate-100">
                          {deck.name}
                        </span>
                        <span className="shrink-0 text-xs text-slate-400">
                          {deckMastered}/{deck.cardCount}
                        </span>
                      </span>
                      {subject && <SubjectChip subject={subject} />}
                      {deck.cardCount > 0 && (
                        <Progress value={(deckMastered / deck.cardCount) * 100} className="h-1.5" />
                      )}
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        {/* Deck detail */}
        <div className="sf-card flex min-h-[420px] flex-col overflow-hidden">
          {selected ? (
            <>
              <header className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-6 py-4 dark:border-slate-800">
                <div>
                  <h3 className="text-[18px] font-semibold text-slate-800 dark:text-slate-100">{selected.name}</h3>
                  <p className="mt-0.5 text-xs text-slate-400">
                    {deckCards.length} cards · {masteredCount} mastered
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" onClick={() => setCardDialogOpen(true)}>
                    <Plus className="h-4 w-4" /> Add Card
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => openEditDeck(selected)}>Edit</Button>
                  <Button
                    variant="ghost"
                    size="iconSm"
                    aria-label={`Delete deck "${selected.name}"`}
                    onClick={() => {
                      void mutations.deleteDeck(selected.id);
                      setSelectedId(null);
                      toast.success("Deck deleted");
                    }}
                    className="text-slate-400 hover:text-red-500"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </header>

              {deckCards.length === 0 ? (
                <EmptyState
                  icon={Layers}
                  title="No cards in this deck"
                  action={<Button variant="outline" onClick={() => setCardDialogOpen(true)}>Add Card</Button>}
                />
              ) : (
                <div className="flex flex-1 flex-col items-center justify-center gap-6 p-8">
                  {/* Flip card */}
                  <button
                    type="button"
                    onClick={() => setFlipped((v) => !v)}
                    aria-label={flipped ? "Show front of card" : "Show back of card"}
                    className="sf-focus flex h-[260px] w-full max-w-xl items-center justify-center rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-md transition-colors dark:border-slate-700 dark:bg-slate-900"
                  >
                    <div>
                      <p className={cn("mb-2 text-xs font-semibold uppercase tracking-widest", flipped ? "text-emerald-500" : "text-sf-primary-strong")}>
                        {flipped ? "Back" : "Front"}
                      </p>
                      <p className="whitespace-pre-wrap text-lg font-medium leading-relaxed text-slate-800 dark:text-slate-100">
                        {flipped ? currentCard?.back : currentCard?.front}
                      </p>
                    </div>
                  </button>

                  {/* Controls */}
                  <div className="flex flex-wrap items-center justify-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setStudyIndex((i) => Math.max(0, i - 1));
                        setFlipped(false);
                      }}
                      disabled={studyIndex === 0}
                    >
                      ← Previous
                    </Button>
                    <span className="px-2 text-sm text-slate-400">
                      {studyIndex + 1} / {deckCards.length}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setStudyIndex((i) => Math.min(deckCards.length - 1, i + 1));
                        setFlipped(false);
                      }}
                      disabled={studyIndex >= deckCards.length - 1}
                    >
                      Next →
                    </Button>
                    <Button
                      variant={currentCard?.mastered ? "default" : "secondary"}
                      size="sm"
                      onClick={() => {
                        if (!currentCard) return;
                        void mutations.updateCard(currentCard.id, { mastered: !currentCard.mastered });
                        setFlipped(false);
                        if (!currentCard.mastered && studyIndex < deckCards.length - 1) {
                          setStudyIndex((i) => i + 1);
                        }
                      }}
                    >
                      {currentCard?.mastered ? "Mastered ✓" : "Mark mastered"}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      aria-label="Reset deck progress"
                      onClick={() => {
                        for (const c of deckCards) {
                          if (c.mastered) void mutations.updateCard(c.id, { mastered: false });
                        }
                        setStudyIndex(0);
                        setFlipped(false);
                        toast.info("Deck progress reset");
                      }}
                    >
                      <RotateCcw className="h-4 w-4" /> Reset
                    </Button>
                    <Button
                      variant="ghost"
                      size="iconSm"
                      aria-label={`Delete card ${studyIndex + 1}`}
                      onClick={() => {
                        if (!currentCard) return;
                        void mutations.deleteCard(currentCard.id);
                        setStudyIndex(0);
                        setFlipped(false);
                        toast.success("Card deleted");
                      }}
                      className="text-slate-400 hover:text-red-500"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </>
          ) : (
            <EmptyState icon={Layers} title="Select a deck" hint="Pick a deck to study, or create a new one." />
          )}
        </div>
      </div>

      {/* Deck dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingDeck ? "Edit Deck" : "Create Deck"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={submitDeck} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="deck-name">Name</Label>
              <Input id="deck-name" value={deckName} onChange={(e) => setDeckName(e.target.value)} maxLength={120} required />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="deck-desc">Description</Label>
              <Textarea id="deck-desc" value={deckDesc} onChange={(e) => setDeckDesc(e.target.value)} rows={2} maxLength={1000} />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="deck-subject">Subject</Label>
              <select
                id="deck-subject"
                value={deckSubject}
                onChange={(e) => setDeckSubject(e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-card px-3 py-2 text-sm shadow-sm"
              >
                <option value="">None</option>
                {subjects.map((s) => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={!deckName.trim()}>
                {editingDeck ? "Save changes" : "Create Deck"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Card dialog */}
      <Dialog open={cardDialogOpen} onOpenChange={setCardDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Card — {selected?.name}</DialogTitle>
          </DialogHeader>
          <form onSubmit={submitCard} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="card-front">Front (question)</Label>
              <Textarea id="card-front" value={cardFront} onChange={(e) => setCardFront(e.target.value)} rows={2} maxLength={2000} required />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="card-back">Back (answer)</Label>
              <Textarea id="card-back" value={cardBack} onChange={(e) => setCardBack(e.target.value)} rows={3} maxLength={2000} required />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setCardDialogOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={!cardFront.trim() || !cardBack.trim()}>Add Card</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
