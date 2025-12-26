import React from "react";
import QueueList from "./QueueList";

async function loadItems() {
  return [
    {
      id: "lg-01",
      title: "Logi do przygotowania — ZL-2025/010",
      contractNumber: "ZL-2025/010",
      client: "StartBattery s.r.o.",
      dueAt: "2025-10-13",
      priority: "normal",
      status: "todo",
      assignees: ["Jan Kowalski"],
      tags: ["CSV", "wykres"],
      href: "/dokumentacja/logi/o-1003",
    },
  ];
}

export default function LogsToPrepare() {
  return <QueueList title="Logi do przygotowania" loadItems={loadItems} />;
}
