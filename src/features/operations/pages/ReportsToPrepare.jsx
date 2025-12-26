import React from "react";
import QueueList from "./QueueList";

async function loadItems() {
  return [
    {
      id: "rep-01",
      title: "Sprawozdania do przygotowania — ZL-2025/010",
      contractNumber: "ZL-2025/010",
      client: "StartBattery s.r.o.",
      dueAt: "2025-10-16",
      priority: "high",
      status: "todo",
      assignees: ["Anna Nowak"],
      tags: ["UN 38.3", "S-2025/010"],
      href: "/dokumentacja/sprawozdania/s-2025-010",
    },
  ];
}

export default function ReportsToPrepare() {
  return <QueueList title="Sprawozdania do przygotowania" loadItems={loadItems} />;
}
