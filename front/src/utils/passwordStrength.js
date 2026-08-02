// Regras minimas exigidas para criar uma conta. As mesmas valem no backend,
// que e quem realmente barra: a validacao daqui e so para dar retorno rapido.
export const PASSWORD_MIN_LENGTH = 8;

export function evaluatePassword(password = "") {
    const checks = {
        length: password.length >= PASSWORD_MIN_LENGTH,
        letter: /[a-zA-Z]/.test(password),
        number: /\d/.test(password),
        upperAndLower: /[a-z]/.test(password) && /[A-Z]/.test(password),
        symbol: /[^a-zA-Z0-9]/.test(password),
        longEnough: password.length >= 12,
    };

    // Obrigatorio para o cadastro passar.
    const isValid = checks.length && checks.letter && checks.number;

    const points =
        Number(checks.length) +
        Number(checks.letter && checks.number) +
        Number(checks.upperAndLower) +
        Number(checks.symbol) +
        Number(checks.longEnough);

    let score = 0;
    if (password.length > 0) score = 1;
    if (points >= 2) score = 2;
    if (points >= 3) score = 3;
    if (points >= 5) score = 4;

    // Se nem o minimo obrigatorio bateu, nao deixa passar de "fraca".
    if (!isValid && score > 1) score = 1;

    return { checks, isValid, score };
}

export function getStrengthLabel(score) {
    if (score <= 1) return "Weak";
    if (score === 2) return "Fair";
    if (score === 3) return "Good";
    return "Strong";
}

export function getMissingRequirement(checks) {
    if (!checks.length) return `Use at least ${PASSWORD_MIN_LENGTH} characters.`;
    if (!checks.letter) return "Add at least one letter.";
    if (!checks.number) return "Add at least one number.";
    if (!checks.upperAndLower) return "Mix upper and lower case for a stronger password.";
    if (!checks.symbol) return "Add a symbol for a stronger password.";
    if (!checks.longEnough) return "Longer passwords are harder to guess.";
    return "";
}
