import { Link } from 'react-router-dom'
import { useEffect, useState } from 'react'
import {
  Heart,
  Star,
  Users,
  Shield,
  CreditCard,
  MessageCircle,
  Play,
  CheckCircle,
  ArrowRight
} from 'lucide-react'
import { Logo } from '../components/Logo'
import { formatNaira } from '../lib/money'
import { openCookiePreferences } from '../lib/consent'

const Landing = () => {
  const [creators, setCreators] = useState([])

  useEffect(() => {
    // Demo featured creators
    setCreators([
      {
        id: '1',
        username: 'sophia_arts',
        displayName: 'Sophia Arts',
        avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=300&h=300&fit=crop',
        banner: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=800&h=300&fit=crop',
        bio: 'Digital artist sharing exclusive artwork and tutorials',
        subscriptionPrice: 4500,
        totalSubscribers: 2340,
        category: 'Art'
      },
      {
        id: '2',
        username: 'fitness_mike',
        displayName: 'Mike Fitness',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=300&fit=crop',
        banner: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=800&h=300&fit=crop',
        bio: 'Personal trainer | Workout plans | Nutrition tips',
        subscriptionPrice: 7500,
        totalSubscribers: 5670,
        category: 'Fitness'
      },
      {
        id: '3',
        username: 'cooking_master',
        displayName: 'Chef Maria',
        avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=300&h=300&fit=crop',
        banner: 'https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=800&h=300&fit=crop',
        bio: 'Professional chef sharing secret recipes & cooking tips',
        subscriptionPrice: 3500,
        totalSubscribers: 1890,
        category: 'Food'
      },
      {
        id: '4',
        username: 'tech_guru',
        displayName: 'Alex Chen',
        avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=300&h=300&fit=crop',
        banner: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&h=300&fit=crop',
        bio: 'Tech reviews | Gadget unboxing | Coding tutorials',
        subscriptionPrice: 6000,
        totalSubscribers: 3450,
        category: 'Tech'
      }
    ])
  }, [])

  return (
    <div className="min-h-screen">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-dark-bg/90 backdrop-blur-lg border-b border-dark-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link to="/" className="flex items-center gap-2">
              <Logo className="w-8 h-8" />
              <span className="font-heading text-2xl font-bold gradient-text">Fanvora</span>
            </Link>
            <div className="hidden md:flex items-center gap-8">
              <a href="#features" className="text-gray-300 hover:text-white transition-colors">Features</a>
              <a href="#creators" className="text-gray-300 hover:text-white transition-colors">Creators</a>
              <a href="#how-it-works" className="text-gray-300 hover:text-white transition-colors">How it Works</a>
            </div>
            <div className="flex items-center gap-4">
              <Link to="/login" className="text-gray-300 hover:text-white transition-colors">Log In</Link>
              <Link to="/register" className="btn-primary text-sm">Sign Up</Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-transparent to-accent/10" />
        <div className="absolute top-20 right-0 w-96 h-96 bg-primary/30 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-72 h-72 bg-accent/20 rounded-full blur-3xl" />

        <div className="max-w-7xl mx-auto relative">
          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 bg-primary/20 border border-primary/30 rounded-full px-4 py-2 mb-6">
              <Star className="w-4 h-4 text-accent" />
              <span className="text-sm text-gray-300">Support creators directly</span>
            </div>

            <h1 className="font-heading text-5xl md:text-7xl font-bold mb-6 leading-tight">
              Support Your <br />
              <span className="gradient-text">Favorite Creators</span>
            </h1>

            <p className="text-xl text-gray-400 mb-10 max-w-2xl mx-auto">
              Connect with creators from around the world. Get exclusive content,
              interact directly, and be part of their journey.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/register" className="btn-primary flex items-center gap-2 text-lg">
                Start Exploring <ArrowRight className="w-5 h-5" />
              </Link>
              <Link to="/register?role=creator" className="btn-secondary flex items-center gap-2">
                Become a Creator
              </Link>
            </div>

            <div className="flex items-center justify-center gap-8 mt-12 text-gray-400">
              <div className="text-center">
                <div className="font-accent text-3xl font-bold text-white">50K+</div>
                <div className="text-sm">Creators</div>
              </div>
              <div className="w-px h-12 bg-dark-border" />
              <div className="text-center">
                <div className="font-accent text-3xl font-bold text-white">2M+</div>
                <div className="text-sm">Fans</div>
              </div>
              <div className="w-px h-12 bg-dark-border" />
              <div className="text-center">
                <div className="font-accent text-3xl font-bold text-white">₦20B+</div>
                <div className="text-sm">Paid to Creators</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Creators */}
      <section id="creators" className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-10">
            <div>
              <h2 className="font-heading text-3xl md:text-4xl font-bold mb-2">Featured Creators</h2>
              <p className="text-gray-400">Discover talented creators across different categories</p>
            </div>
            <Link to="/register" className="hidden md:flex items-center gap-2 text-primary hover:text-primary-light transition-colors">
              View All <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {creators.map((creator) => (
              <Link
                key={creator.id}
                to={`/creator/${creator.username}`}
                className="card group"
              >
                <div className="relative h-32">
                  <img
                    src={creator.banner}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-dark-card to-transparent" />
                </div>
                <div className="px-4 pb-4 -mt-12 relative">
                  <img
                    src={creator.avatar}
                    alt={creator.displayName}
                    className="w-20 h-20 rounded-full border-4 border-dark-card object-cover"
                  />
                  <h3 className="font-semibold text-lg mt-2 group-hover:text-primary transition-colors">
                    {creator.displayName}
                  </h3>
                  <p className="text-gray-400 text-sm">@{creator.username}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="badge badge-primary">{creator.category}</span>
                  </div>
                  <p className="text-gray-400 text-sm mt-3 line-clamp-2">{creator.bio}</p>
                  <div className="flex items-center justify-between mt-4 pt-4 border-t border-dark-border">
                    <div className="flex items-center gap-1 text-gray-400 text-sm">
                      <Users className="w-4 h-4" />
                      {creator.totalSubscribers.toLocaleString()}
                    </div>
                    <div className="font-accent font-semibold text-accent">
                      {formatNaira(creator.subscriptionPrice)}/mo
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4 bg-dark-card/50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="font-heading text-3xl md:text-4xl font-bold mb-4">
              Everything You Need
            </h2>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              A complete platform for creators to monetize their content and fans to support them
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: Star,
                title: 'Exclusive Content',
                desc: 'Access exclusive posts, photos, and videos from your favorite creators'
              },
              {
                icon: MessageCircle,
                title: 'Direct Messaging',
                desc: 'Chat directly with creators and build meaningful connections'
              },
              {
                icon: CreditCard,
                title: 'Secure Payments',
                desc: 'Safe and secure payments powered by PayStack'
              },
              {
                icon: Heart,
                title: 'Support Creators',
                desc: 'Tips and subscriptions help creators continue their work'
              },
              {
                icon: Play,
                title: 'PPV Content',
                desc: 'Purchase specific content at affordable prices'
              },
              {
                icon: Shield,
                title: 'Privacy First',
                desc: 'Your data is protected with industry-leading security'
              }
            ].map((feature, i) => (
              <div key={i} className="glass rounded-2xl p-6 hover:border-primary transition-colors">
                <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center mb-4">
                  <feature.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-semibold text-xl mb-2">{feature.title}</h3>
                <p className="text-gray-400">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="font-heading text-3xl md:text-4xl font-bold mb-4">
              How It Works
            </h2>
            <p className="text-gray-400 text-lg">Get started in minutes</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                step: '01',
                title: 'Create an Account',
                desc: 'Sign up as a fan or creator in just a few clicks'
              },
              {
                step: '02',
                title: 'Connect with Creators',
                desc: 'Browse and subscribe to your favorite creators'
              },
              {
                step: '03',
                title: 'Enjoy Exclusive Content',
                desc: 'Access exclusive content and interact with creators'
              }
            ].map((item, i) => (
              <div key={i} className="relative">
                <div className="text-[120px] font-heading font-bold text-primary/10 absolute -top-8 -left-2">
                  {item.step}
                </div>
                <div className="relative pt-16">
                  <h3 className="font-semibold text-xl mb-2">{item.title}</h3>
                  <p className="text-gray-400">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="glass rounded-3xl p-12 text-center relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-primary/30 to-accent/20" />
            <div className="relative">
              <h2 className="font-heading text-3xl md:text-4xl font-bold mb-4">
                Ready to Get Started?
              </h2>
              <p className="text-gray-300 text-lg mb-8 max-w-xl mx-auto">
                Join thousands of creators and fans on Fanvora today
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link to="/register" className="btn-accent flex items-center gap-2">
                  Create Free Account <ArrowRight className="w-5 h-5" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 border-t border-dark-border">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-2">
              <Logo className="w-6 h-6" />
              <span className="font-heading text-xl font-bold">Fanvora</span>
            </div>
            <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-gray-400 text-sm">
              <Link to="/legal/privacy" className="hover:text-white transition-colors">Privacy Policy</Link>
              <Link to="/legal/terms" className="hover:text-white transition-colors">Terms of Service</Link>
              <Link to="/legal/cookies" className="hover:text-white transition-colors">Cookie Policy</Link>
              <button
                type="button"
                onClick={openCookiePreferences}
                className="hover:text-white transition-colors"
              >
                Cookie preferences
              </button>
              <a href="mailto:support@fanvora.com" className="hover:text-white transition-colors">Support</a>
            </div>
            <p className="text-gray-500 text-sm">
              &copy; {new Date().getFullYear()} Fanvora. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default Landing
