/**
 * Content verification gate.
 *
 *   tsx scripts/checkContent.ts            fail while anything is unverified (production)
 *   tsx scripts/checkContent.ts --report   list issues, never fail on them (validate)
 *   ALLOW_UNVERIFIED_CONTENT=true ...      preview builds: list issues, pass
 *
 * Schema errors fail in every mode.
 */
import { contentSchemas } from "@/content/schema";
import { contentModules } from "@/lib/contentRegistry";
import { collectAllIssues, evaluateGate } from "@/lib/verification";

function validateSchemas(): string[] {
  const errors: string[] = [];
  for (const [key, schema] of Object.entries(contentSchemas)) {
    const [file, exportName] = key.split(".");
    const moduleExports = file ? contentModules[file] : undefined;
    const value = moduleExports && exportName ? moduleExports[exportName] : undefined;
    if (value === undefined) {
      errors.push(`${key}: export not found`);
      continue;
    }
    const result = schema.safeParse(value);
    if (!result.success) {
      for (const issue of result.error.issues) {
        errors.push(`${key}.${issue.path.join(".")}: ${issue.message}`);
      }
    }
  }
  return errors;
}

const reportOnly = process.argv.includes("--report");
const allowUnverified = process.env.ALLOW_UNVERIFIED_CONTENT === "true";

const result = evaluateGate(collectAllIssues(contentModules), validateSchemas(), {
  allowUnverified,
  reportOnly,
});

const mode = reportOnly ? "report" : allowUnverified ? "preview" : "production";
console.log(`\nContent check (${mode} mode)\n`);
console.log(result.report);

if (!result.ok) {
  console.error(
    "\nProduction build blocked: unverified content or schema errors remain.\n" +
      "Use `npm run build:preview` for a client review build.\n",
  );
  process.exit(1);
}
