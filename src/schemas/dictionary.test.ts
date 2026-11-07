import { describe, expect, it } from "vitest";
import type { z } from "zod";
import { DATA_DICTIONARY } from "@/data/dataDictionary";
import { CampaignEventSchema } from "./eventSchema";
import { TargetSchema } from "./targetSchema";
import { SourceSchema, WeaponSystemSchema } from "./referenceSchema";

const keys = (s: z.ZodObject<z.ZodRawShape>) => Object.keys(s.shape).sort();
const SCHEMAS = {
  events: keys(CampaignEventSchema._def.schema as unknown as z.ZodObject<z.ZodRawShape>),
  targets: keys(TargetSchema),
  sources: keys(SourceSchema),
  weapons: keys(WeaponSystemSchema),
};

describe("data dictionary", () => {
  for (const [id, fields] of Object.entries(SCHEMAS)) {
    it(`documents exactly the ${id} schema fields`, () => {
      const doc = DATA_DICTIONARY.find((d) => d.id === id)!;
      expect(doc.fields.map((f) => f.field).sort()).toEqual(fields);
    });
  }
});

describe("version", () => {
  it("APP_VERSION matches package.json", async () => {
    const { readFileSync } = await import("node:fs");
    const { APP_VERSION } = await import("@/version");
    expect(APP_VERSION).toBe(JSON.parse(readFileSync("package.json", "utf8")).version);
  });
});
