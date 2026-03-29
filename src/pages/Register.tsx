import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, User, Building, MapPin, BarChart3, Leaf } from 'lucide-react';
import Logo from '@/components/layout/Logo';
import { useAuthStore } from '@/store/authStore';

type RegisterForm = {
  name: string;
  email: string;
  org: string;
  password: string;
  confirm: string;
};

const Register = () => {
  const [form, setForm] = useState<RegisterForm>({
    name: '',
    email: '',
    org: '',
    password: '',
    confirm: '',
  });
  const [showPw, setShowPw] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const register = useAuthStore(s => s.register);

  const strength =
    form.password.length === 0
      ? 0
      : form.password.length < 6
        ? 1
        : form.password.length < 10
          ? 2
          : 3;
  const strengthColors = ['', 'bg-destructive', 'bg-warning', 'bg-primary'];
  const strengthLabels = ['', 'Weak', 'Medium', 'Strong'];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.password) {
      setError('Please fill required fields');
      return;
    }
    if (form.password !== form.confirm) {
      setError('Passwords do not match');
      return;
    }
    if (!agreed) {
      setError('Please agree to the terms');
      return;
    }
    setLoading(true);
    const ok = await register(form.name, form.email, form.password);
    setLoading(false);
    if (ok) navigate('/dashboard');
    else setError('Registration failed');
  };

  const up = (k: keyof RegisterForm) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm(p => ({ ...p, [k]: e.target.value }));

  const fields = [
    { key: 'name', icon: User, placeholder: 'Full Name', type: 'text' as const },
    { key: 'email', icon: Mail, placeholder: 'Work Email', type: 'email' as const },
    { key: 'org', icon: Building, placeholder: 'Organization (optional)', type: 'text' as const },
  ] as const;

  return (
    <div className="min-h-screen flex bg-background">
      {/* Left — same as login */}
      <div className="hidden lg:flex lg:w-[55%] flex-col justify-between p-10 relative overflow-hidden">
        <Logo />
        <div className="max-w-lg mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-primary/10 text-primary border border-primary/20 mb-6">
            🌿 Climate Intelligence Platform
          </div>
          <h1 className="text-4xl font-bold heading-tight text-foreground mb-4">
            Join the Mission
          </h1>
          <p className="text-muted-foreground text-[15px] leading-relaxed mb-8 max-w-md mx-auto">
            Start monitoring and managing carbon and biodiversity projects at scale.
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
        <div className="text-xs text-muted-foreground text-center">© 2025 Darukaa.Earth</div>
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
            Create your account
          </h2>
          <p className="text-sm text-muted-foreground mb-6">Start your climate impact journey</p>

          {error && (
            <div className="mb-4 p-3 rounded-lg text-sm bg-destructive/10 text-destructive border border-destructive/20">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3">
            {fields.map(({ key, icon: Icon, placeholder, type }) => (
              <div key={key} className="relative">
                <Icon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type={type}
                  placeholder={placeholder}
                  value={form[key]}
                  onChange={up(key)}
                  className="w-full h-11 pl-10 pr-4 rounded-lg text-sm bg-background border text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/40 focus:ring-2 focus:ring-primary/10 transition-all"
                  style={{ borderColor: 'rgba(255,255,255,0.08)' }}
                />
              </div>
            ))}

            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type={showPw ? 'text' : 'password'}
                placeholder="Password"
                value={form.password}
                onChange={up('password')}
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

            {form.password && (
              <div className="flex items-center gap-2">
                <div className="flex gap-1 flex-1">
                  {[1, 2, 3].map(i => (
                    <div
                      key={i}
                      className={`h-1 flex-1 rounded-full transition-colors ${i <= strength ? strengthColors[strength] : 'bg-muted/30'}`}
                    />
                  ))}
                </div>
                <span className="text-[11px] text-muted-foreground">
                  {strengthLabels[strength]}
                </span>
              </div>
            )}

            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="password"
                placeholder="Confirm Password"
                value={form.confirm}
                onChange={up('confirm')}
                className="w-full h-11 pl-10 pr-4 rounded-lg text-sm bg-background border text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/40 focus:ring-2 focus:ring-primary/10 transition-all"
                style={{ borderColor: 'rgba(255,255,255,0.08)' }}
              />
            </div>

            <label className="flex items-start gap-2 cursor-pointer py-1">
              <input
                type="checkbox"
                checked={agreed}
                onChange={() => setAgreed(!agreed)}
                className="mt-0.5 accent-primary"
              />
              <span className="text-xs text-muted-foreground">
                I agree to the{' '}
                <button type="button" className="text-primary hover:underline">
                  Terms of Service
                </button>{' '}
                and{' '}
                <button type="button" className="text-primary hover:underline">
                  Privacy Policy
                </button>
              </span>
            </label>

            <button
              type="submit"
              disabled={loading}
              className="w-full h-11 rounded-lg bg-primary text-primary-foreground font-semibold text-sm hover:brightness-110 active:scale-[0.98] transition-all disabled:opacity-60"
            >
              {loading ? 'Creating account...' : 'Create Account'}
            </button>
          </form>

          <p className="text-center text-sm text-muted-foreground mt-6">
            Already have an account?{' '}
            <Link to="/login" className="text-primary hover:underline">
              Sign in →
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
