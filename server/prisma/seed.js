import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const SKILLS = [
  { name: 'Advanced Conqueror\'s Haki', category: 'Haki', description: 'Master the supreme power of kings — Conqueror\'s Haki at its most advanced level. Taught exclusively by the Dark King himself.', icon: '⚡' },
  { name: 'Observation Haki', category: 'Haki', description: 'Sense the presence and intent of others before they act. Essential survival skill for the New World.', icon: '👁️' },
  { name: 'Armament Haki', category: 'Haki', description: 'Coat your body or weapons in invisible armor. Counter Devil Fruit abilities with sheer force.', icon: '🛡️' },
  { name: 'Santoryu Swordsmanship', category: 'Swordsmanship', description: 'Three-sword style as perfected by the World\'s Greatest Swordsman\'s rival. Wield three blades as one.', icon: '⚔️' },
  { name: 'One-Sword Style', category: 'Swordsmanship', description: 'Precision and power with a single blade. Foundational swordsmanship.', icon: '🗡️' },
  { name: 'Fish-Man Karate', category: 'Fish-Man Karate', description: 'Harness the power of water itself. 10x the strength of human martial arts. Effective even on land.', icon: '🥋' },
  { name: 'Navigation & Cartography', category: 'Navigation', description: 'Read the Log Pose, chart sea currents, and navigate the Grand Line without getting lost.', icon: '🧭' },
  { name: 'Black Leg Style Cooking', category: 'Cooking', description: 'The legendary cooking technique of the Vinsmoke family. Every dish a masterpiece. Kicks optional.', icon: '🍳' },
  { name: 'Devil Fruit Awakening', category: 'Devil Fruit Mastery', description: 'Unlock the true potential of your Devil Fruit. Warning: extremely dangerous. Most fail.', icon: '🍎' },
  { name: 'Shipwright Engineering', category: 'Shipwright', description: 'Build and repair ships that can survive the Grand Line. Learn from Tom\'s Workers\' finest.', icon: '⚓' },
];

const USERS = [
  { name: 'Silvers Rayleigh', email: 'rayleigh@grandline.sea', password: 'haki1234', crew: 'Roger Pirates', bio: 'The Dark King. Former First Mate of the Roger Pirates. Still the strongest.' },
  { name: 'Roronoa Zoro', email: 'zoro@mugiwara.sea', password: 'santoryu', crew: 'Straw Hat Pirates', bio: 'Future World\'s Greatest Swordsman. No sense of direction.' },
  { name: 'Jinbe', email: 'jinbe@fishman.sea', password: 'fishman1', crew: 'Straw Hat Pirates', bio: 'Knight of the Sea. Fish-Man Karate grandmaster.' },
  { name: 'Nami', email: 'nami@mugiwara.sea', password: 'orange1234', crew: 'Straw Hat Pirates', bio: 'Navigator of the Straw Hats. Thief. Weather scientist.' },
  { name: 'Sanji', email: 'sanji@baratie.sea', password: 'allblue11', crew: 'Straw Hat Pirates', bio: 'Black Leg. Chef. Will not kick with his hands.' },
  { name: 'Sengoku', email: 'sengoku@marineford.sea', password: 'buddhist1', crew: 'Marines', bio: 'Fleet Admiral (retired). Haki instructor.' },
  { name: 'Vista', email: 'vista@whitebeard.sea', password: 'flower123', crew: 'Whitebeard Pirates', bio: 'Flower Swords Vista. 5th Division Commander.' },
  // Learners
  { name: 'Monkey D. Luffy', email: 'luffy@mugiwara.sea', password: 'meatmeat1', crew: 'Straw Hat Pirates', bio: 'Future King of the Pirates. Always hungry.' },
  { name: 'Trafalgar Law', email: 'law@heartpirates.sea', password: 'room4321', crew: 'Heart Pirates', bio: 'Surgeon of Death. Interested in Haki theory.' },
  { name: 'Eustass Kid', email: 'kid@kidpirates.sea', password: 'magnetic1', crew: 'Kid Pirates', bio: 'Worst Generation. Needs navigation lessons badly.' },
  { name: 'Boa Hancock', email: 'hancock@kuja.sea', password: 'meroMero1', crew: 'Kuja Pirates', bio: 'Pirate Empress. Already knows some Haki but wants more.' },
  { name: 'Usopp', email: 'usopp@mugiwara.sea', password: 'sogeking1', crew: 'Straw Hat Pirates', bio: 'Sniper King. Is definitely not lying about wanting advanced training.' },
];

function futureDate(daysFromNow, hour = 10) {
  const d = new Date();
  d.setDate(d.getDate() + daysFromNow);
  d.setHours(hour, 0, 0, 0);
  return d;
}

function pastDate(daysAgo) {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  return d;
}

async function main() {
  console.log('🌊 Seeding Grand Line Skill Exchange...');

  // Wipe existing data
  await prisma.priceHistory.deleteMany();
  await prisma.demandEvent.deleteMany();
  await prisma.rating.deleteMany();
  await prisma.session.deleteMany();
  await prisma.transaction.deleteMany();
  await prisma.sessionRequest.deleteMany();
  await prisma.availabilitySlot.deleteMany();
  await prisma.listing.deleteMany();
  await prisma.skill.deleteMany();
  await prisma.pricingConfig.deleteMany();
  await prisma.user.deleteMany();

  // Skills
  const skills = {};
  for (const s of SKILLS) {
    const skill = await prisma.skill.create({ data: s });
    skills[s.name] = skill;
  }
  console.log(`✓ ${SKILLS.length} skills created`);

  // Users
  const users = {};
  for (const u of USERS) {
    const passwordHash = await bcrypt.hash(u.password, 10);
    const { password, ...rest } = u;
    const user = await prisma.user.create({
      data: { ...rest, passwordHash, balance: 500 },
    });
    // Grant transaction
    await prisma.transaction.create({
      data: { userId: user.id, type: 'GRANT', amount: 500, note: 'Welcome grant' },
    });
    users[u.name] = user;
  }
  console.log(`✓ ${USERS.length} users created`);

  // Pricing config
  await prisma.pricingConfig.create({ data: { id: 'default' } });

  // ── Listings ──────────────────────────────────────────────
  // Rayleigh — Advanced Haki (S=1, will be high demand)
  const rayleighHakiListing = await prisma.listing.create({
    data: {
      providerId: users['Silvers Rayleigh'].id,
      skillId: skills['Advanced Conqueror\'s Haki'].id,
      description: 'One-on-one intensive with the Dark King himself. Sabaody Archipelago, Grove 13.',
      level: 'Master',
      durationMin: 90,
      basePrice: 200,
      currentPrice: 508, // pre-set surge price
      multiplier: 2.54,
    },
  });
  // 5 future slots for Rayleigh
  for (let i = 1; i <= 5; i++) {
    await prisma.availabilitySlot.create({
      data: { listingId: rayleighHakiListing.id, startAt: futureDate(i * 2), endAt: futureDate(i * 2, 12) },
    });
  }

  // Sengoku — Observation Haki
  const sengokuListing = await prisma.listing.create({
    data: {
      providerId: users['Sengoku'].id,
      skillId: skills['Observation Haki'].id,
      description: 'Advanced Observation Haki — Future Sight techniques. Marine HQ annex.',
      level: 'Advanced',
      durationMin: 60,
      basePrice: 150,
      currentPrice: 165,
      multiplier: 1.1,
    },
  });
  for (let i = 1; i <= 4; i++) {
    await prisma.availabilitySlot.create({
      data: { listingId: sengokuListing.id, startAt: futureDate(i), endAt: futureDate(i, 11) },
    });
  }

  // Zoro — Santoryu
  const zoroListing = await prisma.listing.create({
    data: {
      providerId: users['Roronoa Zoro'].id,
      skillId: skills['Santoryu Swordsmanship'].id,
      description: 'Oni Giri, Tiger Trap, 108 Pound Phoenix — the full curriculum. Bring three swords.',
      level: 'Advanced',
      durationMin: 60,
      basePrice: 180,
      currentPrice: 198,
      multiplier: 1.1,
    },
  });
  for (let i = 1; i <= 6; i++) {
    await prisma.availabilitySlot.create({
      data: { listingId: zoroListing.id, startAt: futureDate(i), endAt: futureDate(i, 13) },
    });
  }

  // Vista — One-Sword Style (second swordsman, more supply)
  const vistaListing = await prisma.listing.create({
    data: {
      providerId: users['Vista'].id,
      skillId: skills['One-Sword Style'].id,
      description: 'Flower Swords technique. Precision and grace with one blade.',
      level: 'Intermediate',
      durationMin: 60,
      basePrice: 120,
      currentPrice: 120,
      multiplier: 1.0,
    },
  });
  for (let i = 1; i <= 5; i++) {
    await prisma.availabilitySlot.create({
      data: { listingId: vistaListing.id, startAt: futureDate(i), endAt: futureDate(i, 14) },
    });
  }

  // Jinbe — Fish-Man Karate
  const jinbeListing = await prisma.listing.create({
    data: {
      providerId: users['Jinbe'].id,
      skillId: skills['Fish-Man Karate'].id,
      description: 'Vagabond Drill, Spear Shark, Samegawara Seiken — complete curriculum.',
      level: 'Master',
      durationMin: 90,
      basePrice: 160,
      currentPrice: 144,
      multiplier: 0.9,
    },
  });
  for (let i = 1; i <= 5; i++) {
    await prisma.availabilitySlot.create({
      data: { listingId: jinbeListing.id, startAt: futureDate(i), endAt: futureDate(i, 15) },
    });
  }

  // Nami — Navigation
  const namiListing = await prisma.listing.create({
    data: {
      providerId: users['Nami'].id,
      skillId: skills['Navigation & Cartography'].id,
      description: 'Log Pose mastery, weather reading, Grand Line current charts.',
      level: 'Advanced',
      durationMin: 60,
      basePrice: 100,
      currentPrice: 100,
      multiplier: 1.0,
    },
  });
  for (let i = 1; i <= 7; i++) {
    await prisma.availabilitySlot.create({
      data: { listingId: namiListing.id, startAt: futureDate(i), endAt: futureDate(i, 9) },
    });
  }

  // Sanji — Cooking (HIGH supply, LOW demand → falling price)
  const sanjiListing = await prisma.listing.create({
    data: {
      providerId: users['Sanji'].id,
      skillId: skills['Black Leg Style Cooking'].id,
      description: 'Full-course meal prep, Devil Fruit ingredient pairing, All Blue cuisine theory.',
      level: 'Master',
      durationMin: 60,
      basePrice: 80,
      currentPrice: 72,    // below base — oversupply
      multiplier: 0.9,
    },
  });
  for (let i = 1; i <= 10; i++) {
    await prisma.availabilitySlot.create({
      data: { listingId: sanjiListing.id, startAt: futureDate(i), endAt: futureDate(i, 18) },
    });
  }

  console.log('✓ Listings and slots created');

  // ── Historical demand events to build price curves ─────────
  const hakiSkillId = skills['Advanced Conqueror\'s Haki'].id;
  const cookingSkillId = skills['Black Leg Style Cooking'].id;

  // Rayleigh's Haki: rising demand over past 7 days (10-14 requests/day recently)
  const hakiDemandPattern = [2, 3, 4, 5, 6, 8, 12];
  for (let dayAgo = 6; dayAgo >= 0; dayAgo--) {
    const count = hakiDemandPattern[6 - dayAgo];
    for (let j = 0; j < count; j++) {
      await prisma.demandEvent.create({
        data: { skillId: hakiSkillId, type: 'REQUEST', weight: 1.0, createdAt: pastDate(dayAgo) },
      });
    }
  }

  // Cooking: few requests over past 7 days (oversupply)
  for (let dayAgo = 6; dayAgo >= 0; dayAgo--) {
    if (dayAgo % 3 === 0) { // only a few
      await prisma.demandEvent.create({
        data: { skillId: cookingSkillId, type: 'REQUEST', weight: 1.0, createdAt: pastDate(dayAgo) },
      });
    }
  }

  // ── Historical price_history for charts ───────────────────
  const hakiPrices = [200, 220, 265, 310, 370, 430, 508];
  for (let i = 0; i < hakiPrices.length; i++) {
    await prisma.priceHistory.create({
      data: {
        listingId: rayleighHakiListing.id,
        skillId: hakiSkillId,
        supply: 1,
        demand: hakiDemandPattern[i],
        multiplier: hakiPrices[i] / 200,
        price: hakiPrices[i],
        recordedAt: pastDate(6 - i),
      },
    });
  }

  const cookingPrices = [80, 78, 76, 74, 73, 72, 72];
  for (let i = 0; i < cookingPrices.length; i++) {
    await prisma.priceHistory.create({
      data: {
        listingId: sanjiListing.id,
        skillId: cookingSkillId,
        supply: 1,
        demand: 0.5,
        multiplier: cookingPrices[i] / 80,
        price: cookingPrices[i],
        recordedAt: pastDate(6 - i),
      },
    });
  }

  // ── Completed sessions and ratings for demo realism ───────
  // Luffy learned Haki from Rayleigh — one completed session
  await prisma.$transaction(async (tx) => {
    // Deduct from Luffy's balance
    await tx.user.update({ where: { id: users['Monkey D. Luffy'].id }, data: { balance: { decrement: 200 } } });
    await tx.user.update({ where: { id: users['Silvers Rayleigh'].id }, data: { balance: { increment: 190 } } });

    const pastSlot = await tx.availabilitySlot.create({
      data: {
        listingId: rayleighHakiListing.id,
        startAt: pastDate(3),
        endAt: new Date(pastDate(3).getTime() + 90 * 60000),
        isBooked: true,
      },
    });
    const r = await tx.sessionRequest.create({
      data: {
        learnerId: users['Monkey D. Luffy'].id,
        listingId: rayleighHakiListing.id,
        slotId: pastSlot.id,
        lockedPrice: 200,
        status: 'COMPLETED',
        message: 'I need to learn Haki to save my crew!',
        expiresAt: pastDate(1),
      },
    });
    await tx.transaction.createMany({
      data: [
        { userId: users['Monkey D. Luffy'].id, type: 'GRANT', amount: 500, note: 'Welcome grant', requestId: null },
        { userId: users['Monkey D. Luffy'].id, type: 'ESCROW', amount: 200, requestId: r.id },
        { userId: users['Monkey D. Luffy'].id, type: 'RELEASE', amount: 200, requestId: r.id },
        { userId: users['Silvers Rayleigh'].id, type: 'RELEASE', amount: 190, requestId: r.id },
        { userId: users['Silvers Rayleigh'].id, type: 'BURN', amount: 10, requestId: r.id },
      ],
    });
    const session = await tx.session.create({
      data: { requestId: r.id, providerDone: true, completedAt: pastDate(3) },
    });
    await tx.rating.create({
      data: {
        sessionId: session.id,
        raterId: users['Monkey D. Luffy'].id,
        providerId: users['Silvers Rayleigh'].id,
        score: 5,
        review: 'The Dark King is on a different level! I can feel it in my fists now!',
      },
    });
    await tx.listing.update({
      where: { id: rayleighHakiListing.id },
      data: { sessionsCompleted: 1, avgRating: 5.0, ratingCount: 1 },
    });
    await tx.user.update({
      where: { id: users['Silvers Rayleigh'].id },
      data: { tier: 'Legend' },
    });
  });

  console.log('✓ Historical sessions and ratings seeded');
  console.log('');
  console.log('🏴☠️  Demo accounts:');
  console.log('   Learner : luffy@mugiwara.sea / meatmeat1');
  console.log('   Provider: rayleigh@grandline.sea / haki1234');
  console.log('   Admin   : sengoku@marineford.sea / buddhist1');
  console.log('');
  console.log('🌊 Grand Line Skill Exchange is ready to sail!');
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
