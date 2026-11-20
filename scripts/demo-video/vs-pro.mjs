// THROWAWAY DB ONLY: put a demo venue on VS Pro (as if subscribed) so the recording can show the
// Pro workflow. The video narrates which plan each step needs. usage: node vs-pro.mjs <venueSlug>
import pg from "pg";
const url = "postgresql://postgres@127.0.0.1:55432/lpdemo";
const c = new pg.Client({ connectionString: url });
await c.connect();
await c.query("set search_path to leaguepour_lp");
const v = (await c.query(`select id from "Venue" where slug=$1`, [process.argv[2]])).rows[0];
if (!v) throw new Error("no venue");
await c.query(
  `insert into "VenueVsConfig"(id,"venueId","vsPlan","vsSubscriptionStatus","createdAt","updatedAt") values($1,$2,'VS_PRO','active',now(),now())
   on conflict ("venueId") do update set "vsPlan"='VS_PRO', "vsSubscriptionStatus"='active'`,
  ["demo_vs_" + Math.random().toString(36).slice(2, 10), v.id],
);
console.log("venue", process.argv[2], "-> VS_PRO (demo)");
await c.end();
