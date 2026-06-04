import { Star, Music, Users, Globe, ArrowLeft } from "lucide-react";
import artistPhoto from "../../imports/photo-1.png";
import { useEffect } from "react";
import { useNavigate } from "react-router";
import { useLanguage } from "../contexts/LanguageContext";

export function About() {
  const { t } = useLanguage();
  const navigate = useNavigate();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section  test1*/}
      <section className="bg-hero-noir text-white py-24">
        <div className="max-w-[1200px] mx-auto px-6">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-white/70 hover:text-white transition-colors mb-6"
          >
            <ArrowLeft size={18} />
            <span className="text-sm font-medium">{t("common.back")}</span>
          </button>
          <h1 className="text-5xl md:text-7xl font-bold font-['Tajawal'] mb-6">
            {t("about.title")}
          </h1>
          <p className="text-xl text-white/80 max-w-3xl">
            {t("about.subtitle")}
          </p>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-24">
        <div className="max-w-[1200px] mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-4xl font-bold font-['Tajawal'] text-foreground mb-6">
                {t("about.mission.title")}
              </h2>
              <p className="text-lg text-muted-foreground mb-6">
                {t("about.mission.p1")}{" "}
              </p>
              <p className="text-lg text-muted-foreground">{t("about.mission.p2")} </p>
            </div>
            <div className="relative">
              <img
                src={artistPhoto}
                alt="Live performance"
                className="w-full h-[500px] object-cover rounded-xl shadow-2xl"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-24 bg-background">
        <div className="max-w-[1200px] mx-auto px-6">
          <h2 className="text-4xl font-bold font-['Tajawal'] text-foreground text-center mb-16">
            {t("about.values.title")}{" "}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-black/10 flex items-center justify-center mx-auto mb-4">
                <Star className="w-8 h-8 text-foreground" />
              </div>
              <h3 className="text-xl font-bold text-foreground mb-3">
                {t("about.values.quality.title")}{" "}
              </h3>
              <p className="text-muted-foreground">
                {t("about.values.quality.desc")}{" "}
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-black/10 flex items-center justify-center mx-auto mb-4">
                <Music className="w-8 h-8 text-foreground" />
              </div>
              <h3 className="text-xl font-bold text-foreground mb-3">
                {t("about.values.diversity.title")}{" "}
              </h3>
              <p className="text-muted-foreground">
                {t("about.values.diversity.desc")}
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-black/10 flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-foreground" />
              </div>
              <h3 className="text-xl font-bold text-foreground mb-3">
                {t("about.values.community.title")}{" "}
              </h3>
              <p className="text-muted-foreground">
                {t("about.values.community.desc")}
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-black/10 flex items-center justify-center mx-auto mb-4">
                <Globe className="w-8 h-8 text-foreground" />
              </div>
              <h3 className="text-xl font-bold text-foreground mb-3">
                {t("about.values.accessibility.title")}
              </h3>
              <p className="text-muted-foreground">
                {t("about.values.accessibility.desc")}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-24 bg-hero-noir text-white">
        <div className="max-w-[1200px] mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-5xl font-bold font-['Space_Grotesk'] text-white mb-2">
                500+
              </div>
              <p className="text-white/70">{t("about.stats.events")} </p>
            </div>
            <div>
              <div className="text-5xl font-bold font-['Space_Grotesk'] text-white mb-2">
                50K+
              </div>
              <p className="text-white/70">{t("about.stats.tickets")} </p>
            </div>
            <div>
              <div className="text-5xl font-bold font-['Space_Grotesk'] text-white mb-2">
                200+
              </div>
              <p className="text-white/70">{t("about.stats.artists")} </p>
            </div>
            <div>
              <div className="text-5xl font-bold font-['Space_Grotesk'] text-white mb-2">
                8
              </div>
              <p className="text-white/70">{t("about.stats.countries")} </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
