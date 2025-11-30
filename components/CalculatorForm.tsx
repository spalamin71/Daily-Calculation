import React from 'react';
import { DailyData, NoteCount, BankEntry, TransactionEntry } from '../types';
import { Plus, Trash2, Smartphone, Landmark, User, Users, Share2 } from './Icon';

interface CalculatorFormProps {
  data: DailyData;
  onChange: (newData: DailyData) => void;
  calculatedTotal: number;
  onSave?: () => void;
}

const InputGroup = ({ label, value, onChange, placeholder = "0" }: { label: string, value: number, onChange: (v: number) => void, placeholder?: string }) => (
  <div className="flex flex-col">
    <label className="text-xs font-medium text-gray-500 mb-1 ml-1">{label}</label>
    <input
      type="number"
      value={value === 0 ? '' : value}
      onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
      placeholder={placeholder}
      className="w-full bg-gray-50 border border-gray-200 text-gray-800 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all font-semibold"
    />
  </div>
);

const SectionHeader = ({ title, icon: Icon, total }: { title: string, icon: any, total?: number }) => (
  <div className="flex items-center justify-between mb-4 mt-6 border-b border-gray-100 pb-2">
    <div className="flex items-center gap-2 text-primary-700">
      <div className="p-2 bg-primary-50 rounded-lg">
        <Icon size={18} />
      </div>
      <h3 className="font-bold text-lg">{title}</h3>
    </div>
    {total !== undefined && (
      <span className="text-sm font-bold bg-gray-100 px-3 py-1 rounded-full text-gray-600">
        মোট: {total.toLocaleString()}
      </span>
    )}
  </div>
);

const CalculatorForm: React.FC<CalculatorFormProps> = ({ data, onChange, calculatedTotal, onSave }) => {

  const updateField = (field: keyof DailyData, value: any) => {
    onChange({ ...data, [field]: value });
  };

  const updateNote = (index: number, count: number) => {
    const newNotes = [...data.handCashNotes];
    newNotes[index].count = count;
    updateField('handCashNotes', newNotes);
  };

  const handCashTotal = data.handCashMode === 'direct'
    ? data.handCashDirect
    : data.handCashNotes.reduce((acc, curr) => acc + (curr.value * curr.count), 0);

  // Helper for dynamic lists (Banks, Receivables, etc)
  const addBank = () => {
    const newBank: BankEntry = { id: Date.now().toString(), name: '', amount: 0 };
    updateField('banks', [...data.banks, newBank]);
  };
  
  const updateBank = (index: number, field: keyof BankEntry, value: any) => {
    const newBanks = [...data.banks];
    newBanks[index] = { ...newBanks[index], [field]: value };
    updateField('banks', newBanks);
  };

  const addTransaction = (type: 'receivables' | 'payables') => {
    const newItem: TransactionEntry = { id: Date.now().toString(), name: '', amount: 0 };
    updateField(type, [...data[type], newItem]);
  };

  const updateTransaction = (type: 'receivables' | 'payables', index: number, field: keyof TransactionEntry, value: any) => {
    const list = [...data[type]];
    list[index] = { ...list[index], [field]: value };
    updateField(type, list);
  };

  const removeListCheck = (listName: 'banks' | 'receivables' | 'payables', index: number) => {
      const list = [...data[listName]];
      list.splice(index, 1);
      updateField(listName, list);
  }

  return (
    <div className="space-y-4 pb-32">
      
      {/* Date & Opening */}
      <div className="bg-white p-5 rounded-2xl shadow-sm space-y-4">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">তারিখ নির্বাচন</label>
          <input
            type="date"
            value={data.date}
            onChange={(e) => updateField('date', e.target.value)}
            className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary-500 outline-none"
          />
        </div>
        <InputGroup 
            label="আজকের ওপেনিং ব্যালেন্স (Yesterday Closing)" 
            value={data.openingBalance} 
            onChange={(v) => updateField('openingBalance', v)} 
        />
      </div>

      {/* Hand Cash */}
      <div className="bg-white p-5 rounded-2xl shadow-sm">
        <SectionHeader title="হাতে নগদ (Hand Cash)" icon={User} total={handCashTotal} />
        
        <div className="flex bg-gray-100 p-1 rounded-xl mb-4">
          <button
            onClick={() => updateField('handCashMode', 'direct')}
            className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${data.handCashMode === 'direct' ? 'bg-white text-primary-600 shadow-sm' : 'text-gray-500'}`}
          >
            সরাসরি ইনপুট
          </button>
          <button
            onClick={() => updateField('handCashMode', 'notes')}
            className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${data.handCashMode === 'notes' ? 'bg-white text-primary-600 shadow-sm' : 'text-gray-500'}`}
          >
            নোট গণনা
          </button>
        </div>

        {data.handCashMode === 'direct' ? (
          <InputGroup label="আজ হাতে মোট কত টাকা আছে?" value={data.handCashDirect} onChange={(v) => updateField('handCashDirect', v)} />
        ) : (
          <div className="space-y-3">
            {data.handCashNotes.map((note, idx) => (
              <div key={note.value} className="flex items-center gap-3">
                <span className="w-16 font-bold text-gray-700 text-right">{note.value} ৳</span>
                <span className="text-gray-400">x</span>
                <input
                  type="number"
                  placeholder="সংখ্যা"
                  value={note.count || ''}
                  onChange={(e) => updateNote(idx, parseInt(e.target.value) || 0)}
                  className="flex-1 border rounded-lg px-3 py-2 outline-none focus:border-primary-500"
                />
                <span className="w-20 text-right font-medium text-gray-600">= {(note.value * note.count).toLocaleString()}</span>
              </div>
            ))}
            <div className="border-t pt-2 mt-2 flex justify-between font-bold text-primary-700">
                <span>মোট হাতে নগদ:</span>
                <span>{handCashTotal.toLocaleString()} ৳</span>
            </div>
          </div>
        )}
      </div>

      {/* Mobile Banking Agent */}
      <div className="bg-white p-5 rounded-2xl shadow-sm">
        <SectionHeader 
          title="মোবাইল ব্যাংকিং (Agent)" 
          icon={Smartphone} 
          total={data.bkashAgent + data.nagadAgent + data.rocketAgent + data.otherAgent} 
        />
        <div className="grid grid-cols-2 gap-4">
            <InputGroup label="bKash Agent" value={data.bkashAgent} onChange={(v) => updateField('bkashAgent', v)} />
            <InputGroup label="Nagad Agent" value={data.nagadAgent} onChange={(v) => updateField('nagadAgent', v)} />
            <InputGroup label="Rocket Agent" value={data.rocketAgent} onChange={(v) => updateField('rocketAgent', v)} />
            <InputGroup label="Other Agent" value={data.otherAgent} onChange={(v) => updateField('otherAgent', v)} />
        </div>
      </div>

      {/* Mobile Banking Personal */}
      <div className="bg-white p-5 rounded-2xl shadow-sm">
        <SectionHeader 
          title="মোবাইল ব্যাংকিং (Personal)" 
          icon={User} 
          total={data.bkashPersonal + data.nagadPersonal + data.rocketPersonal} 
        />
        <div className="grid grid-cols-2 gap-4">
            <InputGroup label="bKash Personal" value={data.bkashPersonal} onChange={(v) => updateField('bkashPersonal', v)} />
            <InputGroup label="Nagad Personal" value={data.nagadPersonal} onChange={(v) => updateField('nagadPersonal', v)} />
            <InputGroup label="Rocket Personal" value={data.rocketPersonal} onChange={(v) => updateField('rocketPersonal', v)} />
        </div>
      </div>

      {/* Banks */}
      <div className="bg-white p-5 rounded-2xl shadow-sm">
        <SectionHeader 
            title="ব্যাংক হিসাব (Banks)" 
            icon={Landmark} 
            total={data.banks.reduce((acc, b) => acc + b.amount, 0)} 
        />
        <div className="space-y-3">
            {data.banks.map((bank, idx) => (
                <div key={bank.id} className="flex gap-2 items-end animate-fade-in">
                    <div className="flex-1">
                        <label className="text-xs text-gray-500 ml-1">ব্যাংকের নাম</label>
                        <input 
                            type="text" 
                            value={bank.name} 
                            onChange={(e) => updateBank(idx, 'name', e.target.value)}
                            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary-500"
                        />
                    </div>
                    <div className="w-1/3">
                         <label className="text-xs text-gray-500 ml-1">টাকা</label>
                         <input 
                            type="number" 
                            value={bank.amount || ''} 
                            onChange={(e) => updateBank(idx, 'amount', parseFloat(e.target.value) || 0)}
                            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary-500 font-semibold"
                        />
                    </div>
                    {idx > 2 && (
                        <button onClick={() => removeListCheck('banks', idx)} className="p-2 text-red-500 bg-red-50 rounded-lg mb-[1px]">
                            <Trash2 size={18} />
                        </button>
                    )}
                </div>
            ))}
            <button onClick={addBank} className="w-full py-2 mt-2 border border-dashed border-primary-300 text-primary-600 rounded-xl text-sm font-medium flex items-center justify-center gap-2 hover:bg-primary-50">
                <Plus size={16} /> নতুন ব্যাংক যুক্ত করুন
            </button>
        </div>
      </div>

       {/* Receivables */}
       <div className="bg-white p-5 rounded-2xl shadow-sm">
        <SectionHeader 
            title="পাওনা (Receivables)" 
            icon={Users} 
            total={data.receivables.reduce((acc, r) => acc + r.amount, 0)} 
        />
        <p className="text-xs text-gray-400 mb-3 -mt-3">মানুষ আমাকে যে টাকা দেবে</p>
        <div className="space-y-3">
            {data.receivables.map((item, idx) => (
                 <div key={item.id} className="flex gap-2 items-end">
                 <div className="flex-[2]">
                     <input 
                         placeholder="নাম"
                         type="text" 
                         value={item.name} 
                         onChange={(e) => updateTransaction('receivables', idx, 'name', e.target.value)}
                         className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary-500"
                     />
                 </div>
                 <div className="flex-1">
                      <input 
                         placeholder="টাকা"
                         type="number" 
                         value={item.amount || ''} 
                         onChange={(e) => updateTransaction('receivables', idx, 'amount', parseFloat(e.target.value) || 0)}
                         className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary-500 font-semibold"
                     />
                 </div>
                 <button onClick={() => removeListCheck('receivables', idx)} className="p-2 text-red-500 bg-red-50 rounded-lg">
                     <Trash2 size={18} />
                 </button>
             </div>
            ))}
             <button onClick={() => addTransaction('receivables')} className="w-full py-2 mt-2 border border-dashed border-green-300 text-green-600 rounded-xl text-sm font-medium flex items-center justify-center gap-2 hover:bg-green-50">
                <Plus size={16} /> নতুন পাওনা যুক্ত করুন
            </button>
        </div>
      </div>

      {/* ----- EXPENSES SECTION ----- */}
      <div className="border-t-2 border-dashed border-red-200 my-6"></div>
      <h2 className="text-center text-red-500 font-bold bg-red-50 py-2 rounded-lg mx-10">খরচ এবং দেনা (বিয়োগ হবে)</h2>

      {/* Payables */}
      <div className="bg-white p-5 rounded-2xl shadow-sm border border-red-100">
        <SectionHeader 
            title="দেনা (Payables)" 
            icon={Users} 
            total={data.payables.reduce((acc, r) => acc + r.amount, 0)} 
        />
        <p className="text-xs text-gray-400 mb-3 -mt-3">মানুষকে আমি যে টাকা দেব</p>
         <div className="space-y-3">
            {data.payables.map((item, idx) => (
                 <div key={item.id} className="flex gap-2 items-end">
                 <div className="flex-[2]">
                     <input 
                         placeholder="নাম"
                         type="text" 
                         value={item.name} 
                         onChange={(e) => updateTransaction('payables', idx, 'name', e.target.value)}
                         className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary-500"
                     />
                 </div>
                 <div className="flex-1">
                      <input 
                         placeholder="টাকা"
                         type="number" 
                         value={item.amount || ''} 
                         onChange={(e) => updateTransaction('payables', idx, 'amount', parseFloat(e.target.value) || 0)}
                         className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary-500 font-semibold"
                     />
                 </div>
                 <button onClick={() => removeListCheck('payables', idx)} className="p-2 text-red-500 bg-red-50 rounded-lg">
                     <Trash2 size={18} />
                 </button>
             </div>
            ))}
             <button onClick={() => addTransaction('payables')} className="w-full py-2 mt-2 border border-dashed border-red-300 text-red-600 rounded-xl text-sm font-medium flex items-center justify-center gap-2 hover:bg-red-50">
                <Plus size={16} /> নতুন দেনা যুক্ত করুন
            </button>
        </div>
      </div>

      {/* Agent Commissions (Expenses) */}
      <div className="bg-white p-5 rounded-2xl shadow-sm border border-red-100">
        <SectionHeader 
            title="কমিশন (Expenses)" 
            icon={Landmark} 
            total={data.bkashComm + data.nagadComm + data.rocketComm + data.otherComm} 
        />
        <div className="grid grid-cols-2 gap-4">
            <InputGroup label="bKash Comm" value={data.bkashComm} onChange={(v) => updateField('bkashComm', v)} />
            <InputGroup label="Nagad Comm" value={data.nagadComm} onChange={(v) => updateField('nagadComm', v)} />
            <InputGroup label="Rocket Comm" value={data.rocketComm} onChange={(v) => updateField('rocketComm', v)} />
            <InputGroup label="Other Comm" value={data.otherComm} onChange={(v) => updateField('otherComm', v)} />
        </div>
      </div>

       {/* Investment */}
       <div className="bg-white p-5 rounded-2xl shadow-sm border border-red-100">
        <SectionHeader 
            title="ইনভেস্ট (Investment)" 
            icon={Landmark} 
        />
        <InputGroup label="আজকের ইনভেস্ট (Subtracts from Main)" value={data.investment} onChange={(v) => updateField('investment', v)} />
      </div>

      {/* Flexiload */}
      <div className="bg-white p-5 rounded-2xl shadow-sm">
        <SectionHeader 
            title="ফ্লেক্সিলোড ব্যালেন্স" 
            icon={Smartphone} 
            total={data.gpFlexi + data.blFlexi + data.robiFlexi + data.airtelFlexi} 
        />
        <div className="grid grid-cols-2 gap-4">
            <InputGroup label="GP" value={data.gpFlexi} onChange={(v) => updateField('gpFlexi', v)} />
            <InputGroup label="Banglalink" value={data.blFlexi} onChange={(v) => updateField('blFlexi', v)} />
            <InputGroup label="Robi" value={data.robiFlexi} onChange={(v) => updateField('robiFlexi', v)} />
            <InputGroup label="Airtel" value={data.airtelFlexi} onChange={(v) => updateField('airtelFlexi', v)} />
        </div>
      </div>
      
      {/* Save Button */}
      <div className="mt-8 mb-4">
         <button 
           onClick={onSave}
           className="w-full bg-gradient-to-r from-primary-600 to-secondary-600 text-white px-6 py-4 rounded-2xl shadow-lg font-bold flex items-center justify-center gap-3 transform transition hover:scale-[1.02]"
         >
           <Share2 size={24} /> 
           PDF ডাউনলোড / শেয়ার করুন
         </button>
      </div>

    </div>
  );
};

export default CalculatorForm;