/**
 * Offline checks for the CJ per-site resolution in src/lib/affiliate-registry.ts and the
 * <CjRecommendation> renderer. Run: npx tsx scripts/check-affiliate-registry.tsx
 *
 * The PIDs, AIDs and URLs below are made-up fixtures that exist only inside this script - they
 * are never configured or rendered anywhere.
 */
import assert from "node:assert/strict";
import { renderToStaticMarkup } from "react-dom/server";
import {
  CJ_ACCOUNT_CID,
  activeAdvertiserFor,
  cjPidFromUrl,
  cjWebsitePid,
} from "../src/lib/affiliate-registry";
import { editorialAdvertiserLinks } from "../src/lib/editorial-advertisers";
import { AmazonSearchLink, AffiliateDisclosure, CjRecommendation, amazonSearchUrl } from "../src/components/marketing/affiliate";

const LP_PID = "1111111";
const VS_PID = "2222222";
const LP_LINK = `https://www.jdoqocy.com/click-${LP_PID}-15734567`;
const VS_LINK = `https://www.anrdoezrs.net/links/${VS_PID}/type/dlg/https%3A%2F%2Fexample.com%2F`;
const ENV_KEYS = [
  "CJ_WEBSITE_PID_LEAGUEPOUR", "CJ_WEBSITE_PID_VENUESPROCKET", "CJ_HEIL_SOUND_ENABLED", "CJ_HEIL_SOUND_APPROVAL",
  "CJ_HEIL_SOUND_WEBSITES", "CJ_HEIL_SOUND_TRACKING_URL", "CJ_HEIL_SOUND_TRACKING_URL_LEAGUEPOUR",
  "CJ_HEIL_SOUND_TRACKING_URL_VENUESPROCKET", "CJ_LAWDEPOT_ENABLED", "CJ_LAWDEPOT_TRACKING_URL_VENUESPROCKET",
  "CJ_LAWDEPOT_TRACKING_URL_LEAGUEPOUR",
];
const reset = () => ENV_KEYS.forEach((k) => delete process.env[k]);
const render = (website: "leaguepour" | "venuesprocket") =>
  renderToStaticMarkup(
    <CjRecommendation advertiserId="heil-sound" website={website} anchor="Heil Sound's dynamic microphones">
      Why it helps.
    </CjRecommendation>,
  );
let n = 0;
const check = (name: string, fn: () => void) => { reset(); fn(); n++; console.log("ok -", name); };

check("PID parsing for both CJ link shapes", () => {
  assert.equal(cjPidFromUrl(LP_LINK), LP_PID);
  assert.equal(cjPidFromUrl(VS_LINK), VS_PID);
  assert.equal(cjPidFromUrl("https://www.heilsound.com/"), null);
});

check("defaults: PIDs recorded, no merchant links, nothing renders on either site", () => {
  // Real PIDs are recorded, but no merchant has a link, so nothing renders.
  assert.equal(cjWebsitePid("leaguepour"), "101904040");
  assert.equal(cjWebsitePid("venuesprocket"), "101904044");
  assert.equal(activeAdvertiserFor("heil-sound", "leaguepour"), null);
  assert.equal(render("leaguepour"), "");
  assert.equal(render("venuesprocket"), "");
  assert.deepEqual(editorialAdvertiserLinks({ website: "leaguepour", text: "projector indoor herb mattress" }), []);
});

check("account CID is never accepted as a website PID", () => {
  process.env.CJ_WEBSITE_PID_LEAGUEPOUR = CJ_ACCOUNT_CID;
  assert.equal(cjWebsitePid("leaguepour"), null);
});

const activate = () => {
  process.env.CJ_WEBSITE_PID_LEAGUEPOUR = LP_PID;
  process.env.CJ_WEBSITE_PID_VENUESPROCKET = VS_PID;
  process.env.CJ_HEIL_SOUND_ENABLED = "true";
  process.env.CJ_HEIL_SOUND_APPROVAL = "approved";
  process.env.CJ_HEIL_SOUND_WEBSITES = "leaguepour";
  process.env.CJ_HEIL_SOUND_TRACKING_URL_LEAGUEPOUR = LP_LINK;
};

check("fully configured LP link renders on LP only, with CJ disclosure first", () => {
  activate();
  const html = render("leaguepour");
  assert.ok(html.includes(`href="${LP_LINK}"`));
  assert.ok(html.includes('rel="sponsored nofollow noopener"') && html.includes('target="_blank"'));
  assert.ok(html.indexOf("Disclosure:") < html.indexOf("<a "));
  assert.ok(html.includes("through CJ") && html.includes("LeaguePour may earn"));
  assert.ok(!html.includes("Amazon"));
  assert.equal(render("venuesprocket"), "", "not permitted on VS");
});

check("an LP-PID link is never served on VS, even when VS is permitted", () => {
  activate();
  process.env.CJ_HEIL_SOUND_WEBSITES = "leaguepour,venuesprocket";
  assert.equal(render("venuesprocket"), "");
  process.env.CJ_HEIL_SOUND_TRACKING_URL_VENUESPROCKET = VS_LINK;
  assert.ok(render("venuesprocket").includes(`href="${VS_LINK}"`));
  assert.ok(render("venuesprocket").includes("VenueSprocket may earn"));
});

check("legacy single link only renders on the site whose PID it carries", () => {
  activate();
  delete process.env.CJ_HEIL_SOUND_TRACKING_URL_LEAGUEPOUR;
  process.env.CJ_HEIL_SOUND_WEBSITES = "leaguepour,venuesprocket";
  process.env.CJ_HEIL_SOUND_TRACKING_URL = LP_LINK;
  assert.ok(render("leaguepour").includes(LP_LINK));
  assert.equal(render("venuesprocket"), "");
});

check("each missing piece keeps it dark", () => {
  for (const drop of ["CJ_WEBSITE_PID_LEAGUEPOUR", "CJ_HEIL_SOUND_ENABLED", "CJ_HEIL_SOUND_APPROVAL", "CJ_HEIL_SOUND_WEBSITES", "CJ_HEIL_SOUND_TRACKING_URL_LEAGUEPOUR"]) {
    reset(); activate(); delete process.env[drop];
    assert.equal(render("leaguepour"), "", `missing ${drop}`);
  }
  for (const bad of [
    "https://www.heilsound.com/",                        // merchant homepage, not a tracked link
    `http://www.jdoqocy.com/click-${LP_PID}-15734567`,  // not HTTPS
    `https://evil.example/click-${LP_PID}-15734567`,    // not a CJ tracking host
    `https://www.jdoqocy.com/click-${VS_PID}-15734567`, // another property's PID
  ]) {
    reset(); activate(); process.env.CJ_HEIL_SOUND_TRACKING_URL_LEAGUEPOUR = bad;
    assert.equal(render("leaguepour"), "", bad);
  }
});

check("LawDepot: approved but dark until a VS-PID link exists; never on LP", () => {
  const law = (website: "leaguepour" | "venuesprocket") =>
    renderToStaticMarkup(
      <CjRecommendation advertiserId="lawdepot" website={website} anchor="LawDepot's event contract template">
        It isn&apos;t legal advice.
      </CjRecommendation>,
    );
  assert.equal(law("venuesprocket"), "", "no link, not enabled");
  process.env.CJ_LAWDEPOT_ENABLED = "true";
  assert.equal(law("venuesprocket"), "", "enabled but still no link");
  process.env.CJ_WEBSITE_PID_VENUESPROCKET = VS_PID;
  process.env.CJ_LAWDEPOT_TRACKING_URL_VENUESPROCKET = VS_LINK;
  const html = law("venuesprocket");
  assert.ok(html.includes(`href="${VS_LINK}"`) && html.includes("VenueSprocket may earn"));
  assert.ok(html.includes("legal advice"));
  process.env.CJ_WEBSITE_PID_LEAGUEPOUR = LP_PID;
  process.env.CJ_LAWDEPOT_TRACKING_URL_LEAGUEPOUR = LP_LINK;
  assert.equal(law("leaguepour"), "", "LawDepot is only permitted on venuesprocket");
});

check("Amazon links and disclosure unchanged", () => {
  assert.equal(amazonSearchUrl("dartboard surround"), "https://www.amazon.com/s?k=dartboard+surround&tag=leaguepour-20");
  const a = renderToStaticMarkup(<AmazonSearchLink query="dartboard surround">x</AmazonSearchLink>);
  assert.ok(a.includes('rel="sponsored nofollow noopener"'));
  assert.ok(renderToStaticMarkup(<AffiliateDisclosure />).includes("As an Amazon Associate I earn from qualifying purchases."));
});

console.log(`\n${n} checks passed`);
