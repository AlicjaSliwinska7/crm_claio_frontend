import React from "react";
import { Navigate } from "react-router-dom";
import NewTask from "../../features/tasks/pages/NewTask.jsx";
import DelegatedTasksMonitor from "../../features/tasks/pages/DelegatedTasksMonitor.jsx";
import MyTasks from "../../features/tasks/pages/MyTasks.jsx";
import UnassignedTasks from "../../features/tasks/pages/UnassignedTasks.jsx";
import TasksSchedule from "../../features/tasks/pages/TasksSchedule.jsx";
import TasksSummary from "../../features/tasks/pages/TasksSummary.jsx";

export function buildTasksRoutes(deps) {
  const { employees, tasks, setTasks } = deps;
  return [
    {
      path: "zadania",
      children: [
        { index: true, element: <Navigate to="zestawienie" replace /> },
        { path: "nowe", element: <NewTask people={employees} onCreate={(t)=>setTasks(prev=>[...prev,t])} /> },
        { path: "monitoring", element: <DelegatedTasksMonitor currentUser="Alicja Śliwińska" tasks={tasks} people={employees} /> },
        { path: "moje", element: <MyTasks people={employees} /> },
        { path: "moje/:id", element: <MyTasks /> },
        { path: "nieprzydzielone", element: <UnassignedTasks initialTasks={tasks} employees={employees} allTasks={tasks} /> },
        { path: "harmonogram-zadan", element: <TasksSchedule tasks={tasks} employees={employees} /> },
        { path: "zestawienie", element: <TasksSummary /> },
      ],
    },
  ];
}
