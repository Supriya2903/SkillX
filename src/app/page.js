'use client';
import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowDown, Users, BookOpen, Trophy, Star, ChevronRight } from 'lucide-react';

const features = [
  {
    title: 'Dashboard',
    desc: 'Manage your skills and track your progress',
    icon: BookOpen,
    color: '#865D36'
  },
  {
    title: 'Matching System',
    desc: 'Connect with people who have complementary skills',
    icon: Users,
    color: '#B8956A'
  },
  {
    title: 'Your Journey',
    desc: 'Track your learning and teaching milestones',
    icon: Star,
    color: '#AC8968'
  },
  {
    title: 'Badges',
    desc: 'Earn recognition for your skills and achievements',
    icon: Trophy,
    color: '#A69080'
  },
];

const steps = [
  {
    title: 'Add Skills',
    desc: 'Share what you know and what you want to learn',
    emoji: '🔥',
    color: 'bg-gradient-to-r from-orange-100 to-amber-100'
  },
  {
    title: 'Match',
    desc: 'Find people with complementary skills',
    emoji: '⚡',
    color: 'bg-gradient-to-r from-yellow-100 to-orange-100'
  },
  {
    title: 'Learn',
    desc: 'Start your skill exchange journey',
    emoji: '✨',
    color: 'bg-gradient-to-r from-green-100 to-teal-100'
  },
];

export default function Home() {
  const scrollToSection = (sectionId) => {
    document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-50 via-amber-50 to-orange-50" style={{background: 'linear-gradient(135deg, #FCFAF7 0%, #F6F2ED 50%, #F0E9E2 100%)'}}>
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 glass border-b border-white/20 dark:border-gray-700/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center space-x-2"
            >
              <Image 
                src="/logo.png" 
                alt="SkillX Logo" 
                width={32} 
                height={32} 
                className="rounded-md"
                priority
              />
      
              <span className="text-xl font-bold" style={{background: 'linear-gradient(135deg, #865D36 0%, #B8956A 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text'}}>SkillX</span>
            </motion.div>
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center space-x-4"
            >

              <Link 
                href="/login" 
                className="transition-colors font-medium"
                style={{color: '#5A4E44'}}
                onMouseEnter={(e) => e.target.style.color = '#865D36'}
                onMouseLeave={(e) => e.target.style.color = '#5A4E44'}
              >
                Login
              </Link>
              <Link 
                href="/signup" 
                className="text-white px-6 py-2 rounded-full hover:shadow-lg transition-all duration-200 font-medium transform hover:scale-105"
                style={{background: 'linear-gradient(135deg, #865D36 0%, #B8956A 100%)'}}
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
            className="text-5xl md:text-6xl lg:text-7xl font-bold mb-6"
            style={{color: '#3E362E'}}
          >
            Swap Skills.
            <br />
            <span style={{background: 'linear-gradient(135deg, #865D36 0%, #B8956A 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text'}}>
              Learn Together.
            </span>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-xl md:text-2xl mb-8 max-w-2xl mx-auto"
            style={{color: '#5A4E44'}}
          >
            A collaborative platform to teach what you know and learn what you need. ✨
          </motion.p>
          <motion.button 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            onClick={() => scrollToSection('how-it-works')}
            className="inline-flex items-center px-8 py-3 text-white rounded-full text-lg font-medium hover:shadow-lg transition-all duration-200 group transform hover:scale-105"
            style={{background: 'linear-gradient(135deg, #865D36 0%, #B8956A 100%)', boxShadow: '0 10px 25px rgba(134, 93, 54, 0.25)'}}
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
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-lg`} style={{backgroundColor: feature.color}}>
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
      <section className="py-16 px-4 sm:px-6 lg:px-8" style={{background: 'linear-gradient(135deg, #865D36 0%, #B8956A 100%)'}}>
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
            className="text-xl mb-8 max-w-2xl mx-auto" 
            style={{color: 'rgba(255, 255, 255, 0.9)'}}
          >
            Join thousands of learners and teachers already on SkillX ✨
          </motion.p>
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <Link 
              href="/signup" 
              className="inline-flex items-center px-8 py-3 bg-white rounded-full text-lg font-medium hover:shadow-lg transition-all duration-200 group transform hover:scale-105"
              style={{color: '#865D36'}}
            >
              Get Started
              <ChevronRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 sm:px-6 lg:px-8 bg-gray-900 dark:bg-black">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
               <Image 
                src="/logo.png" 
                alt="SkillX Logo" 
                width={32} 
                height={32} 
                className="rounded-md"
                priority
              />
              
              <span className="text-xl font-bold" style={{background: 'linear-gradient(135deg, #865D36 0%, #B8956A 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text'}}>SkillX</span>
            </div>
            <div className="flex space-x-8 text-gray-400">
              <Link href="#" className="transition-colors" style={{'&:hover': {color: '#B8956A'}}} onMouseEnter={(e) => e.target.style.color = '#B8956A'} onMouseLeave={(e) => e.target.style.color = '#9CA3AF'}>About</Link>
              <Link href="#" className="transition-colors" onMouseEnter={(e) => e.target.style.color = '#B8956A'} onMouseLeave={(e) => e.target.style.color = '#9CA3AF'}>Contact</Link>
              <Link href="#" className="transition-colors" onMouseEnter={(e) => e.target.style.color = '#B8956A'} onMouseLeave={(e) => e.target.style.color = '#9CA3AF'}>Terms</Link>
              <Link href="#" className="transition-colors" onMouseEnter={(e) => e.target.style.color = '#B8956A'} onMouseLeave={(e) => e.target.style.color = '#9CA3AF'}>Privacy</Link>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-gray-700 text-center">
            <p className="text-gray-400">&copy; 2025 SkillX. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
