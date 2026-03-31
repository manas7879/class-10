import React, { useState } from 'react';
import { LogIn, MessageSquare, ShieldCheck, Zap, Users, Globe, Mail, Lock, User, ArrowLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { APP_NAME } from '../constants';

interface AuthScreenProps {
  onSignIn: () => void;
  onSignInAnonymously: () => void;
  onEmailSignIn: (email: string, pass: string) => Promise<void>;
  onEmailSignUp: (email: string, pass: string, name: string) => Promise<void>;
  loading: boolean;
}

type AuthMode = 'initial' | 'signin' | 'signup';

export const AuthScreen: React.FC<AuthScreenProps> = ({ 
  onSignIn, 
  onSignInAnonymously, 
  onEmailSignIn,
  onEmailSignUp,
  loading 
}) => {
  const [mode, setMode] = useState<AuthMode>('initial');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      if (mode === 'signin') {
        await onEmailSignIn(email, password);
      } else if (mode === 'signup') {
        await onEmailSignUp(email, password, name);
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred during authentication');
    }
  };

  return (
    <div id="auth-screen" className="min-h-screen bg-white dark:bg-gray-900 flex flex-col items-center justify-center p-6 relative overflow-hidden transition-colors duration-300">
      {/* Background decoration */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-50 dark:bg-indigo-900/10 rounded-full blur-3xl opacity-60 animate-pulse"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-50 dark:bg-indigo-900/10 rounded-full blur-3xl opacity-60 animate-pulse delay-1000"></div>
      </div>

      <div className="w-full max-w-4xl grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        <div className="space-y-8 text-center lg:text-left">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center justify-center lg:justify-start gap-3"
          >
            <div className="bg-indigo-600 p-3 rounded-2xl shadow-lg shadow-indigo-200 dark:shadow-indigo-900/20">
              <MessageSquare className="text-white w-8 h-8" />
            </div>
            <h1 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">{APP_NAME}</h1>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="space-y-4"
          >
            <h2 className="text-5xl lg:text-6xl font-black text-gray-900 dark:text-white leading-[1.1] tracking-tight">
              Connect with your <span className="text-indigo-600">community</span> in real-time.
            </h2>
            <p className="text-lg text-gray-500 dark:text-gray-400 font-medium max-w-lg mx-auto lg:mx-0">
              The modern messaging platform for teams, friends, and creators. Secure, fast, and always in sync.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="grid grid-cols-2 gap-4"
          >
            <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 flex flex-col gap-2">
              <Zap className="w-5 h-5 text-indigo-600" />
              <span className="text-sm font-bold text-gray-900 dark:text-white">Real-time Sync</span>
              <span className="text-xs text-gray-500 dark:text-gray-400">Messages arrive instantly in your community.</span>
            </div>
            <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 flex flex-col gap-2">
              <ShieldCheck className="w-5 h-5 text-indigo-600" />
              <span className="text-sm font-bold text-gray-900 dark:text-white">Secure Auth</span>
              <span className="text-xs text-gray-500 dark:text-gray-400">Powered by industry-leading security.</span>
            </div>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
          className="bg-white dark:bg-gray-800 p-8 lg:p-12 rounded-[2.5rem] shadow-2xl shadow-indigo-100 dark:shadow-black/20 border border-gray-100 dark:border-gray-700 flex flex-col items-center text-center space-y-8 min-h-[500px] justify-center"
        >
          <AnimatePresence mode="wait">
            {mode === 'initial' ? (
              <motion.div
                key="initial"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="w-full space-y-8"
              >
                <div className="space-y-2">
                  <h3 className="text-2xl font-black text-gray-900 dark:text-white">Get Started</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">Choose how you want to join the conversation.</p>
                </div>

                <div className="w-full space-y-4">
                  <motion.button
                    whileHover={{ scale: 1.02, y: -2 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={onSignIn}
                    disabled={loading}
                    className="w-full flex items-center justify-center gap-3 bg-white dark:bg-gray-900 border-2 border-gray-100 dark:border-gray-700 hover:border-indigo-600 dark:hover:border-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 px-6 py-4 rounded-2xl font-bold text-gray-700 dark:text-gray-200 transition-all shadow-sm"
                  >
                    {loading ? (
                      <div className="w-5 h-5 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      <>
                        <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="w-5 h-5" />
                        <span>Continue with Google</span>
                      </>
                    )}
                  </motion.button>

                  <motion.button
                    whileHover={{ scale: 1.02, y: -2 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setMode('signin')}
                    disabled={loading}
                    className="w-full flex items-center justify-center gap-3 bg-gray-50 dark:bg-gray-700 border-2 border-transparent hover:border-indigo-600 dark:hover:border-indigo-500 px-6 py-4 rounded-2xl font-bold text-gray-700 dark:text-gray-200 transition-all"
                  >
                    <Mail className="w-5 h-5 text-indigo-600" />
                    <span>Sign in with Email</span>
                  </motion.button>

                  <div className="relative py-2">
                    <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-100 dark:border-gray-700"></div></div>
                    <div className="relative flex justify-center text-xs uppercase"><span className="bg-white dark:bg-gray-800 px-2 text-gray-400 font-bold tracking-widest">Or</span></div>
                  </div>

                  <motion.button
                    whileHover={{ scale: 1.02, y: -2 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={onSignInAnonymously}
                    disabled={loading}
                    className="w-full flex items-center justify-center gap-3 bg-indigo-600 hover:bg-indigo-700 px-6 py-4 rounded-2xl font-bold text-white transition-all shadow-lg shadow-indigo-200 dark:shadow-none disabled:opacity-50"
                  >
                    <LogIn className="w-5 h-5" />
                    <span>Continue as Guest</span>
                  </motion.button>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="form"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="w-full space-y-6"
              >
                <div className="flex items-center gap-4 mb-4">
                  <button 
                    onClick={() => setMode('initial')}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-colors"
                  >
                    <ArrowLeft className="w-5 h-5 text-gray-500" />
                  </button>
                  <h3 className="text-2xl font-black text-gray-900 dark:text-white">
                    {mode === 'signin' ? 'Sign In' : 'Create Account'}
                  </h3>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  {mode === 'signup' && (
                    <div className="space-y-1 text-left">
                      <label className="text-xs font-black text-gray-400 uppercase tracking-widest px-1">Display Name</label>
                      <div className="relative">
                        <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                          type="text"
                          required
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          placeholder="Your Name"
                          className="w-full pl-12 pr-4 py-4 bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-700 rounded-2xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all font-bold text-gray-900 dark:text-white"
                        />
                      </div>
                    </div>
                  )}

                  <div className="space-y-1 text-left">
                    <label className="text-xs font-black text-gray-400 uppercase tracking-widest px-1">Email Address</label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="you@example.com"
                        className="w-full pl-12 pr-4 py-4 bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-700 rounded-2xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all font-bold text-gray-900 dark:text-white"
                      />
                    </div>
                  </div>

                  <div className="space-y-1 text-left">
                    <label className="text-xs font-black text-gray-400 uppercase tracking-widest px-1">Password</label>
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="password"
                        required
                        minLength={6}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full pl-12 pr-4 py-4 bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-700 rounded-2xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all font-bold text-gray-900 dark:text-white"
                      />
                    </div>
                  </div>

                  {error && (
                    <p className="text-xs font-bold text-red-500 bg-red-50 dark:bg-red-900/20 p-3 rounded-xl border border-red-100 dark:border-red-900/30">
                      {error}
                    </p>
                  )}

                  <motion.button
                    whileHover={{ scale: 1.02, y: -2 }}
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    disabled={loading}
                    className="w-full flex items-center justify-center gap-3 bg-indigo-600 hover:bg-indigo-700 px-6 py-4 rounded-2xl font-bold text-white transition-all shadow-lg shadow-indigo-200 dark:shadow-none disabled:opacity-50"
                  >
                    {loading ? (
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      <span>{mode === 'signin' ? 'Sign In' : 'Sign Up'}</span>
                    )}
                  </motion.button>
                </form>

                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  {mode === 'signin' ? "Don't have an account?" : "Already have an account?"}{' '}
                  <button 
                    onClick={() => setMode(mode === 'signin' ? 'signup' : 'signin')}
                    className="text-indigo-600 font-bold hover:underline"
                  >
                    {mode === 'signin' ? 'Sign Up' : 'Sign In'}
                  </button>
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="pt-4 flex items-center justify-center gap-6 opacity-50 dark:text-gray-400">
            <div className="flex flex-col items-center gap-1">
              <Users className="w-5 h-5" />
              <span className="text-[10px] font-bold uppercase tracking-widest">Multi-user</span>
            </div>
            <div className="flex flex-col items-center gap-1">
              <Globe className="w-5 h-5" />
              <span className="text-[10px] font-bold uppercase tracking-widest">Global</span>
            </div>
          </div>
          
          <p className="text-[10px] text-gray-400 dark:text-gray-500 font-medium max-w-xs">
            By continuing, you agree to our Terms of Service and Privacy Policy.
          </p>
        </motion.div>
      </div>
    </div>
  );
};
