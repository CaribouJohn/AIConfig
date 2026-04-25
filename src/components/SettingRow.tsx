"use client";

import { useState } from "react";
import type { Scope } from "@/types/config";
import { SCOPE_LABELS } from "@/lib/configPaths";

interface Props {
  settingKey: string;
  value: unknown;
  scope: Scope;
  otherScopes: Scope[];
  onMove: (key: string, value: unknown, toScope: Scope, subKey?: string) => void;
  onDelete: (key: string, subKey?: string) => void;
  projectPath: string;
  onRefresh: () => void;
}

const scopeShortLabels: Record<Scope, string> = {
  global: "Global",
  user: "User",
  project: "Project",
  projectLocal: "Proj.Local",
};

function MoveDeleteButtons({
  onMove,
  onDelete,
  otherScopes,
  stopPropagation,
}: {
  onMove: (s: Scope) => void;
  onDelete: () => void;
  otherScopes: Scope[];
  stopPropagation?: boolean;
}) {
  function wrap(fn: () => void) {
    return (e: React.MouseEvent) => {
      if (stopPropagation) e.stopPropagation();
      fn();
    };
  }
  return (
    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity ml-2 shrink-0">
      {otherScopes.map((s) => (
        <button
          key={s}
          onClick={wrap(() => onMove(s))}
          title={`Move to ${SCOPE_LABELS[s]}`}
          className="text-xs bg-gray-100 hover:bg-blue-100 hover:text-blue-700 px-2 py-0.5 rounded transition-colors"
        >
          → {scopeShortLabels[s]}
        </button>
      ))}
      <button
        onClick={wrap(onDelete)}
        className="text-xs bg-gray-100 hover:bg-red-100 hover:text-red-700 px-2 py-0.5 rounded transition-colors"
      >
        ✕
      </button>
    </div>
  );
}

function ArrayItems({ items }: { items: unknown[] }) {
  return (
    <ul className="py-1 space-y-px">
      {items.map((item, i) => (
        <li
          key={i}
          className="flex items-baseline gap-2 px-3 py-1.5 rounded font-mono text-xs text-gray-700 bg-gray-50 hover:bg-gray-100"
        >
          <span className="text-gray-300 select-none shrink-0">{i + 1}.</span>
          <span className="break-all">{typeof item === "string" ? item : JSON.stringify(item)}</span>
        </li>
      ))}
    </ul>
  );
}

export function SettingRow({
  settingKey,
  value,
  scope,
  otherScopes,
  onMove,
  onDelete,
}: Props) {
  const [expanded, setExpanded] = useState(false);
  const [expandedSubKeys, setExpandedSubKeys] = useState<Set<string>>(new Set());

  const isObject = value !== null && typeof value === "object" && !Array.isArray(value);
  const isArray = Array.isArray(value);

  function toggleSubKey(subKey: string) {
    setExpandedSubKeys((prev) => {
      const next = new Set(prev);
      if (next.has(subKey)) next.delete(subKey);
      else next.add(subKey);
      return next;
    });
  }

  // ── Object (e.g. permissions, env, hooks) ────────────────────────────────
  if (isObject) {
    const entries = Object.entries(value as Record<string, unknown>);
    return (
      <div>
        <div
          role="button"
          tabIndex={0}
          onClick={() => setExpanded(!expanded)}
          onKeyDown={(e) => e.key === "Enter" && setExpanded(!expanded)}
          className="w-full flex items-center justify-between px-4 py-2.5 hover:bg-gray-50 cursor-pointer group"
        >
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-400">{expanded ? "▼" : "▶"}</span>
            <span className="font-mono text-sm font-medium text-gray-700">{settingKey}</span>
            <span className="text-xs text-gray-400">{`{${entries.length}}`}</span>
          </div>
          <MoveDeleteButtons
            otherScopes={otherScopes}
            stopPropagation
            onMove={(s) => onMove(settingKey, value, s)}
            onDelete={() => onDelete(settingKey)}
          />
        </div>

        {expanded && (
          <div className="border-l-2 border-gray-100 ml-8">
            {entries.map(([subKey, subVal]) => {
              const subIsArray = Array.isArray(subVal);
              const subExpanded = expandedSubKeys.has(subKey);
              return (
                <div key={subKey} className="group">
                  {/* header row */}
                  <div
                    className={`flex items-center justify-between px-4 py-2 hover:bg-gray-50 ${subIsArray ? "cursor-pointer" : ""}`}
                    role={subIsArray ? "button" : undefined}
                    tabIndex={subIsArray ? 0 : undefined}
                    onClick={subIsArray ? () => toggleSubKey(subKey) : undefined}
                    onKeyDown={subIsArray ? (e) => e.key === "Enter" && toggleSubKey(subKey) : undefined}
                  >
                    <div className="flex items-center gap-1.5 min-w-0">
                      {subIsArray && (
                        <span className="text-xs text-gray-400 shrink-0">{subExpanded ? "▼" : "▶"}</span>
                      )}
                      <span className="font-mono text-xs font-medium text-gray-600">{subKey}</span>
                      {subIsArray && (
                        <span className="text-xs text-gray-400 shrink-0">
                          [{(subVal as unknown[]).length}]
                        </span>
                      )}
                      {!subIsArray && (
                        <span className="font-mono text-xs text-gray-500 truncate">
                          {typeof subVal === "string" ? subVal : JSON.stringify(subVal)}
                        </span>
                      )}
                    </div>
                    <MoveDeleteButtons
                      otherScopes={otherScopes}
                      onMove={(s) => onMove(settingKey, value, s, subKey)}
                      onDelete={() => onDelete(settingKey, subKey)}
                    />
                  </div>
                  {/* expanded array items — full width, below the header */}
                  {subIsArray && subExpanded && (
                    <div className="px-4 pb-2">
                      <ArrayItems items={subVal as unknown[]} />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  }

  // ── Top-level array ───────────────────────────────────────────────────────
  if (isArray) {
    const items = value as unknown[];
    return (
      <div>
        <div
          role="button"
          tabIndex={0}
          onClick={() => setExpanded(!expanded)}
          onKeyDown={(e) => e.key === "Enter" && setExpanded(!expanded)}
          className="w-full flex items-center justify-between px-4 py-2.5 hover:bg-gray-50 cursor-pointer group"
        >
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-400">{expanded ? "▼" : "▶"}</span>
            <span className="font-mono text-sm font-medium text-gray-700">{settingKey}</span>
            <span className="text-xs text-gray-400">[{items.length}]</span>
          </div>
          <MoveDeleteButtons
            otherScopes={otherScopes}
            stopPropagation
            onMove={(s) => onMove(settingKey, value, s)}
            onDelete={() => onDelete(settingKey)}
          />
        </div>
        {expanded && (
          <div className="px-4 pb-2 ml-8">
            <ArrayItems items={items} />
          </div>
        )}
      </div>
    );
  }

  // ── Scalar (string, boolean, number) ─────────────────────────────────────
  return (
    <div className="flex items-start justify-between px-4 py-2.5 hover:bg-gray-50 group">
      <div className="flex-1 min-w-0">
        <span className="font-mono text-sm font-medium text-gray-700">{settingKey}</span>
        <div className="font-mono text-xs text-gray-500 mt-0.5 truncate max-w-xs">
          {typeof value === "string" ? value : JSON.stringify(value)}
        </div>
      </div>
      <MoveDeleteButtons
        otherScopes={otherScopes}
        onMove={(s) => onMove(settingKey, value, s)}
        onDelete={() => onDelete(settingKey)}
      />
    </div>
  );
}
