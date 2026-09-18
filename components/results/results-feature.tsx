"use client";

import { Tabs } from "antd";

import { AllRoundsTab } from "./all-rounds-tab";
import { PerformanceTab } from "./performance-tab";
import { TeamPerformanceTab } from "./team-performance-tab";
import { TopEightTab } from "./top-eight-tab";

export const ResultsFeature = () => {
  return (
    <div className="mx-auto space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">Results</h1>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <Tabs
          items={[
            { key: "team-performance", label: "Team Performance", children: <TeamPerformanceTab /> },
            { key: "top-8", label: "Top 8", children: <TopEightTab /> },
            { key: "all-rounds", label: "All Rounds", children: <AllRoundsTab /> },
            { key: "performance", label: "Performance", children: <PerformanceTab /> },
          ]}
        />
      </div>
    </div>
  );
};
