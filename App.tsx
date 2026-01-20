import React, { useState, useEffect } from 'react';
import Chat from './components/Chat';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import ApiDocsPage from './pages/developer/ApiDocsPage';
import Layout from './components/Layout';
import DevOverview from './pages/developer/Overview';
import DevPlayground from './pages/developer/Playground';
import DevSettings from './pages/developer/Settings';
import AdminOverview from './pages/admin/Overview';
import AdminUsers from './pages/admin/Users';
import AdminRequests from './pages/admin/Requests';

const App: React.FC = () => {
    const [path, setPath] = useState(window.location.pathname);

    // Simple client-side routing
    useEffect(() => {
        const handleLocationChange = () => {
            setPath(window.location.pathname);
        };

        window.addEventListener('popstate', handleLocationChange);
        return () => window.removeEventListener('popstate', handleLocationChange);
    }, []);

    const renderPage = () => {
        // Public & Auth Pages
        if (path === '/login') return <Login />;
        if (path === '/register') return <Register />;
        if (path === '/docs') return <ApiDocsPage />;

        // Developer Portal Routes
        if (path === '/developer' || path === '/developer/') {
            // Redirect to overview
            window.history.replaceState(null, '', '/developer/overview');
            return <DevOverview />;
        }
        if (path === '/developer/overview') return <DevOverview />;
        if (path === '/developer/playground') return <DevPlayground />;
        if (path === '/developer/settings') return <DevSettings />;

        // Admin Portal Routes
        if (path === '/admin' || path === '/admin/') {
             // Redirect to overview
             window.history.replaceState(null, '', '/admin/overview');
             return <AdminOverview />;
        }
        if (path === '/admin/overview') return <AdminOverview />;
        if (path === '/admin/users') return <AdminUsers />;
        if (path === '/admin/requests') return <AdminRequests />;

        // Default to Chat (Home) wrapped in Layout
        return (
            <Layout>
                <div className="h-[calc(100vh-64px)]">
                    <Chat />
                </div>
            </Layout>
        );
    };

    return (
        <div className="bg-slate-50 dark:bg-slate-900">
            {renderPage()}
        </div>
    );
};

export default App;