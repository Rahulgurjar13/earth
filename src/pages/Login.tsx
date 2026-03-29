import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, Globe, TrendingUp, Shield } from 'lucide-react';
import Logo from '@/components/layout/Logo';
import { useAuthStore } from '@/store/authStore';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const login = useAuthStore(s => s.login);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }
    setLoading(true);
    const ok = await login(email, password);
    setLoading(false);
    if (ok) navigate('/dashboard');
    else setError('Invalid email or password');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Left panel */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-between p-12 text-white relative overflow-hidden"
        style={{ background: 'linear-gradient(160deg, #166534 0%, #1a7a3a 40%, #15803d 100%)' }}>

        {/* Decorative circles */}
        <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-white/5" />
        <div className="absolute -bottom-32 -left-20 w-80 h-80 rounded-full bg-white/5" />
        <div className="absolute top-1/3 right-1/4 w-40 h-40 rounded-full bg-white/[0.03]" />

        {/* Logo */}
        <div className="relative z-10">
          <span className="text-xl font-semibold tracking-tight">Darukaa<span className="font-normal opacity-70">.earth</span></span>
        </div>

        {/* Content */}
        <div className="relative z-10 max-w-lg">
          <p className="text-white/60 text-[11px] font-semibold uppercase tracking-[0.2em] mb-5">
            Built on Science, Designed for Decisions
          </p>
          <h1 className="text-[2.25rem] font-bold leading-[1.15] mb-5">
            Nature complexity to
            <br />
            Business Intelligence
          </h1>
          <p className="text-white/70 text-[15px] leading-relaxed mb-10 max-w-md">
            Monitor carbon sequestration, track biodiversity metrics, and manage conservation projects with geospatial precision.
          </p>

          {/* Feature cards */}
          <div className="grid grid-cols-3 gap-3">
            {[
              { icon: Globe, label: 'Biodiversity Intelligence', desc: 'AI-driven monitoring' },
              { icon: TrendingUp, label: 'Climate Intelligence', desc: 'Carbon sequestration' },
              { icon: Shield, label: 'Nature Finance', desc: 'Verified credits' },
            ].map(({ icon: Icon, label, desc }) => (
              <div key={label}
                className="rounded-lg p-3.5 bg-white/[0.08] border border-white/[0.08] backdrop-blur-sm">
                <Icon className="w-5 h-5 text-white/80 mb-2.5" />
                <p className="text-xs font-semibold text-white/90 mb-0.5">{label}</p>
                <p className="text-[11px] text-white/50">{desc}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="relative z-10 text-xs text-white/30">
          © 2025 Darukaa.Earth
        </div>
      </div>

      {/* Right panel */}
      <div className="w-full lg:w-1/2 flex flex-col items-center justify-center px-6 sm:px-16 bg-white">
        {/* Mobile logo */}
        <div className="lg:hidden mb-10">
          <Logo />
        </div>

        <div className="w-full max-w-sm">
          <h2 className="text-2xl font-bold text-gray-900 mb-1">Welcome back</h2>
          <p className="text-sm text-gray-500 mb-8">Sign in to access your dashboard</p>

          {error && (
            <div className="mb-5 p-3 rounded-lg text-sm bg-red-50 text-red-600 border border-red-200">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Email address</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-gray-400" />
                <input
                  type="email"
                  placeholder="you@company.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full h-11 pl-11 pr-4 rounded-lg text-sm bg-white border border-gray-300 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-[#1a7a3a] focus:ring-2 focus:ring-[#1a7a3a]/10 transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Password</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-gray-400" />
                <input
                  type={showPw ? 'text' : 'password'}
                  placeholder="Enter your password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full h-11 pl-11 pr-11 rounded-lg text-sm bg-white border border-gray-300 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-[#1a7a3a] focus:ring-2 focus:ring-[#1a7a3a]/10 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPw(!showPw)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showPw ? <EyeOff className="w-[18px] h-[18px]" /> : <Eye className="w-[18px] h-[18px]" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full h-11 rounded-lg bg-[#1a7a3a] text-white font-semibold text-sm shadow-sm hover:bg-[#15662f] active:bg-[#125528] transition-colors disabled:opacity-60"
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <div className="flex items-center gap-4 my-8">
            <div className="flex-1 h-px bg-gray-200" />
            <span className="text-xs text-gray-400 font-medium">OR</span>
            <div className="flex-1 h-px bg-gray-200" />
          </div>

          <p className="text-center text-sm text-gray-600">
            Don't have an account?{' '}
            <Link to="/register" className="text-[#1a7a3a] font-semibold hover:underline">
              Create one →
            </Link>
          </p>

          <p className="text-center text-xs text-gray-400 mt-10">
            Trusted by leading environmental research institutes across the globe
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
