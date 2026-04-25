import os from "os";
import path from "path";
import type { Scope } from "@/types/config";

export function getConfigPath(scope: Scope, projectPath?: string): string {
  const home = os.homedir();
  const claudeDir = path.join(home, ".claude");

  switch (scope) {
    case "global":
      return path.join(claudeDir, "settings.json");
    case "user":
      return path.join(claudeDir, "settings.local.json");
    case "project":
      return path.join(projectPath ?? process.cwd(), ".claude", "settings.json");
    case "projectLocal":
      return path.join(projectPath ?? process.cwd(), ".claude", "settings.local.json");
  }
}

export const SCOPE_LABELS: Record<Scope, string> = {
  global: "Global (~/.claude/settings.json)",
  user: "User Local (~/.claude/settings.local.json)",
  project: "Project (.claude/settings.json)",
  projectLocal: "Project Local (.claude/settings.local.json)",
};

export const SCOPE_ORDER: Scope[] = ["global", "user", "project", "projectLocal"];
