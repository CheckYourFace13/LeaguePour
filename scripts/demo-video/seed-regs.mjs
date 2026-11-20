// Disposable demo data for the THROWAWAY local DB only (127.0.0.1:55432/lpdemo).
// Adds fictional player accounts + confirmed registrations to the newest competition of a venue.
// usage: node seed-regs.mjs <venueSlug> <count>
import pg from "pg";
const url = "postgresql://postgres@127.0.0.1:55432/lpdemo";
if (!url.includes("127.0.0.1:55432")) throw new Error("refusing: not the throwaway DB");
const [venueSlug, countArg] = process.argv.slice(2);
const names = ["Jordan Reyes", "Sam Okafor", "Taylor Brooks", "Casey Lindqvist", "Riley Moreno", "Morgan Patel", "Avery Kim", "Drew Castellano", "Jamie Novak", "Quinn Harper"];
const count = Number(countArg ?? 8);
const c = new pg.Client({ connectionString: url });
await c.connect();
await c.query("set search_path to leaguepour_lp");
const comp = (await c.query(
  `select c.id from "Competition" c join "Venue" v on v.id=c."venueId" where v.slug=$1 order by c."createdAt" desc limit 1`, [venueSlug])).rows[0];
if (!comp) throw new Error("no competition");
for (let i = 0; i < count; i++) {
  const id = "demo_u_" + Math.random().toString(36).slice(2, 12);
  const email = `demo.player${i + 1}.${Date.now()}@example.test`;
  await c.query(`insert into "User"(id,name,email,"createdAt","updatedAt") values($1,$2,$3,now(),now())`, [id, names[i], email]);
  await c.query(`insert into "CompetitionRegistration"(id,"competitionId","userId",status,"createdAt","updatedAt") values($1,$2,$3,'CONFIRMED',now() + ($4 || ' seconds')::interval,now())`,
    ["demo_r_" + Math.random().toString(36).slice(2, 12), comp.id, id, String(i)]);
}
console.log("seeded", count, "registrations into", comp.id);
await c.end();
