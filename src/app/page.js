'use client';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowDown, Users, BookOpen, Trophy, Star, ChevronRight } from 'lucide-react';

const features = [
  {
    title: 'Dashboard',
    desc: 'Manage your skills and track your progress',
    icon: BookOpen,
    color: 'from-pink-400 to-rose-400'
  },
  {
    title: 'Matching System',
    desc: 'Connect with people who have complementary skills',
    icon: Users,
    color: 'from-purple-400 to-indigo-400'
  },
  {
    title: 'Your Journey',
    desc: 'Track your learning and teaching milestones',
    icon: Star,
    color: 'from-blue-400 to-cyan-400'
  },
  {
    title: 'Badges',
    desc: 'Earn recognition for your skills and achievements',
    icon: Trophy,
    color: 'from-yellow-400 to-orange-400'
  },
];

const steps = [
  {
    title: 'Add Skills',
    desc: 'Share what you know and what you want to learn',
    emoji: '🔥',
    color: 'bg-gradient-to-r from-pink-100 to-rose-100'
  },
  {
    title: 'Match',
    desc: 'Find people with complementary skills',
    emoji: '⚡',
    color: 'bg-gradient-to-r from-purple-100 to-indigo-100'
  },
  {
    title: 'Learn',
    desc: 'Start your skill exchange journey',
    emoji: '✨',
    color: 'bg-gradient-to-r from-blue-100 to-cyan-100'
  },
];

export default function Home() {
  const scrollToSection = (sectionId) => {
    document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-100 via-pink-50 to-cyan-50">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 glass border-b border-white/20 dark:border-gray-700/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center space-x-2"
            >
              <div className="w-8 h-8 bg-gradient-to-r from-pink-500 to-violet-500 rounded-lg flex items-center justify-center shadow-lg">
                <span className="text-white font-bold text-lg">S</span>
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-pink-600 to-violet-600 bg-clip-text text-transparent">SkillSwap</span>
            </motion.div>
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center space-x-4"
            >

              <Link 
                href="/login" 
                className="text-gray-700 dark:text-gray-300 hover:text-pink-600 dark:hover:text-pink-400 transition-colors font-medium"
              >
                Login
              </Link>
              <Link 
                href="/signup" 
                className="bg-gradient-to-r from-pink-500 to-violet-500 text-white px-6 py-2 rounded-full hover:shadow-lg hover:shadow-pink-500/25 transition-all duration-200 font-medium transform hover:scale-105"
              >
                Sign Up
              </Link>
            </motion.div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-24 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <motion.h1 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-5xl md:text-6xl lg:text-7xl font-bold text-gray-800 dark:text-gray-100 mb-6"
          >
            Swap Skills.
            <br />
            <span className="bg-gradient-to-r from-pink-500 to-violet-500 bg-clip-text text-transparent">
              Learn Together.
            </span>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto"
          >
            A collaborative platform to teach what you know and learn what you need. ✨
          </motion.p>
          <motion.button 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            onClick={() => scrollToSection('how-it-works')}
            className="inline-flex items-center px-8 py-3 bg-gradient-to-r from-pink-500 to-violet-500 text-white rounded-full text-lg font-medium hover:shadow-lg hover:shadow-pink-500/25 transition-all duration-200 group transform hover:scale-105"
          >
            See How It Works
            <ArrowDown className="ml-2 h-5 w-5 group-hover:translate-y-1 transition-transform" />
          </motion.button>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-cyan-50 to-mint-50 dark:from-gray-800 dark:to-gray-900">
        <div className="max-w-7xl mx-auto">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 dark:text-gray-100 mb-4">How It Works</h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Get started in three simple steps 🚀
            </p>
          </motion.div>
          <div className="grid md:grid-cols-3 gap-8">
            {steps.map((step, index) => (
              <motion.div 
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
                className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 text-center group border border-white/20 dark:border-gray-700/50 transform hover:scale-105"
              >
                <div className="text-4xl mb-4 group-hover:scale-110 transition-transform">
                  {step.emoji}
                </div>
                <h3 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-3">{step.title}</h3>
                <p className="text-gray-600 dark:text-gray-300">{step.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 dark:text-gray-100 mb-4">Features</h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Everything you need to start your skill exchange journey 🎯
            </p>
          </motion.div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <motion.div 
                  key={index}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 group border border-white/20 dark:border-gray-700/50 transform hover:scale-105"
                >
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-r ${feature.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-lg`}>
                    <Icon className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-2">{feature.title}</h3>
                  <p className="text-gray-600 dark:text-gray-300 text-sm">{feature.desc}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-pink-500 to-violet-500">
        <div className="max-w-4xl mx-auto text-center">
          <motion.h2 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-3xl md:text-4xl font-bold text-white mb-6"
          >
            Ready to Start Your Journey? 🚀
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-xl text-pink-100 mb-8 max-w-2xl mx-auto"
          >
            Join thousands of learners and teachers already on SkillSwap ✨
          </motion.p>
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <Link 
              href="/signup" 
              className="inline-flex items-center px-8 py-3 bg-white text-pink-600 rounded-full text-lg font-medium hover:shadow-lg transition-all duration-200 group transform hover:scale-105"
            >
              Get Started
              <ChevronRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link 
              href="/login" 
              className="inline-flex items-center px-8 py-3 border-2 border-white text-white rounded-full text-lg font-medium hover:bg-white hover:text-pink-600 transition-all duration-200 transform hover:scale-105"
            >
              Sign In
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 sm:px-6 lg:px-8 bg-gray-900 dark:bg-black">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <div className="w-8 h-8 bg-gradient-to-r from-pink-500 to-violet-500 rounded-lg flex items-center justify-center shadow-lg">
                <span className="text-white font-bold text-lg">S</span>
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-pink-400 to-violet-400 bg-clip-text text-transparent">SkillSwap</span>
            </div>
            <div className="flex space-x-8 text-gray-400">
              <Link href="#" className="hover:text-pink-400 transition-colors">About</Link>
              <Link href="#" className="hover:text-pink-400 transition-colors">Contact</Link>
              <Link href="#" className="hover:text-pink-400 transition-colors">Terms</Link>
              <Link href="#" className="hover:text-pink-400 transition-colors">Privacy</Link>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-gray-700 text-center">
            <p className="text-gray-400">&copy; 2025 SkillSwap. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
