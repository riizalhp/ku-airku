import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css'; // Import Tailwind CSS
import App from './App';
import { AppProvider } from './context/AppContext';
import * as TanstackQuery from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';

const queryClient = new TanstackQuery.QueryClient();

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <TanstackQuery.QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AppProvider>
          <App />
        </AppProvider>
      </BrowserRouter>
    </TanstackQuery.QueryClientProvider>
  </React.StrictMode>
);