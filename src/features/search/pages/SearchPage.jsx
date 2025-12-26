import '../styles/search.css'
import { useSearch } from '../hooks/useSearch'
import ResultList from '../components/ResultList'
import Filters from '../components/Filters'

export default function SearchPage() {
	const { query, results, total, loading, filters, setFilters, sort, setSort, page, setPage, pageSize, setPageSize } =
		useSearch()

	return (
		<div className='search-page'>
			<header className='search-header'>
				<div className='meta'>
					<h3>{loading ? 'Wczytywanie…' : `Liczba wyników wyszukiwania: ${total}`}</h3>
				</div>
			</header>

			<div className='search-content'>
				<aside className='search-filters'>
					<Filters filters={filters} onChange={setFilters} sort={sort} onSortChange={setSort} />
				</aside>

				<main className='search-results'>
					<ResultList
						items={results}
						loading={loading}
						page={page}
						pageSize={pageSize}
						onPageChange={setPage}
						onPageSizeChange={setPageSize}
					/>
				</main>
			</div>
		</div>
	)
}
