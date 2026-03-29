import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, MapPin, BarChart3, Leaf } from 'lucide-react';
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
    else setError('Invalid credentials. Try password: demo123');
  };

  const glowDots = [
    { cx: '25%', cy: '55%', label: 'Amazon' },
    { cx: '55%', cy: '45%', label: 'Congo' },
    { cx: '72%', cy: '58%', label: 'Borneo' },
  ];

  return (
    <div className="min-h-screen flex bg-background">
      {/* Left */}
      <div className="hidden lg:flex lg:w-[55%] flex-col justify-between p-10 relative overflow-hidden">
        <Logo />

        <div className="max-w-lg mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-primary/10 text-primary border border-primary/20 mb-6">
            🌿 Climate Intelligence Platform
          </div>
          <h1 className="text-4xl font-bold heading-tight text-foreground mb-4">
            Monitor Earth's
            <br />
            Carbon Future
          </h1>
          <p className="text-muted-foreground text-[15px] leading-relaxed mb-8 max-w-md mx-auto">
            Real-time insights for carbon and biodiversity projects across the globe.
          </p>
          <div className="flex flex-wrap justify-center gap-2">
            {[
              { icon: MapPin, label: 'Geospatial Analysis' },
              { icon: BarChart3, label: 'Carbon Tracking' },
              { icon: Leaf, label: 'Biodiversity Index' },
            ].map(({ icon: Icon, label }) => (
              <span
                key={label}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-muted-foreground"
                style={{
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(255,255,255,0.06)',
                }}
              >
                <Icon className="w-3.5 h-3.5" />
                {label}
              </span>
            ))}
          </div>
        </div>

        {/* Animated world dots */}
        <div className="absolute inset-0 flex items-center justify-center opacity-20 pointer-events-none">
          <svg viewBox="0 0 400 200" className="w-full max-w-2xl">
            <ellipse
              cx="200"
              cy="100"
              rx="180"
              ry="80"
              stroke="hsl(142 69% 58%)"
              strokeWidth="0.5"
              fill="none"
              opacity="0.3"
            />
            <ellipse
              cx="200"
              cy="100"
              rx="120"
              ry="55"
              stroke="hsl(142 69% 58%)"
              strokeWidth="0.3"
              fill="none"
              opacity="0.2"
            />
            {glowDots.map((d, i) => (
              <g key={i}>
                <circle
                  cx={d.cx}
                  cy={d.cy}
                  r="3"
                  fill="hsl(142 69% 58%)"
                  className="animate-pulse-glow"
                  style={{ animationDelay: `${i * 0.7}s` }}
                />
                <circle
                  cx={d.cx}
                  cy={d.cy}
                  r="8"
                  fill="hsl(142 69% 58%)"
                  opacity="0.15"
                  className="animate-pulse-glow"
                  style={{ animationDelay: `${i * 0.7}s` }}
                />
              </g>
            ))}
          </svg>
        </div>

        <div className="text-xs text-muted-foreground text-center">
          © 2025 Darukaa.Earth · Climate Intelligence
        </div>
      </div>

      {/* Right */}
      <div
        className="w-full lg:w-[45%] flex flex-col items-center justify-center px-6 border-l"
        style={{ background: 'hsl(120 20% 7%)', borderColor: 'rgba(255,255,255,0.04)' }}
      >
        <div className="lg:hidden mb-8">
          <Logo />
        </div>
        <div className="w-full max-w-[380px]">
          <h2 className="text-2xl font-semibold heading-tight text-foreground mb-1">
            Welcome back
          </h2>
          <p className="text-sm text-muted-foreground mb-8">Sign in to your dashboard</p>

          {error && (
            <div className="mb-4 p-3 rounded-lg text-sm bg-destructive/10 text-destructive border border-destructive/20">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="email"
                placeholder="Email address"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full h-11 pl-10 pr-4 rounded-lg text-sm bg-background border text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/40 focus:ring-2 focus:ring-primary/10 transition-all"
                style={{ borderColor: 'rgba(255,255,255,0.08)' }}
              />
            </div>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type={showPw ? 'text' : 'password'}
                placeholder="Password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full h-11 pl-10 pr-10 rounded-lg text-sm bg-background border text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/40 focus:ring-2 focus:ring-primary/10 transition-all"
                style={{ borderColor: 'rgba(255,255,255,0.08)' }}
              />
              <button
                type="button"
                onClick={() => setShowPw(!showPw)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            <div className="text-right">
              <button type="button" className="text-xs text-primary hover:underline">
                Forgot password?
              </button>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full h-11 rounded-lg bg-primary text-primary-foreground font-semibold text-sm hover:brightness-110 active:scale-[0.98] transition-all disabled:opacity-60"
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <div className="flex items-center gap-3 my-6">
            <div className="flex-1 h-px bg-border" />
            <span className="text-xs text-muted-foreground">or continue with</span>
            <div className="flex-1 h-px bg-border" />
          </div>

          <button
            className="w-full h-11 rounded-lg border text-sm font-medium text-foreground flex items-center justify-center gap-2 hover:bg-muted/10 transition-colors"
            style={{ borderColor: 'rgba(255,255,255,0.1)' }}
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            Continue with Google
          </button>

          <p className="text-center text-sm text-muted-foreground mt-6">
            Don't have an account?{' '}
            <Link to="/register" className="text-primary hover:underline">
              Create one →
            </Link>
          </p>
        </div>

        <div className="flex items-center gap-3 text-xs text-muted-foreground mt-12">
          <span>SOC2 Compliant</span>
          <span>·</span>
          <span>256-bit Encryption</span>
          <span>·</span>
          <span>GDPR Ready</span>
        </div>
      </div>
    </div>
  );
};

export default Login;
