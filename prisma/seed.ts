import "dotenv/config";
import bcrypt from "bcryptjs";
import {
  BracketKind,
  CampaignChannel,
  CampaignStatus,
  CampaignType,
  CompetitionKind,
  CompetitionStatus,
  RegistrationFormat,
  RegistrationStatus,
  ScheduleKind,
  StaffRole,
} from "../src/generated/prisma/enums";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";

const dbUrl = process.env.DATABASE_URL!;
const schemaMatch = dbUrl.match(/[?&]schema=([^&]+)/);
const schemaName = schemaMatch?.[1] ? decodeURIComponent(schemaMatch[1]) : "";
const pool = new pg.Pool({
  connectionString: dbUrl,
  options: schemaName && schemaName !== "public" ? `-c search_path=${schemaName},public` : undefined,
});
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

function addDays(base: Date, days: number): Date {
  const x = new Date(base.getTime());
  x.setUTCDate(x.getUTCDate() + days);
  return x;
}

function addHours(base: Date, hours: number): Date {
  const x = new Date(base.getTime());
  x.setUTCHours(x.getUTCHours() + hours);
  return x;
}

async function main() {
  const passwordHash = await bcrypt.hash("password123", 12);

  await prisma.notification.deleteMany();
  await prisma.competitionFormat.deleteMany();
  await prisma.venue.deleteMany();
  await prisma.session.deleteMany();
  await prisma.account.deleteMany();
  await prisma.verificationToken.deleteMany();
  await prisma.user.deleteMany();

  const formats = [
    {
      key: "round_robin",
      name: "Round robin",
      bracketKind: BracketKind.ROUND_ROBIN,
      description:
        "Everyone plays everyone (or a balanced schedule). Great for leagues where fairness over time matters more than a single knockout moment.",
    },
    {
      key: "single_elim",
      name: "Single elimination",
      bracketKind: BracketKind.SINGLE_ELIMINATION,
      description:
        "One loss and you are out. Fast, dramatic, easy for players to understand. Best when you need a winner on one night.",
    },
    {
      key: "double_elim",
      name: "Double elimination",
      bracketKind: BracketKind.DOUBLE_ELIMINATION,
      description:
        "Losers drop to a second bracket. Rewards consistency — teams get a second life after a bad game.",
    },
    {
      key: "ladder",
      name: "Ladder",
      bracketKind: BracketKind.LADDER,
      description:
        "Challenge up the ladder each week. Casual-friendly and great for pool, darts, or shuffleboard where skill tiers emerge naturally.",
    },
    {
      key: "season_points",
      name: "Season standings",
      bracketKind: BracketKind.SEASON,
      description:
        "Points accumulate across multiple nights. Ideal for trivia leagues or cornhole seasons with rotating partners.",
    },
  ];

  await prisma.competitionFormat.createMany({ data: formats });

  const venueOwner = await prisma.user.create({
    data: {
      email: "owner@northsidetap.test",
      name: "Jordan Blake",
      passwordHash,
    },
  });

  const venue = await prisma.venue.create({
    data: {
      name: "Northside Tap & Trophy",
      slug: "northside-tap",
      venueType: "Brewpub",
      description:
        "Craft beer, league nights, and brackets that actually start on time. Home of Thursday darts and the Spring Cornhole League.",
      logoUrl: null,
      coverImageUrl: null,
      addressLine1: "2144 Broad Ripple Ave",
      city: "Indianapolis",
      state: "IN",
      postalCode: "46220",
      collectSms: true,
      teamEventsDefault: true,
      importAudienceLater: false,
    },
  });

  await prisma.venueStaff.create({
    data: { venueId: venue.id, userId: venueOwner.id, role: StaffRole.OWNER },
  });

  const playerUser = await prisma.user.create({
    data: {
      email: "player@leaguepour.test",
      name: "Sam Rivera",
      passwordHash,
    },
  });

  await prisma.playerProfile.create({
    data: {
      userId: playerUser.id,
      homeCity: "Indianapolis, IN",
      onboardingComplete: true,
      favoriteTypesNote: "Darts, cornhole, trivia",
    },
  });

  await prisma.communicationPreference.create({
    data: {
      userId: playerUser.id,
      emailOffers: true,
      smsOffers: true,
      eventReminders: true,
      frequency: "normal",
      globalOptOut: false,
    },
  });

  await prisma.venueFollow.create({
    data: { userId: playerUser.id, venueId: venue.id },
  });

  await prisma.eventTypePreference.createMany({
    data: [
      { userId: playerUser.id, kind: CompetitionKind.DARTS, weight: 3 },
      { userId: playerUser.id, kind: CompetitionKind.CORNHOLE, weight: 2 },
      { userId: playerUser.id, kind: CompetitionKind.TRIVIA, weight: 2 },
    ],
  });

  const now = new Date();

  const competitions = [
    {
      title: "Thursday Blind Draw Darts",
      slug: "thursday-blind-draw-darts",
      kind: CompetitionKind.DARTS,
      description:
        "Blind draw doubles — random partner each week. House matches the pot up to $100. Arrive by 7:15 for draw.",
      signupOpenAt: addDays(now, -10),
      signupCloseAt: addHours(addDays(now, 21), 23),
      startAt: addHours(addDays(now, 28), 23),
      endAt: addHours(addDays(now, 120), 23),
      entryFeeCents: 1500,
      teamFormat: RegistrationFormat.SOLO,
      teamSize: 2,
      captainRequired: false,
      participantCap: 16,
      waitlistEnabled: true,
      rules:
        "Steel tip, cork board. WSDA-style 501 double-out legs. Blind draw each week — no fixed partner.",
      waiverText: "Participation is at your own risk. Alcohol is served 21+ only.",
      scheduleKind: ScheduleKind.RECURRING,
      bracketKind: BracketKind.ROUND_ROBIN,
      recurringRule: "Every Thursday · 8 weeks + finals week",
      status: CompetitionStatus.SIGNUP_OPEN,
      prizeSummary: "$300 house pot + matched bar tab for finals",
      prizeTiers: [{ place: "Champions", reward: "$150 tab + trophy" }, { place: "Runner-up", reward: "$75 tab" }],
    },
    {
      title: "Spring Cornhole League",
      slug: "spring-cornhole-league",
      kind: CompetitionKind.CORNHOLE,
      description:
        "ACL-style blind draw league — 12 weeks, points race, playoffs in week 13. Bags fly at 6:30.",
      signupOpenAt: addDays(now, -40),
      signupCloseAt: addHours(addDays(now, 18), 23),
      startAt: addHours(addDays(now, 21), 22),
      endAt: addHours(addDays(now, 110), 23),
      entryFeeCents: 4000,
      teamFormat: RegistrationFormat.CAPTAIN_TEAM,
      teamSize: 2,
      captainRequired: true,
      participantCap: 24,
      waitlistEnabled: true,
      rules: "Best-of-three to 21. Switch sides each game. Bring your own bags — boards provided.",
      waiverText: null,
      scheduleKind: ScheduleKind.RECURRING,
      bracketKind: BracketKind.SEASON,
      recurringRule: "Mondays · 12 weeks + playoff bracket",
      status: CompetitionStatus.SIGNUP_OPEN,
      prizeSummary: "70/20/10 split of entry pool after league fees",
      prizeTiers: [{ place: "1st", reward: "60% of net pool" }, { place: "2nd", reward: "25%" }, { place: "3rd", reward: "15%" }],
    },
    {
      title: "Trivia Team Challenge",
      slug: "trivia-team-challenge",
      kind: CompetitionKind.TRIVIA,
      description:
        "Six-week progressive point totals. Max 6 per team. Themes announced weekly — no phones on the table.",
      signupOpenAt: addDays(now, -14),
      signupCloseAt: addHours(addDays(now, 10), 23),
      startAt: addHours(addDays(now, 12), 19),
      endAt: addHours(addDays(now, 70), 22),
      entryFeeCents: 6000,
      teamFormat: RegistrationFormat.CAPTAIN_TEAM,
      teamSize: 6,
      captainRequired: true,
      participantCap: 14,
      waitlistEnabled: true,
      rules: "Six rounds per night · dropped lowest week · tiebreaker lightning round",
      waiverText: null,
      scheduleKind: ScheduleKind.RECURRING,
      bracketKind: BracketKind.POINTS,
      recurringRule: "Wednesdays · 6 weeks",
      status: CompetitionStatus.PUBLISHED,
      prizeSummary: "$400 gift card bundle + championship pint glasses",
      prizeTiers: [{ place: "Grand champion", reward: "$250 tab" }, { place: "2nd", reward: "$100 tab" }],
    },
    {
      title: "Friday Euchre Tournament",
      slug: "friday-euchre-tournament",
      kind: CompetitionKind.EUCHRE,
      description:
        "Single-night bracket, random partners round 1, then ladder to finals. Stick the dealer — house rules on the wall.",
      signupOpenAt: addDays(now, -5),
      signupCloseAt: addHours(addDays(now, 4), 18),
      startAt: addHours(addDays(now, 6), 19),
      endAt: addHours(addDays(now, 7), 1),
      entryFeeCents: 2000,
      teamFormat: RegistrationFormat.SOLO,
      teamSize: 2,
      captainRequired: false,
      participantCap: 32,
      waitlistEnabled: true,
      rules: "INDiana euchre · stick the dealer · redeal on 9 of trump in loner",
      waiverText: null,
      scheduleKind: ScheduleKind.ONE_TIME,
      bracketKind: BracketKind.SINGLE_ELIMINATION,
      recurringRule: null,
      status: CompetitionStatus.SIGNUP_OPEN,
      prizeSummary: "Winner takes 75% of pot, runner-up 25%",
      prizeTiers: [{ place: "Winner", reward: "75% cash pot" }, { place: "Finalist", reward: "25% cash pot" }],
    },
    {
      title: "Weekend Shuffleboard Showdown",
      slug: "weekend-shuffleboard-showdown",
      kind: CompetitionKind.SHUFFLEBOARD,
      description:
        "Double elimination on the 22-footer. Sand provided. Warm-up 1pm, first puck 2pm.",
      signupOpenAt: addDays(now, -30),
      signupCloseAt: addHours(addDays(now, -7), 12),
      startAt: addHours(addDays(now, -5), 18),
      endAt: addHours(addDays(now, 10), 23),
      entryFeeCents: 2500,
      teamFormat: RegistrationFormat.TEAM_MEMBERS,
      teamSize: 2,
      captainRequired: true,
      participantCap: 16,
      waitlistEnabled: false,
      rules: "Traditional table shuffleboard · 75-point frames · hog line fouls called",
      waiverText: null,
      scheduleKind: ScheduleKind.ONE_TIME,
      bracketKind: BracketKind.DOUBLE_ELIMINATION,
      recurringRule: null,
      status: CompetitionStatus.IN_PROGRESS,
      prizeSummary: "Custom belt buckle + $120 bar credit",
      prizeTiers: [{ place: "Champion", reward: "Buckle + $120 tab" }],
    },
  ];

  for (const c of competitions) {
    const comp = await prisma.competition.create({
      data: {
        venueId: venue.id,
        title: c.title,
        slug: c.slug,
        kind: c.kind,
        description: c.description,
        signupOpenAt: c.signupOpenAt,
        signupCloseAt: c.signupCloseAt,
        startAt: c.startAt,
        endAt: c.endAt,
        entryFeeCents: c.entryFeeCents,
        teamFormat: c.teamFormat,
        teamSize: c.teamSize,
        captainRequired: c.captainRequired,
        participantCap: c.participantCap,
        waitlistEnabled: c.waitlistEnabled,
        rules: c.rules,
        waiverText: c.waiverText,
        scheduleKind: c.scheduleKind,
        bracketKind: c.bracketKind,
        recurringRule: c.recurringRule,
        status: c.status,
        publishedAt: now,
      },
    });
    await prisma.prizeStructure.create({
      data: {
        competitionId: comp.id,
        summary: c.prizeSummary,
        tiers: c.prizeTiers as object[],
        payoutNotes: "Payouts issued as house credit unless otherwise posted.",
      },
    });
  }

  const darts = await prisma.competition.findFirst({
    where: { slug: "thursday-blind-draw-darts" },
  });
  const cornhole = await prisma.competition.findFirst({
    where: { slug: "spring-cornhole-league" },
  });

  if (darts) {
    const team = await prisma.team.create({
      data: {
        competitionId: darts.id,
        name: "Board Militia",
        captainUserId: playerUser.id,
        inviteCode: "DRAW24",
      },
    });
    await prisma.teamMember.create({
      data: { teamId: team.id, userId: playerUser.id },
    });
    await prisma.competitionRegistration.create({
      data: {
        competitionId: darts.id,
        userId: playerUser.id,
        status: RegistrationStatus.CONFIRMED,
        roleLabel: "Solo",
        teamId: team.id,
      },
    });
  }

  if (cornhole) {
    await prisma.competitionRegistration.create({
      data: {
        competitionId: cornhole.id,
        userId: playerUser.id,
        status: RegistrationStatus.CONFIRMED,
        roleLabel: "Captain",
      },
    });
  }

  await prisma.messageCampaign.createMany({
    data: [
      {
        venueId: venue.id,
        competitionId: darts?.id,
        type: CampaignType.SIGNUP_CLOSING,
        name: "Darts · signup closing soon",
        subject: "48 hours left — Thursday Blind Draw",
        body: "Hey {{first_name}} — blind draw darts is almost locked. Grab your spot before signup closes.",
        channel: CampaignChannel.EMAIL,
        status: CampaignStatus.DRAFT,
        audienceFilter: { source: "segment", tag: "repeat_darts" } as object,
      },
      {
        venueId: venue.id,
        competitionId: cornhole?.id,
        type: CampaignType.JOIN_NEXT,
        name: "Cornhole · join the next one",
        subject: "Spring bags league — captain registers team",
        body: "Teams are filling fast. $40 per player · captain locks roster.",
        channel: CampaignChannel.EMAIL,
        status: CampaignStatus.DRAFT,
      },
    ],
  });

  await prisma.audienceTag.create({
    data: { venueId: venue.id, userId: playerUser.id, tag: "repeat_darts" },
  });

  const euchre = await prisma.competition.findFirst({
    where: { slug: "friday-euchre-tournament" },
  });
  if (euchre) {
    const teamNames = ["Taproom Aces", "Trump Farmers", "Loners Local", "Stick Crew"];
    const teams: { id: string; name: string }[] = [];
    for (const name of teamNames) {
      const t = await prisma.team.create({
        data: { competitionId: euchre.id, name, captainUserId: playerUser.id },
      });
      teams.push({ id: t.id, name: t.name });
    }
    const [t1, t2, t3, t4] = teams;
    await prisma.match.createMany({
      data: [
        {
          competitionId: euchre.id,
          round: 1,
          label: "Semifinal A",
          homeTeamId: t1.id,
          awayTeamId: t2.id,
          homeScore: 10,
          awayScore: 8,
          completedAt: addHours(addDays(now, -1), 20),
        },
        {
          competitionId: euchre.id,
          round: 1,
          label: "Semifinal B",
          homeTeamId: t3.id,
          awayTeamId: t4.id,
          homeScore: 7,
          awayScore: 9,
          completedAt: addHours(addDays(now, -1), 20),
        },
        {
          competitionId: euchre.id,
          round: 2,
          label: "Final",
          homeTeamId: t1.id,
          awayTeamId: t4.id,
          homeScore: null,
          awayScore: null,
          scheduledAt: addHours(addDays(now, 1), 21),
        },
      ],
    });
    await prisma.standing.createMany({
      data: [
        { competitionId: euchre.id, teamId: t1.id, rank: 1, points: 3, wins: 1, losses: 0, ties: 0 },
        { competitionId: euchre.id, teamId: t4.id, rank: 2, points: 2, wins: 1, losses: 0, ties: 0 },
        { competitionId: euchre.id, teamId: t2.id, rank: 3, points: 1, wins: 0, losses: 1, ties: 0 },
        { competitionId: euchre.id, teamId: t3.id, rank: 4, points: 0, wins: 0, losses: 1, ties: 0 },
      ],
    });
  }

  console.log("Seed complete.");
  console.log("Venue login: owner@northsidetap.test / password123");
  console.log("Player login: player@leaguepour.test / password123");
}

main()
  .then(async () => {
    await prisma.$disconnect();
    await pool.end();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    await pool.end();
    process.exit(1);
  });
