import React from "react";
import QueueList from "./QueueList";

async function loadItems() {
  return [
    {
      id: "reg-01",
      title: "Rejestracja zlecenia — ZL-2025/021",
      contractNumber: "ZL-2025/021",
      client: "GreenEnergy S.A.",
      dueAt: "2025-10-10",
      priority: "high",
      status: "todo",
      assignees: ["Alicja Śliwińska"],
      tags: ["nowe", "sprzedaż"],
      href: "/dokumentacja/zlecenia/o-1021",
    },
    {
      id: "reg-02",
      title: "Rejestracja zlecenia — ZL-2025/022",
      contractNumber: "ZL-2025/022",
      client: "TechSolutions Sp. z o.o.",
      dueAt: "2025-10-12",
      priority: "normal",
      status: "inprog",
      assignees: ["Jan Kowalski"],
      tags: ["umowa", "weryfikacja"],
      href: "/dokumentacja/zlecenia/o-1022",
    },
  ];
}

export default function OrdersToRegister() {
  return <QueueList title="Zlecenia do zarejestrowania" loadItems={loadItems} />;
}
