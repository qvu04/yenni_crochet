import { describe, expect, it } from "vitest";
import { calculateDepositAmount } from "./pricing";

describe("calculateDepositAmount", () => {
  it("returns 0 when total amount is 0", () => {
    const result = calculateDepositAmount(0);
    expect(result).toBe(0);
  });
  it("does not make deposit larger total amount", () => {
    const result = calculateDepositAmount(8000);
    expect(result).toBe(8000);
  });
  it("returns the minimum deposit amount when calculated deposit is less than minimum", () => {
    const result = calculateDepositAmount(20000);
    expect(result).toBe(10000);
  });
  it("returns deposit amount by default rate", () => {
    const result = calculateDepositAmount(100000);
    expect(result).toBe(30000);
  });
  it("returns deposit amount round up to nearest thousand", () => {
    const result = calculateDepositAmount(123456);
    expect(result).toBe(38000);
  });
  it("returns the maximum deposit amount when calculated deposit is more than maximum", () => {
    const result = calculateDepositAmount(1000000);
    expect(result).toBe(200000);
  });
  it("returns 0 when total amount is negative", () => {
    const result = calculateDepositAmount(-10000);
    expect(result).toBe(0);
  });
  it("supports custom deposit policy", () => {
    const result = calculateDepositAmount(100000, 0.5, 40000, 20000);
    expect(result).toBe(40000);
  });
});