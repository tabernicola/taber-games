import { describe, expect, it } from "vitest";
import { renderErrorPage } from "./error-page";

describe("renderErrorPage", () => {
  it("returns a complete standalone html document", () => {
    const html = renderErrorPage();
    expect(html).toMatch(/^<!doctype html>/);
    expect(html).toContain("<title>This page didn't load</title>");
    expect(html).toContain('href="/"');
    expect(html).toContain("location.reload()");
  });
});
