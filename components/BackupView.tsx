import React, { useState, useEffect } from 'react';
import { DailyData } from '../types';
import { Download, Upload, Database, Trash2, History, Save } from './Icon';

interface BackupViewProps {
  currentData: DailyData;
  onRestore: (data: DailyData) => void;
  onManualBackup: () => void;
}

const BackupView: React.FC<BackupViewProps> = ({ currentData, onRestore, onManualBackup }) => {
  const [backups, setBackups] = useState<Record<string, DailyData>>({});

  useEffect(() => {
    loadBackups();
  }, []);

  const loadBackups = () => {
    try {
      const stored = localStorage.getItem('app_backups');
      if (stored) {
        setBackups(JSON.parse(stored));
      }
    } catch (e) {
      console.error("Failed to load backups", e);
    }
  };

  const handleDelete = (dateKey: string) => {
    if (confirm('আপনি কি নিশ্চিত যে আপনি এই ব্যাকআপটি মুছে ফেলতে চান?')) {
      const newBackups = { ...backups };
      delete newBackups[dateKey];
      localStorage.setItem('app_backups', JSON.stringify(newBackups));
      setBackups(newBackups);
    }
  };

  const handleDownloadJSON = (data: DailyData) => {
    const jsonString = `data:text/json;chatset=utf-8,${encodeURIComponent(
      JSON.stringify(data, null, 2)
    )}`;
    const link = document.createElement('a');
    link.href = jsonString;
    link.download = `daily_backup_${data.date}.json`;
    link.click();
  };

  return (
    <div className="space-y-6 pb-24 pt-4 animate-fade-in">
      
      {/* Manual Backup Action */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-indigo-50 text-center">
        <div className="bg-indigo-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-indigo-600">
            <Database size={32} />
        </div>
        <h2 className="text-xl font-bold text-gray-800 mb-2">ব্যাকআপ এবং রিস্টোর</h2>
        <p className="text-sm text-gray-500 mb-6">আপনার সমস্ত হিসাব সুরক্ষিত রাখতে নিয়মিত ব্যাকআপ নিন।</p>
        
        <button 
            onClick={() => { onManualBackup(); loadBackups(); }}
            className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-3 rounded-xl shadow-lg font-bold flex items-center justify-center gap-2 active:scale-95 transition-all"
        >
            <Save size={20} /> এখন ব্যাকআপ নিন (Backup Now)
        </button>
      </div>

      {/* Backup List */}
      <div className="bg-white p-5 rounded-2xl shadow-sm">
         <div className="flex items-center gap-2 mb-4 border-b pb-2">
            <History size={20} className="text-gray-500" />
            <h3 className="font-bold text-gray-700">পূর্ববর্তী ব্যাকআপ তালিকা</h3>
         </div>
         
         {Object.keys(backups).length === 0 ? (
             <div className="text-center py-8 text-gray-400">
                 কোনো ব্যাকআপ পাওয়া যায়নি
             </div>
         ) : (
             <div className="space-y-3">
                 {Object.entries(backups).sort((a, b) => b[0].localeCompare(a[0])).map(([date, item]) => {
                     const data = item as DailyData;
                     
                     // Quick Calculate Balance for Preview
                     const assets = (data.handCashMode === 'direct' ? data.handCashDirect : (data.handCashNotes || []).reduce((a,c)=>a+c.value*c.count,0)) + 
                                    (data.bkashAgent+data.nagadAgent+data.rocketAgent+data.otherAgent) + 
                                    (data.bkashPersonal+data.nagadPersonal+data.rocketPersonal) + 
                                    (data.banks || []).reduce((a,b)=>a+b.amount,0) + 
                                    (data.receivables || []).reduce((a,r)=>a+r.amount,0) +
                                    (data.gpFlexi+data.blFlexi+data.robiFlexi+data.airtelFlexi);
                     
                     const liabilities = (data.payables || []).reduce((a,p)=>a+p.amount,0) + 
                                         (data.bkashComm+data.nagadComm+data.rocketComm+data.otherComm) + 
                                         data.investment;
                     
                     const balance = assets - liabilities;

                     return (
                     <div key={date} className="border border-gray-100 rounded-xl p-4 hover:bg-gray-50 transition-colors">
                         <div className="flex justify-between items-start mb-2">
                             <div>
                                 <p className="font-bold text-gray-800">{data.date}</p>
                                 <p className="text-xs text-gray-500 font-mono mt-1">
                                    Closing: ৳ {balance.toLocaleString()}
                                 </p>
                             </div>
                             <button 
                                onClick={() => handleDelete(date)}
                                className="text-red-400 hover:text-red-600 p-2 bg-red-50 rounded-lg"
                             >
                                 <Trash2 size={16} />
                             </button>
                         </div>
                         
                         <div className="flex gap-2 mt-3">
                             <button 
                                onClick={() => { 
                                    if(confirm(`আপনি কি ${date}-এর ডাটা রিস্টোর করতে চান? বর্তমান ডাটা প্রতিস্থাপন করা হবে।`)) {
                                        onRestore(data);
                                    }
                                }}
                                className="flex-1 bg-green-50 text-green-700 py-2.5 rounded-lg text-xs font-bold flex items-center justify-center gap-2 border border-green-200 active:scale-95 transition-transform"
                             >
                                 <Upload size={14} /> Restore Data
                             </button>
                             <button 
                                onClick={() => handleDownloadJSON(data)}
                                className="flex-1 bg-blue-50 text-blue-700 py-2.5 rounded-lg text-xs font-bold flex items-center justify-center gap-2 border border-blue-200 active:scale-95 transition-transform"
                             >
                                 <Download size={14} /> Download JSON
                             </button>
                         </div>
                     </div>
                 )})}
             </div>
         )}
      </div>

    </div>
  );
};

export default BackupView;