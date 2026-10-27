/* Mochi drawing kit: builds SVG markup for every mochi, part and aura.
   Ported from the Mochi Pop Arena prototype. */
const INK = "#3B1F4A", HATC = "#2B2632";
const SLOTS = {
  body:[{id:"plain",n:"Classic",c:"#FFF6EE"},{id:"sakura",n:"Sakura",c:"#FFC6D8"},{id:"matcha",n:"Matcha",c:"#B6E3A0"},{id:"taro",n:"Taro",c:"#D4BFF3"},{id:"mango",n:"Mango",c:"#FFD77F"},{id:"thaitea",n:"Thai Tea",c:"#FFB07A"},{id:"kuro",n:"Kuro",c:"#A79DAB"},{id:"redbean",n:"Red Bean",c:"#EBB0BE",u:300},{id:"gold",n:"Gold",c:"#FFD23F",u:100000},{id:"lava",n:"Lava",c:"#FF8A5C",u:500000},{id:"galaxy",n:"Galaxy",c:"#8C7BE8",u:1000000},{id:"ghost",n:"Ghost",c:"#F2F5FF",u:35000},{id:"alien",n:"Alien",c:"#9BE870",u:800000},{id:"metal",n:"Metal",c:"#B8C0CC",u:2000000},{id:"durian",n:"Durian",c:"#D6D25E",u:5000000}],
  hat:[{id:"none",n:"None"},{id:"party",n:"Party hat"},{id:"catears",n:"Cat ears"},{id:"bunny",n:"Bunny ears"},{id:"fedora",n:"Fedora",u:500},{id:"pompadour",n:"Pompadour",u:1000},{id:"topknot",n:"Top knot",u:10000},{id:"chonmage",n:"Sumo hair",u:50000},{id:"crown",n:"Crown",u:100000},{id:"helmet",n:"Space helmet",u:300000},{id:"horns",n:"Dragon horns",u:500000},{id:"nightcap",n:"Nightcap",u:100},{id:"comb",n:"Chicken comb",u:200},{id:"granny",n:"Granny bun",u:2000},{id:"bonnet",n:"Baby bonnet",u:3000},{id:"bucket",n:"Bucket hat",u:5000},{id:"headband",n:"Sweatband",u:7500},{id:"unicorn",n:"Unicorn horn",u:15000},{id:"pirate",n:"Pirate hat",u:25000},{id:"toque",n:"Chef hat",u:75000},{id:"cowboy",n:"Cowboy hat",u:150000},{id:"clownwig",n:"Clown wig",u:200000},{id:"viking",n:"Viking helmet",u:400000},{id:"ninjaband",n:"Ninja band",u:650000},{id:"antennae",n:"Antennae",u:800000},{id:"nemes",n:"Pharaoh headdress",u:1500000},{id:"bolt",n:"Robot antenna",u:2000000},{id:"wizard",n:"Wizard hat",u:3000000},{id:"ministack",n:"Mochi on mochi",u:10000000},{id:"bigcrown",n:"Emperor crown",sec:"emperor"},{id:"tufts",n:"Owl tufts",sec:"owl"}],
  eyes:[{id:"dots",n:"Dots"},{id:"sleepy",n:"Happy"},{id:"sparkle",n:"Sparkle"},{id:"angry",n:"Grumpy"},{id:"shades",n:"Shades",u:500},{id:"stars",n:"Star shades",u:1000},{id:"zen",n:"Zen",u:10000},{id:"nerd",n:"Big glasses",u:750},{id:"patch",n:"Eyepatch",u:25000},{id:"ghost",n:"Hollow",u:35000},{id:"three",n:"Three eyes",u:800000},{id:"liner",n:"Eyeliner",u:1500000},{id:"visor",n:"LED visor",u:2000000},{id:"glitch",n:"Error eyes",sec:"glitch"}],
  mouth:[{id:"cat",n:"Cat"},{id:"smile",n:"Smile"},{id:"smirk",n:"Smirk"},{id:"curl",n:"Lip curl",u:1000},{id:"zen",n:"Serene",u:10000},{id:"fangs",n:"Fangs",u:500000},{id:"drool",n:"Drool",u:100},{id:"beak",n:"Beak",u:200},{id:"buck",n:"Buck teeth",u:750},{id:"paci",n:"Pacifier",u:3000},{id:"o",n:"Ooh",u:35000},{id:"straw",n:"Grass straw",u:150000},{id:"bigsmile",n:"Clown smile",u:200000},{id:"wavy",n:"Static",sec:"glitch"}],
  face:[{id:"none",n:"None"},{id:"goatee",n:"Goatee"},{id:"mustache",n:"Mustache",u:500},{id:"rednose",n:"Clown nose",u:200000},{id:"beard",n:"Viking beard",u:400000},{id:"ninjamask",n:"Ninja mask",u:650000},{id:"wizbeard",n:"Wizard beard",u:3000000}],
  extra:[{id:"none",n:"None"},{id:"bowtie",n:"Bow tie"},{id:"beans",n:"Bean freckles",u:300},{id:"rose",n:"Rose",u:500},{id:"mic",n:"Microphone",u:1000},{id:"lotus",n:"Lotus seat",u:10000},{id:"mawashi",n:"Sumo belt",u:50000},{id:"jetpack",n:"Jetpack",u:300000},{id:"wings",n:"Dragon wings",u:500000},{id:"rings",n:"Planet rings",u:1000000},{id:"camera",n:"Camera",u:5000},{id:"dumbbell",n:"Dumbbell",u:7500},{id:"rainbow",n:"Rainbow",u:15000},{id:"sheriff",n:"Sheriff star",u:150000},{id:"wand",n:"Magic wand",u:3000000},{id:"stink",n:"Stink lines",u:5000000},{id:"cape",n:"Royal cape",sec:"emperor"},{id:"glitchfx",n:"Glitch",sec:"glitch"},{id:"medal",n:"Gold medal",sec:"marathon"},{id:"heart",n:"Big heart",sec:"bestie"},{id:"bib",n:"Bib",sec:"snack"},{id:"confetti",n:"Confetti",sec:"party"}],
  fill:[{id:"tongue",n:"Tongue"},{id:"custard",n:"Custard",c:"#FFD36B"},{id:"matcha",n:"Matcha cream",c:"#7CC46A"},{id:"strawberry",n:"Strawberry",c:"#FF4D6D"},{id:"redbean",n:"Red bean",c:"#7A2B36",u:300}],
  voice:[{id:"pop",n:"Pop"},{id:"squish",n:"Squish"},{id:"low",n:"Deep boss"},{id:"twang",n:"Guitar twang"},{id:"bell",n:"Temple bell"},{id:"beep",n:"Robot beep"},{id:"cluck",n:"Cluck",u:200},{id:"boo",n:"Spooky",u:35000},{id:"honk",n:"Honk",u:200000}]
};
const SLOT_LABEL = {body:"Body",hat:"Hat",eyes:"Eyes",mouth:"Mouth",face:"Face",extra:"Extra",fill:"Filling (pop to see)",voice:"Voice"};
const part = (k,id) => SLOTS[k].find(x => x.id === id) || SLOTS[k][0];
function cleanSkin(s){
  const o = {};
  for (const k in SLOTS){ const v = s && typeof s === "object" ? s[k] : null; o[k] = SLOTS[k].some(x => x.id === v) ? v : SLOTS[k][0].id; }
  return o;
}
const unlockOf = s => Math.max(0, ...Object.keys(SLOTS).map(k => part(k, s[k]).u || 0));

const PRESETS = [
  {id:"classic",n:"Classic Mochi",t:"The original. Soft, round, very squishable.",w:{n:"Picnic Hill",top:"#BFE7A5",rock:"#E8C9A6",cry:"#FFD1DC",sky:"#FFE9A8"},
   s:{body:"plain",hat:"none",eyes:"dots",mouth:"cat",face:"none",extra:"none",fill:"tongue",voice:"pop"}, say:["pop!","boing","squish!","mochi!"]},
  {id:"redbean",n:"Red Bean Mochi",t:"Sweet outside, beans inside. Pop it and see.",w:{n:"Bean Garden",top:"#F2C4CE",rock:"#C98B98",cry:"#B5475E",sky:"#FFC6D8"},
   s:{body:"redbean",hat:"none",eyes:"sparkle",mouth:"smile",face:"none",extra:"beans",fill:"redbean",voice:"squish"}, say:["beans!","so sweet~","anko time","squish~"]},
  {id:"mafia",n:"Mafia Mochi",t:"Runs the dessert district. Hates being squished. Squish him anyway.",w:{n:"Dessert District",top:"#7A7088",rock:"#4E465A",cry:"#F2B21F",sky:"#B7A6D8"},
   s:{body:"plain",hat:"fedora",eyes:"shades",mouth:"smirk",face:"mustache",extra:"rose",fill:"redbean",voice:"low"}, say:["capisce?","hey! the hat!","fuggedaboutit","you'll pay for that"]},
  {id:"rock",n:"Rockabilly Mochi",t:"Pompadour, star shades, one-mochi band.",w:{n:"Neon Stage",top:"#FF9AC2",rock:"#8B5FB8",cry:"#7ED9F0",sky:"#FFB0D6"},
   s:{body:"mango",hat:"pompadour",eyes:"stars",mouth:"curl",face:"none",extra:"mic",fill:"tongue",voice:"twang"}, say:["uh-huh","rock 'n' roll!","one more time!","hip shake!"]},
  {id:"zen",n:"Zen Master Mochi",t:"Has reached inner peace. It will not react. Try anyway.",w:{n:"Lotus Pond",top:"#9BE3C4",rock:"#7FB7A8",cry:"#FFB3C9",sky:"#C8F2DE"},
   s:{body:"matcha",hat:"topknot",eyes:"zen",mouth:"zen",face:"none",extra:"lotus",fill:"custard",voice:"bell"}, say:["ommm","breathe…","inner pop","…"]},
  {id:"sumo",n:"Sumo Mochi",t:"400 kilos of pure squish. Pushes everyone off the board.",w:{n:"Sumo Ring",top:"#E8D3A5",rock:"#B89A6A",cry:"#C2334D",sky:"#F5DFB0"},
   s:{body:"plain",hat:"chonmage",eyes:"angry",mouth:"smirk",face:"none",extra:"mawashi",fill:"tongue",voice:"low"}, say:["dosukoi!","hakkeyoi!","push!","sumo slam"]},
  {id:"champ",n:"Champion Mochi",t:"Gold body, gold crown, gold attitude. Tips nobody.",w:{n:"Golden Palace",top:"#FFE08A",rock:"#D9A93A",cry:"#FFF1B8",sky:"#FFE9A8"},
   s:{body:"gold",hat:"crown",eyes:"sparkle",mouth:"smile",face:"none",extra:"bowtie",fill:"strawberry",voice:"pop"}, say:["bow down","ka-ching!","royal pop","👑"]},
  {id:"astro",n:"Astronaut Mochi",t:"First mochi on the moon. Pops in zero gravity.",w:{n:"Moon Base",top:"#D6D8E6",rock:"#9EA2BC",cry:"#9FD8FF",sky:"#C9D6FF"},
   s:{body:"taro",hat:"helmet",eyes:"sparkle",mouth:"smile",face:"none",extra:"jetpack",fill:"strawberry",voice:"beep"}, say:["one small pop","houston!","zero-g squish","to the moon"]},
  {id:"dragon",n:"Dragon Mochi",t:"Breathes fire, eats sesame. Sets off every smoke alarm.",w:{n:"Volcano Peak",top:"#7A4E4E",rock:"#4E3434",cry:"#FF7A59",sky:"#FFB38A"},
   s:{body:"lava",hat:"horns",eyes:"angry",mouth:"fangs",face:"none",extra:"wings",fill:"strawberry",voice:"low"}, say:["rawr!","fire pop!","roar~","🔥🔥"]},
  {id:"galaxy",n:"Galaxy Mochi",t:"Made of stardust and custard. Knows everything, says nothing.",w:{n:"Galaxy Throne",top:"#4B3F8F",rock:"#2E2660",cry:"#C7B6FF",sky:"#B69CFF"},
   s:{body:"galaxy",hat:"none",eyes:"sparkle",mouth:"smile",face:"none",extra:"rings",fill:"custard",voice:"bell"}, say:["cosmic pop","✨","infinite squish","the universe says hi"]}
];
PRESETS.push(
  {id:"sleepy",n:"Sleepyhead Mochi",t:"Has been napping since 2019. Pops in its sleep. Drools on the leaderboard.",w:{n:"Pillow Fort",top:"#D9E4FF",rock:"#AFC0EE",cry:"#FFFFFF",sky:"#E3E8FF"},
   s:{body:"sakura",hat:"nightcap",eyes:"sleepy",mouth:"drool",face:"none",extra:"none",fill:"tongue",voice:"squish"}, say:["5 more minutes","zzz…","huh? what?","*snore*"]},
  {id:"chicken",n:"Chicken Mochi",t:"Not a chicken. Not a mochi. Lays eggs anyway. Nobody knows how.",w:{n:"Egg Farm",top:"#F7E6A6",rock:"#C9A56A",cry:"#FFF4D6",sky:"#FFF0B3"},
   s:{body:"plain",hat:"comb",eyes:"dots",mouth:"beak",face:"none",extra:"none",fill:"tongue",voice:"cluck"}, say:["bawk!","cluck cluck","where's my egg??","BAWK BAWK"]},
  {id:"nerd",n:"Nerd Mochi",t:"Has calculated your pops per second. Is disappointed. Snorts when it laughs.",w:{n:"Library Loft",top:"#C9A27E",rock:"#8C6A4A",cry:"#9FD8FF",sky:"#E8D9C4"},
   s:{body:"taro",hat:"none",eyes:"nerd",mouth:"buck",face:"none",extra:"none",fill:"tongue",voice:"beep"}, say:["well actually…","*snort*","E = mc squish","statistically…"]},
  {id:"granny",n:"Grandma Mochi",t:"Thinks you look thin. Will feed you. Has had a curler stuck in her hair since 1987.",w:{n:"Grandma's Kitchen",top:"#F4D6B8",rock:"#C99B78",cry:"#FF8FB0",sky:"#FFE3CC"},
   s:{body:"thaitea",hat:"granny",eyes:"sleepy",mouth:"smile",face:"none",extra:"none",fill:"custard",voice:"squish"}, say:["have you eaten?","so thin!","in my day…","call your mother"]},
  {id:"baby",n:"Baby Mochi",t:"Cries if you stop popping. Spits out the pacifier every time you squish it.",w:{n:"Nursery Cloud",top:"#FFFFFF",rock:"#DDE6F7",cry:"#FFC6D8",sky:"#DFF0FF"},
   s:{body:"sakura",hat:"bonnet",eyes:"sparkle",mouth:"paci",face:"none",extra:"none",fill:"tongue",voice:"pop"}, say:["goo goo","WAAAH","mama?","*spits pacifier*"]},
  {id:"tourist",n:"Tourist Mochi",t:"Takes 400 selfies per pop. Asks where the toilet is in every language.",w:{n:"Selfie Beach",top:"#F7E0A3",rock:"#E2B96F",cry:"#7ED9F0",sky:"#BFEFFF"},
   s:{body:"mango",hat:"bucket",eyes:"shades",mouth:"smile",face:"none",extra:"camera",fill:"tongue",voice:"pop"}, say:["selfie!","where's the toilet?","so cheap!!","one more photo"]},
  {id:"gym",n:"Gym Bro Mochi",t:"Never skips leg day. Has no legs. Drinks protein shakes made of red bean.",w:{n:"Protein Gym",top:"#B8C0CC",rock:"#7F8796",cry:"#FF6F91",sky:"#DDE2EA"},
   s:{body:"thaitea",hat:"headband",eyes:"angry",mouth:"smirk",face:"none",extra:"dumbbell",fill:"tongue",voice:"low"}, say:["do you even pop?","GAINS","one more rep!","feel the burn"]},
  {id:"unicorn",n:"Unicorn Mochi",t:"Believes in you. Poops rainbows. Glitter gets everywhere.",w:{n:"Rainbow Meadow",top:"#B8EFA0",rock:"#88C27A",cry:"#FFB3E6",sky:"#FFE3F6"},
   s:{body:"plain",hat:"unicorn",eyes:"sparkle",mouth:"smile",face:"none",extra:"rainbow",fill:"strawberry",voice:"bell"}, say:["✨magic✨","neigh?","believe!!","glitter everywhere"]},
  {id:"pirate",n:"Pirate Mochi",t:"Searched the seven seas for treasure. Found one sesame seed. Very proud of it.",w:{n:"Treasure Cove",top:"#F2D49B",rock:"#8C6A4A",cry:"#F2B21F",sky:"#9FE3F0"},
   s:{body:"plain",hat:"pirate",eyes:"patch",mouth:"smirk",face:"goatee",extra:"none",fill:"redbean",voice:"low"}, say:["arrr!","walk the plank!","yo ho squish","me treasure!"]},
  {id:"ghost",n:"Ghost Mochi",t:"Died of cuteness. Came back to haunt the leaderboard. Says boo and scares itself.",w:{n:"Haunted Bakery",top:"#6E6480",rock:"#443B55",cry:"#B7FFB0",sky:"#8F84A8"},
   s:{body:"ghost",hat:"none",eyes:"ghost",mouth:"o",face:"none",extra:"none",fill:"tongue",voice:"boo"}, say:["boo!","ooOOooo","did I scare you?","AAAH a ghost! oh wait"]},
  {id:"chef",n:"Chef Mochi",t:"Cooks everything with more butter. Kisses its fingers. Has no fingers.",w:{n:"Night Market",top:"#E88A5C",rock:"#8C4A3C",cry:"#FFD23F",sky:"#6A5A9A"},
   s:{body:"plain",hat:"toque",eyes:"sleepy",mouth:"smile",face:"mustache",extra:"none",fill:"custard",voice:"pop"}, say:["mama mia!","more butter!","*chef's kiss*","too salty!"]},
  {id:"cowboy",n:"Cowboy Mochi",t:"Rides a hamster named Kevin. This town ain't big enough for two mochis.",w:{n:"Dusty Town",top:"#E7C08A",rock:"#B5854F",cry:"#8FD06B",sky:"#FFD9A6"},
   s:{body:"thaitea",hat:"cowboy",eyes:"dots",mouth:"straw",face:"none",extra:"sheriff",fill:"tongue",voice:"twang"}, say:["yeehaw!","howdy partner","draw!","where's Kevin?"]},
  {id:"clown",n:"Clown Mochi",t:"Honks when squished. Nobody asked it to. Scares Ghost Mochi.",w:{n:"Circus Tent",top:"#FF9AAE",rock:"#C2334D",cry:"#FFE066",sky:"#FFD1DC"},
   s:{body:"plain",hat:"clownwig",eyes:"sparkle",mouth:"bigsmile",face:"rednose",extra:"none",fill:"strawberry",voice:"honk"}, say:["HONK HONK","hehehe","🎈 balloon?","*squeaky shoes*"]},
  {id:"viking",n:"Viking Mochi",t:"Conquered three villages and a 7-Eleven. Screams at every pop.",w:{n:"Frost Fjord",top:"#E6F4FF",rock:"#9FB8D0",cry:"#BFE8FF",sky:"#D6ECFF"},
   s:{body:"sakura",hat:"viking",eyes:"angry",mouth:"smirk",face:"beard",extra:"none",fill:"redbean",voice:"low"}, say:["SKÅL!","TO VALHALLA!","RAAAAH","more mead… tea"]},
  {id:"ninja",n:"Ninja Mochi",t:"So stealthy that nobody has ever seen it. You are not seeing it right now.",w:{n:"Bamboo Dojo",top:"#A7D48A",rock:"#6E8F5A",cry:"#3FBF8A",sky:"#D8F0C8"},
   s:{body:"kuro",hat:"ninjaband",eyes:"angry",mouth:"cat",face:"ninjamask",extra:"none",fill:"tongue",voice:"squish"}, say:["…","*poof*","you didn't see me","ninja pop"]},
  {id:"alien",n:"Alien Mochi",t:"Came to invade Earth. Found mochi. Stayed. Has three eyes, uses one.",w:{n:"UFO Crash Site",top:"#8FE08A",rock:"#5A7F5A",cry:"#C7FF6B",sky:"#B7C4FF"},
   s:{body:"alien",hat:"antennae",eyes:"three",mouth:"o",face:"none",extra:"none",fill:"matcha",voice:"beep"}, say:["take me to your leader","beep boop","👽👽👽","earth snacks = good"]},
  {id:"pharaoh",n:"Pharaoh Mochi",t:"Built a pyramid out of mochi. Ate it. Walks sideways for no reason.",w:{n:"Pyramid Top",top:"#F2D18B",rock:"#C9A04A",cry:"#2E4B8C",sky:"#FFE3A6"},
   s:{body:"gold",hat:"nemes",eyes:"liner",mouth:"zen",face:"none",extra:"none",fill:"custard",voice:"bell"}, say:["bow, mortal","𓂀","walk like a mochi","my pyramid!"]},
  {id:"robot",n:"Robot Mochi",t:"Programmed to pop. Malfunctions when hugged. Runs on custard.",w:{n:"Scrap Factory",top:"#A8A8B8",rock:"#6E6E80",cry:"#FF9F43",sky:"#CDD2DA"},
   s:{body:"metal",hat:"bolt",eyes:"visor",mouth:"smile",face:"none",extra:"none",fill:"custard",voice:"beep"}, say:["BEEP BOOP","I AM MOCHI","01110000","ERROR: TOO CUTE"]},
  {id:"wizard",n:"Wizard Mochi",t:"Knows one spell: turning things into mochi. Beard is 90% custard.",w:{n:"Wizard Tower",top:"#7C68C9",rock:"#4B3F8F",cry:"#FFE066",sky:"#C7B6FF"},
   s:{body:"taro",hat:"wizard",eyes:"sleepy",mouth:"smile",face:"wizbeard",extra:"wand",fill:"custard",voice:"bell"}, say:["you shall not pop!","abracadabra","✨mochi-fy✨","where's my hat"]},
  {id:"durian",n:"Durian Mochi",t:"King of fruits. Banned from hotels, buses and three leaderboards. Smells amazing (to itself).",w:{n:"Durian Orchard",top:"#C6D86A",rock:"#8C9A3A",cry:"#E6D94A",sky:"#E8F2B0"},
   s:{body:"durian",hat:"none",eyes:"sleepy",mouth:"smile",face:"none",extra:"stink",fill:"custard",voice:"squish"}, say:["sorry for the smell","king of fruits 👑","hold your nose","banned again"]},
  {id:"tower",n:"Mochi Tower",t:"A mochi, on a mochi, on a mochi. Nobody knows who's on the bottom.",w:{n:"Mochi Heaven",top:"#FFFFFF",rock:"#FFE3EC",cry:"#FFD23F",sky:"#FFF3F8"},
   s:{body:"plain",hat:"ministack",eyes:"dots",mouth:"cat",face:"none",extra:"none",fill:"strawberry",voice:"pop"}, say:["we're a family","don't drop us!","stack attack","who's on the bottom?"]}
);
PRESETS.sort((a, b) => unlockOf(cleanSkin(a.s)) - unlockOf(cleanSkin(b.s)));
const SECRETS = [
  {id:"glitch", n:"Glitch Mochi", t:"You popped 1,000,000 times solo. The game broke. This mochi crawled out of the crack.", hint:"Secret for the true solo popper", w:{n:"The Glitch",top:"#2A2436",rock:"#0B0B14",cry:"#FF2E88",sky:"#7CFFB2"},
   s:{body:"plain",hat:"none",eyes:"glitch",mouth:"wavy",face:"none",extra:"glitchfx",fill:"matcha",voice:"beep"}, say:["ERR0R","p0p p0p p0p","404 squish","null.mochi"]},
  {id:"emperor", n:"The Mochi Emperor", t:"#1 for 100 days in a row. Every mochi in the land bows to you. Even Mafia Mochi.", hint:"Secret for the one who never loses the crown", w:{n:"Eternal Throne",top:"#FFE08A",rock:"#B0203C",cry:"#F2B21F",sky:"#FFE9A8"},
   s:{body:"gold",hat:"bigcrown",eyes:"sparkle",mouth:"smile",face:"none",extra:"cape",fill:"strawberry",voice:"bell"}, say:["kneel!","100 days, baby","all hail me","👑👑👑"]}
];
const PRICE = {classic:0, sleepy:30, chicken:50, redbean:80, mafia:120, nerd:160, rock:220, granny:350, baby:500, tourist:700, gym:1000, zen:1400,
  unicorn:2000, pirate:3000, ghost:4000, sumo:6000, chef:8500, champ:12000, cowboy:17000, clown:23000, astro:32000, viking:45000, dragon:60000,
  ninja:75000, alien:95000, galaxy:125000, pharaoh:170000, robot:230000, wizard:320000, durian:500000, tower:1000000};
PRESETS.sort((a, b) => (PRICE[a.id] ?? 0) - (PRICE[b.id] ?? 0));
const skinKey = s => Object.keys(SLOTS).map(k => s[k]).join(".");
const presetOf = s => PRESETS.find(p => skinKey(cleanSkin(p.s)) === skinKey(cleanSkin(s)));
const STAGES = PRESETS.map((p, i) => ({...p, i, u: unlockOf(cleanSkin(p.s))}));
const LEGEND = 1000000, LAST = STAGES[STAGES.length - 1].u;
const legendStars = n => Math.max(0, Math.floor((n - LAST) / LEGEND));
function stageIndex(n){ let i = 0; STAGES.forEach((s, k) => { if (n >= s.u) i = k; }); return i; }

const ST = `fill="none" stroke="${INK}" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"`;
const SQUINT = `<path d="M74 132l14 8-14 8M166 132l-14 8 14 8" ${ST}/>`;
function star(cx, cy, R, r){
  let d = ""; for (let i = 0; i < 10; i++){ const a = -Math.PI/2 + i*Math.PI/5, rr = i % 2 ? r : R; d += (i ? "L" : "M") + (cx + rr*Math.cos(a)).toFixed(1) + " " + (cy + rr*Math.sin(a)).toFixed(1); }
  return d + "Z";
}
const SHADES = `<g fill="#1E1A24" stroke="${INK}" stroke-width="3"><path d="M60 128h48v8q0 18-24 18t-24-18z"/><path d="M132 128h48v8q0 18-24 18t-24-18z"/></g><path d="M106 132h28" stroke="#1E1A24" stroke-width="5"/><path d="M68 135h10M140 135h10" stroke="#fff" stroke-width="3" stroke-linecap="round" opacity=".8"/>`;
const STARS = `<g fill="#FF5FA2" stroke="#F2B21F" stroke-width="4" stroke-linejoin="round"><path d="${star(84,140,22,10)}"/><path d="${star(156,140,22,10)}"/></g><path d="M104 138h32" stroke="#F2B21F" stroke-width="4"/>`;
const PEEK = `<circle cx="84" cy="148" r="6" fill="${INK}"/><circle cx="156" cy="148" r="6" fill="${INK}"/>`;
const EYES = {
  dots:[`<circle cx="84" cy="140" r="7.5" fill="${INK}"/><circle cx="156" cy="140" r="7.5" fill="${INK}"/>`, SQUINT],
  sleepy:[`<path d="M72 143q12-12 24 0M144 143q12-12 24 0" ${ST}/>`, SQUINT],
  sparkle:[`<circle cx="84" cy="138" r="14" fill="${INK}"/><circle cx="156" cy="138" r="14" fill="${INK}"/><circle cx="89" cy="133" r="5" fill="#fff"/><circle cx="161" cy="133" r="5" fill="#fff"/><circle cx="80" cy="143" r="2.5" fill="#fff"/><circle cx="152" cy="143" r="2.5" fill="#fff"/>`, SQUINT],
  angry:[`<circle cx="84" cy="142" r="7.5" fill="${INK}"/><circle cx="156" cy="142" r="7.5" fill="${INK}"/><path d="M68 122l30 10M172 122l-30 10" ${ST}/>`, `${SQUINT}<path d="M68 118l30 10M172 118l-30 10" ${ST}/>`],
  shades:[SHADES, `${PEEK}<g transform="translate(0 -20)">${SHADES}</g>`],
  stars:[STARS, `${PEEK}<g transform="translate(0 -22) rotate(-6 120 140)">${STARS}</g>`],
  zen:[`<path d="M72 138q12 9 24 0M144 138q12 9 24 0" ${ST}/>`, `<path d="M72 138q12 9 24 0M144 138q12 9 24 0" ${ST}/>`],
  sad:[`<circle cx="84" cy="144" r="7" fill="${INK}"/><circle cx="156" cy="144" r="7" fill="${INK}"/><path d="M70 128l24-6M170 128l-24-6" ${ST}/><path d="M76 156q-5 10 0 14q5-4 0-14z" fill="#7EC8FF" stroke="${INK}" stroke-width="2"/>`, SQUINT],
  dizzy:[`<path d="M84 140m-10 0a10 10 0 1 0 10-10a6 6 0 1 0 6 6M156 140m-10 0a10 10 0 1 0 10-10a6 6 0 1 0 6 6" fill="none" stroke="${INK}" stroke-width="4" stroke-linecap="round"/>`, SQUINT],
  sleep:[`<path d="M72 140h24M144 140h24" ${ST}/>`, `<path d="M72 140h24M144 140h24" ${ST}/>`],
  nerd:[`<g fill="#E8F6FF" stroke="${INK}" stroke-width="5"><circle cx="84" cy="138" r="21"/><circle cx="156" cy="138" r="21"/></g><path d="M105 136h30M63 134L30 124M177 134L210 124" stroke="${INK}" stroke-width="5"/><circle cx="86" cy="140" r="5" fill="${INK}"/><circle cx="158" cy="140" r="5" fill="${INK}"/>`,
        `<g fill="#E8F6FF" stroke="${INK}" stroke-width="5"><circle cx="84" cy="138" r="21"/><circle cx="156" cy="138" r="21"/></g><path d="M105 136h30M63 134L30 124M177 134L210 124" stroke="${INK}" stroke-width="5"/><path d="M78 132l10 6-10 6M162 132l-10 6 10 6" fill="none" stroke="${INK}" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>`],
  patch:[`<path d="M24 118L214 100" stroke="#221C28" stroke-width="4"/><ellipse cx="84" cy="140" rx="17" ry="14" fill="#221C28"/><circle cx="156" cy="140" r="7.5" fill="${INK}"/>`,
         `<path d="M24 118L214 100" stroke="#221C28" stroke-width="4"/><ellipse cx="84" cy="140" rx="17" ry="14" fill="#221C28"/><path d="M166 132l-14 8 14 8" ${ST}/>`],
  ghost:[`<ellipse cx="86" cy="136" rx="11" ry="17" fill="${INK}"/><ellipse cx="154" cy="136" rx="11" ry="17" fill="${INK}"/>`, `<ellipse cx="86" cy="132" rx="13" ry="21" fill="${INK}"/><ellipse cx="154" cy="132" rx="13" ry="21" fill="${INK}"/>`],
  three:[`<g fill="${INK}"><circle cx="72" cy="140" r="9"/><circle cx="120" cy="124" r="11"/><circle cx="168" cy="140" r="9"/></g><g fill="#fff"><circle cx="75" cy="137" r="3"/><circle cx="124" cy="120" r="3.5"/><circle cx="171" cy="137" r="3"/></g>`, `<path d="M62 140h20M108 124h24M158 140h20" ${ST}/>`],
  liner:[`<circle cx="84" cy="140" r="7" fill="${INK}"/><circle cx="156" cy="140" r="7" fill="${INK}"/><path d="M70 134q14-10 28 0l12-6M170 134q-14-10-28 0l-12-6" fill="none" stroke="${INK}" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>`, SQUINT],
  visor:[`<rect x="58" y="126" width="124" height="28" rx="12" fill="#221C28" stroke="${INK}" stroke-width="4"/><path d="M74 140h92" stroke="#7CFFB2" stroke-width="5" stroke-dasharray="12 6"/>`,
         `<rect x="58" y="126" width="124" height="28" rx="12" fill="#221C28" stroke="${INK}" stroke-width="4"/><path d="M84 132l12 8-12 8M156 132l-12 8 12 8" fill="none" stroke="#7CFFB2" stroke-width="4" stroke-linecap="round"/>`],
  glitch:[`<g transform="translate(3 0)" stroke="#2EE6FF" stroke-width="6" stroke-linecap="round"><path d="M76 132l16 16M92 132l-16 16M148 132l16 16M164 132l-16 16"/></g><g stroke="#FF2E88" stroke-width="6" stroke-linecap="round"><path d="M76 132l16 16M92 132l-16 16M148 132l16 16M164 132l-16 16"/></g>`,
          `<g stroke="#FF2E88" stroke-width="6" stroke-linecap="round"><path d="M70 136h26M144 136h26"/></g><g stroke="#2EE6FF" stroke-width="6" stroke-linecap="round" transform="translate(-4 6)"><path d="M70 136h26M144 136h26"/></g>`]
};
const MOUTH = {drool:"M108 160q12 8 24 0", beak:"M120 150", buck:"M104 156q16 12 32 0", paci:"M120 162", o:"M120 158", straw:"M106 162q16 6 30-8", bigsmile:"M88 150q32 36 64 0", frown:"M104 166q16-12 32 0", wavy:"M102 162q6-6 12 0t12 0t12 0", fangs:"M102 156q18 16 36 0",cat:"M106 158q7 9 14 0q7 9 14 0", smile:"M102 156q18 16 36 0", smirk:"M106 162q16 6 30-8", curl:"M100 158q14 8 26 2q8-3 12-12", zen:"M110 160q10 6 20 0"};
const MOUTH_X = {
  drool:`<path d="M128 164q2 14 6 20q5-8 0-20z" fill="#9FD8FF" stroke="${INK}" stroke-width="2"/>`,
  beak:`<path d="M104 150L136 150L120 172Z" fill="#FFB020" stroke="${INK}" stroke-width="4" stroke-linejoin="round"/>`,
  buck:`<path d="M112 162h16v11h-16z" fill="#fff" stroke="${INK}" stroke-width="3"/><path d="M120 162v11" stroke="${INK}" stroke-width="2"/>`,
  paci:`<ellipse cx="120" cy="162" rx="20" ry="8" fill="#7ED9F0" stroke="${INK}" stroke-width="4"/><circle cx="120" cy="174" r="9" fill="none" stroke="#FF8FB0" stroke-width="5"/>`,
  o:`<ellipse cx="120" cy="162" rx="7" ry="9" fill="${INK}"/>`,
  straw:`<path d="M134 158L174 144" stroke="#C8A94A" stroke-width="4" stroke-linecap="round"/><path d="M168 146l10-8M170 146l12 0" stroke="#C8A94A" stroke-width="3" stroke-linecap="round"/>`,
  bigsmile:`<path d="M82 146q38 48 76 0" fill="none" stroke="#E0304E" stroke-width="5" opacity=".7"/>`
};
function openMouth(s){
  if (s.mouth === "beak") return `<g fill="#FFB020" stroke="${INK}" stroke-width="4" stroke-linejoin="round"><path d="M102 148L138 148L120 160Z"/><path d="M106 168L134 168L120 184Z"/></g>`;
  if (s.mouth === "zen") return `<ellipse cx="120" cy="164" rx="8" ry="9" fill="${INK}"/>`;
  let f;
  if (s.fill === "tongue") f = `<path d="M105 182q15-12 30 0q0 10-15 10t-15-10z" fill="#FF6F91"/>`;
  else {
    const c = part("fill", s.fill).c;
    const dot = s.fill === "strawberry" ? "#FFF3C4" : s.fill === "redbean" ? "#A8485A" : "#fff";
    f = `<ellipse cx="120" cy="176" rx="14" ry="13" fill="${c}"/><circle cx="114" cy="173" r="2.2" fill="${dot}"/><circle cx="125" cy="178" r="2.2" fill="${dot}"/><circle cx="121" cy="170" r="1.8" fill="${dot}"/>`;
  }
  return `<ellipse cx="120" cy="170" rx="19" ry="23" fill="${INK}"/>${f}`;
}
function mochiSVG(raw, still, attrs = "", face = null, open = false){
  const s = cleanSkin(raw), body = part("body", s.body).c;
  const L = `stroke="${INK}" stroke-width="6" stroke-linejoin="round"`;
  let back = "", fx = "", hat = "", faceX = "";
  if (s.extra === "lotus") back += `<circle cx="120" cy="140" r="118" fill="#9BE3C4" opacity=".35"/><g fill="#FFB3C9" ${L}><path d="M-8 224Q2 166 74 194Q48 240-8 224Z"/><path d="M248 224Q238 166 166 194Q192 240 248 224Z"/></g>`;
  if (s.extra === "jetpack") back += `<g fill="#C4CAD4" ${L}><rect x="-2" y="120" width="30" height="72" rx="12"/><rect x="212" y="120" width="30" height="72" rx="12"/></g><path d="M4 196q9 30 18 0zM218 196q9 30 18 0z" fill="#FF9F43"/><path d="M8 196q5 16 10 0zM222 196q5 16 10 0z" fill="#FFE066"/>`;
  if (s.extra === "wings") back += `<g fill="#C2334D" ${L}><path d="M40 130L-18 84L-6 128L-26 140L4 156L-6 176L40 170Z"/><path d="M200 130L258 84L246 128L266 140L236 156L246 176L200 170Z"/></g>`;
  if (s.extra === "rings") back += `<path d="M-14 176A134 24 0 0 1 254 176" fill="none" stroke="#FFD23F" stroke-width="7"/>`;
  if (s.body === "durian"){ let d = ""; for (let a = 150; a <= 390; a += 15){ const r = a*Math.PI/180, cx = 120 + 98*Math.cos(r), cy = 150 + 84*Math.sin(r); if (cy > 200) continue; const tx = 120 + 126*Math.cos(r), ty = 150 + 110*Math.sin(r), px = -Math.sin(r)*12, py = Math.cos(r)*12; d += `M${(cx+px).toFixed(1)} ${(cy+py).toFixed(1)}L${tx.toFixed(1)} ${ty.toFixed(1)}L${(cx-px).toFixed(1)} ${(cy-py).toFixed(1)}Z`; } back += `<path d="${d}" fill="#B3AE3A" ${L}/>`; }
  if (s.extra === "rainbow") back += `<g fill="none" stroke-width="11"><path d="M-10 172A130 130 0 0 1 250 172" stroke="#FF6F91"/><path d="M1 172A119 119 0 0 1 239 172" stroke="#FFD23F"/><path d="M12 172A108 108 0 0 1 228 172" stroke="#7ED9F0"/></g>`;
  if (s.extra === "cape") back += `<path d="M24 118Q-14 200 -4 246L244 246Q254 200 216 118Z" fill="#B0203C" ${L}/>`;
  if (s.extra === "glitchfx") back += `<path d="M16 160C16 92 66 58 120 58s104 34 104 102c0 50-40 62-104 62S16 210 16 160Z" fill="none" stroke="#FF2E88" stroke-width="6" transform="translate(-9 3)"/><path d="M16 160C16 92 66 58 120 58s104 34 104 102c0 50-40 62-104 62S16 210 16 160Z" fill="none" stroke="#2EE6FF" stroke-width="6" transform="translate(9 -3)"/>`;
  if (s.hat === "viking") back += `<g fill="#FFE9B0" ${L}><path d="M54 92Q18 72 22 28Q44 64 72 74Z"/><path d="M186 92Q222 72 218 28Q196 64 168 74Z"/></g>`;
  if (s.hat === "tufts") back += `<g fill="#8C5A3C" ${L}><path d="M46 108L36 38L98 76Z"/><path d="M194 108L204 38L142 76Z"/></g><path d="M56 92L50 56L84 76ZM184 92L190 56L156 76Z" fill="#C08A64"/>`;
  if (s.hat === "catears") back += `<g fill="${body}" ${L}><path d="M42 112L50 40L104 72Z"/><path d="M198 112L190 40L136 72Z"/></g><path d="M58 96L61 60L88 75ZM182 96L179 60L152 75Z" fill="#FF9DB8"/>`;
  if (s.hat === "bunny") back += `<g fill="${body}" ${L}><ellipse cx="88" cy="34" rx="17" ry="44" transform="rotate(-14 88 34)"/><ellipse cx="152" cy="34" rx="17" ry="44" transform="rotate(14 152 34)"/></g><ellipse cx="88" cy="36" rx="7" ry="30" fill="#FF9DB8" transform="rotate(-14 88 36)"/><ellipse cx="152" cy="36" rx="7" ry="30" fill="#FF9DB8" transform="rotate(14 152 36)"/>`;
  let bodyX = `<ellipse cx="120" cy="228" rx="92" ry="9" fill="${INK}" opacity=".18"/>
    <path d="${s.body === "ghost" ? "M16 160C16 92 66 58 120 58s104 34 104 102v62l-26-14-26 14-26-14-26 14-26-14-26 14-26-14-26 14Z" : "M16 160C16 92 66 58 120 58s104 34 104 102c0 50-40 62-104 62S16 210 16 160Z"}" fill="${body}" ${L}/>
    <ellipse cx="74" cy="96" rx="20" ry="10" fill="#fff" opacity=".75" transform="rotate(-24 74 96)"/>`;
  if (s.body === "galaxy") bodyX += `<g fill="#fff"><circle cx="60" cy="120" r="2"/><circle cx="178" cy="100" r="2.5"/><circle cx="196" cy="180" r="1.8"/><circle cx="52" cy="186" r="2.2"/><circle cx="140" cy="206" r="1.6"/><path d="M168 76l3 8 8 3-8 3-3 8-3-8-8-3 8-3z"/></g>`;
  if (s.body === "metal") bodyX += `<g fill="#8C93A0"><circle cx="40" cy="172" r="4"/><circle cx="200" cy="172" r="4"/><circle cx="58" cy="104" r="4"/><circle cx="182" cy="104" r="4"/></g><path d="M30 196Q120 214 210 196" stroke="#8C93A0" stroke-width="3" fill="none"/>`;
  if (s.body === "alien") bodyX += `<g fill="#7CCB5A" opacity=".7"><circle cx="64" cy="110" r="6"/><circle cx="182" cy="190" r="8"/><circle cx="170" cy="96" r="4"/></g>`;
  if (s.body === "gold") bodyX += `<path d="M186 88l4 10 10 4-10 4-4 10-4-10-10-4 10-4z" fill="#fff" opacity=".9"/>`;
  if (s.extra === "beans") bodyX += `<g fill="#7A2B36"><ellipse cx="58" cy="118" rx="5" ry="3.5" transform="rotate(30 58 118)"/><ellipse cx="176" cy="104" rx="5" ry="3.5" transform="rotate(-20 176 104)"/><ellipse cx="160" cy="200" rx="5" ry="3.5"/><ellipse cx="74" cy="196" rx="5" ry="3.5" transform="rotate(40 74 196)"/><ellipse cx="200" cy="170" rx="5" ry="3.5" transform="rotate(70 200 170)"/><ellipse cx="116" cy="84" rx="5" ry="3.5"/></g>`;
  bodyX += `<ellipse cx="60" cy="164" rx="16" ry="9" fill="#FF8FB0" opacity=".75"/><ellipse cx="180" cy="164" rx="16" ry="9" fill="#FF8FB0" opacity=".75"/>`;
  if (s.face === "mustache") faceX = `<path d="M120 152c-6-10-24-14-36-2 12 0 22 6 36 10 14-4 24-10 36-10-12-12-30-8-36 2z" fill="#221C28"/>`;
  if (s.face === "rednose") faceX = `<circle cx="120" cy="148" r="12" fill="#E0304E" stroke="${INK}" stroke-width="4"/><circle cx="116" cy="144" r="3.5" fill="#fff"/>`;
  if (s.face === "beard") faceX = `<path d="M54 172Q60 240 120 244Q180 240 186 172Q164 194 120 190Q76 194 54 172Z" fill="#E08A2E" stroke="${INK}" stroke-width="5" stroke-linejoin="round"/><path d="M96 214v26M144 214v26" stroke="#B8651A" stroke-width="5" stroke-linecap="round"/><path d="M92 176q28 10 56 0" fill="none" stroke="#B8651A" stroke-width="6" stroke-linecap="round"/>`;
  if (s.face === "wizbeard") faceX = `<path d="M70 166Q74 250 120 268Q166 250 170 166Q148 184 120 182Q92 184 70 166Z" fill="#fff" stroke="${INK}" stroke-width="5" stroke-linejoin="round"/><path d="M120 158c-8-8-24-8-32 4 12-2 20 2 32 6 12-4 20-8 32-6-8-12-24-12-32-4z" fill="#fff" stroke="${INK}" stroke-width="3"/>`;
  if (s.face === "ninjamask") faceX = `<path d="M20 158Q120 142 220 158L217 200Q120 226 23 200Z" fill="#2B2632" stroke="${INK}" stroke-width="5" stroke-linejoin="round"/>`;
  if (s.face === "goatee") faceX = `<path d="M110 198q10 18 20 0z" fill="#221C28"/>`;
  if (s.extra === "rose") fx += `<path d="M136 166L176 152" stroke="#3A8F4A" stroke-width="5" stroke-linecap="round"/><path d="M156 158q6-11 15-4" fill="#4FB060"/><circle cx="183" cy="148" r="12" fill="#E0304E" stroke="${INK}" stroke-width="4"/><path d="M178 147q5-6 10 0q-3 6-7 3" fill="none" stroke="#9E1530" stroke-width="2.5"/>`;
  if (s.extra === "camera") fx += `<path d="M58 178Q120 214 182 178" stroke="#8C5A3C" stroke-width="4" fill="none"/><rect x="96" y="190" width="48" height="32" rx="7" fill="#2E2A36" stroke="${INK}" stroke-width="4"/><circle cx="120" cy="206" r="10" fill="#7ED9F0" stroke="#fff" stroke-width="3"/><rect x="130" y="186" width="10" height="6" rx="2" fill="#FF6F91"/>`;
  if (s.extra === "dumbbell") fx += `<g transform="rotate(-24 208 182)"><rect x="182" y="178" width="52" height="8" fill="#8C93A0" stroke="${INK}" stroke-width="2"/><rect x="176" y="164" width="14" height="36" rx="3" fill="#2E2A36" stroke="${INK}" stroke-width="3"/><rect x="226" y="164" width="14" height="36" rx="3" fill="#2E2A36" stroke="${INK}" stroke-width="3"/></g>`;
  if (s.extra === "wand") fx += `<path d="M198 204L232 156" stroke="#8C5A3C" stroke-width="6" stroke-linecap="round"/><path d="${star(234,150,15,6)}" fill="#FFE066" stroke="${INK}" stroke-width="3" stroke-linejoin="round"/>`;
  if (s.extra === "sheriff") fx += `<path d="${star(166,194,15,7)}" fill="#F2B21F" stroke="${INK}" stroke-width="3" stroke-linejoin="round"/>`;
  if (s.extra === "stink") fx += `<path d="M6 110q-10-14 0-28q10-14 0-28M234 110q10-14 0-28q-10-14 0-28M26 70q-7-10 0-20q7-10 0-20M214 70q7-10 0-20q-7-10 0-20" stroke="#8CC63F" stroke-width="5" fill="none" stroke-linecap="round" opacity=".9"/>`;
  if (s.extra === "cape") fx += `<path d="M36 192Q120 234 204 192" stroke="#fff" stroke-width="14" fill="none" stroke-linecap="round"/><g fill="#221C28"><circle cx="70" cy="206" r="2.5"/><circle cx="110" cy="216" r="2.5"/><circle cx="150" cy="214" r="2.5"/><circle cx="186" cy="202" r="2.5"/></g>`;
  if (s.extra === "glitchfx") fx += `<g opacity=".85"><rect x="-6" y="96" width="70" height="7" fill="#7CFFB2"/><rect x="170" y="180" width="80" height="6" fill="#FF2E88"/><rect x="140" y="70" width="40" height="5" fill="#2EE6FF"/></g>`;
  if (s.extra === "medal") fx += `<path d="M100 168L112 200M140 168L128 200" stroke="#3F7FD0" stroke-width="9" stroke-linecap="round"/><circle cx="120" cy="208" r="16" fill="#F2B21F" stroke="${INK}" stroke-width="4"/><path d="${star(120,208,8,3.5)}" fill="#fff"/>`;
  if (s.extra === "heart") fx += `<path d="M202 164c-10-15-34-5-24 13l24 24 24-24c10-18-14-28-24-13z" fill="#FF5F8F" stroke="${INK}" stroke-width="4" stroke-linejoin="round"/><path d="M190 172q4-6 10-4" stroke="#fff" stroke-width="3" fill="none" stroke-linecap="round"/>`;
  if (s.extra === "bib") fx += `<path d="M82 176Q120 196 158 176L152 214Q120 228 88 214Z" fill="#fff" stroke="${INK}" stroke-width="4" stroke-linejoin="round"/><path d="M82 176Q120 196 158 176" stroke="#FF8FB0" stroke-width="5" fill="none"/><circle cx="108" cy="202" r="4.5" fill="#E0304E"/><circle cx="130" cy="208" r="3.5" fill="#F2B21F"/><circle cx="122" cy="196" r="2.5" fill="#7A2B36"/>`;
  if (s.extra === "confetti") fx += `<g stroke="${INK}" stroke-width="1.5"><rect x="10" y="70" width="10" height="6" fill="#FF5FA2" transform="rotate(30 15 73)"/><rect x="214" y="92" width="10" height="6" fill="#7ED9F0" transform="rotate(-20 219 95)"/><rect x="30" y="200" width="9" height="6" fill="#FFD23F" transform="rotate(50 34 203)"/><rect x="200" y="200" width="9" height="6" fill="#3FBF8A" transform="rotate(-40 204 203)"/><rect x="176" y="40" width="9" height="6" fill="#B69CFF" transform="rotate(15 180 43)"/><rect x="50" y="36" width="9" height="6" fill="#FF9F43" transform="rotate(-30 54 39)"/></g>`;
  if (s.extra === "lotus") fx += `<g fill="#FFC7D7" ${L}><path d="M40 238Q52 196 120 214Q96 252 40 238Z"/><path d="M200 238Q188 196 120 214Q144 252 200 238Z"/><path d="M120 206Q104 226 120 250Q136 226 120 206Z" fill="#FFB3C9"/></g>`;
  if (s.extra === "mic") fx += `<g transform="rotate(22 208 180)"><rect x="201" y="166" width="14" height="48" rx="6" fill="#2E2A36" stroke="${INK}" stroke-width="4"/><circle cx="208" cy="156" r="15" fill="#C4CAD4" stroke="${INK}" stroke-width="4"/><path d="M196 152h24M197 160h22" stroke="#8C93A0" stroke-width="2"/></g>`;
  if (s.extra === "mawashi") fx += `<path d="M20 190Q120 222 220 190L216 208Q120 240 24 208Z" fill="#2E4B8C" stroke="${INK}" stroke-width="5" stroke-linejoin="round"/><path d="M108 214v22M120 216v24M132 214v22" stroke="#2E4B8C" stroke-width="5" stroke-linecap="round"/>`;
  if (s.extra === "rings") fx += `<path d="M-14 176A134 24 0 0 0 254 176" fill="none" stroke="#FFD23F" stroke-width="7"/><path d="M-14 176A134 24 0 0 0 254 176" fill="none" stroke="#FFF1B8" stroke-width="2" transform="translate(0 4)"/>`;
  if (s.extra === "bowtie") fx += `<path d="M120 214L96 202V228ZM120 214L144 202V228Z" fill="#C2334D" stroke="${INK}" stroke-width="4" stroke-linejoin="round"/><circle cx="120" cy="214" r="6" fill="#9E1530" stroke="${INK}" stroke-width="3"/>`;
  if (s.hat === "fedora") hat = `<ellipse cx="120" cy="76" rx="88" ry="14" fill="${HATC}" ${L}/><path d="M72 76L80 30Q100 38 120 22Q140 38 160 30L168 76Z" fill="${HATC}" ${L}/><path d="M76 58H164L166 70H74Z" fill="#C2334D"/>`;
  if (s.hat === "pompadour") hat = `<path d="M34 120C22 60 70 20 140 24C198 28 226 66 208 106C196 84 172 74 146 78C160 64 150 54 128 56C96 60 68 70 52 98C46 106 40 114 34 120Z" fill="#221C28" ${L}/><path d="M96 40Q132 26 172 42" fill="none" stroke="#6A5C78" stroke-width="4" stroke-linecap="round"/><path d="M20 128L36 124L38 164L24 158ZM220 128L204 124L202 164L216 158Z" fill="#221C28"/>`;
  if (s.hat === "topknot") hat = `<circle cx="120" cy="44" r="20" fill="${HATC}" ${L}/><path d="M100 62h40" stroke="#C2334D" stroke-width="8" stroke-linecap="round"/>`;
  if (s.hat === "party") hat = `<g transform="rotate(12 124 40)"><path d="M100 70L124 0L148 70Z" fill="#7ED9F0" ${L}/><path d="M110 46L138 42M116 26L132 24" stroke="#FF6F91" stroke-width="6" stroke-linecap="round"/><circle cx="124" cy="0" r="9" fill="#FFD23F" stroke="${INK}" stroke-width="4"/></g>`;
  if (s.hat === "chonmage") hat = `<path d="M44 100Q120 44 196 100Q160 78 120 78Q80 78 44 100Z" fill="#221C28" ${L}/><ellipse cx="120" cy="58" rx="16" ry="10" fill="#221C28" ${L}/><path d="M120 50q18-10 24 6" fill="none" stroke="#221C28" stroke-width="7" stroke-linecap="round"/>`;
  if (s.hat === "horns") hat = `<g fill="#FFE9B0" ${L}><path d="M70 84Q48 44 66 16Q74 52 96 70Z"/><path d="M170 84Q192 44 174 16Q166 52 144 70Z"/></g>`;
  if (s.hat === "nightcap") hat = `<path d="M58 92Q70 34 128 28Q186 26 208 100L192 104Q178 66 150 68Q110 72 82 98Z" fill="#7EB6FF" ${L}/><path d="M56 94Q120 62 186 92" stroke="#fff" stroke-width="12" fill="none" stroke-linecap="round"/><path d="M110 44q14 4 22 18M150 38q12 8 16 24" stroke="#FFD23F" stroke-width="5" fill="none" stroke-linecap="round"/><circle cx="202" cy="110" r="13" fill="#fff" ${L}/>`;
  if (s.hat === "comb") hat = `<path d="M90 66Q84 30 102 34Q106 16 122 26Q134 10 144 30Q162 28 152 64Z" fill="#E0304E" ${L}/>`;
  if (s.hat === "granny") hat = `<path d="M40 104Q40 54 120 50Q200 54 200 104Q180 76 120 76Q60 76 40 104Z" fill="#C9C9D6" ${L}/><circle cx="120" cy="38" r="22" fill="#C9C9D6" ${L}/><path d="M104 30q16 10 32 0" stroke="#A9A9BA" stroke-width="4" fill="none"/><g fill="#FF8FB0" stroke="${INK}" stroke-width="3"><rect x="62" y="62" width="20" height="11" rx="5" transform="rotate(-18 72 67)"/><rect x="156" y="60" width="20" height="11" rx="5" transform="rotate(16 166 65)"/></g><path d="M134 22l18-14" stroke="#F2B21F" stroke-width="4" stroke-linecap="round"/>`;
  if (s.hat === "bonnet") hat = `<path d="M30 132Q20 50 120 44Q220 50 210 132Q200 88 120 84Q40 88 30 132Z" fill="#BFE3FF" ${L}/><path d="M36 128Q30 70 120 66Q210 70 204 128" stroke="#fff" stroke-width="6" fill="none" stroke-dasharray="3 7" stroke-linecap="round"/><path d="M40 138q-10 34 8 50M200 138q10 34-8 50" stroke="#FF8FB0" stroke-width="6" fill="none" stroke-linecap="round"/>`;
  if (s.hat === "bucket") hat = `<path d="M70 84L82 42Q120 30 158 42L170 84Z" fill="#F2E3B3" ${L}/><ellipse cx="120" cy="86" rx="78" ry="13" fill="#F2E3B3" ${L}/><circle cx="148" cy="60" r="8" fill="#FF8FB0"/><circle cx="148" cy="60" r="3" fill="#FFD23F"/>`;
  if (s.hat === "headband") hat = `<path d="M20 116Q120 88 220 116L220 132Q120 104 20 132Z" fill="#E0304E" ${L}/><path d="M216 116q22-8 30 10M216 124q20 6 24 26" stroke="#E0304E" stroke-width="8" stroke-linecap="round" fill="none"/>`;
  if (s.hat === "ninjaband") hat = `<path d="M20 116Q120 88 220 116L220 132Q120 104 20 132Z" fill="#2B2632" ${L}/><rect x="100" y="98" width="40" height="18" rx="4" fill="#C4CAD4" stroke="${INK}" stroke-width="3"/><path d="M216 116q22-8 30 10M216 124q20 6 24 26" stroke="#2B2632" stroke-width="8" stroke-linecap="round" fill="none"/>`;
  if (s.hat === "unicorn") hat = `<path d="M104 68L124 2L142 68Z" fill="#FFE08A" ${L}/><path d="M110 52l24-6M114 38l20-5M119 24l12-3" stroke="#FF8FB0" stroke-width="4" stroke-linecap="round"/><path d="M150 70q30-20 46 4q-18-4-28 10" fill="#FFB3E6" ${L}/>`;
  if (s.hat === "pirate") hat = `<path d="M34 90Q58 36 120 42Q182 36 206 90Q162 72 120 78Q78 72 34 90Z" fill="#221C28" ${L}/><circle cx="120" cy="58" r="8" fill="#fff"/><path d="M110 70l20-6M110 64l20 6" stroke="#fff" stroke-width="3"/>`;
  if (s.hat === "toque") hat = `<path d="M76 58Q54 18 92 20Q100 -4 124 8Q148 -6 158 20Q192 20 164 58Z" fill="#fff" ${L}/><rect x="78" y="54" width="84" height="26" rx="4" fill="#fff" ${L}/>`;
  if (s.hat === "cowboy") hat = `<path d="M72 92L80 42Q100 52 120 38Q140 52 160 42L168 92Z" fill="#A0673A" ${L}/><path d="M76 78H164L166 90H74Z" fill="#5A3A22"/><path d="M16 80Q40 100 120 96Q200 100 224 80Q216 110 120 112Q24 110 16 80Z" fill="#A0673A" ${L}/>`;
  if (s.hat === "clownwig") hat = `<g ${L}><circle cx="36" cy="100" r="28" fill="#FF5FA2"/><circle cx="204" cy="100" r="28" fill="#7ED9F0"/><circle cx="60" cy="70" r="24" fill="#FFD23F"/><circle cx="180" cy="70" r="24" fill="#3FBF8A"/></g><path d="M104 60l16-24 16 24z" fill="#B69CFF" ${L}/>`;
  if (s.hat === "viking") hat = `<path d="M48 102Q50 42 120 40Q190 42 192 102Z" fill="#B8BEC9" ${L}/><path d="M48 102H192" stroke="#8C7A5A" stroke-width="12"/><path d="M120 40v60" stroke="#8C93A0" stroke-width="6"/>`;
  if (s.hat === "antennae") hat = `<path d="M96 64Q84 30 68 16M144 64Q156 30 172 16" stroke="${INK}" stroke-width="5" fill="none" stroke-linecap="round"/><circle cx="68" cy="16" r="10" fill="#FFE066" stroke="${INK}" stroke-width="4"/><circle cx="172" cy="16" r="10" fill="#FFE066" stroke="${INK}" stroke-width="4"/>`;
  if (s.hat === "nemes") hat = `<path d="M26 178Q18 72 120 52Q222 72 214 178L192 182Q198 100 120 94Q42 100 48 182Z" fill="#F2B21F" ${L}/><path d="M36 150L50 148M32 126L50 124M40 100L58 102M204 150L190 148M208 126L190 124M200 100L182 102" stroke="#2E4B8C" stroke-width="7"/><path d="M60 96Q120 72 180 96" stroke="#2E4B8C" stroke-width="7" fill="none"/><path d="M114 70q6-16 12 0v14h-12z" fill="#2E4B8C" stroke="${INK}" stroke-width="3"/>`;
  if (s.hat === "bolt") hat = `<path d="M120 60V22" stroke="${INK}" stroke-width="6"/><circle cx="120" cy="16" r="11" fill="#FF6F91" ${L}/><g fill="#C4CAD4" stroke="${INK}" stroke-width="4"><rect x="6" y="136" width="16" height="28" rx="4"/><rect x="218" y="136" width="16" height="28" rx="4"/></g>`;
  if (s.hat === "wizard") hat = `<path d="M58 86L136 -14L182 86Z" fill="#6A4BC4" ${L}/><ellipse cx="120" cy="88" rx="86" ry="13" fill="#6A4BC4" ${L}/><path d="${star(120,50,10,4)}" fill="#FFE066"/><path d="${star(148,26,7,3)}" fill="#FFE066"/><circle cx="100" cy="72" r="3" fill="#fff"/>`;
  if (s.hat === "ministack"){ const m1 = `<path d="M16 160C16 92 66 58 120 58s104 34 104 102c0 50-40 62-104 62S16 210 16 160Z" fill="${body}" stroke="${INK}" stroke-width="12"/><circle cx="84" cy="140" r="11" fill="${INK}"/><circle cx="156" cy="140" r="11" fill="${INK}"/><path d="M104 160q16 12 32 0" fill="none" stroke="${INK}" stroke-width="10" stroke-linecap="round"/><ellipse cx="60" cy="166" rx="18" ry="10" fill="#FF8FB0" opacity=".75"/><ellipse cx="180" cy="166" rx="18" ry="10" fill="#FF8FB0" opacity=".75"/>`;
    hat = `<g transform="translate(70 -30) scale(.42)">${m1}</g><g transform="translate(84 -68) scale(.3)">${m1}</g>`; }
  if (s.hat === "bigcrown") hat = `<path d="M60 84L64 10L94 46L120 -6L146 46L176 10L180 84Z" fill="#F2B21F" ${L}/><path d="M60 84H180" stroke="#B0203C" stroke-width="12"/><circle cx="120" cy="56" r="10" fill="#E0304E" stroke="${INK}" stroke-width="3"/><circle cx="88" cy="62" r="6" fill="#3FBF8A"/><circle cx="152" cy="62" r="6" fill="#3FBF8A"/><circle cx="64" cy="10" r="6" fill="#fff"/><circle cx="176" cy="10" r="6" fill="#fff"/><circle cx="120" cy="-6" r="7" fill="#fff"/>`;
  if (s.hat === "crown") hat = `<path d="M70 78L76 26L100 52L120 12L140 52L164 26L170 78Z" fill="#F2B21F" ${L}/><circle cx="120" cy="62" r="7" fill="#E0304E"/><circle cx="92" cy="66" r="5" fill="#3FBF8A"/><circle cx="148" cy="66" r="5" fill="#3FBF8A"/>`;
  if (face && face.sprout && s.hat === "none") hat += `<path d="M120 62q-3-14 3-26" stroke="#3FBF8A" stroke-width="5" fill="none" stroke-linecap="round"/><path d="M122 40q-20-14-30 2q16 10 30-2zM124 38q16-18 30-6q-12 14-30 6z" fill="#7ED96A" stroke="${INK}" stroke-width="3" stroke-linejoin="round"/>`;
  let dome = "";
  if (s.hat === "helmet") dome = `<circle cx="120" cy="140" r="116" fill="#BFE8FF" fill-opacity=".22" stroke="${INK}" stroke-width="6"/><path d="M52 70Q80 40 118 34" fill="none" stroke="#fff" stroke-width="7" stroke-linecap="round" opacity=".85"/><ellipse cx="120" cy="244" rx="92" ry="12" fill="#C4CAD4" stroke="${INK}" stroke-width="5"/><path d="M120 24V2" stroke="${INK}" stroke-width="5"/><circle cx="120" cy="0" r="7" fill="#FF6F91" stroke="${INK}" stroke-width="3"/>`;
  const fang = s.mouth === "fangs" ? `<path d="M108 164l4 9 4-8zM124 165l4 8 4-9z" fill="#fff" stroke="${INK}" stroke-width="2" stroke-linejoin="round"/>` : "";
  if (face && face.eyes && Object.prototype.hasOwnProperty.call(EYES, face.eyes)) s.eyes = face.eyes;
  if (face && face.mouth && Object.prototype.hasOwnProperty.call(MOUTH, face.mouth)) s.mouth = face.mouth;
  const e = EYES[s.eyes];
  const closed = `<g>${e[0]}<path d="${MOUTH[s.mouth]}" ${ST}/>${fang}${MOUTH_X[s.mouth] || ""}</g>`;
  const opened = open ? `<g>${e[1]}${openMouth(s)}</g>` : "";
  return `<svg viewBox="-40 -56 320 356" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" ${attrs}>${face && face.aura ? auraSVG(face.aura) : ""}${back}${bodyX}${open ? "" : closed}${opened}${faceX}${fx}${hat}${dome}</svg>`;
}
/* ================= aura ================= */
const AURAS = [
  {u:0, id:"", n:"No aura", e:"", c:"#fff", d:""},
  {u:1000, id:"glow", n:"Soft Glow", e:"💗", c:"#FF9EC4", d:"A soft pink halo. Every legend starts somewhere."},
  {u:10000, id:"sparkle", n:"Sparkle", e:"✨", c:"#FFE38A", d:"Little stars twinkle around your mochi."},
  {u:50000, id:"flame", n:"Flame", e:"🔥", c:"#FF9A3C", d:"Your mochi is on fire. Literally. It's fine."},
  {u:250000, id:"thunder", n:"Thunder", e:"⚡", c:"#8FA8FF", d:"Lightning crackles around your mochi. The neighbors are worried."},
  {u:1000000, id:"rainbow", n:"Rainbow", e:"🌈", c:"#FFB3E6", d:"A spinning rainbow ring. Almost nobody gets this far."},
  {u:5000000, id:"cosmic", n:"Cosmic", e:"🪐", c:"#7B5CE0", d:"Planets orbit your mochi. You are the universe now."}
];
const REDUCE = true; // no SMIL animation in react-native-svg
const auraIdx = n => { let i = 0; AURAS.forEach((a, k) => { if (n >= a.u) i = k; }); return i; };
const auraOf = n => AURAS[auraIdx(n)];
const RANK_C = ["#F2B21F", "#DDE3EC", "#D2854F"];
const anim = s => REDUCE ? "" : s;
function auraSVG(a){
  if (!a || !a.id) return "";
  const A = AURAS.find(x => x.id === a.id); if (!A) return "";
  const pw = Math.max(0, Math.min(1, typeof a.pw === "number" ? a.pw : .6));
  const op = (0.4 + 0.6 * pw).toFixed(2), C = A.c, spin = d => anim(`<animateTransform attributeName="transform" type="rotate" from="0 120 150" to="360 120 150" dur="${d}s" repeatCount="indefinite"/>`);
  let g = `<defs><radialGradient id="aug-${A.id}"><stop offset="50%" stop-color="${C}" stop-opacity=".85"/><stop offset="100%" stop-color="${C}" stop-opacity="0"/></radialGradient></defs><circle cx="120" cy="150" r="${128 + pw*14}" fill="url(#aug-${A.id})"/>`;
  const around = (n, r, fn) => { let s = ""; for (let i = 0; i < n; i++){ const t = i / n * Math.PI * 2 - Math.PI/2; s += fn(120 + r*Math.cos(t), 150 + r*0.92*Math.sin(t), i, t); } return s; };
  if (A.id === "sparkle" || A.id === "cosmic") g += around(A.id === "cosmic" ? 10 : 7, 128, (x, y, i) => `<path d="${star(x, y, i % 2 ? 7 : 10, 3.5)}" fill="#fff" stroke="${A.id === "cosmic" ? "#B69CFF" : "#F2B21F"}" stroke-width="1.5">${anim(`<animate attributeName="opacity" values="1;.15;1" dur="1.6s" begin="-${(i*.37).toFixed(2)}s" repeatCount="indefinite"/>`)}</path>`);
  if (A.id === "flame") g += around(12, 114, (x, y, i, t) => { if (Math.sin(t) > .75) return ""; const deg = t * 180/Math.PI + 90;
    return `<g transform="translate(${x.toFixed(1)} ${y.toFixed(1)}) rotate(${deg.toFixed(1)})"><path d="M0 6C-15-6-8-26 0-44C8-26 15-6 0 6Z" fill="#FF6A2C" stroke="#3B1F4A" stroke-width="2.5" stroke-linejoin="round">${anim(`<animateTransform attributeName="transform" type="scale" values="1 1;1.08 .82;1 1.1;1 1" dur="${(.5 + (i%3)*.13).toFixed(2)}s" repeatCount="indefinite"/>`)}</path><path d="M0 3C-7-4-4-14 0-24C4-14 7-4 0 3Z" fill="#FFD23F"/></g>`; });
  if (A.id === "thunder") g += [["M-10 58l24 30-13 5 22 34","-0.2"],["M252 66l-22 30 13 5-24 34","-0.8"],["M2 226l20-20 2 13 22-16","-0.5"],["M238 224l-18-22-4 13-20-13","-1.1"],["M96 22l14 18-9 4 14 16","-0.35"]].map(([d, b]) =>
    `<g>${anim(`<animate attributeName="opacity" values="0;1;.2;1;0;0;0" dur="1.3s" begin="${b}s" repeatCount="indefinite"/>`)}<path d="${d}" fill="none" stroke="#3B1F4A" stroke-width="10" stroke-linecap="round" stroke-linejoin="round"/><path d="${d}" fill="none" stroke="#FFE066" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/></g>`).join("");
  if (A.id === "rainbow") g += `<g>${["#FF6F91","#FF9F43","#FFD23F","#3FBF8A","#7ED9F0","#B69CFF"].map((c, i) => `<circle cx="120" cy="150" r="126" fill="none" stroke="${c}" stroke-width="9" stroke-dasharray="66 330" stroke-dashoffset="${-i*66}" stroke-linecap="round"/>`).join("")}${spin(8)}</g>`;
  if (A.id === "cosmic") g += `<g><ellipse cx="120" cy="150" rx="140" ry="40" fill="none" stroke="#B69CFF" stroke-width="2.5" stroke-dasharray="6 8" transform="rotate(-18 120 150)"/><g><circle cx="260" cy="150" r="11" fill="#FF9F43" stroke="#3B1F4A" stroke-width="3"/><circle cx="-6" cy="150" r="8" fill="#7ED9F0" stroke="#3B1F4A" stroke-width="3"/>${spin(10)}</g></g>`;
  if (a.rank >= 1 && a.rank <= 3) g += `<g><circle cx="120" cy="150" r="136" fill="none" stroke="${RANK_C[a.rank - 1]}" stroke-width="7" stroke-dasharray="3 12" stroke-linecap="round"/>${spin(20)}</g>`;
  return `<g opacity="${op}">${g}</g>`;
}
function islandSVG(world, skin, face){
  const w = world, O = `stroke="${INK}" stroke-width="5" stroke-linejoin="round"`;
  return `<svg viewBox="0 0 300 310" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
  <circle cx="150" cy="150" r="140" fill="${w.sky}" opacity=".45"/>
  <g fill="${w.cry}" ${O}><path d="M58 196L80 96L106 196Z"/><path d="M192 196L220 80L246 196Z"/><path d="M112 196L146 34L184 196Z"/></g>
  <g fill="#fff" opacity=".35"><path d="M80 100L92 196H106Z"/><path d="M146 40L160 196H184Z"/><path d="M220 86L232 196H246Z"/></g>
  <path d="M30 200H270L236 252L170 298L148 304L120 294L62 250Z" fill="${w.rock}" ${O}/>
  <path d="M100 206L148 300M200 206L150 300M62 250L150 230L236 252" fill="none" stroke="${INK}" stroke-width="2.5" opacity=".35"/>
  <ellipse cx="150" cy="200" rx="124" ry="26" fill="${w.top}" ${O}/>
  <g fill="${w.cry}" ${O} stroke-width="3"><path d="M20 250l10-12 8 14-10 10z"/><path d="M262 232l10-10 8 12-10 8z"/></g>
  ${mochiSVG(skin, true, 'x="55" y="40" width="190" height="184"', face)}
  </svg>`;
}


export { INK, SLOTS, SLOT_LABEL, part, cleanSkin, unlockOf, PRESETS, PRICE, skinKey, presetOf, mochiSVG, AURAS, auraIdx, auraOf, star };
