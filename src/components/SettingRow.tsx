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

export function SettingRow({
  settingKey,
  value,
  scope,
  otherScopes,
  onMove,
  onDelete,
}: Props) {
  const [expanded, setExpanded] = useState(false);
  const isObject = value !== null && typeof value === "object" && !Array.isArray(value);
  const isArray = Array.isArray(value);

  function renderValue(v: unknown): string {
    if (typeof v === "string") return v;
    return JSON.stringify(v, null, 2);
  }

  const scopeShortLabels: Record<Scope, string> = {
    global: "Global",
    user: "User",
    project: "Project",
    projectLocal: "Proj.Local",
  };

  if (isObject) {
    const entries = Object.entries(value as Record<string, unknown>);
    return (
      <div>
        <button
          onClick={() => setExpanded(!expanded)}
          className="w-full flex items-center justify-between px-4 py-2.5 hover:bg-gray-50 text-left group"
        >
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-400">{expanded ? "▼" : "▶"}</span>
            <span className="font-mono text-sm font-medium text-gray-700">{settingKey}</span>
            <span className="text-xs text-gray-400">{`{${entries.length}}`}</span>
          </div>
          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            {otherScopes.map((s) => (
              <button
                key={s}
                onClick={(e) => { e.stopPropagation(); onMove(settingKey, value, s); }}
                title={`Move to ${SCOPE_LABELS[s]}`}
                className="text-xs bg-gray-100 hover:bg-blue-100 hover:text-blue-700 px-2 py-0.5 rounded transition-colors"
              >
                → {scopeShortLabels[s]}
              </button>
            ))}
            <button
              onClick={(e) => { e.stopPropagation(); onDelete(settingKey); }}
              className="text-xs bg-gray-100 hover:bg-red-100 hover:text-red-700 px-2 py-0.5 rounded transition-colors"
            >
              ✕
            </button>
          </div>
        </button>

        {expanded && (
          <div className="pl-6 border-l-2 border-gray-100 ml-4">
            {entries.map(([subKey, subVal]) => (
              <div key={subKey} className="flex items-start justify-between px-4 py-2 hover:bg-gray-50 group">
                <div className="flex-1 min-w-0">
                  <span className="font-mono text-xs font-medium text-gray-600">{subKey}</span>
                  <div className="font-mono text-xs text-gray-500 mt-0.5 truncate max-w-xs">
                    {Array.isArray(subVal)
                      ? `[${(subVal as unknown[]).length} items]`
                      : renderValue(subVal)}
                  </div>
                </div>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity ml-2">
                  {otherScopes.map((s) => (
                    <button
                      key={s}
                      onClick={() => onMove(settingKey, value, s, subKey)}
                      title={`Move to ${SCOPE_LABELS[s]}`}
                      className="text-xs bg-gray-100 hover:bg-blue-100 hover:text-blue-700 px-2 py-0.5 rounded transition-colors"
                    >
                      → {scopeShortLabels[s]}
                    </button>
                  ))}
                  <button
                    onClick={() => onDelete(settingKey, subKey)}
                    className="text-xs bg-gray-100 hover:bg-red-100 hover:text-red-700 px-2 py-0.5 rounded transition-colors"
                  >
                    ✕
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="flex items-start justify-between px-4 py-2.5 hover:bg-gray-50 group">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-mono text-sm font-medium text-gray-700">{settingKey}</span>
          {isArray && (
            <span className="text-xs text-gray-400">[{(value as unknown[]).length}]</span>
          )}
        </div>
        <div className="font-mono text-xs text-gray-500 mt-0.5 truncate max-w-xs">
          {renderValue(value)}
        </div>
      </div>
      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity ml-2">
        {otherScopes.map((s) => (
          <button
            key={s}
            onClick={() => onMove(settingKey, value, s)}
            title={`Move to ${SCOPE_LABELS[s]}`}
            className="text-xs bg-gray-100 hover:bg-blue-100 hover:text-blue-700 px-2 py-0.5 rounded transition-colors"
          >
            → {scopeShortLabels[s]}
          </button>
        ))}
        <button
          onClick={() => onDelete(settingKey)}
          className="text-xs bg-gray-100 hover:bg-red-100 hover:text-red-700 px-2 py-0.5 rounded transition-colors"
        >
          ✕
        </button>
      </div>
    </div>
  );
}
