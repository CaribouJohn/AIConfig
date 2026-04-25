import fs from "fs";
import path from "path";
import type { ClaudeSettings } from "@/types/config";

export function readConfig(filePath: string): { settings: ClaudeSettings; exists: boolean } {
  try {
    const raw = fs.readFileSync(filePath, "utf-8");
    return { settings: JSON.parse(raw), exists: true };
  } catch {
    return { settings: {}, exists: false };
  }
}

export function writeConfig(filePath: string, settings: ClaudeSettings): void {
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  fs.writeFileSync(filePath, JSON.stringify(settings, null, 2) + "\n", "utf-8");
}

export function deleteKey(settings: ClaudeSettings, key: string, subKey?: string): ClaudeSettings {
  const copy = structuredClone(settings);
  if (subKey) {
    const parent = copy[key] as Record<string, unknown> | undefined;
    if (parent && typeof parent === "object") {
      delete parent[subKey];
      if (Object.keys(parent).length === 0) delete copy[key];
    }
  } else {
    delete copy[key];
  }
  return copy;
}

export function setValue(
  settings: ClaudeSettings,
  key: string,
  value: unknown,
  subKey?: string
): ClaudeSettings {
  const copy = structuredClone(settings);
  if (subKey) {
    if (!copy[key] || typeof copy[key] !== "object") copy[key] = {};
    (copy[key] as Record<string, unknown>)[subKey] = value;
  } else {
    copy[key] = value;
  }
  return copy;
}
