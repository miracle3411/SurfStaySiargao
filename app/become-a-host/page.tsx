// app/become-a-host/page.tsx
'use client'

import Link from 'next/link'
import { Home, DollarSign, Shield, Clock, Star, ArrowRight } from 'lucide-react'

export default function BecomeAHostPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-cyan-50 via-white to-orange-50">
      {/* Hero */}
      <div className="relative overflow-hidden bg-gradient-to-br from-orange-400 via-pink-500 to-purple-500 py-24">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M30 0l30 30-30 30L0 30z' fill='%23ffffff' fill-opacity='1'/%3E%3C/svg%3E")`,
            backgroundSize: '30px 30px'
          }} />
        </div>
        <div className="relative max-w-4xl mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
            Share Your Space in Paradise
          </h1>
          <p className="text-xl md:text-2xl text-pink-100 mb-10 max-w-2xl mx-auto">
            List your property on Siargao's local platform. Lower fees, faster payouts, and a community that cares.
          </p>
          <Link
            href="/signup"
            className="inline-flex items-center gap-2 px-10 py-4 bg-white text-pink-600 rounded-2xl font-bold text-lg shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all"
          >
            Start Hosting
            <ArrowRight className="h-5 w-5" />
          </Link>
        </div>
      </div>

      {/* Why Host With Us */}
      <div className="max-w-7xl mx-auto px-4 py-20 sm:px-6 lg:px-8">
        <h2 className="text-3xl font-bold text-center text-gray-900 mb-4">Why Host with SurfStay?</h2>
        <p className="text-center text-gray-600 mb-16 max-w-2xl mx-auto">
          We're built by locals, for the Siargao community. No corporate middlemen.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white rounded-2xl p-8 shadow-lg border-2 border-transparent hover:border-teal-300 transition-all text-center">
            <div className="bg-gradient-to-br from-teal-400 to-cyan-500 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-5">
              <DollarSign className="h-8 w-8 text-white" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">Only 12% Commission</h3>
            <p className="text-gray-600">
              Compared to 15-25% on other platforms. Keep more of what you earn and reinvest in your property.
            </p>
          </div>

          <div className="bg-white rounded-2xl p-8 shadow-lg border-2 border-transparent hover:border-orange-300 transition-all text-center">
            <div className="bg-gradient-to-br from-orange-400 to-pink-500 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-5">
              <Clock className="h-8 w-8 text-white" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">24-Hour Payouts</h3>
            <p className="text-gray-600">
              Get paid within 24 hours of guest check-in. No waiting weeks for your money.
            </p>
          </div>

          <div className="bg-white rounded-2xl p-8 shadow-lg border-2 border-transparent hover:border-purple-300 transition-all text-center">
            <div className="bg-gradient-to-br from-purple-400 to-violet-500 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-5">
              <Shield className="h-8 w-8 text-white" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">Local Support</h3>
            <p className="text-gray-600">
              Our team is on the island. Real people, real support, when you need it.
            </p>
          </div>
        </div>
      </div>

      {/* How It Works */}
      <div className="bg-gradient-to-r from-amber-50 to-orange-50 py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-16">How It Works</h2>

          <div className="space-y-12">
            {[
              { step: '1', title: 'Create Your Account', desc: 'Sign up for free and tell us about your property.' },
              { step: '2', title: 'List Your Property', desc: 'Add photos, description, amenities, and set your price.' },
              { step: '3', title: 'Start Earning', desc: 'Guests discover and book your place. We handle payments securely.' },
            ].map((item) => (
              <div key={item.step} className="flex items-start gap-6">
                <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-teal-500 to-cyan-500 text-white rounded-full flex items-center justify-center text-xl font-bold shadow-lg">
                  {item.step}
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-1">{item.title}</h3>
                  <p className="text-gray-600">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="py-20">
        <div className="max-w-2xl mx-auto px-4 text-center">
          <Home className="h-16 w-16 text-teal-500 mx-auto mb-6" />
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Ready to Start Hosting?</h2>
          <p className="text-gray-600 mb-8">
            Join the growing community of Siargao property owners on the island's own booking platform.
          </p>
          <Link
            href="/signup"
            className="inline-flex items-center gap-2 px-10 py-4 bg-gradient-to-r from-teal-500 to-cyan-500 text-white rounded-2xl font-bold text-lg shadow-xl hover:from-teal-600 hover:to-cyan-600 transform hover:scale-105 transition-all"
          >
            Get Started — It's Free
            <ArrowRight className="h-5 w-5" />
          </Link>
        </div>
      </div>
    </div>
  )
}
