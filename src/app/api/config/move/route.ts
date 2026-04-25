import { NextRequest, NextResponse } from "next/server";
import { getConfigPath } from "@/lib/configPaths";
import { readConfig, writeConfig, deleteKey, setValue } from "@/lib/configIO";
import type { MoveOperation } from "@/types/config";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { key, subKey, value, fromScope, toScope, projectPath } = body as MoveOperation & {
    projectPath?: string;
  };

  const fromPath = getConfigPath(fromScope, projectPath);
  const toPath = getConfigPath(toScope, projectPath);

  const { settings: fromSettings } = readConfig(fromPath);
  const { settings: toSettings } = readConfig(toPath);

  const updatedFrom = deleteKey(fromSettings, key, subKey);
  const updatedTo = setValue(toSettings, key, value, subKey);

  writeConfig(fromPath, updatedFrom);
  writeConfig(toPath, updatedTo);

  return NextResponse.json({ ok: true });
}
