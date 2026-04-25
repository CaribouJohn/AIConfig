"use client";

import { useState } from "react";
import type { Scope } from "@/types/config";
import { SCOPE_LABELS } from "@/lib/configPaths";

interface Props {
  scope: Scope;
  projectPath: string;
  onClose: () => void;
  onSaved: () => void;
}

type ValueType = "string" | "boolean" | "number" | "json";

export function AddSettingDialog({ scope, projectPath, onClose, onSaved }: Props) {
  const [key, setKey] = useState("");
  const [subKey, setSubKey] = useState("");
  const [rawValue, setRawValue] = useState("");
  const [valueType, setValueType] = useState<ValueType>("string");
  const [error, setError] = useState("");

  function parseValue(): unknown {
    switch (valueType) {
      case "boolean": return rawValue === "true";
      case "number": return Number(rawValue);
      case "json":
        try { return JSON.parse(rawValue); }
        catch { throw new Error("Invalid JSON"); }
      default: return rawValue;
    }
  }

  async function handleSave() {
    if (!key.trim()) { setError("Key is required"); return; }
    let value: unknown;
    try { value = parseValue(); } catch (e) { setError(String(e)); return; }

    await fetch("/api/config", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        scope,
        key: key.trim(),
        subKey: subKey.trim() || undefined,
        value,
        projectPath,
      }),
    });
    onSaved();
  }

  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
        <h3 className="font-semibold text-gray-800 mb-1">Add Setting</h3>
        <p className="text-xs text-gray-500 mb-4">{SCOPE_LABELS[scope]}</p>

        <div className="space-y-3">
          <div>
            <label className="text-xs font-medium text-gray-600 block mb-1">Key</label>
            <input
              className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-300"
              placeholder="e.g. model, permissions, env"
              value={key}
              onChange={(e) => setKey(e.target.value)}
            />
          </div>

          <div>
            <label className="text-xs font-medium text-gray-600 block mb-1">
              Sub-key <span className="font-normal text-gray-400">(optional — for nested objects)</span>
            </label>
            <input
              className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-300"
              placeholder="e.g. MY_VAR (for env.MY_VAR)"
              value={subKey}
              onChange={(e) => setSubKey(e.target.value)}
            />
          </div>

          <div>
            <label className="text-xs font-medium text-gray-600 block mb-1">Value type</label>
            <select
              className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
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
                className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
                value={rawValue}
                onChange={(e) => setRawValue(e.target.value)}
              >
                <option value="true">true</option>
                <option value="false">false</option>
              </select>
            ) : valueType === "json" ? (
              <textarea
                className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-300"
                rows={4}
                placeholder='["item1", "item2"]'
                value={rawValue}
                onChange={(e) => setRawValue(e.target.value)}
              />
            ) : (
              <input
                className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-300"
                value={rawValue}
                onChange={(e) => setRawValue(e.target.value)}
              />
            )}
          </div>

          {error && <p className="text-xs text-red-500">{error}</p>}
        </div>

        <div className="flex justify-end gap-2 mt-5">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm border border-gray-200 rounded-md hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}
