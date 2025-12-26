import React from "react";
import QueueList from "./QueueList";

async function loadItems() {
  return [
    {
      id: "del-01",
      title: "Oczekiwanie na dostawę — ZL-2025/018",
      contractNumber: "ZL-2025/018",
      client: "Meditech Polska",
      dueAt: "2025-10-08",
      priority: "normal",
      status: "blocked",
      assignees: ["Alicja Śliwińska", "Anna Nowak"],
      tags: ["kurier", "kontakt"],
      href: "/dokumentacja/zlecenia/o-1018",
    },
    {
      id: "del-02",
      title: "Oczekiwanie na dostawę — ZL-2025/019",
      contractNumber: "ZL-2025/019",
      client: "StartBattery s.r.o.",
      dueAt: "2025-10-11",
      priority: "low",
      status: "todo",
      assignees: ["Piotr Kowalski"],
      tags: ["ETA: 10.10", "CMR"],
      href: "/dokumentacja/zlecenia/o-1019",
    },
  ];
}

export default function WaitingForDelivery() {
  return <QueueList title="Oczekiwanie na dostawę" loadItems={loadItems} />;
}
