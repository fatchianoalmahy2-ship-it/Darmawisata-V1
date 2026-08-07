'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { dbService, SyncTask } from '@/services/dbService';
import {
  Database,
  Wifi,
  WifiOff,
  RefreshCw,
  Plus,
  Trash2,
  CheckCircle,
  AlertCircle,
  Clock,
  Settings,
  Activity,
  List,
  Terminal,
  Zap,
} from 'lucide-react';

export const QueryQueueMonitor: React.FC = () => {
  const [queue, setQueue] = useState<SyncTask[]>([]);
  const [isSyncing, setIsSyncing] = useState(false);
  
  const [simulatedOffline, setSimulatedOffline] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return !!(window as any).__forceOffline;
    }
    return false;
  });

  const [logs, setLogs] = useState<Array<{ id: string; time: string; type: 'info' | 'success' | 'error'; message: string }>>(() => {
    if (typeof window !== 'undefined') {
      const storedLogs = localStorage.getItem('query_monitor_logs');
      if (storedLogs) {
        try {
          return JSON.parse(storedLogs);
        } catch (_) {}
      }
    }
    return [];
  });

  const [stats, setStats] = useState(() => {
    if (typeof window !== 'undefined') {
      const storedStats = localStorage.getItem('query_monitor_stats');
      if (storedStats) {
        try {
          return JSON.parse(storedStats);
        } catch (_) {}
      }
    }
    return {
      totalProcessed: 0,
      successCount: 0,
      failCount: 0,
    };
  });

  const addLog = useCallback((type: 'info' | 'success' | 'error', message: string) => {
    const newLog = {
      id: `log_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      time: new Date().toLocaleTimeString(),
      type,
      message,
    };
    setLogs((prev) => {
      const updated = [newLog, ...prev].slice(0, 50); // Keep last 50 logs
      if (typeof window !== 'undefined') {
        localStorage.setItem('query_monitor_logs', JSON.stringify(updated));
      }
      return updated;
    });
  }, []);

  const fetchQueue = useCallback(async () => {
    try {
      const currentQueue = await dbService.getSyncQueue();
      setQueue(currentQueue);
    } catch (e) {
      console.error('Failed to fetch sync queue:', e);
    }
  }, []);

  // Poll queue and check status periodically without calling setState inside effect body synchronously
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchQueue();
    }, 10);
    const interval = setInterval(fetchQueue, 2000);
    return () => {
      clearTimeout(timeoutId);
      clearInterval(interval);
    };
  }, [fetchQueue]);

  const toggleOfflineMode = () => {
    const nextVal = !simulatedOffline;
    setSimulatedOffline(nextVal);
    if (typeof window !== 'undefined') {
      (window as any).__forceOffline = nextVal;
    }
    addLog('info', `Mode offline simulasi ${nextVal ? 'DIAKTIFKAN' : 'DINAKTIFKAN'}.`);
  };

  const handleForceSync = async () => {
    if (isSyncing) return;
    
    if (simulatedOffline) {
      addLog('error', 'Gagal memulai sinkronisasi: Matikan mode offline simulasi terlebih dahulu.');
      return;
    }

    setIsSyncing(true);
    addLog('info', 'Memulai sinkronisasi antrian query ke Supabase...');

    const startQueue = await dbService.getSyncQueue();
    if (startQueue.length === 0) {
      addLog('info', 'Antrian kosong. Tidak ada query yang perlu disinkronkan.');
      setIsSyncing(false);
      return;
    }

    let success = 0;
    let failed = 0;

    for (const task of startQueue) {
      try {
        addLog('info', `Memproses query: [${task.action.toUpperCase()}] ID: ${task.id}...`);
        await dbService.executeTask(task);
        await dbService.removeTask(task.id);
        addLog('success', `Sukses sinkronisasi query: [${task.action.toUpperCase()}] ID: ${task.id}`);
        success++;
      } catch (err: any) {
        addLog('error', `Gagal sinkronisasi query [${task.action.toUpperCase()}]: ${err?.message || err}`);
        failed++;
        break; // Stop syncing to maintain write order consistency
      }
    }

    const newStats = {
      totalProcessed: stats.totalProcessed + success + failed,
      successCount: stats.successCount + success,
      failCount: stats.failCount + failed,
    };
    setStats(newStats);
    if (typeof window !== 'undefined') {
      localStorage.setItem('query_monitor_stats', JSON.stringify(newStats));
    }

    setIsSyncing(false);
    await fetchQueue();
    addLog('success', `Sinkronisasi selesai. Berhasil: ${success}, Gagal: ${failed}.`);
  };

  const handleAddTestTask = async (action: 'save_student' | 'save_settings' | 'delete_student') => {
    let payload: any = {};
    if (action === 'save_student') {
      payload = {
        id: `dummy_${Date.now().toString().slice(-4)}`,
        nis: `123456`,
        name: `Siswa Simulasi ${Date.now().toString().slice(-4)}`,
        className: 'X MIPA 1',
        gender: 'LAKI-LAKI',
        isRegistered: false,
        updatedAt: new Date().toISOString(),
      };
    } else if (action === 'save_settings') {
      payload = {
        appName: `Darmawisata ${Date.now().toString().slice(-4)}`,
        schoolName: 'SMA Mock School',
      };
    } else {
      payload = `dummy_${Date.now().toString().slice(-4)}`;
    }

    addLog('info', `Menambahkan query simulasi ke antrian: [${action.toUpperCase()}]`);
    await dbService.enqueueTask(action, payload);
    await fetchQueue();

    // If simulated offline is active, it will stay in the queue.
    // If not, triggerSync() inside enqueueTask would have automatically run it.
    // We fetch again to see if it remains.
    setTimeout(async () => {
      await fetchQueue();
    }, 500);
  };

  const handleSimulateConcurrentAngket = async (count: number) => {
    const startTime = performance.now();
    addLog('info', `🚀 Memulai SIMULASI BENCHMARK: ${count} siswa mengirim data angket secara SERENTAK (Concurrent)...`);

    const destinations = ['YOGYAKARTA', 'BANDUNG', 'BALI', 'JAKARTA'];
    const waves = [1, 2];
    const sizes = ['S', 'M', 'L', 'XL', 'XXL'];

    const mockStudents = Array.from({ length: count }, (_, i) => {
      const timestamp = Date.now();
      const randomNis = Math.floor(100000 + Math.random() * 900000).toString();
      return {
        id: `sim_${timestamp}_${i}_${Math.random().toString(36).substring(2, 6)}`,
        nis: randomNis,
        name: `Siswa Serentak #${i + 1}`,
        className: `X MIPA ${(i % 5) + 1}`,
        gender: i % 2 === 0 ? 'LAKI-LAKI' : 'PEREMPUAN',
        isRegistered: true,
        destination: destinations[i % destinations.length],
        wave: waves[i % waves.length],
        tShirtSize: sizes[i % sizes.length],
        tShirtDesign: 'Desain A',
        parentName: `Orang Tua Siswa #${i + 1}`,
        parentPhone: `081234567${(100 + i).toString().slice(-3)}`,
        studentPhone: `089876543${(100 + i).toString().slice(-3)}`,
        busNumber: (i % 4) + 1,
        seatNumber: (i % 40) + 1,
        roomNumber: (i % 20) + 101,
        updatedAt: new Date().toISOString(),
      };
    });

    try {
      // Execute all submissions concurrently using Promise.all
      const submissionPromises = mockStudents.map(async (student) => {
        // Save to local IndexedDB instantly
        await dbService.putSingleStudent(student);
        // Queue task for background/realtime database sync
        await dbService.enqueueTask('save_student', student);
      });

      await Promise.all(submissionPromises);
      const endTime = performance.now();
      const durationMs = Math.round(endTime - startTime);

      addLog(
        'success',
        `✅ BANJIR CONCURRENCY SELESAI! ${count} angket diproses dalam ${durationMs} ms (Rata-rata: ${(durationMs / count).toFixed(1)} ms/siswa). Mode Online: ${!simulatedOffline}`
      );

      await fetchQueue();
    } catch (err: any) {
      addLog('error', `❌ Gagal dalam simulasi concurrency: ${err?.message || err}`);
    }
  };

  const handleClearQueue = async () => {
    if (!window.confirm('Apakah Anda yakin ingin mengosongkan seluruh antrian query offline tanpa sinkronisasi?')) {
      return;
    }

    try {
      const currentQueue = await dbService.getSyncQueue();
      for (const task of currentQueue) {
        await dbService.removeTask(task.id);
      }
      addLog('info', 'Antrian query berhasil dikosongkan secara manual.');
      await fetchQueue();
    } catch (e: any) {
      addLog('error', `Gagal mengosongkan antrian: ${e?.message || e}`);
    }
  };

  const handleClearLogs = () => {
    setLogs([]);
    if (typeof window !== 'undefined') {
      localStorage.removeItem('query_monitor_logs');
    }
    addLog('info', 'Log konsol monitor dibersihkan.');
  };

  const handleResetStats = () => {
    const initialStats = { totalProcessed: 0, successCount: 0, failCount: 0 };
    setStats(initialStats);
    if (typeof window !== 'undefined') {
      localStorage.setItem('query_monitor_stats', JSON.stringify(initialStats));
    }
    addLog('info', 'Statistik query direset.');
  };

  const formatPayload = (payload: any) => {
    if (!payload) return 'null';
    if (typeof payload === 'string') return payload;
    return JSON.stringify(payload).substring(0, 80) + (JSON.stringify(payload).length > 80 ? '...' : '');
  };

  return (
    <div className="space-y-6" id="query-queue-monitor-root">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Connection Status Card */}
        <div className="p-5 bg-white border border-slate-200 rounded-2xl shadow-xs flex items-center gap-4">
          <div className={`p-3 rounded-xl ${simulatedOffline ? 'bg-red-50 text-red-600' : 'bg-emerald-50 text-emerald-600'}`}>
            {simulatedOffline ? <WifiOff className="w-6 h-6 animate-pulse" /> : <Wifi className="w-6 h-6" />}
          </div>
          <div>
            <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">Status Koneksi</p>
            <p className="text-lg font-black text-slate-800">
              {simulatedOffline ? 'Offline (Simulasi)' : 'Online (Supabase)'}
            </p>
            <button
              onClick={toggleOfflineMode}
              className={`mt-1 text-[11px] font-extrabold px-2.5 py-1 rounded-lg border transition-colors cursor-pointer ${
                simulatedOffline
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100'
                  : 'bg-red-50 border-red-200 text-red-700 hover:bg-red-100'
              }`}
            >
              {simulatedOffline ? 'Hubungkan Kembali' : 'Putuskan Koneksi (Simulasi)'}
            </button>
          </div>
        </div>

        {/* Sync Queue Card */}
        <div className="p-5 bg-white border border-slate-200 rounded-2xl shadow-xs flex items-center gap-4">
          <div className={`p-3 rounded-xl ${queue.length > 0 ? 'bg-amber-50 text-amber-600' : 'bg-sky-50 text-sky-600'}`}>
            <Database className={`w-6 h-6 ${queue.length > 0 ? 'animate-bounce' : ''}`} />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">Antrian Pending</p>
            <p className="text-2xl font-black text-slate-800">{queue.length} Query</p>
            <p className="text-xs text-slate-400 mt-0.5">Menunggu sinkronisasi</p>
          </div>
        </div>

        {/* Stats Success */}
        <div className="p-5 bg-white border border-slate-200 rounded-2xl shadow-xs flex items-center gap-4">
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
            <CheckCircle className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">Sukses Sinkron</p>
            <p className="text-2xl font-black text-slate-800">{stats.successCount}</p>
            <p className="text-xs text-slate-400 mt-0.5">Total transaksi berhasil</p>
          </div>
        </div>

        {/* Stats Fail */}
        <div className="p-5 bg-white border border-slate-200 rounded-2xl shadow-xs flex items-center gap-4">
          <div className="p-3 bg-red-50 text-red-600 rounded-xl">
            <AlertCircle className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">Gagal Sinkron</p>
            <p className="text-2xl font-black text-slate-800">{stats.failCount}</p>
            <p className="text-xs text-slate-400 mt-0.5">Transaksi tertolak</p>
          </div>
        </div>
      </div>

      {/* Control Actions & Testing Board */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Queue List and Controls */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
              <div className="flex items-center gap-2">
                <List className="w-5 h-5 text-slate-500" />
                <h3 className="font-black text-slate-800 text-base">Antrian Sinkronisasi Query Offline (IndexedDB)</h3>
              </div>
              <div className="flex items-center gap-2">
                {queue.length > 0 && (
                  <button
                    onClick={handleClearQueue}
                    className="flex items-center gap-1.5 px-3 py-1.5 border border-slate-200 text-slate-600 rounded-xl text-xs font-bold hover:bg-slate-50 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" /> Kosongkan Antrian
                  </button>
                )}
                <button
                  onClick={handleForceSync}
                  disabled={isSyncing || queue.length === 0}
                  className={`flex items-center gap-1.5 px-4 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
                    queue.length === 0
                      ? 'bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed'
                      : isSyncing
                      ? 'bg-sky-50 text-sky-600 border border-sky-200 cursor-wait'
                      : 'bg-sky-600 text-white shadow-xs hover:bg-sky-700'
                  }`}
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
                  {isSyncing ? 'Menyinkronkan...' : 'Sinkronkan Sekarang'}
                </button>
              </div>
            </div>

            {queue.length === 0 ? (
              <div className="py-12 text-center bg-slate-50 rounded-xl border border-dashed border-slate-200">
                <Database className="w-12 h-12 text-slate-300 mx-auto mb-2" />
                <p className="text-sm font-bold text-slate-700">Tidak ada antrian query tertunda</p>
                <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                  Semua transaksi langsung disimpan ke Supabase secara real-time karena koneksi dalam keadaan online. Aktifkan simulasi offline untuk menumpuk antrian.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-100 text-slate-500 font-extrabold uppercase tracking-wider">
                      <th className="py-2.5 px-3">Waktu Masuk</th>
                      <th className="py-2.5 px-3">ID Task</th>
                      <th className="py-2.5 px-3">Operasi</th>
                      <th className="py-2.5 px-3">Payload Data</th>
                      <th className="py-2.5 px-3 text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {queue.map((task) => (
                      <tr key={task.id} className="hover:bg-slate-50 transition-colors">
                        <td className="py-3 px-3 text-slate-500 whitespace-nowrap">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5 text-slate-400" />
                            {new Date(task.timestamp).toLocaleTimeString()}
                          </span>
                        </td>
                        <td className="py-3 px-3 font-mono text-slate-600 font-medium">{task.id}</td>
                        <td className="py-3 px-3">
                          <span className="px-2.5 py-1 bg-amber-50 text-amber-700 font-extrabold rounded-lg border border-amber-200 uppercase tracking-wide">
                            {task.action.replace('_', ' ')}
                          </span>
                        </td>
                        <td className="py-3 px-3 font-mono text-slate-500 max-w-[200px] truncate" title={JSON.stringify(task.payload)}>
                          {formatPayload(task.payload)}
                        </td>
                        <td className="py-3 px-3 text-right">
                          <span className="flex items-center justify-end gap-1 text-amber-600 font-bold">
                            <Clock className="w-3.5 h-3.5 shrink-0" /> Pending
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Test Queue Generation Box */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
              <Activity className="w-5 h-5 text-indigo-500" />
              <h3 className="font-black text-slate-800 text-base font-sans">Simulasi Pengujian Query & Input Serentak</h3>
            </div>
            <p className="text-xs text-slate-500">
              Gunakan kontrol di bawah ini untuk mensimulasikan query CRUD ke database atau pengiriman angket siswa secara serentak (concurrent load test).
            </p>
            <div className="flex flex-wrap gap-2.5">
              <button
                onClick={() => handleAddTestTask('save_student')}
                className="flex items-center gap-1.5 bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200 px-3.5 py-2 rounded-xl text-xs font-black transition-colors cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" /> 1 Siswa Baru (Single Query)
              </button>
              <button
                onClick={() => handleSimulateConcurrentAngket(10)}
                className="flex items-center gap-1.5 bg-amber-50 text-amber-800 hover:bg-amber-100 border border-amber-200 px-3.5 py-2 rounded-xl text-xs font-black transition-colors cursor-pointer"
              >
                <Zap className="w-3.5 h-3.5 text-amber-600" /> Simulasi 10 Siswa Serentak
              </button>
              <button
                onClick={() => handleSimulateConcurrentAngket(50)}
                className="flex items-center gap-1.5 bg-orange-50 text-orange-800 hover:bg-orange-100 border border-orange-200 px-3.5 py-2 rounded-xl text-xs font-black transition-colors cursor-pointer"
              >
                <Zap className="w-3.5 h-3.5 text-orange-600" /> Simulasi 50 Siswa Serentak
              </button>
              <button
                onClick={() => handleSimulateConcurrentAngket(100)}
                className="flex items-center gap-1.5 bg-purple-50 text-purple-800 hover:bg-purple-100 border border-purple-200 px-3.5 py-2 rounded-xl text-xs font-black transition-colors cursor-pointer"
              >
                <Zap className="w-3.5 h-3.5 text-purple-600" /> Simulasi 100 Siswa Serentak
              </button>
              <button
                onClick={() => handleAddTestTask('save_settings')}
                className="flex items-center gap-1.5 bg-indigo-50 text-indigo-800 hover:bg-indigo-100 border border-indigo-200 px-3.5 py-2 rounded-xl text-xs font-black transition-colors cursor-pointer"
              >
                <Settings className="w-3.5 h-3.5" /> Simpan Pengaturan (Query)
              </button>
              <button
                onClick={() => handleAddTestTask('delete_student')}
                className="flex items-center gap-1.5 bg-rose-50 text-rose-800 hover:bg-rose-100 border border-rose-200 px-3.5 py-2 rounded-xl text-xs font-black transition-colors cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" /> Hapus Siswa (Query)
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Logs */}
        <div className="space-y-6">
          <div className="bg-slate-900 text-slate-100 border border-slate-800 rounded-2xl p-5 shadow-lg flex flex-col h-[520px]">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3.5 shrink-0">
              <div className="flex items-center gap-2 text-slate-300">
                <Terminal className="w-5 h-5 text-sky-400" />
                <span className="font-black text-sm">Konsol Sinkronisasi Live</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleResetStats}
                  className="p-1.5 hover:bg-slate-800 text-slate-400 hover:text-slate-200 rounded-lg transition-colors cursor-pointer"
                  title="Reset Statistik"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={handleClearLogs}
                  className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-[10px] font-black transition-colors cursor-pointer"
                >
                  Clear Logs
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto mt-3 space-y-2.5 font-mono text-xs pr-1 scrollbar-thin scrollbar-thumb-slate-800 scrollbar-track-transparent">
              {logs.length === 0 ? (
                <div className="text-slate-500 text-center py-20 italic">
                  Menunggu log query baru...
                </div>
              ) : (
                logs.map((log) => (
                  <div key={log.id} className="leading-relaxed border-b border-slate-800/40 pb-1.5">
                    <span className="text-slate-500">[{log.time}]</span>{' '}
                    <span
                      className={`font-bold ${
                        log.type === 'success'
                          ? 'text-emerald-400'
                          : log.type === 'error'
                          ? 'text-rose-400'
                          : 'text-sky-300'
                      }`}
                    >
                      {log.type.toUpperCase()}:
                    </span>{' '}
                    <span className="text-slate-300">{log.message}</span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
