import { Card, FSRS, Rating, type SchedulingInfo } from "fsrs.js";
import type { Progress } from "./types";

export type RatingValue = Rating;

const fsrs = new FSRS();

function today(): Date {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate());
}

export function newCard(): Card {
  return new Card();
}

export function scheduleNew(rating: Rating = Rating.Good): SchedulingInfo {
  return fsrs.repeat(newCard(), today())[rating];
}

export function progressToCard(p: Progress): Card {
  const card = new Card();
  card.due = new Date(p.due);
  card.stability = p.stability;
  card.difficulty = p.difficulty;
  card.elapsed_days = p.elapsed_days;
  card.scheduled_days = p.scheduled_days;
  card.reps = p.reps;
  card.lapses = p.lapses;
  card.state = p.state;
  if (p.last_review) {
    card.last_review = new Date(p.last_review);
  }
  return card;
}

export function cardToProgress(card: Card): Pick<
  Progress,
  "due" | "stability" | "difficulty" | "elapsed_days" | "scheduled_days" | "reps" | "lapses" | "state" | "last_review"
> {
  return {
    due: card.due.toISOString(),
    stability: card.stability,
    difficulty: card.difficulty,
    elapsed_days: card.elapsed_days,
    scheduled_days: card.scheduled_days,
    reps: card.reps,
    lapses: card.lapses,
    state: card.state,
    last_review: card.last_review ? card.last_review.toISOString() : null,
  };
}

export function review(p: Progress, rating: Rating): Pick<
  Progress,
  "due" | "stability" | "difficulty" | "elapsed_days" | "scheduled_days" | "reps" | "lapses" | "state" | "last_review"
> {
  const card = progressToCard(p);
  const info = fsrs.repeat(card, today())[rating];
  return cardToProgress(info.card);
}

export const RATINGS = Rating;