import { ICON_MAP } from "./index";


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