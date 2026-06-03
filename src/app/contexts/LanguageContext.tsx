import React, { createContext, useContext, useState, useEffect } from "react";

export type Language = "EN" | "AR";

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
  isRTL: boolean;
}

const LanguageContext = createContext<LanguageContextType | undefined>(
  undefined,
);

const translations = {
  EN: {
    // Navbar
    "nav.home": "Home",
    "nav.events": "Events",
    "nav.about": "About",
    "nav.venues": "Venues",
    "nav.contact": "Contact",
    "nav.signIn": "Sign In",
    "nav.signUp": "Sign Up",
    "nav.profile": "Profile",
    "nav.myProfile": "My Profile",
    "nav.logout": "Logout",
    "nav.language": "English",

    "common.back": "Back",

    // Home Page
    "home.hero.title": "THE MOMENT IS YOURS .. RESERVE IT.",
    "home.hero.taglineAr": "اللحظة لك.. احجزها.",
    "home.hero.description":
      "TheAgencyJo curates standout events across Jordan and the MENA region. Discover, book, and step in — all in seconds.",
    "home.hero.browseEvents": "Browse Events",
    "home.upcoming.title": "Upcoming Events",
    "home.upcoming.all": "All",
    "home.upcoming.thisWeek": "This Week",
    "home.upcoming.thisMonth": "This Month",
    "home.upcoming.genre": "Genre",
    "home.upcoming.viewAll": "View all events",
    "home.upcoming.bookNow": "Book Now",
    "home.upcoming.details": "Details",
    "home.upcoming.soldOut": "Sold Out",
    "home.upcoming.fewSeats": "Few seats left",
    "home.upcoming.from": "From",
    "home.featured.title": "Featured Artist",
    "home.featured.quote":
      '"Music is the language that transcends all borders."',
    "home.featured.description":
      "Discover our curated selection of groundbreaking artists. From intimate jazz club performances to massive stadium shows, we bring the best talent directly to you.",
    "home.featured.readBio": "Browse Events",
    "home.why.title": "Why TheAgencyJo.",
    "home.why.curated.title": "Curated Lineups",
    "home.why.curated.desc":
      "We handpick every artist and venue to ensure a premium, unforgettable live music experience.",
    "home.why.secure.title": "Secure Visa Payments",
    "home.why.secure.desc":
      "Book instantly with global and regional payment methods, fully PCI-DSS compliant.",
    "home.why.tickets.title": "Instant QR E-Tickets",
    "home.why.tickets.desc":
      "No paper, no hassle. Your digital ticket is sent directly to your phone for seamless entry.",
    "home.testimonials.title": "What the crowd says",
    "home.testimonials.quote1":
      '"Absolutely unreal night — the sound, the crowd, the energy were on another level. TheAgencyJo made the whole experience effortless from booking to entry."',
    "home.testimonials.quote2":
      '"Hands down one of the best live events I\'ve been to in the region. Smooth booking, great seats, and the venue was perfectly organized. Will definitely book again."',
    "home.testimonials.attended": "Attended",
    "home.newsletter.title": "Never miss a beat.",
    "home.newsletter.description":
      "Subscribe to get first access to pre-sales, exclusive lineup announcements, and VIP offers.",
    "home.newsletter.placeholder": "Enter your email address",
    "home.newsletter.subscribe": "Subscribe",
    "home.newsletter.submitting": "Subscribing…",
    "home.newsletter.success": "You are subscribed.",
    "home.newsletter.alreadySubscribed": "You are already on the list.",
    "home.newsletter.error": "Could not subscribe. Please try again.",

    // Event Details
    "event.quickFacts.date": "Date & Time",
    "event.quickFacts.venue": "Venue",
    "event.quickFacts.price": "Price",
    "event.quickFacts.duration": "Duration",
    "event.quickFacts.age": "Age Restriction",
    "event.age.allAges": "All ages",
    "event.about.title": "About the Event",
    "event.sponsors.title": "Partners & sponsors",
    "event.sponsors.subtitle": "Supporting this event.",
    "event.contact.title": "Have questions about this event?",
    "event.contact.bookings": "Bookings & Info",
    "event.contact.email": "Email Address",
    "event.contact.logistics": "Venue & Logistics",
    "event.contact.whatsapp": "Chat on WhatsApp",
    "event.contact.hours": "Mon-Sun, 10am - 8pm",
    "event.location.title": "Find the venue",
    "event.location.googleMaps": "Open in Google Maps",
    "event.location.directions": "Get Directions",
    "event.location.copyAddress": "Copy Address",
    "event.location.mapTitle": "Venue map",
    "event.location.mapTitleNamed": "Map: {{name}}",
    "event.toast.notLoaded": "Event not loaded",
    "event.toast.waitlistSuccess": "You have been added to the waitlist",
    "event.toast.waitlistError": "Could not join waitlist",
    "event.waitlist.title": "Register your interest",
    "event.waitlist.description":
      "Be the first to know when tickets become available or when we announce new dates.",
    "event.waitlist.loadingProfile": "Loading your details…",
    "event.waitlist.submit": "Join waitlist",
    "event.waitlist.submitting": "Submitting…",
    "event.waitlist.phoneRequired": "Please enter a valid phone number",
    "event.share.aria": "Share event",
    "event.share.copied": "Event link copied to clipboard",
    "event.share.failed": "Could not share this event",
    "event.booking.title": "Reserve your spot",
    "event.booking.quantity": "Quantity",
    "event.booking.total": "Total Price",
    "event.booking.selectSeats": "Select Seats & Book",
    "event.booking.registerInterest": "Register Interest Only",
    "event.booking.secure": "Secure Checkout",
    "event.booking.instantQR": "Instant QR",
    "event.booking.bookNow": "Book Now!",
    "event.booking.perSeat": "JOD per seat",

    "booking.title": "Complete your booking",
    "booking.step.seats": "Select seats",
    "booking.step.details": "Your details",
    "booking.step.verify": "Verify email",
    "booking.step.payment": "Payment",
    "booking.continue": "Continue",
    "booking.selectSeatsToContinue": "Select at least one seat to continue",
    "booking.phoneRequired": "Please enter a valid phone number",
    "validation.phoneNationalTenDigits":
      "Enter exactly 10 digits for your mobile number (e.g. 0791234567), without the country code.",
    "validation.phoneNationalInvalid":
      "Enter a valid mobile number: 9 digits (791862528) or 10 with a leading 0 (0791862528), without the country code.",
    "validation.phoneNationalPlaceholder": "0791862528 or 791862528",
    "validation.firstNameRequired": "First name is required.",
    "validation.lastNameRequired": "Last name is required.",
    "validation.emailRequired": "Email is required.",
    "validation.phoneRequired": "Phone number is required.",
    "validation.ageRequired": "Please enter a valid age (13–120).",
    "booking.detailsDesc":
      "Confirm your details for tickets and booking updates.",
    "booking.resendCode": "Resend code",
    "booking.resendCooldown": "Resend available in {seconds}s",
    "booking.createAccount": "Create an account",
    "booking.signUpDesc":
      "Enter your details to receive your tickets and manage this booking.",
    "booking.emailExistsVerify":
      "This email is already registered. We're sending you a sign-in code to continue your booking.",
    "booking.sendingSignInCode": "Sending code…",
    "booking.seat.selected": "Seat added",
    "booking.seat.removed": "Seat removed",
    "booking.seat.taken": "This seat is no longer available",
    "booking.seat.maxReached": "Maximum seats per order reached",
    "booking.ga.added": "General admission added",
    "booking.ga.removed": "General admission removed",
    "booking.selection.summary": "Your selection",
    "booking.selection.empty": "Tap a seat on the map to select it",
    "booking.ticketsSelected": "tickets selected",
    "booking.ticketSelected": "ticket selected",
    "booking.seat.selectAtLeastOne": "Please select at least one seat or ticket.",
    "booking.seat.loadFailed": "Could not load seats. Please refresh and try again.",
    "booking.ga.reserveFailed": "Could not complete your ticket selection. Please try again.",
    "booking.ga.onlyAvailable": "Only {{count}} {{tier}} tickets are available.",

    "errors.generic": "Something went wrong. Please try again.",
    "errors.sessionExpired": "Your session has expired. Please sign in again.",
    "errors.forbidden": "You don't have permission to complete this action.",
    "errors.tooManyAttempts": "Too many attempts. Please wait a moment and try again.",
    "errors.unavailable": "Service is temporarily unavailable. Please try again shortly.",
    "errors.network": "Connection problem. Check your internet and try again.",
    "errors.verificationCode": "The code you entered is incorrect or has expired. Please try again or request a new code.",

    // Events listing & filters
    "events.hero.title": "All Events",
    "events.hero.subtitle":
      "Discover every upcoming concert and live experience.",
    "events.search.placeholder":
      "Search events, subtitle, or location",
    "events.time.all": "All Dates",
    "events.time.upcoming": "Upcoming",
    "events.time.thisWeek": "This Week",
    "events.time.thisMonth": "This Month",
    "events.location.all": "All Locations",
    "events.sort.dateAsc": "Date: Soonest First",
    "events.sort.dateDesc": "Date: Latest First",
    "events.sort.priceAsc": "Price: Low to High",
    "events.sort.priceDesc": "Price: High to Low",
    "events.loading": "Loading events…",
    "events.empty": "No events match your filters.",
    "events.from": "From",
    "events.currencyJod": "JOD",
    "events.details": "Details",
    "events.bookNow": "Book now",
    "events.pagination.summary": "Showing {{a}}–{{b}} of {{c}}",
    "events.pagination.page": "Page {{n}} / {{d}}",
    "events.pagination.prev": "Previous",
    "events.pagination.next": "Next",
    "events.toast.loadError": "Failed to load events",
    "events.aria.timeFilter": "Filter by date",
    "events.aria.locationFilter": "Filter by location",
    "events.aria.sortBy": "Sort order",

    // Seat Selector
    "seats.title": "Select Your Seats",
    "seats.selected": "of",
    "seats.seatsSelected": "seat(s) selected",
    "seats.stage": "STAGE",
    "seats.classA": "Class A",
    "seats.classB": "Class B",
    "seats.classC": "Class C",
    "seats.taken": "Taken",
    "seats.available": "Available",
    "seats.selectedSeats": "Selected Seats:",
    "seats.confirm": "Confirm Seat Selection",
    "seats.mapHint": "Each boxed section is a ticket class. Green seats are available; the colored outline shows the class.",
    "seats.legendTitle": "Legend",
    "seats.classColors": "Ticket classes on the map",
    "seats.allSections": "All sections",
    "tier.regular": "Regular",
    "tier.regularStanding": "Regular (standing)",
    "seats.filterByTier": "Filter by tier",
    "seats.zoomIn": "Zoom in",
    "seats.zoomOut": "Zoom out",
    "seats.resetView": "Reset",
    "seats.showAllSections": "Show all sections",
    "seats.viewingSection": "Viewing {{name}}",
    "seats.sectionFocusHint": "Only seats in this section are shown. Tap Reset or All sections to see the full map.",
    "seats.touchHint": "Pinch to zoom · drag to move the map · tap a seat to select",
    "seats.reservedTap": "This seat is reserved",
    "seats.status.selected": "Selected",

    // Checkout
    "checkout.title": "Checkout",
    "checkout.attendeeInfo": "Attendee Info",
    "checkout.fullName": "Full Name",
    "checkout.email": "Email Address",
    "checkout.phone": "Phone Number",
    "checkout.age": "Age",
    "checkout.continue": "Continue",
    "checkout.verification": "Verification",
    "checkout.verificationDesc":
      "We verify your contact info to ensure your QR ticket reaches you safely.",
    "checkout.enterCode": "Enter 6-digit code sent to your email",
    "checkout.verify": "Verify & Continue",
    "checkout.payment": "Payment",
    "checkout.payWithCard": "Pay with Card",
    "checkout.cardNumber": "Card Number",
    "checkout.expiry": "Expiry",
    "checkout.cvv": "CVV",
    "checkout.subtotal": "Subtotal",
    "checkout.tax": "Tax / Fees",
    "checkout.total": "Total",
    "checkout.pay": "Pay",
    "checkout.promoCode": "Promo code",
    "checkout.promoApply": "Apply",
    "checkout.promoRemove": "Remove",
    "checkout.discount": "Discount",
    "checkout.promoApplied": "Code {{code}} applied ({{percent}}% off)",
    "checkout.promoInvalid": "This promo code could not be applied.",
    "checkout.paymentFailed": "Payment could not be started. Please try again.",
    "checkout.reservationFailed": "Could not reserve your seats. Please try again.",
    "checkout.success": "You're going to",
    "checkout.reference": "Your booking reference is",
    "checkout.multipleTickets": "Multiple Tickets Booked",
    "checkout.emailSent": "We've sent individual QR codes for each of your",
    "checkout.emailSent2": "tickets to your email.",
    "checkout.yourSeats": "Your seats:",
    "checkout.return": "Return to Event",
    "checkout.downloadPDF": "Download PDF",

    // Login
    "login.backToSite": "Back to site",
    "login.welcomeBack": "Welcome back",
    "login.createAccount": "Create an account",
    "login.signInDesc": "Sign in to access the TheAgencyJo website.",
    "login.signUpDesc": "Sign up to manage your events and tickets.",
    "login.firstName": "First Name",
    "login.lastName": "Last Name",
    "login.firstNamePlaceholder": "Ahmad",
    "login.lastNamePlaceholder": "Hassan",
    "login.email": "Email address",
    "login.emailPlaceholder": "you@example.com",
    "login.phone": "Phone Number",
    "login.phoneNationalPlaceholder": "0791862528 or 791862528",
    "login.age": "Age",
    "login.agePlaceholder": "25",
    "login.verificationCode": "Verification Code",
    "login.verificationCodeDesc": "Enter the 6-digit code sent to your email (check your spam)",
    "login.signIn": "Sign In",
    "login.signUp": "Sign Up",
    "login.sendCode": "Send Verification Code",
    "login.verifySignIn": "Verify & Sign In",
    "login.haveAccount": "Already have an account?",
    "login.noAccount": "Don't have an account?",
    "login.error.signUpFailed": "Failed to sign up",
    "login.error.authGeneric": "Authentication failed. Please try again.",
    "login.error.noAccount":
      "No account exists for this email. Please sign up to create an account and continue.",
    "login.error.invalidSession":
      "Login succeeded but session data is missing.",

    // Profile
    "profile.title": "My Profile",
    "profile.myInfo": "My Info",
    "profile.myReservations": "My Reservations",
    "profile.firstName": "First Name",
    "profile.lastName": "Last Name",
    "profile.email": "Email",
    "profile.phone": "Phone",
    "profile.age": "Age",
    "profile.save": "Save Changes",
    "profile.saving": "Saving...",
    "profile.loading": "Loading profile...",
    "profile.loadError": "Could not load your profile. Please refresh the page.",
    "profile.saveSuccess": "Profile updated successfully.",
    "profile.saveError": "Failed to update profile.",
    "profile.noReservations": "No reservations yet.",
    "profile.untitledEvent": "Untitled Event",
    "profile.reference": "Reference",
    "profile.total": "Total",
    "profile.date": "Date",
    "profile.venue": "Venue",
    "profile.seats": "Seats",
    "profile.downloadTickets": "Download tickets PDF",
    "profile.downloadReceipt": "Download receipt PDF",
    "profile.downloading": "Downloading…",
    "profile.downloadError": "Could not download PDF. Please try again.",

    // About
    "about.title": "About TheAgencyJo",
    "about.subtitle":
      "We're revolutionizing how the MENA region experiences live music. From intimate jazz nights to massive festivals, TheAgencyJo brings world-class performances to your fingertips.",
    "about.mission.title": "Our Mission",
    "about.mission.p1":
      "At TheAgencyJo, we believe that exceptional live music should be accessible to everyone. We curate the finest concerts and events across Jordan and the wider MENA region, making it easy for music lovers to discover, book, and attend unforgettable performances.",
    "about.mission.p2":
      "Our platform connects passionate fans with incredible artists, creating moments that resonate long after the final encore.",
    "about.values.title": "What We Stand For",
    "about.values.quality.title": "Quality",
    "about.values.quality.desc":
      "Every event is carefully selected to ensure the highest quality experience for our community.",
    "about.values.diversity.title": "Diversity",
    "about.values.diversity.desc":
      "From classical to electronic, we celebrate all genres and bring diverse musical experiences to our audience.",
    "about.values.community.title": "Community",
    "about.values.community.desc":
      "We build lasting connections between artists, venues, and fans across the region.",
    "about.values.accessibility.title": "Accessibility",
    "about.values.accessibility.desc":
      "We make live music accessible through seamless booking, fair pricing, and inclusive experiences.",
    "about.stats.events": "Events Hosted",
    "about.stats.tickets": "Tickets Sold",
    "about.stats.artists": "Artists Featured",
    "about.stats.countries": "Countries Covered",

    // Venues
    "venues.title": "Our Venues",
    "venues.subtitle":
      "From ancient amphitheaters to modern concert halls, we partner with the most iconic venues across Jordan and the MENA region.",
    "venues.capacity": "Capacity:",
    "venues.upcomingEvents": "upcoming event",
    "venues.upcomingEventsPlural": "upcoming events",
    "venues.partner.title": "Venue Partners",
    "venues.partner.desc":
      "Are you a venue owner looking to host world-class events? Partner with TheAgencyJo to bring exceptional live music to your space.",
    "venues.partner.cta": "Become a Partner Venue",

    // Contact
    "contact.title": "Get in Touch",
    "contact.subtitle":
      "Have a question about an event, booking, or partnership? We're here to help.",
    "contact.call.title": "Call Us",
    "contact.call.hours": "Available Mon-Sun, 10am - 8pm",
    "contact.email.title": "Email Us",
    "contact.email.response": "We'll respond within 24 hours",
    "contact.whatsapp.title": "WhatsApp",
    "contact.whatsapp.desc": "Quick support via chat",
    "contact.whatsapp.cta": "Chat on WhatsApp",
    "contact.visit.title": "Visit Us",
    "contact.form.title": "Send us a message",
    "contact.form.desc":
      "Fill out the form below and we'll get back to you as soon as possible.",
    "contact.form.name": "Full Name",
    "contact.form.email": "Email Address",
    "contact.form.phone": "Phone Number",
    "contact.form.subject": "Subject",
    "contact.form.selectSubject": "Select a subject",
    "contact.form.booking": "Booking Question",
    "contact.form.event": "Event Inquiry",
    "contact.form.partnership": "Partnership Opportunity",
    "contact.form.technical": "Technical Support",
    "contact.form.feedback": "Feedback",
    "contact.form.other": "Other",
    "contact.form.message": "Message",
    "contact.form.messagePlaceholder": "Tell us how we can help you...",
    "contact.form.send": "Send Message",
    "contact.form.sending": "Sending…",
    "contact.form.errorSend": "Could not send your message. Please try again.",
    "contact.configError": "This page is not configured correctly. Please try again later.",
    "contact.form.success": "Message Sent!",
    "contact.form.successDesc":
      "We've received your message and will respond within 24 hours.",
    "contact.faq.title": "Frequently Asked Questions",
    "contact.faq.desc":
      "Quick answers to common questions. Can't find what you're looking for? Contact us directly.",
    "contact.faq.q1": "How do I receive my tickets after booking?",
    "contact.faq.a1":
      "Your e-tickets with QR codes are sent instantly to your email after successful payment. You can also download a PDF version from your booking confirmation page.",
    "contact.faq.q2": "Can I get a refund if I can't attend?",
    "contact.faq.a2":
      "Refund policies vary by event. Most events allow refunds up to 7 days before the event date. Check the specific event page for details.",
    "contact.faq.q3": "What payment methods do you accept?",
    "contact.faq.a3":
      "We accept all major credit cards (Visa, Mastercard, Amex) in JOD. All transactions are secure and PCI-DSS compliant.",
    "contact.faq.q4": "How early should I arrive at the venue?",
    "contact.faq.a4":
      "We recommend arriving 30-45 minutes before the show starts to allow time for parking, security checks, and finding your seat.",

    // Footer
    "footer.tagline": "Your gateway to unforgettable live music experiences.",
    "footer.quickLinks": "Quick Links",
    "footer.support": "Support",
    "footer.legal": "Legal",
    "footer.privacy": "Privacy Policy",
    "footer.terms": "Terms of Service",
    "footer.allRights": "All rights reserved.",
    "footer.poweredByPrefix": "Powered by the collaboration of",
    "footer.poweredByAnd": "and",
    "footer.title":
      "              Live the night. Book the moment. The premium platform for curated live music events across the MENA region and beyond.",
    "footer.company": "Company",
    "footer.whatssupport": "ًWhats App support",

    // Privacy Policy
    "privacy.title": "Privacy Policy",
    "privacy.updated": "Last updated: May 10, 2026",
    "privacy.intro.title": "1. Introduction",
    "privacy.intro.p1":
      'Welcome to TheAgencyJo ("we," "our," or "us"). We are committed to protecting your personal information and your right to privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our platform, website, and services.',
    "privacy.intro.p2":
      "By using TheAgencyJo, you agree to the collection and use of information in accordance with this policy. If you do not agree with our policies and practices, please do not use our services.",
    "privacy.collect.title": "2. Information We Collect",
    "privacy.collect.intro":
      "We collect several types of information from and about users of our platform:",
    "privacy.collect.personal.title": "2.1 Personal Information",
    "privacy.collect.personal.item1":
      "Name and contact information (email address, phone number)",
    "privacy.collect.personal.item2":
      "Payment information (credit card details, billing address)",
    "privacy.collect.personal.item3": "Age verification information",
    "privacy.collect.personal.item4":
      "Account credentials (username, password)",
    "privacy.collect.personal.item5": "Profile information and preferences",
    "privacy.collect.transaction.title": "2.2 Transaction Information",
    "privacy.collect.transaction.item1": "Ticket purchase history",
    "privacy.collect.transaction.item2": "Event attendance records",
    "privacy.collect.transaction.item3": "Booking and reservation details",
    "privacy.collect.transaction.item4": "Payment transaction records",
    "privacy.collect.technical.title": "2.3 Technical Information",
    "privacy.collect.technical.item1": "IP address and device information",
    "privacy.collect.technical.item2": "Browser type and version",
    "privacy.collect.technical.item3": "Operating system",
    "privacy.collect.technical.item4": "Cookies and usage data",
    "privacy.collect.technical.item5": "Location data (with your permission)",
    "privacy.use.title": "3. How We Use Your Information",
    "privacy.use.intro":
      "We use the information we collect for various purposes:",
    "privacy.use.item1": "To process your ticket purchases and reservations",
    "privacy.use.item2":
      "To send you booking confirmations and QR code tickets",
    "privacy.use.item3":
      "To communicate with you about events, updates, and promotions",
    "privacy.use.item4":
      "To verify your age and identity for age-restricted events",
    "privacy.use.item5": "To improve our platform and user experience",
    "privacy.use.item6": "To prevent fraud and ensure platform security",
    "privacy.use.item7":
      "To comply with legal obligations and resolve disputes",
    "privacy.use.item8": "To analyze user behavior and preferences",
    "privacy.sharing.title": "4. Information Sharing and Disclosure",
    "privacy.sharing.intro":
      "We may share your information in the following circumstances:",
    "privacy.sharing.organizers.title": "4.1 Event Organizers and Venues",
    "privacy.sharing.organizers.desc":
      "We share necessary information with event organizers and venue operators to facilitate your attendance and ensure event security.",
    "privacy.sharing.providers.title": "4.2 Service Providers",
    "privacy.sharing.providers.desc":
      "We work with third-party service providers for payment processing, email delivery, analytics, and customer support.",
    "privacy.sharing.legal.title": "4.3 Legal Requirements",
    "privacy.sharing.legal.desc":
      "We may disclose your information if required by law, court order, or governmental authority, or to protect our rights and safety.",
    "privacy.security.title": "5. Data Security",
    "privacy.security.intro":
      "We implement appropriate technical and organizational measures to protect your personal information:",
    "privacy.security.item1": "SSL/TLS encryption for data transmission",
    "privacy.security.item2":
      "Secure payment processing through certified payment gateways",
    "privacy.security.item3": "Regular security assessments and updates",
    "privacy.security.item4": "Access controls and authentication requirements",
    "privacy.security.item5": "Employee training on data protection",
    "privacy.rights.title": "6. Your Privacy Rights",
    "privacy.rights.intro":
      "You have the following rights regarding your personal information:",
    "privacy.rights.access": "Access:",
    "privacy.rights.access.desc": "Request access to your personal data",
    "privacy.rights.correction": "Correction:",
    "privacy.rights.correction.desc": "Request correction of inaccurate data",
    "privacy.rights.deletion": "Deletion:",
    "privacy.rights.deletion.desc":
      "Request deletion of your data (subject to legal requirements)",
    "privacy.rights.portability": "Portability:",
    "privacy.rights.portability.desc":
      "Request a copy of your data in a portable format",
    "privacy.rights.optout": "Opt-out:",
    "privacy.rights.optout.desc": "Unsubscribe from marketing communications",
    "privacy.rights.object": "Object:",
    "privacy.rights.object.desc":
      "Object to processing of your data for certain purposes",
    "privacy.cookies.title": "7. Cookies and Tracking",
    "privacy.cookies.intro":
      "We use cookies and similar tracking technologies to enhance your experience:",
    "privacy.cookies.essential": "Essential Cookies:",
    "privacy.cookies.essential.desc": "Required for platform functionality",
    "privacy.cookies.analytics": "Analytics Cookies:",
    "privacy.cookies.analytics.desc":
      "Help us understand how users interact with our platform",
    "privacy.cookies.marketing": "Marketing Cookies:",
    "privacy.cookies.marketing.desc": "Used to deliver relevant advertisements",
    "privacy.cookies.control":
      "You can control cookie preferences through your browser settings.",
    "privacy.children.title": "8. Children's Privacy",
    "privacy.children.desc":
      "Our services are not directed to individuals under 18 years of age. We do not knowingly collect personal information from children. If you are a parent or guardian and believe your child has provided us with personal information, please contact us.",
    "privacy.international.title": "9. International Data Transfers",
    "privacy.international.desc":
      "Your information may be transferred to and processed in countries other than your country of residence. We ensure appropriate safeguards are in place to protect your data in accordance with this Privacy Policy.",
    "privacy.changes.title": "10. Changes to This Policy",
    "privacy.changes.desc":
      'We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last updated" date. We encourage you to review this Privacy Policy periodically.',
    "privacy.contact.title": "11. Contact Us",
    "privacy.contact.intro":
      "If you have questions or concerns about this Privacy Policy or our data practices, please contact us:",
    "privacy.contact.email": "Email:",
    "privacy.contact.phone": "Phone:",
    "privacy.contact.phoneValue": "+962 7 9909 6656",
    "privacy.contact.address": "Address:",
    "privacy.contact.addressValue": "TheAgencyJo Privacy Team, Amman, Jordan",

    // Terms of Service
    "terms.title": "Terms of Service",
    "terms.updated": "Last updated: May 10, 2026",
    "terms.agreement.title": "1. Agreement to Terms",
    "terms.agreement.p1":
      'These Terms of Service ("Terms") constitute a legally binding agreement between you and TheAgencyJo ("we," "us," or "our") concerning your access to and use of our platform, website, and services.',
    "terms.agreement.p2":
      "By accessing or using TheAgencyJo, you agree to be bound by these Terms. If you do not agree to these Terms, you must not access or use our services.",
    "terms.use.title": "2. Use of Services",
    "terms.use.eligibility.title": "2.1 Eligibility",
    "terms.use.eligibility.desc":
      "You must be at least 18 years old to create an account and purchase tickets through TheAgencyJo. Some events may have additional age restrictions which will be clearly indicated.",
    "terms.use.registration.title": "2.2 Account Registration",
    "terms.use.registration.item1":
      "You must provide accurate and complete information when creating an account",
    "terms.use.registration.item2":
      "You are responsible for maintaining the confidentiality of your account credentials",
    "terms.use.registration.item3":
      "You are responsible for all activities that occur under your account",
    "terms.use.registration.item4":
      "You must notify us immediately of any unauthorized use of your account",
    "terms.use.prohibited.title": "2.3 Prohibited Conduct",
    "terms.use.prohibited.intro": "You agree not to:",
    "terms.use.prohibited.item1":
      "Use the platform for any unlawful purpose or in violation of these Terms",
    "terms.use.prohibited.item2":
      "Resell tickets at prices higher than face value (scalping)",
    "terms.use.prohibited.item3":
      "Use automated systems (bots) to purchase tickets",
    "terms.use.prohibited.item4":
      "Interfere with or disrupt the platform's operation",
    "terms.use.prohibited.item5":
      "Attempt to gain unauthorized access to our systems",
    "terms.use.prohibited.item6": "Impersonate another person or entity",
    "terms.use.prohibited.item7":
      "Post or transmit harmful, offensive, or inappropriate content",
    "terms.purchases.title": "3. Ticket Purchases",
    "terms.purchases.process.title": "3.1 Purchase Process",
    "terms.purchases.process.intro":
      "When you purchase a ticket through TheAgencyJo:",
    "terms.purchases.process.item1":
      "You receive a confirmation email with your QR code ticket",
    "terms.purchases.process.item2":
      "Your ticket is valid only for the specified event, date, and seat",
    "terms.purchases.process.item3":
      "Tickets are non-transferable unless explicitly stated otherwise",
    "terms.purchases.process.item4":
      "You must present your QR code ticket at the venue for entry",
    "terms.purchases.pricing.title": "3.2 Pricing and Payment",
    "terms.purchases.pricing.item1":
      "All prices are displayed in Jordanian Dinar (JOD) unless otherwise stated",
    "terms.purchases.pricing.item2": "Prices include applicable taxes and fees",
    "terms.purchases.pricing.item3":
      "Payment must be made at the time of booking",
    "terms.purchases.pricing.item4":
      "We accept major credit cards and approved payment methods",
    "terms.purchases.pricing.item5":
      "We reserve the right to correct pricing errors",
    "terms.purchases.limits.title": "3.3 Purchase Limits",
    "terms.purchases.limits.desc":
      "We may impose limits on the number of tickets you can purchase for an event to ensure fair access for all customers.",
    "terms.refunds.title": "4. Cancellations and Refunds",
    "terms.refunds.cancellation.title": "4.1 Event Cancellation",
    "terms.refunds.cancellation.intro":
      "If an event is cancelled by the organizer:",
    "terms.refunds.cancellation.item1":
      "You will receive a full refund of the ticket price",
    "terms.refunds.cancellation.item2":
      "Refunds will be processed within 14 business days",
    "terms.refunds.cancellation.item3":
      "Refunds will be issued to the original payment method",
    "terms.refunds.postponement.title": "4.2 Event Postponement",
    "terms.refunds.postponement.desc":
      "If an event is postponed to a new date, your ticket will remain valid for the rescheduled event. If you cannot attend the new date, you may request a refund within 7 days of the postponement announcement.",
    "terms.refunds.customer.title": "4.3 Customer Cancellation",
    "terms.refunds.customer.desc":
      "Tickets purchased are generally non-refundable unless the event is cancelled or postponed. In exceptional circumstances, refund requests will be considered on a case-by-case basis.",
    "terms.access.title": "5. Event Access and Conduct",
    "terms.access.entry.title": "5.1 Entry Requirements",
    "terms.access.entry.item1":
      "You must present your QR code ticket and valid ID at the venue",
    "terms.access.entry.item2":
      "You must comply with all venue rules and regulations",
    "terms.access.entry.item3":
      "You may be required to undergo security screening",
    "terms.access.entry.item4":
      "The venue reserves the right to refuse entry or remove attendees who violate rules",
    "terms.access.prohibited.title": "5.2 Prohibited Items",
    "terms.access.prohibited.desc":
      "Venues may prohibit certain items including but not limited to: weapons, illegal substances, recording equipment, outside food and beverages, and large bags. Check event-specific guidelines before attending.",
    "terms.access.behavior.title": "5.3 Behavior",
    "terms.access.behavior.desc":
      "Attendees must conduct themselves respectfully and lawfully. Disruptive, dangerous, or illegal behavior may result in removal from the event without refund and potential legal action.",
    "terms.ip.title": "6. Intellectual Property",
    "terms.ip.p1":
      "All content on the TheAgencyJo platform, including but not limited to text, graphics, logos, images, and software, is the property of TheAgencyJo or its licensors and is protected by copyright, trademark, and other intellectual property laws.",
    "terms.ip.p2":
      "You may not reproduce, distribute, modify, or create derivative works from our content without express written permission.",
    "terms.liability.title": "7. Limitation of Liability",
    "terms.liability.intro": "To the fullest extent permitted by law:",
    "terms.liability.item1":
      "TheAgencyJo is not liable for any indirect, incidental, special, or consequential damages",
    "terms.liability.item2":
      "Our total liability shall not exceed the amount you paid for the relevant ticket",
    "terms.liability.item3":
      "We are not responsible for event content, quality, or experiences",
    "terms.liability.item4":
      "We are not liable for injuries, losses, or damages occurring at events",
    "terms.liability.item5":
      "We do not guarantee uninterrupted or error-free service",
    "terms.indemnification.title": "8. Indemnification",
    "terms.indemnification.desc":
      "You agree to indemnify and hold harmless TheAgencyJo, its affiliates, and their respective officers, directors, employees, and agents from any claims, damages, losses, liabilities, and expenses (including legal fees) arising from your use of our services or violation of these Terms.",
    "terms.privacy.title": "9. Privacy",
    "terms.privacy.desc":
      "Your use of our services is also governed by our Privacy Policy. Please review our Privacy Policy to understand how we collect, use, and protect your personal information.",
    "terms.disputes.title": "10. Dispute Resolution",
    "terms.disputes.law.title": "10.1 Governing Law",
    "terms.disputes.law.desc":
      "These Terms are governed by the laws of Jordan, without regard to its conflict of law provisions.",
    "terms.disputes.process.title": "10.2 Dispute Resolution Process",
    "terms.disputes.process.intro": "In the event of a dispute:",
    "terms.disputes.process.item1":
      "First, contact our customer support to seek resolution",
    "terms.disputes.process.item2":
      "If unresolved, disputes shall be settled through arbitration in Amman, Jordan",
    "terms.disputes.process.item3":
      "You agree to waive any right to a jury trial or class action",
    "terms.changes.title": "11. Changes to Terms",
    "terms.changes.desc":
      'We reserve the right to modify these Terms at any time. We will notify you of material changes by posting the updated Terms on our platform and updating the "Last updated" date. Your continued use of our services after such changes constitutes acceptance of the new Terms.',
    "terms.termination.title": "12. Termination",
    "terms.termination.desc":
      "We reserve the right to suspend or terminate your account and access to our services at our sole discretion, without notice, for conduct that we believe violates these Terms or is harmful to other users, us, or third parties, or for any other reason.",
    "terms.severability.title": "13. Severability",
    "terms.severability.desc":
      "If any provision of these Terms is found to be unenforceable or invalid, that provision will be limited or eliminated to the minimum extent necessary so that these Terms will otherwise remain in full force and effect.",
    "terms.contact.title": "14. Contact Information",
    "terms.contact.intro":
      "If you have questions about these Terms, please contact us:",
    "terms.contact.email": "Email:",
    "terms.contact.emailValue": "legal@theagencyjo.com",
    "terms.contact.phone": "Phone:",
    "terms.contact.phoneValue": "+962 7 9909 6656",
    "terms.contact.address": "Address:",
    "terms.contact.addressValue": "TheAgencyJo Legal Team, Amman, Jordan",
    "terms.acknowledgment":
      "By using TheAgencyJo, you acknowledge that you have read, understood, and agree to be bound by these Terms of Service.",
  },
  AR: {
    // Navbar
    "nav.home": "الرئيسية",
    "nav.events": "الفعاليات",
    "nav.about": "من نحن",
    "nav.venues": "الأماكن",
    "nav.contact": "اتصل بنا",
    "nav.signIn": "تسجيل الدخول",
    "nav.signUp": "إنشاء حساب",
    "nav.profile": "الملف الشخصي",
    "nav.myProfile": "ملفي الشخصي",
    "nav.logout": "تسجيل الخروج",
    "nav.language": "العربية",

    "common.back": "رجوع",

    // Home Page
    "home.hero.title": "اللحظة لك.. احجزها.",
    "home.hero.taglineAr": "THE MOMENT IS YOURS .. RESERVE IT.",
    "home.hero.description":
      "تنتقي TheAgencyJo أبرز الفعاليات في الأردن ومنطقة الشرق الأوسط وشمال أفريقيا. اكتشف، احجز، وادخل التجربة — كل ذلك في ثوانٍ.",
    "home.hero.browseEvents": "تصفح الفعاليات",
    "home.upcoming.title": "الفعاليات القادمة",
    "home.upcoming.all": "الكل",
    "home.upcoming.thisWeek": "هذا الأسبوع",
    "home.upcoming.thisMonth": "هذا الشهر",
    "home.upcoming.genre": "النوع",
    "home.upcoming.viewAll": "عرض جميع الفعاليات",
    "home.upcoming.bookNow": "احجز الآن",
    "home.upcoming.details": "التفاصيل",
    "home.upcoming.soldOut": "نفذت التذاكر",
    "home.upcoming.fewSeats": "مقاعد قليلة متبقية",
    "home.upcoming.from": "من",
    "home.featured.title": "الفنان المميز",
    "home.featured.quote": '"الموسيقى هي اللغة التي تتجاوز كل الحدود."',
    "home.featured.description":
      "اكتشف مجموعتنا المنتقاة من الفنانين الرائدين. من عروض موسيقى الجاز الحميمة إلى العروض الضخمة في الملاعب، نجلب لك أفضل المواهب مباشرة.",
    "home.featured.readBio": "جميع الفعاليات",
    "home.why.title": "لماذا theagencyjo",
    "home.why.curated.title": "تشكيلات منتقاة",
    "home.why.curated.desc":
      "نختار كل فنان ومكان بعناية لضمان تجربة موسيقية حية متميزة لا تُنسى.",
    "home.why.secure.title": "مدفوعات آمنة",
    "home.why.secure.desc":
      "احجز فوراً بطرق الدفع العالمية والإقليمية، متوافقة تماماً مع معايير PCI-DSS.",
    "home.why.tickets.title": "تذاكر إلكترونية فورية برمز QR",
    "home.why.tickets.desc":
      "لا ورق، لا متاعب. تذكرتك الرقمية تُرسل مباشرة إلى هاتفك للدخول السلس.",
    "home.testimonials.title": "ماذا يقول الجمهور",
    "home.testimonials.quote1":
      '"أسهل تجربة حجز مررت بها لحفل في عمّان. الدخول برمز QR كان مثالياً."',
    "home.testimonials.quote2":
      '"أحببت حقيقة أنني استطعت الدفع بعملتي المحلية دون رسوم صرف إضافية. موصى به للغاية."',
    "home.testimonials.attended": "حضر",
    "home.newsletter.title": "لا تفوت أي شيء.",
    "home.newsletter.description":
      "اشترك للحصول على وصول مبكر للمبيعات المسبقة، وإعلانات التشكيلات الحصرية، وعروض VIP.",
    "home.newsletter.placeholder": "أدخل عنوان بريدك الإلكتروني",
    "home.newsletter.subscribe": "اشترك",
    "home.newsletter.submitting": "جاري الاشتراك…",
    "home.newsletter.success": "تم الاشتراك بنجاح.",
    "home.newsletter.alreadySubscribed": "أنت مشترك بالفعل.",
    "home.newsletter.error": "تعذّر الاشتراك. حاول مرة أخرى.",

    // Event Details
    "event.quickFacts.date": "التاريخ والوقت",
    "event.quickFacts.venue": "المكان",
    "event.quickFacts.price": "السعر",
    "event.quickFacts.duration": "المدة",
    "event.quickFacts.age": "قيود العمر",
    "event.age.allAges": "جميع الأعمار",
    "event.about.title": "عن الفعالية",
    "event.sponsors.title": "شركاء ورعاة",
    "event.sponsors.subtitle": "بدعمهم هذه الفعالية.",
    "event.contact.title": "لديك أسئلة عن هذه الفعالية؟",
    "event.contact.bookings": "الحجوزات والمعلومات",
    "event.contact.email": "البريد الإلكتروني",
    "event.contact.logistics": "المكان واللوجستيات",
    "event.contact.whatsapp": "تواصل عبر واتساب",
    "event.contact.hours": "الإثنين-الأحد، 10 صباحاً - 8 مساءً",
    "event.location.title": "اعثر على المكان",
    "event.location.googleMaps": "افتح في خرائط جوجل",
    "event.location.directions": "احصل على الاتجاهات",
    "event.location.copyAddress": "انسخ العنوان",
    "event.location.mapTitle": "خريطة المكان",
    "event.location.mapTitleNamed": "خريطة: {{name}}",
    "event.toast.notLoaded": "تعذّر تحميل الفعالية",
    "event.toast.waitlistSuccess": "تمت إضافتك إلى قائمة الانتظار",
    "event.toast.waitlistError": "تعذّر الانضمام إلى قائمة الانتظار",
    "event.waitlist.title": "سجّل اهتمامك",
    "event.waitlist.description":
      "كن أول من يعلم عند توفر التذاكر أو عند الإعلان عن مواعيد جديدة.",
    "event.waitlist.loadingProfile": "جاري تحميل بياناتك…",
    "event.waitlist.submit": "انضم إلى قائمة الانتظار",
    "event.waitlist.submitting": "جاري الإرسال…",
    "event.waitlist.phoneRequired": "يرجى إدخال رقم هاتف صالح",
    "event.share.aria": "مشاركة الفعالية",
    "event.share.copied": "تم نسخ رابط الفعالية",
    "event.share.failed": "تعذّرت مشاركة الفعالية",
    "event.booking.title": "احجز مقعدك",
    "event.booking.quantity": "الكمية",
    "event.booking.total": "السعر الإجمالي",
    "event.booking.selectSeats": "اختر المقاعد واحجز",
    "event.booking.registerInterest": "سجل الاهتمام فقط",
    "event.booking.secure": "دفع آمن",
    "event.booking.instantQR": "رمز QR فوري",
    "event.booking.bookNow": "احجز الآن!",
    "event.booking.perSeat": "دينار للمقعد",

    "booking.title": "أكمل حجزك",
    "booking.step.seats": "اختر المقاعد",
    "booking.step.details": "بياناتك",
    "booking.step.verify": "تأكيد البريد",
    "booking.step.payment": "الدفع",
    "booking.continue": "متابعة",
    "booking.selectSeatsToContinue": "اختر مقعداً واحداً على الأقل للمتابعة",
    "booking.phoneRequired": "يرجى إدخال رقم هاتف صالح",
    "validation.phoneNationalTenDigits":
      "أدخل 10 أرقام بالضبط لرقم الجوال (مثل 0791234567) بدون رمز الدولة.",
    "validation.phoneNationalInvalid":
      "أدخل رقماً صالحاً: 9 أرقام (791862528) أو 10 تبدأ بصفر (0791862528)، بدون رمز الدولة.",
    "validation.phoneNationalPlaceholder": "0791862528 أو 791862528",
    "validation.firstNameRequired": "الاسم الأول مطلوب.",
    "validation.lastNameRequired": "اسم العائلة مطلوب.",
    "validation.emailRequired": "البريد الإلكتروني مطلوب.",
    "validation.phoneRequired": "رقم الهاتف مطلوب.",
    "validation.ageRequired": "يرجى إدخال عمر صالح (13–120).",
    "booking.detailsDesc":
      "أكد بياناتك لاستلام التذاكر وتحديثات الحجز.",
    "booking.resendCode": "إعادة إرسال الرمز",
    "booking.resendCooldown": "إعادة الإرسال خلال {seconds} ث",
    "booking.createAccount": "إنشاء حساب",
    "booking.signUpDesc":
      "أدخل بياناتك لاستلام التذاكر وإدارة هذا الحجز.",
    "booking.emailExistsVerify":
      "هذا البريد مسجّل مسبقاً. نرسل لك رمز تسجيل الدخول لمتابعة الحجز.",
    "booking.sendingSignInCode": "جاري إرسال الرمز…",
    "booking.seat.selected": "تمت إضافة المقعد",
    "booking.seat.removed": "تمت إزالة المقعد",
    "booking.seat.taken": "هذا المقعد لم يعد متاحاً",
    "booking.seat.maxReached": "وصلت للحد الأقصى من التذاكر لهذا الطلب",
    "booking.ga.added": "تمت إضافة الدخول العام",
    "booking.ga.removed": "تم تقليل الدخول العام",
    "booking.selection.summary": "اختيارك",
    "booking.selection.empty": "اضغط على مقعد في الخريطة لاختياره",
    "booking.ticketsSelected": "تذاكر محددة",
    "booking.ticketSelected": "تذكرة محددة",
    "booking.seat.selectAtLeastOne": "يرجى اختيار مقعد أو تذكرة واحدة على الأقل.",
    "booking.seat.loadFailed": "تعذّر تحميل المقاعد. حدّث الصفحة وحاول مرة أخرى.",
    "booking.ga.reserveFailed": "تعذّر إتمام اختيار التذاكر. حاول مرة أخرى.",
    "booking.ga.onlyAvailable": "يتوفر فقط {{count}} تذكرة من {{tier}}.",

    "errors.generic": "حدث خطأ. يرجى المحاولة مرة أخرى.",
    "errors.sessionExpired": "انتهت جلستك. يرجى تسجيل الدخول مرة أخرى.",
    "errors.forbidden": "لا يمكنك إتمام هذا الإجراء.",
    "errors.tooManyAttempts": "محاولات كثيرة. انتظر قليلاً وحاول مرة أخرى.",
    "errors.unavailable": "الخدمة غير متاحة مؤقتاً. حاول بعد قليل.",
    "errors.network": "مشكلة في الاتصال. تحقق من الإنترنت وحاول مرة أخرى.",
    "errors.verificationCode": "الرمز غير صحيح أو منتهي الصلاحية. أعد المحاولة أو اطلب رمزاً جديداً.",

    // Events listing & filters
    "events.hero.title": "جميع الفعاليات",
    "events.hero.subtitle":
      "اكتشف كل الحفلات والتجارب الحية القادمة.",
    "events.search.placeholder":
      "ابحث في الفعاليات، الوصف، أو المكان",
    "events.time.all": "كل التواريخ",
    "events.time.upcoming": "قادمة",
    "events.time.thisWeek": "هذا الأسبوع",
    "events.time.thisMonth": "هذا الشهر",
    "events.location.all": "كل الأماكن",
    "events.sort.dateAsc": "التاريخ: الأقرب أولاً",
    "events.sort.dateDesc": "التاريخ: الأحدث أولاً",
    "events.sort.priceAsc": "السعر: من الأقل للأعلى",
    "events.sort.priceDesc": "السعر: من الأعلى للأقل",
    "events.loading": "جاري تحميل الفعاليات…",
    "events.empty": "لا توجد فعاليات مطابقة للتصفية.",
    "events.from": "من",
    "events.currencyJod": "دينار",
    "events.details": "التفاصيل",
    "events.bookNow": "احجز الآن",
    "events.pagination.summary": "عرض {{a}}–{{b}} من {{c}}",
    "events.pagination.page": "صفحة {{n}} / {{d}}",
    "events.pagination.prev": "السابق",
    "events.pagination.next": "التالي",
    "events.toast.loadError": "تعذّر تحميل الفعاليات",
    "events.aria.timeFilter": "تصفية حسب التاريخ",
    "events.aria.locationFilter": "تصفية حسب المكان",
    "events.aria.sortBy": "ترتيب العرض",

    // Seat Selector
    "seats.title": "اختر مقاعدك",
    "seats.selected": "من",
    "seats.seatsSelected": "مقعد محدد",
    "seats.stage": "المسرح",
    "seats.classA": "الفئة أ",
    "seats.classB": "الفئة ب",
    "seats.classC": "الفئة ج",
    "seats.taken": "محجوز",
    "seats.available": "متاح",
    "seats.selectedSeats": "المقاعد المحددة:",
    "seats.confirm": "تأكيد اختيار المقاعد",
    "seats.mapHint": "كل مربع يمثل فئة تذكرة. المقاعد الخضراء متاحة؛ الإطار الملون يوضح الفئة.",
    "seats.legendTitle": "دليل الألوان",
    "seats.classColors": "فئات التذاكر على الخريطة",
    "seats.allSections": "كل الأقسام",
    "tier.regular": "عادي",
    "tier.regularStanding": "عادي (وقوف)",
    "seats.filterByTier": "تصفية حسب الفئة",
    "seats.zoomIn": "تكبير",
    "seats.zoomOut": "تصغير",
    "seats.resetView": "إعادة ضبط",
    "seats.showAllSections": "عرض كل الأقسام",
    "seats.viewingSection": "عرض {{name}}",
    "seats.sectionFocusHint": "يُعرض مقاعد هذا القسم فقط. اضغط إعادة الضبط أو كل الأقسام لرؤية الخريطة كاملة.",
    "seats.touchHint": "قرصة للتكبير · اسحب لتحريك الخريطة · اضغط المقعد للاختيار",
    "seats.reservedTap": "هذا المقعد محجوز",
    "seats.status.selected": "محدد",

    // Checkout
    "checkout.title": "الدفع",
    "checkout.attendeeInfo": "معلومات الحضور",
    "checkout.fullName": "الاسم الكامل",
    "checkout.email": "البريد الإلكتروني",
    "checkout.phone": "رقم الهاتف",
    "checkout.age": "العمر",
    "checkout.continue": "متابعة",
    "checkout.verification": "التحقق",
    "checkout.verificationDesc":
      "نتحقق من معلومات الاتصال الخاصة بك للتأكد من وصول تذكرة QR إليك بأمان.",
    "checkout.enterCode":
      "أدخل الرمز المكون من 6 أرقام المرسل إلى بريدك الإلكتروني",
    "checkout.verify": "تحقق ومتابعة",
    "checkout.payment": "الدفع",
    "checkout.payWithCard": "ادفع بالبطاقة",
    "checkout.cardNumber": "رقم البطاقة",
    "checkout.expiry": "تاريخ الانتهاء",
    "checkout.cvv": "رمز CVV",
    "checkout.subtotal": "المجموع الفرعي",
    "checkout.tax": "الضريبة / الرسوم",
    "checkout.total": "الإجمالي",
    "checkout.pay": "ادفع",
    "checkout.promoCode": "كود الخصم",
    "checkout.promoApply": "تطبيق",
    "checkout.promoRemove": "إزالة",
    "checkout.discount": "الخصم",
    "checkout.promoApplied": "تم تطبيق {{code}} (خصم {{percent}}%)",
    "checkout.promoInvalid": "تعذّر تطبيق كود الخصم.",
    "checkout.paymentFailed": "تعذّر بدء الدفع. حاول مرة أخرى.",
    "checkout.reservationFailed": "تعذّر حجز المقاعد. حاول مرة أخرى.",
    "checkout.success": "أنت ذاهب إلى",
    "checkout.reference": "رقم الحجز الخاص بك هو",
    "checkout.multipleTickets": "حجز عدة تذاكر",
    "checkout.emailSent": "لقد أرسلنا رموز QR فردية لكل من",
    "checkout.emailSent2": "تذاكرك إلى بريدك الإلكتروني.",
    "checkout.yourSeats": "مقاعدك:",
    "checkout.return": "العودة إلى الفعالية",
    "checkout.downloadPDF": "تحميل PDF",

    // Login
    "login.backToSite": "العودة إلى الموقع",
    "login.welcomeBack": "مرحباً بعودتك",
    "login.createAccount": "إنشاء حساب",
    "login.signInDesc": "سجل الدخول للوصول إلى لوحة تحكم TheAgencyJo.",
    "login.signUpDesc": "سجل لإدارة فعالياتك وتذاكرك.",
    "login.firstName": "الاسم الأول",
    "login.lastName": "اسم العائلة",
    "login.firstNamePlaceholder": "أحمد",
    "login.lastNamePlaceholder": "حسن",
    "login.email": "البريد الإلكتروني",
    "login.emailPlaceholder": "you@example.com",
    "login.phone": "رقم الهاتف",
    "login.phoneNationalPlaceholder": "0791862528 أو 791862528",
    "login.age": "العمر",
    "login.agePlaceholder": "25",
    "login.verificationCode": "رمز التحقق",
    "login.verificationCodeDesc":
      "أدخل الرمز المكون من 6 أرقام المرسل إلى بريدك الإلكتروني",
    "login.signIn": "تسجيل الدخول",
    "login.signUp": "إنشاء حساب",
    "login.sendCode": "إرسال رمز التحقق",
    "login.verifySignIn": "تحقق وسجل الدخول",
    "login.haveAccount": "لديك حساب بالفعل؟",
    "login.noAccount": "ليس لديك حساب؟",
    "login.error.signUpFailed": "فشل إنشاء الحساب",
    "login.error.authGeneric": "فشلت عملية المصادقة. حاول مرة أخرى.",
    "login.error.noAccount":
      "لا يوجد حساب بهذا البريد. يرجى إنشاء حساب جديد للمتابعة.",
    "login.error.invalidSession":
      "تم تسجيل الدخول لكن بيانات الجلسة غير متوفرة.",

    // Profile
    "profile.title": "ملفي الشخصي",
    "profile.myInfo": "معلوماتي",
    "profile.myReservations": "حجوزاتي",
    "profile.firstName": "الاسم الأول",
    "profile.lastName": "اسم العائلة",
    "profile.email": "البريد الإلكتروني",
    "profile.phone": "الهاتف",
    "profile.age": "العمر",
    "profile.save": "حفظ التغييرات",
    "profile.saving": "جاري الحفظ...",
    "profile.loading": "جاري تحميل الملف الشخصي...",
    "profile.loadError": "تعذّر تحميل ملفك الشخصي. حدّث الصفحة وحاول مرة أخرى.",
    "profile.saveSuccess": "تم تحديث الملف الشخصي بنجاح.",
    "profile.saveError": "فشل تحديث الملف الشخصي.",
    "profile.noReservations": "لا توجد حجوزات بعد.",
    "profile.untitledEvent": "فعالية بدون عنوان",
    "profile.reference": "المرجع",
    "profile.total": "الإجمالي",
    "profile.date": "التاريخ",
    "profile.venue": "المكان",
    "profile.seats": "المقاعد",
    "profile.downloadTickets": "تحميل PDF التذاكر",
    "profile.downloadReceipt": "تحميل PDF الإيصال",
    "profile.downloading": "جاري التحميل…",
    "profile.downloadError": "تعذر تحميل الملف. حاول مرة أخرى.",

    // About
    "about.title": "عن TheAgencyJo",
    "about.subtitle":
      "نحن نحدث ثورة في كيفية تجربة منطقة الشرق الأوسط وشمال أفريقيا للموسيقى الحية. من ليالي الجاز الحميمة إلى المهرجانات الضخمة، يجلب TheAgencyJo عروضاً عالمية المستوى في متناول يدك.",
    "about.mission.title": "مهمتنا",
    "about.mission.p1":
      "في TheAgencyJo، نؤمن بأن الموسيقى الحية الاستثنائية يجب أن تكون متاحة للجميع. نقوم برعاية أفضل الحفلات والفعاليات في الأردن ومنطقة الشرق الأوسط وشمال أفريقيا الأوسع، مما يجعل من السهل على عشاق الموسيقى اكتشاف وحجز وحضور عروض لا تُنسى.",
    "about.mission.p2":
      "منصتنا تربط المعجبين المتحمسين بالفنانين المذهلين، مما يخلق لحظات يتردد صداها طويلاً بعد التصفيق النهائي.",
    "about.values.title": "ما نؤمن به",
    "about.values.quality.title": "الجودة",
    "about.values.quality.desc":
      "يتم اختيار كل حدث بعناية لضمان أعلى جودة تجربة لمجتمعنا.",
    "about.values.diversity.title": "التنوع",
    "about.values.diversity.desc":
      "من الكلاسيكية إلى الإلكترونية، نحتفل بجميع الأنواع ونجلب تجارب موسيقية متنوعة لجمهورنا.",
    "about.values.community.title": "المجتمع",
    "about.values.community.desc":
      "نبني روابط دائمة بين الفنانين والأماكن والمعجبين في جميع أنحاء المنطقة.",
    "about.values.accessibility.title": "إمكانية الوصول",
    "about.values.accessibility.desc":
      "نجعل الموسيقى الحية متاحة من خلال الحجز السلس والتسعير العادل والتجارب الشاملة.",
    "about.stats.events": "فعالية مستضافة",
    "about.stats.tickets": "تذكرة مباعة",
    "about.stats.artists": "فنان مميز",
    "about.stats.countries": "دولة مغطاة",

    // Venues
    "venues.title": "أماكننا",
    "venues.subtitle":
      "من المدرجات القديمة إلى قاعات الحفلات الموسيقية الحديثة، نتعاون مع أكثر الأماكن شهرة في الأردن ومنطقة الشرق الأوسط وشمال أفريقيا.",
    "venues.capacity": "السعة:",
    "venues.upcomingEvents": "فعالية قادمة",
    "venues.upcomingEventsPlural": "فعاليات قادمة",
    "venues.partner.title": "شركاء الأماكن",
    "venues.partner.desc":
      "هل أنت مالك مكان تتطلع لاستضافة فعاليات عالمية المستوى؟ كن شريكاً مع TheAgencyJo لجلب موسيقى حية استثنائية إلى مكانك.",
    "venues.partner.cta": "كن مكاناً شريكاً",

    // Contact
    "contact.title": "تواصل معنا",
    "contact.subtitle":
      "لديك سؤال حول فعالية أو حجز أو شراكة؟ نحن هنا للمساعدة.",
    "contact.call.title": "اتصل بنا",
    "contact.call.hours": "متاح الإثنين-الأحد، 10 صباحاً - 8 مساءً",
    "contact.email.title": "راسلنا",
    "contact.email.response": "سنرد خلال 24 ساعة",
    "contact.whatsapp.title": "واتساب",
    "contact.whatsapp.desc": "دعم سريع عبر الدردشة",
    "contact.whatsapp.cta": "تواصل عبر واتساب",
    "contact.visit.title": "زرنا",
    "contact.form.title": "أرسل لنا رسالة",
    "contact.form.desc": "املأ النموذج أدناه وسنرد عليك في أقرب وقت ممكن.",
    "contact.form.name": "الاسم الكامل",
    "contact.form.email": "البريد الإلكتروني",
    "contact.form.phone": "رقم الهاتف",
    "contact.form.subject": "الموضوع",
    "contact.form.selectSubject": "اختر موضوعاً",
    "contact.form.booking": "سؤال حول الحجز",
    "contact.form.event": "استفسار عن فعالية",
    "contact.form.partnership": "فرصة شراكة",
    "contact.form.technical": "دعم فني",
    "contact.form.feedback": "ملاحظات",
    "contact.form.other": "أخرى",
    "contact.form.message": "الرسالة",
    "contact.form.messagePlaceholder": "أخبرنا كيف يمكننا مساعدتك...",
    "contact.form.send": "إرسال الرسالة",
    "contact.form.sending": "جاري الإرسال…",
    "contact.form.errorSend": "تعذّر إرسال الرسالة. حاول مرة أخرى.",
    "contact.configError": "الصفحة غير مهيأة بشكل صحيح. حاول لاحقاً.",
    "contact.form.success": "تم إرسال الرسالة!",
    "contact.form.successDesc": "لقد تلقينا رسالتك وسنرد خلال 24 ساعة.",
    "contact.faq.title": "الأسئلة الشائعة",
    "contact.faq.desc":
      "إجابات سريعة على الأسئلة الشائعة. لا تجد ما تبحث عنه؟ اتصل بنا مباشرة.",
    "contact.faq.q1": "كيف أستلم تذاكري بعد الحجز؟",
    "contact.faq.a1":
      "يتم إرسال تذاكرك الإلكترونية مع رموز QR فوراً إلى بريدك الإلكتروني بعد الدفع الناجح. يمكنك أيضاً تنزيل نسخة PDF من صفحة تأكيد الحجز.",
    "contact.faq.q2": "هل يمكنني الحصول على استرداد إذا لم أستطع الحضور؟",
    "contact.faq.a2":
      "تختلف سياسات الاسترداد حسب الفعالية. تتيح معظم الفعاليات الاسترداد حتى 7 أيام قبل تاريخ الفعالية. تحقق من صفحة الفعالية المحددة للتفاصيل.",
    "contact.faq.q3": "ما طرق الدفع التي تقبلونها؟",
    "contact.faq.a3":
      "نقبل جميع بطاقات الائتمان الرئيسية (Visa، Mastercard، Amex) بالدينار الأردني. جميع المعاملات آمنة ومتوافقة مع معايير PCI-DSS.",
    "contact.faq.q4": "كم يجب أن أصل مبكراً إلى المكان؟",
    "contact.faq.a4":
      "نوصي بالوصول قبل 30-45 دقيقة من بدء العرض للسماح بوقت لركن السيارة وفحوصات الأمن وإيجاد مقعدك.",

    // Footer
    "footer.tagline": "بوابتك لتجارب موسيقية حية لا تُنسى.",
    "footer.quickLinks": "روابط سريعة",
    "footer.support": "الدعم",
    "footer.legal": "قانوني",
    "footer.privacy": "سياسة الخصوصية",
    "footer.terms": "شروط الخدمة",
    "footer.allRights": "جميع الحقوق محفوظة.",
    "footer.poweredByPrefix": "بدعم تعاون",
    "footer.poweredByAnd": "و",
    "footer.title":
      "عِشْ الليل. احجز اللحظة. المنصة المتميزة لفعاليات الموسيقى الحية المختارة بعناية في منطقة الشرق الأوسط وشمال أفريقيا وخارجها.",
    "footer.company": "الشركة",
    "footer.whatssupport": "دعم عن طريق الواتساب",
    // Privacy Policy
    "privacy.title": "سياسة الخصوصية",
    "privacy.updated": "آخر تحديث: 10 مايو 2026",
    "privacy.intro.title": "1. مقدمة",
    "privacy.intro.p1":
      'مرحباً بك في TheAgencyJo ("نحن" أو "الخاص بنا"). نحن ملتزمون بحماية معلوماتك الشخصية وحقك في الخصوصية. توضح سياسة الخصوصية هذه كيفية جمع واستخدام والكشف عن وحماية معلوماتك عند استخدام منصتنا وموقعنا الإلكتروني وخدماتنا.',
    "privacy.intro.p2":
      "باستخدام TheAgencyJo، فإنك توافق على جمع واستخدام المعلومات وفقاً لهذه السياسة. إذا كنت لا توافق على سياساتنا وممارساتنا، يرجى عدم استخدام خدماتنا.",
    "privacy.collect.title": "2. المعلومات التي نجمعها",
    "privacy.collect.intro":
      "نقوم بجمع عدة أنواع من المعلومات من وعن مستخدمي منصتنا:",
    "privacy.collect.personal.title": "2.1 المعلومات الشخصية",
    "privacy.collect.personal.item1":
      "الاسم ومعلومات الاتصال (عنوان البريد الإلكتروني، رقم الهاتف)",
    "privacy.collect.personal.item2":
      "معلومات الدفع (تفاصيل بطاقة الائتمان، عنوان الفواتير)",
    "privacy.collect.personal.item3": "معلومات التحقق من العمر",
    "privacy.collect.personal.item4":
      "بيانات اعتماد الحساب (اسم المستخدم، كلمة المرور)",
    "privacy.collect.personal.item5": "معلومات الملف الشخصي والتفضيلات",
    "privacy.collect.transaction.title": "2.2 معلومات المعاملات",
    "privacy.collect.transaction.item1": "سجل شراء التذاكر",
    "privacy.collect.transaction.item2": "سجلات حضور الفعاليات",
    "privacy.collect.transaction.item3": "تفاصيل الحجز والحجوزات",
    "privacy.collect.transaction.item4": "سجلات معاملات الدفع",
    "privacy.collect.technical.title": "2.3 المعلومات التقنية",
    "privacy.collect.technical.item1": "عنوان IP ومعلومات الجهاز",
    "privacy.collect.technical.item2": "نوع المتصفح والإصدار",
    "privacy.collect.technical.item3": "نظام التشغيل",
    "privacy.collect.technical.item4": "ملفات تعريف الارتباط وبيانات الاستخدام",
    "privacy.collect.technical.item5": "بيانات الموقع (بإذنك)",
    "privacy.use.title": "3. كيف نستخدم معلوماتك",
    "privacy.use.intro": "نستخدم المعلومات التي نجمعها لأغراض مختلفة:",
    "privacy.use.item1": "لمعالجة مشتريات التذاكر والحجوزات الخاصة بك",
    "privacy.use.item2": "لإرسال تأكيدات الحجز وتذاكر رمز QR إليك",
    "privacy.use.item3":
      "للتواصل معك حول الفعاليات والتحديثات والعروض الترويجية",
    "privacy.use.item4": "للتحقق من عمرك وهويتك للفعاليات المقيدة بالعمر",
    "privacy.use.item5": "لتحسين منصتنا وتجربة المستخدم",
    "privacy.use.item6": "لمنع الاحتيال وضمان أمان المنصة",
    "privacy.use.item7": "للامتثال للالتزامات القانونية وحل النزاعات",
    "privacy.use.item8": "لتحليل سلوك المستخدمين وتفضيلاتهم",
    "privacy.sharing.title": "4. مشاركة المعلومات والإفصاح عنها",
    "privacy.sharing.intro": "قد نشارك معلوماتك في الظروف التالية:",
    "privacy.sharing.organizers.title": "4.1 منظمو الفعاليات والأماكن",
    "privacy.sharing.organizers.desc":
      "نشارك المعلومات الضرورية مع منظمي الفعاليات ومشغلي الأماكن لتسهيل حضورك وضمان أمن الفعالية.",
    "privacy.sharing.providers.title": "4.2 مزودو الخدمة",
    "privacy.sharing.providers.desc":
      "نعمل مع مزودي خدمات طرف ثالث لمعالجة الدفع، وتسليم البريد الإلكتروني، والتحليلات، ودعم العملاء.",
    "privacy.sharing.legal.title": "4.3 المتطلبات القانونية",
    "privacy.sharing.legal.desc":
      "قد نكشف عن معلوماتك إذا كان ذلك مطلوباً بموجب القانون أو أمر المحكمة أو السلطة الحكومية، أو لحماية حقوقنا وسلامتنا.",
    "privacy.security.title": "5. أمن البيانات",
    "privacy.security.intro":
      "نطبق تدابير تقنية وتنظيمية مناسبة لحماية معلوماتك الشخصية:",
    "privacy.security.item1": "تشفير SSL/TLS لنقل البيانات",
    "privacy.security.item2": "معالجة دفع آمنة من خلال بوابات دفع معتمدة",
    "privacy.security.item3": "تقييمات وتحديثات أمنية منتظمة",
    "privacy.security.item4": "ضوابط الوصول ومتطلبات المصادقة",
    "privacy.security.item5": "تدريب الموظفين على حماية البيانات",
    "privacy.rights.title": "6. حقوق الخصوصية الخاصة بك",
    "privacy.rights.intro": "لديك الحقوق التالية فيما يتعلق بمعلوماتك الشخصية:",
    "privacy.rights.access": "الوصول:",
    "privacy.rights.access.desc": "طلب الوصول إلى بياناتك الشخصية",
    "privacy.rights.correction": "التصحيح:",
    "privacy.rights.correction.desc": "طلب تصحيح البيانات غير الدقيقة",
    "privacy.rights.deletion": "الحذف:",
    "privacy.rights.deletion.desc":
      "طلب حذف بياناتك (وفقاً للمتطلبات القانونية)",
    "privacy.rights.portability": "قابلية النقل:",
    "privacy.rights.portability.desc": "طلب نسخة من بياناتك بتنسيق محمول",
    "privacy.rights.optout": "إلغاء الاشتراك:",
    "privacy.rights.optout.desc": "إلغاء الاشتراك في الاتصالات التسويقية",
    "privacy.rights.object": "الاعتراض:",
    "privacy.rights.object.desc": "الاعتراض على معالجة بياناتك لأغراض معينة",
    "privacy.cookies.title": "7. ملفات تعريف الارتباط والتتبع",
    "privacy.cookies.intro":
      "نستخدم ملفات تعريف الارتباط وتقنيات تتبع مماثلة لتحسين تجربتك:",
    "privacy.cookies.essential": "ملفات تعريف الارتباط الأساسية:",
    "privacy.cookies.essential.desc": "مطلوبة لوظائف المنصة",
    "privacy.cookies.analytics": "ملفات تعريف الارتباط التحليلية:",
    "privacy.cookies.analytics.desc":
      "تساعدنا على فهم كيفية تفاعل المستخدمين مع منصتنا",
    "privacy.cookies.marketing": "ملفات تعريف الارتباط التسويقية:",
    "privacy.cookies.marketing.desc": "تُستخدم لتقديم إعلانات ذات صلة",
    "privacy.cookies.control":
      "يمكنك التحكم في تفضيلات ملفات تعريف الارتباط من خلال إعدادات المتصفح الخاص بك.",
    "privacy.children.title": "8. خصوصية الأطفال",
    "privacy.children.desc":
      "خدماتنا غير موجهة للأفراد الذين تقل أعمارهم عن 18 عاماً. نحن لا نجمع عن قصد معلومات شخصية من الأطفال. إذا كنت أحد الوالدين أو الوصي وتعتقد أن طفلك قد قدم لنا معلومات شخصية، يرجى الاتصال بنا.",
    "privacy.international.title": "9. عمليات نقل البيانات الدولية",
    "privacy.international.desc":
      "قد يتم نقل معلوماتك ومعالجتها في بلدان أخرى غير بلد إقامتك. نحن نضمن وجود ضمانات مناسبة لحماية بياناتك وفقاً لسياسة الخصوصية هذه.",
    "privacy.changes.title": "10. التغييرات على هذه السياسة",
    "privacy.changes.desc":
      'قد نقوم بتحديث سياسة الخصوصية هذه من وقت لآخر. سنخطرك بأي تغييرات عن طريق نشر سياسة الخصوصية الجديدة على هذه الصفحة وتحديث تاريخ "آخر تحديث". نشجعك على مراجعة سياسة الخصوصية هذه بشكل دوري.',
    "privacy.contact.title": "11. اتصل بنا",
    "privacy.contact.intro":
      "إذا كانت لديك أسئلة أو مخاوف بشأن سياسة الخصوصية هذه أو ممارسات البيانات الخاصة بنا، يرجى الاتصال بنا:",
    "privacy.contact.email": "البريد الإلكتروني:",
    "privacy.contact.phone": "الهاتف:",
    "privacy.contact.phoneValue": "+962 7 9909 6656",
    "privacy.contact.address": "العنوان:",
    "privacy.contact.addressValue": "فريق الخصوصية في TheAgencyJo، عمّان، الأردن",

    // Terms of Service
    "terms.title": "شروط الخدمة",
    "terms.updated": "آخر تحديث: 10 مايو 2026",
    "terms.agreement.title": "1. الموافقة على الشروط",
    "terms.agreement.p1":
      'تشكل شروط الخدمة هذه ("الشروط") اتفاقية ملزمة قانوناً بينك وبين TheAgencyJo ("نحن" أو "الخاص بنا") فيما يتعلق بوصولك إلى واستخدامك لمنصتنا وموقعنا الإلكتروني وخدماتنا.',
    "terms.agreement.p2":
      "من خلال الوصول إلى أو استخدام TheAgencyJo، فإنك توافق على الالتزام بهذه الشروط. إذا كنت لا توافق على هذه الشروط، يجب عدم الوصول إلى أو استخدام خدماتنا.",
    "terms.use.title": "2. استخدام الخدمات",
    "terms.use.eligibility.title": "2.1 الأهلية",
    "terms.use.eligibility.desc":
      "يجب أن يكون عمرك 18 عاماً على الأقل لإنشاء حساب وشراء تذاكر من خلال TheAgencyJo. قد يكون لبعض الفعاليات قيود عمرية إضافية سيتم الإشارة إليها بوضوح.",
    "terms.use.registration.title": "2.2 تسجيل الحساب",
    "terms.use.registration.item1":
      "يجب عليك تقديم معلومات دقيقة وكاملة عند إنشاء حساب",
    "terms.use.registration.item2":
      "أنت مسؤول عن الحفاظ على سرية بيانات اعتماد حسابك",
    "terms.use.registration.item3":
      "أنت مسؤول عن جميع الأنشطة التي تحدث تحت حسابك",
    "terms.use.registration.item4":
      "يجب عليك إخطارنا فوراً بأي استخدام غير مصرح به لحسابك",
    "terms.use.prohibited.title": "2.3 السلوك المحظور",
    "terms.use.prohibited.intro": "توافق على عدم:",
    "terms.use.prohibited.item1":
      "استخدام المنصة لأي غرض غير قانوني أو انتهاك هذه الشروط",
    "terms.use.prohibited.item2":
      "إعادة بيع التذاكر بأسعار أعلى من القيمة الاسمية (المضاربة)",
    "terms.use.prohibited.item3": "استخدام أنظمة آلية (روبوتات) لشراء التذاكر",
    "terms.use.prohibited.item4": "التدخل في أو تعطيل تشغيل المنصة",
    "terms.use.prohibited.item5":
      "محاولة الحصول على وصول غير مصرح به إلى أنظمتنا",
    "terms.use.prohibited.item6": "انتحال شخصية شخص أو كيان آخر",
    "terms.use.prohibited.item7": "نشر أو نقل محتوى ضار أو مسيء أو غير لائق",
    "terms.purchases.title": "3. شراء التذاكر",
    "terms.purchases.process.title": "3.1 عملية الشراء",
    "terms.purchases.process.intro": "عندما تشتري تذكرة من خلال TheAgencyJo:",
    "terms.purchases.process.item1":
      "تتلقى رسالة تأكيد بالبريد الإلكتروني مع تذكرة رمز QR الخاصة بك",
    "terms.purchases.process.item2":
      "تذكرتك صالحة فقط للفعالية والتاريخ والمقعد المحدد",
    "terms.purchases.process.item3":
      "التذاكر غير قابلة للتحويل ما لم ينص على خلاف ذلك صراحة",
    "terms.purchases.process.item4":
      "يجب عليك تقديم تذكرة رمز QR الخاصة بك في المكان للدخول",
    "terms.purchases.pricing.title": "3.2 التسعير والدفع",
    "terms.purchases.pricing.item1":
      "جميع الأسعار معروضة بالدينار الأردني (JOD) ما لم ينص على خلاف ذلك",
    "terms.purchases.pricing.item2": "تشمل الأسعار الضرائب والرسوم المعمول بها",
    "terms.purchases.pricing.item3": "يجب إجراء الدفع في وقت الحجز",
    "terms.purchases.pricing.item4":
      "نقبل بطاقات الائتمان الرئيسية وطرق الدفع المعتمدة",
    "terms.purchases.pricing.item5": "نحتفظ بالحق في تصحيح أخطاء التسعير",
    "terms.purchases.limits.title": "3.3 حدود الشراء",
    "terms.purchases.limits.desc":
      "قد نفرض قيوداً على عدد التذاكر التي يمكنك شراؤها لفعالية لضمان الوصول العادل لجميع العملاء.",
    "terms.refunds.title": "4. الإلغاءات واسترداد الأموال",
    "terms.refunds.cancellation.title": "4.1 إلغاء الفعالية",
    "terms.refunds.cancellation.intro": "في حالة إلغاء الفعالية من قبل المنظم:",
    "terms.refunds.cancellation.item1": "ستحصل على استرداد كامل لسعر التذكرة",
    "terms.refunds.cancellation.item2":
      "ستتم معالجة المبالغ المستردة خلال 14 يوم عمل",
    "terms.refunds.cancellation.item3":
      "ستصدر المبالغ المستردة إلى طريقة الدفع الأصلية",
    "terms.refunds.postponement.title": "4.2 تأجيل الفعالية",
    "terms.refunds.postponement.desc":
      "إذا تم تأجيل الفعالية إلى تاريخ جديد، ستظل تذكرتك صالحة للفعالية المعاد جدولتها. إذا لم تتمكن من الحضور في التاريخ الجديد، يمكنك طلب استرداد الأموال خلال 7 أيام من إعلان التأجيل.",
    "terms.refunds.customer.title": "4.3 إلغاء العميل",
    "terms.refunds.customer.desc":
      "التذاكر المشتراة غير قابلة للاسترداد بشكل عام ما لم يتم إلغاء الفعالية أو تأجيلها. في الظروف الاستثنائية، سيتم النظر في طلبات الاسترداد على أساس كل حالة على حدة.",
    "terms.access.title": "5. الوصول إلى الفعالية والسلوك",
    "terms.access.entry.title": "5.1 متطلبات الدخول",
    "terms.access.entry.item1":
      "يجب عليك تقديم تذكرة رمز QR الخاصة بك وبطاقة هوية صالحة في المكان",
    "terms.access.entry.item2": "يجب عليك الامتثال لجميع قواعد وأنظمة المكان",
    "terms.access.entry.item3": "قد يُطلب منك الخضوع لفحص أمني",
    "terms.access.entry.item4":
      "يحتفظ المكان بالحق في رفض الدخول أو إزالة الحضور الذين ينتهكون القواعد",
    "terms.access.prohibited.title": "5.2 العناصر المحظورة",
    "terms.access.prohibited.desc":
      "قد تحظر الأماكن عناصر معينة بما في ذلك على سبيل المثال لا الحصر: الأسلحة، والمواد غير القانونية، ومعدات التسجيل، والطعام والمشروبات من الخارج، والحقائب الكبيرة. تحقق من الإرشادات الخاصة بالفعالية قبل الحضور.",
    "terms.access.behavior.title": "5.3 السلوك",
    "terms.access.behavior.desc":
      "يجب على الحضور التصرف باحترام وبشكل قانوني. قد يؤدي السلوك المزعج أو الخطير أو غير القانوني إلى الإزالة من الفعالية دون استرداد الأموال واتخاذ إجراءات قانونية محتملة.",
    "terms.ip.title": "6. الملكية الفكرية",
    "terms.ip.p1":
      "جميع المحتويات على منصة TheAgencyJo، بما في ذلك على سبيل المثال لا الحصر النصوص والرسومات والشعارات والصور والبرامج، هي ملكية TheAgencyJo أو مرخصيها وهي محمية بموجب حقوق النشر والعلامات التجارية وقوانين الملكية الفكرية الأخرى.",
    "terms.ip.p2":
      "لا يجوز لك إعادة إنتاج أو توزيع أو تعديل أو إنشاء أعمال مشتقة من محتوانا دون إذن كتابي صريح.",
    "terms.liability.title": "7. حدود المسؤولية",
    "terms.liability.intro": "إلى أقصى حد يسمح به القانون:",
    "terms.liability.item1":
      "TheAgencyJo غير مسؤول عن أي أضرار غير مباشرة أو عرضية أو خاصة أو تبعية",
    "terms.liability.item2":
      "مسؤوليتنا الإجمالية لن تتجاوز المبلغ الذي دفعته مقابل التذكرة ذات الصلة",
    "terms.liability.item3":
      "نحن لسنا مسؤولين عن محتوى الفعالية أو الجودة أو التجارب",
    "terms.liability.item4":
      "نحن لسنا مسؤولين عن الإصابات أو الخسائر أو الأضرار التي تحدث في الفعاليات",
    "terms.liability.item5": "نحن لا نضمن خدمة دون انقطاع أو خالية من الأخطاء",
    "terms.indemnification.title": "8. التعويض",
    "terms.indemnification.desc":
      "توافق على تعويض وحماية TheAgencyJo وشركاتها التابعة ومسؤوليها ومديريها وموظفيها ووكلائها من أي مطالبات وأضرار وخسائر ومسؤوليات ونفقات (بما في ذلك الرسوم القانونية) الناشئة عن استخدامك لخدماتنا أو انتهاك هذه الشروط.",
    "terms.privacy.title": "9. الخصوصية",
    "terms.privacy.desc":
      "يخضع استخدامك لخدماتنا أيضاً لسياسة الخصوصية الخاصة بنا. يرجى مراجعة سياسة الخصوصية الخاصة بنا لفهم كيفية جمع واستخدام وحماية معلوماتك الشخصية.",
    "terms.disputes.title": "10. حل النزاعات",
    "terms.disputes.law.title": "10.1 القانون الحاكم",
    "terms.disputes.law.desc":
      "تخضع هذه الشروط لقوانين الأردن، دون اعتبار لأحكام تنازع القوانين.",
    "terms.disputes.process.title": "10.2 عملية حل النزاعات",
    "terms.disputes.process.intro": "في حالة وجود نزاع:",
    "terms.disputes.process.item1":
      "أولاً، اتصل بدعم العملاء لدينا للحصول على حل",
    "terms.disputes.process.item2":
      "إذا لم يتم حله، سيتم تسوية النزاعات من خلال التحكيم في عمّان، الأردن",
    "terms.disputes.process.item3":
      "توافق على التنازل عن أي حق في محاكمة هيئة محلفين أو دعوى جماعية",
    "terms.changes.title": "11. التغييرات على الشروط",
    "terms.changes.desc":
      'نحتفظ بالحق في تعديل هذه الشروط في أي وقت. سنخطرك بالتغييرات الجوهرية عن طريق نشر الشروط المحدثة على منصتنا وتحديث تاريخ "آخر تحديث". استمرارك في استخدام خدماتنا بعد هذه التغييرات يشكل قبولاً للشروط الجديدة.',
    "terms.termination.title": "12. الإنهاء",
    "terms.termination.desc":
      "نحتفظ بالحق في تعليق أو إنهاء حسابك والوصول إلى خدماتنا وفقاً لتقديرنا الخاص، دون إشعار، للسلوك الذي نعتقد أنه ينتهك هذه الشروط أو يضر بالمستخدمين الآخرين أو بنا أو بأطراف ثالثة، أو لأي سبب آخر.",
    "terms.severability.title": "13. قابلية الفصل",
    "terms.severability.desc":
      "إذا تبين أن أي حكم من هذه الشروط غير قابل للتنفيذ أو غير صالح، فسيتم تحديد أو إلغاء هذا الحكم إلى الحد الأدنى الضروري بحيث تظل هذه الشروط سارية المفعول بشكل كامل.",
    "terms.contact.title": "14. معلومات الاتصال",
    "terms.contact.intro":
      "إذا كان لديك أسئلة حول هذه الشروط، يرجى الاتصال بنا:",
    "terms.contact.email": "البريد الإلكتروني:",
    "terms.contact.emailValue": "legal@theagencyjo.com",
    "terms.contact.phone": "الهاتف:",
    "terms.contact.phoneValue": "+962 7 9909 6656",
    "terms.contact.address": "العنوان:",
    "terms.contact.addressValue": "الفريق القانوني لـ TheAgencyJo، عمّان، الأردن",
    "terms.acknowledgment":
      "باستخدام TheAgencyJo، فإنك تقر بأنك قد قرأت وفهمت ووافقت على الالتزام بشروط الخدمة هذه.",
  },
};

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = useState<Language>("EN");

  const t = (key: string): string => {
    return (translations[language] as Record<string, string>)[key] || key;
  };

  const isRTL = language === "AR";

  useEffect(() => {
    // Set document direction and language
    document.documentElement.dir = isRTL ? "rtl" : "ltr";
    document.documentElement.lang = language === "AR" ? "ar" : "en";
  }, [isRTL, language]);

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, isRTL }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}
