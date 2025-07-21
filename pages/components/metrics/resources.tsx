import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { ServerStackIcon } from '@heroicons/react/24/outline';

type ResourcesProps = {
    users: string | undefined;
};

const Resources: React.FC<ResourcesProps> = ({ users }) => {
    const [response, setResponse] = useState<any[]>([]);

    useEffect(() => {
        if (!users) return;
        axios.post('/api/resources/use', { users })
            .then(res => setResponse(res.data))
            .catch(() => setResponse([{ error: 'Error fetching data' }]));
    }, [users]);

    const resource = response && response.length > 0 ? response[0] : null;

    const fakeCpu = 45; // %
    const fakeStorage = 120; // GB

    return (
        <div className="p-6 bg-zinc-800 rounded-2xl shadow-lg mx-auto mt-8 max-w-md transition-all duration-300 hover:shadow-xl">
            <div className="flex items-center gap-2 mb-6">
                <ServerStackIcon className="h-8 w-8 text-blue-500" />
                <h2 className="text-2xl font-semibold text-white">Recursos Utilizados</h2>
            </div>
            <div className="space-y-6">
                <div>
                    <div className="flex justify-between items-center mb-2">
                        <strong className="text-gray-200 font-medium">RAM Total</strong>
                        <span className="text-sm text-gray-400">
                            {resource?.total_memory_mb ? `${resource.total_memory_mb} MB` : 'Cargando...'}
                        </span>
                    </div>
                    <div className="bg-zinc-700 rounded-lg overflow-hidden h-4">
                        <div
                            className="bg-blue-500 h-full transition-all duration-500 ease-out"
                            style={{ width: resource?.total_memory_mb ? '100%' : '0%' }}
                        />
                    </div>
                </div>
                <div>
                    <div className="flex justify-between items-center mb-2">
                        <strong className="text-gray-200 font-medium">CPU</strong>
                        <span className="text-sm text-gray-400">{fakeCpu}% utilizado</span>
                    </div>
                    <div className="bg-zinc-700 rounded-lg overflow-hidden h-4">
                        <div
                            className="bg-yellow-500 h-full transition-all duration-500 ease-out"
                            style={{ width: `${fakeCpu}%` }}
                        />
                    </div>
                </div>
                <div>
                    <div className="flex justify-between items-center mb-2">
                        <strong className="text-gray-200 font-medium">Almacenamiento</strong>
                        <span className="text-sm text-gray-400">{fakeStorage} GB utilizado</span>
                    </div>
                    <div className="bg-zinc-700 rounded-lg overflow-hidden h-4">
                        <div
                            className="bg-green-500 h-full transition-all duration-500 ease-out"
                            style={{ width: '60%' }}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Resources;