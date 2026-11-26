import { describe, expect, it } from "vitest";
import { splitHighlightedClueText } from "./clueText";

describe("splitHighlightedClueText", () => {
  it("highlights matching character name parts longer than 2 characters", () => {
    const segments = splitHighlightedClueText("Sr. Barquillero estaba en Azoka.", "Sr. Barquillero");
    expect(segments).toEqual([
      { text: "Sr.", highlight: true },
      { text: " ", highlight: false },
      { text: "Barquillero", highlight: true },
      { text: " estaba en Azoka.", highlight: false },
    ]);
  });

  it("keeps HTML payloads as plain text segments without injecting markup", () => {
    const payload = '<img src=x onerror="alert(1)"> Barquillero <script>evil()</script>';
    const segments = splitHighlightedClueText(payload, "Barquillero");
    expect(segments).toEqual([
      { text: '<img src=x onerror="alert(1)"> ', highlight: false },
      { text: "Barquillero", highlight: true },
      { text: " <script>evil()</script>", highlight: false },
    ]);
  });

  it("escapes regex metacharacters in character names", () => {
    const segments = splitHighlightedClueText("El (Jefe) vio todo.", "(Jefe)");
    expect(segments).toEqual([
      { text: "El ", highlight: false },
      { text: "(Jefe)", highlight: true },
      { text: " vio todo.", highlight: false },
    ]);
  });
});