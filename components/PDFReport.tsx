import React from 'react';
import { DailyData } from '../types';

interface PDFReportProps {
  data: DailyData;
  calculatedBalance: number;
  totalAssets: number;
  totalDeductions: number;
}

const SectionHeader: React.FC<{ title: string, colorClass: string }> = ({ title, colorClass }) => (
    <div className={`${colorClass} px-4 py-2 font-bold text-sm uppercase tracking-wider border-b border-black/5 flex justify-between items-center`}>
        <span>{title}</span>
    </div>
);

const Row: React.FC<{ label: string, value: number | string, isBold?: boolean, isNegative?: boolean, isSubTotal?: boolean, showBorder?: boolean }> = ({ label, value, isBold, isNegative, isSubTotal, showBorder = true }) => (
  <div className={`flex justify-between py-1.5 px-4 ${showBorder ? 'border-b border-gray-50 last:border-none' : ''} ${isSubTotal ? 'bg-gray-50/80' : ''}`}>
    <span className={`${isBold ? 'font-bold text-gray-800' : 'text-gray-600'} ${isSubTotal ? 'pl-2' : ''} text-sm`}>{label}</span>
    <span className={`font-mono text-sm ${isBold ? 'font-bold' : ''} ${isNegative ? 'text-red-600' : 'text-gray-900'}`}>
      {typeof value === 'number' ? value.toLocaleString() : value}
      {typeof value === 'number' && ' ৳'}
    </span>
  </div>
);

const PDFReport: React.FC<PDFReportProps> = ({ data, calculatedBalance, totalAssets, totalDeductions }) => {
  const profit = calculatedBalance - data.openingBalance;

  // --- CALCULATIONS ---
  const handCashTotal = data.handCashMode === 'direct' 
    ? data.handCashDirect 
    : data.handCashNotes.reduce((acc, curr) => acc + (curr.value * curr.count), 0);
  
  const agentTotal = data.bkashAgent + data.nagadAgent + data.rocketAgent + data.otherAgent;
  const personalTotal = data.bkashPersonal + data.nagadPersonal + data.rocketPersonal;
  const bankTotal = data.banks.reduce((acc, b) => acc + b.amount, 0);
  const receivableTotal = data.receivables.reduce((acc, r) => acc + r.amount, 0);
  const payableTotal = data.payables.reduce((acc, p) => acc + p.amount, 0);
  const commissionTotal = data.bkashComm + data.nagadComm + data.rocketComm + data.otherComm;
  const flexiTotal = data.gpFlexi + data.blFlexi + data.robiFlexi + data.airtelFlexi;

  return (
    <div className="bg-white w-full h-full font-sans text-gray-800 relative">
      
      {/* HEADER */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-800 text-white p-6 mb-6">
          <div className="flex justify-between items-start">
              <div>
                  <h1 className="text-2xl font-bold uppercase tracking-wide">দৈনিক হিসাব রিপোর্ট</h1>
                  <p className="text-primary-100 text-sm mt-1">Daily Financial Statement</p>
              </div>
              <div className="text-right">
                  <div className="inline-block bg-white/20 rounded-lg px-3 py-1 text-sm font-semibold backdrop-blur-sm">
                     {data.date}
                  </div>
              </div>
          </div>
          
          <div className="mt-6 flex justify-between items-end border-t border-white/20 pt-4">
               <div>
                   <p className="text-xs text-primary-200 uppercase mb-1">Opening Balance</p>
                   <p className="text-xl font-mono font-bold">৳ {data.openingBalance.toLocaleString()}</p>
               </div>
               <div className="text-right">
                   <p className="text-xs text-primary-200 uppercase mb-1">Closing Balance</p>
                   <p className="text-3xl font-mono font-bold">৳ {calculatedBalance.toLocaleString()}</p>
               </div>
          </div>
      </div>

      <div className="px-6 pb-6 space-y-4">

        {/* 1. HAND CASH - Soft Blue */}
        <div className="border border-blue-100 rounded-lg overflow-hidden shadow-sm">
            <SectionHeader title="হাতে নগদ (Hand Cash)" colorClass="bg-blue-100 text-blue-800" />
            <div className="bg-white">
                {data.handCashMode === 'direct' ? (
                   <Row label="সরাসরি ক্যাশ" value={data.handCashDirect} />
                ) : (
                   <div className="px-4 py-2">
                      <p className="text-xs text-gray-400 mb-1">নোট বিস্তারিত:</p>
                      <div className="grid grid-cols-2 gap-x-8 gap-y-1 text-xs text-gray-500">
                          {data.handCashNotes.filter(n => n.count > 0).map(n => (
                              <div key={n.value} className="flex justify-between border-b border-dashed border-gray-100 pb-1">
                                  <span>{n.value} x {n.count}</span>
                                  <span>= {(n.value * n.count).toLocaleString()}</span>
                              </div>
                          ))}
                      </div>
                   </div>
                )}
                <div className="mt-1">
                    <Row label="মোট হাতে নগদ" value={handCashTotal} isBold isSubTotal showBorder={false} />
                </div>
            </div>
        </div>

        {/* Grid for Mobile Banking */}
        <div className="grid grid-cols-2 gap-4">
            {/* 2. AGENT - Soft Purple */}
            <div className="border border-purple-100 rounded-lg overflow-hidden shadow-sm">
                <SectionHeader title="Mobile Banking (Agent)" colorClass="bg-purple-100 text-purple-800" />
                <Row label="bKash Agent" value={data.bkashAgent} />
                <Row label="Nagad Agent" value={data.nagadAgent} />
                <Row label="Rocket/Other" value={data.rocketAgent + data.otherAgent} />
                <Row label="মোট এজেন্ট" value={agentTotal} isBold isSubTotal showBorder={false} />
            </div>

            {/* 3. PERSONAL - Soft Pink */}
            <div className="border border-pink-100 rounded-lg overflow-hidden shadow-sm">
                <SectionHeader title="Mobile Banking (Personal)" colorClass="bg-pink-100 text-pink-800" />
                <Row label="bKash Personal" value={data.bkashPersonal} />
                <Row label="Nagad Personal" value={data.nagadPersonal} />
                <Row label="Rocket Personal" value={data.rocketPersonal} />
                <Row label="মোট পার্সোনাল" value={personalTotal} isBold isSubTotal showBorder={false} />
            </div>
        </div>

        {/* 4. BANKS - Soft Green */}
        <div className="border border-green-100 rounded-lg overflow-hidden shadow-sm">
            <SectionHeader title="ব্যাংক অ্যাকাউন্ট (Banks)" colorClass="bg-green-100 text-green-800" />
            {data.banks.length > 0 ? (
                data.banks.map(b => (
                    <Row key={b.id} label={b.name || 'Unknown Bank'} value={b.amount} />
                ))
            ) : (
                <div className="text-center py-2 text-xs text-gray-400">কোনো ব্যাংক এন্ট্রি নেই</div>
            )}
            <Row label="মোট ব্যাংক" value={bankTotal} isBold isSubTotal showBorder={false} />
        </div>

        {/* 5. RECEIVABLES - Soft Orange */}
        <div className="border border-orange-100 rounded-lg overflow-hidden shadow-sm">
             <SectionHeader title="পাওনা (Receivables)" colorClass="bg-orange-100 text-orange-800" />
             {data.receivables.length > 0 ? (
                 data.receivables.map(r => (
                     <Row key={r.id} label={r.name || 'Unknown'} value={r.amount} />
                 ))
             ) : (
                 <div className="text-center py-2 text-xs text-gray-400">নেই</div>
             )}
             <Row label="মোট পাওনা" value={receivableTotal} isBold isSubTotal showBorder={false} />
        </div>

        {/* 6. PAYABLES - Soft Red (Negative) */}
        <div className="border border-red-100 rounded-lg overflow-hidden shadow-sm">
             <SectionHeader title="দেনা (Payables - Deducted)" colorClass="bg-red-100 text-red-800" />
             {data.payables.length > 0 ? (
                 data.payables.map(p => (
                     <Row key={p.id} label={p.name || 'Unknown'} value={p.amount} isNegative />
                 ))
             ) : (
                 <div className="text-center py-2 text-xs text-gray-400">নেই</div>
             )}
             <Row label="মোট দেনা" value={payableTotal} isBold isSubTotal isNegative showBorder={false} />
        </div>

        {/* Grid for Commission & Flexi */}
        <div className="grid grid-cols-2 gap-4">
             {/* 7. COMMISSION - Soft Yellow */}
             <div className="border border-yellow-100 rounded-lg overflow-hidden shadow-sm">
                <SectionHeader title="কমিশন (Expense)" colorClass="bg-yellow-100 text-yellow-800" />
                <Row label="bKash" value={data.bkashComm} isNegative />
                <Row label="Nagad" value={data.nagadComm} isNegative />
                <Row label="Rocket/Other" value={data.rocketComm + data.otherComm} isNegative />
                <Row label="মোট কমিশন" value={commissionTotal} isBold isSubTotal isNegative showBorder={false} />
             </div>

             {/* 8. FLEXILOAD - Soft Teal */}
             <div className="border border-teal-100 rounded-lg overflow-hidden shadow-sm">
                <SectionHeader title="ফ্লেক্সিলোড ব্যালেন্স" colorClass="bg-teal-100 text-teal-800" />
                <Row label="GP" value={data.gpFlexi} />
                <Row label="Banglalink" value={data.blFlexi} />
                <Row label="Robi/Airtel" value={data.robiFlexi + data.airtelFlexi} />
                <Row label="মোট ফ্লেক্সি" value={flexiTotal} isBold isSubTotal showBorder={false} />
             </div>
        </div>
        
        {/* INVESTMENT - Soft Gray */}
        {data.investment > 0 && (
            <div className="border border-gray-200 rounded-lg overflow-hidden shadow-sm">
                 <SectionHeader title="ইনভেস্টমেন্ট (Investment)" colorClass="bg-gray-100 text-gray-800" />
                 <Row label="আজকের ইনভেস্ট" value={data.investment} isBold isNegative showBorder={false} />
            </div>
        )}

        {/* FINAL TOTALS */}
        <div className="grid grid-cols-2 gap-4 mt-2">
            <div className="bg-emerald-50 rounded-lg p-3 border border-emerald-100">
                <p className="text-xs text-emerald-600 font-bold uppercase">মোট ক্যাশ-ইন</p>
                <p className="text-lg font-bold text-emerald-700">৳ {totalAssets.toLocaleString()}</p>
            </div>
            <div className="bg-rose-50 rounded-lg p-3 border border-rose-100">
                <p className="text-xs text-rose-600 font-bold uppercase">মোট ক্যাশ-আউট</p>
                <p className="text-lg font-bold text-rose-700">৳ {totalDeductions.toLocaleString()}</p>
            </div>
        </div>

        <div className="bg-gray-900 text-white p-4 rounded-xl mt-2 flex justify-between items-center shadow-lg">
            <div>
                <p className="text-xs text-gray-400 uppercase">আজকের লাভ/লস</p>
                <p className={`font-bold text-lg ${profit >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {profit >= 0 ? '+' : ''}{profit.toLocaleString()} ৳
                </p>
            </div>
            <div className="text-right">
                <p className="text-xs text-gray-400 uppercase">ফাইনাল ব্যালেন্স</p>
                <p className="font-bold text-2xl">৳ {calculatedBalance.toLocaleString()}</p>
            </div>
        </div>

      </div>
      
    </div>
  );
};

export default PDFReport;