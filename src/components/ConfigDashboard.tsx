"use client";

import { useState, useEffect, useCallback } from "react";
import type { ScopeConfig, Scope } from "@/types/config";
import { SCOPE_ORDER } from "@/lib/configPaths";
import { ScopePanel } from "./ScopePanel";

export function ConfigDashboard() {
  const [configs, setConfigs] = useState<ScopeConfig[]>([]);
  const [projectPath, setProjectPath] = useState("");
  const [loading, setLoading] = useState(true);
  const [visibleScopes, setVisibleScopes] = useState<Set<Scope>>(
    new Set(["global", "user", "project"])
  );

  const fetchConfigs = useCallback(async () => {
    setLoading(true);
    const params = projectPath ? `?projectPath=${encodeURIComponent(projectPath)}` : "";
    const res = await fetch(`/api/config${params}`);
    const data: ScopeConfig[] = await res.json();
    setConfigs(data);
    setLoading(false);
  }, [projectPath]);

  useEffect(() => { fetchConfigs(); }, [fetchConfigs]);

  function toggleScope(scope: Scope) {
    setVisibleScopes((prev) => {
      const next = new Set(prev);
      if (next.has(scope)) next.delete(scope);
      else next.add(scope);
      return next;
    });
  }

  const scopeBadgeColors: Record<Scope, string> = {
    global: "bg-blue-100 text-blue-700 border-blue-200",
    user: "bg-purple-100 text-purple-700 border-purple-200",
    project: "bg-green-100 text-green-700 border-green-200",
    projectLocal: "bg-orange-100 text-orange-700 border-orange-200",
  };

  const scopeShortNames: Record<Scope, string> = {
    global: "Global",
    user: "User",
    project: "Project",
    projectLocal: "Proj.Local",
  };

  const visible = configs.filter((c) => visibleScopes.has(c.scope));

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="max-w-screen-2xl mx-auto flex items-center justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-lg font-bold text-gray-900">Claude Config Manager</h1>
            <p className="text-xs text-gray-500">Manage Claude Code settings across all scopes</p>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            {/* Project path input */}
            <div className="flex items-center gap-2">
              <label className="text-xs text-gray-500 whitespace-nowrap">Project path:</label>
              <input
                className="border border-gray-200 rounded-md px-3 py-1.5 text-xs font-mono w-64 focus:outline-none focus:ring-2 focus:ring-blue-300"
                placeholder="Leave blank for current directory"
                value={projectPath}
                onChange={(e) => setProjectPath(e.target.value)}
                onBlur={fetchConfigs}
                onKeyDown={(e) => e.key === "Enter" && fetchConfigs()}
              />
            </div>

            {/* Scope toggles */}
            <div className="flex gap-1">
              {SCOPE_ORDER.map((scope) => (
                <button
                  key={scope}
                  onClick={() => toggleScope(scope)}
                  className={`text-xs px-3 py-1.5 rounded-md border transition-all ${
                    visibleScopes.has(scope)
                      ? scopeBadgeColors[scope]
                      : "bg-gray-100 text-gray-400 border-gray-200"
                  }`}
                >
                  {scopeShortNames[scope]}
                </button>
              ))}
            </div>

            <button
              onClick={fetchConfigs}
              className="text-xs bg-gray-800 text-white px-3 py-1.5 rounded-md hover:bg-gray-700 transition-colors"
            >
              ↺ Refresh
            </button>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 overflow-hidden px-6 py-4">
        {loading ? (
          <div className="flex items-center justify-center h-full text-gray-400 text-sm">
            Loading...
          </div>
        ) : (
          <div
            className="grid gap-4 h-full"
            style={{ gridTemplateColumns: `repeat(${Math.max(visible.length, 1)}, minmax(0, 1fr))` }}
          >
            {visible.map((config) => (
              <ScopePanel
                key={config.scope}
                config={config}
                allScopes={SCOPE_ORDER}
                onRefresh={fetchConfigs}
                projectPath={projectPath}
              />
            ))}
            {visible.length === 0 && (
              <p className="text-sm text-gray-400 col-span-4 flex items-center justify-center">
                Select at least one scope to view.
              </p>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
