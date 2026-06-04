import { useEffect, useState } from "react";
import { CheckCircle, XCircle } from "lucide-react";
import { Link } from "react-router";

type PaymentStatus = "paid" | "failed" | "loading";

export default function PaymentResult() {
  const [status, setStatus] = useState<PaymentStatus>("loading");
  const [reservationId, setReservationId] = useState<string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const s = params.get("status");
    const r = params.get("reservation_id");
    setReservationId(r);
    setStatus(s === "paid" ? "paid" : "failed");
  }, []);

  if (status === "loading") {
    return (
      <div className="bg-background min-h-screen flex items-center justify-center font-['Inter']">
        <p className="text-muted-foreground">Processing your payment…</p>
      </div>
    );
  }

  const isPaid = status === "paid";

  return (
    <div className="bg-background min-h-screen flex items-center justify-center font-['Inter'] px-4 py-16">
      <div className="w-full max-w-md text-center space-y-6">

        {/* Icon */}
        <div
          className={`w-24 h-24 rounded-full flex items-center justify-center mx-auto ${
            isPaid ? "bg-green-100 text-green-500" : "bg-red-100 text-red-500"
          }`}
        >
          {isPaid ? <CheckCircle size={48} /> : <XCircle size={48} />}
        </div>

        {/* Heading */}
        <h1 className={`text-3xl font-bold font-['Tajawal'] ${isPaid ? "text-green-500" : "text-red-500"}`}>
          {isPaid ? "Payment Successful!" : "Payment Failed"}
        </h1>

        {/* Sub-message */}
        <p className="text-muted-foreground">
          {isPaid
            ? "Your tickets have been confirmed. Check your email for details."
            : "Your payment could not be processed. Please try again."}
        </p>

        {/* QR / reference card */}
        {isPaid && reservationId && (
          <div className="bg-card text-card-foreground p-6 rounded-2xl max-w-sm mx-auto my-8 border border-border">
            {/* <div className="w-48 h-48 bg-white mx-auto flex items-center justify-center p-2 mb-4 border border-border rounded-lg">
              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(reservationId)}`}
                alt="Booking QR Code"
                className="w-full h-full"
              />
            </div> */}
            <p className="text-sm text-muted-foreground">Booking reference</p>
            <p className="font-mono font-bold text-foreground mt-1">{reservationId}</p>
          </div>
        )}

        {!isPaid && reservationId && (
          <p className="text-sm text-muted-foreground font-mono">
            Reference: {reservationId}
          </p>
        )}

        {/* Actions */}
        <div className="flex flex-col gap-3 max-w-xs mx-auto">
          {isPaid ? (
            <>
              <Link
                to="/profile"
                className="py-3 bg-black text-white font-bold rounded-lg hover:bg-[#525252] transition-colors text-center"
              >
                View My Tickets
              </Link>
              <Link
                to="/events"
                className="py-3 border-2 border-primary text-primary font-bold rounded-lg hover:bg-primary hover:text-primary-foreground transition-colors text-center"
              >
                Browse More Events
              </Link>
            </>
          ) : (
            <>
              <button
                onClick={() => window.history.back()}
                className="py-3 bg-black text-white font-bold rounded-lg hover:bg-[#525252] transition-colors"
              >
                Try Again
              </button>
              <Link
                to="/events"
                className="py-3 border-2 border-primary text-primary font-bold rounded-lg hover:bg-primary hover:text-primary-foreground transition-colors text-center"
              >
                Browse Events
              </Link>
            </>
          )}
        </div>

      </div>
    </div>
  );
}
