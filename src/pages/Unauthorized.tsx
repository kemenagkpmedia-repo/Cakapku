import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/Button';

export const Unauthorized: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
      <h1 className="text-4xl font-bold text-red-600 mb-4">403 - Unauthorized</h1>
      <p className="text-gray-600 mb-8 text-center max-w-md">
        Anda tidak memiliki akses ke halaman ini. Silakan kembali ke halaman utama atau login dengan akun yang sesuai.
      </p>
      <Link to="/login">
        <Button>Kembali ke Login</Button>
      </Link>
    </div>
  );
};

export const PlaceholderPage: React.FC<{ title: string }> = ({ title }) => (
  <div className="p-6">
    <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
    <p className="text-gray-500 mt-2">Halaman ini sedang dalam tahap pengembangan.</p>
  </div>
);
