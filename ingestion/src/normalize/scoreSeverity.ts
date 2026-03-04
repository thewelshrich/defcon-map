import type { ConflictEventCategory, EventSeverity } from "../../../src/domain/events";

export function scoreSeverity(args: {
  category: ConflictEventCategory;
  mentionCount: number;
}): EventSeverity {
  const { category, mentionCount } = args;

  if (category === "civilian" || mentionCount >= 100) {
    return "critical";
  }

  if (mentionCount >= 50 || (category === "battle" && mentionCount >= 30)) {
    return "high";
  }

  if (mentionCount >= 20) {
    return "medium";
  }

  return "low";
}
