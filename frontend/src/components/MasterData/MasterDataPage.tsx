import React from "react";
import { Database } from "lucide-react";
import MasterTablePanel from "./MasterTablePanel";

const MasterDataPage: React.FC = () => {
    return (
        <div className="p-6">
            <div className="mb-6">
                <h1 className="flex items-center gap-2 text-2xl font-bold text-gray-800 dark:text-gray-200">
                    <Database size={24} />
                    Master Data
                </h1>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    Kelola jenis Telemetry dan Client yang digunakan pada data alat
                </p>
            </div>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                <MasterTablePanel tableType="telemetry" />
                <MasterTablePanel tableType="client" />
            </div>
        </div>
    );
};

export default MasterDataPage;