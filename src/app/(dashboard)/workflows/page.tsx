'use client';

import React, { useState, useCallback, useEffect } from 'react';
import {
  ReactFlow,
  addEdge,
  Background,
  Controls,
  Connection,
  Edge,
  useNodesState,
  useEdgesState,
  Panel,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { 
  Plus, Play, Save, Trash2, ArrowRight, MousePointer2, Loader2, 
  Zap, Sparkles, Settings, Share2, Activity, X 
} from 'lucide-react';
import { TriggerNode, ActionNode, AINode } from '@/components/workflow/CustomNodes';

const API_BASE_URL = 'http://localhost:8000';

const nodeTypes = {
  trigger: TriggerNode,
  action: ActionNode,
  ai: AINode,
};

const initialNodes = [
  {
    id: '1',
    type: 'trigger',
    position: { x: 50, y: 150 },
    data: { label: 'Stok Hampir Habis', description: 'Temicu saat stok produk di bawah batas minimal (Threshold).' },
  },
  {
    id: '2',
    type: 'ai',
    position: { x: 350, y: 100 },
    data: { label: 'Analisis Prediksi AI', description: 'Menghitung sisa waktu distribusi berdasarkan tren permintaan.' },
  },
  {
    id: '3',
    type: 'action',
    position: { x: 650, y: 150 },
    data: { label: 'Buat PO Otomatis', description: 'Membuat draf pesanan pembelian ke pemasok utama.' },
  },
];

const initialEdges: Edge[] = [
  { id: 'e1-2', source: '1', target: '2', animated: true, style: { stroke: '#6366f1' } },
  { id: 'e2-3', source: '2', target: '3', animated: true, style: { stroke: '#10b981' } },
];

export default function WorkflowPage() {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [isTesting, setIsTesting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [workflowName, setWorkflowName] = useState('Alur Kerja Baru');
  const [currentWorkflowId, setCurrentWorkflowId] = useState<number | null>(null);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);

  // Load latest workflow on mount
  useEffect(() => {
    const loadWorkflows = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/workflows`);
        const data = await response.json();
        if (data.length > 0) {
          const latest = data[data.length - 1]; // Get the newest one
          setCurrentWorkflowId(latest.id);
          setWorkflowName(latest.name);
          if (latest.nodes && latest.nodes.length > 0) {
            setNodes(latest.nodes.map((n: any) => ({
              id: n.node_id,
              type: n.type,
              position: n.position,
              data: n.data
            })));
            setEdges(latest.edges.map((e: any) => ({
              id: e.edge_id,
              source: e.source,
              target: e.target,
              animated: !!e.animated,
              style: e.style
            })));
          }
        }
      } catch (error) {
        console.error("Gagal memuat alur kerja:", error);
      }
    };
    loadWorkflows();
  }, [setNodes, setEdges]);

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge({ ...params, animated: true, style: { stroke: '#6366f1' } }, eds)),
    [setEdges]
  );

  const onNodeClick = useCallback((_: any, node: any) => {
    setSelectedNodeId(node.id);
  }, []);

  const onPaneClick = useCallback(() => {
    setSelectedNodeId(null);
  }, []);

  const updateNodeData = (id: string, newData: any) => {
    setNodes((nds) =>
      nds.map((node) => {
        if (node.id === id) {
          return { ...node, data: { ...node.data, ...newData } };
        }
        return node;
      })
    );
  };

  const onRunTest = () => {
    setIsTesting(true);
    setEdges((eds) => eds.map(e => ({ ...e, animated: true, style: { ...e.style, stroke: '#ec4899', strokeWidth: 3 } })));
    
    setTimeout(() => {
      setIsTesting(false);
      setEdges((eds) => eds.map(e => ({ ...e, animated: false, style: { ...e.style, stroke: '#6366f1', strokeWidth: 1 } })));
      alert('Simulasi Berhasil: Alur kerja telah dieksekusi oleh Nexus AI.');
    }, 3000);
  };

  const onSave = async () => {
    setIsSaving(true);
    const workflowData = {
      name: workflowName,
      description: 'Dibuat via Nexus UI',
      is_active: 1,
      nodes: nodes.map(n => ({
        node_id: n.id,
        type: n.type,
        position: n.position,
        data: n.data
      })),
      edges: edges.map(e => ({
        edge_id: e.id,
        source: e.source,
        target: e.target,
        animated: e.animated ? 1 : 0,
        style: e.style
      }))
    };

    try {
      const url = currentWorkflowId 
        ? `${API_BASE_URL}/workflows/${currentWorkflowId}` 
        : `${API_BASE_URL}/workflows`;
      const method = currentWorkflowId ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(workflowData),
      });

      if (response.ok) {
        const saved = await response.json();
        setCurrentWorkflowId(saved.id);
        alert('Berhasil! Alur kerja telah disimpan.');
      }
    } catch (error) {
      console.error("Gagal menyimpan alur kerja:", error);
      alert('Error: Gagal menyambung ke server database.');
    } finally {
      setIsSaving(false);
    }
  };

  const onAddNode = (type: string) => {
    const id = Date.now().toString();
    const newNode = {
      id,
      type,
      position: { x: 100, y: 100 },
      data: { 
        label: type === 'trigger' ? 'Pemicu Baru' : type === 'ai' ? 'Logika AI Baru' : 'Aksi Baru',
        description: 'Buka panel kanan untuk mengedit deskripsi.'
      },
    };
    setNodes((nds) => nds.concat(newNode));
  };

  const currentNode = nodes.find(n => n.id === selectedNodeId);

  return (
    <div className="h-[calc(100vh-80px)] flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-center justify-between glass-card-static px-6 py-4 border-white/5">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-pink-500/10 flex items-center justify-center border border-pink-500/20">
              <Share2 className="w-5 h-5 text-pink-500" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white font-heading tracking-tight">
                Nexus <span className="text-pink-500">Flow</span>
              </h1>
              <input 
                value={workflowName}
                onChange={(e) => setWorkflowName(e.target.value)}
                className="bg-transparent text-[11px] text-slate-500 border-none p-0 focus:ring-0 w-auto min-w-[200px] hover:text-slate-400 transition-colors"
                placeholder="Nama Alur Kerja..."
              />
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => { setNodes([]); setEdges([]); setCurrentWorkflowId(null); setSelectedNodeId(null); }}
            className="h-9 px-4 rounded-lg border border-white/5 text-slate-400 hover:bg-rose-500/10 hover:text-rose-400 transition-all text-xs font-semibold flex items-center gap-2"
          >
            <Trash2 className="w-3.5 h-3.5" /> Reset
          </button>
          <div className="w-px h-6 bg-white/5 mx-1" />
          <button 
            onClick={onRunTest}
            disabled={isTesting}
            className={`h-9 px-4 rounded-lg flex items-center gap-2 text-xs font-bold transition-all shadow-lg ${
              isTesting ? 'bg-slate-800 text-slate-500' : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20'
            }`}
          >
            {isTesting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Play className="w-3.5 h-3.5" />} 
            Simulasi
          </button>
          <button 
            onClick={onSave}
            disabled={isSaving}
            className="h-9 px-5 rounded-lg bg-pink-600 hover:bg-pink-700 text-white text-xs font-bold transition-all shadow-lg shadow-pink-500/20 flex items-center gap-2 disabled:opacity-50"
          >
            {isSaving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />} 
            {currentWorkflowId ? 'Perbarui' : 'Simpan Alur'}
          </button>
        </div>
      </div>

      <div className="flex-1 flex gap-4 min-h-0">
        {/* Left: Toolbox */}
        <div className="w-64 flex flex-col gap-4">
          <div className="glass-card-static p-5 border-white/5">
            <div className="flex items-center gap-2 mb-4">
              <Plus className="w-3.5 h-3.5 text-slate-500" />
              <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Library Node</h3>
            </div>
            <div className="space-y-3">
              {[
                { type: 'trigger', label: 'Pemicu', color: 'amber', icon: Zap, desc: 'Event pemicu sistem' },
                { type: 'ai', label: 'Logika AI', color: 'indigo', icon: Sparkles, desc: 'Pemrosesan cerdas' },
                { type: 'action', label: 'Aksi', color: 'emerald', icon: Settings, desc: 'Eksekusi perintah' },
              ].map((item) => (
                <button 
                  key={item.type}
                  onClick={() => onAddNode(item.type)}
                  className={`w-full p-3 rounded-xl border border-${item.color}-500/10 bg-${item.color}-500/[0.03] hover:bg-${item.color}-500/[0.08] transition-all text-left group`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-lg bg-${item.color}-500/10 flex items-center justify-center group-hover:scale-110 transition-transform`}>
                      <item.icon className={`w-4 h-4 text-${item.color}-400`} />
                    </div>
                    <div>
                      <p className={`text-xs font-bold text-${item.color}-400`}>{item.label}</p>
                      <p className="text-[10px] text-slate-500">{item.desc}</p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="glass-card-static p-5 border-white/5 flex-1 flex flex-col">
            <div className="flex items-center gap-2 mb-4">
              <Activity className="w-3.5 h-3.5 text-slate-500" />
              <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Informasi</h3>
            </div>
            <div className="space-y-4">
              <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5">
                <div className="flex items-center justify-between text-xs mb-2">
                  <span className="text-slate-500">Nodes</span>
                  <span className="text-white font-bold">{nodes.length}</span>
                </div>
                <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                  <div className="h-full bg-pink-500 transition-all duration-500" style={{ width: `${(nodes.length / 10) * 100}%` }} />
                </div>
              </div>
              <p className="text-[10px] text-slate-500 leading-relaxed italic">
                Klik pada node untuk melakukan konfigurasi detail di panel Inspector.
              </p>
            </div>
          </div>
        </div>

        {/* Center: Editor Area */}
        <div className="flex-1 glass-card border-white/5 overflow-hidden relative">
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onNodeClick={onNodeClick}
            onPaneClick={onPaneClick}
            nodeTypes={nodeTypes}
            fitView
          >
            <Background color="#334155" size={1} gap={20} />
            <Controls className="!bg-slate-900 !border-white/10 !fill-white" />
            <Panel position="top-right" className="bg-slate-900/80 backdrop-blur-md p-2 rounded-lg border border-white/10 flex items-center gap-2">
              <div className="flex items-center gap-1.5 px-2">
                <MousePointer2 className="w-3 h-3 text-pink-500" />
                <span className="text-[10px] font-bold text-white uppercase tracking-tighter">Editor Mode</span>
              </div>
            </Panel>
          </ReactFlow>
        </div>

        {/* Right: Inspector Panel */}
        <div className={`w-80 transition-all duration-300 ${selectedNodeId ? 'translate-x-0 opacity-100' : 'translate-x-8 opacity-0 pointer-events-none'}`}>
          {currentNode ? (
            <div className="glass-card-static h-full p-6 border-white/5 flex flex-col">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-pink-500/10 flex items-center justify-center">
                    <Settings className="w-4 h-4 text-pink-500" />
                  </div>
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider">Inspector</h3>
                </div>
                <button onClick={() => setSelectedNodeId(null)} className="text-slate-500 hover:text-white transition-colors">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-6 flex-1 overflow-y-auto pr-2 custom-scrollbar">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block">Label Node</label>
                  <input 
                    value={currentNode.data.label}
                    onChange={(e) => updateNodeData(currentNode.id, { label: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-xl h-12 px-4 text-sm text-white focus:outline-none focus:border-pink-500/50 transition-all font-medium"
                    placeholder="Masukkan label..."
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block">Deskripsi / Logika</label>
                  <textarea 
                    value={currentNode.data.description}
                    onChange={(e) => updateNodeData(currentNode.id, { description: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-xl min-h-[120px] p-4 text-sm text-white focus:outline-none focus:border-pink-500/50 transition-all font-medium resize-none leading-relaxed"
                    placeholder="Tentukan apa yang harus dilakukan node ini..."
                  />
                </div>

                <div className="p-4 rounded-2xl bg-pink-500/5 border border-pink-500/10 space-y-3">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-3.5 h-3.5 text-pink-400" />
                    <span className="text-[10px] font-bold text-pink-400 uppercase tracking-widest">Metadata AI</span>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-[10px]">
                      <span className="text-slate-500">Node ID:</span>
                      <span className="text-slate-400 font-mono">{currentNode.id}</span>
                    </div>
                    <div className="flex justify-between text-[10px]">
                      <span className="text-slate-500">Tipe:</span>
                      <span className="text-pink-400 font-bold uppercase">{currentNode.type}</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="pt-6 border-t border-white/5">
                <p className="text-[10px] text-slate-500 italic leading-relaxed">
                  Perubahan akan diterapkan secara otomatis ke editor flow. Jangan lupa simpan alur kerja secara keseluruhan.
                </p>
              </div>
            </div>
          ) : (
            <div className="glass-card-static h-full p-6 border-white/5 flex flex-col items-center justify-center text-center">
              <div className="w-16 h-16 rounded-3xl bg-white/[0.02] border border-white/5 flex items-center justify-center mb-4">
                <MousePointer2 className="w-6 h-6 text-slate-600" />
              </div>
              <h3 className="text-xs font-bold text-slate-400">Pilih Node</h3>
              <p className="text-[10px] text-slate-600 mt-2 leading-relaxed">
                Pilih salah satu node di kanvas untuk melihat dan mengedit pengaturannya di sini.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
