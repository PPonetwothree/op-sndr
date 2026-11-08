import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { SHORTCUTS } from "./HelpPanel";

describe("user guide", () => {
  const guide = readFileSync("docs/USER_GUIDE.md", "utf8");
  it("lists every keyboard shortcut the help panel shows", () => {
    const firstCells = guide
      .split("\n")
      .filter((l) => l.startsWith("|"))
      .map((l) => l.split("|")[1].trim());
    SHORTCUTS.forEach(([key]) => expect(firstCells, key).toContain(key));
  });
  it("is shipped with the offline package", () => {
    expect(readFileSync("scripts/package-offline.mjs", "utf8")).toContain('copyFileSync("docs/USER_GUIDE.md"');
  });
});
