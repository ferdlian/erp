'use client';

import { useState, useRef, useEffect } from 'react';
import { X, Send, Sparkles, Bot, User } from 'lucide-react';
import { chatResponses } from '@/lib/mock-data/ai-insights';
import { useERPStore } from '@/lib/store';

interface ChatMessage {
  id: string;
  role: 'user' | 'ai';
  content: string;
  timestamp: string;
}

interface AIChatProps {
  isOpen: boolean;
  onClose: () => void;
}

function formatCurrency(num: number): string {
  if (num >= 1000000000) return `Rp${(num / 1000000000).toFixed(1)} Miliar`;
  if (num >= 1000000) return `Rp${(num / 1000000).toFixed(0)} Juta`;
  return `Rp${num.toLocaleString('id-ID')}`;
}

export default function AIChat({ isOpen, onClose }: AIChatProps) {
  const { finance, inventory, hr, crm, supplyChain, metrics } = useERPStore();
  
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'ai',
      content: 'Halo! Saya adalah **Otak AI NexusERP** 🧠\n\nSaya dapat menganalisis data di semua modul bisnis Anda dan memberikan wawasan waktu nyata. Coba tanyakan:\n\n• "Berapa pendapatan kami kuartal ini?"\n• "Bagaimana kondisi inventaris kita?"\n• "Kesepakatan mana yang butuh perhatian?"\n• "Apa yang butuh perhatian saya hari ini?"',
      timestamp: new Date().toISOString(),
    },
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [isOpen]);

  const getAIResponse = (query: string): string => {
    const q = query.toLowerCase();
    
    if (q.includes('pendapatan') || q.includes('keuangan') || q.includes('duit') || q.includes('untung') || q.includes('revenue')) {
      return `Total pendapatan saat ini adalah **${formatCurrency(finance.totalRevenue)}**, dengan laba bersih sebesar **${formatCurrency(finance.netProfit)}**. Performa keuangan kita berada di level **${finance.healthScore}/100**.`;
    }
    
    if (q.includes('inventaris') || q.includes('stok') || q.includes('produk') || q.includes('gudang') || q.includes('inventory')) {
      return `Saat ini terdapat **${inventory.totalProducts} produk** dengan total nilai aset **${formatCurrency(inventory.totalValue)}**. ⚠️ Ada **${inventory.lowStockCount} produk** dengan stok menipis dan **${inventory.outOfStockCount} produk** habis total.`;
    }
    
    if (q.includes('karyawan') || q.includes('tim') || q.includes('sdm') || q.includes('performa') || q.includes('rekrut') || q.includes('hr')) {
      return `Kita memiliki **${hr.totalEmployees} karyawan aktif**. Skor performa rata-rata tim adalah **${hr.avgPerformance}/100**. Ada **${hr.openPositions} posisi terbuka** yang sedang diproses oleh tim rekrutmen.`;
    }
    
    if (q.includes('kesepakatan') || q.includes('penjualan') || q.includes('crm') || q.includes('pipeline') || q.includes('pelanggan') || q.includes('deal')) {
      return `Pipeline penjualan saat ini bernilai **${formatCurrency(crm.pipelineValue)}** dari **${crm.totalDeals} kesepakatan aktif**. Tingkat konversi kita berada di angka **${crm.conversionRate}%**.`;
    }
    
    if (q.includes('pemasok') || q.includes('suplai') || q.includes('kirim') || q.includes('pesanan') || q.includes('logistik') || q.includes('supplier')) {
      return `Kita bekerja dengan **${supplyChain.totalSuppliers} pemasok aktif**. Tingkat pengiriman tepat waktu saat ini adalah **${supplyChain.onTimeRate}%**. Ada **${supplyChain.activeOrders} pesanan (PO)** yang sedang berjalan.`;
    }
    
    if (q.includes('perhatian') || q.includes('prioritas') || q.includes('darurat') || q.includes('penting') || q.includes('hari ini') || q.includes('attention')) {
      return `🔴 **Item prioritas hari ini:**\n\n1. **Inventaris**: ${inventory.lowStockCount} item stok kritis\n2. **Keuangan**: Kesehatan sistem ${finance.healthScore}/100\n3. **CRM**: ${crm.totalDeals} kesepakatan perlu tindak lanjut\n4. **SDM**: ${hr.openPositions} posisi mendesak di departemen IT\n\nKesehatan ekosistem secara keseluruhan: **${metrics.overallHealth}/100**.`;
    }

    return chatResponses['default'].answer;
  };

  const handleSend = () => {
    if (!input.trim()) return;

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: input,
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);

    setTimeout(() => {
      const aiResponse: ChatMessage = {
        id: `ai-${Date.now()}`,
        role: 'ai',
        content: getAIResponse(userMessage.content),
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, aiResponse]);
      setIsTyping(false);
    }, 800 + Math.random() * 1200);
  };

  const renderMarkdown = (text: string) => {
    return text
      .replace(/\*\*(.*?)\*\*/g, '<strong class="text-white font-semibold">$1</strong>')
      .replace(/\n/g, '<br/>');
  };

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/40 z-40 backdrop-blur-sm" onClick={onClose} />
      )}

      {/* Panel */}
      <div
        className={`fixed top-0 right-0 h-full w-full max-w-md bg-bg-secondary/95 backdrop-blur-xl border-l border-white/5 z-50 flex flex-col transition-transform duration-300 ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 h-16 border-b border-white/5">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white">Otak AI</h3>
              <p className="text-[10px] text-green-400 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-green-400 inline-block animate-pulse" />
                Online — menganalisis semua modul
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg hover:bg-white/5 flex items-center justify-center text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
          {messages.map((msg) => (
            <div key={msg.id} className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
              <div
                className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 ${
                  msg.role === 'ai'
                    ? 'bg-gradient-to-br from-indigo-500 to-purple-600'
                    : 'bg-slate-600'
                }`}
              >
                {msg.role === 'ai' ? (
                  <Bot className="w-4 h-4 text-white" />
                ) : (
                  <User className="w-4 h-4 text-white" />
                )}
              </div>
              <div
                className={`max-w-[80%] ${msg.role === 'ai' ? 'ai-chat-bubble' : 'ai-chat-user'}`}
              >
                <div
                  className="text-sm text-slate-300 leading-relaxed"
                  dangerouslySetInnerHTML={{ __html: renderMarkdown(msg.content) }}
                />
              </div>
            </div>
          ))}

          {isTyping && (
            <div className="flex gap-3">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center flex-shrink-0">
                <Bot className="w-4 h-4 text-white" />
              </div>
              <div className="ai-chat-bubble">
                <div className="flex gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-indigo-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                  <div className="w-2 h-2 rounded-full bg-indigo-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                  <div className="w-2 h-2 rounded-full bg-indigo-400 animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="p-4 border-t border-white/5">
          <div className="flex items-center gap-2">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Tanya Otak AI apa saja..."
              className="flex-1 h-10 px-4 rounded-xl bg-white/5 border border-white/10 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500/30 transition-all"
            />
            <button
              onClick={handleSend}
              disabled={!input.trim()}
              className="w-10 h-10 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 flex items-center justify-center text-white hover:shadow-lg hover:shadow-indigo-500/25 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
          <p className="text-[10px] text-slate-600 text-center mt-2">
            Otak AI menganalisis data di semua modul secara waktu nyata
          </p>
        </div>
      </div>
    </>
  );
}
