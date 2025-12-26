import React from "react";
import QueueList from "./QueueList";

async function loadItems() {
  return [
    {
      id: "kb-01",
      title: "KB do przygotowania — ZL-2025/010",
      contractNumber: "ZL-2025/010",
      client: "StartBattery s.r.o.",
      dueAt: "2025-10-14",
      priority: "normal",
      status: "todo",
      assignees: ["Alicja Śliwińska"],
      tags: ["Karta badań"],
      href: "/dokumentacja/karty-badan/kb-2025-010",
    },
  ];
}

export default function KBToPrepare() {
  return <QueueList title="KB do przygotowania" loadItems={loadItems} />;
}
