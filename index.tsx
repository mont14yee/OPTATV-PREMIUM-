import React, { useState, useEffect, useRef } from "react";
import { createRoot } from "react-dom/client";
import { GoogleGenAI } from "@google/genai";

// --- Types & Interfaces ---
type View = "live" | "news" | "opta" | "settings";

interface LeagueConfig {
    id: string;
    name: string;
    shortName: string;
    icon: string; 
    logoUrl: string;
    color: string;
    link: string;
}

// --- Data Constants ---
const COMPETITIONS: readonly LeagueConfig[] = [
    {
        id: "epl",
        name: "Premier League",
        shortName: "EPL",
        icon: "fa-crown",
        logoUrl: "https://upload.wikimedia.org/wikipedia/en/f/f2/Premier_League_Logo.svg",
        color: "from-purple-900 to-fuchsia-900",
        link: "https://www.premierleague.com/en/"
    },
    {
        id: "laliga",
        name: "La Liga",
        shortName: "La Liga",
        icon: "fa-futbol",
        logoUrl: "https://upload.wikimedia.org/wikipedia/commons/0/0f/LaLiga_logo_2023.svg",
        color: "from-orange-800 to-red-900",
        link: "https://www.laliga.com/en-GB"
    },
    {
        id: "seriea",
        name: "Serie A",
        shortName: "Serie A",
        icon: "fa-shield-halved",
        logoUrl: "https://upload.wikimedia.org/wikipedia/commons/e/e9/Serie_A_logo_2022.svg",
        color: "from-blue-800 to-cyan-900",
        link: "https://www.legaseriea.it/en"
    },
    {
        id: "bundesliga",
        name: "Bundesliga",
        shortName: "GER",
        icon: "fa-certificate",
        logoUrl: "https://upload.wikimedia.org/wikipedia/en/d/df/Bundesliga_logo_%282017%29.svg",
        color: "from-red-900 to-red-950",
        link: "https://www.bundesliga.com/en/bundesliga/table"
    },
    {
        id: "worldcup",
        name: "FIFA World Cup 2026",
        shortName: "WC 2026",
        icon: "fa-earth-americas",
        logoUrl: "https://upload.wikimedia.org/wikipedia/commons/a/aa/FIFA_World_Cup_2026_logo.svg",
        color: "from-blue-950 via-slate-900 to-black",
        link: "https://www.fifa.com/en/tournaments/mens/worldcup/canadamexicousa2026"
    },
    {
        id: "afcon",
        name: "Africa Cup of Nations 2025",
        shortName: "AFCON 25",
        icon: "fa-earth-africa",
        logoUrl: "https://upload.wikimedia.org/wikipedia/en/f/f6/2025_Africa_Cup_of_Nations_logo.png",
        color: "from-orange-600 via-green-800 to-red-900",
        link: "https://www.cafonline.com/caf-africa-cup-of-nations/"
    },
    {
        id: "ucl",
        name: "UEFA Champions League",
        shortName: "UCL",
        icon: "fa-trophy",
        logoUrl: "https://upload.wikimedia.org/wikipedia/en/b/bf/UEFA_Champions_League_logo_2.svg",
        color: "from-blue-900 to-indigo-950",
        link: "https://www.uefa.com/uefachampionsleague/"
    },
    {
        id: "mls",
        name: "Major League Soccer",
        shortName: "MLS",
        icon: "fa-flag-usa",
        logoUrl: "https://upload.wikimedia.org/wikipedia/commons/7/76/MLS_crest_logo_RGB_gradient.svg",
        color: "from-blue-900 to-red-900",
        link: "https://www.mlssoccer.com/"
    },
    {
        id: "lp-arg",
        name: "Liga Profesional Argentina",
        shortName: "LPA",
        icon: "fa-sun",
        logoUrl: "https://upload.wikimedia.org/wikipedia/commons/e/e0/Logo_Liga_Profesional_de_F%C3%BAtbol_de_Argentina.png",
        color: "from-sky-400 via-sky-100 to-sky-700",
        link: "https://www.ligaprofesional.ar/"
    },
    {
        id: "brasileirao",
        name: "Brazilian Serie A",
        shortName: "BRA",
        icon: "fa-star",
        logoUrl: "https://upload.wikimedia.org/wikipedia/en/f/f8/Campeonato_Brasileiro_S%C3%A9rie_A_logo.svg",
        color: "from-green-600 to-yellow-500",
        link: "https://www.cbf.com.br/futebol-brasileiro/competicoes/campeonato-brasileiro-serie-a"
    },
    {
        id: "superlig",
        name: "Turkish Super Lig",
        shortName: "TUR",
        icon: "fa-moon",
        logoUrl: "https://upload.wikimedia.org/wikipedia/en/c/ca/S%C3%BCper_Lig_logo.svg",
        color: "from-red-600 via-red-700 to-red-900",
        link: "https://www.tff.org/"
    },
    {
        id: "eredivisie",
        name: "Dutch Eredivisie",
        shortName: "ERE",
        icon: "fa-wind",
        logoUrl: "https://upload.wikimedia.org/wikipedia/commons/0/0f/Eredivisie_logo.svg",
        color: "from-blue-600 to-orange-500",
        link: "https://eredivisie.nl/"
    },
    {
        id: "pro-league",
        name: "Belgian Pro League",
        shortName: "BEL",
        icon: "fa-shield-halved",
        logoUrl: "https://upload.wikimedia.org/wikipedia/en/e/e8/Jupiler_Pro_League_logo.svg",
        color: "from-black via-slate-900 to-red-600",
        link: "https://www.proleague.be/"
    },
    {
        id: "superliga-dk",
        name: "Danish Superligaen",
        shortName: "DAN",
        icon: "fa-shield",
        logoUrl: "https://upload.wikimedia.org/wikipedia/en/c/cb/Superliga_%28Denmark%29_logo.svg",
        color: "from-red-600 via-red-500 to-slate-200",
        link: "https://superliga.dk/"
    },
    {
        id: "saudi-pro",
        name: "Saudi Pro League",
        shortName: "SPL",
        icon: "fa-palm-tree",
        logoUrl: "https://upload.wikimedia.org/wikipedia/en/0/00/Saudi_Pro_League_logo.svg",
        color: "from-green-700 to-emerald-900",
        link: "https://spl.com.sa/"
    },
    {
        id: "primeira-liga",
        name: "Portuguese Primeira Liga",
        shortName: "POR",
        icon: "fa-anchor",
        logoUrl: "https://upload.wikimedia.org/wikipedia/en/0/0e/Liga_Portugal_logo.svg",
        color: "from-blue-800 to-green-700",
        link: "https://www.ligaportugal.pt/"
    },
    {
        id: "rpl",
        name: "Russian Premier League",
        shortName: "RUS",
        icon: "fa-bear",
        logoUrl: "https://upload.wikimedia.org/wikipedia/en/f/f6/Russian_Premier_League_logo.svg",
        color: "from-red-600 via-white to-blue-800",
        link: "https://premierliga.ru/"
    },
    {
        id: "eliteserien",
        name: "Norwegian Eliteserien",
        shortName: "NOR",
        icon: "fa-mountain",
        logoUrl: "https://upload.wikimedia.org/wikipedia/en/c/cf/Eliteserien_logo.svg",
        color: "from-blue-900 to-red-700",
        link: "https://www.eliteserien.no/"
    },
    {
        id: "super-league-gr",
        name: "Greek Super League",
        shortName: "GRE",
        icon: "fa-landmark",
        logoUrl: "https://upload.wikimedia.org/wikipedia/en/f/fe/Super_League_Greece_logo.svg",
        color: "from-blue-500 via-blue-400 to-white",
        link: "https://www.slgr.gr/"
    },
    {
        id: "dimayor",
        name: "Colombia Primera A Finalizacion",
        shortName: "COL",
        icon: "fa-coffee",
        logoUrl: "https://upload.wikimedia.org/wikipedia/en/8/8f/Dimayor_logo.svg",
        color: "from-yellow-400 via-blue-600 to-red-600",
        link: "https://dimayor.com.co/"
    },
    {
        id: "efl-champ",
        name: "English Football League Championship",
        shortName: "EFL",
        icon: "fa-medal",
        logoUrl: "https://upload.wikimedia.org/wikipedia/en/0/07/EFL_Championship.svg",
        color: "from-blue-900 to-slate-700",
        link: "https://www.efl.com/"
    },
    {
        id: "laliga-2",
        name: "Spanish Segunda Division",
        shortName: "ESP 2",
        icon: "fa-bolt",
        logoUrl: "https://upload.wikimedia.org/wikipedia/commons/0/0f/LaLiga_logo_2023.svg",
        color: "from-orange-600 to-slate-800",
        link: "https://www.laliga.com/en-GB/laliga-hypermotion"
    }
] as const;

const THEMES = [
    { name: "Neon Green", color: "#39ff14", rgb: "57, 255, 20" },
    { name: "Cyber Blue", color: "#00f3ff", rgb: "0, 243, 255" },
    { name: "Electric Purple", color: "#bf00ff", rgb: "191, 0, 255" },
    { name: "Hot Pink", color: "#ff0099", rgb: "255, 0, 153" },
    { name: "Sunset Orange", color: "#ff5e00", rgb: "255, 94, 0" },
    { name: "Golden Yellow", color: "#ffd700", rgb: "255, 215, 0" },
];

const LANGUAGES = [
    { code: "en", name: "English", region: "Global" },
    { code: "es", name: "Español", region: "España" },
    { code: "fr", name: "Français", region: "France" },
    { code: "de", name: "Deutsch", region: "Deutschland" },
];

const HOT_MATCH_LINK = "https://www.camel1.live/q/home/hotmatch";
const GOOGLE_NEWS_TOPIC_LINK = "https://news.google.com/topics/CAAqJQgKIh9DQkFTRWVvSUwyMHZNREoyZURRU0JXVnVMVWRDS0FBUAE?hl=en-ET&gl=ET&ceid=ET%3Aen";
const OPTA_ANALYST_LINK = "https://theanalyst.com";
const POWER_RANKINGS_LINK = "https://theanalyst.com/competition/uefa-champions-league/power-rankings";
const XG_MATRIX_LINK = "https://theanalyst.com/?s=XG&orderby=date%3ADESC&cat=23&post_type=post";
const INSTAGRAM_SUPPORT_LINK = "https://www.instagram.com/menkirwolde?igsh=MTY4Nmh1N2FtMHVrNg==";
const TARGET_GMAIL = "mon14yee@gmail.com";

// --- UI Components ---

const IntelligenceFrame: React.FC<{ title?: string; icon?: string; children: React.ReactNode }> = ({ title, icon, children }) => (
    <div className="relative p-[1px] rounded-[2.2rem] md:rounded-[3.5rem] bg-gradient-to-br from-white/10 to-transparent overflow-hidden group/frame transition-all duration-700 shadow-2xl">
        {/* Deep Slate Glass Layer for visibility on the new solid color theme */}
        <div className="absolute inset-0 bg-slate-900/70 backdrop-blur-3xl"></div>
        <div className="relative z-10 p-5 md:p-12 space-y-6 md:space-y-8 bg-black/20 rounded-[2.1rem] md:rounded-[3.4rem] border border-white/5">
            {title && (
                <div className="flex items-center gap-4 mb-1 md:mb-2">
                    {icon && <i className={`fa-solid ${icon} text-[var(--primary-color)] text-lg md:text-xl drop-shadow-[0_0_8px_rgba(var(--primary-rgb),0.6)]`}></i>}
                    <h3 className="text-[10px] md:text-xs font-black uppercase tracking-[0.4em] text-white/80">{title}</h3>
                </div>
            )}
            {children}
        </div>
    </div>
);

const LeagueItem: React.FC<{ league: LeagueConfig }> = ({ league }) => {
    const [imgError, setImgError] = useState(false);
    return (
        <a
            href={league.link}
            target="_blank"
            rel="noreferrer"
            className={`flex-shrink-0 w-24 h-28 rounded-3xl bg-gradient-to-br ${league.color} relative overflow-hidden group cursor-pointer border border-white/10 hover:border-white/40 transition-all hover:scale-105 shadow-2xl flex flex-col items-center justify-between p-4`}
        >
            <div className="absolute inset-0 bg-black/40 group-hover:bg-transparent transition-colors"></div>
            {!imgError ? (
                <img 
                    src={league.logoUrl} 
                    alt={league.name} 
                    className="w-14 h-14 object-contain drop-shadow-[0_0_8px_rgba(255,255,255,0.4)] group-hover:scale-110 transition-transform duration-500 relative z-10"
                    onError={() => setImgError(true)}
                />
            ) : (
                <i className={`fa-solid ${league.icon} text-4xl text-white/90 relative z-10`}></i>
            )}
            <i className={`fa-solid ${league.icon} text-3xl text-white/90 hidden group-hover:block absolute top-1/2 -translate-y-1/2 transition-colors z-10 opacity-0 group-hover:opacity-100`}></i>
            <span className="text-[10px] font-black text-white mt-auto uppercase tracking-widest relative z-10 text-center leading-tight drop-shadow-md">{league.shortName}</span>
        </a>
    );
};

const StreamPlayer: React.FC = () => {
    const handleWatch = () => window.open(HOT_MATCH_LINK, '_blank');
    return (
        <IntelligenceFrame>
            <div className="relative w-full h-[35vh] md:h-[50vh] bg-slate-950/60 backdrop-blur-md overflow-hidden group rounded-[1.8rem] md:rounded-[2.5rem] border border-white/10 flex flex-col items-center justify-center">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(var(--primary-rgb),0.1),transparent_70%)]"></div>
                
                <div className="relative z-10 w-full max-w-2xl px-6 md:px-8 flex flex-col items-center text-center">
                    <h1 className="text-white text-3xl md:text-6xl font-bold tracking-tight mb-2 md:mb-3 drop-shadow-[0_2px_10px_rgba(0,0,0,0.5)]">
                        Watch For Free
                    </h1>
                    <p className="text-white/80 text-xs md:text-lg font-medium mb-8 md:mb-10 max-w-md drop-shadow-sm">
                        Global HD Broadcast Stream
                    </p>

                    <button 
                        onClick={handleWatch}
                        className="relative w-full max-w-sm md:max-w-md py-5 md:py-8 bg-[var(--primary-color)] rounded-[1.5rem] md:rounded-[2rem] flex items-center justify-center gap-4 md:gap-5 group/btn active:scale-95 transition-all duration-300 shadow-[0_0_40px_rgba(var(--primary-rgb),0.3)] hover:shadow-[0_0_60px_rgba(var(--primary-rgb),0.5)] overflow-hidden"
                    >
                        <div className="absolute inset-0 bg-white/20 opacity-0 group-hover/btn:opacity-100 transition-opacity"></div>
                        <div className="relative z-10 flex items-center gap-3 md:gap-4">
                            <i className="fa-solid fa-play text-black text-xl md:text-3xl"></i>
                            <span className="text-black font-display font-black text-xl md:text-3xl uppercase tracking-wider">
                                Stream Now
                            </span>
                        </div>
                    </button>

                    <div className="mt-6 md:mt-8 flex items-center gap-4 md:gap-6 text-white/80 font-bold uppercase tracking-[0.2em] text-[9px] md:text-[10px]">
                        <div className="flex items-center gap-2 md:gap-3">
                            <i className="fa-solid fa-earth-americas text-xs md:text-sm"></i>
                            All Regions
                        </div>
                        <div className="w-1 md:w-1.5 h-1 md:h-1.5 rounded-full bg-white/40"></div>
                        <div className="flex items-center gap-2 md:gap-3">
                            <i className="fa-solid fa-bolt text-xs md:text-sm"></i>
                            Low Latency
                        </div>
                    </div>
                </div>

                <div className="absolute -bottom-20 -right-20 w-80 h-80 bg-[var(--primary-color)]/10 blur-[100px] rounded-full animate-pulse-fast"></div>
            </div>
        </IntelligenceFrame>
    );
};

const OptaTab: React.FC = () => {
    return (
        <div className="pb-32 pt-24 min-h-screen relative overflow-hidden animate-fade-in">
            <div className="px-5 md:px-8 mb-8 md:mb-10 relative z-10">
                <div className="flex items-center gap-4 mb-3 md:mb-4">
                    <div className="w-2 h-2 rounded-full bg-[var(--primary-color)] shadow-[0_0_12px_var(--primary-color)]"></div>
                    <span className="text-[10px] md:text-xs font-mono text-slate-800 uppercase tracking-widest font-black drop-shadow-sm">Data Intelligence Engine</span>
                </div>
                <h2 className="text-4xl md:text-6xl font-display font-black text-slate-900 uppercase tracking-tighter leading-none drop-shadow-lg">
                    OPTA <span className="text-transparent bg-clip-text bg-gradient-to-r from-slate-900 to-slate-500">VISION</span>
                </h2>
            </div>

            <div className="px-4 md:px-6 space-y-6 md:space-y-8 relative z-10">
                <IntelligenceFrame title="Performance Model" icon="fa-microchip">
                    <div 
                        onClick={() => window.open(POWER_RANKINGS_LINK, "_blank")}
                        className="bg-slate-900/40 backdrop-blur-md border border-white/10 rounded-[2.2rem] md:rounded-[3.2rem] p-0.5 md:p-1 shadow-3xl relative overflow-hidden group/terminal cursor-pointer hover:border-[var(--primary-color)]/40 transition-all duration-500"
                    >
                        <div className="absolute inset-0 bg-gradient-to-br from-[var(--primary-color)]/10 via-transparent to-transparent opacity-0 group-hover/terminal:opacity-100 transition-opacity"></div>
                        <div className="relative z-10 bg-slate-950/70 rounded-[2.1rem] md:rounded-[3.1rem] p-6 md:p-10 border border-white/5">
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8 md:mb-12">
                                <div className="flex items-center gap-4 md:gap-5">
                                    <div className="w-12 h-12 md:w-14 md:h-14 rounded-xl md:rounded-2xl bg-[var(--primary-color)]/20 flex items-center justify-center border border-[var(--primary-color)]/30 shadow-[0_0_20px_rgba(var(--primary-rgb),0.2)]">
                                        <i className="fa-solid fa-ranking-star text-[var(--primary-color)] text-xl md:text-2xl"></i>
                                    </div>
                                    <div>
                                        <h3 className="text-2xl md:text-4xl font-display font-bold uppercase tracking-tight leading-none mb-1 text-white">Power Rankings</h3>
                                        <p className="text-white/60 text-[9px] md:text-[10px] font-mono uppercase tracking-widest font-bold">Real-Time Global Model</p>
                                    </div>
                                </div>
                                <div className="self-start md:self-center flex items-center gap-3 bg-white/10 px-4 py-2 rounded-full border border-white/20 group-hover/terminal:bg-[var(--primary-color)]/20 transition-all">
                                    <span className="w-2 h-2 rounded-full bg-[var(--primary-color)] animate-pulse"></span>
                                    <span className="text-[9px] md:text-[10px] font-black uppercase tracking-widest text-white group-hover/terminal:text-white">Live Index</span>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 mb-8 md:mb-12">
                                <div className="bg-slate-900/60 rounded-2xl md:rounded-3xl p-5 md:p-6 border border-white/10 hover:bg-slate-900/80 transition-colors shadow-inner">
                                    <div className="flex items-center justify-between mb-3 md:mb-4">
                                        <span className="text-[9px] md:text-[10px] font-black uppercase tracking-widest text-white/60">Win Probability</span>
                                        <i className="fa-solid fa-chart-pie text-purple-400"></i>
                                    </div>
                                    <div className="flex items-end gap-2 md:gap-3 mb-2">
                                        <span className="text-3xl md:text-4xl font-display font-bold text-white">92.4%</span>
                                        <span className="text-[var(--primary-color)] text-[10px] md:text-xs font-mono mb-1 flex items-center gap-1 font-black"><i className="fa-solid fa-caret-up"></i> 1.2%</span>
                                    </div>
                                    <div className="w-full h-1 md:h-1.5 bg-white/5 rounded-full overflow-hidden">
                                        <div className="h-full bg-gradient-to-r from-purple-500 to-indigo-500 w-[92%] rounded-full shadow-[0_0_10px_rgba(168,85,247,0.4)]"></div>
                                    </div>
                                </div>

                                <div className="bg-slate-900/60 rounded-2xl md:rounded-3xl p-5 md:p-6 border border-white/10 hover:bg-slate-900/80 transition-colors shadow-inner">
                                    <div className="flex items-center justify-between mb-3 md:mb-4">
                                        <span className="text-[9px] md:text-[10px] font-black uppercase tracking-widest text-white/60">Attack Efficiency</span>
                                        <i className="fa-solid fa-fire text-orange-500"></i>
                                    </div>
                                    <div className="flex items-end gap-2 md:gap-3 mb-2">
                                        <span className="text-3xl md:text-4xl font-display font-bold text-white">8.1</span>
                                        <span className="text-white/50 text-[9px] md:text-[10px] font-mono mb-1 uppercase tracking-widest">xG/Match</span>
                                    </div>
                                    <div className="flex gap-1 h-2 md:h-3 items-end">
                                        {[40, 70, 55, 90, 65, 80, 45].map((h, i) => (
                                            <div key={i} className={`flex-1 rounded-sm ${i === 3 ? 'bg-[var(--primary-color)] shadow-[0_0_12px_var(--primary-color)]' : 'bg-white/10'}`} style={{ height: `${h}%` }}></div>
                                        ))}
                                    </div>
                                </div>

                                <div className="bg-slate-900/60 rounded-2xl md:rounded-3xl p-5 md:p-6 border border-white/10 hover:bg-slate-900/80 transition-colors shadow-inner">
                                    <div className="flex items-center justify-between mb-3 md:mb-4">
                                        <span className="text-[9px] md:text-[10px] font-black uppercase tracking-widest text-white/60">Defensive Rating</span>
                                        <i className="fa-solid fa-shield-halved text-cyan-400"></i>
                                    </div>
                                    <div className="flex items-end gap-2 md:gap-3 mb-2">
                                        <span className="text-3xl md:text-4xl font-display font-bold text-white">A+</span>
                                        <span className="text-cyan-400 text-[9px] md:text-[10px] font-mono mb-1 uppercase tracking-widest font-black">Top 1%</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="flex -space-x-1.5 md:-space-x-2">
                                            {[1, 2, 3].map(i => <div key={i} className="w-5 h-5 md:w-6 md:h-6 rounded-full border-2 border-black bg-white/20"></div>)}
                                        </div>
                                        <span className="text-[8px] md:text-[9px] text-white/60 font-black uppercase tracking-widest italic">Elite Category</span>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-[var(--primary-color)] text-black rounded-xl md:rounded-2xl py-4 md:py-6 flex items-center justify-center gap-3 md:gap-4 font-display font-black text-xl md:text-2xl uppercase tracking-widest group-hover/terminal:scale-[1.01] transition-transform duration-500 shadow-[0_15px_30px_rgba(var(--primary-rgb),0.3)]">
                                <i className="fa-solid fa-up-right-from-square text-lg md:text-xl"></i>
                                Explore Rankings
                            </div>
                        </div>
                    </div>
                </IntelligenceFrame>

                <div className="grid grid-cols-2 gap-4 md:gap-6 pb-12">
                    <div 
                        onClick={() => window.open(OPTA_ANALYST_LINK, "_blank")}
                        className="bg-slate-900/70 backdrop-blur-xl border border-white/10 rounded-[1.8rem] md:rounded-[2.5rem] p-6 md:p-10 hover:bg-slate-950/80 transition-all cursor-pointer group shadow-2xl relative overflow-hidden"
                    >
                        <i className="fa-solid fa-fire text-orange-500 text-3xl md:text-4xl mb-6 md:mb-8 group-hover:scale-110 transition-transform duration-500 block drop-shadow-[0_0_10px_rgba(249,115,22,0.5)]"></i>
                        <h4 className="font-display font-bold text-2xl md:text-3xl uppercase mb-1 tracking-tight text-white">Heatmaps</h4>
                    </div>

                    <div 
                        onClick={() => window.open(XG_MATRIX_LINK, "_blank")}
                        className="bg-slate-900/70 backdrop-blur-xl border border-white/10 rounded-[1.8rem] md:rounded-[2.5rem] p-6 md:p-10 hover:bg-slate-950/80 transition-all cursor-pointer group shadow-2xl relative overflow-hidden"
                    >
                        <i className="fa-solid fa-bullseye text-cyan-400 text-3xl md:text-4xl mb-6 md:mb-8 group-hover:scale-110 transition-transform duration-500 block drop-shadow-[0_0_10px_rgba(34,211,238,0.5)]"></i>
                        <h4 className="font-display font-bold text-2xl md:text-3xl uppercase mb-1 tracking-tight text-white">xG Matrix</h4>
                    </div>
                </div>
            </div>
        </div>
    );
};

const NewsTab: React.FC = () => {
    return (
        <div className="p-5 md:p-8 pt-28 pb-32 min-h-screen relative animate-fade-in overflow-hidden">
            <div className="relative z-10 space-y-8 md:space-y-12">
                <div className="flex items-center justify-between">
                    <div className="space-y-1 md:space-y-2">
                        <div className="flex items-center gap-3">
                            <div className="w-1.5 h-5 md:w-2 md:h-6 bg-[var(--primary-color)] rounded-full shadow-[0_0_8px_var(--primary-color)]"></div>
                            <span className="text-[10px] md:text-xs font-mono text-slate-800 uppercase tracking-[0.4em] font-black drop-shadow-sm">Intelligence Terminal</span>
                        </div>
                        <h2 className="text-4xl md:text-6xl font-display font-bold text-slate-900 uppercase tracking-tighter leading-none drop-shadow-lg">
                            GLOBAL <span className="text-transparent bg-clip-text bg-gradient-to-r from-slate-900 to-slate-500">REPORTS</span>
                        </h2>
                    </div>
                </div>

                <IntelligenceFrame title="Hub Network" icon="fa-satellite-dish">
                    <div 
                        onClick={() => window.open(GOOGLE_NEWS_TOPIC_LINK, "_blank")}
                        className="group/news-hub relative w-full aspect-[4/3] md:aspect-[21/9] bg-slate-900/60 backdrop-blur-2xl border border-white/10 rounded-[2rem] md:rounded-[3rem] overflow-hidden cursor-pointer hover:border-[var(--primary-color)]/30 transition-all duration-700 shadow-3xl"
                    >
                        <div className="absolute inset-0 opacity-10 pointer-events-none">
                            <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:40px_40px]"></div>
                        </div>

                        <div className="absolute inset-0 p-6 md:p-12 flex flex-col justify-between">
                            <div className="flex justify-between items-start">
                                <div className="flex items-center gap-3 md:gap-4 bg-black/60 backdrop-blur-md px-4 md:px-6 py-2 md:py-3 rounded-xl md:rounded-2xl border border-white/20">
                                    <i className="fa-solid fa-satellite-dish text-[var(--primary-color)] animate-pulse shadow-[0_0_10px_rgba(var(--primary-rgb),0.5)] text-sm md:text-base"></i>
                                    <span className="text-[9px] md:text-[10px] font-black uppercase tracking-widest text-white/90">Syncing Data</span>
                                </div>
                                <div className="w-12 h-12 md:w-16 md:h-16 rounded-full bg-white text-black flex items-center justify-center hover:scale-110 transition-transform shadow-2xl">
                                    <i className="fa-solid fa-arrow-up-right-from-square text-lg md:text-xl"></i>
                                </div>
                            </div>

                            <div className="max-w-xl">
                                <h3 className="text-3xl md:text-6xl font-display font-black text-white uppercase leading-none tracking-tighter mb-3 md:mb-4 group-hover/news-hub:translate-x-2 md:group-hover/news-hub:translate-x-4 transition-transform duration-500 drop-shadow-2xl">
                                    Intelligence <br/>
                                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-[var(--primary-color)] to-emerald-400">Hub Terminal</span>
                                </h3>
                                <p className="text-sm md:text-lg text-white/70 font-medium leading-relaxed drop-shadow-md hidden sm:block">
                                    Real-time aggregation of official football reports from across the planet.
                                </p>
                            </div>
                        </div>
                    </div>
                </IntelligenceFrame>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8 pb-12">
                    <div onClick={() => window.open(GOOGLE_NEWS_TOPIC_LINK, "_blank")} className="bg-slate-900/70 backdrop-blur-xl border border-white/10 p-6 md:p-10 rounded-[2rem] md:rounded-[3rem] hover:bg-slate-950 transition-all cursor-pointer group flex items-center justify-between shadow-2xl">
                        <div className="space-y-2 md:space-y-4">
                            <h4 className="text-xl md:text-2xl font-display font-bold uppercase tracking-tight text-white group-hover:text-[var(--primary-color)] transition-colors">Transfer Radar</h4>
                            <p className="text-[11px] md:text-sm text-white/60 font-medium">Verified move tracking analytics.</p>
                        </div>
                        <div className="w-12 h-12 md:w-14 md:h-14 rounded-xl md:rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center group-hover:bg-[var(--primary-color)] group-hover:text-black transition-all shadow-lg">
                            <i className="fa-solid fa-money-bill-transfer text-lg md:text-xl"></i>
                        </div>
                    </div>
                    <div onClick={() => window.open(GOOGLE_NEWS_TOPIC_LINK, "_blank")} className="bg-slate-900/70 backdrop-blur-xl border border-white/10 p-6 md:p-10 rounded-[2rem] md:rounded-[3rem] hover:bg-slate-950 transition-all cursor-pointer group flex items-center justify-between shadow-2xl">
                        <div className="space-y-2 md:space-y-4">
                            <h4 className="text-xl md:text-2xl font-display font-bold uppercase tracking-tight text-white group-hover:text-blue-400 transition-colors">Medical Bulletin</h4>
                            <p className="text-[11px] md:text-sm text-white/60 font-medium">Real-time recovery data flow.</p>
                        </div>
                        <div className="w-12 h-12 md:w-14 md:h-14 rounded-xl md:rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center group-hover:bg-blue-500 group-hover:text-black transition-all shadow-lg">
                            <i className="fa-solid fa-briefcase-medical text-lg md:text-xl"></i>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const PremiumModal: React.FC<{ 
    isOpen: boolean; 
    onClose: () => void; 
    title: string; 
    icon: string;
    content: React.ReactNode;
}> = ({ isOpen, onClose, title, icon, content }) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-5 md:p-6 animate-fade-in">
            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-3xl" onClick={onClose}></div>
            <div className="relative w-full max-w-2xl bg-slate-950/90 border border-white/20 rounded-[2.5rem] md:rounded-[3rem] shadow-[0_0_100px_rgba(0,0,0,0.8)] overflow-hidden animate-slide-up">
                <div className="p-8 md:p-12">
                    <div className="flex items-center justify-between mb-8 md:mb-10">
                        <div className="flex items-center gap-4 md:gap-6">
                            <div className="w-12 h-12 md:w-14 md:h-14 rounded-xl md:rounded-2xl bg-white/10 border border-white/10 flex items-center justify-center shadow-lg">
                                <i className={`fa-solid ${icon} text-xl md:text-2xl text-[var(--primary-color)]`}></i>
                            </div>
                            <h2 className="text-2xl md:text-4xl font-display font-black uppercase tracking-tighter text-white">{title}</h2>
                        </div>
                        <button onClick={onClose} className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors">
                            <i className="fa-solid fa-xmark text-white"></i>
                        </button>
                    </div>
                    <div className="space-y-6 md:space-y-8 max-h-[50vh] md:max-h-[60vh] overflow-y-auto no-scrollbar pr-1 md:pr-2">
                        {content}
                    </div>
                    <button onClick={onClose} className="w-full mt-8 md:mt-10 py-4 md:py-5 bg-[var(--primary-color)] text-black rounded-xl md:rounded-2xl font-display font-black text-lg uppercase tracking-widest hover:brightness-110 active:scale-95 transition-all shadow-xl">
                        Dismiss
                    </button>
                </div>
            </div>
        </div>
    );
};

const SettingsTab: React.FC = () => {
    const [selectedLang, setSelectedLang] = useState(() => localStorage.getItem('appLanguage') || 'en');
    const [isSaving, setIsSaving] = useState(false);
    const [showNotice, setShowNotice] = useState(false);
    const [activeModal, setActiveModal] = useState<'privacy' | 'tips' | 'signin' | null>(null);

    const handleLanguageSelect = (code: string) => {
        setIsSaving(true);
        setSelectedLang(code);
        localStorage.setItem('appLanguage', code);
        setTimeout(() => {
            setIsSaving(false);
            setShowNotice(true);
            setTimeout(() => setShowNotice(false), 2000);
        }, 800);
    };

    const handleTacticalSync = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const email = formData.get('sync_email');
        const username = formData.get('sync_username');
        const message = formData.get('sync_reqs');

        const body = `TACTICAL SYNC REQUEST\n\nUsername: ${username}\nEmail: ${email}\n\nRequirements:\n${message}\n\nSent from OptaTV Portal.`;
        const mailtoUrl = `mailto:${TARGET_GMAIL}?subject=OPTATV Tactical Sync Request - ${username}&body=${encodeURIComponent(body)}`;
        
        window.location.href = mailtoUrl;
        setActiveModal(null);
    };

    const modalContent = {
        signin: (
            <form onSubmit={handleTacticalSync} className="space-y-5">
                <div className="bg-white/5 p-6 rounded-3xl border border-white/10">
                    <p className="text-white/70 text-sm mb-6 leading-relaxed">Please provide your details to request access to the high-level Tactical Sync service. We will respond with the latest update files to your provided Gmail.</p>
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40 ml-1">Callsign / Username</label>
                            <input 
                                name="sync_username"
                                required
                                type="text" 
                                placeholder="E.g. ScoutPrime"
                                className="w-full bg-slate-900/50 border border-white/10 rounded-2xl px-5 py-4 text-white text-sm focus:outline-none focus:border-[var(--primary-color)]/50 transition-colors"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40 ml-1">Verified Email Address</label>
                            <input 
                                name="sync_email"
                                required
                                type="email" 
                                placeholder="your@email.com"
                                className="w-full bg-slate-900/50 border border-white/10 rounded-2xl px-5 py-4 text-white text-sm focus:outline-none focus:border-[var(--primary-color)]/50 transition-colors"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40 ml-1">Tactical Requirements</label>
                            <textarea 
                                name="sync_reqs"
                                required
                                rows={3}
                                placeholder="Describe the tactical modules or updates you require..."
                                className="w-full bg-slate-900/50 border border-white/10 rounded-2xl px-5 py-4 text-white text-sm focus:outline-none focus:border-[var(--primary-color)]/50 transition-colors no-scrollbar resize-none"
                            ></textarea>
                        </div>
                    </div>
                </div>
                <button 
                    type="submit"
                    className="w-full py-5 bg-[var(--primary-color)] text-black rounded-2xl font-display font-black text-xl uppercase tracking-widest hover:brightness-110 active:scale-95 transition-all shadow-xl"
                >
                    Initialize Sync Request
                </button>
            </form>
        ),
        tips: (
            <div className="space-y-6">
                {[
                    { t: "Deep Scout Mode", d: "Long-press any match link in the Opta tab to unlock real-time xG variance metrics and player heatmaps directly from our satellite feed." },
                    { t: "Atmosphere Control", d: "Toggle your theme colors in Settings. Choosing 'Neon Blue' optimizes high-contrast readability for midnight fixtures." },
                    { t: "Global Pulse", d: "Sync your account to receive instantaneous notifications when transfer valuations shift for players on your watch list." },
                    { t: "Latency Master", d: "For the fastest satellite link, ensure 'Battery Saver' is disabled on your device to maintain high-frequency data refresh." }
                ].map((item, idx) => (
                    <div key={idx} className="bg-white/5 p-6 rounded-3xl border border-white/10 group hover:border-[var(--primary-color)]/30 transition-colors">
                        <h4 className="text-[var(--primary-color)] font-display font-bold uppercase text-lg mb-2 tracking-tight flex items-center gap-3">
                            <span className="w-6 h-6 rounded-full bg-[var(--primary-color)]/10 text-[10px] flex items-center justify-center border border-[var(--primary-color)]/20">0{idx+1}</span>
                            {item.t}
                        </h4>
                        <p className="text-white/80 text-sm leading-relaxed font-medium">{item.d}</p>
                    </div>
                ))}
            </div>
        ),
        privacy: (
            <div className="space-y-8">
                <div className="space-y-4">
                    <p className="text-white/90 font-medium leading-relaxed">Your data security is managed with the same precision we apply to Opta's global football analytics. We operate on a strictly <span className="text-white font-black">Privacy-First Architecture.</span></p>
                </div>
                <div className="grid grid-cols-1 gap-4">
                    {[
                        { icon: 'fa-shield-halved', t: 'End-to-End Encryption', d: 'Every sync operation between your device and our tactics vault is protected by enterprise-grade SSL certificates.' },
                        { icon: 'fa-eye-slash', t: 'Zero Tracking Policy', d: 'We never sell or distribute your viewing habits. Analytics are strictly aggregated and anonymized for service improvement.' },
                        { icon: 'fa-user-gear', t: 'GDPR Excellence', d: 'You retain full ownership of your data. Export or erase your profile instantly from the support hub at any time.' }
                    ].map((item, idx) => (
                        <div key={idx} className="flex gap-5 p-4 bg-white/10 rounded-2xl border border-white/10 shadow-lg">
                            <i className={`fa-solid ${item.icon} text-xl text-[var(--primary-color)] mt-1`}></i>
                            <div>
                                <h5 className="text-white font-display font-bold uppercase text-sm mb-1 tracking-widest">{item.t}</h5>
                                <p className="text-white/60 text-[11px] leading-relaxed font-bold">{item.d}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        )
    };

    return (
        <div className="px-4 md:px-8 pt-28 pb-40 min-h-screen relative animate-fade-in overflow-x-hidden">
            <div className="max-w-4xl mx-auto space-y-10 md:space-y-16 relative z-10">
                <div className="flex items-center gap-5 md:gap-6">
                    <div className="w-14 h-14 md:w-16 md:h-16 rounded-xl md:rounded-2xl bg-slate-900/40 border border-white/10 flex items-center justify-center shadow-lg backdrop-blur-xl">
                        <i className="fa-solid fa-sliders text-slate-800 text-2xl md:text-3xl drop-shadow-sm"></i>
                    </div>
                    <div>
                        <h2 className="text-4xl md:text-5xl font-display font-black text-slate-900 uppercase tracking-tighter leading-none mb-1 drop-shadow-sm">Settings</h2>
                        <p className="text-[10px] md:text-xs font-mono text-slate-600 uppercase tracking-[0.4em] font-black drop-shadow-sm">Configure Experience</p>
                    </div>
                </div>

                <div className="space-y-10 md:space-y-12">
                    <IntelligenceFrame title="Subscription & Access" icon="fa-crown">
                        <div className="group/sync relative bg-slate-900/30 backdrop-blur-xl border border-white/10 p-1 rounded-[2rem] md:rounded-[3.2rem] shadow-3xl">
                            <div className="bg-slate-950/60 rounded-[1.9rem] md:rounded-[3.1rem] p-6 md:p-10 flex flex-col md:flex-row items-center justify-between gap-8 md:gap-10">
                                <div className="space-y-3 text-center md:text-left">
                                    <h3 className="text-2xl md:text-3xl font-display font-bold uppercase tracking-tight text-white drop-shadow-md">Sync Your Tactics</h3>
                                    <p className="text-white/70 text-sm md:text-base font-bold max-w-sm">Unlock premium scouting preferences across tactical units.</p>
                                </div>
                                <button 
                                    onClick={() => setActiveModal('signin')}
                                    className="w-full md:w-auto bg-white text-black px-10 md:px-12 py-4 md:py-5 rounded-xl md:rounded-2xl font-display font-black text-lg md:text-xl uppercase tracking-widest hover:bg-[var(--primary-color)] transition-all shadow-2xl active:scale-95"
                                >
                                    Sign In Now
                                </button>
                            </div>
                        </div>
                    </IntelligenceFrame>

                    <IntelligenceFrame title="System Preferences" icon="fa-gears">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
                            <div className="bg-slate-900/40 backdrop-blur-xl border border-white/10 p-6 md:p-8 rounded-[1.8rem] md:rounded-[2.5rem] shadow-2xl relative overflow-hidden group">
                                <h3 className="text-[9px] font-black text-white/60 uppercase tracking-[0.4em] mb-4 md:mb-6 flex items-center gap-2">
                                    <i className="fa-solid fa-palette text-[var(--primary-color)]"></i> Theme Accent
                                </h3>
                                <div className="flex items-center gap-3 md:gap-4">
                                    {THEMES.map((theme) => (
                                        <button
                                            key={theme.name}
                                            title={theme.name}
                                            onClick={() => {
                                                document.documentElement.style.setProperty('--primary-color', theme.color);
                                                document.documentElement.style.setProperty('--primary-rgb', theme.rgb);
                                                localStorage.setItem('themeColor', theme.color);
                                                localStorage.setItem('themeRgb', theme.rgb);
                                            }}
                                            className="w-7 h-7 md:w-8 md:h-8 rounded-full border border-white/10 hover:scale-110 transition-all hover:border-white focus:outline-none relative shadow-xl"
                                            style={{ backgroundColor: theme.color }}
                                        >
                                            <div className="absolute inset-0 bg-white/20 rounded-full opacity-0 hover:opacity-100 transition-opacity"></div>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="bg-slate-900/40 backdrop-blur-xl border border-white/10 p-6 md:p-8 rounded-[1.8rem] md:rounded-[2.5rem] shadow-2xl relative overflow-hidden group">
                                <h3 className="text-[9px] font-black text-white/60 uppercase tracking-[0.4em] mb-4 md:mb-6 flex items-center gap-3">
                                    <i className="fa-solid fa-language text-blue-400"></i> Global Locale
                                    {isSaving && <i className="fa-solid fa-circle-notch fa-spin text-xs ml-auto text-[var(--primary-color)]"></i>}
                                </h3>
                                <div className="grid grid-cols-1 gap-2">
                                    {LANGUAGES.map(lang => (
                                        <button 
                                            key={lang.code}
                                            onClick={() => handleLanguageSelect(lang.code)}
                                            disabled={isSaving}
                                            className={`px-5 py-3 md:px-6 md:py-4 rounded-xl md:rounded-2xl border text-[10px] md:text-[11px] font-black uppercase tracking-[0.2em] transition-all flex items-center justify-between group/lang ${selectedLang === lang.code ? 'bg-white text-black border-white shadow-2xl' : 'bg-slate-900/40 text-white/80 border-white/10 hover:border-white/30 hover:bg-slate-900/60'}`}
                                        >
                                            <div className="flex flex-col items-start leading-tight">
                                                <span>{lang.name}</span>
                                                <span className={`text-[7px] md:text-[8px] font-mono mt-0.5 ${selectedLang === lang.code ? 'text-black/50' : 'text-white/40'}`}>{lang.region}</span>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                {selectedLang === lang.code && <i className="fa-solid fa-check-double text-blue-500 animate-fade-in text-xs"></i>}
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </IntelligenceFrame>

                    <IntelligenceFrame title="Terminal Utilities" icon="fa-bolt">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
                            {[
                                { id: 'share', icon: 'fa-share-nodes', label: 'Share', color: 'text-emerald-400', url: 'https://www.tiktok.com/@menkirteamir?_r=1&_t=ZM-92PcIl7bzLQ' },
                                { id: 'updates', icon: 'fa-rocket', label: 'Updates', color: 'text-purple-400', url: INSTAGRAM_SUPPORT_LINK },
                                { id: 'tips', icon: 'fa-lightbulb', label: 'Tips', color: 'text-yellow-400', action: () => setActiveModal('tips') },
                                { id: 'privacy', icon: 'fa-user-lock', label: 'Privacy', color: 'text-red-400', action: () => setActiveModal('privacy') },
                            ].map(item => (
                                <button 
                                    key={item.id} 
                                    onClick={() => {
                                        if ('action' in item && item.action) {
                                            item.action();
                                        } else if ('url' in item && item.url !== '#') {
                                            window.open(item.url, '_blank');
                                        }
                                    }}
                                    className="bg-slate-900/60 backdrop-blur-xl border border-white/10 p-5 md:p-6 rounded-[1.5rem] md:rounded-3xl hover:bg-slate-950/80 transition-all group flex flex-col items-center gap-2 md:gap-3 shadow-lg"
                                >
                                    <i className={`fa-solid ${item.icon} ${item.color} text-xl md:text-2xl group-hover:scale-110 transition-transform drop-shadow-md`}></i>
                                    <span className="text-[8px] md:text-[9px] font-black uppercase tracking-widest text-white/80">{item.label}</span>
                                </button>
                            ))}
                        </div>
                    </IntelligenceFrame>

                    <div className="bg-slate-900/60 backdrop-blur-2xl border border-white/10 p-6 md:p-8 rounded-[1.8rem] md:rounded-[2.5rem] flex flex-col md:flex-row items-center justify-between gap-6 shadow-3xl">
                        <div className="flex items-center gap-4 text-center md:text-left">
                            <i className="fa-solid fa-circle-info text-white/60 text-xl hidden sm:block"></i>
                            <span className="text-xs md:text-sm font-bold text-white/80">Professional tactical support and verified legal framework access.</span>
                        </div>
                        <button 
                            onClick={() => window.open(INSTAGRAM_SUPPORT_LINK, '_blank')}
                            className="w-full md:w-auto text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em] px-8 py-3 bg-white/10 hover:bg-white/20 border border-white/20 rounded-full transition-all text-white shadow-xl"
                        >
                            Support Hub
                        </button>
                    </div>

                    <div className="pt-6 md:pt-10 pb-10 text-center space-y-4 opacity-80">
                        <div className="font-display font-black text-3xl md:text-4xl italic tracking-tighter uppercase text-slate-900 drop-shadow-sm">
                            OPTA<span className="text-slate-500">TV</span>
                        </div>
                        <div className="space-y-1">
                            <p className="text-[8px] md:text-[9px] font-mono uppercase tracking-[0.8em] text-slate-600">Version 1.0.1 (Build 2025)</p>
                            <p className="text-[7px] md:text-[8px] font-black uppercase tracking-widest text-slate-500">Designed by MENKIR</p>
                        </div>
                    </div>
                </div>
            </div>
            {activeModal && (
                <PremiumModal 
                    isOpen={!!activeModal} 
                    onClose={() => setActiveModal(null)}
                    title={activeModal === 'signin' ? 'Tactical Sync' : activeModal === 'tips' ? 'Tips & Tricks' : 'Privacy Policy'}
                    icon={activeModal === 'signin' ? 'fa-fingerprint' : activeModal === 'tips' ? 'fa-lightbulb' : 'fa-user-lock'}
                    content={modalContent[activeModal]}
                />
            )}
        </div>
    );
};

const App: React.FC = () => {
    const [activeTab, setActiveTab] = useState<View>("live");
    const [isOnline, setIsOnline] = useState(navigator.onLine);

    useEffect(() => {
        const storedColor = localStorage.getItem('themeColor');
        const storedRgb = localStorage.getItem('themeRgb');
        if (storedColor) document.documentElement.style.setProperty('--primary-color', storedColor);
        if (storedRgb) document.documentElement.style.setProperty('--primary-rgb', storedRgb);

        const handleOnline = () => setIsOnline(true);
        const handleOffline = () => setIsOnline(false);
        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);
        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, []);

    return (
        <div className="min-h-screen font-sans text-slate-200 selection:bg-[var(--primary-color)] selection:text-black">
            {!isOnline && (
                <div className="fixed top-0 left-0 right-0 z-[100] bg-red-600 text-white px-8 py-3 flex items-center justify-between font-black text-[10px] uppercase tracking-widest animate-pulse shadow-2xl">
                    <span>Offline Restricted</span>
                    <button onClick={() => window.location.reload()} className="bg-white text-red-600 px-4 py-1 rounded-full text-[9px]">Reconnect</button>
                </div>
            )}

            <main className="w-full mx-auto min-h-screen relative pb-20">
                {activeTab === "live" && (
                    <div className="animate-fade-in flex flex-col min-h-screen pb-32">
                        <div className="pt-8 md:pt-10 px-4 md:px-8 pb-4 md:pb-6 flex items-center justify-between z-30 sticky top-0 bg-slate-900/30 backdrop-blur-2xl border-b border-white/10 shadow-lg">
                            <div className="flex items-center gap-3 md:gap-4">
                                <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl bg-slate-900 flex items-center justify-center text-[var(--primary-color)] font-display font-black italic text-2xl md:text-3xl shadow-xl border border-white/10">O</div>
                                <span className="font-display font-black text-2xl md:text-3xl text-slate-900 uppercase tracking-tighter drop-shadow-sm">Opta<span className="text-slate-600">TV</span></span>
                            </div>
                            <a href="https://www.livescore.com/en/" target="_blank" rel="noreferrer" className="bg-slate-950 text-[var(--primary-color)] px-4 md:px-6 py-2 md:py-3 rounded-lg md:rounded-xl font-display text-sm md:text-xl font-black uppercase tracking-widest hover:brightness-125 transition-all shadow-2xl border border-white/5">LIVESCORE</a>
                        </div>
                        
                        <div className="flex-1 px-4 md:px-6 mt-6 md:mt-8">
                            <StreamPlayer />
                        </div>
                        
                        <div className="mt-8 px-4 md:px-6 pb-4">
                            <IntelligenceFrame title="Featured Competitions" icon="fa-trophy">
                                <div className="flex gap-4 md:gap-5 overflow-x-auto no-scrollbar pb-2 px-1">
                                    {COMPETITIONS.map((league) => <LeagueItem key={league.id} league={league} />)}
                                </div>
                            </IntelligenceFrame>
                        </div>
                    </div>
                )}
                {activeTab === "news" && <NewsTab />}
                {activeTab === "opta" && <OptaTab />}
                {activeTab === "settings" && <SettingsTab />}
            </main>

            <nav className="fixed bottom-6 left-5 right-5 md:left-6 md:right-6 z-50 bg-slate-900/80 backdrop-blur-3xl border border-white/10 h-20 md:h-24 rounded-[2rem] md:rounded-[2.5rem] shadow-[0_10px_50px_rgba(0,0,0,0.5)] flex items-center justify-around px-2">
                {[
                    { id: 'live', icon: 'fa-tv', label: 'LIVE' },
                    { id: 'news', icon: 'fa-newspaper', label: 'NEWS' }, 
                    { id: 'opta', icon: 'fa-microchip', label: 'OPTA' },
                    { id: 'settings', icon: 'fa-sliders', label: 'SETTING' },
                ].map((item) => (
                    <button 
                        key={item.id} 
                        onClick={() => setActiveTab(item.id as View)} 
                        className={`flex flex-col items-center justify-center w-16 md:w-20 h-14 md:h-16 rounded-xl md:rounded-2xl transition-all duration-500 relative group ${activeTab === item.id ? "text-black bg-[var(--primary-color)] scale-110 shadow-[0_0_40px_rgba(var(--primary-rgb),0.4)]" : "text-white/60 hover:text-white"}`}
                    >
                        <i className={`fa-solid ${item.icon} text-xl md:text-2xl mb-1 group-hover:scale-105 transition-transform`}></i>
                        <span className="text-[7px] md:text-[8px] font-black uppercase tracking-[0.2em]">{item.label}</span>
                    </button>
                ))}
            </nav>
        </div>
    );
};

const rootEl = document.getElementById("root");
if (rootEl) {
    createRoot(rootEl).render(<App />);
}