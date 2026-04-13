"use client";
import { createContext, useContext, useState, ReactNode } from "react";

interface BibbleContextType {
  contextoExtra: any;
  setContextoExtra: (dados: any) => void;
}

const BibbleContext = createContext<BibbleContextType | undefined>(undefined);

export function BibbleProvider({ children }: { children: ReactNode }) {
  const [contextoExtra, setContextoExtra] = useState({ etapa: "Início" });

  return (
    <BibbleContext.Provider value={{ contextoExtra, setContextoExtra }}>
      {children}
    </BibbleContext.Provider>
  );
}

export const useBibble = () => {
  const context = useContext(BibbleContext);
  if (!context) throw new Error("useBibble deve ser usado dentro de um BibbleProvider");
  return context;
};