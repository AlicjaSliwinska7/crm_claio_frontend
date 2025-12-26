// src/shared/summaries/components/Section.jsx
import React from 'react'
import PropTypes from 'prop-types'

export default function Section({ title, subtitle, icon, actions, children }) {
	return (
		<section className='es-card es-section ts-section' role='region'>
			<div className='es-card__sectionHead'>
				{icon ? (
					<span className='es-headIcon' aria-hidden='true'>
						{icon}
					</span>
				) : null}
				<h3 className='es-card__sectionTitle'>{title}</h3>
				{actions ? <div className='es-headActions'>{actions}</div> : null}
			</div>

			{subtitle ? <div className='es-card__sectionSub'>{subtitle}</div> : null}

			{children}
		</section>
	)
}

Section.propTypes = {
	title: PropTypes.string.isRequired,
	subtitle: PropTypes.node,
	icon: PropTypes.node,
	actions: PropTypes.node,
	children: PropTypes.node,
}
