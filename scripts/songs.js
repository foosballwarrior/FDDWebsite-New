// scripts/songs.js
// FIVE DOLLAR DOWN — MASTER SONG LIST
//
// To always show a song: set  pinned: true
// To let it appear randomly: set  pinned: false
//
// The setlist section shows DISPLAY_COUNT songs per page load.
// Pinned songs always appear. Remaining slots are filled randomly from unpinned songs.
// Refresh the page to get a new random selection.

const DISPLAY_COUNT = 15;

const SONGS = [
  // ── Pinned songs — always displayed ──────────────────────────────────
  { artist: "Bryan Adams",          title: "Summer Of '69",                  badge: "Canadian",   pinned: true  },
  { artist: "The Proclaimers",      title: "I'm Gonna Be (500 Miles)",        badge: "90s",        pinned: true  },
  { artist: "The Killers",          title: "Mr. Brightside",                  badge: "2000s Rock", pinned: true  },
  { artist: "Semisonic",            title: "Closing Time",                    badge: "90s",        pinned: true  },

  // ── Unpinned songs — randomly rotated ────────────────────────────────
  { artist: "Goldfinger",           title: "99 Red Balloons",                 badge: "90s Alt",    pinned: false },
  { artist: "Shaboozey",            title: "A Bar Song (Tipsy)",              badge: "Country",    pinned: false },
  { artist: "Tom Petty",            title: "American Girl",                   badge: "Classic Rock",pinned: false },
  { artist: "Creedence Clearwater Revival", title: "Bad Moon Rising",         badge: "Classic Rock",pinned: false },
  { artist: "The Refreshments",     title: "Banditos",                        badge: "90s Alt",    pinned: false },
  { artist: "Luke Combs",           title: "Beer Never Broke My Heart",       badge: "Country",    pinned: false },
  { artist: "Michael Jackson",      title: "Billie Jean",                     badge: "Pop",        pinned: false },
  { artist: "The Tragically Hip",   title: "Blow At High Dough",              badge: "Canadian",   pinned: false },
  { artist: "Luke Bryan",           title: "Country Girl (Shake It For Me)",  badge: "Country",    pinned: false },
  { artist: "John Denver",          title: "Country Roads",                   badge: "Classic",    pinned: false },
  { artist: "Bryan Adams",          title: "Cuts Like a Knife",               badge: "Canadian",   pinned: false },
  { artist: "Eric Church",          title: "Drink In My Hand",                badge: "Country",    pinned: false },
  { artist: "Emerson Drive",        title: "Fishin' In The Dark",             badge: "Country",    pinned: false },
  { artist: "Harvey Danger",        title: "Flagpole Sitta",                  badge: "90s Alt",    pinned: false },
  { artist: "Miley Cyrus",          title: "Flowers",                         badge: "Pop",        pinned: false },
  { artist: "Garth Brooks",         title: "Friends In Low Places",           badge: "Country",    pinned: false },
  { artist: "The Chicks",           title: "Goodbye Earl",                    badge: "Country",    pinned: false },
  { artist: "Creedence Clearwater Revival", title: "Have You Ever Seen The Rain", badge: "Classic Rock", pinned: false },
  { artist: "Tim McGraw",           title: "I Like It, I Love It",            badge: "Country",    pinned: false },
  { artist: "Cheap Trick",          title: "I Want You to Want Me",           badge: "Classic Rock",pinned: false },
  { artist: "Tom Petty",            title: "Last Dance with Mary Jane",       badge: "Classic Rock",pinned: false },
  { artist: "Bruno Mars",           title: "Locked out of Heaven",            badge: "Pop",        pinned: false },
  { artist: "The Tragically Hip",   title: "New Orleans Is Sinking",          badge: "Canadian",   pinned: false },
  { artist: "Creedence Clearwater Revival", title: "Proud Mary",              badge: "Classic Rock",pinned: false },
  { artist: "Nickelback",           title: "Rockstar",                        badge: "Canadian",   pinned: false },
  { artist: "The Glorious Sons",    title: "S.O.S. (Sawed Off Shotgun)",      badge: "Canadian",   pinned: false },
  { artist: "Sublime",              title: "Santeria",                        badge: "90s Alt",    pinned: false },
  { artist: "Big & Rich",           title: "Save a Horse (Ride a Cowboy)",    badge: "Country",    pinned: false },
  { artist: "Weezer",               title: "Say It Ain't So",                 badge: "90s Alt",    pinned: false },
  { artist: "The Offspring",        title: "Self Esteem",                     badge: "90s Alt",    pinned: false },
  { artist: "Kings of Leon",        title: "Sex on Fire",                     badge: "2000s Rock", pinned: false },
  { artist: "WALK THE MOON",        title: "Shut Up and Dance",               badge: "Pop",        pinned: false },
  { artist: "Fountains of Wayne",   title: "Stacy's Mom",                     badge: "2000s",      pinned: false },
  { artist: "Bee Gees",             title: "Stayin' Alive",                   badge: "Classic",    pinned: false },
  { artist: "Wheatus",              title: "Teenage Dirtbag",                 badge: "2000s",      pinned: false },
  { artist: "Sublime",              title: "What I Got",                      badge: "90s Alt",    pinned: false },
  { artist: "blink-182",            title: "What's My Age Again?",            badge: "2000s",      pinned: false },
  { artist: "Luke Combs",           title: "When It Rains It Pours",          badge: "Country",    pinned: false },
  { artist: "Morgan Wallen",        title: "Whiskey Glasses",                 badge: "Country",    pinned: false },
  { artist: "Bon Jovi",             title: "You Give Love A Bad Name",        badge: "80s Rock",   pinned: false },
  { artist: "Tom Petty",            title: "You Wreck Me",                    badge: "Classic Rock",pinned: false },
];

// Do not edit below this line
function getDisplaySongs(count) {
  const limit    = count || DISPLAY_COUNT;
  const pinned   = SONGS.filter(s => s.pinned);
  const unpinned = SONGS.filter(s => !s.pinned);

  // Fisher-Yates shuffle
  const shuffled = [...unpinned];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }

  const remaining = Math.max(0, limit - pinned.length);
  return [...pinned, ...shuffled.slice(0, remaining)];
}
