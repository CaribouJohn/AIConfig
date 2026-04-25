"use client";

import { useState, useMemo } from "react";
import type { Scope } from "@/types/config";
import { SCOPE_LABELS } from "@/lib/configPaths";
import {
  SETTINGS_SCHEMA,
  SCHEMA_CATEGORIES,
  mapSchemaTypeToValueType,
  type SettingSchemaEntry,
} from "@/lib/settingsSchema";

export type ValueType = "string" | "boolean" | "number" | "json";

type Tab = "search" | "ai" | "manual";

interface AiSuggestion {
  key: string;
  subKey?: string | null;
  value: unknown;
  valueType: ValueType;
  explanation: string;
}

interface Props {
  scope: Scope;
  projectPath: string;
  onClose: () => void;
  onSaved: () => void;
}

const INPUT_CLS =
  "w-full border border-gray-200 rounded-md px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-300";
const SELECT_CLS =
  "w-full border border-gray-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300";

export function AddSettingDialog({ scope, projectPath, onClose, onSaved }: Props) {
  const [activeTab, setActiveTab] = useState<Tab>("search");

  // Shared staging fields — all tabs write here; handleSave reads from here
  const [key, setKey] = useState("");
  const [subKey, setSubKey] = useState("");
  const [rawValue, setRawValue] = useState("");
  const [valueType, setValueType] = useState<ValueType>("string");
  const [error, setError] = useState("");

  // Search tab state
  const [searchQuery, setSearchQuery] = useState("");

  // AI tab state
  const [aiQuery, setAiQuery] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState("");
  const [aiSuggestion, setAiSuggestion] = useState<AiSuggestion | null>(null);

  // ── Save ─────────────────────────────────────────────────────────────────
  async function handleSave(
    keyOverride?: string,
    subKeyOverride?: string,
    rawValueOverride?: string,
    valueTypeOverride?: ValueType,
  ) {
    const k = (keyOverride ?? key).trim();
    const sk = (subKeyOverride ?? subKey).trim() || undefined;
    const rv = rawValueOverride ?? rawValue;
    const vt = valueTypeOverride ?? valueType;

    if (!k) { setError("Key is required"); setActiveTab("manual"); return; }
    setError("");

    let value: unknown;
    try {
      switch (vt) {
        case "boolean": value = rv === "true"; break;
        case "number": value = Number(rv); break;
        case "json":
          try { value = JSON.parse(rv); }
          catch { throw new Error("Invalid JSON"); }
          break;
        default: value = rv;
      }
    } catch (e) {
      setError(String(e));
      setActiveTab("manual");
      return;
    }

    await fetch("/api/config", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ scope, key: k, subKey: sk, value, projectPath }),
    });
    onSaved();
  }

  // ── Apply a schema entry into the staging fields ─────────────────────────
  function applyEntry(entry: SettingSchemaEntry) {
    setKey(entry.key);
    setSubKey(entry.subKey ?? "");
    setValueType(mapSchemaTypeToValueType(entry.valueType));
    setRawValue(entry.exampleValue);
    setError("");
  }

  // ── Apply an AI suggestion ───────────────────────────────────────────────
  function applyAiSuggestion(s: AiSuggestion) {
    setKey(s.key);
    setSubKey(s.subKey ?? "");
    setValueType(s.valueType);
    setRawValue(
      typeof s.value === "string" ? s.value :
      typeof s.value === "boolean" ? String(s.value) :
      typeof s.value === "number" ? String(s.value) :
      JSON.stringify(s.value, null, 2),
    );
    setError("");
  }

  // ── AI suggest ───────────────────────────────────────────────────────────
  async function fetchSuggestion() {
    if (!aiQuery.trim()) return;
    setAiLoading(true);
    setAiError("");
    setAiSuggestion(null);
    try {
      const res = await fetch("/api/suggest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: aiQuery.trim() }),
      });
      const data = await res.json() as AiSuggestion & { error?: string };
      if (data.error) { setAiError(data.error); }
      else { setAiSuggestion(data); }
    } catch {
      setAiError("Request failed — is the dev server running?");
    } finally {
      setAiLoading(false);
    }
  }

  // ── Filtered schema entries for Search tab ───────────────────────────────
  const filteredByCategory = useMemo(() => {
    const q = searchQuery.toLowerCase();
    const matches = q
      ? SETTINGS_SCHEMA.filter(
          (e) =>
            e.key.toLowerCase().includes(q) ||
            (e.subKey ?? "").toLowerCase().includes(q) ||
            e.label.toLowerCase().includes(q) ||
            e.description.toLowerCase().includes(q) ||
            e.category.toLowerCase().includes(q),
        )
      : SETTINGS_SCHEMA;

    const map = new Map<string, SettingSchemaEntry[]>();
    for (const cat of SCHEMA_CATEGORIES) map.set(cat.id, []);
    for (const entry of matches) {
      map.get(entry.category)?.push(entry);
    }
    return map;
  }, [searchQuery]);

  // ── Tab bar ──────────────────────────────────────────────────────────────
  const tabs: { id: Tab; label: string }[] = [
    { id: "search", label: "Browse" },
    { id: "ai", label: "AI Suggest" },
    { id: "manual", label: "Manual" },
  ];

  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-lg flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 pt-5 pb-0 shrink-0">
          <h3 className="font-semibold text-gray-800">Add Setting</h3>
          <p className="text-xs text-gray-500 mt-0.5">{SCOPE_LABELS[scope]}</p>

          {/* Tab bar */}
          <div className="flex gap-1 mt-4 border-b border-gray-100">
            {tabs.map((t) => (
              <button
                key={t.id}
                onClick={() => setActiveTab(t.id)}
                className={`px-4 py-2 text-xs font-medium rounded-t-md transition-colors ${
                  activeTab === t.id
                    ? "bg-blue-50 text-blue-700 border-b-2 border-blue-500"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* Tab body — scrollable */}
        <div className="flex-1 overflow-y-auto px-6 py-4 min-h-0">

          {/* ── Search tab ──────────────────────────────────────────────── */}
          {activeTab === "search" && (
            <div>
              <input
                autoFocus
                className={SELECT_CLS + " mb-3"}
                placeholder="Search settings… e.g. model, npm, theme"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />

              {Array.from(filteredByCategory.entries()).map(([catId, entries]) => {
                if (entries.length === 0) return null;
                const catLabel = SCHEMA_CATEGORIES.find((c) => c.id === catId)?.label ?? catId;
                return (
                  <div key={catId} className="mb-4">
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">
                      {catLabel}
                    </p>
                    <div className="space-y-px">
                      {entries.map((entry) => {
                        const displayKey = entry.subKey
                          ? `${entry.key}.${entry.subKey}`
                          : entry.key;
                        const isEnum = entry.valueType === "enum";
                        return (
                          <div
                            key={displayKey}
                            className="flex items-start justify-between gap-3 px-3 py-2 rounded-md hover:bg-gray-50 group"
                          >
                            <div className="flex-1 min-w-0">
                              <span className="font-mono text-xs font-medium text-gray-700">
                                {displayKey}
                              </span>
                              <p className="text-xs text-gray-500 mt-0.5 leading-snug">
                                {entry.description}
                              </p>
                              {/* Enum: show inline select + quick save */}
                              {isEnum && (
                                <EnumQuickSave
                                  entry={entry}
                                  onSave={(val) =>
                                    handleSave(entry.key, entry.subKey, val, "string")
                                  }
                                />
                              )}
                            </div>
                            {!isEnum && (
                              <button
                                onClick={() => { applyEntry(entry); setActiveTab("manual"); }}
                                className="text-xs bg-gray-100 hover:bg-blue-100 hover:text-blue-700 px-2 py-1 rounded shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
                              >
                                Use
                              </button>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}

              {SETTINGS_SCHEMA.filter((e) => {
                const q = searchQuery.toLowerCase();
                return (
                  e.key.toLowerCase().includes(q) ||
                  (e.subKey ?? "").toLowerCase().includes(q) ||
                  e.label.toLowerCase().includes(q) ||
                  e.description.toLowerCase().includes(q)
                );
              }).length === 0 && (
                <p className="text-sm text-gray-400 text-center py-8">
                  No settings match &ldquo;{searchQuery}&rdquo;
                </p>
              )}
            </div>
          )}

          {/* ── AI Suggest tab ──────────────────────────────────────────── */}
          {activeTab === "ai" && (
            <div className="space-y-4">
              <div>
                <label className="text-xs font-medium text-gray-600 block mb-1">
                  Describe what you want
                </label>
                <textarea
                  autoFocus
                  className={INPUT_CLS}
                  rows={3}
                  placeholder="e.g. allow npm commands without prompting&#10;e.g. turn off co-author credits in commits&#10;e.g. set my preferred model to opus"
                  value={aiQuery}
                  onChange={(e) => setAiQuery(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) fetchSuggestion();
                  }}
                />
                <p className="text-xs text-gray-400 mt-1">Ctrl+Enter to suggest</p>
              </div>

              <button
                onClick={fetchSuggestion}
                disabled={aiLoading || !aiQuery.trim()}
                className="w-full py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {aiLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Thinking…
                  </span>
                ) : (
                  "Suggest Setting"
                )}
              </button>

              {aiError && (
                <p className="text-xs text-red-500 bg-red-50 rounded-md px-3 py-2">{aiError}</p>
              )}

              {aiSuggestion && (
                <div className="border border-blue-100 bg-blue-50 rounded-lg p-4 space-y-3">
                  <div>
                    <p className="text-xs font-semibold text-blue-800 mb-1">Suggested setting</p>
                    <code className="font-mono text-sm text-blue-900 font-medium">
                      {aiSuggestion.subKey
                        ? `${aiSuggestion.key}.${aiSuggestion.subKey}`
                        : aiSuggestion.key}
                    </code>
                    <pre className="mt-1 text-xs text-blue-700 bg-blue-100 rounded px-2 py-1 overflow-x-auto whitespace-pre-wrap break-all">
                      {typeof aiSuggestion.value === "string"
                        ? aiSuggestion.value
                        : JSON.stringify(aiSuggestion.value, null, 2)}
                    </pre>
                  </div>
                  <p className="text-xs text-blue-700 italic">{aiSuggestion.explanation}</p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleSave(
                        aiSuggestion.key,
                        aiSuggestion.subKey ?? undefined,
                        typeof aiSuggestion.value === "string"
                          ? aiSuggestion.value
                          : typeof aiSuggestion.value === "boolean"
                          ? String(aiSuggestion.value)
                          : typeof aiSuggestion.value === "number"
                          ? String(aiSuggestion.value)
                          : JSON.stringify(aiSuggestion.value, null, 2),
                        aiSuggestion.valueType,
                      )}
                      className="flex-1 py-1.5 text-xs bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                    >
                      Apply & Save
                    </button>
                    <button
                      onClick={() => { applyAiSuggestion(aiSuggestion); setActiveTab("manual"); }}
                      className="flex-1 py-1.5 text-xs border border-blue-300 text-blue-700 rounded-md hover:bg-blue-100 transition-colors"
                    >
                      Edit first
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ── Manual tab ──────────────────────────────────────────────── */}
          {activeTab === "manual" && (
            <div className="space-y-3">
              <div>
                <label className="text-xs font-medium text-gray-600 block mb-1">Key</label>
                <input
                  autoFocus
                  className={INPUT_CLS}
                  placeholder="e.g. model, permissions, env"
                  value={key}
                  onChange={(e) => setKey(e.target.value)}
                />
              </div>

              <div>
                <label className="text-xs font-medium text-gray-600 block mb-1">
                  Sub-key{" "}
                  <span className="font-normal text-gray-400">(optional — for nested objects)</span>
                </label>
                <input
                  className={INPUT_CLS}
                  placeholder="e.g. MY_VAR (for env.MY_VAR)"
                  value={subKey}
                  onChange={(e) => setSubKey(e.target.value)}
                />
              </div>

              <div>
                <label className="text-xs font-medium text-gray-600 block mb-1">Value type</label>
                <select
                  className={SELECT_CLS}
                  value={valueType}
                  onChange={(e) => setValueType(e.target.value as ValueType)}
                >
                  <option value="string">String</option>
                  <option value="boolean">Boolean</option>
                  <option value="number">Number</option>
                  <option value="json">JSON (array / object)</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-medium text-gray-600 block mb-1">Value</label>
                {valueType === "boolean" ? (
                  <select
                    className={SELECT_CLS}
                    value={rawValue}
                    onChange={(e) => setRawValue(e.target.value)}
                  >
                    <option value="true">true</option>
                    <option value="false">false</option>
                  </select>
                ) : valueType === "json" ? (
                  <textarea
                    className={INPUT_CLS}
                    rows={4}
                    placeholder='["item1", "item2"]'
                    value={rawValue}
                    onChange={(e) => setRawValue(e.target.value)}
                  />
                ) : (
                  <input
                    className={INPUT_CLS}
                    value={rawValue}
                    onChange={(e) => setRawValue(e.target.value)}
                  />
                )}
              </div>

              {error && <p className="text-xs text-red-500">{error}</p>}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-100 flex justify-end gap-2 shrink-0">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm border border-gray-200 rounded-md hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          {activeTab === "manual" && (
            <button
              onClick={() => handleSave()}
              className="px-4 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              Save
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Inline enum quick-save for Search tab ────────────────────────────────────
function EnumQuickSave({
  entry,
  onSave,
}: {
  entry: SettingSchemaEntry;
  onSave: (value: string) => void;
}) {
  const [selected, setSelected] = useState(entry.exampleValue);
  return (
    <div className="flex items-center gap-2 mt-1.5">
      <select
        className="border border-gray-200 rounded px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-blue-300"
        value={selected}
        onChange={(e) => setSelected(e.target.value)}
      >
        {entry.enumOptions?.map((opt) => (
          <option key={opt} value={opt}>{opt}</option>
        ))}
      </select>
      <button
        onClick={() => onSave(selected)}
        className="text-xs bg-blue-600 text-white px-2 py-1 rounded hover:bg-blue-700 transition-colors"
      >
        Save
      </button>
    </div>
  );
}
