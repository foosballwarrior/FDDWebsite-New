// scripts/shows.js
// FIVE DOLLAR DOWN — MASTER SHOW LIST
// Add shows here. Never edit index.html or past-shows.html for show data.

const SHOWS = [
  { date: "2026-01-31", name: "Private Event",                    venue: "Private Venue",                city: "Fitzroy Harbour, ON", tickets: "" },
  { date: "2025-12-31", name: "New Year's Eve",                   venue: "Private Venue",                city: "Arnprior, ON",     tickets: "" },
  { date: "2025-12-12", name: "The Prescott",                     venue: "The Prescott",                 city: "Ottawa, ON",       tickets: "" },
  { date: "2025-11-28", name: "Boston Pizza",                     venue: "Boston Pizza",                 city: "Renfrew, ON",      tickets: "" },
  { date: "2025-11-14", name: "Boston Pizza",                     venue: "Boston Pizza",                 city: "Renfrew, ON",      tickets: "" },
  { date: "2025-11-08", name: "Music for Mom",                    venue: "Private Venue",                city: "Arnprior, ON",     tickets: "" },
  { date: "2025-11-01", name: "Private Event",                    venue: "Private Venue",                city: "Kemptville, ON",   tickets: "" },
  { date: "2025-10-25", name: "Joe's Spencercity Bar & Grill",    venue: "Joe's Spencercity Bar & Grill",city: "Spencerville, ON", tickets: "" },
  { date: "2025-10-18", name: "Russell Barn Dance",               venue: "Private Venue",                city: "Russell, ON",      tickets: "" },
  { date: "2025-09-27", name: "Cameron's Point Family Campground",venue: "Cameron's Point Family Campground", city: "Summerstown, ON", tickets: "" },
  { date: "2025-09-19", name: "Private Banquet",                  venue: "Private Venue",                city: "Kemptville, ON",   tickets: "" },
  { date: "2026-08-22", name: "Private Event",                    venue: "Private Venue",                city: "Kanata, ON",       tickets: "" },
  { date: "2025-08-08", name: "Boston Pizza",                     venue: "Boston Pizza",                 city: "Renfrew, ON",      tickets: "" },
  { date: "2026-07-04", name: "Cameron's Point Family Campground",venue: "Cameron's Point Family Campground", city: "Summerstown, ON", tickets: "" },
  { date: "2025-06-14", name: "Private Event",                    venue: "Private Venue",                city: "Cardinal, ON",     tickets: "" },
  { date: "2025-04-25", name: "Metcalfe Curling Club Tournament", venue: "Metcalfe Curling Club",        city: "Metcalfe, ON",     tickets: "" },
  { date: "2025-01-25", name: "The Cupboard",                     venue: "The Cupboard",                 city: "Arnprior, ON",    tickets: "" },
  { date: "2024-11-15", name: "Homestead Pub",                    venue: "Homestead Pub",                city: "Embrun, ON",      tickets: "" },
  { date: "2024-10-26", name: "Private Event",                    venue: "Private Venue",                city: "Kemptville, ON",  tickets: "" },
  { date: "2024-09-21", name: "Mom Prom",                         venue: "Private Venue",                city: "Kemptville, ON",  tickets: "" },
  { date: "2024-09-20", name: "Private Event",                    venue: "Private Venue",                city: "Kemptville, ON",  tickets: "" },
  { date: "2024-07-27", name: "Joe's SpencerCity Bar & Grill",    venue: "Joe's SpencerCity Bar & Grill",city: "Spencerville, ON", tickets: "" },
  { date: "2024-07-26", name: "Homestead Pub",                    venue: "Homestead Pub",                city: "Embrun, ON",      tickets: "" },
  { date: "2024-07-13", name: "Hyde Smokehouse",                  venue: "Hyde Smokehouse",              city: "Kemptville, ON",  tickets: "" },
  { date: "2024-07-01", name: "Canada Day",                       venue: "TBD",                          city: "Ottawa, ON",      tickets: "" },
  { date: "2024-05-03", name: "Ladies Night!",                    venue: "Private Venue",                city: "Russell, ON",     tickets: "" },
  { date: "2024-04-27", name: "Moose McGuire's Hunt Club",        venue: "Moose McGuire's Hunt Club",    city: "Ottawa, ON",      tickets: "" },
  { date: "2024-04-06", name: "Hyde Smokehouse",                  venue: "Hyde Smokehouse",              city: "Kemptville, ON",  tickets: "" },
  { date: "2024-03-17", name: "St-Patty's Day @ Moose McGuire's", venue: "Moose McGuire's",              city: "Kanata, ON",      tickets: "" },
  { date: "2024-03-02", name: "Private Party",                    venue: "Private Venue",                city: "Kemptville, ON",  tickets: "" },
  { date: "2024-01-19", name: "Private Party",                    venue: "Private Venue",                city: "Embrun, ON",      tickets: "" },
  { date: "2023-12-09", name: "Hyde Smokehouse",                  venue: "Hyde Smokehouse",              city: "Kemptville, ON",  tickets: "" },
  { date: "2023-12-02", name: "Moose McGuire's",                  venue: "Moose McGuire's",              city: "Kanata, ON",      tickets: "" },
  { date: "2023-12-01", name: "Head Office Ottawa - Private Event",venue: "Head Office Ottawa",          city: "Kanata, ON",      tickets: "" },
  { date: "2023-11-04", name: "The Cupboard",                     venue: "The Cupboard",                 city: "Arnprior, ON",    tickets: "" },
  { date: "2023-10-28", name: "Private Event",                    venue: "Private Venue",                city: "Ottawa, ON",      tickets: "" },
  { date: "2023-10-21", name: "Vitality w/ Marilyne",             venue: "Vitality",                     city: "Kanata, ON",      tickets: "" },
  { date: "2023-10-20", name: "Homestead Pub",                    venue: "Homestead Pub",                city: "Embrun, ON",      tickets: "" },
  { date: "2023-09-29", name: "The Rocky Mountain House",         venue: "The Rocky Mountain House",     city: "Arnprior, ON",    tickets: "" },
  { date: "2023-09-21", name: "Private Event",                    venue: "Private Venue",                city: "Ottawa, ON",      tickets: "" },
  { date: "2023-09-09", name: "Hyde Smokehouse",                  venue: "Hyde Smokehouse",              city: "Kemptville, ON",  tickets: "" },
  { date: "2023-07-29", name: "Lumbertown Ale House",             venue: "Lumbertown Ale House",         city: "Arnprior, ON",    tickets: "" },
  { date: "2023-07-28", name: "Hurley's Neighbourhood Grill",     venue: "Hurley's Neighbourhood Grill", city: "Kanata, ON",      tickets: "" },
  { date: "2023-07-01", name: "The Stumble Inn - Private Party",  venue: "The Stumble Inn",              city: "Kemptville, ON",  tickets: "" },
  { date: "2023-06-03", name: "Hyde Smokehouse",                  venue: "Hyde Smokehouse",              city: "Kemptville, ON",  tickets: "" },
  { date: "2023-05-20", name: "Private Party",                    venue: "Private Venue",                city: "Kanata, ON",      tickets: "" },
  { date: "2023-04-01", name: "Hyde Smokehouse",                  venue: "Hyde Smokehouse",              city: "Kemptville, ON",  tickets: "" },
  { date: "2022-09-11", name: "Private Party",                    venue: "Private Venue",                city: "Dunrobin, ON",    tickets: "" },
  { date: "2022-09-03", name: "Private Party",                    venue: "Private Venue",                city: "Kemptville, ON",  tickets: "" },
  { date: "2022-08-13", name: "Private Party",                    venue: "Private Venue",                city: "Kemptville, ON",  tickets: "" },
  { date: "2022-07-09", name: "Private Party",                    venue: "Private Venue",                city: "Kemptville, ON",  tickets: "" },
  { date: "2026-04-03", name: "The Prescott",  venue: "The Prescott", city: "Ottawa, ON", tickets: "https://www.facebook.com/share/1CFbKiHgFr/" },
  { date: "2026-05-09", name: "Joe's Spencercity Bar & Grill",    venue: "Joe's Spencercity Bar & Grill", city: "Spencerville, ON", tickets: "" },
  { date: "2026-06-05", name: "Boston Pizza",                     venue: "Boston Pizza",                 city: "Renfrew, ON",      tickets: "" },
  { date: "2026-06-13", name: "Private Event",                    venue: "Private Venue",                city: "",                 tickets: "" },
  { date: "2026-07-01", name: "Boston Pizza",                     venue: "Boston Pizza",                 city: "Renfrew, ON",      tickets: "" },
  // Add upcoming shows above this line
];

// Do not edit below this line
function splitShows() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const upcoming = SHOWS
    .filter(s => new Date(s.date + 'T00:00:00') >= today)
    .sort((a, b) => new Date(a.date) - new Date(b.date));
  const past = SHOWS
    .filter(s => new Date(s.date + 'T00:00:00') < today)
    .sort((a, b) => new Date(b.date) - new Date(a.date));
  return { upcoming, past };
}
