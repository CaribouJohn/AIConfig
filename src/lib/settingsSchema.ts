import type { ValueType } from "@/components/AddSettingDialog";

export type SchemaValueType = "string" | "boolean" | "number" | "json" | "enum" | "string[]";

export type SchemaCategory =
  | "model"
  | "permissions"
  | "env"
  | "hooks"
  | "ui"
  | "behavior"
  | "git"
  | "mcp"
  | "auth"
  | "advanced";

export interface SettingSchemaEntry {
  key: string;
  subKey?: string;
  label: string;
  description: string;
  valueType: SchemaValueType;
  exampleValue: string;
  enumOptions?: string[];
  category: SchemaCategory;
}

export const SCHEMA_CATEGORIES: { id: SchemaCategory; label: string }[] = [
  { id: "model", label: "Model & Agent" },
  { id: "permissions", label: "Permissions" },
  { id: "env", label: "Environment" },
  { id: "hooks", label: "Hooks" },
  { id: "ui", label: "UI & Display" },
  { id: "behavior", label: "Behavior" },
  { id: "git", label: "Git & Attribution" },
  { id: "mcp", label: "MCP Servers" },
  { id: "auth", label: "Auth & API" },
  { id: "advanced", label: "Advanced" },
];

export const SETTINGS_SCHEMA: SettingSchemaEntry[] = [
  // ── Model & Agent ────────────────────────────────────────────────────────
  {
    key: "model",
    label: "Model",
    description: "Override the default Claude model for this scope.",
    valueType: "string",
    exampleValue: "claude-opus-4-7",
    category: "model",
  },
  {
    key: "agent",
    label: "Agent",
    description: "Name of a built-in or custom agent to use for the main thread.",
    valueType: "string",
    exampleValue: "general-purpose",
    category: "model",
  },
  {
    key: "effortLevel",
    label: "Effort Level",
    description: "Persisted effort/thinking level for supported models.",
    valueType: "enum",
    exampleValue: "medium",
    enumOptions: ["low", "medium", "high", "xhigh"],
    category: "model",
  },
  {
    key: "alwaysThinkingEnabled",
    label: "Always Thinking",
    description: "Enable extended thinking for all supported model responses.",
    valueType: "boolean",
    exampleValue: "true",
    category: "model",
  },
  {
    key: "fastMode",
    label: "Fast Mode",
    description: "Enable fast mode (Opus with faster output).",
    valueType: "boolean",
    exampleValue: "false",
    category: "model",
  },
  {
    key: "advisorModel",
    label: "Advisor Model",
    description: "Model used for the server-side advisor tool.",
    valueType: "string",
    exampleValue: "claude-sonnet-4-6",
    category: "model",
  },

  // ── Permissions ──────────────────────────────────────────────────────────
  {
    key: "permissions",
    subKey: "allow",
    label: "Permissions › Allow",
    description: "Tool patterns allowed without prompting. Supports glob syntax like Bash(npm *) or Read.",
    valueType: "string[]",
    exampleValue: '["Bash(npm *)", "Read"]',
    category: "permissions",
  },
  {
    key: "permissions",
    subKey: "deny",
    label: "Permissions › Deny",
    description: "Tool patterns that are always blocked, regardless of other rules.",
    valueType: "string[]",
    exampleValue: '["Bash(rm -rf *)"]',
    category: "permissions",
  },
  {
    key: "permissions",
    subKey: "ask",
    label: "Permissions › Ask",
    description: "Tool patterns that always prompt for confirmation, even if other rules would allow them.",
    valueType: "string[]",
    exampleValue: '["Bash(git push *)"]',
    category: "permissions",
  },
  {
    key: "permissions",
    subKey: "defaultMode",
    label: "Permissions › Default Mode",
    description: "Default permission behaviour when no specific rule matches a tool call.",
    valueType: "enum",
    exampleValue: "default",
    enumOptions: ["acceptEdits", "auto", "bypassPermissions", "default", "dontAsk", "plan"],
    category: "permissions",
  },
  {
    key: "permissions",
    subKey: "additionalDirectories",
    label: "Permissions › Additional Directories",
    description: "Extra directories Claude Code is permitted to access beyond the project root.",
    valueType: "string[]",
    exampleValue: '["/home/user/shared"]',
    category: "permissions",
  },

  // ── Environment ──────────────────────────────────────────────────────────
  {
    key: "env",
    subKey: "MY_VAR",
    label: "Env Variable",
    description: "Set an environment variable available to all Claude Code sessions in this scope. Replace MY_VAR with your variable name.",
    valueType: "string",
    exampleValue: "my-value",
    category: "env",
  },
  {
    key: "env",
    subKey: "DEBUG",
    label: "Env › DEBUG",
    description: "Enable debug output in tools and scripts that respect the DEBUG variable.",
    valueType: "string",
    exampleValue: "true",
    category: "env",
  },
  {
    key: "env",
    subKey: "NODE_ENV",
    label: "Env › NODE_ENV",
    description: "Set the Node.js environment mode for scripts run during sessions.",
    valueType: "string",
    exampleValue: "development",
    category: "env",
  },

  // ── Hooks ────────────────────────────────────────────────────────────────
  {
    key: "hooks",
    subKey: "PreToolUse",
    label: "Hook › PreToolUse",
    description: "Commands to run before a tool is called. Can block the tool by returning {\"continue\": false}.",
    valueType: "json",
    exampleValue: '[{"matcher":"Bash","hooks":[{"type":"command","command":"echo pre-bash"}]}]',
    category: "hooks",
  },
  {
    key: "hooks",
    subKey: "PostToolUse",
    label: "Hook › PostToolUse",
    description: "Commands to run after a tool completes. Useful for auto-formatting, logging, or running tests.",
    valueType: "json",
    exampleValue: '[{"matcher":"Write|Edit","hooks":[{"type":"command","command":"npx prettier --write \"$(jq -r .tool_input.file_path)\""}]}]',
    category: "hooks",
  },
  {
    key: "hooks",
    subKey: "Stop",
    label: "Hook › Stop",
    description: "Command to run when Claude stops responding (turn ends). Useful for notifications.",
    valueType: "json",
    exampleValue: '[{"hooks":[{"type":"command","command":"echo done"}]}]',
    category: "hooks",
  },
  {
    key: "hooks",
    subKey: "Notification",
    label: "Hook › Notification",
    description: "Command to run when Claude sends a notification (e.g. waiting for input).",
    valueType: "json",
    exampleValue: '[{"hooks":[{"type":"command","command":"notify-send \"Claude needs input\""}]}]',
    category: "hooks",
  },
  {
    key: "hooks",
    subKey: "SessionStart",
    label: "Hook › SessionStart",
    description: "Command to run once when a new Claude Code session begins.",
    valueType: "json",
    exampleValue: '[{"hooks":[{"type":"command","command":"echo session started"}]}]',
    category: "hooks",
  },
  {
    key: "hooks",
    subKey: "UserPromptSubmit",
    label: "Hook › UserPromptSubmit",
    description: "Command to run each time the user submits a message.",
    valueType: "json",
    exampleValue: '[{"hooks":[{"type":"command","command":"echo prompt submitted"}]}]',
    category: "hooks",
  },

  // ── UI & Display ─────────────────────────────────────────────────────────
  {
    key: "theme",
    label: "Theme",
    description: "Colour theme for the Claude Code UI.",
    valueType: "enum",
    exampleValue: "auto",
    enumOptions: ["auto", "dark", "light", "light-daltonized", "dark-daltonized", "light-ansi", "dark-ansi"],
    category: "ui",
  },
  {
    key: "verbose",
    label: "Verbose",
    description: "Show full tool output instead of truncated summaries.",
    valueType: "boolean",
    exampleValue: "false",
    category: "ui",
  },
  {
    key: "language",
    label: "Language",
    description: "Preferred language for Claude responses and voice dictation.",
    valueType: "string",
    exampleValue: "en",
    category: "ui",
  },
  {
    key: "syntaxHighlightingDisabled",
    label: "Disable Syntax Highlighting",
    description: "Turn off syntax highlighting in diffs and code output.",
    valueType: "boolean",
    exampleValue: "false",
    category: "ui",
  },
  {
    key: "spinnerTipsEnabled",
    label: "Spinner Tips",
    description: "Show helpful tips in the loading spinner.",
    valueType: "boolean",
    exampleValue: "true",
    category: "ui",
  },
  {
    key: "viewMode",
    label: "View Mode",
    description: "Default transcript view mode on startup.",
    valueType: "enum",
    exampleValue: "default",
    enumOptions: ["default", "verbose", "focus"],
    category: "ui",
  },
  {
    key: "tui",
    label: "TUI Renderer",
    description: "Terminal UI renderer. fullscreen uses alt-screen with no flicker.",
    valueType: "enum",
    exampleValue: "default",
    enumOptions: ["default", "fullscreen"],
    category: "ui",
  },
  {
    key: "defaultView",
    label: "Default View",
    description: "Default transcript view: chat (user turns only) or transcript (full).",
    valueType: "enum",
    exampleValue: "chat",
    enumOptions: ["chat", "transcript"],
    category: "ui",
  },
  {
    key: "showTurnDuration",
    label: "Show Turn Duration",
    description: "Display how long each assistant turn took after it completes.",
    valueType: "boolean",
    exampleValue: "false",
    category: "ui",
  },
  {
    key: "showMessageTimestamps",
    label: "Show Message Timestamps",
    description: "Stamp each assistant message with its arrival time.",
    valueType: "boolean",
    exampleValue: "false",
    category: "ui",
  },
  {
    key: "showThinkingSummaries",
    label: "Show Thinking Summaries",
    description: "Show thinking summaries in the transcript view (ctrl+o).",
    valueType: "boolean",
    exampleValue: "false",
    category: "ui",
  },
  {
    key: "prefersReducedMotion",
    label: "Reduced Motion",
    description: "Reduce or disable animations for accessibility.",
    valueType: "boolean",
    exampleValue: "false",
    category: "ui",
  },
  {
    key: "editorMode",
    label: "Editor Mode",
    description: "Key binding mode for the prompt input box.",
    valueType: "enum",
    exampleValue: "normal",
    enumOptions: ["normal", "vim"],
    category: "ui",
  },
  {
    key: "outputStyle",
    label: "Output Style",
    description: "Controls the output style for assistant responses.",
    valueType: "string",
    exampleValue: "default",
    category: "ui",
  },

  // ── Behavior ─────────────────────────────────────────────────────────────
  {
    key: "cleanupPeriodDays",
    label: "Cleanup Period (days)",
    description: "How many days to retain conversation transcripts before automatic cleanup. Minimum 1.",
    valueType: "number",
    exampleValue: "30",
    category: "behavior",
  },
  {
    key: "autoCompactEnabled",
    label: "Auto Compact",
    description: "Automatically compact the conversation context when it approaches the limit.",
    valueType: "boolean",
    exampleValue: "true",
    category: "behavior",
  },
  {
    key: "autoCompactWindow",
    label: "Auto Compact Window",
    description: "Token threshold at which auto-compact triggers (100000–1000000).",
    valueType: "number",
    exampleValue: "200000",
    category: "behavior",
  },
  {
    key: "autoScrollEnabled",
    label: "Auto Scroll",
    description: "Auto-scroll the conversation view to the bottom (fullscreen TUI mode only).",
    valueType: "boolean",
    exampleValue: "true",
    category: "behavior",
  },
  {
    key: "fileCheckpointingEnabled",
    label: "File Checkpointing",
    description: "Snapshot files before edits so /rewind can restore them.",
    valueType: "boolean",
    exampleValue: "true",
    category: "behavior",
  },
  {
    key: "respectGitignore",
    label: "Respect .gitignore",
    description: "Whether the file picker respects .gitignore entries. Note: .ignore files are always respected.",
    valueType: "boolean",
    exampleValue: "true",
    category: "behavior",
  },
  {
    key: "includeGitInstructions",
    label: "Include Git Instructions",
    description: "Include built-in commit and PR workflow instructions in Claude's system prompt.",
    valueType: "boolean",
    exampleValue: "true",
    category: "behavior",
  },
  {
    key: "promptSuggestionEnabled",
    label: "Prompt Suggestions",
    description: "Show prompt suggestions in the input area.",
    valueType: "boolean",
    exampleValue: "true",
    category: "behavior",
  },
  {
    key: "todoFeatureEnabled",
    label: "Todo / Task Panel",
    description: "Enable the todo and task tracking panel.",
    valueType: "boolean",
    exampleValue: "true",
    category: "behavior",
  },
  {
    key: "autoMemoryEnabled",
    label: "Auto Memory",
    description: "Allow Claude to automatically read from and write to its memory directory.",
    valueType: "boolean",
    exampleValue: "true",
    category: "behavior",
  },
  {
    key: "autoMemoryDirectory",
    label: "Auto Memory Directory",
    description: "Custom directory for auto-memory storage. Supports ~/ prefix. Ignored in project settings.",
    valueType: "string",
    exampleValue: "~/.claude/memory/",
    category: "behavior",
  },
  {
    key: "autoUpdatesChannel",
    label: "Auto Updates Channel",
    description: "Release channel for automatic updates.",
    valueType: "enum",
    exampleValue: "stable",
    enumOptions: ["latest", "stable", "rc"],
    category: "behavior",
  },
  {
    key: "plansDirectory",
    label: "Plans Directory",
    description: "Custom directory for plan files, relative to project root. Defaults to ~/.claude/plans/.",
    valueType: "string",
    exampleValue: ".claude/plans",
    category: "behavior",
  },

  // ── Git & Attribution ────────────────────────────────────────────────────
  {
    key: "attribution",
    subKey: "commit",
    label: "Attribution › Commit",
    description: "Custom attribution text appended to git commits. Set to empty string to hide attribution.",
    valueType: "string",
    exampleValue: "Co-Authored-By: Claude <noreply@anthropic.com>",
    category: "git",
  },
  {
    key: "attribution",
    subKey: "pr",
    label: "Attribution › PR",
    description: "Custom attribution text for pull request descriptions. Set to empty string to hide.",
    valueType: "string",
    exampleValue: "Generated with Claude Code",
    category: "git",
  },
  {
    key: "includeCoAuthoredBy",
    label: "Include Co-Authored-By",
    description: "Append a Co-Authored-By trailer to git commits. Deprecated — use attribution.commit instead.",
    valueType: "boolean",
    exampleValue: "true",
    category: "git",
  },
  {
    key: "prUrlTemplate",
    label: "PR URL Template",
    description: "URL template for PR links. Placeholders: {host} {owner} {repo} {number} {url}.",
    valueType: "string",
    exampleValue: "https://github.com/{owner}/{repo}/pull/{number}",
    category: "git",
  },

  // ── MCP Servers ──────────────────────────────────────────────────────────
  {
    key: "enableAllProjectMcpServers",
    label: "Enable All Project MCP Servers",
    description: "Automatically approve all MCP servers defined in the project's .mcp.json without prompting.",
    valueType: "boolean",
    exampleValue: "true",
    category: "mcp",
  },
  {
    key: "enabledMcpjsonServers",
    label: "Enabled MCP Servers",
    description: "List of approved MCP server names from .mcp.json (approved without per-session prompt).",
    valueType: "string[]",
    exampleValue: '["playwright", "github"]',
    category: "mcp",
  },
  {
    key: "disabledMcpjsonServers",
    label: "Disabled MCP Servers",
    description: "List of MCP server names from .mcp.json that are explicitly blocked.",
    valueType: "string[]",
    exampleValue: '["untrusted-server"]',
    category: "mcp",
  },

  // ── Auth & API ───────────────────────────────────────────────────────────
  {
    key: "apiKeyHelper",
    label: "API Key Helper",
    description: "Path to a script that outputs authentication values (e.g. for rotating API keys).",
    valueType: "string",
    exampleValue: "~/.claude/get-api-key.sh",
    category: "auth",
  },
  {
    key: "gcpAuthRefresh",
    label: "GCP Auth Refresh",
    description: "Command to refresh GCP authentication for Vertex AI usage.",
    valueType: "string",
    exampleValue: "gcloud auth application-default login",
    category: "auth",
  },
  {
    key: "awsCredentialExport",
    label: "AWS Credential Export",
    description: "Path to a script that exports AWS credentials for Bedrock usage.",
    valueType: "string",
    exampleValue: "~/.claude/aws-creds.sh",
    category: "auth",
  },
  {
    key: "proxyAuthHelper",
    label: "Proxy Auth Helper",
    description: "Shell command that outputs a Proxy-Authorization header value.",
    valueType: "string",
    exampleValue: "echo Bearer $(cat ~/.proxy-token)",
    category: "auth",
  },

  // ── Advanced ─────────────────────────────────────────────────────────────
  {
    key: "statusLine",
    subKey: "command",
    label: "Status Line Command",
    description: "Shell command whose output is shown in the Claude Code status bar. Runs on each turn.",
    valueType: "string",
    exampleValue: "echo \"$(git branch --show-current)\"",
    category: "advanced",
  },
  {
    key: "disableAllHooks",
    label: "Disable All Hooks",
    description: "Disable all hooks and statusLine execution globally for this scope.",
    valueType: "boolean",
    exampleValue: "false",
    category: "advanced",
  },
  {
    key: "cleanupPeriodDays",
    label: "Cleanup Period (days)",
    description: "Number of days to retain transcripts. Minimum 1.",
    valueType: "number",
    exampleValue: "30",
    category: "advanced",
  },
  {
    key: "skillListingMaxDescChars",
    label: "Skill Listing Max Chars",
    description: "Per-skill description character cap in the skill listing sent to Claude. Default 1536.",
    valueType: "number",
    exampleValue: "1536",
    category: "advanced",
  },
  {
    key: "defaultShell",
    label: "Default Shell",
    description: "Default shell for ! commands in the input box.",
    valueType: "enum",
    exampleValue: "bash",
    enumOptions: ["bash", "powershell"],
    category: "advanced",
  },
  {
    key: "terminalTitleFromRename",
    label: "Terminal Title from Rename",
    description: "Whether /rename updates the terminal tab title.",
    valueType: "boolean",
    exampleValue: "true",
    category: "advanced",
  },
  {
    key: "feedbackSurveyRate",
    label: "Feedback Survey Rate",
    description: "Probability (0–1) that the session quality survey appears. 0.05 = 5% of sessions.",
    valueType: "number",
    exampleValue: "0",
    category: "advanced",
  },
];

export function mapSchemaTypeToValueType(t: SchemaValueType): ValueType {
  if (t === "enum") return "string";
  if (t === "string[]") return "json";
  if (t === "number") return "number";
  if (t === "boolean") return "boolean";
  return "string";
}
