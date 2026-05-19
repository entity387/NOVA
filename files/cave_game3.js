// ═══════════════════════════════════════════════════════════
// SOMEONE LIKE YOU: FOR YOU
// cave_game3.js
// ═══════════════════════════════════════════════════════════

const output     = document.getElementById('output');
const inputField = document.getElementById('inputField');
const achCount   = document.getElementById('achCount');
const titleArtEl = document.getElementById('titleArt');

titleArtEl.textContent =
` ███████╗ ██████╗ ██████╗      ██╗   ██╗ ██████╗ ██╗   ██╗
 ██╔════╝██╔═══██╗██╔══██╗     ╚██╗ ██╔╝██╔═══██╗██║   ██║
 █████╗  ██║   ██║██████╔╝      ╚████╔╝ ██║   ██║██║   ██║
 ██╔══╝  ██║   ██║██╔══██╗       ╚██╔╝  ██║   ██║██║   ██║
 ██║     ╚██████╔╝██║  ██║        ██║   ╚██████╔╝╚██████╔╝
 ╚═╝      ╚═════╝ ╚═╝  ╚═╝        ╚═╝    ╚═════╝  ╚═════╝
                     S O M E O N E   L I K E   Y O U   ·   I I I`;

// ── SAVE SYSTEMS ──────────────────────────────────────────
const SAVE_KEY  = 'novaCaveAch3';
const SAVE_G2   = 'sly_save';
function loadAch(){ try{return JSON.parse(localStorage.getItem(SAVE_KEY)||'[]');}catch(_){return[];} }
function loadG2(){ try{return JSON.parse(localStorage.getItem(SAVE_G2)||'{}');}catch(_){return {};} }

// ── GAME 2 DATA ───────────────────────────────────────────
let g2 = {};
function loadSaveData(){
  g2 = loadG2();
  // Defaults if no save data
  if(g2.isabelle_came===undefined) g2.isabelle_came = null; // null = ask manually
  if(g2.coin===undefined)          g2.coin          = false;
  if(g2.almost_told===undefined)   g2.almost_told   = true;
  if(g2.note===undefined)          g2.note          = '3';
  if(g2.flood===undefined)         g2.flood         = true;
}

// ── STATE ─────────────────────────────────────────────────
let lineQueue=[], isTyping=false, inputCallback=null, invalidCount=0;
let currentNarrator='narrator', achievements=[];
let isabelleCame=false;
let hermesRevealed=false;
let threeQuestions=[];

// ── NARRATOR SYSTEM ───────────────────────────────────────
const NS = {
  narrator: { cls:'narrator', invalid:["That isn't a path I recognise.","Something else, perhaps.","I don't see that from here."] },
  piper:    { cls:'piper',    invalid:["she waits. that wasn't one of the options.","the bus stop is quiet. try again.","she's patient. you don't have to be."] },
  eli:      { cls:'eli',      invalid:["...that's not one of the options.","he looks up. tries again.","nope. pick something else."] },
  may:      { cls:'may',      invalid:["she tilts her head. not quite.","try again. she doesn't mind.","that one's not on the list."] },
  hermes:   { cls:'hermes',   invalid:["...that isn't a path I can show you.","something else.","I'm afraid that isn't available."] },
};

function N(line)        { addLine(line,'narrator',140); }
function H(line)        { addLine(line,'hermes',140); }
function hazel(line)    { addLine(line,'hazel',100); }
function isabelle(line) { addLine(line,'isabelle',100); }
function piper(line)    { addLine(line,'piper',120); }
function eli(line)      { addLine(line,'eli',120); }
function may(line)      { addLine(line,'may',120); }
function owl(line)      { addLine(line,'owl',300); }
function rhys(line)     { addLine(line,'rhys',120); }

function narratorSay(line){ addLine(line,(NS[currentNarrator]||NS.narrator).cls,140); }

function addLine(text,cls='narrator',delay=0){
  lineQueue.push({text,cls,delay});
  if(!isTyping)processQueue();
}
function processQueue(){
  if(!lineQueue.length){isTyping=false;return;}
  isTyping=true;
  const{text,cls,delay}=lineQueue.shift();
  setTimeout(()=>{
    const el=document.createElement('div');
    el.className='line '+cls; el.textContent=text;
    output.appendChild(el);
    while(output.children.length>Math.floor(window.innerHeight/48))output.removeChild(output.firstChild);
    processQueue();
  },delay);
}
function clearScreen(cb){
  output.style.transition='opacity 0.3s'; output.style.opacity='0';
  setTimeout(()=>{output.innerHTML='';output.style.opacity='1';if(cb)cb();},320);
}
function divider(){ addLine('─'.repeat(60),'divider',80); }
function artPrint(t){ addLine(t,'art',20); }
function artBright(t){ addLine(t,'art-bright',20); }
function sys(t){ addLine(t,'system',60); }
function blank(){ addLine('','system',40); }

function unlockAchievement(name,rarity){
  achievements.push({name,rarity});
  const all=loadAch();
  if(!all.find(a=>a.name===name)){
    all.push({name,rarity,unlockedAt:Date.now()});
    localStorage.setItem(SAVE_KEY,JSON.stringify(all));
  }
  updateAchievementPanel();
  addLine(`[+ ACHIEVEMENT: ${name.toUpperCase()} (${rarity.toUpperCase()}) +]`,'achievement',180);
}

function askChoice(validKeys,cb){
  const valid=new Set(validKeys);
  inputCallback=(val)=>{
    if(val===''&&validKeys.includes('')){clearAndRun(()=>cb(''));return;}
    if(val==='hello there'){addLine('General Kenobi.','system',0);setTimeout(()=>askChoice(validKeys,cb),500);return;}
    if(valid.has(val)){
      invalidCount=0;
      setTimeout(()=>clearAndRun(()=>cb(val)),300);
    } else {
      invalidCount++;
      if(invalidCount>=3){invalidCount=0;setTimeout(()=>clearAndRun(narratorMeltdown),300);}
      else{
        const inv=(NS[currentNarrator]||NS.narrator).invalid;
        addLine(inv[Math.floor(Math.random()*inv.length)],'system',0);
        setTimeout(()=>askChoice(validKeys,cb),400);
      }
    }
  };
}
function clearAndRun(fn){ clearScreen(()=>{lineQueue=[];isTyping=false;fn();}); }
function cont(fn){ blank(); addLine('[ PRESS ENTER TO CONTINUE ]','prompt',220); askChoice([''],(_)=>clearAndRun(fn)); }

// ── NARRATOR MELTDOWN ─────────────────────────────────────
function narratorMeltdown(){
  unlockAchievement("Tested Hermes","rare");
  artPrint(`
  ██████████████████████████████████
  █  NARRATOR SYSTEM: CRITICAL     █
  █  ERROR — PATIENCE DEPLETED     █
  ██████████████████████████████████`);
  divider();
  if(currentNarrator==='piper'){
    piper("she watches you type that.");
    piper("she's patient. she has all day.");
    piper("but even she has limits.");
    piper("try again.");
  } else if(currentNarrator==='eli'){
    eli("...");
    eli("he goes back to wiping the counter.");
    eli("the options are still there.");
  } else if(currentNarrator==='may'){
    may("she laughs.");
    may("not unkindly.");
    may("the bus isn't here yet. we have time. pick something.");
  } else if(currentNarrator==='hermes'){
    H("I have existed since before the written word.");
    H("I have guided souls through the underworld.");
    H("I have delivered messages between gods.");
    H("And you — you are testing my patience with a text input field.");
    H("...");
    H("I find that oddly endearing.");
    H("Try again.");
  } else {
    N("...");
    N("I've narrated three games for you.");
    N("Three games.");
    N("The least you can do is pick a valid option.");
  }
  cont(playAgain);
}

// ═══════════════════════════════════════════════════════════
// ASCII ART
// ═══════════════════════════════════════════════════════════
const ROAD_ART=`
   . . . . . . . . . . . . . . . . .
   .                               .
   .     road.  north.  morning.   .
   .                               .
   . . . . . . . . . . . . . . . . .`;

const BUS_STOP_ART=`
      |‾‾‾‾‾‾‾‾‾‾‾‾|
      |  BUS STOP  |
      |____________|
           |
    _______|_______`;

const CAFE_ART=`
   .─────────────────.
   |   ELI'S CAFE    |
   |  ☕  open  ☕   |
   '─────────────────'`;

const CAVE_ENTRANCE_ART=`
        .     .       .  .   . .   .
    .     .  :     .    .. :.
         .  .   .    .  :.:. older.
      .  :       .  .  .:..:  deeper.
   .  .  .. :  -::::. ^- .^  waiting.`;

const OWL_ART=`
        (  )
       (    )
      (  ()  )
       /    \\
      | o  o |
      |  __  |
       \\____/
      ~~ owl ~~`;

const WATER_ART=`
   ─────────────────────────────────
   ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~
   ~  s t i l l  w a t e r  ~  ~  ~
   ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~
   ─────────────────────────────────`;

const HANDS_ART=`
         H A Z E L                   I S A B E L L E

           ▓▓▓   ▓▓▓                   ▓▓▓   ▓▓▓
           ▓▓▓   ▓▓▓                   ▓▓▓   ▓▓▓
           ▓▓▓   ▓▓▓   ▓▓▓         ▓▓▓ ▓▓▓   ▓▓▓
           ▓▓▓   ▓▓▓   ▓▓▓         ▓▓▓ ▓▓▓   ▓▓▓
           ▓▓▓   ▓▓▓   ▓▓▓         ▓▓▓ ▓▓▓   ▓▓▓
    ▓▓▓    ▓▓▓   ▓▓▓   ▓▓▓         ▓▓▓ ▓▓▓   ▓▓▓    ▓▓▓
    ▓▓▓    ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓         ▓▓▓▓▓▓▓▓▓▓▓▓▓    ▓▓▓
    ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓
    ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓
    ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓
    ▒▒▒▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▒▒▒
    ░░░▒▒▒▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▒▒▒░░░
      ░░░▒▒▒▒▒▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▒▒▒▒▒░░░
          ░░░░░▒▒▒▒▒▒▒▒▓▓▓▓▓▓▓▓▓▓▓▓▓▓▒▒▒▒▒▒▒▒░░░░░
              ░░░░░░░░░▒▒▒▒▒▒▒▒▒▒▒▒▒░░░░░░░░░
                    ░░░░░░░░░░░░░░░░░░░░░
                          ░░░░░░░░░░`;

// ═══════════════════════════════════════════════════════════
// BOOT / SAVE IMPORT
// ═══════════════════════════════════════════════════════════
function boot(){
  sys('SOMEONE LIKE YOU: FOR YOU — BOOTING...');
  addLine('> Narrator: restored from previous sessions...  [OK]','system',400);
  addLine('> Loading cave topology (oldest cave)...        [OK]','system',700);
  addLine('> Importing save data from THE ROAD HOME...','system',1000);
  setTimeout(()=>{
    loadSaveData();
    if(Object.keys(g2).length>2){
      addLine('>   save data found.                           [OK]','system',0);
      addLine('>   isabelle: '+(g2.isabelle_came?'coming with you':'going alone')+'       [OK]','system',200);
      addLine('>   coin: '+(g2.coin?'in your pocket':'left behind')+'               [OK]','system',400);
      addLine('> System ready.','system',700);
      divider();
      setTimeout(()=>clearAndRun(scene0_check),1400);
    } else {
      addLine('>   no save data found.','system',0);
      addLine('>   manual import required.','system',200);
      addLine('> System ready.','system',400);
      divider();
      setTimeout(()=>clearAndRun(manualImport),1100);
    }
  },1300);
}

function manualImport(){
  sys('manual import — this will only take a moment.');
  blank();
  sys('did isabelle come with you?');
  addLine('  1. yes','prompt',80);
  addLine('  2. no','prompt',80);
  askChoice(['1','2'],(c)=>{
    g2.isabelle_came=(c==='1');
    blank();
    sys('did you take the coin?');
    addLine('  1. yes','prompt',80);
    addLine('  2. no','prompt',80);
    askChoice(['1','2'],(c2)=>{
      g2.coin=(c2==='1');
      blank();
      sys('what note did you leave isabelle?');
      addLine('  1. back soon. feed mishka.','prompt',80);
      addLine('  2. i\'m sorry i didn\'t tell you. i promise.','prompt',80);
      addLine('  3. you don\'t look at me weird. i know.','prompt',80);
      askChoice(['1','2','3'],(c3)=>{
        g2.note=c3;
        g2.flood=true; g2.almost_told=true;
        sys('import complete.');
        divider();
        setTimeout(()=>clearAndRun(scene0_check),800);
      });
    });
  });
}

function scene0_check(){
  isabelleCame=g2.isabelle_came===true;
  clearAndRun(scene1);
}

// ═══════════════════════════════════════════════════════════
// SCENE 1 — THE VILLAGE EDGE / LEAVING
// ═══════════════════════════════════════════════════════════
function scene1(){
  currentNarrator='narrator';
  artPrint(ROAD_ART);
  divider();
  N('Early morning. The village behind her.');
  N('The road north ahead.');
  blank();
  if(isabelleCame){
    N('Isabelle is beside her. She didn\'t ask where they were going.');
    N('She just came.');
    blank();
    isabelle('so. north.');
    hazel('north.');
    isabelle('cool. i\'ve never been north.');
    hazel('...');
    isabelle('do you want to talk about it?');
    blank();
    addLine('Options: 1 / 2 / 3','prompt',220);
    addLine('  1. yeah. when we get further.','prompt',80);
    addLine('  2. not yet.','prompt',80);
    addLine('  3. ...there\'s a letter.','prompt',80);
    askChoice(['1','2','3'],(c)=>{
      if(c==='1'){
        hazel('yeah. when we get further.');
        isabelle('okay.');
        N('She doesn\'t push. That\'s Isabelle.');
      } else if(c==='2'){
        hazel('not yet.');
        isabelle('okay.');
        N('Just that. No argument.');
      } else {
        hazel('...there\'s a letter.');
        isabelle('a letter.');
        hazel('yeah. i\'ll show you later.');
        isabelle('okay.');
        N('Isabelle looks at her for a moment. Then looks at the road.');
        N('Eight years. She knows when to wait.');
        unlockAchievement('Told Her About The Letter','rare');
      }
      cont(scene2_piper);
    });
  } else {
    N('The road is quiet. Just her and the bag and the letter in her pocket.');
    if(g2.coin) N('And the coin. Both sides still the same.');
    blank();
    N('...');
    blank();
    N('North, then.');
    blank();
    N('She walks.');
    cont(scene2_piper);
  }
}

// ═══════════════════════════════════════════════════════════
// SCENE 2 — PIPER
// ═══════════════════════════════════════════════════════════
function scene2_piper(){
  currentNarrator='piper';
  artPrint(BUS_STOP_ART);
  divider();
  piper('she sits at the bus stop like she always does.');
  piper('she sees the bag before she sees the girl.');
  piper('she knows that bag.');
  blank();
  N('An older woman. Late 50s. Sitting like she belongs there, not like she\'s waiting.');
  N('She looks at Hazel with the patience of someone who has done a lot of waiting and made friends with it.');
  blank();
  if(isabelleCame){
    piper('two of you.');
    piper('that\'s good.');
    piper('some roads are better with someone.');
  }
  blank();
  piper('how far?');
  blank();
  addLine('Options: 1 / 2 / 3','prompt',220);
  addLine('  1. far enough.','prompt',80);
  addLine('  2. i\'m not sure yet.','prompt',80);
  addLine('  3. north. there\'s a cave.','prompt',80);
  askChoice(['1','2','3'],(c)=>{
    if(c==='1'){
      hazel('far enough.');
      piper('she nods.');
      piper('she knows that answer.');
      piper('she gave it once herself.');
    } else if(c==='2'){
      hazel('i\'m not sure yet.');
      piper('that\'s alright.');
      piper('the road shows you.');
    } else {
      hazel('north. there\'s a cave.');
      piper('...');
      piper('she looks at her for a long moment.');
      piper('then she smiles.');
      piper('good.');
      unlockAchievement('Told Piper','rare');
    }
    cont(piper_story);
  });
}

function piper_story(){
  currentNarrator='piper';
  piper('she tells her about the thing she followed.');
  piper('not all of it. enough.');
  piper('the years of wondering. the day she decided.');
  piper('the going.');
  blank();
  piper('it worked out.');
  piper('she came back. not because it failed.');
  piper('because this was home.');
  piper('the dream and the home weren\'t opposites.');
  blank();
  N('Hazel listens. Properly listens.');
  if(isabelleCame){
    N('Isabelle does too.');
  }
  blank();
  piper('then she looks at hazel.');
  piper('and she says it simply.');
  piper('like she\'s talking to herself as much as anyone.');
  blank();
  addLine('don\'t doubt yourself.','piper',300);
  blank();
  addLine('and do it before it\'s too late.','piper',400);
  blank();
  addLine('whatever it is you\'re working up to.','piper',400);
  blank();
  N('The bus comes.');
  blank();
  addLine('Options: 1 / 2','prompt',220);
  addLine('  1. thank you.','prompt',80);
  addLine('  2. ...','prompt',80);
  askChoice(['1','2'],(c)=>{
    if(c==='1'){
      hazel('thank you.');
      piper('she waves it away like it\'s nothing.');
      piper('it isn\'t nothing.');
    } else {
      hazel('...');
      piper('hazel nods. that\'s enough.');
    }
    unlockAchievement('Piper\'s Advice','common');
    piper('she watches them get on the bus.');
    piper('she sits back down.');
    piper('she\'ll be here when they come back.');
    cont(scene3_eli);
  });
}

// ═══════════════════════════════════════════════════════════
// SCENE 3 — ELI
// ═══════════════════════════════════════════════════════════
function scene3_eli(){
  currentNarrator='eli';
  artPrint(CAFE_ART);
  divider();
  eli('the last bus already went.');
  eli('he says it before she can check her phone.');
  eli('he\'s said it a lot.');
  blank();
  N('Second day. Second town. Getting more remote.');
  N('A small café, still lit. A man finishing up the closing tasks.');
  blank();
  eli('there\'s a bench inside if you need to wait til morning.');
  blank();
  if(isabelleCame){
    eli('both of you. obviously.');
    eli('bench fits two.');
  }
  blank();
  addLine('Options: 1 / 2','prompt',220);
  addLine('  1. thanks.','prompt',80);
  addLine('  2. we\'re fine.','prompt',80);
  askChoice(['1','2'],(c)=>{
    if(c==='1'){
      hazel('thanks.');
    } else {
      hazel('we\'re fine.');
      eli('...');
      eli('bench is still there if you change your mind.');
      N('She changes her mind.');
    }
    cont(eli_conversation);
  });
}

function eli_conversation(){
  currentNarrator='eli';
  eli('he moves around. closing tasks. wiping down.');
  eli('she sits. watches.');
  blank();
  N('Something about the town. The way a couple of people had looked when they came in.');
  N('The way Eli\'s jaw tightened slightly when someone said something on their way out.');
  N('Hazel noticed.');
  blank();
  N('She asks. Not directly. That\'s not Hazel.');
  blank();
  hazel('you\'ve been here a while.');
  blank();
  eli('he stops wiping.');
  eli('he looks at her.');
  eli('he knows she\'s not asking about tonight.');
  blank();
  eli('whole life.');
  blank();
  hazel('the way they look at you.');
  eli('yeah.');
  hazel('i know that look.');
  blank();
  eli('he looks at her properly then.');
  eli('really looks.');
  blank();
  eli('...');
  eli('yeah. i think you do.');
  blank();
  N('They talk. Properly talk. Two people who know what it is to be seen as one thing.');
  N('Neither of them has to explain it to the other.');
  blank();
  addLine('Options: 1 / 2 / 3','prompt',220);
  addLine('  1. does it get better?','prompt',80);
  addLine('  2. how do you stay?','prompt',80);
  addLine('  3. i\'m sorry.','prompt',80);
  askChoice(['1','2','3'],(c)=>{
    if(c==='1'){
      hazel('does it get better?');
      eli('...');
      eli('some days.');
      eli('some days it\'s just the same.');
      eli('but you get better at it.');
    } else if(c==='2'){
      hazel('how do you stay?');
      eli('...');
      eli('because it\'s mine.');
      eli('they don\'t get to have it just because they got there first.');
      unlockAchievement('Because It\'s Mine','epic');
    } else {
      hazel('i\'m sorry.');
      eli('...');
      eli('thanks.');
      eli('you\'re the second person to say that.');
      eli('it gets easier to hear.');
    }
    cont(eli_theworst);
  });
}

function eli_theworst(){
  currentNarrator='eli';
  eli('then he says it.');
  eli('the thing that stays with her.');
  blank();
  addLine('the worst part isn\'t that they got it wrong.','eli',300);
  blank();
  addLine('it\'s that they stopped looking.','eli',400);
  blank();
  N('Hazel doesn\'t answer.');
  N('But she thinks about it for the rest of the journey.');
  blank();
  if(isabelleCame){
    N('Isabelle reaches over and puts her hand on the table between them.');
    N('Not grabbing. Just — there.');
    N('Hazel looks at it.');
    N('Doesn\'t move away.');
    unlockAchievement('Still Looking','epic');
  }
  blank();
  eli('morning comes.');
  eli('he makes them coffee before they go.');
  eli('doesn\'t charge for it.');
  blank();
  addLine('Options: 1 / 2','prompt',220);
  addLine('  1. thank you. for everything.','prompt',80);
  addLine('  2. good luck.','prompt',80);
  askChoice(['1','2'],(c)=>{
    if(c==='1'){
      hazel('thank you. for everything.');
      eli('he nods.');
      eli('she\'ll be alright.');
      eli('he can tell.');
    } else {
      hazel('good luck.');
      eli('you too.');
      eli('both of you.');
    }
    unlockAchievement('Eli\'s Recognition','rare');
    cont(scene4_may);
  });
}

// ═══════════════════════════════════════════════════════════
// SCENE 4 — MAY
// ═══════════════════════════════════════════════════════════
function scene4_may(){
  currentNarrator='may';
  artPrint(BUS_STOP_ART);
  divider();
  may('she sits down without asking.');
  may('she never asks.');
  may('it always works out fine.');
  blank();
  N('Third day. Last town before the cave. The world is very quiet up here.');
  N('A woman. Early 30s. She sits down next to Hazel at the bus stop like she remembers what it was like to be alone with something too big to carry quietly.');
  blank();
  if(isabelleCame){
    may('she sits next to the quiet one.');
    may('she always knows which one needs it.');
  }
  blank();
  may('going somewhere important?');
  blank();
  addLine('Options: 1 / 2 / 3','prompt',220);
  addLine('  1. yeah.','prompt',80);
  addLine('  2. i think so.','prompt',80);
  addLine('  3. ...how did you know?','prompt',80);
  askChoice(['1','2','3'],(c)=>{
    if(c==='1'){
      hazel('yeah.');
      may('she nods. she thought so.');
    } else if(c==='2'){
      hazel('i think so.');
      may('the ones who aren\'t sure are usually the most sure.');
    } else {
      hazel('...how did you know?');
      may('she taps her own chest.');
      may('same look i had. three years ago.');
      unlockAchievement('Same Look','rare');
    }
    cont(may_story);
  });
}

function may_story(){
  currentNarrator='may';
  may('she doesn\'t push. just talks. easy and unhurried.');
  may('like she has nowhere else to be.');
  blank();
  N('At some point — and Hazel doesn\'t know why she asks:');
  blank();
  hazel('did you ever do something that scared you.');
  blank();
  may('she takes it seriously.');
  blank();
  may('she tells her about her friend.');
  may('not everything. just the shape of it.');
  may('the years of carrying it.');
  may('the day she finally said it.');
  may('the silence after.');
  may('the polite, kind, honest decline.');
  may('that felt like falling and landing at the same time.');
  blank();
  addLine('she said she didn\'t feel that way.','may',300);
  addLine('and i said okay.','may',300);
  addLine('and we sat there for a bit.','may',300);
  blank();
  hazel('and then?');
  blank();
  addLine('and then she made tea.','may',300);
  addLine('and we watched something terrible on tv.','may',300);
  addLine('and it was awful for a while and then it wasn\'t.','may',300);
  blank();
  N('Hazel is quiet.');
  blank();
  hazel('are you glad you said it?');
  blank();
  N('May doesn\'t hesitate.');
  blank();
  addLine('yeah.','may',300);
  blank();
  addLine('because at least it was real.','may',400);
  addLine('carrying it wasn\'t real.','may',300);
  addLine('saying it was.','may',400);
  blank();
  N('The bus comes.');
  if(isabelleCame){
    N('Isabelle says nothing. But she\'s heard every word.');
    N('Hazel doesn\'t look at her.');
    N('Not yet.');
  }
  blank();
  addLine('Options: 1 / 2','prompt',220);
  addLine('  1. thank you.','prompt',80);
  addLine('  2. ...','prompt',80);
  askChoice(['1','2'],(c)=>{
    if(c==='1'){
      hazel('thank you.');
      may('she smiles.');
      may('anytime. good luck with the important thing.');
    } else {
      hazel('...');
      may('she nods. she understands.');
    }
    unlockAchievement('May\'s Truth','rare');
    cont(scene5_cave);
  });
}

// ═══════════════════════════════════════════════════════════
// SCENE 5 — THE CAVE
// ═══════════════════════════════════════════════════════════
function scene5_cave(){
  currentNarrator='narrator';
  artPrint(CAVE_ENTRANCE_ART);
  divider();
  N('The last bus drops them at the end of a road that stops being a road.');
  N('From here it\'s a path. Then less than a path.');
  N('Then just north.');
  blank();
  N('And then — there.');
  blank();
  N('The cave.');
  blank();
  N('Older than the village. Older than the road. Older than anything Hazel has a word for.');
  N('The entrance is low. Dark. The air that comes out of it is cooler than the morning.');
  blank();
  if(isabelleCame){
    N('Isabelle stops beside her.');
    isabelle('...');
    isabelle('is this it?');
    hazel('yeah.');
    isabelle('it\'s old.');
    hazel('yeah.');
    isabelle('okay.');
    blank();
    N('She doesn\'t say anything else. Just stands there with her.');
    N('The letter said come alone. Hazel came with someone anyway.');
    N('She doesn\'t think that\'s wrong.');
    blank();
    addLine('Options: 1 / 2','prompt',220);
    addLine('  1. wait here. i need to go in alone first.','prompt',80);
    addLine('  2. come with me.','prompt',80);
    askChoice(['1','2'],(c)=>{
      if(c==='1'){
        hazel('wait here. i need to go in alone first.');
        isabelle('...');
        isabelle('okay.');
        isabelle('i\'ll be right here.');
        blank();
        N('She means it. Hazel knows she means it.');
        unlockAchievement('Just For A Moment','secret');
        cont(cave_inside);
      } else {
        hazel('come with me.');
        isabelle('yeah?');
        hazel('yeah.');
        blank();
        N('They go in together.');
        cont(cave_inside);
      }
    });
  } else {
    N('She stands at the entrance for a moment.');
    N('Alone. Same as she\'s been the whole way here.');
    N('Same as she\'s been most of her life.');
    blank();
    N('...');
    blank();
    N('She goes in.');
    cont(cave_inside);
  }
}

function cave_inside(){
  currentNarrator='narrator';
  artPrint(OWL_ART);
  divider();
  N('The cave is dark at first.');
  N('Then her eyes adjust and it\'s just — cave.');
  N('Rock and silence and the particular smell of deep earth.');
  blank();
  N('And then.');
  blank();
  N('The owl.');
  blank();
  N('Sitting on a ledge. Still. Watching her with eyes that catch what little light there is.');
  N('It has clearly been here a very long time.');
  blank();
  N('It looks at Hazel like it recognises her.');
  N('Like it has been expecting her specifically.');
  blank();
  owl('...');
  blank();
  addLine('Options: 1 / 2 / 3','prompt',220);
  addLine('  1. ...hello.','prompt',80);
  addLine('  2. are you supposed to be here?','prompt',80);
  addLine('  3. ...are YOU hermes?','prompt',80);
  askChoice(['1','2','3'],(c)=>{
    if(c==='1'){
      hazel('...hello.');
      owl('...');
      N('The owl blinks. Slowly. Then hops off the ledge and begins moving deeper into the cave.');
      N('It looks back once.');
    } else if(c==='2'){
      hazel('are you supposed to be here?');
      owl('...');
      N('The owl stares at her with the particular patience of something very old.');
      N('Then moves deeper. Looks back.');
    } else {
      hazel('...are you hermes?');
      owl('...');
      N('The owl blinks.');
      N('Keeps blinking.');
      N('Then moves away into the dark.');
      N('That wasn\'t a yes. That wasn\'t a no.');
      unlockAchievement('Good Question (Again)','secret');
    }
    cont(cave_deep);
  });
}

function cave_deep(){
  currentNarrator='narrator';
  N('She follows the owl.');
  N('Deeper. Further than she expected.');
  N('The cave changes as she goes — the walls smoother, the air different.');
  N('Not carved. Grown.');
  blank();
  N('And then the owl stops.');
  N('And Hazel sees it.');
  blank();
  artPrint(WATER_ART);
  blank();
  N('A pool of water. Still and perfect and ancient.');
  N('The owl sits beside it and folds its wings and doesn\'t move again.');
  blank();
  N('She looks into the water.');
  blank();
  N('And she sees herself.');
  blank();
  N('...');
  blank();
  N('Clearly.');
  N('Without the doubt. Without the fear. Without the particular weight of being looked at wrong.');
  N('Just herself. As she actually is.');
  blank();
  N('She looks for a long time.');
  blank();
  unlockAchievement('Saw Herself','legendary');
  cont(cave_voice);
}

function cave_voice(){
  currentNarrator='narrator';
  N('Then — not a sound. Not quite. More like a knowing.');
  N('Something that comes from the cave itself.');
  N('From the water. From the rock. From wherever the owl came from.');
  blank();
  N('Calm. Certain.');
  N('Three words.');
  blank();
  addLine('','system',200);
  addLine('You already knew.','owl',600);
  addLine('','system',200);
  blank();
  N('...');
  blank();
  N('She did.');
  blank();
  N('She knew about Isabelle.');
  N('She knew she deserved good things.');
  N('She knew the cave was waiting for her.');
  blank();
  N('She just needed to walk far enough to believe it.');
  blank();
  unlockAchievement('You Already Knew','mythic');
  cont(cave_exit);
}

function cave_exit(){
  currentNarrator='narrator';
  N('She comes out of the cave.');
  N('Changed. Quieter than she went in.');
  blank();
  N('The owl doesn\'t follow.');
  blank();
  N('The light outside is different — early morning, the same kind of dawn as when she left the wrong cave.');
  N('Full circle.');
  blank();
  N('She stands there breathing.');
  blank();
  N('And before she can say anything —');
  blank();
  cont(hermes_reveal);
}

// ═══════════════════════════════════════════════════════════
// HERMES REVEAL
// ═══════════════════════════════════════════════════════════
function hermes_reveal(){
  currentNarrator='hermes';
  blank();
  H('Hazel.');
  blank();
  N('Not narrator voice. Just — his voice. Whatever that actually sounds like when he\'s not performing.');
  blank();
  H('I need to tell you something.');
  blank();
  N('She waits.');
  blank();
  H('I\'m Hermes.');
  blank();
  addLine('','system',200);
  addLine('','system',200);
  blank();
  H('I\'ve been with you since the first cave. Athena sent me.');
  H('The letter was hers.');
  H('The voicemail was mine.');
  H('The stranger on the road was me.');
  blank();
  if(g2.coin){
    H('The coin was mine too. I wanted you to have something to hold.');
    blank();
    N('Hazel takes it out of her pocket. Looks at it. Both sides still identical.');
    blank();
    hazel('which side is which.');
    blank();
    H('There isn\'t one. It was never about the sides.');
    hazel('then what was it about.');
    H('Having something in your pocket that reminded you this was real.');
    blank();
    N('She looks at it for a moment. Then puts it back.');
    N('She keeps it.');
    unlockAchievement('The Coin\'s Purpose','secret');
  } else {
    H('I left you a coin. I wanted you to have something to hold.');
    blank();
    N('...');
    blank();
    H('You left it.');
    blank();
    hazel('i didn\'t know what it was.');
    blank();
    H('That\'s alright. You got here anyway.');
    blank();
    N('Which is actually more meaningful than if she\'d taken it.');
    N('She made it without the thing he tried to give her.');
    N('She carried herself here.');
    unlockAchievement('Carried Herself','epic');
  }
  cont(hermes_conversation);
}

function hermes_conversation(){
  currentNarrator='hermes';
  N('Hazel is quiet for a long moment.');
  blank();
  hazel('i know.');
  blank();
  H('...you knew?');
  hazel('i didn\'t know know. but i know now.');
  H('when?');
  blank();
  hazel('when you told me to go to sleep.');
  blank();
  N('That callback. Game 2. The first time he used her name unprompted.');
  N('She filed it away. She always filed things away.');
  blank();
  H('...');
  H('Of course you did.');
  blank();
  N('Three questions. She can ask him anything now. He\'ll answer.');
  blank();
  sys('she has three questions.');
  sys('choose wisely — or don\'t. he\'ll answer either way.');
  blank();
  hermes_question(1,[]);
}

function hermes_question(num, asked){
  if(num>3){ cont(hermes_end); return; }
  const available=[
    {k:'1', q:'why me.',      a:()=>{
      hazel('why me.');
      H('Because Athena noticed.');
      H('You named something after her at fifteen years old. Carefully. With intention.');
      H('She looks after makers. Thinkers. People who build things and name them with love.');
      H('She\'s been watching you since then.');
      H('I\'ve been waiting in that cave since then.');
      unlockAchievement('Why Me','rare');
    }},
    {k:'2', q:'did athena actually watch me name the pc.',  a:()=>{
      hazel('did athena actually watch me name the pc.');
      H('...');
      H('Yes.');
      blank();
      hazel('...the whole time?');
      H('She was there when you chose the name. She appreciated the deliberateness of it.');
      H('A Ryzen 7 7800X3D named after the goddess of wisdom and craft.');
      H('She found it fitting.');
      blank();
      hazel('...what did she think of the flood?');
      H('She thought it showed excellent reflexes.');
      blank();
      N('Hazel almost laughs.');
      unlockAchievement('Athena Noticed','legendary');
    }},
    {k:'3', q:'are you going to stay.',  a:()=>{
      hazel('are you going to stay.');
      H('...');
      H('My role here is done.');
      H('The cave chose you. You came. You saw yourself clearly.');
      H('That\'s what I was sent for.');
      blank();
      hazel('that\'s not an answer.');
      H('...');
      H('No. It isn\'t.');
      blank();
      H('I\'ll always be with the story. Wherever the story goes.');
      unlockAchievement('Always With The Story','secret');
    }},
    {k:'4', q:'was any of it real. the narrating.',  a:()=>{
      hazel('was any of it real. the narrating.');
      H('...');
      H('All of it.');
      H('I\'m a messenger. A guide. A narrator of souls.');
      H('But I\'m not neutral. I never claimed to be neutral.');
      blank();
      hazel('you got fond of me.');
      H('...');
      H('That wasn\'t in the brief.');
      H('It happened anyway.');
      blank();
      N('Hazel nods. Files it away.');
      unlockAchievement('Not In The Brief','epic');
    }},
    {k:'5', q:'what happens now.',  a:()=>{
      hazel('what happens now.');
      H('Now?');
      blank();
      H('Now you go home.');
      H('You eat something. You check on Mishka.');
      H('You start Athena back up.');
      blank();
      hazel('...and everything else?');
      H('Everything else is already in motion. It was in motion before you got here.');
      H('You already know what to do.');
      blank();
      N('She does.');
    }},
  ].filter(q=>!asked.includes(q.k));

  blank();
  addLine(`question ${num} of 3 — choose:`, 'system', 80);
  available.forEach(q=>addLine(`  ${q.k}. ${q.q}`,'prompt',60));
  const keys=available.map(q=>q.k);
  askChoice(keys,(c)=>{
    const chosen=available.find(q=>q.k===c);
    if(chosen){ chosen.a(); }
    cont(()=>hermes_question(num+1,[...asked,c]));
  });
}

function hermes_end(){
  currentNarrator='hermes';
  blank();
  H('...');
  H('There\'s something else you need to do today.');
  blank();
  N('She knows what he means.');
  blank();
  if(isabelleCame){
    N('Isabelle is standing a little way off. Giving them space.');
    N('She\'s been doing that the whole time.');
    N('Eight years of knowing when to give Hazel space.');
    blank();
    H('Go.');
    blank();
    cont(isabelle_moment);
  } else {
    H('Go home first. Then do it.');
    blank();
    N('She nods.');
    cont(ending_alone);
  }
}

// ═══════════════════════════════════════════════════════════
// ISABELLE MOMENT — if she came
// ═══════════════════════════════════════════════════════════
function isabelle_moment(){
  currentNarrator='narrator';
  N('Hazel walks over to Isabelle.');
  N('Hermes steps back. This part isn\'t his.');
  blank();
  N('Just Hazel and Isabelle. Outside the oldest cave either of them has ever seen.');
  N('Morning. Quiet.');
  blank();
  N('Isabelle doesn\'t ask what happened in there.');
  N('She just stands there.');
  N('That\'s very Isabelle.');
  blank();
  N('The silence before.');
  blank();
  addLine('Options: 1 / 2 / 3','prompt',220);
  addLine('  1. say it now','prompt',80);
  addLine('  2. wait a moment','prompt',80);
  addLine('  3. ...','prompt',80);
  askChoice(['1','2','3'],(c)=>{
    if(c==='1'){
      N('She doesn\'t let herself think. Just turns to Isabelle and goes.');
      cont(isabelle_confession);
    } else if(c==='2'){
      N('She stands there for a bit. Looks at the cave. Looks at Isabelle.');
      N('Thinks about May. Carrying it isn\'t real. Saying it is.');
      N('Then goes.');
      cont(isabelle_confession);
    } else {
      N('Isabelle reaches over and takes her hand.');
      N('Doesn\'t say anything. Just — takes it.');
      N('Hazel looks down at that and something in her gives way.');
      cont(isabelle_confession);
    }
  });
}

function isabelle_confession(){
  currentNarrator='narrator';
  blank();
  hazel('isabelle.');
  isabelle('yeah.');
  hazel('i need to tell you something.');
  blank();
  N('Isabelle waits. She\'s good at waiting.');
  blank();
  hazel('i have feelings for you. i have had for a long time.');
  hazel('and i didn\'t say it because i was scared of losing you.');
  hazel('and i think i nearly didn\'t say it again today.');
  hazel('but i\'m saying it now.');
  blank();
  N('Silence.');
  N('The longest silence in the trilogy.');
  blank();
  cont(isabelle_response);
}

function isabelle_response(){
  currentNarrator='narrator';
  N('Isabelle laughs.');
  N('Not mockingly. The slightly overwhelmed laugh of someone whose chest just did something unexpected.');
  blank();
  isabelle('hazel.');
  hazel('yeah.');
  isabelle('i\'ve literally been — hazel i\'ve been in love with you since we were like sixteen.');
  blank();
  N('Hazel stares at her.');
  blank();
  hazel('...what.');
  isabelle('i thought YOU knew.');
  hazel('how would i have known.');
  isabelle('i don\'t know i thought it was obvious.');
  hazel('it was not obvious isabelle.');
  blank();
  cont(isabelle_athena);
}

function isabelle_athena(){
  currentNarrator='narrator';
  N('A beat.');
  blank();
  hazel('...wait.');
  hazel('you said you\'ve been in love with me since sixteen.');
  isabelle('yeah.');
  hazel('and you never said anything.');
  isabelle('you never said anything either.');
  blank();
  N('A beat.');
  blank();
  hazel('i named my pc athena.');
  isabelle('...okay.');
  hazel('athena. goddess of wisdom. because i thought naming something after something you love brings it close to you.');
  blank();
  N('Isabelle stares at her.');
  blank();
  isabelle('hazel.');
  hazel('yeah.');
  isabelle('are you saying you named your computer after a greek goddess for the same reason i—');
  hazel('i\'m not saying anything.');
  blank();
  N('Isabelle laughs again. Properly this time.');
  blank();
  isabelle('that\'s the most you thing i\'ve ever heard.');
  hazel('...is it working?');
  isabelle('it\'s absolutely working.');
  blank();
  unlockAchievement('Said It','mythic');
  cont(ending_together);
}

// ═══════════════════════════════════════════════════════════
// ENDING — ISABELLE CAME
// ═══════════════════════════════════════════════════════════
function ending_together(){
  currentNarrator='narrator';
  blank();
  N('They stand there for a moment.');
  N('The cave behind them. Hermes somewhere nearby saying absolutely nothing for once.');
  blank();
  N('Then Hazel:');
  blank();
  hazel('we should probably go home.');
  isabelle('yeah.');
  isabelle('mishka needs feeding.');
  hazel('...');
  hazel('mishka always needs feeding.');
  blank();
  N('They start walking. Back south. Back toward the village.');
  N('Same road. Different weight on it.');
  blank();
  cont(final_hands);
}

// ═══════════════════════════════════════════════════════════
// ENDING — ALONE PATH
// ═══════════════════════════════════════════════════════════
function ending_alone(){
  currentNarrator='narrator';
  N('The road home is quieter than the road north.');
  N('She knows what she\'s walking back toward.');
  blank();
  N('Hermes walks with her. Properly now. Not narrating. Just — there.');
  N('Something between a companion and a guide. The mask off.');
  N('It\'s a comfortable silence.');
  blank();
  if(g2.coin){
    N('She holds the coin in her hand for a while. Then puts it back.');
  }
  blank();
  N('Three days there. The road back feels shorter.');
  N('It always does, when you know where you\'re going.');
  blank();
  cont(alone_home);
}

function alone_home(){
  currentNarrator='narrator';
  N('She knocks on Isabelle\'s door.');
  N('Evening. The village quiet around her.');
  blank();
  N('Isabelle opens it. Stares at her.');
  isabelle('hazel. you\'ve been gone for—');
  hazel('i know.');
  isabelle('three days.');
  hazel('i know. i\'m sorry.');
  blank();
  N('Isabelle looks at her properly. Something in Hazel\'s face has shifted.');
  N('She notices everything. Always has.');
  blank();
  isabelle('...are you okay?');
  blank();
  N('And Hazel — who walked north alone and followed an owl into the oldest cave she\'s ever seen and looked at herself clearly for the first time — ');
  blank();
  hazel('yeah.');
  hazel('i am.');
  hazel('can i come in?');
  hazel('i have something i need to tell you.');
  blank();
  N('Isabelle steps back from the door.');
  isabelle('...yeah. of course.');
  blank();
  N('She goes in.');
  cont(alone_confession);
}

function alone_confession(){
  currentNarrator='narrator';
  N('Mishka comes to her immediately. Hazel picks her up.');
  N('Mishka tolerates this for longer than usual.');
  blank();
  N('They sit. Isabelle makes tea. Doesn\'t ask where things are because she knows.');
  blank();
  N('And then Hazel says it.');
  blank();
  N('Not perfectly. Not eloquently. But honestly.');
  blank();
  hazel('i have feelings for you. i\'ve had them for a long time.');
  hazel('i didn\'t say it because i was scared.');
  hazel('i\'m saying it now because i went somewhere that showed me—');
  blank();
  N('She stops. Tries again.');
  blank();
  hazel('because carrying it isn\'t real. saying it is.');
  blank();
  N('Silence.');
  blank();
  cont(alone_response);
}

function alone_response(){
  currentNarrator='narrator';
  isabelle('hazel.');
  hazel('yeah.');
  isabelle('i\'ve been in love with you since we were sixteen.');
  blank();
  hazel('...');
  hazel('what.');
  isabelle('i thought you knew.');
  hazel('isabelle i absolutely did not know.');
  isabelle('i named my cat after a book you recommended to me.');
  hazel('that\'s not a confession that\'s just—');
  isabelle('hazel i named my cat for YOU.');
  blank();
  N('...');
  blank();
  hazel('...mishka is named after me?');
  isabelle('yes hazel. mishka is named after you.');
  hazel('i\'ve been calling her by my own name this whole time.');
  isabelle('technically yes.');
  blank();
  N('A beat.');
  blank();
  hazel('that\'s actually really funny.');
  isabelle('i thought you\'d appreciate it eventually.');
  blank();
  unlockAchievement('Said It (Home)','mythic');
  cont(alone_ending);
}

function alone_ending(){
  currentNarrator='narrator';
  blank();
  N('Mishka settles between them on the sofa.');
  N('Tea goes cold. Neither of them minds.');
  blank();
  N('Outside the village is the same village it always was.');
  N('In here something is different.');
  blank();
  N('Good different.');
  blank();
  N('The kind that lasts.');
  blank();
  cont(final_different_hands);
}

function final_different_hands(){
  currentNarrator='narrator';
  artPrint(`
         H A Z E L                   I S A B E L L E

           ▓▓▓   ▓▓▓                   ▓▓▓   ▓▓▓
           ▓▓▓   ▓▓▓                   ▓▓▓   ▓▓▓
           ▓▓▓   ▓▓▓   ▓▓▓         ▓▓▓ ▓▓▓   ▓▓▓
           ▓▓▓   ▓▓▓   ▓▓▓         ▓▓▓ ▓▓▓   ▓▓▓
           ▓▓▓   ▓▓▓   ▓▓▓         ▓▓▓ ▓▓▓   ▓▓▓
    ▓▓▓    ▓▓▓   ▓▓▓   ▓▓▓         ▓▓▓ ▓▓▓   ▓▓▓    ▓▓▓
    ▓▓▓    ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓         ▓▓▓▓▓▓▓▓▓▓▓▓▓    ▓▓▓
    ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓
    ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓
    ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓
    ▒▒▒▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▒▒▒
    ░░░▒▒▒▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▒▒▒░░░
      ░░░▒▒▒▒▒▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▒▒▒▒▒░░░
          ░░░░░▒▒▒▒▒▒▒▒▓▓▓▓▓▓▓▓▓▓▓▓▓▓▒▒▒▒▒▒▒▒░░░░░
              ░░░░░░░░░▒▒▒▒▒▒▒▒▒▒▒▒▒░░░░░░░░░
                    ░░░░░░░░░░░░░░░░░░░░░
                          ░░░░░░░░░░`);
  cont(hermes_outro_alone);
}

function hermes_outro_alone(){
  currentNarrator='hermes';
  blank();
  H('I have narrated a great many things.');
  H('Caves. Crossroads. A giant who wouldn\'t wake up.');
  H('A button pressed ten times. A coin left behind. A letter read in a field at dawn.');
  blank();
  H('I have watched people walk toward things and away from things and I have described it all with the appropriate distance.');
  blank();
  H('This one was different.');
  blank();
  H('I don\'t think I was supposed to get fond of her.');
  H('That wasn\'t in the brief.');
  blank();
  H('But there it is.');
  blank();
  H('Athena chose well. She usually does.');
  blank();
  H('Hazel.');
  blank();
  H('It was an honour to walk beside your story.');
  blank();
  H('I\'ll see myself out.');
  blank();
  cont(final_words_alone);
}

function final_words_alone(){
  currentNarrator='narrator';
  blank();
  addLine('hazel > i love you.','hazel',400);
  addLine('isabelle > i love you.','isabelle',400);
  blank();
  cont(credits);
}

// ═══════════════════════════════════════════════════════════
// FINAL HANDS + HERMES OUTRO — TOGETHER PATH
// ═══════════════════════════════════════════════════════════
function final_hands(){
  currentNarrator='narrator';
  artPrint(HANDS_ART);
  cont(hermes_outro);
}

function hermes_outro(){
  currentNarrator='hermes';
  blank();
  H('I have narrated a great many things.');
  H('Caves. Crossroads. A giant who wouldn\'t wake up.');
  H('A button pressed ten times. A coin. A letter read in a field at dawn.');
  blank();
  H('I have watched people walk toward things and away from things.');
  H('I have described it all with the appropriate distance.');
  blank();
  H('This one was different.');
  blank();
  H('I don\'t think I was supposed to get fond of her.');
  H('That wasn\'t in the brief.');
  blank();
  H('But there it is.');
  blank();
  H('Athena chose well. She usually does.');
  blank();
  H('Hazel.');
  blank();
  H('It was an honour to walk beside your story.');
  blank();
  H('I\'ll see myself out.');
  blank();
  cont(final_words);
}

function final_words(){
  blank();
  addLine('hazel > i love you.','hazel',400);
  addLine('isabelle > i love you.','isabelle',400);
  blank();
  cont(credits);
}

// ═══════════════════════════════════════════════════════════
// CREDITS
// ═══════════════════════════════════════════════════════════
function credits(){
  clearScreen(()=>{
    lineQueue=[]; isTyping=false;
    blank();
    addLine('╔══════════════════════════════════════════╗','art',220);
    addLine('║       S O M E O N E   L I K E   Y O U   ║','art',220);
    addLine('╠══════════════════════════════════════════╣','art',220);
    addLine('║   I.    THE WRONG CAVE                   ║','credits',140);
    addLine('║   II.   THE ROAD HOME                    ║','credits',140);
    addLine('║   III.  FOR YOU                          ║','credits',140);
    addLine('╚══════════════════════════════════════════╝','art',220);
    divider();
    blank();
    addLine('[ PRESS ENTER TO CONTINUE ]','prompt',220);
    askChoice([''],(_)=>clearAndRun(credits_hazel));
  });
}

function credits_hazel(){
  lineQueue=[]; isTyping=false;
  blank();
  addLine('hazel > ...can i ask you something?','hazel',300);
  blank();
  addLine('[ the terminal is quiet. she\'s never spoken to you directly before. ]','system',400);
  blank();
  addLine('hazel > how did you make this?','hazel',500);
  blank();
  cont(credits_rhys1);
}

function credits_rhys1(){
  rhys('honestly? the first game was a school project.');
  rhys('i wasn\'t really thinking about it. just made something for a grade and moved on.');
  blank();
  addLine('hazel > and then?','hazel',200);
  blank();
  rhys('then i built nova. and the arcade.');
  rhys('and i looked at what i\'d made and thought —');
  rhys('this would be perfect for it.');
  rhys('so i put it in. and then i thought about a sequel.');
  rhys('and then the sequel became a trilogy.');
  rhys('and then we got here.');
  blank();
  addLine('hazel > ...here.','hazel',200);
  blank();
  rhys('here.');
  cont(credits_rhys2);
}

function credits_rhys2(){
  addLine('hazel > what about me?','hazel',200);
  addLine('hazel > where did i come from?','hazel',200);
  blank();
  rhys('you came from me. mostly.');
  rhys('a lot of the little details — they link back to me in ways people probably didn\'t notice.');
  blank();
  addLine('hazel > like what?','hazel',200);
  blank();
  rhys('like mishka.');
  blank();
  addLine('[ a pause. ]','system',400);
  blank();
  rhys('mishka was my grandparents\' cat.');
  rhys('i adored her.');
  rhys('when she passed away there was a void in my heart that never really filled.');
  rhys('so i put her in the game.');
  rhys('so she gets to live here.');
  blank();
  addLine('hazel > ...','hazel',200);
  addLine('hazel > i\'m glad she\'s here.','hazel',300);
  blank();
  rhys('me too.');
  cont(credits_rhys3);
}

function credits_rhys3(){
  addLine('hazel > the greek mythology.','hazel',200);
  blank();
  rhys('that\'s mine too. completely.');
  rhys('i\'m always reading percy jackson.');
  rhys('i like to believe those stories are real.');
  rhys('that hermes is actually out there somewhere.');
  rhys('that athena noticed.');
  blank();
  addLine('hazel > ...i think she did.','hazel',300);
  blank();
  rhys('yeah. i think so too.');
  cont(credits_rhys4);
}

function credits_rhys4(){
  addLine('hazel > and athena. the pc.','hazel',200);
  blank();
  rhys('i named my pc athena.');
  rhys('in real life. actually named it that.');
  rhys('so when i gave it to you it felt right.');
  rhys('like i was giving you something that was mine.');
  blank();
  addLine('hazel > she\'s a good pc.','hazel',200);
  blank();
  rhys('she really is.');
  cont(credits_rhys5);
}

function credits_rhys5(){
  addLine('hazel > ...there\'s something else.','hazel',200);
  addLine('hazel > isn\'t there.','hazel',200);
  blank();
  addLine('[ she knows. of course she knows. she\'s you. ]','system',400);
  blank();
  rhys('yeah.');
  rhys('this part i don\'t usually talk about.');
  blank();
  addLine('hazel > you don\'t have to.','hazel',200);
  blank();
  rhys('i know.');
  rhys('i want to.');
  blank();
  addLine('[ a breath. ]','system',400);
  blank();
  rhys('i\'m 13. not 21.');
  rhys('but i\'m trans.');
  rhys('i haven\'t come out yet.');
  blank();
  rhys('and when i do —');
  rhys('my name is going to be hazel.');
  blank();
  addLine('[ silence. ]','system',600);
  blank();
  rhys('so to any of my friends who played this and didn\'t know —');
  blank();
  rhys('SURPRISE!!!');
  blank();
  cont(credits_rhys6);
}

function credits_rhys6(){
  addLine('hazel > ...','hazel',200);
  addLine('hazel > that\'s why i felt real.','hazel',300);
  blank();
  rhys('yeah.');
  rhys('because you are.');
  blank();
  addLine('hazel > the fear of never being accepted.','hazel',200);
  addLine('hazel > always being known as one thing.','hazel',200);
  addLine('hazel > good things not lasting.','hazel',200);
  blank();
  rhys('all mine.');
  rhys('i gave them to you so i didn\'t have to carry them alone.');
  blank();
  addLine('hazel > ...you\'re not alone.','hazel',300);
  addLine('hazel > you know that right?','hazel',300);
  blank();
  rhys('i\'m starting to.');
  cont(credits_rhys7);
}

function credits_rhys7(){
  addLine('hazel > isabelle is real too.','hazel',200);
  blank();
  rhys('yeah. she\'s my friend.');
  rhys('i love her like a sibling.');
  rhys('the feelings in the game — that was just a detail i wanted to add. for the story.');
  rhys('she\'s just isabelle. and that\'s everything.');
  blank();
  addLine('hazel > she sounds like a good one.','hazel',200);
  blank();
  rhys('the best.');
  cont(credits_rhys8);
}

function credits_rhys8(){
  addLine('hazel > ...thank you.','hazel',300);
  addLine('hazel > for making me.','hazel',300);
  addLine('hazel > for giving me athena and mishka and isabelle and the cave and hermes and the letter.','hazel',300);
  addLine('hazel > for letting me say the things you couldn\'t yet.','hazel',300);
  addLine('hazel > for giving me the happy ending.','hazel',300);
  blank();
  addLine('[ you don\'t answer for a moment. ]','system',600);
  blank();
  rhys('it was always yours.');
  blank();
  cont(credits_final);
}

function credits_final(){
  clearScreen(()=>{
    lineQueue=[]; isTyping=false;
    blank();
    blank();
    addLine('  ─────────────────────────────────────────','divider',300);
    addLine('  not for someone like you.','credits',500);
    addLine('  for you.','credits',700);
    addLine('  ─────────────────────────────────────────','divider',900);
    blank();
    setTimeout(()=>{
      blank();
      addLine('╔══════════════════════════════════════════╗','art',300);
      addLine('║                                          ║','art',100);
      addLine('║      thank you for playing.              ║','credits',200);
      addLine('║                                          ║','art',100);
      addLine('║      this game was made with love        ║','credits',200);
      addLine('║      and a lot of late nights            ║','credits',200);
      addLine('║      and one real cat named mishka       ║','credits',200);
      addLine('║      and a pc named athena               ║','credits',200);
      addLine('║      and a name i\'m still growing        ║','credits',200);
      addLine('║      into.                               ║','credits',200);
      addLine('║                                          ║','art',100);
      addLine('║      if you\'re carrying something        ║','credits',300);
      addLine('║      you haven\'t said yet —              ║','credits',200);
      addLine('║      i hope you find your cave.          ║','credits',200);
      addLine('║      i hope it was waiting for you.      ║','credits',200);
      addLine('║                                          ║','art',100);
      addLine('║                      — Rhys / Hazel      ║','credits',300);
      addLine('║                                          ║','art',100);
      addLine('╚══════════════════════════════════════════╝','art',200);
      blank();
      addLine('[ PRESS ENTER ]','prompt',600);
      askChoice([''],(_)=>clearAndRun(playAgain));
    },1500);
  });
}

// ═══════════════════════════════════════════════════════════
// PLAY AGAIN
// ═══════════════════════════════════════════════════════════
function playAgain(){
  currentNarrator='narrator';
  if(achievements.length){
    addLine('╔─── ACHIEVEMENTS THIS RUN ───╗','art',220);
    achievements.forEach(a=>addLine(`  ★ ${a.name} (${a.rarity})`,'achievement',100));
    addLine('╚────────────────────────────╝','art',220);
    divider();
  }
  N('Play again?');
  addLine('Options: yes / no','prompt',220);
  askChoice(['yes','no'],(c)=>{
    if(c==='yes'){
      achievements=[];hermesRevealed=false;threeQuestions=[];
      isabelleCame=false;currentNarrator='narrator';invalidCount=0;
      updateAchievementPanel();
      clearAndRun(boot);
    } else {
      N('...');
      N('The cave will be there.');
      N('Whenever you need it.');
      blank();
      addLine('~ SOMEONE LIKE YOU — COMPLETE ~','end',300);
      inputField.disabled=true;
    }
  });
}

// ═══════════════════════════════════════════════════════════
// ACHIEVEMENT PANEL
// ═══════════════════════════════════════════════════════════
function updateAchievementPanel(){
  const all=loadAch();
  achCount.textContent=`ACHIEVEMENTS: ${all.length} / 35`;
}
achCount.addEventListener('click',showAchievementPanel);

function showAchievementPanel(){
  const all=loadAch();
  const ex=document.getElementById('_achPanel'); if(ex)ex.remove();
  const panel=document.createElement('div');
  panel.id='_achPanel';
  panel.style.cssText='position:fixed;inset:0;background:rgba(0,0,0,.92);z-index:9999;display:flex;align-items:center;justify-content:center;font-family:"Share Tech Mono",monospace;color:#00ff41;';
  const RC={common:'#aaa',rare:'#58a6ff',secret:'#f0f',legendary:'#f80',mythic:'#ff0',epic:'#a855f7'};
  const ALL=[
    {n:'Told Her About The Letter',r:'rare'},
    {n:'Told Piper',r:'rare'},
    {n:'Piper\'s Advice',r:'common'},
    {n:'Eli\'s Recognition',r:'rare'},
    {n:'Because It\'s Mine',r:'epic'},
    {n:'Still Looking',r:'epic'},
    {n:'Same Look',r:'rare'},
    {n:'May\'s Truth',r:'rare'},
    {n:'Just For A Moment',r:'secret'},
    {n:'Good Question (Again)',r:'secret'},
    {n:'Saw Herself',r:'legendary'},
    {n:'You Already Knew',r:'mythic'},
    {n:'The Coin\'s Purpose',r:'secret'},
    {n:'Carried Herself',r:'epic'},
    {n:'Why Me',r:'rare'},
    {n:'Athena Noticed',r:'legendary'},
    {n:'Always With The Story',r:'secret'},
    {n:'Not In The Brief',r:'epic'},
    {n:'Said It',r:'mythic'},
    {n:'Said It (Home)',r:'mythic'},
    {n:'Tested Hermes',r:'rare'},
    {n:'Told Piper',r:'rare'},
  ];
  const un=new Set(all.map(a=>a.name));
  const rows=ALL.map(a=>{
    const u=un.has(a.n), c=u?(RC[a.r]||'#aaa'):'#333';
    return`<div style="display:flex;align-items:center;gap:10px;padding:4px 0;border-bottom:1px solid #0a0a0a">
      <span style="color:${c};font-size:14px;width:16px">${u?'★':'○'}</span>
      <span style="color:${u?c:'#333'};font-size:11px;flex:1">${u?a.n:'???'}</span>
      <span style="color:${c};font-size:9px;text-transform:uppercase">${u?a.r:''}</span>
    </div>`;
  }).join('');
  panel.innerHTML=`<div style="max-width:520px;width:92%;max-height:90vh;overflow-y:auto;padding:24px;border:1px solid #00a82a;background:#0a0a0a">
    <div style="font-size:14px;letter-spacing:3px;color:#00a82a;margin-bottom:4px;font-family:'VT323',monospace">ACHIEVEMENT LOG</div>
    <div style="font-size:11px;color:#005514;margin-bottom:16px">${all.length} / ${ALL.length} UNLOCKED</div>
    <div>${rows}</div>
    <div style="display:flex;justify-content:space-between;align-items:center;margin-top:16px;padding-top:12px;border-top:1px solid #111">
      <button onclick="if(confirm('Reset?')){localStorage.removeItem('${SAVE_KEY}');document.getElementById('_achPanel').remove();updateAchievementPanel();}" style="background:none;border:1px solid #333;color:#555;font-family:inherit;font-size:10px;padding:4px 10px;cursor:pointer">RESET</button>
      <button onclick="document.getElementById('_achPanel').remove()" style="background:none;border:1px solid #00a82a;color:#00ff41;font-family:inherit;font-size:11px;padding:6px 16px;cursor:pointer;letter-spacing:1px">CLOSE</button>
    </div>
  </div>`;
  document.body.appendChild(panel);
}

// ═══════════════════════════════════════════════════════════
// INPUT
// ═══════════════════════════════════════════════════════════
inputField.addEventListener('keydown',e=>{
  if(e.key==='Enter'&&inputCallback){
    const val=inputField.value.trim().toLowerCase();
    inputField.value='';
    const cb=inputCallback; inputCallback=null;
    if(val) addLine('hazel > '+val,'hazel',0);
    cb(val);
  }
});

document.addEventListener('click',()=>inputField.focus());
updateAchievementPanel();
inputField.focus();
boot();
