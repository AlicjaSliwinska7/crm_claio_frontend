// src/shared/tables/components/SearchBar.jsx
import React from 'react'
import PropTypes from 'prop-types'
import SearchField from '../../components/inputs/SearchField'

/**
 * Listowy pasek wyszukiwania – korzysta z kanonicznego SearchField,
 * więc ma dokładnie tę samą ikonę (Font Awesome) co globalny SearchBar.
 */
export default function SearchBar({
	value = '',
	onChange,
	placeholder = 'Szukaj w rejestrze...',
	name = 'list-search',
	autoFocus = false,
	onSubmit,
	onClear,
	ariaLabel,
}) {
	return (
		<SearchField
			value={value}
			onChange={onChange}
			placeholder={placeholder}
			name={name}
			autoFocus={autoFocus}
			onSubmit={onSubmit}
			onClear={onClear}
			ariaLabel={ariaLabel}
			className='search-wrapper'
			inputClassName='search-bar'
		/>
	)
}

SearchBar.propTypes = {
	value: PropTypes.string,
	onChange: PropTypes.func,
	placeholder: PropTypes.string,
	name: PropTypes.string,
	autoFocus: PropTypes.bool,
	onSubmit: PropTypes.func,
	onClear: PropTypes.func,
	ariaLabel: PropTypes.string,
}
