// ---------------------------------------------------------------------------
// Calculator engine — pure, unit-tested. Powers the Calculator view's four
// tabs (Basic / Scientific / GPA / Unit Converter) and the persisted history.
// No eval(): expressions are tokenized and evaluated with the shunting-yard
// algorithm (precedence + unary minus + parentheses + functions + constants).
// ---------------------------------------------------------------------------

export type CalcMode = "basic" | "scientific" | "gpa" | "converter";

type Token =
  | { kind: "num"; value: number }
  | { kind: "op"; value: string }
  | { kind: "fn"; value: string }
  | { kind: "lp" }
  | { kind: "rp" };

const FUNCTIONS: Record<string, (x: number) => number> = {
  sin: (x) => Math.sin(x),
  cos: (x) => Math.cos(x),
  tan: (x) => Math.tan(x),
  asin: Math.asin,
  acos: Math.acos,
  atan: Math.atan,
  sqrt: Math.sqrt,
  cbrt: Math.cbrt,
  ln: Math.log,
  log: Math.log10,
  abs: Math.abs,
  exp: Math.exp,
};

const CONSTANTS: Record<string, number> = {
  pi: Math.PI,
  e: Math.E,
};

const PRECEDENCE: Record<string, number> = {
  "+": 1,
  "-": 1,
  "*": 2,
  "/": 2,
  "%": 2, // modulo (the % key in modulo context)
  "^": 3,
  "u-": 4, // unary minus — binds tighter than any binary operator
};

function tokenize(input: string): Token[] {
  const tokens: Token[] = [];
  let i = 0;
  const s = input.replace(/\s+/g, "").replace(/×/g, "*").replace(/÷/g, "/").replace(/−/g, "-");
  let prev: Token | undefined;
  while (i < s.length) {
    const c = s[i]!;
    if (/[0-9.]/.test(c)) {
      let j = i;
      while (j < s.length && /[0-9.]/.test(s[j]!)) j++;
      const raw = s.slice(i, j);
      const value = Number(raw);
      if (Number.isNaN(value)) throw new Error(`Invalid number: ${raw}`);
      tokens.push({ kind: "num", value });
      i = j;
      prev = tokens[tokens.length - 1];
      continue;
    }
    if (/[a-z]/i.test(c)) {
      let j = i;
      while (j < s.length && /[a-z]/i.test(s[j]!)) j++;
      const word = s.slice(i, j).toLowerCase();
      if (word in FUNCTIONS) {
        tokens.push({ kind: "fn", value: word });
      } else if (word in CONSTANTS) {
        tokens.push({ kind: "num", value: CONSTANTS[word]! });
      } else {
        throw new Error(`Unknown identifier: ${word}`);
      }
      i = j;
      prev = tokens[tokens.length - 1];
      continue;
    }
    if (c === "(") {
      tokens.push({ kind: "lp" });
      i++;
      prev = tokens[tokens.length - 1];
      continue;
    }
    if (c === ")") {
      tokens.push({ kind: "rp" });
      i++;
      prev = tokens[tokens.length - 1];
      continue;
    }
    if (c === "!") {
      tokens.push({ kind: "op", value: "!" });
      i++;
      prev = tokens[tokens.length - 1];
      continue;
    }
    if (c in PRECEDENCE) {
      // Unary +/-: at expression start or after an operator/open-paren.
      // Unary minus becomes the dedicated "u-" operator (higher precedence,
      // right-binding) — rewriting to "0 - x" would misparse "2 * -3".
      const unaryPosition =
        prev === undefined || prev.kind === "op" || prev.kind === "lp" || prev.kind === "fn";
      if (c === "-" && unaryPosition) {
        tokens.push({ kind: "op", value: "u-" });
      } else if (c === "+" && unaryPosition) {
        // Unary plus is a no-op.
      } else {
        tokens.push({ kind: "op", value: c });
      }
      i++;
      prev = tokens[tokens.length - 1] ?? { kind: "op", value: c };
      continue;
    }
    throw new Error(`Unexpected character: ${c}`);
  }
  return tokens;
}

function factorial(n: number): number {
  if (n < 0 || !Number.isInteger(n)) throw new Error("Factorial requires a non-negative integer");
  if (n > 170) throw new Error("Factorial overflow");
  let out = 1;
  for (let k = 2; k <= n; k++) out *= k;
  return out;
}

/** Evaluate an arithmetic/scientific expression. Throws on malformed input. */
export function evaluate(expression: string): number {
  const tokens = tokenize(expression);
  if (tokens.length === 0) throw new Error("Empty expression");
  const output: Token[] = [];
  const stack: Token[] = [];
  for (const tok of tokens) {
    if (tok.kind === "num") {
      output.push(tok);
    } else if (tok.kind === "fn") {
      stack.push(tok);
    } else if (tok.kind === "op") {
      if (tok.value === "!") {
        output.push(tok); // postfix — straight to output
        continue;
      }
      while (stack.length > 0) {
        const top = stack[stack.length - 1]!;
        if (top.kind !== "op") break;
        if (PRECEDENCE[top.value]! < PRECEDENCE[tok.value]!) break;
        // "^" and "u-" are right-binding: equal precedence stays on the stack.
        if (
          (tok.value === "^" || tok.value === "u-") &&
          PRECEDENCE[top.value] === PRECEDENCE[tok.value]!
        ) {
          break;
        }
        output.push(stack.pop()!);
      }
      stack.push(tok);
    } else if (tok.kind === "lp") {
      stack.push(tok);
    } else {
      while (stack.length > 0 && stack[stack.length - 1]!.kind !== "lp") {
        output.push(stack.pop()!);
      }
      if (stack.length === 0) throw new Error("Mismatched parentheses");
      stack.pop(); // drop "("
      if (stack.length > 0 && stack[stack.length - 1]!.kind === "fn") {
        output.push(stack.pop()!);
      }
    }
  }
  while (stack.length > 0) {
    const top = stack.pop()!;
    if (top.kind === "lp") throw new Error("Mismatched parentheses");
    output.push(top);
  }

  const values: number[] = [];
  for (const tok of output) {
    if (tok.kind === "num") values.push(tok.value);
    else if (tok.kind === "fn") {
      const x = values.pop();
      if (x === undefined) throw new Error("Missing function argument");
      values.push(FUNCTIONS[tok.value]!(x));
    } else if (tok.kind === "op") {
      if (tok.value === "!") {
        const x = values.pop();
        if (x === undefined) throw new Error("Missing factorial operand");
        values.push(factorial(x));
        continue;
      }
      if (tok.value === "u-") {
        const a = values.pop();
        if (a === undefined) throw new Error("Missing operand");
        values.push(-a);
        continue;
      }
      const b = values.pop();
      const a = values.pop();
      if (a === undefined || b === undefined) throw new Error("Missing operand");
      switch (tok.value) {
        case "+": values.push(a + b); break;
        case "-": values.push(a - b); break;
        case "*": values.push(a * b); break;
        case "/":
          if (b === 0) throw new Error("Division by zero");
          values.push(a / b);
          break;
        case "%": values.push(a % b); break;
        case "^": values.push(Math.pow(a, b)); break;
        default: throw new Error(`Unknown operator: ${tok.value}`);
      }
    }
  }
  if (values.length !== 1) throw new Error("Malformed expression");
  const result = values[0]!;
  if (!Number.isFinite(result)) throw new Error("Result is not finite");
  return result;
}

// ---- GPA calculator ---------------------------------------------------------

export interface GpaRow {
  grade: string; // letter or numeric points
  credits: number;
}

/**
 * US 4.0-scale letter → points (the reference's GPA Calculator convention).
 * Also accepts raw numeric point values ("3.7") and percents ("88%").
 */
export function gpaPoints(grade: string): number | null {
  const g = grade.trim().toUpperCase();
  const letter: Record<string, number> = {
    "A+": 4.0, A: 4.0, "A-": 3.7,
    "B+": 3.3, B: 3.0, "B-": 2.7,
    "C+": 2.3, C: 2.0, "C-": 1.7,
    "D+": 1.3, D: 1.0, "D-": 0.7,
    F: 0.0,
  };
  if (g in letter) return letter[g]!;
  if (/^\d+(\.\d+)?$/.test(g)) {
    const v = Number(g);
    if (v >= 0 && v <= 4) return v;
    if (v > 4 && v <= 100) return Math.max(0, Math.min(4, (v / 100) * 4));
    return null;
  }
  if (/^\d+(\.\d+)?%$/.test(g)) {
    return Math.max(0, Math.min(4, (Number(g.slice(0, -1)) / 100) * 4));
  }
  return null;
}

/** Credit-weighted GPA; 0 when no valid rows. */
export function computeGpa(rows: GpaRow[]): number {
  let points = 0;
  let credits = 0;
  for (const row of rows) {
    const p = gpaPoints(row.grade);
    if (p === null || row.credits <= 0) continue;
    points += p * row.credits;
    credits += row.credits;
  }
  if (credits === 0) return 0;
  return Math.round((points / credits) * 100) / 100;
}

// ---- Unit converter ---------------------------------------------------------

export type UnitCategory =
  | "length"
  | "mass"
  | "temperature"
  | "volume"
  | "area"
  | "speed"
  | "time"
  | "data";

/** Factor to the category base unit (temperature handled specially). */
export const UNITS: Record<UnitCategory, Record<string, number>> = {
  length: {
    mm: 0.001, cm: 0.01, m: 1, km: 1000,
    in: 0.0254, ft: 0.3048, yd: 0.9144, mi: 1609.344,
  },
  mass: {
    mg: 1e-6, g: 0.001, kg: 1, t: 1000,
    oz: 0.0283495, lb: 0.453592,
  },
  temperature: { "°C": 0, "°F": 0, K: 0 },
  volume: { ml: 0.001, l: 1, m3: 1000, gal: 3.78541, qt: 0.946353, pt: 0.473176, cup: 0.236588 },
  area: { "cm2": 0.0001, "m2": 1, "km2": 1e6, ha: 10000, "ft2": 0.092903, "ac": 4046.86 },
  speed: { "m/s": 1, "km/h": 0.277778, mph: 0.44704, kn: 0.514444 },
  time: { s: 1, min: 60, h: 3600, d: 86400, wk: 604800 },
  data: { B: 1, KB: 1024, MB: 1024 ** 2, GB: 1024 ** 3, TB: 1024 ** 4 },
};

function tempToCelsius(v: number, unit: string): number {
  if (unit === "°C") return v;
  if (unit === "°F") return (v - 32) / 1.8;
  return v - 273.15; // K
}

function celsiusTo(v: number, unit: string): number {
  if (unit === "°C") return v;
  if (unit === "°F") return v * 1.8 + 32;
  return v + 273.15; // K
}

export function convert(value: number, from: string, to: string, category: UnitCategory): number {
  if (category === "temperature") {
    if (!(from in UNITS.temperature) || !(to in UNITS.temperature)) {
      throw new Error("Unknown temperature unit");
    }
    return celsiusTo(tempToCelsius(value, from), to);
  }
  const table = UNITS[category];
  if (!table || !(from in table) || !(to in table)) {
    throw new Error(`Unknown unit in category ${category}`);
  }
  return (value * table[from]!) / table[to]!;
}

/** Pretty calculator display: trim float noise, keep reasonable precision. */
export function formatCalcResult(n: number): string {
  if (!Number.isFinite(n)) return "Error";
  if (Number.isInteger(n) && Math.abs(n) < 1e15) return n.toString();
  const abs = Math.abs(n);
  if (abs >= 1e12 || abs < 1e-9) return n.toExponential(6);
  return String(Math.round(n * 1e10) / 1e10);
}

/**
 * S15 — map a PHYSICAL keyboard key onto the calculator's press/submit
 * pipeline (the superset: the reference's calculator is click-only, verified
 * both ways — see docs/remediation-plan-session15.md C0).
 *
 * Operators map to the keypad GLYPHS (* → ×, / → ÷) so the display matches
 * what clicking the same operation would show; the tokenizer normalizes
 * both back to ASCII before parsing. Returns null for anything the keypad
 * cannot express — the listener ignores those keys entirely.
 */
export function mapPhysicalKey(key: string): string | null {
  switch (key) {
    case "Enter":
    case "=":
      return "=";
    case "Backspace":
      return "⌫";
    case "Escape":
      return "C";
    case "*":
      return "×";
    case "/":
      return "÷";
    default:
      return /^[0-9.()%^+-]$/.test(key) ? key : null;
  }
}
