'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function LandingPage() {
  const router = useRouter();

  useEffect(() => {
    // Check if user is already logged in
    const token = localStorage.getItem('token');
    if (token) {
      router.push('/dashboard');
    }
  }, [router]);

  // Testimonials data
  const testimonials = [
    {
      content: "TedPRM has changed how I maintain my professional network. The relationship reminders have helped me reconnect with old colleagues at just the right time.",
      author: "Sarah L.",
      role: "Marketing Director"
    },
    {
      content: "I used to forget birthdays and important events all the time. Now with TedPRM, I'm the friend who always remembers, and it's made my relationships so much stronger.",
      author: "Michael T.",
      role: "Entrepreneur"
    },
    {
      content: "As someone with a large family spread across the country, TedPRM helps me stay connected with everyone. The interaction tracking is a game-changer.",
      author: "Jessica K.",
      role: "Healthcare Professional"
    }
  ];

  // Pricing plans data
  const plans = [
    {
      name: "Free",
      price: "$0",
      period: "",
      description: "For everyone - all features included",
      features: [
        "Up to 100 contacts",
        "Full contact information",
        "Smart reminders system",
        "Notes & interactions tracking",
        "Custom relationship types",
        "Search functionality",
        "Data import/export",
        "Dark/light theme",
        "Mobile responsive interface",
        "Priority support"
      ],
      buttonText: "Get Started",
      buttonVariant: "default",
      highlighted: false
    },
    {
      name: "Self-Hosted",
      price: "$0",
      period: "",
      description: "Deploy and manage on your own servers",
      features: [
        "Unlimited contacts",
        "All Free plan features",
        "Full source code access",
        "Custom branding options",
        "Self-managed updates",
        "Database control",
        "API access",
        "Integration capabilities",
        "Own your data completely",
        "Community support"
      ],
      buttonText: "View on GitHub",
      buttonVariant: "outline",
      highlighted: true
    }
  ];

  return (
    <main className="min-h-screen bg-ted-gray-dark text-white overflow-x-hidden">
      {/* Navbar */}
      <header className="fixed w-full top-0 z-50 bg-ted-gray-dark/80 backdrop-blur-lg border-b border-white/10">
        <div className="container mx-auto px-4 md:px-6 flex items-center justify-between h-16">
          <div className="flex items-center space-x-2">
            <div className="relative w-8 h-8 bg-ted-purple rounded-md overflow-hidden flex items-center justify-center">
              <span className="text-white font-bold text-lg">T</span>
            </div>
            <span className="font-bold text-xl text-white">TedPRM</span>
          </div>
          
          <nav className="hidden md:flex items-center space-x-6">
            <Link href="#features" className="text-sm text-gray-300 hover:text-white transition-colors">Features</Link>
            <Link href="#testimonials" className="text-sm text-gray-300 hover:text-white transition-colors">Testimonials</Link>
            <Link href="#pricing" className="text-sm text-gray-300 hover:text-white transition-colors">Pricing</Link>
            <Link href="#faq" className="text-sm text-gray-300 hover:text-white transition-colors">FAQ</Link>
          </nav>

          <div className="flex items-center space-x-4">
            <Link href="/auth/login" className="text-sm font-medium text-gray-300 hover:text-white transition-colors hidden md:inline-flex">Login</Link>
            <Link href="/auth/signup" className="bg-ted-purple hover:bg-ted-purple-dark text-white px-4 py-2 rounded-md text-sm font-medium">
              Sign Up
            </Link>
          </div>
        </div>
      </header>
      
      {/* Hero Section */}
      <section className="relative pt-28 pb-20 overflow-hidden">
        <div className="absolute top-0 right-0 w-1/2 h-1/2 bg-purple-glow opacity-20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-1/4 w-1/3 h-1/3 bg-ted-purple/20 rounded-full blur-3xl"></div>
        
        <div className="container mx-auto px-4 md:px-6 relative z-10">
          <div className="flex flex-col items-center text-center max-w-3xl mx-auto">
            <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
              Nurture Your
              <div><span className="text-gradient">Relationships</span> Like Never Before</div>
            </h1>
            <p className="text-lg md:text-xl text-gray-300 mb-8 max-w-2xl">
              TedPRM helps you keep track of the people who matter, reminds you of important events, and ensures no relationship falls through the cracks.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
              <Link href="/auth/signup" className="bg-ted-purple hover:bg-ted-purple-dark text-white text-lg py-4 px-8 rounded-md">
                Start For Free
              </Link>
              <Link href="#features" className="border border-ted-purple/50 text-white hover:bg-ted-purple/10 text-lg py-4 px-8 rounded-md">
                See How It Works
              </Link>
            </div>
            
            <div className="mt-10 relative w-full max-w-4xl mx-auto purple-glow">
              <div className="bg-gradient-to-br from-ted-gray-dark via-ted-gray-dark to-black p-2 sm:p-6 rounded-xl border border-white/10 shadow-xl">
                <div className="w-full h-[300px] md:h-[400px] bg-black/50 rounded-lg overflow-hidden shimmer flex items-center justify-center">
                  <div className="flex flex-col items-center justify-center gap-4">
                    <div className="w-16 h-16 rounded-full bg-ted-purple flex items-center justify-center">
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white">
                        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
                        <circle cx="9" cy="7" r="4"></circle>
                        <path d="M22 21v-2a4 4 0 0 0-3-3.87"></path>
                        <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                      </svg>
                    </div>
                    <p className="text-lg text-white font-medium">Dashboard Preview</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Features Section */}
      <section id="features" className="py-20 relative">
        <div className="absolute left-0 top-1/4 w-1/3 h-1/3 bg-ted-purple/10 rounded-full blur-3xl"></div>
        <div className="container mx-auto px-4 md:px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Powerful Features</h2>
            <p className="text-gray-300 max-w-2xl mx-auto">Everything you need to maintain and strengthen your personal and professional relationships.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-black/30 p-6 rounded-xl border border-white/5 backdrop-blur-sm">
              <div className="w-12 h-12 bg-ted-purple/20 rounded-lg flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-ted-purple">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                  <circle cx="9" cy="7" r="4"></circle>
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                  <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Contact Management</h3>
              <p className="text-gray-300">Organize all your contacts with detailed profiles and custom fields for comprehensive relationship tracking.</p>
            </div>
            
            <div className="bg-black/30 p-6 rounded-xl border border-white/5 backdrop-blur-sm">
              <div className="w-12 h-12 bg-ted-purple/20 rounded-lg flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-ted-purple">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                  <line x1="16" y1="2" x2="16" y2="6"></line>
                  <line x1="8" y1="2" x2="8" y2="6"></line>
                  <line x1="3" y1="10" x2="21" y2="10"></line>
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Smart Reminders</h3>
              <p className="text-gray-300">Never forget important dates and events with intelligent reminders for birthdays, anniversaries, and follow-ups.</p>
            </div>
            
            <div className="bg-black/30 p-6 rounded-xl border border-white/5 backdrop-blur-sm">
              <div className="w-12 h-12 bg-ted-purple/20 rounded-lg flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-ted-purple">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Interaction Tracking</h3>
              <p className="text-gray-300">Log and track all your interactions with detailed notes to maintain context for your next conversation.</p>
            </div>
          </div>
        </div>
      </section>
      
      {/* Transform Section */}
      <section className="py-12 relative">
        <div className="absolute left-1/4 top-1/4 w-1/3 h-1/3 bg-ted-purple/10 rounded-full blur-3xl"></div>
        <div className="container mx-auto px-4 md:px-6">
          <div className="flex flex-col md:flex-row gap-8">
            <div className="md:w-1/2">
              <h2 className="text-2xl md:text-4xl font-bold mb-6 leading-tight">
                Transform Your <span className="text-gradient">Personal Connections</span><br />
                With Smart Relationship Management
              </h2>
              <p className="text-base text-gray-300 mb-8">
                In today's busy world, maintaining meaningful relationships is harder than ever. TedPRM gives you the tools to nurture connections without the mental overhead.
              </p>
              
              <div className="space-y-8">
                <div className="flex items-start gap-4">
                  <div className="bg-ted-purple rounded-full w-12 h-12 flex items-center justify-center shrink-0">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white">
                      <circle cx="12" cy="12" r="10"></circle>
                      <polyline points="12 6 12 12 16 14"></polyline>
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold mb-2">Save Time & Mental Energy</h3>
                    <p className="text-gray-300 text-base">
                      Stop relying on your memory to maintain relationships. TedPRM handles the remembering so you can focus on connecting.
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-4">
                  <div className="bg-ted-purple rounded-full w-12 h-12 flex items-center justify-center shrink-0">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white">
                      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                      <circle cx="9" cy="7" r="4"></circle>
                      <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                      <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold mb-2">Strengthen Your Network</h3>
                    <p className="text-gray-300 text-base">
                      Build stronger personal and professional relationships through consistent, thoughtful interactions that deepen connections over time.
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-4">
                  <div className="bg-ted-purple rounded-full w-12 h-12 flex items-center justify-center shrink-0">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white">
                      <path d="M8 14s1.5 2 4 2 4-2 4-2"></path>
                      <line x1="9" y1="9" x2="9.01" y2="9"></line>
                      <line x1="15" y1="9" x2="15.01" y2="9"></line>
                      <path d="M22 12a10 10 0 1 1-20 0 10 10 0 0 1 20 0z"></path>
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold mb-2">Never Miss Important Moments</h3>
                    <p className="text-gray-300 text-base">
                      Show up for the people who matter with timely reminders for birthdays, anniversaries, and other significant events.
                    </p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="md:w-1/2 purple-glow">
              <div className="bg-black/30 p-5 rounded-xl border border-white/5 backdrop-blur-sm h-full">
                <div className="h-full bg-gradient-to-br from-black/60 to-black/40 rounded-lg overflow-hidden relative">
                  <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                    <div className="w-16 h-16 rounded-full bg-ted-purple flex items-center justify-center">
                      <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white">
                        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                        <circle cx="9" cy="7" r="4"></circle>
                        <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                        <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                      </svg>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Testimonials Section */}
      <section id="testimonials" className="py-20 relative">
        <div className="absolute top-1/2 right-1/4 w-1/3 h-1/3 bg-ted-purple/20 rounded-full blur-3xl"></div>
        
        <div className="container mx-auto px-4 md:px-6">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              What Our <span className="text-gradient">Users Say</span>
            </h2>
            <p className="text-gray-300">
              Join thousands of people using TedPRM to strengthen their personal and professional relationships.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="bg-black/30 border border-white/10 rounded-xl p-8 backdrop-blur-sm hover:border-ted-purple/50 transition-all duration-300">
                <svg xmlns="http://www.w3.org/2000/svg" width="42" height="42" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="text-ted-purple/30 mb-6">
                  <path d="M3 21c3 0 7-1 7-8V5c0-1.25-.756-2.017-2-2H4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2 1 0 1 0 1 1v1c0 1-1 2-2 2s-1 .008-1 1.031V20c0 1 0 1 1 1z"></path>
                  <path d="M15 21c3 0 7-1 7-8V5c0-1.25-.757-2.017-2-2h-4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2h.75c0 2.25.25 4-2.75 4v3c0 1 0 1 1 1z"></path>
                </svg>
                <p className="text-gray-300 mb-6">"{testimonial.content}"</p>
                <div>
                  <p className="font-semibold">{testimonial.author}</p>
                  <p className="text-gray-400 text-sm">{testimonial.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
      
      {/* Pricing Section */}
      <section id="pricing" className="py-20 relative">
        <div className="absolute bottom-0 left-1/4 w-1/3 h-1/3 bg-ted-purple/20 rounded-full blur-3xl"></div>
        
        <div className="container mx-auto px-4 md:px-6">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Simple, <span className="text-gradient">Transparent</span> Pricing
            </h2>
            <p className="text-gray-300">
              Choose the option that fits your needs. TedPRM is designed to be powerful yet accessible for everyone.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {plans.map((plan) => (
              <div 
                key={plan.name}
                className={`
                  bg-black/30 backdrop-blur-sm rounded-xl overflow-hidden transition-all duration-300
                  ${plan.highlighted 
                    ? 'border-2 border-ted-purple relative scale-105 shadow-xl shadow-ted-purple/20' 
                    : 'border border-white/10 hover:border-ted-purple/50'
                  }
                `}
              >
                {plan.highlighted && (
                  <div className="bg-ted-purple text-white text-xs font-semibold py-1 px-3 text-center">
                    RECOMMENDED
                  </div>
                )}
                <div className="p-8">
                  <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                  <div className="mb-4">
                    <span className="text-4xl font-bold">{plan.price}</span>
                    {plan.period && <span className="text-gray-400">{plan.period}</span>}
                  </div>
                  <p className="text-gray-300 mb-6">{plan.description}</p>
                  
                  <div className="space-y-3 mb-8">
                    {plan.features.map((feature) => (
                      <div key={feature} className="flex items-start gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-ted-purple mt-0.5">
                          <polyline points="20 6 9 17 4 12"></polyline>
                        </svg>
                        <span className="text-gray-300">{feature}</span>
                      </div>
                    ))}
                  </div>
                  
                  <Link
                    href={plan.name === "Free" ? "/auth/signup" : "https://github.com/yourusername/tedprm"}
                    className={`inline-block w-full text-center py-2 px-4 rounded-md ${
                      plan.buttonVariant === 'outline' 
                        ? 'border border-ted-purple/50 text-white hover:bg-ted-purple/10' 
                        : 'bg-ted-purple hover:bg-ted-purple-dark text-white'
                    }`}
                  >
                    {plan.buttonText}
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
      
      {/* FAQ Section */}
      <section id="faq" className="py-20 relative">
        <div className="absolute left-0 bottom-1/4 w-1/3 h-1/3 bg-ted-purple/10 rounded-full blur-3xl"></div>
        <div className="container mx-auto px-4 md:px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Frequently Asked Questions</h2>
            <p className="text-gray-300 max-w-2xl mx-auto">Find answers to common questions about TedPRM.</p>
          </div>
          
          <div className="max-w-3xl mx-auto space-y-6">
            <div className="bg-black/30 p-6 rounded-xl border border-white/5 backdrop-blur-sm">
              <h3 className="text-xl font-semibold mb-2">Is my data secure?</h3>
              <p className="text-gray-300">Yes! We use industry-standard encryption to ensure your personal data is always secure and private.</p>
            </div>
            
            <div className="bg-black/30 p-6 rounded-xl border border-white/5 backdrop-blur-sm">
              <h3 className="text-xl font-semibold mb-2">Can I import my existing contacts?</h3>
              <p className="text-gray-300">Yes, TedPRM allows you to import contacts from external sources to get started quickly.</p>
            </div>
            
            <div className="bg-black/30 p-6 rounded-xl border border-white/5 backdrop-blur-sm">
              <h3 className="text-xl font-semibold mb-2">Is there a mobile app?</h3>
              <p className="text-gray-300">Our web application is fully responsive and works on all devices. A dedicated mobile app is coming soon!</p>
            </div>
            
            <div className="bg-black/30 p-6 rounded-xl border border-white/5 backdrop-blur-sm">
              <h3 className="text-xl font-semibold mb-2">How much does it cost?</h3>
              <p className="text-gray-300">TedPRM is currently free to use during our beta period. Premium features will be available in the future.</p>
            </div>
          </div>
        </div>
      </section>
      
      {/* CTA Section */}
      <section className="py-20 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-ted-purple/5 to-transparent pointer-events-none"></div>
        <div className="container mx-auto px-4 md:px-6 relative">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to Transform Your Relationships?</h2>
            <p className="text-xl text-gray-300 mb-8">Join thousands of users who are strengthening their personal and professional relationships with TedPRM.</p>
            <Link href="/auth/signup" className="bg-ted-purple hover:bg-ted-purple-dark text-white text-lg py-4 px-8 rounded-md inline-block">
              Get Started Now
            </Link>
          </div>
        </div>
      </section>
      
      {/* Footer */}
      <footer className="bg-black/30 py-12 border-t border-white/10">
        <div className="container mx-auto px-4 md:px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 md:gap-12">
            <div className="md:col-span-2">
              <div className="mb-4">
                <span className="text-xl font-bold text-white">TedPRM</span>
              </div>
              <p className="text-gray-400 mb-6 max-w-md">
                Your personal relationship manager. Keep track of the people who matter most in your life.
              </p>
              <p className="text-gray-400 text-sm">
                © {new Date().getFullYear()} TedPRM. All rights reserved.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-3 text-white">Product</h3>
              <ul className="space-y-2">
                <li><Link href="#features" className="text-gray-400 hover:text-white transition">Features</Link></li>
                <li><Link href="#pricing" className="text-gray-400 hover:text-white transition">Pricing</Link></li>
                <li><Link href="#faq" className="text-gray-400 hover:text-white transition">FAQ</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-3 text-white">Account</h3>
              <ul className="space-y-2">
                <li><Link href="/auth/login" className="text-gray-400 hover:text-white transition">Login</Link></li>
                <li><Link href="/auth/signup" className="text-gray-400 hover:text-white transition">Sign Up</Link></li>
                <li><Link href="#" className="text-gray-400 hover:text-white transition">Help</Link></li>
              </ul>
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}
