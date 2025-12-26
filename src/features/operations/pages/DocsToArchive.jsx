import React from "react";
import QueueList from "./QueueList";

async function loadItems() {
  return [
    {
      id: "arc-01",
      title: "Dokumentacja do archiwizacji — ZL-2025/010",
      contractNumber: "ZL-2025/010",
      client: "StartBattery s.r.o.",
      dueAt: "2025-10-20",
      priority: "normal",
      status: "todo",
      assignees: ["Alicja Śliwińska"],
      tags: ["teczka", "opis"],
      href: "/dokumentacja/archiwum/o-1003",
    },
  ];
}

export default function DocsToArchive() {
  return <QueueList title="Dokumentacja do archiwizacji" loadItems={loadItems} />;
}
