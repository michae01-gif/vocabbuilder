import { getDb } from "./db";

export const TUTORIAL_COMPLETION_REWARD = 100;

export type TutorialStepDef = {
  step: number;
  targetId: string;
  href: string;
  title: string;
  text: string;
};

export const TUTORIAL_STEPS: TutorialStepDef[] = [
  {
    step: 1,
    targetId: "tutorial-session",
    href: "/session",
    title: "Start today's session",
    text: "Every day starts with one short root lesson. Tap the golden START button to forge your first words.",
  },
  {
    step: 2,
    targetId: "tutorial-read",
    href: "/read",
    title: "Read your first passage",
    text: "Now see your words alive in real writing — tap READ PASSAGE.",
  },
  {
    step: 3,
    targetId: "tutorial-rewards",
    href: "/rewards",
    title: "See what coins can buy",
    text: "Mascots, banners, themes — tap REWARDS to open the shop.",
  },
];

export function getTutorialStepDb(userId: number): TutorialStepDef | null {
  const row = getDb().prepare("SELECT tutorial_step FROM users WHERE id = ?").get(userId) as
    | { tutorial_step: number }
    | undefined;
  const s = row?.tutorial_step ?? 0;
  return TUTORIAL_STEPS.find((t) => t.step === s) ?? null;
}

export function advanceTutorialDb(userId: number, currentStep: number): { completed: boolean; reward: number } {
  const db = getDb();
  const row = db.prepare("SELECT tutorial_step FROM users WHERE id = ?").get(userId) as
    | { tutorial_step: number }
    | undefined;
  if ((row?.tutorial_step ?? 0) !== currentStep) return { completed: false, reward: 0 };

  if (currentStep >= TUTORIAL_STEPS.length) {
    db.prepare("UPDATE users SET tutorial_step = 0, coins = coins + ? WHERE id = ?").run(
      TUTORIAL_COMPLETION_REWARD,
      userId
    );
    return { completed: true, reward: TUTORIAL_COMPLETION_REWARD };
  }
  db.prepare("UPDATE users SET tutorial_step = ? WHERE id = ?").run(currentStep + 1, userId);
  return { completed: false, reward: 0 };
}
