// components/HistoryCard.tsx
"use client";

import React from "react";

interface Highlight { label: string; color: string; }
export interface HistoryRecord { id:string; analysisType:string; question:string; filename:string; date:string; confidence:number; answer:string; highlights:Highlight[]; model:string; processingTime:string; }
interface Props { record: HistoryRecord; onDelete:(id:string)=>void; onRerun:()=>void; onViewDetails:(rec:HistoryRecord)=>void; }
export default function HistoryCard({record,onDelete,onRerun,onViewDetails}:Props){
  const placeholderImg="https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=400&q=80";
  return(
    <div className="bg-white rounded-lg shadow-md overflow-hidden flex flex-col h-full">
      <img src={placeholderImg} alt="thumbnail" className="h-40 w-full object-cover" />
      <div className="p-4 flex flex-col flex-1">
        <h3 className="text-sm font-medium text-[#111827]">{record.analysisType}</h3>
        <p className="mt-1 text-xs text-[#6B7280] line-clamp-2">{record.question}</p>
        <p className="mt-1 text-xs text-[#6B7280]">{record.filename}</p>
        <p className="mt-1 text-xs text-[#6B7280]">{record.date}</p>
        <div className="mt-2">
          <div className="text-xs text-[#6B7280] mb-1">Confidence: {record.confidence}%</div>
          <div className="w-full bg-[#E5E7EB] rounded-full h-2">
            <div className="bg-[#7C3AED] h-2 rounded-full" style={{width:`${record.confidence}%`}}></div>
          </div>
        </div>
        <div className="mt-2 flex flex-wrap gap-1">
          {record.highlights.map(hl=>(
            <span key={hl.label} className="flex items-center text-xs px-2 py-0.5 rounded-full bg-gray-100">
              <span className="inline-block w-2 h-2 rounded-full mr-1" style={{backgroundColor:hl.color}}></span>{hl.label}
            </span>
          ))}
        </div>
        <div className="mt-4 flex space-x-2">
          <button onClick={()=>onViewDetails(record)} className="flex-1 text-xs bg-[#7C3AED] text-white py-1 rounded">View Details</button>
          <button onClick={onRerun} className="flex-1 text-xs bg-gray-200 text-[#111827] py-1 rounded">Re‑run Analysis</button>
          <button onClick={()=>onDelete(record.id)} className="flex-1 text-xs bg-red-500 text-white py-1 rounded">Delete</button>
        </div>
      </div>
    </div>
  );
}
