"use client";

import { useMemo, useState } from "react";
import { AccessRules } from "@/components/access-rules";
import { Header } from "@/components/header";
import { Hero } from "@/components/hero";
import { RowPreview } from "@/components/row-preview";
import { SchemaBuilder } from "@/components/schema-builder";
import { SqlOutput } from "@/components/sql-output";
import { presets } from "@/lib/presets";
import { detectOwnerColumn, generateSql } from "@/lib/sql-generator";
import type { AppState } from "@/lib/types";

const initialState: AppState = presets.blog;

export default function Home() {
  const [state, setState] = useState<AppState>(initialState);

  const sql = useMemo(() => generateSql(state), [state]);
  const ownerColumn = useMemo(
    () => detectOwnerColumn(state.schema.columns),
    [state.schema.columns]
  );

  const handlePreset = (key: string) => {
    if (presets[key]) {
      setState({
        schema: {
          tableName: presets[key].schema.tableName,
          columns: presets[key].schema.columns.map((c) => ({ ...c })),
        },
        rules: {
          anon: { ...presets[key].rules.anon },
          authenticated: { ...presets[key].rules.authenticated },
          owner: { ...presets[key].rules.owner },
        },
      });
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0b]">
      <Header onPresetChange={handlePreset} />
      <main className="mx-auto max-w-[1600px] px-4 pb-12 pt-6 sm:px-6">
        <Hero />

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-12 lg:items-start">
          <section className="lg:col-span-4">
            <SchemaBuilder
              schema={state.schema}
              onChange={(schema) => setState((s) => ({ ...s, schema }))}
            />
          </section>

          <section className="space-y-4 lg:col-span-3">
            <AccessRules
              rules={state.rules}
              ownerColumn={ownerColumn}
              onChange={(rules) => setState((s) => ({ ...s, rules }))}
            />
            <RowPreview
              schema={state.schema}
              rules={state.rules}
              ownerColumn={ownerColumn}
            />
          </section>

          <section className="lg:sticky lg:top-20 lg:col-span-5">
            <SqlOutput sql={sql} tableName={state.schema.tableName} />
          </section>
        </div>
      </main>
    </div>
  );
}
