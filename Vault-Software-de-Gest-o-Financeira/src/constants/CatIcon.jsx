import { ICON_MAP } from "./index";

// Renderiza o ícone de uma categoria a partir da chave string salva no localStorage.
// Uso: <CatIcon name={cat.icon} size={18} color={cat.color} />
export function CatIcon({ name, size = 18, color, style = {} }) {
  const Component = ICON_MAP[name];
  if (!Component)
    return (
      <span style={{ fontSize: size, ...style }}>
        {name || "✦"}
      </span>
    );
  return <Component size={size} color={color} style={style} />;
}