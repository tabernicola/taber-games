import { useEffect } from "react";

const backgroundProperties = ["background", "background-color", "background-image"] as const;

function captureBackground(style: CSSStyleDeclaration) {
  return backgroundProperties.map((property) => ({
    property,
    value: style.getPropertyValue(property),
    priority: style.getPropertyPriority(property),
  }));
}

function restoreBackground(
  style: CSSStyleDeclaration,
  previous: ReturnType<typeof captureBackground>,
) {
  for (const { property, value, priority } of previous) {
    if (value) {
      style.setProperty(property, value, priority);
    } else {
      style.removeProperty(property);
    }
  }
}

/**
 * Applies the murdoku-light theme class to html and body while on Murdoku pages,
 * ensuring the global dark body styles do not leak or cover the light theme.
 */
export function useMurdokuTheme() {
  useEffect(() => {
    const root = document.documentElement;
    const body = document.body;
    const rootBackground = captureBackground(root.style);
    const bodyBackground = captureBackground(body.style);
    const hadDarkClass = root.classList.contains("dark");
    const hadRootLightClass = root.classList.contains("murdoku-light");
    const hadBodyLightClass = body.classList.contains("murdoku-light");

    root.classList.remove("dark");
    root.classList.add("murdoku-light");
    body.classList.add("murdoku-light");
    root.style.setProperty("background", "#f8fafc", "important");
    body.style.setProperty("background", "#f8fafc", "important");

    return () => {
      root.classList.toggle("dark", hadDarkClass);
      root.classList.toggle("murdoku-light", hadRootLightClass);
      body.classList.toggle("murdoku-light", hadBodyLightClass);
      restoreBackground(root.style, rootBackground);
      restoreBackground(body.style, bodyBackground);
    };
  }, []);
}
