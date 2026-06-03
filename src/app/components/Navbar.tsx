import { Link, useNavigate, useLocation } from "react-router";
import { Globe, Search, Menu, X, CircleUserRound, LogOut } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { SiteLogo } from "./SiteLogo";
import { useLanguage } from "../contexts/LanguageContext";
import { useAuth } from "./AuthProvider";

export function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [langOpen, setLangOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const { language, setLanguage, t } = useLanguage();
  const { user, displayName, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const goLogin = () => {
    navigate("/login", {
      state: location.pathname === "/login" ? location.state : { from: location },
    });
  };

  const langRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (langRef.current && !langRef.current.contains(event.target as Node)) {
        setLangOpen(false);
      }
      if (
        profileRef.current &&
        !profileRef.current.contains(event.target as Node)
      ) {
        setProfileOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const navLabel = displayName || t("nav.profile");

  const handleLogout = async () => {
    await signOut();
    setProfileOpen(false);
    setMobileMenuOpen(false);
    navigate("/", { replace: true });
  };

  return (
    <nav className="sticky top-0 z-50 w-full bg-white/95 backdrop-blur-md border-b border-[#e8e8e8] shadow-sm">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 h-[72px] flex items-center justify-between">
        {/* Left */}
        <Link to="/" className="flex items-center gap-2">
          <SiteLogo variant="default" className="cursor-pointer hover:opacity-80 transition-opacity" />
        </Link>

        {/* Center */}
        <div className="hidden md:flex items-center gap-4 lg:gap-8 text-sm font-medium">
          <Link to="/" className="text-black hover:text-[#525252] transition-colors">{t('nav.home')}</Link>
          <Link to="/events" className="text-black hover:text-[#525252] transition-colors">{t('nav.events')}</Link>
          <Link to="/about" className="text-black hover:text-[#525252] transition-colors">{t('nav.about')}</Link>
          {/* <Link to="/venues" className="text-black hover:text-[#525252] transition-colors">{t('nav.venues')}</Link> */}
          <Link
            to="/contact"
            className="text-black hover:text-[#525252] transition-colors"
          >
            {t("nav.contact")}
          </Link>
        </div>

        {/* Right */}
        <div className="hidden md:flex items-center gap-2 lg:gap-4">
          <div className="relative" ref={langRef}>
            <button
              onClick={() => setLangOpen(!langOpen)}
              className="flex items-center gap-1 text-black hover:text-[#525252] transition-colors p-2 rounded-full hover:bg-[#e8e8e8]"
            >
              <Globe className="w-5 h-5" />
              <span className="text-xs font-semibold">{language}</span>
            </button>
            {langOpen && (
              <div className="absolute end-0 mt-2 w-32 bg-white rounded-xl shadow-lg border border-[#e8e8e8] py-2 z-50">
                {(["EN", "AR"] as const).map((lang) => (
                  <button
                    key={lang}
                    onClick={() => {
                      setLanguage(lang);
                      setLangOpen(false);
                    }}
                    className="w-full text-start px-4 py-2 hover:bg-[#e8e8e8] text-sm font-medium"
                  >
                    {lang === "EN" ? "English" : "العربية"}
                  </button>
                ))}
              </div>
            )}
          </div>

          {user ? (
            <>
              <div className="relative" ref={profileRef}>
                <button
                  onClick={() => setProfileOpen(!profileOpen)}
                  className="flex items-center gap-2 px-3 lg:px-4 py-2 rounded-full border border-[#e8e8e8] hover:bg-[#e8e8e8] transition-colors"
                >
                  <CircleUserRound className="w-5 h-5 text-black" />
                  <span className="text-sm font-medium text-black truncate max-w-[180px]">
                    {navLabel}
                  </span>
                </button>
                {profileOpen && (
                  <div className="absolute right-0 mt-2 w-52 bg-white rounded-xl shadow-lg border border-[#e8e8e8] py-2 z-50">
                    <div className="px-4 py-2 text-xs text-[#525252] border-b border-[#e8e8e8]">
                      {t("nav.profile")}
                    </div>
                    <div className="px-4 py-2 text-sm font-medium text-black truncate">
                      {navLabel}
                    </div>
                    {user?.email && navLabel !== user.email && (
                      <div className="px-4 pb-2 text-xs text-[#8c8c8c] truncate">
                        {user.email}
                      </div>
                    )}
                    <button
                      onClick={() => {
                        setProfileOpen(false);
                        navigate("/profile");
                      }}
                      className="w-full text-left px-4 py-2 hover:bg-[#e8e8e8] text-sm font-medium text-black"
                    >
                      {t("nav.myProfile")}
                    </button>
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2 hover:bg-[#e8e8e8] text-sm font-medium text-black flex items-center gap-2"
                    >
                      <LogOut className="w-4 h-4" />
                      {t("nav.logout")}
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <button
              type="button"
              onClick={goLogin}
              className="px-3 lg:px-5 py-2 rounded-full bg-primary text-primary-foreground font-medium hover:bg-accent transition-colors text-sm shadow-[0_4px_12px_rgba(220,38,38,0.3)]"
            >
              {t("nav.signIn")}
            </button>
          )}
        </div>

        {/* Mobile Toggle */}
        <button
          className="md:hidden p-2 text-black"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? (
            <X className="w-6 h-6" />
          ) : (
            <Menu className="w-6 h-6" />
          )}
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white absolute top-full left-0 w-full border-b border-[#e8e8e8] p-4 flex flex-col gap-4 shadow-lg z-40">
          <Link to="/" onClick={() => setMobileMenuOpen(false)} className="text-black font-medium text-lg">{t('nav.home')}</Link>
          <Link to="/events" onClick={() => setMobileMenuOpen(false)} className="text-black font-medium text-lg">{t('nav.events')}</Link>
          <Link to="/about" onClick={() => setMobileMenuOpen(false)} className="text-black font-medium text-lg">{t('nav.about')}</Link>
          {/* <Link to="/venues" onClick={() => setMobileMenuOpen(false)} className="text-black font-medium text-lg">{t('nav.venues')}</Link> */}
          <Link
            to="/contact"
            onClick={() => setMobileMenuOpen(false)}
            className="text-black font-medium text-lg"
          >
            {t("nav.contact")}
          </Link>

          <div className="flex items-center gap-4 pt-4 border-t border-[#e8e8e8]">
            <div className="flex flex-col gap-2 w-full">
              <span className="text-sm text-[#525252]">
                {t("nav.language")}
              </span>
              <div className="flex gap-2">
                {(["EN", "AR"] as const).map((lang) => (
                  <button
                    key={lang}
                    onClick={() => setLanguage(lang)}
                    className={`px-3 py-1 rounded-full text-sm font-medium ${language === lang ? "bg-black text-white" : "bg-[#e8e8e8] text-black"}`}
                  >
                    {lang === "EN" ? "English" : "العربية"}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {user ? (
            <div className="flex flex-col gap-3 mt-4 border-t border-[#e8e8e8] pt-4">
              <div className="flex items-center gap-2 text-black font-medium">
                <CircleUserRound className="w-5 h-5" />
                <span>{navLabel}</span>
              </div>
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  navigate("/profile");
                }}
                className="w-full px-5 py-3 rounded-full border border-[#e8e8e8] text-black font-medium hover:bg-[#e8e8e8] transition-colors"
              >
                {t("nav.myProfile")}
              </button>
              <button
                onClick={handleLogout}
                className="w-full px-5 py-3 rounded-full border-2 border-black text-black font-medium hover:bg-[#e8e8e8] transition-colors flex items-center justify-center gap-2"
              >
                <LogOut className="w-4 h-4" />
                {t("nav.logout")}
              </button>
            </div>
          ) : (
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                goLogin();
              }}
              className="w-full px-5 py-3 rounded-full border-2 border-black text-black font-medium hover:bg-[#e8e8e8] transition-colors mt-4"
            >
              {t("nav.signIn")}
            </button>
          )}
        </div>
      )}
    </nav>
  );
}
