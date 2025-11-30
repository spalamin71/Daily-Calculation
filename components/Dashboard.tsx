import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from 'recharts';
import { DailyData } from '../types';
import { TrendingUp, TrendingDown, Banknote, Briefcase } from './Icon';

interface DashboardProps {
  currentData: DailyData;
  calculatedBalance: number;
}

const COLORS = ['#db2777', '#7e22ce', '#0ea5e9', '#f59e0b'];

const Dashboard: React.FC<DashboardProps> = ({ currentData, calculatedBalance }) => {
  
  // Calculate Totals for Charts
  const cashTotal = currentData.handCashMode === 'direct' 
    ? currentData.handCashDirect 
    : currentData.handCashNotes.reduce((acc, curr) => acc + (curr.value * curr.count), 0);
  
  const mfsTotal = currentData.bkashAgent + currentData.nagadAgent + currentData.rocketAgent + currentData.otherAgent +
                   currentData.bkashPersonal + currentData.nagadPersonal + currentData.rocketPersonal;
  
  const bankTotal = currentData.banks.reduce((acc, curr) => acc + curr.amount, 0);
  const flexiTotal = currentData.gpFlexi + currentData.blFlexi + currentData.robiFlexi + currentData.airtelFlexi;
  
  const commissionTotal = currentData.bkashComm + currentData.nagadComm + currentData.rocketComm + currentData.otherComm;

  const pieData = [
    { name: 'নগদ ক্যাশ', value: cashTotal },
    { name: 'মোবাইল ব্যাংকিং', value: mfsTotal },
    { name: 'ব্যাংক', value: bankTotal },
    { name: 'ফ্লেক্সিলোড', value: flexiTotal },
  ].filter(d => d.value > 0);

  const profit = calculatedBalance - currentData.openingBalance;

  return (
    <div className="space-y-6 pb-24 animate-fade-in pt-2">
      
      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-pink-50">
            <div className="flex items-center gap-2 mb-2 text-primary-600">
                <Briefcase size={18} />
                <h3 className="font-semibold text-sm">মোট কমিশন</h3>
            </div>
            <p className="text-xl font-bold text-gray-800">৳ {commissionTotal.toLocaleString()}</p>
        </div>
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-purple-50">
            <div className="flex items-center gap-2 mb-2 text-secondary-600">
                <Banknote size={18} />
                <h3 className="font-semibold text-sm">ফ্লেক্সিলোড</h3>
            </div>
            <p className="text-xl font-bold text-gray-800">৳ {flexiTotal.toLocaleString()}</p>
        </div>
      </div>

      {/* Pie Chart Section */}
      <div className="bg-white p-6 rounded-2xl shadow-sm">
        <h3 className="text-lg font-bold text-gray-800 mb-4 border-b pb-2">অর্থের উৎস বিশ্লেষণ</h3>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value: number) => `৳ ${value.toLocaleString()}`} />
              <Legend verticalAlign="bottom" height={36}/>
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

       {/* Commission Breakdown Bar Chart */}
       <div className="bg-white p-6 rounded-2xl shadow-sm">
        <h3 className="text-lg font-bold text-gray-800 mb-4 border-b pb-2">কমিশন সারসংক্ষেপ</h3>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={[
                { name: 'bKash', amount: currentData.bkashComm },
                { name: 'Nagad', amount: currentData.nagadComm },
                { name: 'Rocket', amount: currentData.rocketComm },
                { name: 'Others', amount: currentData.otherComm },
            ]}>
              <XAxis dataKey="name" fontSize={12} tick={{fill: '#6b7280'}} />
              <YAxis fontSize={12} tick={{fill: '#6b7280'}} />
              <Tooltip formatter={(value: number) => `৳ ${value.toLocaleString()}`} cursor={{fill: '#fce7f3'}} />
              <Bar dataKey="amount" fill="#db2777" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
      
      {/* AI Suggestion */}
      <div className="bg-gradient-to-br from-indigo-50 to-purple-50 p-4 rounded-xl border border-indigo-100 flex items-start gap-3">
        <div className="bg-indigo-100 p-2 rounded-full text-xl">🤖</div>
        <div>
            <p className="text-xs font-bold text-indigo-800 uppercase mb-1">AI পরামর্শ</p>
            <p className="text-sm text-gray-700 leading-relaxed">
               {profit > 0 
                ? "চমৎকার! আজ আপনি লাভের ধারায় আছেন। আপনার মোবাইল ব্যাংকিং লেনদেন আরও বাড়ানোর চেষ্টা করুন।"
                : "আজকের ব্যালেন্স কিছুটা কম মনে হচ্ছে। ব্যয়ের খাতগুলো (Payables) পুনরায় যাচাই করুন এবং কমিশন সেকশন ঠিক আছে কিনা দেখুন।"}
            </p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;