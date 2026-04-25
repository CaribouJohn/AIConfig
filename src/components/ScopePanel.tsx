"use client";

import { useState } from "react";
import type { ScopeConfig, Scope } from "@/types/config";
import { SCOPE_ORDER } from "@/lib/configPaths";
import { SettingRow } from "./SettingRow";
import { AddSettingDialog } from "./AddSettingDialog";

interface Props {
  config: ScopeConfig;
  allScopes: Scope[];
  onRefresh: () => void;
  projectPath: string;
}

export function ScopePanel({ config, allScopes, onRefresh, projectPath }: Props) {
  const [adding, setAdding] = useState(false);

  const otherScopes = SCOPE_ORDER.filter((s) => s !== config.scope);
  const entries = Object.entries(config.settings);

  async function handleMove(
    key: string,
    value: unknown,
    toScope: Scope,
    subKey?: string
  ) {
    await fetch("/api/config/move", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ key, subKey, value, fromScope: config.scope, toScope, projectPath }),
    });
    onRefresh();
  }

  async function handleDelete(key: string, subKey?: string) {
    await fetch("/api/config", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ scope: config.scope, key, subKey, projectPath }),
    });
    onRefresh();
  }

  const scopeColor: Record<Scope, string> = {
    global: "border-blue-500",
    user: "border-purple-500",
    project: "border-green-500",
    projectLocal: "border-orange-500",
  };

  const headerColor: Record<Scope, string> = {
    global: "bg-blue-50 border-blue-200",
    user: "bg-purple-50 border-purple-200",
    project: "bg-green-50 border-green-200",
    projectLocal: "bg-orange-50 border-orange-200",
  };

  return (
    <div className={`flex flex-col rounded-lg border-2 ${scopeColor[config.scope]} overflow-hidden`}>
      <div className={`px-4 py-3 border-b ${headerColor[config.scope]}`}>
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-semibold text-gray-800 text-sm">{config.label}</h2>
            <p className="text-xs text-gray-500 mt-0.5 font-mono truncate max-w-xs" title={config.path}>
              {config.path}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {!config.exists && (
              <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded">
                no file
              </span>
            )}
            <button
              onClick={() => setAdding(true)}
              className="text-xs bg-white border border-gray-300 hover:bg-gray-50 px-3 py-1 rounded-md transition-colors"
            >
              + Add
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-auto">
        {entries.length === 0 ? (
          <p className="text-sm text-gray-400 p-4 text-center">Empty</p>
        ) : (
          <div className="divide-y divide-gray-100">
            {entries.map(([key, value]) => (
              <SettingRow
                key={key}
                settingKey={key}
                value={value}
                scope={config.scope}
                otherScopes={otherScopes}
                onMove={handleMove}
                onDelete={handleDelete}
                projectPath={projectPath}
                onRefresh={onRefresh}
              />
            ))}
          </div>
        )}
      </div>

      {adding && (
        <AddSettingDialog
          scope={config.scope}
          projectPath={projectPath}
          onClose={() => setAdding(false)}
          onSaved={() => { setAdding(false); onRefresh(); }}
        />
      )}
    </div>
  );
}
