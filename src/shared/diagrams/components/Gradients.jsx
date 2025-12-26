import React from 'react'
export function LinearGradient({ id, from, to }) {
	return (
		<linearGradient id={id} x1='0' x2='0' y1='0' y2='1'>
			<stop offset='0%' stopColor={from} stopOpacity='1' />
			<stop offset='100%' stopColor={to} stopOpacity='1' />
		</linearGradient>
	)
}
