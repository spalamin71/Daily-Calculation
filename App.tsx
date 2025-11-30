import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Home, Calculator, Printer, Share2, TrendingUp, History, Database } from './components/Icon';
import Dashboard from './components/Dashboard';
import CalculatorForm from './components/CalculatorForm';
import PDFReport from './components/PDFReport';
import BackupView from './components/BackupView';
import { DailyData, initialDailyData, initialNotes } from './types';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'calculator' | 'print' | 'backup'>('dashboard');
  const [data, setData] = useState<DailyData>(() => {
    try {
        const saved = localStorage.getItem('dailyData');
        return saved ? JSON.parse(saved) : initialDailyData;
    } catch (e) {
        return initialDailyData;
    }
  });
  const [isDownloading, setIsDownloading] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  const reportRef = useRef<HTMLDivElement>(null);

  // Persist data locally
  useEffect(() => {
    localStorage.setItem('dailyData', JSON.stringify(data));
  }, [data]);

  // Main Balance Calculation Logic
  const { totalAssets, totalDeductions, calculatedBalance, handCashTotal } = useMemo(() => {
    // 1. Assets (Cash In / Available Funds)
    const handCash = data.handCashMode === 'direct' 
      ? data.handCashDirect 
      : data.handCashNotes.reduce((acc, n) => acc + (n.value * n.count), 0);
    
    const agentMFS = data.bkashAgent + data.nagadAgent + data.rocketAgent + data.otherAgent;
    const personalMFS = data.bkashPersonal + data.nagadPersonal + data.rocketPersonal;
    const bankTotal = data.banks.reduce((acc, b) => acc + b.amount, 0);
    const receivables = data.receivables.reduce((acc, r) => acc + r.amount, 0);
    const flexiload = data.gpFlexi + data.blFlexi + data.robiFlexi + data.airtelFlexi;
    
    const totalAssets = handCash + agentMFS + personalMFS + bankTotal + receivables + flexiload;

    // 2. Liabilities/Expenses (Cash Out / Deductions)
    const payables = data.payables.reduce((acc, p) => acc + p.amount, 0);
    const commissions = data.bkashComm + data.nagadComm + data.rocketComm + data.otherComm;
    const investment = data.investment;

    const totalDeductions = payables + commissions + investment;

    return {
        totalAssets,
        totalDeductions,
        calculatedBalance: totalAssets - totalDeductions,
        handCashTotal: handCash
    };
  }, [data]);

  // Auto Backup Function
  const handleAutoBackup = () => {
      try {
          const backups = JSON.parse(localStorage.getItem('app_backups') || '{}');
          backups[data.date] = data; // Key by date
          localStorage.setItem('app_backups', JSON.stringify(backups));
          console.log('Auto backup saved for', data.date);
      } catch (e) {
          console.error("Backup failed", e);
      }
  };

  const showToastMsg = (msg: string) => {
      setToastMessage(msg);
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
  };

  const handleManualBackup = () => {
      handleAutoBackup();
      showToastMsg('✓ ব্যাকআপ সফলভাবে সম্পন্ন হয়েছে');
  };

  const handleRestore = (restoredData: DailyData) => {
      // Ensure robust restore by merging with initial structure to prevent missing fields in old backups
      const safeData = {
          ...initialDailyData,
          ...restoredData,
          handCashNotes: restoredData.handCashNotes && restoredData.handCashNotes.length > 0 
            ? restoredData.handCashNotes 
            : initialNotes,
          banks: restoredData.banks || [],
          receivables: restoredData.receivables || [],
          payables: restoredData.payables || []
      };
      
      setData(safeData);
      showToastMsg('✓ রিস্টোর সফল হয়েছে');
      setActiveTab('calculator');
  };

  // Function to Download PDF - Single Page A4
  const handleDownloadPDF = async () => {
    if (!reportRef.current) return;
    setIsDownloading(true);

    try {
        const element = reportRef.current;
        
        // Wait a moment to ensure rendering
        await new Promise(resolve => setTimeout(resolve, 500));

        // Capture settings for Android compatibility and High Resolution
        const canvas = await html2canvas(element, {
            scale: 3, // High resolution (3x scale) for sharp text
            useCORS: true,
            allowTaint: true,
            logging: false,
            backgroundColor: '#ffffff',
            windowWidth: 1024, // Force desktop width logic for grids
        });

        const imgData = canvas.toDataURL('image/jpeg', 1.0); // Max quality
        
        // PDF Setup (A4 Portrait)
        const pdf = new jsPDF('p', 'mm', 'a4');
        const pdfWidth = pdf.internal.pageSize.getWidth();   // 210mm
        const pdfHeight = pdf.internal.pageSize.getHeight(); // 297mm
        
        // Small margins for edge-to-edge feel
        const margin = 5; 
        const availableWidth = pdfWidth - (margin * 2);
        const availableHeight = pdfHeight - (margin * 2);

        // Calculate dimensions to fit width first
        const imgProps = pdf.getImageProperties(imgData);
        
        // Strategy: Force width to fill available width (edge-to-edge)
        let finalWidth = availableWidth;
        let finalHeight = (imgProps.height * finalWidth) / imgProps.width;

        // Only if height is too tall, scale down to fit one page
        if (finalHeight > availableHeight) {
            const ratio = availableHeight / finalHeight;
            finalHeight = availableHeight;
            finalWidth = finalWidth * ratio;
        }

        // Center horizontally (only relevant if we scaled down by height, otherwise it's full width)
        const xPos = margin + (availableWidth - finalWidth) / 2;
        const yPos = margin; // Top aligned

        pdf.addImage(imgData, 'JPEG', xPos, yPos, finalWidth, finalHeight);
        
        const fileName = `Daily_Report_${data.date}.pdf`;
        pdf.save(fileName);
        showToastMsg('✓ PDF সফলভাবে ডাউনলোড হয়েছে');

    } catch (error) {
        console.error("PDF Generation failed", error);
        alert("PDF ডাউনলোড করতে সমস্যা হয়েছে। আবার চেষ্টা করুন।");
    } finally {
        setIsDownloading(false);
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
       try {
           await navigator.share({
               title: 'Daily Calculation',
               text: `Daily Balance Report for ${data.date}. Closing Balance: ${calculatedBalance}`,
               url: window.location.href
           });
       } catch (err) {
           console.log('Error sharing', err);
       }
    } else {
       alert("আপনার ডিভাইসে শেয়ার অপশনটি সরাসরি নেই। অনুগ্রহ করে PDF ডাউনলোড করে শেয়ার করুন।");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-900 pb-20 md:pb-0 relative">
      
      {/* PINNED MAIN BALANCE BAR */}
      <header className="bg-gradient-to-r from-primary-600 to-secondary-600 text-white pt-3 pb-4 px-4 sticky top-0 z-40 shadow-lg print:hidden transition-all duration-300">
        <div className="max-w-3xl mx-auto">
             {/* Top Row: Breakdown */}
            <div className="flex justify-between text-[11px] font-medium text-pink-100 opacity-90 mb-1">
                <span>হাতে নগদ: ৳{handCashTotal.toLocaleString()}</span>
                <span>মোট ক্যাশ-ইন: ৳{totalAssets.toLocaleString()}</span>
                <span>মোট ক্যাশ-আউট: ৳{totalDeductions.toLocaleString()}</span>
            </div>
            
            {/* Bottom Row: Main Balance */}
            <div className="flex justify-between items-end border-t border-white/20 pt-1.5">
                <span className="text-sm font-semibold text-white/95">ক্লোজিং ব্যালেন্স (Closing):</span>
                <span className="text-2xl font-bold tracking-tight leading-none">৳ {calculatedBalance.toLocaleString()}</span>
            </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-3xl mx-auto p-4 pt-4 print:p-0 print:max-w-none">
        
        {/* VIEW: PRINT / PDF */}
        {activeTab === 'print' && (
          <div className="min-h-screen animate-fade-in pb-20">
             <div className="flex gap-3 mb-6 print:hidden">
                <button 
                    onClick={handleDownloadPDF} 
                    disabled={isDownloading}
                    className="flex-1 bg-gradient-to-r from-primary-600 to-secondary-600 text-white py-3 rounded-xl shadow-lg font-bold flex items-center justify-center gap-2 active:scale-95 transition-all disabled:opacity-70"
                >
                    {isDownloading ? (
                        <span className="animate-pulse">প্রসেসিং হচ্ছে...</span>
                    ) : (
                        <>
                            <Printer size={20} /> PDF ডাউনলোড (A4)
                        </>
                    )}
                </button>
                <button 
                    onClick={handleShare}
                    className="flex-none bg-white text-primary-600 border border-primary-200 px-4 rounded-xl shadow-sm flex items-center justify-center active:scale-95 transition-all"
                >
                    <Share2 size={24} />
                </button>
             </div>

             {/* Report Container for Capture */}
             {/* Fixed width min-w-[210mm] ensures that on mobile devices, the capture renders at full A4 resolution width, not mobile width */}
             <div className="overflow-x-auto flex justify-center pb-8">
                 <div ref={reportRef} className="bg-white shadow-xl rounded-none md:rounded-2xl mx-auto w-[210mm] min-w-[210mm] min-h-[297mm] origin-top">
                    <PDFReport 
                        data={data} 
                        calculatedBalance={calculatedBalance} 
                        totalAssets={totalAssets}
                        totalDeductions={totalDeductions}
                    />
                 </div>
             </div>
             
             <div className="mt-8 text-center print:hidden">
                <button onClick={() => setActiveTab('dashboard')} className="text-gray-500 underline text-sm">ড্যাশবোর্ডে ফিরে যান</button>
             </div>
          </div>
        )}

        {/* VIEW: DASHBOARD */}
        {activeTab === 'dashboard' && <Dashboard currentData={data} calculatedBalance={calculatedBalance} />}

        {/* VIEW: CALCULATOR */}
        {activeTab === 'calculator' && (
            <CalculatorForm 
                data={data} 
                onChange={setData} 
                calculatedTotal={calculatedBalance} 
                onSave={() => {
                    handleAutoBackup();
                    setActiveTab('print');
                }} 
            />
        )}

        {/* VIEW: BACKUP */}
        {activeTab === 'backup' && (
            <BackupView 
                currentData={data} 
                onRestore={handleRestore} 
                onManualBackup={handleManualBackup} 
            />
        )}

      </main>

      {/* Toast Notification */}
      {showToast && (
          <div className="fixed bottom-24 left-1/2 transform -translate-x-1/2 bg-gray-900/90 text-white px-6 py-3 rounded-full shadow-2xl z-50 flex items-center gap-2 animate-bounce backdrop-blur-sm">
              {toastMessage}
          </div>
      )}

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 py-2 px-6 flex justify-between items-center text-gray-500 z-50 print:hidden shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] safe-area-bottom">
        
        <button 
          onClick={() => setActiveTab('dashboard')}
          className={`flex flex-col items-center gap-1 ${activeTab === 'dashboard' ? 'text-primary-600 scale-110' : ''} transition-all`}
        >
          <div className={`p-2 rounded-full ${activeTab === 'dashboard' ? 'bg-pink-50' : ''}`}>
             <Home size={22} strokeWidth={activeTab === 'dashboard' ? 2.5 : 2} />
          </div>
          <span className="text-[10px] font-medium">হোম</span>
        </button>

        <button 
          onClick={() => setActiveTab('backup')}
          className={`flex flex-col items-center gap-1 ${activeTab === 'backup' ? 'text-primary-600 scale-110' : ''} transition-all`}
        >
          <div className={`p-2 rounded-full ${activeTab === 'backup' ? 'bg-pink-50' : ''}`}>
             <History size={22} strokeWidth={activeTab === 'backup' ? 2.5 : 2} />
          </div>
          <span className="text-[10px] font-medium">হিস্ট্রি</span>
        </button>

        {/* Floating Main Action Button */}
        <div className="-mt-12 relative z-10">
            <button 
                onClick={() => setActiveTab('calculator')}
                className="bg-gradient-to-r from-primary-600 to-secondary-600 text-white p-4 rounded-full shadow-lg shadow-primary-200 transform transition-transform hover:scale-105 active:scale-95 border-4 border-gray-50"
            >
                <Calculator size={28} />
            </button>
        </div>

        <button 
          onClick={() => setActiveTab('print')}
          className={`flex flex-col items-center gap-1 ${activeTab === 'print' ? 'text-primary-600 scale-110' : ''} transition-all`}
        >
          <div className={`p-2 rounded-full ${activeTab === 'print' ? 'bg-pink-50' : ''}`}>
             <Printer size={22} strokeWidth={activeTab === 'print' ? 2.5 : 2} />
          </div>
          <span className="text-[10px] font-medium">রিপোর্ট</span>
        </button>

         {/* Empty spacer for balance */}
         <div className="w-8"></div>
      </nav>

    </div>
  );
};

export default App;