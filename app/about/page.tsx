// app/about/page.tsx
import { Heart, MapPin, Users, Waves } from 'lucide-react'

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-cyan-50 via-white to-orange-50">
      {/* Hero */}
      <div className="bg-gradient-to-br from-teal-400 via-cyan-500 to-blue-500 py-20">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <Waves className="h-16 w-16 text-white mx-auto mb-6" />
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            About SurfStay Siargao
          </h1>
          <p className="text-xl text-cyan-100 max-w-2xl mx-auto">
            The island's own property rental platform — built by locals, for everyone who loves Siargao.
          </p>
        </div>
      </div>

      {/* Story */}
      <div className="max-w-3xl mx-auto px-4 py-16 sm:px-6">
        <h2 className="text-3xl font-bold text-gray-900 mb-6">Our Story</h2>
        <div className="prose prose-lg text-gray-600 space-y-4">
          <p>
            Siargao has grown from a hidden surf destination to one of Southeast Asia's most loved islands.
            But with growth came the big booking platforms — taking 15-25% commissions from local property
            owners who are the heart of the island's hospitality.
          </p>
          <p>
            SurfStay was born from a simple idea: what if Siargao had its own platform? One that charges
            only 12% commission, pays out within 24 hours, and actually knows the island?
          </p>
          <p>
            We're not trying to replace the personal connections between hosts and guests — we're trying
            to make them easier. Every peso saved on commissions goes back into the local economy,
            into better properties, and into the community.
          </p>
        </div>
      </div>

      {/* Values */}
      <div className="bg-gradient-to-r from-amber-50 to-orange-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">What We Believe In</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-gradient-to-br from-teal-400 to-cyan-500 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Heart className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Community First</h3>
              <p className="text-gray-600">
                Every decision we make starts with: "How does this help the people of Siargao?"
              </p>
            </div>
            <div className="text-center">
              <div className="bg-gradient-to-br from-orange-400 to-pink-500 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <MapPin className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Local Expertise</h3>
              <p className="text-gray-600">
                We know every barangay, every beach, every wave. Our recommendations are real.
              </p>
            </div>
            <div className="text-center">
              <div className="bg-gradient-to-br from-green-400 to-teal-500 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Users className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Fair for Everyone</h3>
              <p className="text-gray-600">
                Lower commissions for hosts means better prices for guests. Everyone wins.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Siargao Facts */}
      <div className="max-w-3xl mx-auto px-4 py-16 sm:px-6">
        <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Siargao by the Numbers</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          {[
            { value: '437', unit: 'km²', label: 'Island Area' },
            { value: '8', unit: '', label: 'Municipalities' },
            { value: '#1', unit: '', label: 'Surf Destination (Asia)' },
            { value: '365', unit: 'days', label: 'of Aloha' },
          ].map((stat) => (
            <div key={stat.label} className="bg-white rounded-2xl p-6 shadow-lg">
              <div className="text-2xl font-bold bg-gradient-to-r from-teal-600 to-cyan-600 bg-clip-text text-transparent">
                {stat.value}{stat.unit && <span className="text-lg"> {stat.unit}</span>}
              </div>
              <div className="text-sm text-gray-600 mt-1">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
