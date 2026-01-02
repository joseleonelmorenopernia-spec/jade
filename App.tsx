
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { CountdownTime, AppConfig, Memory } from './types';
import { generateAnniversaryMessage } from './services/geminiService';

const App: React.FC = () => {
  const [timeLeft, setTimeLeft] = useState<CountdownTime>({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [isAnniversary, setIsAnniversary] = useState(false);
  const [specialMessage, setSpecialMessage] = useState("");
  const [showCalendar, setShowCalendar] = useState(false);
  const [showGallery, setShowGallery] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);
  const [memories, setMemories] = useState<Memory[]>(() => {
    const saved = localStorage.getItem('anniversary_memories');
    return saved ? JSON.parse(saved) : [];
  });
  
  const [config, setConfig] = useState<AppConfig>(() => {
    const saved = localStorage.getItem('anniversary_config');
    return saved ? JSON.parse(saved) : {
      backgroundType: 'gradient',
      backgroundValue: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      anniversaryDay: 27,
      notificationsEnabled: false
    };
  });
  const [showSettings, setShowSettings] = useState(false);

  // Lógica de Notificaciones
  const requestNotificationPermission = async () => {
    if (!("Notification" in window)) return false;
    const permission = await Notification.requestPermission();
    if (permission === "granted") {
      setConfig(prev => ({ ...prev, notificationsEnabled: true }));
      new Notification("¡Notificaciones Activadas! ❤️", {
        body: "Te avisaré cada vez que llegue nuestro día especial.",
        icon: "https://cdn-icons-png.flaticon.com/512/833/833472.png"
      });
    }
  };

  const sendAnniversaryNotification = useCallback(() => {
    if (config.notificationsEnabled && Notification.permission === "granted") {
      new Notification("¡Feliz Aniversario! ❤️", {
        body: "Hoy es nuestro día especial. Entra para ver tu sorpresa.",
        icon: "https://cdn-icons-png.flaticon.com/512/833/833472.png",
        badge: "https://cdn-icons-png.flaticon.com/512/833/833472.png"
      });
    }
  }, [config.notificationsEnabled]);

  const calculateTimeLeft = useCallback(() => {
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();
    
    const isTodayAnni = now.getDate() === config.anniversaryDay;
    
    if (isTodayAnni) {
      if (!isAnniversary) {
        setIsAnniversary(true);
        sendAnniversaryNotification();
      }
      return { days: 0, hours: 0, minutes: 0, seconds: 0 };
    } else {
      setIsAnniversary(false);
    }

    let targetDate = new Date(currentYear, currentMonth, config.anniversaryDay);
    if (now > targetDate) {
      targetDate = new Date(currentYear, currentMonth + 1, config.anniversaryDay);
    }

    const difference = targetDate.getTime() - now.getTime();
    
    return {
      days: Math.floor(difference / (1000 * 60 * 60 * 24)),
      hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
      minutes: Math.floor((difference / 1000 / 60) % 60),
      seconds: Math.floor((difference / 1000) % 60),
    };
  }, [config.anniversaryDay, isAnniversary, sendAnniversaryNotification]);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);
    return () => clearInterval(timer);
  }, [calculateTimeLeft]);

  useEffect(() => {
    if (isAnniversary && !specialMessage) {
      const now = new Date();
      if (now.getMonth() === 1 && now.getDate() === 27) {
        setSpecialMessage("¡Feliz primer año juntos, mi amor! ❤️ Un año de risas, de apoyo y de un amor inmenso. Eres lo mejor de mi vida. Por muchísimos años más.");
      } else {
        generateAnniversaryMessage().then(setSpecialMessage);
      }
    } else if (!isAnniversary) {
      setSpecialMessage("");
    }
  }, [isAnniversary, specialMessage]);

  useEffect(() => {
    localStorage.setItem('anniversary_config', JSON.stringify(config));
  }, [config]);

  useEffect(() => {
    localStorage.setItem('anniversary_memories', JSON.stringify(memories));
  }, [memories]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setConfig(prev => ({
          ...prev,
          backgroundType: 'image',
          backgroundValue: reader.result as string
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddMemory = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const newMemory: Memory = {
          id: Date.now().toString(),
          url: reader.result as string,
          date: Date.now(),
        };
        setMemories(prev => [newMemory, ...prev]);
      };
      reader.readAsDataURL(file);
    }
  };

  const deleteMemory = (id: string) => {
    if (window.confirm('¿Quieres eliminar este recuerdo?')) {
      setMemories(prev => prev.filter(m => m.id !== id));
    }
  };

  const containerStyle: React.CSSProperties = {
    background: config.backgroundType === 'image' 
      ? `url(${config.backgroundValue})` 
      : config.backgroundValue,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
  };

  const months = useMemo(() => [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ], []);

  const renderMonth = (monthIdx: number) => {
    const year = new Date().getFullYear();
    const date = new Date(year, monthIdx, 1);
    const daysInMonth = new Date(year, monthIdx + 1, 0).getDate();
    const firstDay = date.getDay();
    const isCurrentMonth = new Date().getMonth() === monthIdx;

    const days = [];
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="h-6 w-6"></div>);
    }

    for (let d = 1; d <= daysInMonth; d++) {
      const isTarget = d === config.anniversaryDay;
      days.push(
        <div 
          key={d} 
          className={`h-6 w-6 flex items-center justify-center text-[10px] rounded-full transition-all ${
            isTarget 
              ? 'bg-red-500 text-white font-bold shadow-lg shadow-red-500/40 scale-110' 
              : 'text-white/60'
          }`}
        >
          {isTarget ? (
            <span className="flex flex-col items-center">
              {d}
              <span className="text-[6px] -mt-1">❤️</span>
            </span>
          ) : d}
        </div>
      );
    }

    return (
      <div key={monthIdx} className={`p-3 rounded-2xl bg-white/5 border ${isCurrentMonth ? 'border-red-400/30' : 'border-white/5'}`}>
        <h4 className="text-white text-[12px] font-bold mb-2 uppercase tracking-widest text-center">{months[monthIdx]}</h4>
        <div className="grid grid-cols-7 gap-1">
          {['D','L','M','X','J','V','S'].map(d => (
            <div key={d} className="text-[8px] text-white/30 text-center font-bold">{d}</div>
          ))}
          {days}
        </div>
      </div>
    );
  };

  const gitCommands = `git init
git add .
git commit -m "first commit"
git branch -M main
git remote add origin https://github.com/joseleonelmorenopernia-spec/jade.git
git push -u origin main`;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 transition-all duration-1000" style={containerStyle}>
      <div className="absolute inset-0 bg-black/30 backdrop-blur-[2px]"></div>

      <main className="relative z-10 w-full max-w-md bg-white/10 backdrop-blur-xl border border-white/20 rounded-[40px] p-8 shadow-2xl text-center">
        <header className="mb-8">
          <div className="inline-block p-3 bg-red-500/20 rounded-full mb-4 animate-pulse">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-red-500 fill-current" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-white tracking-tight">
            {isAnniversary ? "¡Feliz Aniversario! ❤️" : "Te amo muchísimo"}
          </h1>
        </header>

        {isAnniversary ? (
          <div className="space-y-6 animate-fadeIn">
            <div className="p-6 bg-white/5 rounded-3xl border border-white/10">
              <p className="text-xl text-white font-medium italic leading-relaxed">
                "{specialMessage || "Cargando mensaje de amor..."}"
              </p>
            </div>
            <p className="text-white/80 text-sm">Disfruta nuestro día especial hoy.</p>
          </div>
        ) : (
          <div className="grid grid-cols-4 gap-2">
            {[
              { label: 'Días', value: timeLeft.days },
              { label: 'Hrs', value: timeLeft.hours },
              { label: 'Min', value: timeLeft.minutes },
              { label: 'Seg', value: timeLeft.seconds },
            ].map((item, idx) => (
              <div key={idx} className="bg-white/5 rounded-2xl p-3 border border-white/10">
                <div className="text-2xl font-bold text-white leading-none mb-1">{item.value}</div>
                <div className="text-[10px] uppercase tracking-widest text-white/60 font-semibold">{item.label}</div>
              </div>
            ))}
          </div>
        )}

        <footer className="mt-12 flex justify-center gap-4">
           <div className="h-1 w-12 bg-white/20 rounded-full"></div>
           <div className="h-1 w-4 bg-red-500/40 rounded-full"></div>
           <div className="h-1 w-12 bg-white/20 rounded-full"></div>
        </footer>
      </main>

      {/* Action Buttons */}
      <div className="fixed bottom-6 left-6 right-6 flex justify-between z-20">
        <div className="flex gap-2">
          <button 
            onClick={() => setShowCalendar(!showCalendar)}
            className="p-4 bg-white/10 hover:bg-white/20 backdrop-blur-lg rounded-full border border-white/20 text-white shadow-xl transition-all"
            title="Calendario"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </button>
          
          <button 
            onClick={() => setShowGallery(!showGallery)}
            className="p-4 bg-white/10 hover:bg-white/20 backdrop-blur-lg rounded-full border border-white/20 text-white shadow-xl transition-all"
            title="Galería"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </button>
        </div>

        <button 
          onClick={() => setShowSettings(!showSettings)}
          className="p-4 bg-white/10 hover:bg-white/20 backdrop-blur-lg rounded-full border border-white/20 text-white shadow-xl transition-all"
          title="Ajustes"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </button>
      </div>

      {/* Gallery Modal */}
      {showGallery && (
        <div className="fixed inset-0 z-40 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
          <div className="bg-slate-900/90 w-full max-w-4xl h-[85vh] overflow-y-auto rounded-[40px] p-6 md:p-10 border border-slate-800 shadow-2xl relative">
            <button onClick={() => setShowGallery(false)} className="absolute top-6 right-6 z-50 p-2 bg-white/10 rounded-full text-white/60 hover:text-white">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <div className="flex justify-between items-center mb-8 px-2">
              <div>
                <h2 className="text-2xl font-bold text-white">Nuestros Recuerdos</h2>
                <p className="text-white/40 text-xs uppercase tracking-widest">Fotos de nosotros</p>
              </div>
              <label className="bg-red-500 hover:bg-red-600 text-white p-3 rounded-2xl cursor-pointer transition-all shadow-lg shadow-red-500/20">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                <input type="file" className="hidden" accept="image/*" onChange={handleAddMemory} />
              </label>
            </div>
            {memories.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-64 text-white/20">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <p className="text-sm font-medium">Aún no hay fotos.</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {memories.map((memory) => (
                  <div key={memory.id} className="group relative aspect-square rounded-2xl overflow-hidden border border-white/5 bg-white/5">
                    <img src={memory.url} alt="Memory" className="w-full h-full object-cover cursor-pointer hover:scale-110 transition-transform duration-500" onClick={() => setSelectedPhoto(memory.url)} />
                    <button onClick={() => deleteMemory(memory.id)} className="absolute top-2 right-2 p-1.5 bg-black/50 text-white/70 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:text-red-500">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {selectedPhoto && (
        <div className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-4 animate-fadeIn" onClick={() => setSelectedPhoto(null)}>
          <img src={selectedPhoto} className="max-w-full max-h-full rounded-2xl shadow-2xl" alt="Enlarged memory" />
        </div>
      )}

      {showCalendar && (
        <div className="fixed inset-0 z-40 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
          <div className="bg-slate-900/90 w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-[40px] p-6 md:p-10 border border-slate-800 shadow-2xl relative text-center">
            <button onClick={() => setShowCalendar(false)} className="absolute top-6 right-6 p-2 bg-white/10 rounded-full text-white/60 hover:text-white">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <h2 className="text-2xl font-bold text-white mb-2">Calendario de Amor</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mt-8">
              {months.map((_, i) => renderMonth(i))}
            </div>
          </div>
        </div>
      )}

      {/* Settings Modal */}
      {showSettings && (
        <div className="fixed inset-0 z-40 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-slate-900 w-full max-w-sm max-h-[85vh] overflow-y-auto rounded-[32px] p-8 border border-slate-800 shadow-2xl relative">
            <h2 className="text-xl font-bold text-white mb-6">Personalizar App</h2>
            <div className="space-y-6">
              
              <div className="bg-white/5 p-4 rounded-2xl border border-white/10 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${config.notificationsEnabled ? 'bg-red-500/20 text-red-500' : 'bg-slate-700 text-slate-400'}`}>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z" />
                    </svg>
                  </div>
                  <p className="text-white text-sm font-medium">Alertas de 27</p>
                </div>
                <button onClick={() => config.notificationsEnabled ? setConfig(prev => ({...prev, notificationsEnabled: false})) : requestNotificationPermission()} className={`w-12 h-6 rounded-full transition-colors relative ${config.notificationsEnabled ? 'bg-red-500' : 'bg-slate-700'}`}>
                  <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${config.notificationsEnabled ? 'left-7' : 'left-1'}`} />
                </button>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">Fondo Predefinido</label>
                <div className="grid grid-cols-3 gap-2">
                  {['linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', 'linear-gradient(135deg, #22c1c3 0%, #fdbb2d 100%)'].map((bg, i) => (
                    <button key={i} onClick={() => setConfig(prev => ({ ...prev, backgroundType: 'gradient', backgroundValue: bg }))} className="h-12 rounded-xl border border-white/10 hover:scale-105 transition-transform" style={{ background: bg }} />
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">🚀 Despliegue en GitHub</label>
                <div className="bg-black/40 p-3 rounded-xl border border-white/5 font-mono text-[10px] text-slate-300 relative overflow-hidden group">
                  <pre className="whitespace-pre-wrap">{gitCommands}</pre>
                  <button 
                    onClick={() => {
                      navigator.clipboard.writeText(gitCommands);
                      alert("¡Comandos copiados!");
                    }}
                    className="absolute top-2 right-2 p-2 bg-indigo-500/20 text-indigo-400 rounded-lg hover:bg-indigo-500/40 transition-colors"
                  >
                    Copiar
                  </button>
                </div>
                <p className="text-[9px] text-slate-500 mt-2 italic text-center">Ejecuta estos comandos en tu PC para subir "jade".</p>
              </div>

              <button onClick={() => setShowSettings(false)} className="w-full py-4 bg-indigo-600 text-white font-bold rounded-2xl transition-all shadow-lg">Listo</button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        .animate-fadeIn { animation: fadeIn 0.4s ease-out forwards; }
        ::-webkit-scrollbar { width: 5px; }
        ::-webkit-scrollbar-thumb { background: rgba(255, 255, 255, 0.1); border-radius: 10px; }
      `}</style>
    </div>
  );
};

export default App;
