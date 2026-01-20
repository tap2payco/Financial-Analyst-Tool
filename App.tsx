import React, { useState, useEffect } from 'react';
import Chat from './components/Chat';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import DevDashboard from './pages/developer/Dashboard';
import AdminDashboard from './pages/admin/AdminDashboard';
import ApiDocsPage from './pages/developer/ApiDocsPage';
import Layout from './components/Layout';

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
        if (path === '/login') return <Login />;
        if (path === '/register') return <Register />;
        if (path === '/developer') return <DevDashboard />;
        if (path === '/admin') return <AdminDashboard />;
        if (path === '/docs') return <ApiDocsPage />;
        
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