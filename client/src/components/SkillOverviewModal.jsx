import { useNavigate } from 'react-router-dom';
import { Modal, Button, Badge, VCT, TierBadge } from './ui.jsx';

export function getSkillAudienceAndOverview(skill, listing) {
  const category = skill?.category || 'General';

  const audienceMap = {
    Haki: {
      overview: 'Haki is a mysterious aura dormant in living creatures across the Grand Line. Mastering Haki grants armor projection, aura prediction, and willpower manifestation to overpower foes without physical contact.',
      targetAudience: [
        'Pirates preparing to enter the turbulent weather of the New World',
        'Combatants seeking to break through Logia Devil Fruit defenses',
        'Captains looking to inspire unyielding crew morale and leadership aura',
      ],
      prerequisites: 'Disciplined spirit, 150+ VCT balance, and willingness to endure rigorous endurance drills.',
      outcomes: ['Awakened Observation & Armament Haki', 'Black Lightning strike aura', '100% Secure'],
    },
    Swordsmanship: {
      overview: 'The art of precision blade strikes, flying slash projection, and breath-of-steel sword control. Learn to cut iron, deflect cannonballs, and channel black blade willpower.',
      targetAudience: [
        'Swordsmen aiming to challenge the Warlords of the Sea',
        'Fighters wanting to master 1-Sword, 2-Sword, or 3-Sword styles',
        'Pirates seeking high-speed counter-strike reflexes in battle',
      ],
      prerequisites: 'Melee weapon familiarity, high reflex agility, and dedication to sword form practice.',
      outcomes: ['Flying slash projectile control', 'Steel-slicing precision', 'Blade endurance techniques'],
    },
    Cooking: {
      overview: 'All Blue cuisine mastery, tactical nutrition, and Devil Fruit ingredient pairing. Fuel your crew with stamina-boosting feasts and combat meal prep.',
      targetAudience: [
        'Ship cooks responsible for keeping pirate crews in peak combat condition',
        'Gourmet pirates seeking rare All Blue seasonings and Devil Fruit recipes',
        'Captains looking to maximize crew stamina recovery during long voyages',
      ],
      prerequisites: 'Basic culinary knife safety and curiosity for exotic Grand Line spices.',
      outcomes: ['Stamina-boosting meal recipes', 'Devil Fruit dish pairing mastery', 'Sea King butchery tactics'],
    },
    Navigation: {
      overview: 'Grand Line weather forecasting, Log Pose calibration, and Cyclone trajectory prediction. Navigate unpredictable sea currents and evade Marine blockades.',
      targetAudience: [
        'Navigators steering ships through the turbulent currents of Sabaody & New World',
        'Pirates wanting to decode climate anomalies and sea monster migratory routes',
        'Captains seeking safest passage across calm belt zones',
      ],
      prerequisites: 'Basic map reading and understanding of barometric pressure trends.',
      outcomes: ['Cyclone path prediction', 'Multi-Log Pose synchronization', 'Calm Belt survival strategy'],
    },
    'Fish-Man Karate': {
      overview: 'Water manipulation techniques that punch through air and water molecules directly inside an opponent body, bypassing physical armor.',
      targetAudience: [
        'Hand-to-hand martial artists wanting long-range shockwave punches',
        'Naval fighters operating near ocean environments and ship hulls',
        'Pirates seeking water-bullet projectile control',
      ],
      prerequisites: 'Stamina endurance and water fluidity mindset.',
      outcomes: ['7000-Tile Kicks & Shockwave Punches', 'Ocean water-bullet throwing', 'Internal moisture impact'],
    },
  };

  const defaultDetails = {
    overview: listing?.description || skill?.description || 'Comprehensive Grand Line skill training designed by verified academy masters.',
    targetAudience: [
      'Pirates and learners seeking structured, high-yield skill growth',
      'Crew members wanting one-on-one mentorship from experienced masters',
      'Learners aiming to unlock advanced mastery tiers in this category',
    ],
    prerequisites: 'Open mindset, basic foundation in the chosen category, and VCT token balance.',
    outcomes: ['Verified Academy Skill Certificate', '1-on-1 Master Q&A Session', 'Guaranteed quality'],
  };

  return audienceMap[category] || defaultDetails;
}

export function SkillOverviewModal({ listing, onClose, onBook }) {
  const navigate = useNavigate();
  if (!listing) return null;

  const skill = listing.skill || { name: 'Skill', category: 'General' };
  const details = getSkillAudienceAndOverview(skill, listing);
  const targetSkillId = listing.skillId || listing.skill?.id || listing.id;

  return (
    <Modal open title={`📖 Skill Overview • ${skill.name}`} onClose={onClose}>
      <div className="space-y-5 text-sm">
        
        {/* Top Skill Header Pill */}
        <div className="bg-deep rounded-2xl p-4 border border-line/60 flex items-start gap-4">
          <span className="text-4xl p-3 bg-hull rounded-xl border border-line shrink-0">
            {skill.icon || '⚔️'}
          </span>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Badge color="gold">{skill.category}</Badge>
              <span className="text-xs text-text-muted font-mono">{listing.durationMin || 60} min session</span>
            </div>
            <h3 className="font-display text-2xl text-text-primary">{skill.name}</h3>
            <p className="text-text-secondary text-xs mt-1">
              Master: <strong className="text-text-primary">{listing.provider?.name}</strong> • Level: <strong className="text-gold">{listing.level || 'Master'}</strong>
            </p>
          </div>
        </div>

        {/* 📖 Overview Section */}
        <div className="bg-hull rounded-2xl p-5 border border-line/60 space-y-2">
          <h4 className="font-display text-xl text-gold flex items-center gap-2">
            <span>📖</span> Skill Overview & Philosophy
          </h4>
          <p className="text-text-secondary text-xs sm:text-sm leading-relaxed">
            {details.overview}
          </p>
        </div>

        {/* 🎯 Who Is This Skill For Section */}
        <div className="bg-hull rounded-2xl p-5 border border-line/60 space-y-3">
          <h4 className="font-display text-xl text-gold flex items-center gap-2">
            <span>🎯</span> Who is this Skill for?
          </h4>
          <ul className="space-y-2 text-xs sm:text-sm text-text-secondary">
            {details.targetAudience.map((target, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <span className="text-gold font-bold shrink-0 mt-0.5">⚔️</span>
                <span>{target}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Prerequisites & Outcomes */}
        <div className="bg-deep rounded-2xl p-4 border border-line/60 space-y-2 text-xs font-mono">
          <div><strong className="text-text-primary">⚡ Prerequisites:</strong> <span className="text-text-secondary">{details.prerequisites}</span></div>
          <div><strong className="text-text-primary">🏆 Key Outcomes:</strong> <span className="text-gold">{details.outcomes.join(' • ')}</span></div>
        </div>

        {/* Modal Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <Button
            className="flex-1 h-12 bg-gold text-[#1A1204] font-bold rounded-xl shadow-glow-gold text-sm"
            onClick={() => {
              onClose();
              if (onBook) onBook(listing);
            }}
          >
            📜 Send Vivre Card ({Number(listing.currentPrice).toLocaleString()} VCT)
          </Button>

          <Button
            variant="secondary"
            className="h-12 text-xs font-bold rounded-xl"
            onClick={() => {
              onClose();
              if (targetSkillId) navigate(`/skills/${targetSkillId}?buy=1`);
            }}
          >
            Full Skill Page →
          </Button>
        </div>

      </div>
    </Modal>
  );
}
