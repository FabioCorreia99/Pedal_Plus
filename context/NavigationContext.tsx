import React, { createContext, useContext, useState } from "react";

type LatLng = { latitude: number; longitude: number };

type NavigationIntent =
  | {
      type: "location";
      destination: LatLng;
      destinationLabel: string;
    }
  | {
      type: "route";
      origin: LatLng;
      destination: LatLng;
      originLabel: string;
      destinationLabel: string;
    }
  | {
      type: "add-favorite";
      category: "home" | "work";
    };

type NavigationContextType = {
  intent: NavigationIntent | null;
  setIntent: (intent: NavigationIntent) => void;
  clearIntent: () => void;
};

const NavigationContext = createContext<NavigationContextType | undefined>(
  undefined,
);

export function NavigationProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [intent, setIntent] = useState<NavigationIntent | null>(null);

  return (
    <NavigationContext.Provider
      value={{
        intent,
        setIntent,
        clearIntent: () => setIntent(null),
      }}
    >
      {children}
    </NavigationContext.Provider>
  );
}

export function useNavigationIntent() {
  const ctx = useContext(NavigationContext);
  if (!ctx) {
    throw new Error(
      "useNavigationIntent must be used inside NavigationProvider",
    );
  }
  return ctx;
}
