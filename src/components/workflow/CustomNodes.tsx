'use client';

import React from 'react';
import { Handle, Position } from '@xyflow/react';
import { Sparkles, Bell, Zap, Database, ArrowRight, Settings } from 'lucide-react';

const nodeBaseClass = "glass-card p-4 min-w-[200px] border-white/10 shadow-2xl relative overflow-hidden group transition-all duration-300";
const selectedClass = "ring-2 ring-white/50 border-white/40 z-50 scale-105 shadow-[0_0_20px_rgba(255,255,255,0.2)]";

export const TriggerNode = ({ data, selected }: any) => (
  <div className={`${nodeBaseClass} border-amber-500/30 glow-inventory ${selected ? selectedClass : ''}`}>
    <div className="absolute top-0 left-0 w-1 h-full bg-amber-500" />
    <div className="flex items-center gap-3 mb-2">
      <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center">
        <Zap className="w-4 h-4 text-amber-500" />
      </div>
      <div>
        <p className="text-[10px] font-bold text-amber-500 uppercase tracking-widest">Pemicu</p>
        <p className="text-sm font-bold text-white">{data.label}</p>
      </div>
    </div>
    <p className="text-[11px] text-slate-400 leading-relaxed truncate">{data.description}</p>
    <Handle type="source" position={Position.Right} className="!bg-amber-500 !w-2 !h-2 !border-none" />
  </div>
);

export const ActionNode = ({ data, selected }: any) => (
  <div className={`${nodeBaseClass} border-emerald-500/30 glow-finance ${selected ? selectedClass : ''}`}>
    <div className="absolute top-0 left-0 w-1 h-full bg-emerald-500" />
    <Handle type="target" position={Position.Left} className="!bg-emerald-500 !w-2 !h-2 !border-none" />
    <div className="flex items-center gap-3 mb-2">
      <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center">
        <Settings className="w-4 h-4 text-emerald-400" />
      </div>
      <div>
        <p className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest">Aksi</p>
        <p className="text-sm font-bold text-white">{data.label}</p>
      </div>
    </div>
    <p className="text-[11px] text-slate-400 leading-relaxed truncate">{data.description}</p>
    <Handle type="source" position={Position.Right} className="!bg-emerald-500 !w-2 !h-2 !border-none" />
  </div>
);

export const AINode = ({ data, selected }: any) => (
  <div className={`${nodeBaseClass} border-indigo-500/30 glow-sidebar ${selected ? selectedClass : ''}`}>
    <div className="absolute top-0 left-0 w-1 h-full bg-indigo-500" />
    <Handle type="target" position={Position.Left} className="!bg-indigo-500 !w-2 !h-2 !border-none" />
    <div className="flex items-center gap-3 mb-2">
      <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center">
        <Sparkles className="w-4 h-4 text-indigo-400" />
      </div>
      <div>
        <p className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest">Logika AI</p>
        <p className="text-sm font-bold text-white">{data.label}</p>
      </div>
    </div>
    <p className="text-[11px] text-slate-400 leading-relaxed truncate">{data.description}</p>
    <Handle type="source" position={Position.Right} className="!bg-indigo-500 !w-2 !h-2 !border-none" />
  </div>
);
