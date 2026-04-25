export type Scope = "global" | "user" | "project" | "projectLocal";

export interface Permissions {
  allow?: string[];
  deny?: string[];
}

export interface HookEntry {
  matcher?: string;
  hooks: Array<{
    type: string;
    command: string;
  }>;
}

export type HookEvent = "PreToolUse" | "PostToolUse" | "Stop" | "Notification" | "SubagentStop";

export interface ClaudeSettings {
  permissions?: Permissions;
  env?: Record<string, string>;
  hooks?: Partial<Record<HookEvent, HookEntry[]>>;
  model?: string;
  apiKeyHelper?: string;
  includeCoAuthoredBy?: boolean;
  cleanupPeriodDays?: number;
  [key: string]: unknown;
}

export interface ScopeConfig {
  scope: Scope;
  label: string;
  path: string;
  settings: ClaudeSettings;
  exists: boolean;
}

export interface MoveOperation {
  key: string;
  subKey?: string;
  value: unknown;
  fromScope: Scope;
  toScope: Scope;
}
