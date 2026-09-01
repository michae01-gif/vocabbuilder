export type WheelSegment = {
  amount: number;
  weight: number;
  color: string;
  label: string;
};

export const WHEEL_SEGMENTS: WheelSegment[] = [
  { amount: 15, weight: 20, color: "#f59e0b", label: "15" },
  { amount: 30, weight: 15, color: "#10b981", label: "30" },
  { amount: 10, weight: 22, color: "#0ea5e9", label: "10" },
  { amount: 50, weight: 10, color: "#8b5cf6", label: "50" },
  { amount: 20, weight: 18, color: "#f43f5e", label: "20" },
  { amount: 100, weight: 8, color: "#14b8a6", label: "100" },
  { amount: 25, weight: 16, color: "#f97316", label: "25" },
  { amount: 250, weight: 2, color: "#eab308", label: "250" },
];

export function wheelGradient(): string {
  const step = 360 / WHEEL_SEGMENTS.length;
  return `conic-gradient(${WHEEL_SEGMENTS.map((s, i) => `${s.color} ${i * step}deg ${(i + 1) * step}deg`).join(", ")})`;
}
