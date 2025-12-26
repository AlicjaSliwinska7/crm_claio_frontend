import React from 'react'
import { Navigate } from 'react-router-dom'
import EquipmentRegistry from '../../features/equipment/pages/EquipmentRegistry.jsx'
import CalibrationLabs from '../../features/equipment/pages/CalibrationLabsDirectory.jsx'
import CalibrationSchedule from '../../features/equipment/pages/CalibrationSchedule.jsx'
import EquipmentSummary from '../../features/equipment/pages/EquipmentSummary.jsx'
import Equipment from '../../features/equipment/pages/Equipment.jsx'
import CalibrationLab from '../../features/equipment/pages/CalibrationLab.jsx' // ⬅ szczegóły labu

export function buildEquipmentRoutes() {
	return [
		{
			path: 'wyposazenie',
			children: [
				{ index: true, element: <Navigate to='rejestr-wyposazenia' replace /> },
				{ path: 'rejestr-wyposazenia', element: <EquipmentRegistry /> },
				{ path: ':id', element: <Equipment /> }, // /wyposazenie/:id
				{ path: 'laboratoria-wzorcowania', element: <CalibrationLabs /> },
				{ path: 'laboratoria-wzorcowania/:id', element: <CalibrationLab /> }, // ⬅ /wyposazenie/laboratoria-wzorcowania/:id
				{ path: 'harmonogram-wzorcowania', element: <CalibrationSchedule /> },
				{ path: 'zestawienie', element: <EquipmentSummary /> },
			],
		},
	]
}
