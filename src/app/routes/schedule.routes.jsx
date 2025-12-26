import React from "react";
import { Navigate } from "react-router-dom";
import MySchedulePage from "../../features/terms/pages/MySchedulePage.js";
import SchedulePlanner from "../../features/terms/pages/SchedulePlanner.jsx";
import ScheduleSummary from "../../features/terms/pages/ScheduleSummary.jsx";
import MyScheduleDemo from "../../features/terms/pages/MyScheduleDemo.jsx";

export function buildScheduleRoutes(deps) {
  const { employees, tasks, appointments, trainingsData, posts } = deps;
  return [
    {
      path: "terminy",
      children: [
        { index: true, element: <Navigate to="moje" replace /> },
        {
          path: "moje",
          element: (
            <MySchedulePage
              currentUser="Alicja Śliwińska"
              tasks={tasks}
              meetings={appointments}
              trainings={trainingsData}
              posts={posts}
            />
          ),
        },
        { path: "zaplanuj-grafik", element: <SchedulePlanner /> },
        {
          path: "zestawienie",
          element: (
            <ScheduleSummary
              users={employees}
              tasks={tasks}
              meetings={appointments}
              trainings={trainingsData}
              posts={posts}
            />
          ),
        },
        { path: "demo", element: <MyScheduleDemo /> },
      ],
    },
  ];
}
