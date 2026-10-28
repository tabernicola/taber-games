const API_KEY = import.meta.env["VITE_GOOGLE_TRANSLATE_API_KEY"];

const LANG_MAP: Record<string, string> = {
  es: "es",
  eu: "eu",
  en: "en",
};

export async function translateText(text: string, source: string, target: string): Promise<string> {
  if (!API_KEY) {
    throw new Error("VITE_GOOGLE_TRANSLATE_API_KEY no está configurado.");
  }
  if (!text.trim()) return text;

  const url = `https://translation.googleapis.com/language/translate/v2?key=${API_KEY}`;
  const body = {
    q: text,
    source: LANG_MAP[source] ?? source,
    target: LANG_MAP[target] ?? target,
    format: "text",
  };

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Error de traducción: ${res.status} ${err}`);
  }

  const data = await res.json();
  return data?.data?.translations?.[0]?.translatedText ?? text;
}
