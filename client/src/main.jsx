import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './styles/main.css';
import AppRoutes from './Routes.jsx';

createRoot(document.getElementById('root')).render(
	<StrictMode>
		<AppRoutes />
	</StrictMode>
);
