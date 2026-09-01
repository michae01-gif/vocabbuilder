import type { RootSeed } from "@/lib/types";
import { part1 } from "./part1";
import { part2 } from "./part2";
import { part3 } from "./part3";
import { part4 } from "./part4";
import { part5 } from "./part5";

export const roots: RootSeed[] = [...part1, ...part2, ...part3, ...part4, ...part5];

export const rootCount = roots.length;
export const wordCount = roots.reduce((n, r) => n + r.words.length, 0);