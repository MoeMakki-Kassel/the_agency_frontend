import { useEffect, useState } from "react";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router";
import { useAuth } from "../components/AuthProvider";
import { authFetch } from "../auth/authSession";
import { formFieldDirProps } from "../utils/formFieldDir";
import { useLanguage } from "../contexts/LanguageContext";
import { useAppLocale, formatEventDateTime } from "../hooks/useAppLocale";
import { usePriceFormat } from "../hooks/usePriceFormat";
import { BidiLtr } from "../components/BidiLtr";
import { PhoneCountryField } from "../components/PhoneCountryField";
import { COUNTRY_DIAL_CODES, getCountryByIso } from "../data/countryDialCodes";
import { parseE164ToForm } from "../utils/phoneValidation";
import { getUserFacingErrorMessage, messageFromApiBody } from "../utils/userFacingError";
import { validateProfileForm } from "../utils/profileFormValidation";
import { Download } from "lucide-react";

type ProfileData = {
  first_name: string;
  last_name?: string | null;
  email: string;
  phone?: string | null;
  age?: number | null;
};

type ReservationItem = {
  id: string;
  price: number;
  tiers?: { name?: string | null } | null;
  seats?: { seat_number?: string | null } | null;
};

type Reservation = {
  id: string;
  reference_number?: number | null;
  total_amount: number;
  payment_status: string;
  created_at: string;
  events?: {
    title?: string | null;
    date_time?: string | null;
    location_name?: string | null;
  } | null;
  reservation_items?: ReservationItem[];
};

export function Profile() {
  const { session, refreshProfile } = useAuth();
  const { t, isRTL } = useLanguage();
  const locale = useAppLocale();
  const { formatPrice } = usePriceFormat();
  const navigate = useNavigate();
  const API_URL = import.meta.env.VITE_API_URL;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [formData, setFormData] = useState<ProfileData>({
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    age: null,
  });
  const [phoneCountryIso, setPhoneCountryIso] = useState("JO");
  const [phoneNational, setPhoneNational] = useState("");
  const [phoneInvalid, setPhoneInvalid] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const [downloading, setDownloading] = useState<{ id: string; kind: "tickets" | "receipt" } | null>(null);

  const authHeaders = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${session?.access_token ?? ""}`,
  };

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [profileRes, reservationsRes] = await Promise.all([
        authFetch(`${API_URL}/users/me`, { headers: { "Content-Type": "application/json" } }),
        authFetch(`${API_URL}/reservations/me?limit=20&offset=0`, {
          headers: { "Content-Type": "application/json" },
        }),
      ]);

      const profileData = await profileRes.json();
      const reservationsData = await reservationsRes.json();

      if (!profileRes.ok) {
        throw new Error(profileData.error || "Failed to load profile");
      }
      if (!reservationsRes.ok) {
        throw new Error(reservationsData.error || "Failed to load reservations");
      }

      const parsed = parseE164ToForm(profileData.phone);
      setPhoneCountryIso(parsed.phoneCountryIso);
      setPhoneNational(parsed.phoneNational);
      setPhoneInvalid(false);
      setFormData({
        first_name: profileData.first_name ?? "",
        last_name: profileData.last_name ?? "",
        email: profileData.email ?? "",
        phone: profileData.phone ?? "",
        age: profileData.age ?? null,
      });
      setReservations(reservationsData.data ?? []);
    } catch (err: unknown) {
      setError(getUserFacingErrorMessage(err, t("profile.loadError"), t));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (session?.access_token) {
      fetchData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session?.access_token]);

  const downloadReservationPdf = async (reservationId: string, kind: "tickets" | "receipt") => {
    const token = session?.access_token;
    if (!API_URL || !token) {
      setError(t("profile.downloadError"));
      return;
    }
    setDownloading({ id: reservationId, kind });
    setError(null);
    try {
      const path =
        kind === "tickets"
          ? `${API_URL}/tickets/reservation/${reservationId}/tickets.pdf`
          : `${API_URL}/tickets/reservation/${reservationId}/receipt.pdf`;
      const res = await authFetch(path);
      if (!res.ok) {
        const errBody = await res.json().catch(() => ({}));
        throw new Error((errBody as { error?: string }).error || res.statusText);
      }
      const blob = await res.blob();
      const cd = res.headers.get("Content-Disposition");
      let filename =
        kind === "tickets" ? `tickets-${reservationId.slice(0, 8)}.pdf` : `receipt-${reservationId.slice(0, 8)}.pdf`;
      const m = cd && /filename="([^"]+)"/.exec(cd);
      if (m?.[1]) filename = m[1];
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      a.rel = "noopener";
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (e: unknown) {
      setError(getUserFacingErrorMessage(e, t("profile.downloadError"), t));
    } finally {
      setDownloading(null);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(null);
    setFieldErrors({});

    const validated = validateProfileForm(
      {
        first_name: formData.first_name,
        last_name: formData.last_name ?? "",
        phoneCountryIso,
        phoneNational,
        age: formData.age != null ? String(formData.age) : "",
      },
      t,
    );

    if (!validated.ok) {
      setFieldErrors(validated.errors);
      setPhoneInvalid(Boolean(validated.errors.phone));
      setSaving(false);
      return;
    }
    setPhoneInvalid(false);

    try {
      const payload: Record<string, string | number> = {
        first_name: formData.first_name.trim(),
        last_name: formData.last_name?.trim() ?? "",
        phone: validated.phoneE164 ?? "",
        age: Number(formData.age),
      };

      const response = await fetch(`${API_URL}/users/me`, {
        method: "PUT",
        headers: authHeaders,
        body: JSON.stringify(payload),
      });
      const data = await response.json();
      if (!response.ok) {
        setError(messageFromApiBody(data, t("profile.saveError"), t));
        setSaving(false);
        return;
      }

      const parsed = parseE164ToForm(data.phone);
      setPhoneCountryIso(parsed.phoneCountryIso);
      setPhoneNational(parsed.phoneNational);
      setFormData((prev) => ({
        ...prev,
        first_name: data.first_name ?? prev.first_name,
        last_name: data.last_name ?? "",
        phone: data.phone ?? "",
        age: data.age ?? null,
      }));
      setSuccess(t("profile.saveSuccess"));
      await refreshProfile();
    } catch (err: unknown) {
      setError(getUserFacingErrorMessage(err, t("profile.saveError"), t));
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="max-w-[1200px] mx-auto px-4 py-10">{t("profile.loading")}</div>;
  }

  return (
    <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-6">
        <ArrowLeft size={18} /><span className="text-sm font-medium">{t("common.back")}</span>
      </button>
      <h1 className="text-3xl font-bold text-foreground mb-6">{t("profile.title")}</h1>

      {error && <div className="mb-6 p-4 rounded-lg bg-red-50 text-red-700 border border-red-200">{error}</div>}
      {success && <div className="mb-6 p-4 rounded-lg bg-green-50 text-green-700 border border-green-200">{success}</div>}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <section className="lg:col-span-1 min-w-0 bg-card text-card-foreground border border-border rounded-xl p-6 h-fit">
          <h2 className="text-xl font-semibold mb-4">{t("profile.myInfo")}</h2>
          <form onSubmit={handleSave} className="space-y-4">
            <div>
              <label className="text-sm font-medium text-foreground block mb-1">{t("profile.firstName")}</label>
              <input
                type="text"
                value={formData.first_name}
                onChange={(e) => {
                  setFieldErrors((prev) => ({ ...prev, first_name: "" }));
                  setFormData((p) => ({ ...p, first_name: e.target.value }));
                }}
                required
                aria-invalid={Boolean(fieldErrors.first_name)}
                {...formFieldDirProps(
                  isRTL,
                  "text",
                  `w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/40 ${
                    fieldErrors.first_name ? "border-red-500" : "border-border"
                  }`,
                )}
              />
              {fieldErrors.first_name && (
                <p className="mt-1 text-sm text-red-600">{fieldErrors.first_name}</p>
              )}
            </div>
            <div>
              <label className="text-sm font-medium text-foreground block mb-1">{t("profile.lastName")}</label>
              <input
                type="text"
                value={formData.last_name ?? ""}
                onChange={(e) => {
                  setFieldErrors((prev) => ({ ...prev, last_name: "" }));
                  setFormData((p) => ({ ...p, last_name: e.target.value }));
                }}
                required
                aria-invalid={Boolean(fieldErrors.last_name)}
                {...formFieldDirProps(
                  isRTL,
                  "text",
                  `w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/40 ${
                    fieldErrors.last_name ? "border-red-500" : "border-border"
                  }`,
                )}
              />
              {fieldErrors.last_name && (
                <p className="mt-1 text-sm text-red-600">{fieldErrors.last_name}</p>
              )}
            </div>
            <div>
              <label className="text-sm font-medium text-foreground block mb-1">{t("profile.email")}</label>
              <input
                type="email"
                value={formData.email}
                disabled
                {...formFieldDirProps(
                  isRTL,
                  "latin",
                  "w-full border border-border rounded-lg px-3 py-2 bg-muted text-muted-foreground",
                )}
              />
            </div>
            <div className="min-w-0 w-full">
              <label className="text-sm font-medium text-foreground block mb-1">{t("profile.phone")}</label>
              <PhoneCountryField
                country={getCountryByIso(phoneCountryIso) ?? COUNTRY_DIAL_CODES[0]}
                onCountryChange={(iso) => {
                  setPhoneInvalid(false);
                  setFieldErrors((prev) => ({ ...prev, phone: "" }));
                  setPhoneCountryIso(iso);
                }}
                nationalNumber={phoneNational}
                onNationalNumberChange={(n) => {
                  setPhoneInvalid(false);
                  setFieldErrors((prev) => ({ ...prev, phone: "" }));
                  setPhoneNational(n);
                }}
                nationalPlaceholder={t("login.phoneNationalPlaceholder")}
                required
                invalid={phoneInvalid || Boolean(fieldErrors.phone)}
              />
              {fieldErrors.phone && (
                <p className="mt-1 text-sm text-red-600">{fieldErrors.phone}</p>
              )}
            </div>
            <div>
              <label className="text-sm font-medium text-foreground block mb-1">{t("profile.age")}</label>
              <input
                type="number"
                min={13}
                max={120}
                required
                value={formData.age ?? ""}
                onChange={(e) => {
                  setFieldErrors((prev) => ({ ...prev, age: "" }));
                  setFormData((p) => ({
                    ...p,
                    age: e.target.value ? Number(e.target.value) : null,
                  }));
                }}
                aria-invalid={Boolean(fieldErrors.age)}
                {...formFieldDirProps(
                  isRTL,
                  "latin",
                  `w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/40 ${
                    fieldErrors.age ? "border-red-500" : "border-border"
                  }`,
                )}
              />
              {fieldErrors.age && (
                <p className="mt-1 text-sm text-red-600">{fieldErrors.age}</p>
              )}
            </div>
            <button
              type="submit"
              disabled={saving}
              className="w-full px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-accent transition-colors disabled:opacity-60"
            >
              {saving ? t("profile.saving") : t("profile.save")}
            </button>
          </form>
        </section>

        <section className="lg:col-span-2 bg-card text-card-foreground border border-border rounded-xl p-6">
          <h2 className="text-xl font-semibold mb-4">{t("profile.myReservations")}</h2>
          {reservations.length === 0 ? (
            <p className="text-muted-foreground">{t("profile.noReservations")}</p>
          ) : (
            <div className="space-y-4">
              {reservations.map((reservation) => (
                <article key={reservation.id} className="border border-border rounded-lg p-4">
                  <div className="flex flex-wrap gap-2 items-center justify-between mb-2">
                    <h3 className="font-semibold text-foreground">{reservation.events?.title || t("profile.untitledEvent")}</h3>
                    <span className="text-xs px-2 py-1 rounded-full bg-muted text-muted-foreground uppercase">
                      {reservation.payment_status}
                    </span>
                  </div>
                  <div className="text-sm text-muted-foreground space-y-1">
                    <p>
                      {t("profile.reference")}:{" "}
                      {reservation.reference_number != null ? (
                        <BidiLtr>{reservation.reference_number}</BidiLtr>
                      ) : (
                        "-"
                      )}
                    </p>
                    <p>
                      {t("profile.total")}: {formatPrice(reservation.total_amount)}
                    </p>
                    <p>
                      {t("profile.date")}:{" "}
                      {formatEventDateTime(reservation.created_at, locale, {
                        dateStyle: "medium",
                        timeStyle: "short",
                      })}
                    </p>
                    <p>
                      {t("profile.venue")}: {reservation.events?.location_name || "-"}
                    </p>
                    <p>
                      {t("profile.seats")}:{" "}
                      {reservation.reservation_items?.map((item) => item.seats?.seat_number).filter(Boolean).join(", ") || "-"}
                    </p>
                    {reservation.payment_status === "paid" && (
                      <div className="flex flex-wrap gap-2 pt-3 mt-2 border-t border-border">
                        <button
                          type="button"
                          disabled={downloading?.id === reservation.id}
                          onClick={() => void downloadReservationPdf(reservation.id, "tickets")}
                          className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-black text-foreground text-sm font-medium hover:bg-black hover:text-white transition-colors disabled:opacity-50"
                        >
                          <Download className="w-4 h-4 shrink-0" />
                          {downloading?.id === reservation.id && downloading.kind === "tickets"
                            ? t("profile.downloading")
                            : t("profile.downloadTickets")}
                        </button>
                        <button
                          type="button"
                          disabled={downloading?.id === reservation.id}
                          onClick={() => void downloadReservationPdf(reservation.id, "receipt")}
                          className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-border text-foreground text-sm font-medium hover:border-primary hover:bg-white/5 transition-colors disabled:opacity-50"
                        >
                          <Download className="w-4 h-4 shrink-0" />
                          {downloading?.id === reservation.id && downloading.kind === "receipt"
                            ? t("profile.downloading")
                            : t("profile.downloadReceipt")}
                        </button>
                      </div>
                    )}
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
