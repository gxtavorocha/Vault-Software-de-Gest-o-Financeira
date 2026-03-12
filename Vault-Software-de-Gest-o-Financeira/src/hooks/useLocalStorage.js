import { useState, useEffect } from "react";

// Hook genérico que sincroniza estado com localStorage
// Uso: const [value, setValue] = useLocalStorage("chave", valorInicial)

export function useLocalStorage(key, initialValue) {
  const [state, setState] = useState(initialValue);

  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(state));
    } catch {}
  }, [key, state]);

  return [state, setState];
}
