import React from "react";
import QueueList from "./QueueList";

async function loadItems() {
  return [
    {
      id: "acc-01",
      title: "Próbki do przyjęcia — ZL-2025/010",
      contractNumber: "ZL-2025/010",
      client: "StartBattery s.r.o.",
      dueAt: "2025-10-07",
      priority: "high",
      status: "todo",
      assignees: ["Alicja Śliwińska"],
      samples: ["ZL-2025/010/1", "ZL-2025/010/2"],
      tags: ["PPP"],
      href: "/dokumentacja/zlecenia/o-1003/przyjecie-probek",
    },
  ];
}

export default function SamplesToAccept() {
  return <QueueList title="Próbki do przyjęcia" loadItems={loadItems} />;
}
