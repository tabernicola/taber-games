import { useEffect } from "react";

/**
 * Applies the murdoku-light theme class to html and body while on Murdoku pages,
 * ensuring the global dark body styles do not leak or cover the light theme.
 */
export function useMurdokuTheme() {
  useEffect(() => {
    document.documentElement.classList.add("murdoku-light");
    document.body.classList.add("murdoku-light");

    return () => {
      document.documentElement.classList.remove("murdoku-light");
      document.body.classList.remove("murdoku-light");
    };
  }, []);
}
