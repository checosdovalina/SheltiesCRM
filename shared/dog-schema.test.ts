import assert from "node:assert/strict";
import { test } from "node:test";
import { insertDogSchema } from "./schema";

const required = { clientId: "client-test", petTypeId: "pet-type-test", name: "Luna" };

test("optional blank weight is normalized to null for PostgreSQL", () => {
  for (const weight of ["", "   ", null]) {
    assert.equal(insertDogSchema.parse({ ...required, weight }).weight, null);
  }
  assert.equal(insertDogSchema.parse(required).weight, undefined);
});

test("valid weights and all tab fields survive normalization", () => {
  for (const weight of ["25.5", "0", "3", " 4.25 "]) {
    const result = insertDogSchema.parse({
      ...required, weight, fears: "Truenos", yawning: true, activeProtocolId: "",
    });
    assert.equal(result.weight, weight.trim());
    assert.equal(result.fears, "Truenos");
    assert.equal(result.yawning, true);
  }
});

test("invalid weights and missing required values are rejected", () => {
  for (const weight of ["abc", "-2", "NaN", "1.2.3"]) {
    assert.equal(insertDogSchema.safeParse({ ...required, weight }).success, false);
  }
  for (const field of ["clientId", "petTypeId", "name"]) {
    assert.equal(insertDogSchema.safeParse({ ...required, [field]: " " }).success, false);
  }
});

test("editing can clear weight without requiring unrelated fields", () => {
  assert.deepEqual(insertDogSchema.partial().parse({ weight: "" }), { weight: null });
  assert.deepEqual(insertDogSchema.partial().parse({ notes: "Nota" }), { notes: "Nota" });
});
