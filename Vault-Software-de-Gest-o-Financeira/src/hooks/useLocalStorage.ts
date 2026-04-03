import { useState, useEffect } from "react";

// Hook genérico que sincroniza estado com localStorage.
// Uso: const [value, setValue] = useLocalStorage("chave", valorInicial)
//
// NOTA: Para que a leitura inicial funcione corretamente, passe uma função
// como initialValue (ex: loadTx) — o React a chamará como inicializador lazy,
// garantindo que o dado seja lido do localStorage apenas uma vez, sem
// re-renderizações desnecessárias.
export function useLocalStorage(key, initialValue) {
  const [state, setState] = useState(initialValue);

  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(state));
    } catch (e) {
      console.warn(`[useLocalStorage] Erro ao salvar "${key}":`, e);
    }
  }, [key, state]);

  return [state, setState];
}