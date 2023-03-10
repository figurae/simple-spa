import { useCallback, useState } from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import Navigation from './components/Navigation';
import { ProductContext, apiUrl, ApiInterface } from './product-context';
import { CssBaseline } from '@mui/material';
import humps from 'humps';

function App() {
	const [productContext, setProductContext] = useState<ApiInterface | null>(
		null
	);
	const [errorMessage, setErrorMessage] = useState<string | null>(null);

	const fetchFromApiToContext = useCallback(
		async (page: string, itemsPerPage: string, idToFilter: string) => {
			const searchParams =
				idToFilter === ''
					? new URLSearchParams({
							per_page: itemsPerPage,
							page,
					  })
					: new URLSearchParams({ id: idToFilter });

			try {
				const response = await fetch(apiUrl + searchParams);

				if (response.status >= 400 && response.status < 500) {
					throw new Error(
						`Id not found. Please provide a correct id (1 to 12).`
					);
				}
				if (response.status >= 500) {
					throw new Error(
						`Error while connecting to the server, please try again later.`
					);
				}

				const jsonData = await response.json();
				const camelizedJsonData = humps.camelizeKeys(jsonData) as ApiInterface;

				// when fetching by id, data is just a single item, but components require an array
				if (!Array.isArray(camelizedJsonData.data)) {
					camelizedJsonData.data = [camelizedJsonData.data];
				}

				setProductContext(camelizedJsonData);

				setErrorMessage(null);
			} catch (err) {
				let message = 'Unexpected error!';

				// err is unknown by default in TypeScript, which is why
				// we have to check its type first to get to the message
				if (err instanceof Error) {
					message = err.message;
				}

				setErrorMessage(message);
			}
		},
		[]
	);

	return (
		<>
			<CssBaseline />
			<ProductContext.Provider value={productContext}>
				<BrowserRouter>
					<Routes>
						<Route
							path='*'
							element={
								<Navigation
									fetchFromApiToContext={fetchFromApiToContext}
									errorMessage={errorMessage}
								/>
							}
						/>
					</Routes>
				</BrowserRouter>
			</ProductContext.Provider>
		</>
	);
}

export default App;
