import { createContext, useContext } from "react";

export const ConcertContext = createContext(null);

export function useConcert() {
  const value = useContext(ConcertContext);
  if (!value) throw new Error("useConcert cần nằm trong ConcertProvider.");
  return value;
}
