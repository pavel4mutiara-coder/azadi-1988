
import React from 'react';
import { Donation, OrganizationSettings } from '../types';
import { Heart, Printer, ArrowLeft } from 'lucide-react';

interface Props {
  donation: Donation;
  settings: OrganizationSettings;
  onBack: () => void;
}

export const ReceiptView: React.FC<Props> = ({ donation, settings, onBack }) => {
  return (
    <div className="min-h-screen bg-slate-100 p-4 md:p-10 animate-in fade-in duration-500">
      <div className="max-w-3xl mx-auto space-y-6">
        <button onClick={onBack} className="no-print flex items-center gap-2 text-slate-600 hover:text-emerald-600 font-bold transition-colors">
          <ArrowLeft size={20} /> Back to Donations
        </button>

        <div className="bg-white p-10 md:p-16 shadow-2xl relative border-t-[12px] border-emerald-700">
          <div className="absolute top-0 right-0 p-8 no-print">
            <button onClick={() => window.print()} className="bg-slate-900 text-white p-4 rounded-2xl shadow-xl hover:scale-105 transition-all">
              <Printer size={24} />
            </button>
          </div>

          <div className="flex flex-col items-center text-center gap-6 border-b-2 border-slate-100 pb-10">
            {/* Circular Logo Seal for Receipt */}
            <div className="w-28 h-28 relative rounded-full border-4 border-emerald-800 bg-white p-1.5 shadow-md flex items-center justify-center overflow-hidden">
               <div className="absolute inset-0 border-4 border-emerald-50 rounded-full"></div>
               <img src={settings.logo} className="w-full h-full object-contain relative z-10" alt="Logo" />
            </div>
            
            <div>
              <h1 className="text-3xl font-black text-emerald-900 leading-tight">{settings.nameBn}</h1>
              <h2 className="text-xl font-black text-emerald-800 uppercase tracking-tighter">{settings.nameEn}</h2>
              <p className="text-xs font-bold text-slate-500 mt-2 uppercase tracking-widest">{settings.sloganEn}</p>
            </div>
            <div className="text-[10px] font-bold text-slate-500 space-y-1">
              <p>{settings.addressEn}</p>
              <p>Phone: {settings.phone} | Email: {settings.email}</p>
            </div>
          </div>

          <div className="py-12 space-y-10">
            <div className="flex justify-between items-center bg-slate-50 p-6 rounded-3xl border border-slate-100">
              <div className="space-y-1">
                <div className="text-[10px] font-black uppercase tracking-widest text-slate-400">Receipt No</div>
                <div className="font-mono font-bold text-slate-900">ASW-REC-{donation.id.slice(-6).toUpperCase()}</div>
              </div>
              <div className="text-right space-y-1">
                <div className="text-[10px] font-black uppercase tracking-widest text-slate-400">Date</div>
                <div className="font-bold text-slate-900">{new Date(donation.date).toLocaleDateString()}</div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="flex justify-between items-end border-b border-slate-100 pb-4">
                <div className="text-slate-500 font-medium">Received from:</div>
                <div className="text-xl font-black text-slate-900">{donation.isAnonymous ? 'Anonymous Donor' : donation.donorName}</div>
              </div>
              <div className="flex justify-between items-end border-b border-slate-100 pb-4">
                <div className="text-slate-500 font-medium">Donation Purpose:</div>
                <div className="font-bold text-slate-900">{donation.purpose}</div>
              </div>
              <div className="flex justify-between items-end border-b border-slate-100 pb-4">
                <div className="text-slate-500 font-medium">Payment Method & TXID:</div>
                <div className="font-mono font-bold text-slate-900 uppercase">{donation.paymentMethod} - {donation.transactionId}</div>
              </div>
            </div>

            <div className="flex justify-center py-6">
               <div className="bg-emerald-50 px-10 py-5 rounded-[2rem] border-2 border-emerald-100 flex flex-col items-center">
                  <div className="text-xs font-black uppercase tracking-widest text-emerald-600 mb-1">Amount Received</div>
                  <div className="text-5xl font-black text-emerald-700 font-mono">৳{donation.amount.toLocaleString()}</div>
               </div>
            </div>
          </div>

          <div className="flex justify-between items-end pt-12">
            <div className="official-stamp">
               <span className="leading-tight text-[10px] font-black">Official Charity Seal<br/>Sylhet, Bangladesh</span>
            </div>
            <div className="text-center w-48 space-y-2">
              <div className="h-px bg-slate-900 w-full"></div>
              <div className="text-xs font-black uppercase tracking-tighter">Authorized Signature</div>
              <div className="text-[9px] font-bold text-emerald-700">Treasurer / President</div>
            </div>
          </div>

          <div className="mt-16 text-center space-y-4">
            <div className="inline-flex items-center justify-center gap-2 text-emerald-600 bg-emerald-50 px-6 py-2 rounded-full font-black text-xs uppercase tracking-widest">
              <Heart size={16} fill="currentColor" />
              May Allah reward your kindness
            </div>
            <p className="text-[10px] text-slate-400 font-medium">
              This is a computer-generated receipt. Azadi Social Welfare Organization is a non-profitable community-based social welfare organization established on 10 June 1988.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
