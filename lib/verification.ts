/**
 * Content verification helpers. Pure functions shared by the build time gate
 * (scripts/checkContent.ts), the unit tests and the UI markers.
 */

export const PLACEHOLDER_PREFIX = "[VERIFY:";

export type VerificationIssueKind = "unverified" | "placeholder";

export interface VerificationIssue {
  file: string;
  path: string;
  kind: VerificationIssueKind;
  detail: string;
}

export function isPlaceholder(value: string): boolean {
  return value.includes(PLACEHOLDER_PREFIX);
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

/**
 * Walk a content export and return every object marked `verified: false` and every string
 * that still contains a [VERIFY: ...] placeholder.
 */
export function collectIssues(file: string, value: unknown, path: string): VerificationIssue[] {
  const issues: VerificationIssue[] = [];

  if (typeof value === "string") {
    if (isPlaceholder(value)) issues.push({ file, path, kind: "placeholder", detail: value });
    return issues;
  }

  if (Array.isArray(value)) {
    value.forEach((item, index) => {
      issues.push(...collectIssues(file, item, `${path}[${String(index)}]`));
    });
    return issues;
  }

  if (isRecord(value)) {
    if (value.verified === false) {
      const source = typeof value.source === "string" ? value.source : "no source recorded";
      const todo = typeof value.todo === "string" ? ` | to do: ${value.todo}` : "";
      issues.push({ file, path, kind: "unverified", detail: `${source}${todo}` });
    }
    for (const [key, child] of Object.entries(value)) {
      if (key === "source" || key === "todo") continue;
      issues.push(...collectIssues(file, child, path ? `${path}.${key}` : key));
    }
  }

  return issues;
}

/** Collect issues for every export of every content module. */
export function collectAllIssues(
  modules: Record<string, Record<string, unknown>>,
): VerificationIssue[] {
  return Object.entries(modules).flatMap(([file, exports]) =>
    Object.entries(exports).flatMap(([name, value]) => collectIssues(file, value, name)),
  );
}

export interface GateResult {
  ok: boolean;
  report: string;
}

/**
 * Decide whether a build may continue. Production builds fail while any issue remains;
 * preview builds and report mode list the issues and pass. Schema errors fail in every mode.
 */
export function evaluateGate(
  issues: readonly VerificationIssue[],
  schemaErrors: readonly string[],
  options: { allowUnverified: boolean; reportOnly: boolean },
): GateResult {
  const lines: string[] = [];

  if (schemaErrors.length > 0) {
    lines.push(`Content schema errors (${String(schemaErrors.length)}):`);
    for (const error of schemaErrors) lines.push(`  ✗ ${error}`);
    lines.push("");
  }

  if (issues.length > 0) {
    lines.push(`Unverified content (${String(issues.length)} items):`);
    let currentFile = "";
    for (const issue of issues) {
      if (issue.file !== currentFile) {
        currentFile = issue.file;
        lines.push(`  content/${issue.file}.ts`);
      }
      const marker = issue.kind === "placeholder" ? "placeholder" : "unverified ";
      lines.push(`    • [${marker}] ${issue.path}: ${issue.detail}`);
    }
    lines.push("");
    lines.push("Confirm each item with the client and record it in CONTENT_VERIFICATION.md.");
  } else {
    lines.push("All content is verified.");
  }

  const contentBlocks = issues.length > 0 && !options.allowUnverified && !options.reportOnly;
  return { ok: schemaErrors.length === 0 && !contentBlocks, report: lines.join("\n") };
}

/** True in development and preview builds, where unverified content may be rendered with markers. */
export function isPreviewMode(): boolean {
  return (
    process.env.NODE_ENV === "development" ||
    process.env.NEXT_PUBLIC_ALLOW_UNVERIFIED_CONTENT === "true"
  );
}

/** Resolve the canonical site URL, falling back to localhost while the domain is unconfirmed. */
export function resolveSiteUrl(value: string): URL {
  if (isPlaceholder(value)) return new URL("http://localhost:3000");
  try {
    return new URL(value);
  } catch {
    return new URL("http://localhost:3000");
  }
}
