import { describe, expect, it } from "vitest";
import { diffRecords, useAudit } from "./auditStore";

describe("audit log", () => {
  it("diffs records field by field, ignoring bookkeeping fields", () => {
    const a = { functionalStatus: "UNKNOWN", damageLevel: 5, edited: false, sources: ["A"] };
    const b = { functionalStatus: "Operational", damageLevel: 5, edited: true, sources: ["A", "B"] };
    expect(diffRecords(a, b, ["edited"])).toEqual([
      { field: "functionalStatus", before: "UNKNOWN", after: "Operational" },
      { field: "sources", before: "A", after: "A, B" },
    ]);
  });
  it("records entries newest first with the analyst name", () => {
    useAudit.getState().clear();
    useAudit.getState().setAnalyst("Test Analyst");
    useAudit.getState().record({ action: "source.add", target: "SRC-X", summary: "first" });
    useAudit.getState().record({ action: "source.link", target: "EVT-001", summary: "second" });
    const e = useAudit.getState().entries;
    expect(e.map((x) => x.summary)).toEqual(["second", "first"]);
    expect(e[0].analyst).toBe("Test Analyst");
  });
});
