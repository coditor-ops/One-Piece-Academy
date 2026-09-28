import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../api/client.js';
import { Button, Spinner, ErrorState, Badge } from '../components/ui.jsx';

export default function MarketDashboard() {
  const qc = useQueryClient();
  const [rushSkill, setRushSkill] = useState('');

  const { data: overview, isLoading, error } = useQuery({
    queryKey: ['market-overview'],
    queryFn: () => api.get('/market/overview'),
    refetchInterval: 5000,
  });

  const { data: config } = useQuery({
    queryKey: ['pricing-config'],
    queryFn: () => api.get('/market/admin/pricing-config'),
  });

  const updateConfig = useMutation({
    mutationFn: (data) => api.put('/market/admin/pricing-config', data),
    onSuccess: () => qc.invalidateQueries(['pricing-config']),
  });

  const simulateRush = useMutation({
    mutationFn: (skillId) => api.post('/market/admin/simulate-rush', { skillId, count: 15 }),
    onSuccess: () => {
      qc.invalidateQueries(['market-overview']);
      qc.invalidateQueries(['listings']);
    },
  });

  if (isLoading) return <div className="flex justify-center py-24"><Spinner size={36} /></div>;
  if (error) return <ErrorState message={error.message} />;

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-line/40 pb-6">
        <div>
          <span className="text-gold text-xs font-mono font-semibold uppercase tracking-widest block mb-1">
            🌊 Revolutionary Command • Fleet Admiral Control
          </span>
          <h1 className="font-display text-4xl sm:text-5xl text-text-primary">
            Market Economy Dashboard
          </h1>
          <p className="text-text-secondary text-sm sm:text-base mt-1">
            Tune dynamic pricing parameters, inject simulated pirate rushes, and monitor economy health.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1 rounded-full bg-deep border border-line text-xs font-mono text-gold">
            ● Pricing Engine Active
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Pricing Config Panel */}
        <div className="bg-hull border border-line rounded-2xl p-6 shadow-e1 space-y-4">
          <div className="flex items-center justify-between border-b border-line/40 pb-3">
            <h2 className="font-display text-2xl text-text-primary flex items-center gap-2">
              <span>⚙️</span> Dynamic Pricing Config
            </h2>
            <span className="text-xs font-mono text-text-muted">Formula Parameters</span>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <ConfigInput 
              label="k (Sensitivity)" 
              propKey="k" 
              value={config?.k} 
              step={0.1} 
              min={0} 
              max={5} 
              onChange={updateConfig} 
            />
            <ConfigInput 
              label="alpha (Smoothing)" 
              propKey="alpha" 
              value={config?.alpha} 
              step={0.1} 
              min={0} 
              max={1} 
              onChange={updateConfig} 
            />
            <ConfigInput 
              label="minMult (Min Bound)" 
              propKey="minMult" 
              value={config?.minMult} 
              step={0.1} 
              min={0.1} 
              max={1} 
              onChange={updateConfig} 
            />
            <ConfigInput 
              label="maxMult (Max Cap)" 
              propKey="maxMult" 
              value={config?.maxMult} 
              step={0.1} 
              min={1} 
              max={10} 
              onChange={updateConfig} 
            />
          </div>

          <div className="p-3 bg-deep rounded-xl border border-line/60 text-xs font-mono text-text-muted space-y-1">
            <div>Default parameters: <span className="text-gold">k=0.6, α=1.0, min=0.7, max=3.0</span></div>
            <div>Formula: <span className="text-text-secondary">P = Base × clamp(1 + k·ln(1 + D/S), minMult, maxMult)</span></div>
          </div>
        </div>

        {/* Simulate Pirate Rush */}
        <div className="bg-hull border border-line rounded-2xl p-6 shadow-e1 flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between border-b border-line/40 pb-3 mb-4">
              <h2 className="font-display text-2xl text-text-primary flex items-center gap-2">
                <span>🔥</span> Simulate Pirate Rush
              </h2>
              <span className="text-xs font-mono text-ember font-bold">Demand Trigger</span>
            </div>

            <p className="text-text-secondary text-sm leading-relaxed mb-4">
              Inject 15 instant session request events for a chosen skill to watch its price surge live across the market in real-time.
            </p>

            <div className="space-y-3">
              <label className="text-xs text-text-muted uppercase font-mono block">Select Skill to Rush</label>
              <select 
                className="input w-full" 
                value={rushSkill} 
                onChange={e => setRushSkill(e.target.value)}
              >
                <option value="">Choose a skill listing...</option>
                {overview?.map(s => (
                  <option key={s.id} value={s.id}>
                    {s.icon} {s.name} (Current ×{s.multiplier?.toFixed(2)})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <Button 
            onClick={() => simulateRush.mutate(rushSkill)} 
            disabled={!rushSkill || simulateRush.isPending} 
            loading={simulateRush.isPending}
            className="w-full h-12 text-sm font-bold shadow-glow-ember bg-ember hover:bg-ember/90 text-white"
          >
            {simulateRush.isPending ? 'Injecting Request Events...' : '⚡ Launch Pirate Rush (15 Demand Events)'}
          </Button>
        </div>

      </div>

      {/* Live Market Overview Grid */}
      <div className="bg-hull border border-line rounded-2xl overflow-hidden shadow-e1">
        <div className="p-6 border-b border-line/40 flex items-center justify-between">
          <h2 className="font-display text-2xl text-text-primary">
            Live Economy Monitor ({overview?.length || 0} Skills)
          </h2>
          <span className="text-xs font-mono text-text-muted">Auto-refreshing</span>
        </div>

        <div className="p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {overview?.map(s => {
            const isRising = s.trend === 'rising';
            const isFalling = s.trend === 'falling';

            return (
              <div 
                key={s.id} 
                className={`bg-deep rounded-xl p-5 border transition-all ${
                  isRising 
                    ? 'border-ember/40 bg-ember/5' 
                    : isFalling 
                    ? 'border-foam/40 bg-foam/5' 
                    : 'border-line/60'
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{s.icon}</span>
                    <span className="font-semibold text-text-primary text-base">{s.name}</span>
                  </div>
                  <Badge color={isRising ? 'ember' : isFalling ? 'foam' : 'muted'}>
                    {s.trend.toUpperCase()}
                  </Badge>
                </div>

                <div className="flex items-baseline justify-between mt-2">
                  <span className="text-xs text-text-muted uppercase font-mono">Multiplier</span>
                  <span className="font-mono text-2xl font-black text-gold">
                    ×{s.multiplier?.toFixed(2)}
                  </span>
                </div>

                <div className="mt-3 pt-3 border-t border-line/40 grid grid-cols-3 text-center text-xs font-mono">
                  <div>
                    <span className="text-text-muted block text-[10px]">Teachers</span>
                    <span className="font-bold text-text-primary">{s.providerCount}</span>
                  </div>
                  <div>
                    <span className="text-text-muted block text-[10px]">Supply (S)</span>
                    <span className="font-bold text-tide">{s.supply}</span>
                  </div>
                  <div>
                    <span className="text-text-muted block text-[10px]">Demand (D)</span>
                    <span className="font-bold text-ember">{s.demand?.toFixed(1)}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <style>{`.input { background: #0D1526; border: 1px solid #2A3A5C; border-radius: 8px; color: #F3EEDF; padding: 10px 14px; font-size: 14px; outline: none; transition: border-color 150ms; } .input:focus { border-color: #F2B84B; } select option { background: #0D1526; }`}</style>
    </div>
  );
}

function ConfigInput({ label, propKey, value, step, min, max, type = 'number', onChange }) {
  return (
    <div>
      <label className="text-text-muted text-xs uppercase font-mono block mb-1">{label}</label>
      <input 
        type={type} 
        className="input w-full" 
        step={step} 
        min={min} 
        max={max}
        value={value ?? ''} 
        onChange={e => onChange.mutate({ [propKey]: type === 'number' ? parseFloat(e.target.value) : e.target.value })} 
      />
    </div>
  );
}