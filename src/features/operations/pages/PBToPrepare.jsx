import React from "react";
import QueueList from "./QueueList";

async function loadItems() {
  return [
    {
      id: "pb-01",
      title: "PB do przygotowania — ZL-2025/010",
      contractNumber: "ZL-2025/010",
      client: "StartBattery s.r.o.",
      dueAt: "2025-10-09",
      priority: "normal",
      status: "todo",
      assignees: ["Jan Kowalski"],
      tags: ["PB"],
      href: "/dokumentacja/pb/pb-2025-010",
    },
    {
      id: "pb-02",
      title: "PB do przygotowania — ZL-2025/021",
      contractNumber: "ZL-2025/021",
      client: "GreenEnergy S.A.",
      dueAt: "2025-10-11",
      priority: "low",
      status: "inprog",
      assignees: ["Anna Nowak"],
      tags: ["PB", "weryfikacja"],
      href: "/dokumentacja/pb/pb-2025-021",
    },
  ];
}

export default function PBToPrepare() {
  return <QueueList title="PB do przygotowania" loadItems={loadItems} />;
}
