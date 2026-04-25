import { NextRequest, NextResponse } from "next/server";
import { getConfigPath, SCOPE_LABELS } from "@/lib/configPaths";
import { readConfig, writeConfig, deleteKey, setValue } from "@/lib/configIO";
import type { Scope, ScopeConfig } from "@/types/config";

const SCOPES: Scope[] = ["global", "user", "project", "projectLocal"];

export async function GET(req: NextRequest) {
  const projectPath = req.nextUrl.searchParams.get("projectPath") ?? undefined;

  const configs: ScopeConfig[] = SCOPES.map((scope) => {
    const filePath = getConfigPath(scope, projectPath ?? undefined);
    const { settings, exists } = readConfig(filePath);
    return { scope, label: SCOPE_LABELS[scope], path: filePath, settings, exists };
  });

  return NextResponse.json(configs);
}

export async function PUT(req: NextRequest) {
  const body = await req.json();
  const { scope, key, value, subKey, projectPath } = body as {
    scope: Scope;
    key: string;
    value: unknown;
    subKey?: string;
    projectPath?: string;
  };

  const filePath = getConfigPath(scope, projectPath);
  const { settings } = readConfig(filePath);
  const updated = setValue(settings, key, value, subKey);
  writeConfig(filePath, updated);

  return NextResponse.json({ ok: true, path: filePath });
}

export async function DELETE(req: NextRequest) {
  const body = await req.json();
  const { scope, key, subKey, projectPath } = body as {
    scope: Scope;
    key: string;
    subKey?: string;
    projectPath?: string;
  };

  const filePath = getConfigPath(scope, projectPath);
  const { settings } = readConfig(filePath);
  const updated = deleteKey(settings, key, subKey);
  writeConfig(filePath, updated);

  return NextResponse.json({ ok: true });
}
