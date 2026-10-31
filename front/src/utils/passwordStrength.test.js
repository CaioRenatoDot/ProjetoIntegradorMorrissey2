import { describe, expect, it } from "vitest";
import { evaluatePassword, getMissingRequirement, getStrengthLabel } from "./passwordStrength";

describe("evaluatePassword", () => {
  it("exige 8 caracteres, uma letra e um numero (mesma regra da API)", () => {
    expect(evaluatePassword("abc12345").isValid).toBe(true);
    expect(evaluatePassword("abc1234").isValid).toBe(false);
    expect(evaluatePassword("abcdefgh").isValid).toBe(false);
    expect(evaluatePassword("12345678").isValid).toBe(false);
  });

  it("senha invalida nunca passa de fraca", () => {
    expect(evaluatePassword("ABCdef!!xyzw").score).toBe(1);
  });

  it("senha longa, com simbolo e caixa mista e forte", () => {
    const { score } = evaluatePassword("Abcdef12!xyz");
    expect(getStrengthLabel(score)).toBe("Strong");
  });

  it("aponta o primeiro requisito que falta", () => {
    expect(getMissingRequirement(evaluatePassword("ab1").checks)).toMatch(/at least 8/);
    expect(getMissingRequirement(evaluatePassword("abcdefgh").checks)).toMatch(/number/);
  });
});
