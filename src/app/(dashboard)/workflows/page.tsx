'use client';

import React, { useState, useCallback, useEffect } from 'react';
import {
  ReactFlow,
  addEdge,
  Background,
  Controls,
  Connection,
  Edge,
  Node,
  NodeMouseHandler,
  useNodesState,
  useEdgesState,
  Panel,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import {
  Plus, Play, Save, Trash2, MousePointer2, Loader2, Upload, Archive,
  Zap, Sparkles, Settings, Share2, Activity, X, Menu, Search
} from 'lucide-react';
import { TriggerNode, ActionNode, AINode } from '@/components/workflow/CustomNodes';

const API_BASE_URL = 'http://localhost:8000';

const nodeTypes = {
  trigger: TriggerNode,
  action: ActionNode,
  ai: AINode,
};

type WorkflowStatus = 'draft' | 'published' | 'archived';

type WorkflowNodeData = {
  label: string;
  description: string;
  config?: Record<string, unknown>;
  [key: string]: unknown;
};

type PersistedWorkflowNode = {
  node_id: string;
  type: string;
  position: { x: number; y: number };
  data: WorkflowNodeData;
  config?: Record<string, unknown>;
};

type PersistedWorkflowEdge = {
  edge_id: string;
  source: string;
  target: string;
  animated: number;
  style?: React.CSSProperties;
};

type PersistedWorkflowVersion = {
  version_number: number;
  is_active: number;
};

type PersistedWorkflow = {
  id: number;
  name: string;
  description?: string;
  status?: WorkflowStatus;
  active_version_id?: number | null;
  updated_at?: string | null;
  versions?: PersistedWorkflowVersion[];
  nodes: PersistedWorkflowNode[];
  edges: PersistedWorkflowEdge[];
};

const initialNodes: Node<WorkflowNodeData>[] = [
  {
    id: '1',
    type: 'trigger',
    position: { x: 50, y: 150 },
    data: {
      label: 'Stok Hampir Habis',
      description: 'Temicu saat stok produk di bawah batas minimal (Threshold).',
      config: { event_name: 'inventory.stock.low' },
    },
  },
  {
    id: '2',
    type: 'ai',
    position: { x: 350, y: 100 },
    data: {
      label: 'Analisis Prediksi AI',
      description: 'Menghitung sisa waktu distribusi berdasarkan tren permintaan.',
      config: { model: 'nexus-forecast-v1' },
    },
  },
  {
    id: '3',
    type: 'action',
    position: { x: 650, y: 150 },
    data: {
      label: 'Buat PO Otomatis',
      description: 'Membuat draf pesanan pembelian ke pemasok utama.',
      config: { action_type: 'purchase_order.create' },
    },
  },
];

const initialEdges: Edge[] = [
  { id: 'e1-2', source: '1', target: '2', animated: true, style: { stroke: '#6366f1' } },
  { id: 'e2-3', source: '2', target: '3', animated: true, style: { stroke: '#10b981' } },
];

export default function WorkflowPage() {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [workflows, setWorkflows] = useState<PersistedWorkflow[]>([]);
  const [showArchived, setShowArchived] = useState(false);
  const [workflowSearch, setWorkflowSearch] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isLoadingWorkflows, setIsLoadingWorkflows] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [isArchiving, setIsArchiving] = useState(false);
  const [isDuplicating, setIsDuplicating] = useState(false);
  const [deletingWorkflowId, setDeletingWorkflowId] = useState<number | null>(null);
  const [workflowName, setWorkflowName] = useState('Alur Kerja Baru');
  const [workflowStatus, setWorkflowStatus] = useState<WorkflowStatus>('draft');
  const [currentWorkflowId, setCurrentWorkflowId] = useState<number | null>(null);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [nodeConfigText, setNodeConfigText] = useState('{}');

  const resetWorkflowState = useCallback(() => {
    setNodes([]);
    setEdges([]);
    setCurrentWorkflowId(null);
    setSelectedNodeId(null);
    setWorkflowName('Alur Kerja Baru');
    setWorkflowStatus('draft');
    setNodeConfigText('{}');
  }, [setNodes, setEdges]);

  const hydrateWorkflow = useCallback((workflow: PersistedWorkflow) => {
    setCurrentWorkflowId(workflow.id);
    setWorkflowName(workflow.name);
    setWorkflowStatus(workflow.status ?? 'draft');
    setSelectedNodeId(null);
    setNodeConfigText('{}');

    setNodes(
      (workflow.nodes ?? []).map((n: PersistedWorkflowNode) => ({
        id: n.node_id,
        type: n.type,
        position: n.position,
        data: { ...n.data, config: n.config ?? n.data?.config ?? {} },
      }))
    );

    setEdges(
      (workflow.edges ?? []).map((e: PersistedWorkflowEdge) => ({
        id: e.edge_id,
        source: e.source,
        target: e.target,
        animated: !!e.animated,
        style: e.style,
      }))
    );
  }, [setNodes, setEdges]);

  const loadWorkflows = useCallback(async (preferredWorkflowId?: number | null) => {
    setIsLoadingWorkflows(true);
    try {
      const response = await fetch(`${API_BASE_URL}/workflows?include_archived=${showArchived ? 'true' : 'false'}`);
      const data: PersistedWorkflow[] = await response.json();
      setWorkflows(data);

      if (data.length === 0) {
        resetWorkflowState();
        return;
      }

      const selected = (preferredWorkflowId ? data.find((item) => item.id === preferredWorkflowId) : undefined) ?? data[0];
      hydrateWorkflow(selected);
    } catch (error) {
      console.error('Gagal memuat alur kerja:', error);
    } finally {
      setIsLoadingWorkflows(false);
    }
  }, [showArchived, hydrateWorkflow, resetWorkflowState]);

  useEffect(() => {
    loadWorkflows(currentWorkflowId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showArchived]);


  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge({ ...params, animated: true, style: { stroke: '#6366f1' } }, eds)),
    [setEdges]
  );

  const onNodeClick = useCallback<NodeMouseHandler<Node>>((_, node) => {
    setSelectedNodeId(node.id);
  }, []);

  const onPaneClick = useCallback(() => {
    setSelectedNodeId(null);
  }, []);

  const updateNodeData = (id: string, newData: Partial<WorkflowNodeData>) => {
    if (workflowStatus === 'published') {
      return;
    }
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
    setEdges((eds) => eds.map((e) => ({ ...e, animated: true, style: { ...e.style, stroke: '#ec4899', strokeWidth: 3 } })));

    setTimeout(() => {
      setIsTesting(false);
      setEdges((eds) => eds.map((e) => ({ ...e, animated: false, style: { ...e.style, stroke: '#6366f1', strokeWidth: 1 } })));
      alert('Simulasi Berhasil: Alur kerja telah dieksekusi oleh Nexus AI.');
    }, 3000);
  };

  const onSave = async () => {
    if (workflowStatus === 'published') {
      alert('Workflow published tidak bisa diedit langsung. Ubah dulu ke draft path.');
      return;
    }

    setIsSaving(true);
    const workflowData = {
      name: workflowName,
      description: 'Dibuat via Nexus UI',
      is_active: 1,
      status: workflowStatus,
      nodes: nodes.map((n) => ({
        node_id: n.id,
        type: n.type,
        position: n.position,
        data: n.data,
        config: (n.data as WorkflowNodeData).config ?? {},
      })),
      edges: edges.map((e) => ({
        edge_id: e.id,
        source: e.source,
        target: e.target,
        animated: e.animated ? 1 : 0,
        style: e.style,
      })),
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
        const saved: PersistedWorkflow = await response.json();
        setCurrentWorkflowId(saved.id);
        setWorkflowStatus(saved.status ?? workflowStatus);
        await loadWorkflows(saved.id);
        alert('Berhasil! Alur kerja telah disimpan.');
      } else {
        const err = await response.json();
        alert(`Gagal simpan: ${err.detail ?? 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Gagal menyimpan alur kerja:', error);
      alert('Error: Gagal menyambung ke server database.');
    } finally {
      setIsSaving(false);
    }
  };

  const onCreateNewWorkflow = () => {
    resetWorkflowState();
  };

  const onResetWorkflowState = () => {
    if (workflowStatus === 'published') {
      alert('Workflow published tidak bisa direset langsung.');
      return;
    }
    const confirmReset = window.confirm('Reset semua state di kanvas ini?');
    if (!confirmReset) {
      return;
    }
    resetWorkflowState();
  };

  const onDeleteSelectedNode = () => {
    if (workflowStatus === 'published') {
      alert('Workflow published tidak bisa diubah langsung.');
      return;
    }

    if (!selectedNodeId) {
      return;
    }

    const confirmDelete = window.confirm('Hapus step yang dipilih ini?');
    if (!confirmDelete) {
      return;
    }

    setNodes((nds) => nds.filter((node) => node.id !== selectedNodeId));
    setEdges((eds) => eds.filter((edge) => edge.source !== selectedNodeId && edge.target !== selectedNodeId));
    setSelectedNodeId(null);
  };

  const onPublishWorkflow = async () => {
    if (!currentWorkflowId) {
      alert('Simpan workflow dulu sebelum publish.');
      return;
    }
    setIsPublishing(true);
    try {
      const response = await fetch(`${API_BASE_URL}/workflows/${currentWorkflowId}/publish`, {
        method: 'POST',
      });
      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.detail ?? 'Gagal publish workflow');
      }
      const published: PersistedWorkflow = await response.json();
      setWorkflowStatus(published.status ?? 'published');
      await loadWorkflows(published.id);
      alert('Workflow berhasil dipublish.');
    } catch (error) {
      console.error('Gagal publish workflow:', error);
      alert('Error: Gagal publish workflow.');
    } finally {
      setIsPublishing(false);
    }
  };

  const onArchiveWorkflow = async () => {
    if (!currentWorkflowId) {
      alert('Workflow belum tersimpan.');
      return;
    }
    setIsArchiving(true);
    try {
      const response = await fetch(`${API_BASE_URL}/workflows/${currentWorkflowId}/archive`, {
        method: 'POST',
      });
      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.detail ?? 'Gagal archive workflow');
      }
      const archived: PersistedWorkflow = await response.json();
      setWorkflowStatus(archived.status ?? 'archived');
      await loadWorkflows(showArchived ? archived.id : null);
      alert('Workflow berhasil diarsipkan.');
    } catch (error) {
      console.error('Gagal archive workflow:', error);
      alert('Error: Gagal archive workflow.');
    } finally {
      setIsArchiving(false);
    }
  };

  const onDuplicateWorkflow = async () => {
    if (!currentWorkflowId) {
      alert('Pilih workflow dulu untuk duplikasi.');
      return;
    }
    setIsDuplicating(true);
    try {
      const response = await fetch(`${API_BASE_URL}/workflows/${currentWorkflowId}/duplicate`, {
        method: 'POST',
      });
      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.detail ?? 'Gagal duplikasi workflow');
      }
      const duplicated: PersistedWorkflow = await response.json();
      await loadWorkflows(duplicated.id);
      alert('Workflow berhasil diduplikasi.');
    } catch (error) {
      console.error('Gagal duplikasi workflow:', error);
      alert('Error: Gagal duplikasi workflow.');
    } finally {
      setIsDuplicating(false);
    }
  };

  const onAddNode = (type: string) => {
    if (workflowStatus === 'published') {
      alert('Workflow published tidak bisa diubah langsung.');
      return;
    }

    const id = Date.now().toString();
    const newNode = {
      id,
      type,
      position: { x: 100, y: 100 },
      data: {
        label: type === 'trigger' ? 'Pemicu Baru' : type === 'ai' ? 'Logika AI Baru' : 'Aksi Baru',
        description: 'Buka panel kanan untuk mengedit deskripsi.',
        config: {},
      },
    };
    setNodes((nds) => nds.concat(newNode));
  };

  const onSelectWorkflow = (workflowId: number) => {
    const target = workflows.find((item) => item.id === workflowId);
    if (!target) {
      return;
    }
    hydrateWorkflow(target);
  };

  const onDeleteWorkflow = async (workflowId: number) => {
    const target = workflows.find((item) => item.id === workflowId);
    const confirmDelete = window.confirm(`Hapus workflow "${target?.name ?? workflowId}"?`);
    if (!confirmDelete) {
      return;
    }

    setDeletingWorkflowId(workflowId);
    try {
      const response = await fetch(`${API_BASE_URL}/workflows/${workflowId}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.detail ?? 'Gagal menghapus workflow');
      }

      const remaining = workflows.filter((item) => item.id !== workflowId);
      const nextSelected = currentWorkflowId === workflowId ? remaining[0]?.id ?? null : currentWorkflowId;
      await loadWorkflows(nextSelected);
      alert('Workflow berhasil dihapus.');
    } catch (error) {
      console.error('Gagal menghapus workflow:', error);
      alert('Error: Gagal menghapus workflow.');
    } finally {
      setDeletingWorkflowId(null);
    }
  };

  const currentNode = nodes.find((n) => n.id === selectedNodeId);
  const isPublished = workflowStatus === 'published';
  const selectedWorkflow = workflows.find((item) => item.id === currentWorkflowId);
  const activeVersion = selectedWorkflow?.versions?.find((version) => version.is_active === 1)?.version_number;
  const filteredWorkflows = workflows.filter((workflow) =>
    workflow.name.toLowerCase().includes(workflowSearch.trim().toLowerCase())
  );

  useEffect(() => {
    if (!currentNode) {
      setNodeConfigText('{}');
      return;
    }
    const config = (currentNode.data as WorkflowNodeData).config ?? {};
    setNodeConfigText(JSON.stringify(config, null, 2));
  }, [currentNode]);

  const onBlurNodeConfig = () => {
    if (!currentNode || isPublished) {
      return;
    }
    try {
      const parsed = JSON.parse(nodeConfigText);
      if (parsed === null || typeof parsed !== 'object' || Array.isArray(parsed)) {
        throw new Error('Config harus object JSON');
      }
      updateNodeData(currentNode.id, { config: parsed as Record<string, unknown> });
    } catch {
      alert('Format config JSON tidak valid.');
    }
  };

  return (
    <div className="h-[calc(100vh-80px)] flex flex-col gap-4">
      <div className="flex items-center justify-between glass-card-static px-6 py-4 border-white/5">
        <div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsSidebarOpen((prev) => !prev)}
              className="w-10 h-10 rounded-xl border border-white/10 bg-white/[0.03] hover:bg-white/[0.08] transition-colors flex items-center justify-center"
              aria-label={isSidebarOpen ? 'Tutup panel kiri' : 'Buka panel kiri'}
              title={isSidebarOpen ? 'Tutup panel kiri' : 'Buka panel kiri'}
            >
              <Menu className="w-5 h-5 text-slate-300" />
            </button>
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
                disabled={isPublished}
                className="bg-transparent text-[11px] text-slate-500 border-none p-0 focus:ring-0 w-auto min-w-[200px] hover:text-slate-400 transition-colors"
                placeholder="Nama Alur Kerja..."
              />
              <p className="text-[10px] uppercase tracking-wider mt-1 text-slate-500">
                Status: <span className={workflowStatus === 'published' ? 'text-emerald-400' : workflowStatus === 'archived' ? 'text-amber-400' : 'text-cyan-400'}>{workflowStatus}</span>
                {activeVersion ? <span className="ml-2">| Versi Aktif: <span className="text-white">v{activeVersion}</span></span> : null}
              </p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={onCreateNewWorkflow}
            className="h-9 px-4 rounded-lg border border-cyan-500/20 text-cyan-300 hover:bg-cyan-500/10 transition-all text-xs font-semibold flex items-center gap-2"
          >
            <Plus className="w-3.5 h-3.5" />
            Workflow Baru
          </button>
          <button
            onClick={onDuplicateWorkflow}
            disabled={isDuplicating || !currentWorkflowId}
            className="h-9 px-4 rounded-lg border border-violet-500/20 text-violet-300 hover:bg-violet-500/10 transition-all text-xs font-semibold flex items-center gap-2 disabled:opacity-50"
          >
            {isDuplicating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Share2 className="w-3.5 h-3.5" />}
            Duplikasi
          </button>
          <button
            onClick={onResetWorkflowState}
            disabled={isPublished}
            className="h-9 px-4 rounded-lg border border-white/5 text-slate-400 hover:bg-rose-500/10 hover:text-rose-400 transition-all text-xs font-semibold flex items-center gap-2"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Reset
          </button>
          <button
            onClick={onPublishWorkflow}
            disabled={isPublishing || !currentWorkflowId}
            className="h-9 px-4 rounded-lg border border-emerald-500/20 text-emerald-300 hover:bg-emerald-500/10 transition-all text-xs font-semibold flex items-center gap-2 disabled:opacity-50"
          >
            {isPublishing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />}
            Publish
          </button>
          <button
            onClick={onArchiveWorkflow}
            disabled={isArchiving || !currentWorkflowId}
            className="h-9 px-4 rounded-lg border border-amber-500/20 text-amber-300 hover:bg-amber-500/10 transition-all text-xs font-semibold flex items-center gap-2 disabled:opacity-50"
          >
            {isArchiving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Archive className="w-3.5 h-3.5" />}
            Archive
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
            disabled={isSaving || isPublished}
            className="h-9 px-5 rounded-lg bg-pink-600 hover:bg-pink-700 text-white text-xs font-bold transition-all shadow-lg shadow-pink-500/20 flex items-center gap-2 disabled:opacity-50"
          >
            {isSaving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
            {currentWorkflowId ? 'Perbarui' : 'Simpan Alur'}
          </button>
        </div>
      </div>

      <div className="flex-1 flex gap-4 min-h-0">
        {isSidebarOpen ? (
        <div className="w-80 flex flex-col gap-4">
          <div className="glass-card-static p-5 border-white/5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Workflow List</h3>
              <label className="text-[10px] text-slate-500 flex items-center gap-1.5">
                <input
                  type="checkbox"
                  checked={showArchived}
                  onChange={(e) => setShowArchived(e.target.checked)}
                />
                Arsip
              </label>
            </div>
            <div className="relative mb-3">
              <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                value={workflowSearch}
                onChange={(e) => setWorkflowSearch(e.target.value)}
                className="w-full h-9 rounded-lg bg-white/[0.03] border border-white/10 pl-9 pr-3 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-pink-500/50"
                placeholder="Cari workflow..."
              />
            </div>
            <div className="max-h-64 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
              {isLoadingWorkflows ? (
                <div className="text-[11px] text-slate-500 flex items-center gap-2">
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  Memuat workflow...
                </div>
              ) : filteredWorkflows.length === 0 ? (
                <p className="text-[11px] text-slate-500">Belum ada workflow tersimpan.</p>
              ) : filteredWorkflows.map((workflow) => {
                const versionNumber = workflow.versions?.find((item) => item.is_active === 1)?.version_number;
                const statusColor = workflow.status === 'published'
                  ? 'text-emerald-300'
                  : workflow.status === 'archived'
                    ? 'text-amber-300'
                    : 'text-cyan-300';

                return (
                  <div
                    key={workflow.id}
                    className={`w-full p-3 rounded-xl border transition-all ${
                      currentWorkflowId === workflow.id
                        ? 'border-pink-500/40 bg-pink-500/10'
                        : 'border-white/5 bg-white/[0.02] hover:bg-white/[0.05]'
                    }`}
                  >
                    <button
                      onClick={() => onSelectWorkflow(workflow.id)}
                      className="w-full text-left"
                    >
                      <p className="text-xs font-semibold text-white truncate">{workflow.name}</p>
                      <p className={`text-[10px] uppercase mt-1 ${statusColor}`}>{workflow.status ?? 'draft'}</p>
                      <p className="text-[10px] text-slate-500 mt-1">
                        v{versionNumber ?? 0} • {workflow.updated_at ? new Date(workflow.updated_at).toLocaleString() : 'belum pernah update'}
                      </p>
                    </button>
                    <div className="mt-2 pt-2 border-t border-white/5 flex justify-end">
                      <button
                        onClick={() => onDeleteWorkflow(workflow.id)}
                        disabled={deletingWorkflowId === workflow.id}
                        className="h-7 px-2.5 rounded-md border border-rose-500/20 bg-rose-500/10 text-rose-300 hover:bg-rose-500/20 text-[10px] font-semibold flex items-center gap-1.5 disabled:opacity-50"
                      >
                        {deletingWorkflowId === workflow.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <Trash2 className="w-3 h-3" />}
                        Hapus
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

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
        ) : null}

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
                    value={(currentNode.data as WorkflowNodeData).label ?? ''}
                    onChange={(e) => updateNodeData(currentNode.id, { label: e.target.value })}
                    disabled={isPublished}
                    className="w-full bg-white/5 border border-white/10 rounded-xl h-12 px-4 text-sm text-white focus:outline-none focus:border-pink-500/50 transition-all font-medium"
                    placeholder="Masukkan label..."
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block">Deskripsi / Logika</label>
                  <textarea
                    value={(currentNode.data as WorkflowNodeData).description ?? ''}
                    onChange={(e) => updateNodeData(currentNode.id, { description: e.target.value })}
                    disabled={isPublished}
                    className="w-full bg-white/5 border border-white/10 rounded-xl min-h-[120px] p-4 text-sm text-white focus:outline-none focus:border-pink-500/50 transition-all font-medium resize-none leading-relaxed"
                    placeholder="Tentukan apa yang harus dilakukan node ini..."
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block">Config (JSON)</label>
                  <textarea
                    value={nodeConfigText}
                    onChange={(e) => setNodeConfigText(e.target.value)}
                    onBlur={onBlurNodeConfig}
                    disabled={isPublished}
                    className="w-full bg-white/5 border border-white/10 rounded-xl min-h-[140px] p-4 text-xs text-white focus:outline-none focus:border-pink-500/50 transition-all font-mono resize-none leading-relaxed"
                    placeholder='{"key":"value"}'
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
                <button
                  onClick={onDeleteSelectedNode}
                  disabled={isPublished}
                  className="w-full h-10 rounded-xl border border-rose-500/20 bg-rose-500/10 text-rose-300 hover:bg-rose-500/20 transition-all text-xs font-bold flex items-center justify-center gap-2 mb-3"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Hapus Step Ini
                </button>
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
