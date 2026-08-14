import React, { useState, useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../store/appStore";
import { toggleGptSearchView, setGptSearchView } from "../../features/gptSlice";
import { changeLanguage, setActiveNavTab } from "../../features/configSlice";
import { removeUser, setActiveProfile } from "../../features/userSlice";
import { auth } from "../../utils/firebase";
import { signOut } from "firebase/auth";
import { LOGO, USER_AVATARS, SUPPORTED_LANGUAGES } from "../../utils/constant";
import { language } from "../../utils/languageConstant";
import {
    Sparkles,
    Globe,
    ChevronDown,
    LogOut,
    Bookmark,
    Home,
    Tv,
    Film,
} from "lucide-react";

interface HeaderProps {
    showNavigation?: boolean;
}

export const Header: React.FC<HeaderProps> = ({ showNavigation = true }) => {
    const dispatch = useDispatch();
    const user = useSelector((state: RootState) => state.user.user);
    const activeProfile = useSelector((state: RootState) => state.user.activeProfile);
    const showGptSearch = useSelector((state: RootState) => state.gpt.showGptSearch);
    const langKey = useSelector((state: RootState) => state.config.lang);
    const activeNavTab = useSelector((state: RootState) => state.config.activeNavTab);
    const watchlist = useSelector((state: RootState) => state.watchlist.items);
    const lang = language[langKey] || language.en;

    const [isScrolled, setIsScrolled] = useState(false);
    const [showProfileMenu, setShowProfileMenu] = useState(false);
    const [showLangMenu, setShowLangMenu] = useState(false);

    const profileRef = useRef<HTMLDivElement>(null);
    const langRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 20);
        };
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
                setShowProfileMenu(false);
            }
            if (langRef.current && !langRef.current.contains(event.target as Node)) {
                setShowLangMenu(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleSignOut = () => {
        signOut(auth)
            .then(() => {
                dispatch(removeUser());
            })
            .catch(() => {
                dispatch(removeUser());
            });
    };

    const handleNavClick = (tab: string) => {
        dispatch(setActiveNavTab(tab));
        if (tab === "home" || tab === "movies" || tab === "tv") {
            dispatch(setGptSearchView(false));
        }
    };

    return (
        <>
            {/* Top Navigation Bar */}
            <header
                className={`fixed top-0 left-0 right-0 z-40 flex items-center justify-between px-3 sm:px-8 md:px-14 py-2.5 sm:py-4 transition-all duration-300 ${
                    isScrolled
                        ? "bg-[#141414]/95 backdrop-blur-md shadow-2xl border-b border-white/5"
                        : "bg-gradient-to-b from-black/80 via-black/40 to-transparent"
                }`}
            >
                {/* Left section: Logo & Desktop Navigation */}
                <div className="flex items-center gap-4 sm:gap-10">
                    <button
                        onClick={() => {
                            dispatch(setGptSearchView(false));
                            dispatch(setActiveNavTab("home"));
                        }}
                        className="focus:outline-none focus-visible:ring-2 focus-visible:ring-red-600 rounded"
                    >
                        <img
                            src={LOGO}
                            alt="Netflix Logo"
                            className="w-20 sm:w-28 md:w-32 object-contain hover:opacity-90 transition-opacity"
                        />
                    </button>

                    {user && showNavigation && (
                        <nav className="hidden md:flex items-center gap-5 lg:gap-7 text-xs lg:text-sm font-medium">
                            <button
                                onClick={() => handleNavClick("home")}
                                className={`transition-colors ${
                                    !showGptSearch && activeNavTab === "home"
                                        ? "text-white font-bold"
                                        : "text-gray-300 hover:text-white"
                                }`}
                            >
                                {lang.home}
                            </button>
                            <button
                                onClick={() => handleNavClick("tv")}
                                className={`transition-colors ${
                                    activeNavTab === "tv" ? "text-white font-bold" : "text-gray-300 hover:text-white"
                                }`}
                            >
                                {lang.tvShows}
                            </button>
                            <button
                                onClick={() => handleNavClick("movies")}
                                className={`transition-colors ${
                                    activeNavTab === "movies" ? "text-white font-bold" : "text-gray-300 hover:text-white"
                                }`}
                            >
                                {lang.movies}
                            </button>
                            <button
                                onClick={() => handleNavClick("watchlist")}
                                className={`flex items-center gap-1.5 transition-colors ${
                                    activeNavTab === "watchlist" ? "text-white font-bold" : "text-gray-300 hover:text-white"
                                }`}
                            >
                                <span>{lang.myList}</span>
                                {watchlist.length > 0 && (
                                    <span className="bg-red-600 text-white text-[10px] font-bold px-1.5 py-0.2 rounded-full">
                                        {watchlist.length}
                                    </span>
                                )}
                            </button>
                        </nav>
                    )}
                </div>

                {/* Right section: AI Search CTA, Language Selector, Profile */}
                <div className="flex items-center gap-2 sm:gap-4">
                    {user && (
                        <button
                            onClick={() => dispatch(toggleGptSearchView())}
                            className={`flex items-center gap-1.5 sm:gap-2 px-2.5 py-1.5 sm:px-4 sm:py-2 rounded-xl text-xs sm:text-sm font-bold transition-all duration-300 shadow-lg ${
                                showGptSearch
                                    ? "bg-white text-black hover:bg-white/90"
                                    : "bg-gradient-to-r from-red-600 to-rose-700 text-white hover:from-red-500 hover:to-rose-600 hover:shadow-red-600/40 hover:scale-105 active:scale-95"
                            }`}
                        >
                            <Sparkles className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${showGptSearch ? "text-red-600" : "text-amber-300"}`} />
                            <span className="hidden sm:inline">
                                {showGptSearch ? lang.home : lang.gptSearch}
                            </span>
                            <span className="sm:hidden">{showGptSearch ? "Home" : "AI"}</span>
                        </button>
                    )}

                    {/* Language selector */}
                    <div className="relative" ref={langRef}>
                        <button
                            onClick={() => setShowLangMenu(!showLangMenu)}
                            className="flex items-center gap-1 bg-black/50 hover:bg-white/10 text-white border border-white/20 px-2 py-1 sm:px-3 sm:py-2 rounded-lg text-xs font-semibold backdrop-blur-md transition-colors"
                            aria-label="Select Language"
                        >
                            <Globe className="w-3.5 h-3.5 text-gray-300" />
                            <span className="hidden sm:inline">
                                {SUPPORTED_LANGUAGES.find((l) => l.identifier === langKey)?.name || "English"}
                            </span>
                            <ChevronDown className="w-3 h-3 text-gray-400" />
                        </button>

                        {showLangMenu && (
                            <div className="absolute right-0 mt-2 w-44 sm:w-48 bg-[#1a1a1a] border border-white/10 rounded-xl shadow-2xl overflow-hidden py-1 z-50 animate-in fade-in zoom-in-95 duration-150">
                                {SUPPORTED_LANGUAGES.map((l) => (
                                    <button
                                        key={l.identifier}
                                        onClick={() => {
                                            dispatch(changeLanguage(l.identifier));
                                            setShowLangMenu(false);
                                        }}
                                        className={`w-full text-left px-3 sm:px-4 py-2 text-xs sm:text-sm flex items-center justify-between hover:bg-white/10 transition-colors ${
                                            langKey === l.identifier
                                                ? "text-red-500 font-bold bg-white/5"
                                                : "text-gray-300"
                                        }`}
                                    >
                                        <span className="flex items-center gap-2">
                                            <span>{l.flag}</span>
                                            <span>{l.name}</span>
                                        </span>
                                        {langKey === l.identifier && <span className="text-red-500">✓</span>}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* User Profile dropdown */}
                    {user && (
                        <div className="relative" ref={profileRef}>
                            <button
                                onClick={() => setShowProfileMenu(!showProfileMenu)}
                                className="flex items-center gap-1.5 focus:outline-none group"
                                aria-label="User Profile Menu"
                            >
                                <img
                                    src={
                                        activeProfile && !activeProfile.includes("nflxso.net")
                                            ? activeProfile
                                            : user.photoURL && !user.photoURL.includes("nflxso.net")
                                                ? user.photoURL
                                                : USER_AVATARS[0].url
                                    }
                                    alt="User Avatar"
                                    onError={(e) => {
                                        (e.target as HTMLImageElement).src = USER_AVATARS[0].url;
                                    }}
                                    className="w-7 h-7 sm:w-9 sm:h-9 rounded-md object-cover border-2 border-transparent group-hover:border-white transition-colors shadow-md"
                                />
                                <ChevronDown className="w-3 h-3 text-gray-400 group-hover:text-white transition-colors hidden sm:block" />
                            </button>

                            {showProfileMenu && (
                                <div className="absolute right-0 mt-2 w-64 sm:w-72 bg-[#191919] border border-white/10 rounded-xl shadow-2xl p-3.5 z-50 animate-in fade-in zoom-in-95 duration-150 space-y-3">
                                    <div className="border-b border-white/10 pb-2.5">
                                        <p className="text-xs text-gray-400">Signed in as</p>
                                        <p className="text-sm font-bold text-white truncate">
                                            {user.displayName || user.email || "Netflix Member"}
                                        </p>
                                    </div>

                                    {/* Avatar Switcher */}
                                    <div>
                                        <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-2">
                                            Switch Avatar
                                        </p>
                                        <div className="grid grid-cols-5 gap-1.5">
                                            {USER_AVATARS.map((av) => (
                                                <button
                                                    key={av.id}
                                                    onClick={() => {
                                                        dispatch(setActiveProfile(av.url));
                                                    }}
                                                    title={av.name}
                                                    className={`rounded-md p-0.5 transition-all ${
                                                        activeProfile === av.url
                                                            ? "ring-2 ring-red-600 scale-105 opacity-100"
                                                            : "opacity-60 hover:opacity-100"
                                                    }`}
                                                >
                                                    <img
                                                        src={av.url}
                                                        alt={av.name}
                                                        onError={(e) => {
                                                            (e.target as HTMLImageElement).src = USER_AVATARS[0].url;
                                                        }}
                                                        className="w-full aspect-square rounded object-cover"
                                                    />
                                                </button>
                                            ))}
                                        </div>
                                    </div>


                                    <div className="border-t border-white/10 pt-2 space-y-1">
                                        <button
                                            onClick={() => {
                                                dispatch(setActiveNavTab("watchlist"));
                                                setShowProfileMenu(false);
                                            }}
                                            className="w-full flex items-center gap-2.5 text-xs text-gray-300 hover:text-white hover:bg-white/10 px-3 py-2 rounded-lg transition-colors text-left"
                                        >
                                            <Bookmark className="w-4 h-4 text-red-500" />
                                            <span>{lang.myList} ({watchlist.length})</span>
                                        </button>

                                        <button
                                            onClick={handleSignOut}
                                            className="w-full flex items-center gap-2.5 text-xs text-red-400 hover:text-red-300 hover:bg-red-500/10 px-3 py-2 rounded-lg transition-colors text-left font-semibold"
                                        >
                                            <LogOut className="w-4 h-4" />
                                            <span>{lang.signOut}</span>
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </header>

            {/* Mobile Bottom Navigation Bar (Visible on mobile/tablets < 768px) */}
            {user && showNavigation && (
                <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#141414]/95 backdrop-blur-xl border-t border-white/10 px-2 py-2 flex items-center justify-around text-[10px] font-medium shadow-2xl">
                    <button
                        onClick={() => handleNavClick("home")}
                        className={`flex flex-col items-center gap-1 px-3 py-1 rounded-lg transition-colors ${
                            !showGptSearch && activeNavTab === "home"
                                ? "text-red-500 font-bold"
                                : "text-gray-400 hover:text-white"
                        }`}
                    >
                        <Home className="w-5 h-5" />
                        <span>{lang.home}</span>
                    </button>

                    <button
                        onClick={() => handleNavClick("movies")}
                        className={`flex flex-col items-center gap-1 px-3 py-1 rounded-lg transition-colors ${
                            activeNavTab === "movies" ? "text-red-500 font-bold" : "text-gray-400 hover:text-white"
                        }`}
                    >
                        <Film className="w-5 h-5" />
                        <span>{lang.movies}</span>
                    </button>

                    <button
                        onClick={() => handleNavClick("tv")}
                        className={`flex flex-col items-center gap-1 px-3 py-1 rounded-lg transition-colors ${
                            activeNavTab === "tv" ? "text-red-500 font-bold" : "text-gray-400 hover:text-white"
                        }`}
                    >
                        <Tv className="w-5 h-5" />
                        <span>{lang.tvShows}</span>
                    </button>

                    <button
                        onClick={() => dispatch(toggleGptSearchView())}
                        className={`flex flex-col items-center gap-1 px-3 py-1 rounded-lg transition-colors ${
                            showGptSearch ? "text-red-500 font-bold" : "text-amber-400 hover:text-white"
                        }`}
                    >
                        <Sparkles className="w-5 h-5" />
                        <span>AI Search</span>
                    </button>

                    <button
                        onClick={() => handleNavClick("watchlist")}
                        className={`relative flex flex-col items-center gap-1 px-3 py-1 rounded-lg transition-colors ${
                            activeNavTab === "watchlist" ? "text-red-500 font-bold" : "text-gray-400 hover:text-white"
                        }`}
                    >
                        <Bookmark className="w-5 h-5" />
                        <span>{lang.myList}</span>
                        {watchlist.length > 0 && (
                            <span className="absolute top-0 right-2 w-4 h-4 bg-red-600 text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                                {watchlist.length}
                            </span>
                        )}
                    </button>
                </nav>
            )}
        </>
    );
};

export default Header;
