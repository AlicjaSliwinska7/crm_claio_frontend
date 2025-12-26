import React from "react";
import Board from "../../features/board/pages/Board.jsx";
import BoardPreview from "../../features/board/pages/BoardPreview.jsx";

export function buildBoardRoutes() {
  return [
    {
      path: "tablica",
      children: [
        { index: true, element: <Board /> },
        { path: "podglad", element: <BoardPreview /> },
      ],
    },
  ];
}
