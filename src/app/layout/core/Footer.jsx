import React from 'react'
import './styles/footer.css'
import { FaPhone, FaEnvelope, FaMapMarkerAlt } from 'react-icons/fa'

function Footer() {
	return (
		<footer className='footer'>
			<div className='footer-info'>
				© {new Date().getFullYear()} Sieć Badawcza Łukasiewicz - Instytut Metali Nieżelaznych <br />
				Oddział w Poznaniu CLAiO. Wszelkie prawa zastrzeżone.
			</div>
			<address className='footer-links'>
				<p>
					<FaMapMarkerAlt />{' '}
					<a href='https://maps.google.com/?q=Forteczna 12, Poznań' target='_blank' rel='noopener noreferrer'>
						Forteczna 12, 61-362 Poznań
					</a>
				</p>
				<p>
					<FaPhone /> <a href='tel:+48612797800'>61 27 97 800</a>
				</p>
				<p>
					<FaEnvelope /> <a href='mailto:claio@imn.lukasiewicz.gov.pl'>claio@imn.lukasiewicz.gov.pl</a>
				</p>
			</address>
		</footer>
	)
}

export default Footer
