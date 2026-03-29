import { useState } from 'react';
import { User, Lock, Bell, Building, Palette } from 'lucide-react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { useAuthStore } from '@/store/authStore';

const tabs = [
  { id: 'profile', icon: User, label: 'Profile' },
  { id: 'security', icon: Lock, label: 'Security' },
  { id: 'notifications', icon: Bell, label: 'Notifications' },
  { id: 'org', icon: Building, label: 'Organization' },
  { id: 'appearance', icon: Palette, label: 'Appearance' },
];

const inputCls =
  'w-full h-9 px-3 rounded-md text-sm bg-white border border-gray-200 text-foreground placeholder:text-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-300 focus:border-gray-300 transition-all';

type Notifs = {
  email: boolean;
  weekly: boolean;
  anomaly: boolean;
  milestone: boolean;
  team: boolean;
};

const Settings = () => {
  const [tab, setTab] = useState('profile');
  const user = useAuthStore(s => s.user);
  const [profile, setProfile] = useState({
    name: user?.name || 'Rahul Gurjar',
    email: user?.email || 'rahul@darukaa.earth',
    title: 'Environmental Scientist',
    location: 'India',
    bio: '',
  });
  const [notifs, setNotifs] = useState<Notifs>({
    email: true,
    weekly: true,
    anomaly: true,
    milestone: false,
    team: true,
  });

  const notificationItems: Array<{ key: keyof Notifs; label: string; desc: string }> = [
    { key: 'email', label: 'Email Alerts', desc: 'Get notified about important updates' },
    { key: 'weekly', label: 'Weekly Digest', desc: 'Summary of your portfolio performance' },
    { key: 'anomaly', label: 'Site Anomaly Alerts', desc: 'When unusual activity is detected' },
    { key: 'milestone', label: 'Carbon Milestone Alerts', desc: 'When targets are reached' },
    { key: 'team', label: 'Team Activity', desc: 'Actions from team members' },
  ];

  return (
    <DashboardLayout breadcrumb="Settings">
      <h1 className="text-lg font-semibold text-foreground mb-5">Settings</h1>

      <div className="flex flex-col md:flex-row gap-6">
        {/* Tabs */}
        <div className="md:w-48 flex md:flex-col gap-px overflow-x-auto md:overflow-x-visible pb-2 md:pb-0">
          {tabs.map(({ id, icon: Icon, label }) => (
            <button
              key={id}
              onClick={() => setTab(id)}
              className={`flex items-center gap-2 px-3 py-2 rounded-md text-[13px] font-medium whitespace-nowrap transition-colors ${
                tab === id
                  ? 'bg-gray-100 text-foreground'
                  : 'text-muted-foreground hover:text-foreground hover:bg-gray-50'
              }`}
            >
              <Icon className="w-4 h-4" />
              {label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 max-w-2xl">
          {tab === 'profile' && (
            <div className="bg-white rounded-lg p-6 space-y-5" style={{ boxShadow: '0 1px 2px 0 rgba(0,0,0,0.03), 0 1px 3px 0 rgba(0,0,0,0.06)' }}>
              <div className="flex items-center gap-4 mb-2">
                <div className="w-14 h-14 rounded-lg bg-gray-100 flex items-center justify-center text-gray-500 text-lg font-semibold">
                  {profile.name.split(' ').map(n => n[0]).join('')}
                </div>
                <div>
                  <button className="text-sm text-primary font-medium hover:underline">
                    Upload photo
                  </button>
                  <p className="text-xs text-muted-foreground">JPG, PNG. Max 2MB</p>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-[11px] font-medium text-gray-400 uppercase tracking-wider block mb-1.5">Full Name</label>
                  <input
                    value={profile.name}
                    onChange={e => setProfile(p => ({ ...p, name: e.target.value }))}
                    className={inputCls}
                  />
                </div>
                <div>
                  <label className="text-[11px] font-medium text-gray-400 uppercase tracking-wider block mb-1.5">Email</label>
                  <input
                    value={profile.email}
                    onChange={e => setProfile(p => ({ ...p, email: e.target.value }))}
                    className={inputCls}
                  />
                </div>
                <div>
                  <label className="text-[11px] font-medium text-gray-400 uppercase tracking-wider block mb-1.5">Job Title</label>
                  <input
                    value={profile.title}
                    onChange={e => setProfile(p => ({ ...p, title: e.target.value }))}
                    className={inputCls}
                  />
                </div>
                <div>
                  <label className="text-[11px] font-medium text-gray-400 uppercase tracking-wider block mb-1.5">Location</label>
                  <input
                    value={profile.location}
                    onChange={e => setProfile(p => ({ ...p, location: e.target.value }))}
                    className={inputCls}
                  />
                </div>
              </div>
              <div>
                <label className="text-[11px] font-medium text-gray-400 uppercase tracking-wider block mb-1.5">Bio</label>
                <textarea
                  value={profile.bio}
                  onChange={e => setProfile(p => ({ ...p, bio: e.target.value }))}
                  rows={3}
                  placeholder="Tell us about yourself..."
                  className="w-full px-3 py-2 rounded-md text-sm bg-white border border-gray-200 text-foreground placeholder:text-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-300 resize-none transition-all"
                />
              </div>
              <button className="h-9 px-4 rounded-md bg-primary text-white font-medium text-sm hover:opacity-90 transition-opacity">
                Save Changes
              </button>
            </div>
          )}

          {tab === 'security' && (
            <div className="bg-white rounded-lg p-6 space-y-5" style={{ boxShadow: '0 1px 2px 0 rgba(0,0,0,0.03), 0 1px 3px 0 rgba(0,0,0,0.06)' }}>
              <h3 className="text-sm font-semibold text-foreground">Change Password</h3>
              <div className="space-y-3 max-w-sm">
                <div>
                  <label className="text-[11px] font-medium text-gray-400 uppercase tracking-wider block mb-1.5">Current Password</label>
                  <input type="password" className={inputCls} />
                </div>
                <div>
                  <label className="text-[11px] font-medium text-gray-400 uppercase tracking-wider block mb-1.5">New Password</label>
                  <input type="password" className={inputCls} />
                </div>
                <div>
                  <label className="text-[11px] font-medium text-gray-400 uppercase tracking-wider block mb-1.5">Confirm New Password</label>
                  <input type="password" className={inputCls} />
                </div>
              </div>
              <button className="h-9 px-4 rounded-md bg-primary text-white font-medium text-sm hover:opacity-90 transition-opacity">
                Update Password
              </button>

              <div className="h-px bg-gray-100 my-4" />
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-medium text-foreground">Two-Factor Authentication</h4>
                  <p className="text-xs text-muted-foreground">Add an extra layer of security</p>
                </div>
                <div
                  className="w-10 h-5 rounded-full bg-gray-200 relative cursor-pointer"
                  onClick={() => {}}
                >
                  <div className="absolute left-0.5 top-0.5 w-4 h-4 rounded-full bg-white shadow-sm transition-transform" />
                </div>
              </div>

              <div className="h-px bg-gray-100 my-4" />
              <h4 className="text-sm font-medium text-foreground mb-3">Active Sessions</h4>
              {[
                { device: 'MacBook Pro — Chrome', location: 'India', time: 'Active now' },
                { device: 'iPhone 15 — Safari', location: 'India', time: '2h ago' },
              ].map((s, i) => (
                <div key={i} className="flex items-center justify-between py-2">
                  <div>
                    <div className="text-sm text-foreground">{s.device}</div>
                    <div className="text-xs text-muted-foreground">{s.location} · {s.time}</div>
                  </div>
                  <button className="text-xs text-red-500 hover:underline">Revoke</button>
                </div>
              ))}
            </div>
          )}

          {tab === 'notifications' && (
            <div className="bg-white rounded-lg p-6 space-y-1" style={{ boxShadow: '0 1px 2px 0 rgba(0,0,0,0.03), 0 1px 3px 0 rgba(0,0,0,0.06)' }}>
              {notificationItems.map(({ key, label, desc }) => (
                <div key={key} className="flex items-center justify-between py-3">
                  <div>
                    <div className="text-sm font-medium text-foreground">{label}</div>
                    <div className="text-xs text-muted-foreground">{desc}</div>
                  </div>
                  <button
                    onClick={() => setNotifs(p => ({ ...p, [key]: !p[key] }))}
                    className={`w-10 h-5 rounded-full relative transition-colors ${notifs[key] ? 'bg-primary' : 'bg-gray-200'}`}
                  >
                    <div
                      className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow-sm transition-all ${notifs[key] ? 'left-[22px]' : 'left-0.5'}`}
                    />
                  </button>
                </div>
              ))}
            </div>
          )}

          {tab === 'org' && (
            <div className="bg-white rounded-lg p-6" style={{ boxShadow: '0 1px 2px 0 rgba(0,0,0,0.03), 0 1px 3px 0 rgba(0,0,0,0.06)' }}>
              <h3 className="text-sm font-semibold text-foreground mb-4">Organization Settings</h3>
              <div className="space-y-4 max-w-sm">
                <div>
                  <label className="text-[11px] font-medium text-gray-400 uppercase tracking-wider block mb-1.5">Organization Name</label>
                  <input defaultValue="Darukaa Technologies" className={inputCls} />
                </div>
                <div>
                  <label className="text-[11px] font-medium text-gray-400 uppercase tracking-wider block mb-1.5">Industry</label>
                  <input defaultValue="Climate Tech" className={inputCls} />
                </div>
              </div>
              <button className="h-9 px-4 rounded-md bg-primary text-white font-medium text-sm hover:opacity-90 transition-opacity mt-5">
                Save
              </button>
            </div>
          )}

          {tab === 'appearance' && (
            <div className="bg-white rounded-lg p-6" style={{ boxShadow: '0 1px 2px 0 rgba(0,0,0,0.03), 0 1px 3px 0 rgba(0,0,0,0.06)' }}>
              <h3 className="text-sm font-semibold text-foreground mb-4">Theme</h3>
              <div className="grid grid-cols-3 gap-3 mb-6">
                {['Light', 'Dark', 'System'].map(t => (
                  <button
                    key={t}
                    className={`p-4 rounded-lg text-center transition-all border ${t === 'Light' ? 'border-primary bg-emerald-50/50' : 'border-gray-200 hover:border-gray-300'}`}
                  >
                    <div
                      className={`w-8 h-8 rounded-md mx-auto mb-2 ${t === 'Light' ? 'bg-white border border-gray-200' : t === 'Dark' ? 'bg-gray-800' : 'bg-gradient-to-br from-white to-gray-800'}`}
                    />
                    <span
                      className={`text-xs font-medium ${t === 'Light' ? 'text-primary' : 'text-muted-foreground'}`}
                    >
                      {t}
                    </span>
                  </button>
                ))}
              </div>
              <h3 className="text-sm font-semibold text-foreground mb-3">Map Style</h3>
              <div className="grid grid-cols-3 gap-3">
                {['Light', 'Satellite', 'Terrain'].map(s => (
                  <button
                    key={s}
                    className={`p-4 rounded-lg text-center border ${s === 'Light' ? 'border-primary bg-emerald-50/50' : 'border-gray-200 hover:border-gray-300'}`}
                  >
                    <span
                      className={`text-xs font-medium ${s === 'Light' ? 'text-primary' : 'text-muted-foreground'}`}
                    >
                      {s}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Settings;
