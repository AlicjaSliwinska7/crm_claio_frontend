import './styles/DashboardWidget.css'

function DashboardWidget({ icon, title, value, onClick }) {
	return (
		<div className='dashboard-widget' onClick={onClick}>
			<div className='widget-icon'>
				<i className={`fas ${icon}`}></i>
			</div>
			<div className='widget-content'>
				<div className='widget-title'>{title}</div>
				<div className='widget-value'>{value}</div>
			</div>
		</div>
	)
}

export default DashboardWidget
