import { createContext, useContext } from "react";

export const CompetitionContext = createContext(null);

export function useCompetition() {
  const ctx = useContext(CompetitionContext);
  if (!ctx) throw new Error("useCompetition must be used inside CompetitionShell");
  return ctx;
}
