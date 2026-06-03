import { MapPin, Phone, Mail, Star, Calendar } from "lucide-react";

const VENUES = [
  {
    id: 1,
    name: "Amman Citadel",
    location: "Amman, Jordan",
    capacity: "5,000",
    type: "Outdoor Amphitheater",
    description: "Historic amphitheater overlooking the city of Amman. Perfect for large-scale concerts under the stars.",
    image: "https://images.unsplash.com/photo-1583422409516-2895a77efded?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=800",
    phone: "+962 6 463 8795",
    email: "info@ammancitadel.jo",
    upcomingEvents: 3
  },
  {
    id: 2,
    name: "Petra Ancient City",
    location: "Petra, Jordan",
    capacity: "3,000",
    type: "Archaeological Site",
    description: "Experience concerts in one of the Seven Wonders of the World. An unforgettable backdrop for intimate performances.",
    image: "https://images.unsplash.com/photo-1578070181910-f1e514afdd08?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=800",
    phone: "+962 3 215 6060",
    email: "events@petra.jo",
    upcomingEvents: 1
  },
  {
    id: 3,
    name: "Wadi Rum Amphitheater",
    location: "Wadi Rum, Jordan",
    capacity: "2,500",
    type: "Desert Venue",
    description: "Stunning desert location perfect for electronic music festivals and unique cultural events.",
    image: "https://images.unsplash.com/photo-1580837119756-563d608dd119?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=800",
    phone: "+962 79 990 9665",
    email: "info@wadirum.jo",
    upcomingEvents: 2
  },
  {
    id: 4,
    name: "Royal Cultural Center",
    location: "Amman, Jordan",
    capacity: "1,200",
    type: "Indoor Theater",
    description: "State-of-the-art indoor venue with world-class acoustics. Ideal for classical performances and intimate concerts.",
    image: "https://images.unsplash.com/photo-1514306191717-452ec28c7814?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=800",
    phone: "+962 6 566 1026",
    email: "bookings@rcc.jo",
    upcomingEvents: 5
  },
  {
    id: 5,
    name: "Dead Sea Arena",
    location: "Dead Sea, Jordan",
    capacity: "4,000",
    type: "Beachfront Venue",
    description: "Open-air venue at the lowest point on Earth. Perfect for sunset concerts and festival experiences.",
    image: "https://images.unsplash.com/photo-1559827260-dc66d52bef19?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=800",
    phone: "+962 5 349 1111",
    email: "events@deadsea.jo",
    upcomingEvents: 2
  },
  {
    id: 6,
    name: "Jerash South Theater",
    location: "Jerash, Jordan",
    capacity: "3,500",
    type: "Roman Theater",
    description: "2,000-year-old Roman theater with exceptional natural acoustics. A truly historic performance space.",
    image: "https://images.unsplash.com/photo-1592418687732-f9de03d9c4d3?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=800",
    phone: "+962 2 635 1272",
    email: "info@jerash.jo",
    upcomingEvents: 1
  }
];

export function Venues() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="bg-hero-noir text-white py-24">
        <div className="max-w-[1200px] mx-auto px-6">
          <h1 className="text-5xl md:text-7xl font-bold font-['Tajawal'] mb-6">Our Venues</h1>
          <p className="text-xl text-white/80 max-w-3xl">
            From ancient amphitheaters to modern concert halls, we partner with the most iconic venues across Jordan and the MENA region.
          </p>
        </div>
      </section>

      {/* Venues Grid */}
      <section className="py-24">
        <div className="max-w-[1200px] mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {VENUES.map(venue => (
              <div key={venue.id} className="bg-white rounded-xl overflow-hidden shadow-[0_8px_24px_rgba(20,14,8,0.08)] hover:shadow-[0_12px_32px_rgba(20,14,8,0.12)] transition-shadow">
                <div className="relative h-64 overflow-hidden">
                  <img src={venue.image} alt={venue.name} className="w-full h-full object-cover" />
                  <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-sm font-bold text-black">
                    {venue.type}
                  </div>
                  {venue.upcomingEvents > 0 && (
                    <div className="absolute bottom-4 left-4 bg-black text-white px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      {venue.upcomingEvents} upcoming event{venue.upcomingEvents > 1 ? 's' : ''}
                    </div>
                  )}
                </div>

                <div className="p-6">
                  <h3 className="text-2xl font-bold font-['Tajawal'] text-black mb-2">{venue.name}</h3>
                  <div className="flex items-center gap-2 text-[#8c8c8c] mb-4">
                    <MapPin className="w-4 h-4" />
                    <span className="text-sm">{venue.location}</span>
                    <span className="mx-2">•</span>
                    <span className="text-sm font-medium">Capacity: {venue.capacity}</span>
                  </div>

                  <p className="text-[#8c8c8c] mb-6">{venue.description}</p>

                  <div className="border-t border-[#e8e8e8] pt-4 space-y-2">
                    <div className="flex items-center gap-2 text-sm text-black">
                      <Phone className="w-4 h-4 text-black" />
                      <a href={`tel:${venue.phone}`} className="hover:text-black transition-colors">{venue.phone}</a>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-black">
                      <Mail className="w-4 h-4 text-black" />
                      <a href={`mailto:${venue.email}`} className="hover:text-black transition-colors">{venue.email}</a>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-white">
        <div className="max-w-[1200px] mx-auto px-6 text-center">
          <h2 className="text-4xl font-bold font-['Tajawal'] text-black mb-6">Venue Partners</h2>
          <p className="text-lg text-[#8c8c8c] mb-8 max-w-2xl mx-auto">
            Are you a venue owner looking to host world-class events? Partner with TheAgencyJo to bring exceptional live music to your space.
          </p>
          <a href="mailto:partnerships@theagencyjo.com" className="inline-block px-8 py-3 bg-black text-white font-bold rounded-lg hover:bg-[#525252] transition-colors">
            Become a Partner Venue
          </a>
        </div>
      </section>
    </div>
  );
}
