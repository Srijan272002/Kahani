import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import { useAuth } from '../../contexts/AuthContext';

const MainLayout: React.FC = () => {
    const { user } = useAuth();

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            <Navbar />
            <div className="flex">
                {user && <Sidebar />}
                <main className={`flex-1 p-4 sm:p-6 lg:p-8 ${user ? 'ml-64' : ''}`}>
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default MainLayout; 