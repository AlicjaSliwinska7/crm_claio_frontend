import React from "react";
import QueueList from "./QueueList";

async function loadItems() {
  return [
    {
      id: "t-01",
      title: "Badania do wykonania — ZL-2025/010",
      contractNumber: "ZL-2025/010",
      client: "StartBattery s.r.o.",
      dueAt: "2025-10-12",
      priority: "high",
      status: "todo",
      assignees: ["Piotr Kowalski", "Alicja Śliwińska"],
      tags: ["PB", "harmonogram"],
      href: "/badania/harmonogram",
    },
    {
      id: "t-02",
      title: "Badania do wykonania — ZL-2025/022",
      contractNumber: "ZL-2025/022",
      client: "TechSolutions Sp. z o.o.",
      dueAt: "2025-10-14",
      priority: "normal",
      status: "inprog",
      assignees: ["Anna Nowak"],
      tags: ["w trakcie"],
      href: "/badania/harmonogram",
    },
  ];
}

export default function TestsToExecute() {
  return <QueueList title="Badania do wykonania" loadItems={loadItems} />;
}
