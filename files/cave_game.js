// ═══════════════════════════════════════════════════════════
// CAVE ADVENTURE v2.0 — ENGINE
// ═══════════════════════════════════════════════════════════
const output     = document.getElementById('output');
const inputField = document.getElementById('inputField');
const achCount   = document.getElementById('achCount');
const titleArtEl = document.getElementById('titleArt');

titleArtEl.textContent =
`  ██████╗ █████╗ ██╗   ██╗███████╗     █████╗ ██████╗ ██╗   ██╗███████╗███╗   ██╗████████╗██╗   ██╗██████╗ ███████╗
 ██╔════╝██╔══██╗██║   ██║██╔════╝    ██╔══██╗██╔══██╗██║   ██║██╔════╝████╗  ██║╚══██╔══╝██║   ██║██╔══██╗██╔════╝
 ██║     ███████║██║   ██║█████╗      ███████║██║  ██║██║   ██║█████╗  ██╔██╗ ██║   ██║   ██║   ██║██████╔╝█████╗
 ██║     ██╔══██║╚██╗ ██╔╝██╔══╝      ██╔══██║██║  ██║╚██╗ ██╔╝██╔══╝  ██║╚██╗██║   ██║   ██║   ██║██╔══██╗██╔══╝
 ╚██████╗██║  ██║ ╚████╔╝ ███████╗    ██║  ██║██████╔╝ ╚████╔╝ ███████╗██║ ╚████║   ██║   ╚██████╔╝██║  ██║███████╗
  ╚═════╝╚═╝  ╚═╝  ╚═══╝  ╚══════╝    ╚═╝  ╚═╝╚═════╝   ╚═══╝  ╚══════╝╚═╝  ╚═══╝   ╚═╝    ╚═════╝ ╚═╝  ╚═╝╚══════╝`;

const SAVE_KEY = 'novaCaveAchievements';
function loadSaved(){ try{return JSON.parse(localStorage.getItem(SAVE_KEY)||'[]');}catch(_){return[];} }

let lineQueue=[], isTyping=false, inputCallback=null, invalidCount=0;
let currentNarrator='default', achievements=[];

// ── NARRATOR STYLES ───────────────────────────────────────
const NS = {
  default: { cls:'narrator', invalid:["That is not a valid choice, traveller.","I don't recognise that path.","The cave offers no such route."] },
  professor: { cls:'professor', invalid:["That response does not correspond to any listed variable.","I am afraid that input falls outside the acceptable parameter set.","Your selection is, academically speaking, incorrect."] },
  rhys: { cls:'rhys', invalid:["nah that's not one of the options lol","bro that's not a thing","try again mate, that's not right"] },
  ghost: { cls:'ghost', invalid:["...that word means nothing to me...","...I cannot feel that path...","...you must choose from what is offered..."] },
  robot: { cls:'robot', invalid:["INPUT NOT RECOGNISED. VALID OPTIONS REQUIRED.","ERROR: CHOICE OUTSIDE PERMITTED RANGE.","QUERY INVALID. PLEASE RESUBMIT."] },
  bard: { cls:'bard', invalid:["Alas, no verse was written for that reply.","The songbook holds no such note, friend.","That choice falls outside the ballad's scope."] },
};

function narratorSay(line){ addLine(line,(NS[currentNarrator]||NS.default).cls,140); }

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
function divider(){addLine('─'.repeat(60),'divider',80);}
function artPrint(t){addLine(t,'art',20);}

function unlockAchievement(name,rarity){
  achievements.push({name,rarity});
  const all=loadSaved();
  if(!all.find(a=>a.name===name)){all.push({name,rarity,unlockedAt:Date.now()});localStorage.setItem(SAVE_KEY,JSON.stringify(all));}
  updateAchievementPanel();
  addLine(`[+ ACHIEVEMENT: ${name.toUpperCase()} (${rarity.toUpperCase()}) +]`,'achievement',180);
}

function askChoice(validKeys,cb){
  const valid=new Set(validKeys); valid.add('credits');
  inputCallback=(val)=>{
    if(val===''&&validKeys.includes('')){clearAndRun(()=>cb(''));return;}
    if(val==='credits'){clearAndRun(showCredits);return;}
    if(val==='hello there'){addLine('General Kenobi.','system',0);setTimeout(()=>askChoice(validKeys,cb),500);return;}
    if(valid.has(val)){invalidCount=0;setTimeout(()=>clearAndRun(()=>cb(val)),300);}
    else{
      invalidCount++;
      if(invalidCount>=3){invalidCount=0;setTimeout(()=>clearAndRun(narratorMeltdown),300);}
      else{
        const inv=(NS[currentNarrator]||NS.default).invalid;
        addLine(inv[Math.floor(Math.random()*inv.length)],'system',0);
        setTimeout(()=>askChoice(validKeys,cb),400);
      }
    }
  };
}
function clearAndRun(fn){clearScreen(()=>{lineQueue=[];isTyping=false;fn();});}
function end(win=true){
  addLine('','system');
  addLine(win?'~ THE END ~':'xx GAME OVER xx',win?'end':'gameover',220);
  divider(); addLine('','system');
  addLine('[ PRESS ENTER TO CONTINUE ]','prompt',220);
  askChoice([''],(_)=>clearAndRun(playAgain));
}

// ═══════════════════════════════════════════════════════════
// ASCII ART
// ═══════════════════════════════════════════════════════════
const CAVE_ART=`
        .     .       .  .   . .   .   . .    +  .
    .     .  :     .    .. :. .___---------___.
         .  .   .    .  :.:. _".^ .^ ^.  '.. :"-_. .
      .  :       .  .  .:..:                . .^:  :. .:. 
   .  .  .. :  -::::. ^- .^    ".. .  . .\\
  .    .:  .     :.::        .: .\\`;

const CROSSROADS_ART=`
         N
         |
    W ---+--- E
         |
         S`;

const CRYSTAL_ART=`
      *
     /|\\
    * | *
   /|\\|/|\\
  * -*-*-* *
   \\|/|\\|/
    * | *
     \\|/
      *`;

const CROWN_ART=`
   /\\  /\\  /\\
  /  \\/  \\/  \\
 |  CROWN OF  |
 |   K I N G  |`;

// ═══════════════════════════════════════════════════════════
// GAME START
// ═══════════════════════════════════════════════════════════
function playGame(){
  artPrint(CAVE_ART); divider();

  if(currentNarrator==='professor'){
    narratorSay("Good day. I am Emeritus Professor of Narrative Studies, your replacement narrator.");
    narratorSay("I shall maintain academic rigour throughout. Kindly do not embarrass us both.");
  } else if(currentNarrator==='rhys'){
    narratorSay("hey, welcome back — i'll take it from here");
    narratorSay("same cave, but there's way more to find now");
  } else if(currentNarrator==='ghost'){
    narratorSay("...you have returned...");
    narratorSay("...the cave remembers you...");
    narratorSay("...choose carefully this time...");
  } else if(currentNarrator==='robot'){
    narratorSay("NARRATOR UNIT-7 ONLINE. ADVENTURE PROTOCOL ACTIVE. AWAITING INPUT.");
  } else if(currentNarrator==='bard'){
    narratorSay("Gather round! A tale awaits thee — of caverns and choices, glory and folly!");
    narratorSay("What say you, brave wanderer? Shall the song begin?");
  } else {
    narratorSay("Welcome, traveller. I have a tale to tell...");
    narratorSay("Four paths. Each hides something different. Some say typing 'credits' reveals secrets.");
  }

  narratorSay("Shall we begin?");
  addLine("Options: yes / no",'prompt',220);
  askChoice(['yes','no'],(c)=>{
    if(c==='yes'){narratorSay("Then let us proceed.");setTimeout(()=>clearAndRun(crossroads),600);}
    else{unlockAchievement("Refused the Quest","rare");narratorSay("You turn away. Some stories are never told.");end();}
  });
}

// ── CROSSROADS ───────────────────────────────────────────
function crossroads(){
  artPrint(CROSSROADS_ART); divider();
  if(currentNarrator==='professor'){
    narratorSay("A junction of four passages. Each presents a distinct narrative trajectory.");
    narratorSay("The eastern passage has, statistically speaking, the most content.");
  } else if(currentNarrator==='rhys'){
    narratorSay("ok four ways to go. west has the most stuff but it's your call");
  } else if(currentNarrator==='ghost'){
    narratorSay("...four paths...");
    narratorSay("...one leads to me...");
  } else if(currentNarrator==='robot'){
    narratorSay("JUNCTION DETECTED. NORTH: LOW REWARD. EAST/WEST: HIGHER COMPLEXITY.");
  } else if(currentNarrator==='bard'){
    narratorSay("A crossroads! The classic nexus of fate! North south east or west — which verse?");
  } else {
    narratorSay("You stand at a crossroads deep within the cave.");
    narratorSay("Four paths stretch before you into darkness.");
  }
  addLine("Options: north / south / east / west",'prompt',220);
  askChoice(['north','south','east','west'],(c)=>{
    if(c==='north')clearAndRun(northWing);
    else if(c==='south')clearAndRun(southChamber);
    else if(c==='east')clearAndRun(crystalCavern);
    else clearAndRun(westRoom);
  });
}

// ═══════════════════════════════════════════════════════════
// NORTH WING
// ═══════════════════════════════════════════════════════════
function northWing(){
  artPrint(`
   /‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾\\
  /   NORTH WING    \\
 /  cold. silent.   \\
/___________________\\`);
  divider();
  narratorSay("The northern passage is cold. Your breath mists in the dark.");
  narratorSay("Three things catch your eye: a mirror, a locked door, and a staircase going down.");
  addLine("Options: mirror / door / stairs",'prompt',220);
  askChoice(['mirror','door','stairs'],(c)=>{
    if(c==='mirror')clearAndRun(mirrorRoom);
    else if(c==='door')clearAndRun(lockedDoor);
    else clearAndRun(deepStairs);
  });
}

function mirrorRoom(){
  artPrint(`
 ___________
|           |
|  [  YOU  ]|
|___________|`);
  divider();
  narratorSay("You stand before the mirror. Your reflection stares back.");
  narratorSay("Then — it moves when you don't.");
  addLine("Options: speak / smash / run",'prompt',220);
  askChoice(['speak','smash','run'],(c)=>{
    if(c==='speak'){
      unlockAchievement("Mirror Dialogue","rare");
      narratorSay("\"Who are you?\" you ask.");
      narratorSay("The reflection smiles. \"I am the version of you that always makes the right choice.\"");
      narratorSay("\"Then why are you in there?\"");
      narratorSay("It stops smiling.");
      narratorSay("The mirror cracks. A door opens behind it. You step through into light.");
      end();
    } else if(c==='smash'){
      unlockAchievement("Seven Years Bad Luck","common");
      narratorSay("You smash the mirror. Seven shards scatter.");
      narratorSay("Each shard reflects a different face. None of them are yours.");
      end(false);
    } else {
      narratorSay("You run. The cave echoes behind you. You never look back.");
      setTimeout(()=>clearAndRun(northWing),800);
    }
  });
}

function lockedDoor(){
  artPrint(`
  ___________
 |  _______  |
 | |       | |
 | |  DOOR | |
 | |_______| |
 |___________|`);
  divider();
  narratorSay("A heavy door. No handle. No keyhole.");
  narratorSay("Carved above it: 'KNOCK, AND IT SHALL OPEN. OR NOT.'");
  addLine("Options: knock / leave",'prompt',220);
  askChoice(['knock','leave'],(c)=>{
    if(c==='knock'){
      unlockAchievement("The Door That Answers","secret");
      narratorSay("You knock. A long silence.");
      narratorSay("Then from behind the door: 'Who is it?'");
      narratorSay("You tell it your name. Another silence.");
      narratorSay("'I don't know anyone by that name.'");
      narratorSay("The door does not open. You eventually leave.");
      end();
    } else {
      narratorSay("You leave the door alone. Perhaps that was wise.");
      setTimeout(()=>clearAndRun(northWing),700);
    }
  });
}

function deepStairs(){
  artPrint(`
   |   |
   | ↓ |
   |   |
   | ↓ |
   |____|`);
  divider();
  narratorSay("The staircase descends into total darkness. You count: ten, twenty, fifty, one hundred steps.");
  narratorSay("A vast underground chamber. Three things loom before you.");
  narratorSay("A forge. A garden of glowing mushrooms. A sleeping giant.");
  addLine("Options: forge / garden / giant",'prompt',220);
  askChoice(['forge','garden','giant'],(c)=>{
    if(c==='forge')clearAndRun(forgeRoom);
    else if(c==='garden')clearAndRun(mushroomGarden);
    else clearAndRun(sleepingGiant);
  });
}

function forgeRoom(){
  artPrint(`
    ___
   /   \\
  | [*] |
  |_____|
 /|FORGE|\\`);
  divider();
  unlockAchievement("The Forge Below","rare");
  narratorSay("An ancient forge, still burning. On the anvil: a half-finished weapon and a half-finished key.");
  addLine("Options: take weapon / take key / leave both",'prompt',220);
  askChoice(['take weapon','take key','leave both'],(c)=>{
    if(c==='take weapon'){
      narratorSay("You take the weapon. Heavy and warm from the forge.");
      narratorSay("The forge extinguishes behind you as you leave. Something was waiting for you to choose.");
      end();
    } else if(c==='take key'){
      unlockAchievement("The Unfinished Key","secret");
      narratorSay("You take the key. It fits no lock you have seen.");
      narratorSay("Some things need to be carried before they can be used.");
      clearAndRun(deepStairs);
    } else {
      narratorSay("You leave both. The forge burns on. Some choices are wiser for their absence.");
      end();
    }
  });
}

function mushroomGarden(){
  artPrint(`
  *  .  *  .  *
 .  (*)  .  (*)
  * [GARDEN] *
 .  (*)  .  (*)
  *  .  *  .  *`);
  divider();
  unlockAchievement("Garden Below the Stone","rare");
  narratorSay("Hundreds of glowing mushrooms — each a different colour. A small sign: 'DO NOT EAT THE BLUE ONES.'");
  addLine("Options: eat blue / eat other / just look",'prompt',220);
  askChoice(['eat blue','eat other','just look'],(c)=>{
    if(c==='eat blue'){
      unlockAchievement("Ate the Blue One","legendary");
      narratorSay("You eat the blue mushroom.");
      narratorSay("...the cave turns purple.");
      narratorSay("...the walls start breathing.");
      narratorSay("You emerge from the cave fundamentally changed. You tell no one.");
      end();
    } else if(c==='eat other'){
      narratorSay("A green one. Tastes like mint and old stone. Nothing happens. You feel slightly full.");
      end();
    } else {
      unlockAchievement("Restraint","secret");
      narratorSay("You just look. The garden glows softly. It's beautiful. Some places deserve to be appreciated.");
      end();
    }
  });
}

function sleepingGiant(){
  artPrint(`
   _______
  /  z z  \\
 | Z  Z Z  |
  \\________/
  [  GIANT  ]`);
  divider();
  narratorSay("A giant, curled on the cave floor, snoring with the slow rhythm of mountains.");
  addLine("Options: wake / sneak past / leave",'prompt',220);
  askChoice(['wake','sneak past','leave'],(c)=>{
    if(c==='wake'){
      unlockAchievement("Giant Conversation","secret");
      narratorSay("You wake the giant. It opens one eye the size of a carriage wheel.");
      narratorSay("'Oh. It's been a long time since someone woke me.'");
      narratorSay("'How long?' — 'Longer than your name will last.' Then it closes its eye again.");
      narratorSay("You stand there. It snores. You weren't sure what you expected.");
      end();
    } else if(c==='sneak past'){
      narratorSay("Step. Pause. Step. Pause. You make it to the far wall.");
      narratorSay("There's nothing there. You tiptoe back. The giant snores on.");
      narratorSay("A journey for nothing. But you did it perfectly.");
      end();
    } else {
      narratorSay("You leave the giant to its sleep. Some things are best left undisturbed.");
      setTimeout(()=>clearAndRun(deepStairs),700);
    }
  });
}

// ═══════════════════════════════════════════════════════════
// SOUTH CHAMBER
// ═══════════════════════════════════════════════════════════
let southRefusals=0;
function southChamber(){
  artPrint(`
     ___________
    |           |
    |  [BUTTON] |
    |___________|`);
  divider();
  if(currentNarrator==='professor'){
    narratorSay("The southern chamber presents a single interactive element: a button.");
    narratorSay("The recommended course of action is to depress the mechanism and observe the outcome.");
    narratorSay("This is not a complex decision.");
  } else if(currentNarrator==='rhys'){
    narratorSay("south chamber. there's a button.");
    narratorSay("yeah i know. just press it");
  } else if(currentNarrator==='ghost'){
    narratorSay("...the button...");
    narratorSay("...I pressed it once...");
    narratorSay("...I won't say what happened...");
  } else if(currentNarrator==='robot'){
    narratorSay("BUTTON DETECTED. FUNCTION: UNKNOWN. RISK: MODERATE. RECOMMENDATION: ENGAGE.");
  } else if(currentNarrator==='bard'){
    narratorSay("A button! Alone in the chamber! What drama awaits the curious finger?");
  } else {
    narratorSay("You enter the southern chamber. A single button gleams in the torchlight.");
  }
  southRefusals=0; southPrompt();
}

function southPrompt(){
  narratorSay("Press the button?");
  addLine("Options: yes / no",'prompt',220);
  askChoice(['yes','no'],(c)=>{
    if(c==='yes'){clearAndRun(southButtonPressed);return;}
    southRefusals++;
    if(southRefusals>=10){clearAndRun(annoyingEnding);return;}
    if(currentNarrator==='professor')narratorSay(`Refusal number ${southRefusals}. I note this with increasing academic disappointment.`);
    else if(currentNarrator==='rhys')narratorSay(`mate just press it (refusal ${southRefusals})`);
    else if(currentNarrator==='robot')narratorSay(`REFUSAL LOGGED: ${southRefusals}. COMPLIANCE EXPECTED.`);
    else if(currentNarrator==='bard')narratorSay(`The button waits! The audience grows restless! (refusal ${southRefusals})`);
    else narratorSay(`Refusal ${southRefusals}. The button waits patiently.`);
    askChoice(['yes','no'],(c2)=>{
      if(c2==='yes'){clearAndRun(southButtonPressed);return;}
      southRefusals++;
      if(southRefusals>=10){clearAndRun(annoyingEnding);return;}
      clearAndRun(()=>{
        artPrint(`
     ___________
    |           |
    |  [BUTTON] |
    |___________|`);
        divider();
        narratorSay(`Refusal ${southRefusals}. The button still waits.`);
        southPrompt();
      });
    });
  });
}

function southButtonPressed(){
  narratorSay("You press the button. A deep mechanical clunk echoes through the cave.");
  narratorSay("A door opens in the south wall. Inside: a staircase going up.");
  addLine("Options: go up / ignore it",'prompt',220);
  askChoice(['go up','ignore it'],(c)=>{
    if(c==='go up')clearAndRun(buttonTower);
    else{
      unlockAchievement("Scrooge McDuck Ending","secret");
      narratorSay("You ignore the door. The floor collapses instead.");
      narratorSay("You fall into a mountain of gold coins, swimming through riches like a cartoon duck.");
      end();
    }
  });
}

function buttonTower(){
  unlockAchievement("Above the Cave","rare");
  artPrint(`
    |XII|
   /     \\
  |  XII  |
  |  6    |
   \\_____/
     |||`);
  divider();
  narratorSay("You emerge at the top of a stone tower inside the mountain.");
  narratorSay("The entire cave system is laid out below you like a map.");
  narratorSay("Every path. Every chamber. Every choice you've made marked by a faint glow.");
  narratorSay("And one unmarked path — one you've never taken.");
  addLine("Options: take it / go back",'prompt',220);
  askChoice(['take it','go back'],(c)=>{
    if(c==='take it')clearAndRun(hiddenPath);
    else{narratorSay("You climb back down. The tower watches you go.");setTimeout(()=>clearAndRun(southChamber),700);}
  });
}

function hiddenPath(){
  unlockAchievement("The Unmarked Path","legendary");
  artPrint(`
  ?  ?  ?  ?  ?  ?
   ?  ?  ?  ?  ?
  ?  ?  ?  ?  ?  ?`);
  divider();
  narratorSay("The walls here are smooth. Not carved — grown.");
  narratorSay("At the end: a small room. A chair. On the chair: a letter.");
  narratorSay("It is addressed to you. By name.");
  addLine("Options: read it / burn it / leave it",'prompt',220);
  askChoice(['read it','burn it','leave it'],(c)=>{
    if(c==='read it'){
      unlockAchievement("The Letter","mythic");
      narratorSay("You read it.");
      narratorSay("...");
      narratorSay("You fold it carefully and put it in your pocket.");
      narratorSay("You tell no one what it said. But from this point on, you walk differently.");
      end();
    } else if(c==='burn it'){
      unlockAchievement("Burned Unopened","secret");
      narratorSay("You burn it without reading it. The smoke spells something in the air.");
      narratorSay("You don't look. Some things are better not known.");
      end();
    } else {
      narratorSay("You leave the letter on the chair. Maybe someone else will read it.");
      end();
    }
  });
}

function annoyingEnding(){
  unlockAchievement("Annoying Ending","rare");
  if(currentNarrator==='professor')narratorSay("Ten refusals. I have documented this thoroughly. I am pressing it myself.");
  else if(currentNarrator==='rhys')narratorSay("ok fine, i'm pressing it for you");
  else if(currentNarrator==='robot')narratorSay("TOLERANCE THRESHOLD REACHED. INITIATING BUTTON PRESS ON BEHALF OF USER.");
  else narratorSay("Ten refusals? Fine. I will press it for you.");
  narratorSay("The floor collapses. You fall into gold. Same as if you'd pressed it.");
  end();
}

// ═══════════════════════════════════════════════════════════
// WEST ROOM — 10 buttons
// ═══════════════════════════════════════════════════════════
function westRoom(){
  artPrint(`
   [1][2][3][4][5]
   [6][7][8][9][10]`);
  divider();
  narratorSay("The western chamber. Ten buttons, each glowing faintly.");
  if(currentNarrator==='professor')narratorSay("I advise against button seven. Empirically speaking, poor outcomes.");
  else if(currentNarrator==='rhys')narratorSay("ten buttons. not telling you which one. that's the whole point");
  else if(currentNarrator==='robot')narratorSay("TEN INPUTS. EACH YIELDS UNIQUE OUTPUT. CHOOSE METHODICALLY.");
  else if(currentNarrator==='bard')narratorSay("Ten buttons! Ten verses! Ten songs the cave might sing!");
  addLine("Options: 1 / 2 / 3 / 4 / 5 / 6 / 7 / 8 / 9 / 10",'prompt',220);
  askChoice(['1','2','3','4','5','6','7','8','9','10'],(c)=>{
    const m={'1':wb1,'2':wb2,'3':wb3,'4':wb4,'5':wb5,'6':wb6,'7':wb7,'8':wb8,'9':wb9,'10':wb10};
    clearAndRun(m[c]);
  });
}

function wb1(){
  unlockAchievement("Developer Ending","secret");
  artPrint(`
   > ACCESSING DEVELOPER VOID...
   > LOADING backstage.exe...
   > ERROR: YOU WERE NOT MEANT TO BE HERE`);
  divider();
  narratorSay("The floor vanishes. You fall into the developer void.");
  narratorSay("Wires, scripts, half-finished jokes. The backstage of the game.");
  narratorSay("Curiosity does not kill the cat. It just makes it unpaid QA.");
  end();
}

function wb2(){
  unlockAchievement("Spell Library Found","rare");
  artPrint(`
 .---------. .---------. .---------.
 | TOME I  | | TOME II | |TOME III |
 '---------' '---------' '---------'`);
  divider();
  narratorSay("A library of forgotten spells. Dusty tomes whisper of power long abandoned.");
  addLine("Options: read / take one / leave",'prompt',220);
  askChoice(['read','take one','leave'],(c)=>{
    if(c==='read'){
      unlockAchievement("Read the Forbidden Tome","secret");
      narratorSay("The words rearrange themselves as you read. You can't stop.");
      narratorSay("By the time you finish, the library is gone. You are somewhere else entirely.");
      end();
    } else if(c==='take one'){
      narratorSay("You tuck a tome under your arm. The library lets you. It knows you'll come back.");
      end();
    } else {
      narratorSay("Knowledge is treasure, but treasure can be poison.");
      end();
    }
  });
}

function wb3(){
  unlockAchievement("The Abyss Stares","rare");
  artPrint(`
  . . . . . . . . . . .
  .                   .
  .    A B Y S S      .
  .                   .
  . . . . . . . . . . .`);
  divider();
  narratorSay("A hole in the floor. Goes down forever. Or at least further than you can see.");
  addLine("Options: jump / throw something / leave",'prompt',220);
  askChoice(['jump','throw something','leave'],(c)=>{
    if(c==='jump'){
      unlockAchievement("Jumped In","legendary");
      narratorSay("You jump. You fall for a long time. Then longer.");
      narratorSay("You land softly. In a field of grass under an open sky.");
      narratorSay("The cave is gone. You have no idea where you are. You start walking.");
      end();
    } else if(c==='throw something'){
      narratorSay("You throw a stone. You listen for it to hit something. You listen for a long time.");
      narratorSay("Nothing. You walk away feeling slightly unsettled.");
      end();
    } else {
      narratorSay("You leave the abyss alone. It watches you go.");
      setTimeout(()=>clearAndRun(westRoom),700);
    }
  });
}

function wb4(){
  unlockAchievement("The Labyrinth","secret");
  artPrint(`
 _______________
|   _   _   _  |
|  | | | | | | |
|  | |_| |_| | |
|  |_________|  |
|_______________|`);
  divider();
  narratorSay("A miniature labyrinth carved into the floor. At its centre: a tiny glowing figure, moving slowly.");
  addLine("Options: guide it / leave it / destroy the walls",'prompt',220);
  askChoice(['guide it','leave it','destroy the walls'],(c)=>{
    if(c==='guide it'){
      unlockAchievement("Guided the Wanderer","epic");
      narratorSay("An hour passes. You guide the tiny figure through.");
      narratorSay("It reaches the centre. It looks up at you. Then it vanishes. A warm feeling remains.");
      end();
    } else if(c==='leave it'){
      narratorSay("You leave it to find its own way. Not every wanderer needs guidance.");
      end();
    } else {
      narratorSay("You smash the walls. The figure sits down in the rubble.");
      narratorSay("You feel briefly terrible about this.");
      end(false);
    }
  });
}

function wb5(){
  unlockAchievement("Slime Pit","rare");
  artPrint(`
    ~~~~~~~~~~~~~~~~~~~
    ~  S L I M E  ~~~~~
    ~~~~~~~~~~~~~~~~~~~`);
  divider();
  narratorSay("A trapdoor opens. You land in a pit of slime.");
  narratorSay("Sticky. Smelly. Slightly humiliating.");
  narratorSay("Heroes dream of glory. You'll be remembered as the gooey one.");
  end(false);
}

function wb6(){
  unlockAchievement("Gem of Eternity","secret");
  artPrint(CRYSTAL_ART);
  divider();
  narratorSay("A secret vault opens. Inside: a single glowing gem.");
  narratorSay("It hums with infinite power. You feel eternity press against your mind.");
  narratorSay("Too much. Far too much. Power is rarely kind. And never free.");
  end();
}

function wb7(){
  unlockAchievement("Snake Pit","rare");
  artPrint(`
    /\\/\\/\\/\\/\\/\\/\\/\\
    S N A K E S ! ! !
    \\/\\/\\/\\/\\/\\/\\/\\/`);
  divider();
  narratorSay("A trapdoor opens. Snakes. Why did it have to be snakes?");
  narratorSay("Even small dangers can end great stories.");
  end(false);
}

function wb8(){
  unlockAchievement("Banquet Ending","secret");
  artPrint(`
   |======================|
   | ROAST  |  WINE  | ... |
   |======================|`);
  divider();
  narratorSay("A hidden banquet hall. Roast pheasant, sugared fruits, goblets of wine.");
  narratorSay("You eat. And eat. And eat. Until the feast consumes you.");
  narratorSay("Hunger is eternal. And so is regret.");
  end();
}

function wb9(){
  unlockAchievement("Multiverse Ending","secret");
  artPrint(`
   [YOU] --- [YOU?] --- [YOU??]
      \\         |         /
       [YOU???]-+-[YOU!]`);
  divider();
  narratorSay("A portal opens. Infinite versions of yourself.");
  narratorSay("Some brave, some cowardly, some absurdly fashionable.");
  narratorSay("In the end, you are both everything... and nothing.");
  end();
}

function wb10(){ clearAndRun(royalVaultDepths); }

// ═══════════════════════════════════════════════════════════
// EAST — CRYSTAL CAVERN
// ═══════════════════════════════════════════════════════════
function crystalCavern(){
  artPrint(CRYSTAL_ART); divider();
  narratorSay("The eastern cavern. Crystals shimmer with eerie light.");
  narratorSay("Three paths branch before you. Something hums here — not a sound. A feeling.");
  addLine("Options: left / right / forward",'prompt',220);
  askChoice(['left','right','forward'],(c)=>{
    if(c==='left')clearAndRun(crystalChamber);
    else if(c==='right')clearAndRun(crystalRightWing);
    else clearAndRun(echoing_tunnels);
  });
}

function crystalChamber(){
  artPrint(CRYSTAL_ART); divider();
  narratorSay("A massive crystal pulses in the chamber, humming with power.");
  addLine("Options: touch / sing to it / resist",'prompt',220);
  askChoice(['touch','sing to it','resist'],(c)=>{
    if(c==='touch')clearAndRun(crystalPowerEnding);
    else if(c==='sing to it')clearAndRun(crystalSong);
    else clearAndRun(echoing_tunnels);
  });
}

function crystalPowerEnding(){
  unlockAchievement("Crystal Power","secret");
  narratorSay("You touch the crystal. Energy floods your veins with light.");
  narratorSay("For a moment, you feel infinite. Then the light consumes you.");
  end();
}

function crystalSong(){
  unlockAchievement("Crystal Resonance","epic");
  narratorSay("You sing to the crystal. It sings back — a note you've never heard before.");
  narratorSay("The cave shakes. The ceiling opens. Stars appear.");
  narratorSay("You don't know how long you stand there singing.");
  narratorSay("When you stop, the crystal is dark. And you are peaceful.");
  end();
}

function crystalRightWing(){
  artPrint(`
   ._____._____._____._____._____
   |  *  |  *  |  *  |  *  |  * |
   |_____|_____|_____|_____|_____|`);
  divider();
  narratorSay("A gallery of smaller crystals. Each contains a tiny frozen scene from a different story.");
  narratorSay("A battle. A wedding. A funeral. A child laughing. An old person alone.");
  narratorSay("One crystal contains a scene you recognise.");
  addLine("Options: take it / leave it / shatter it",'prompt',220);
  askChoice(['take it','leave it','shatter it'],(c)=>{
    if(c==='take it'){
      unlockAchievement("Kept the Memory","secret");
      narratorSay("Cold in your hand but warm against your chest. Some memories deserve to be carried.");
      end();
    } else if(c==='leave it'){
      narratorSay("You leave it. It glows a little brighter as you walk away.");
      end();
    } else {
      unlockAchievement("Shattered the Past","legendary");
      narratorSay("You shatter it. The scene dissolves. The memory is gone.");
      narratorSay("You feel lighter. Or emptier. You can't tell which.");
      end();
    }
  });
}

// ─── ECHOING TUNNELS ─────────────────────────────────────
function echoing_tunnels(){
  artPrint(`
   ))) ECHO ))) ECHO ))) ECHO )))
       ~~~ the tunnels sing ~~~`);
  divider();
  narratorSay("The echoing tunnels. You hear: a song, a whisper, and silence.");
  addLine("Options: song / whisper / silence",'prompt',220);
  askChoice(['song','whisper','silence'],(c)=>{
    if(c==='song')clearAndRun(concertOfShadows);
    else if(c==='whisper')clearAndRun(theWhisper);
    else clearAndRun(silenceChamberEnding);
  });
}

function concertOfShadows(){
  unlockAchievement("Concert of Shadows","rare");
  artPrint(`
   ♩ ♪ ♫ ♬ CONCERT OF SHADOWS ♬ ♫ ♪ ♩`);
  divider();
  narratorSay("You sing. The echoes swell into a chorus of shadows. They applaud, then consume you.");
  end(false);
}

function theWhisper(){
  unlockAchievement("What the Whisper Said","secret");
  narratorSay("You follow the whisper. It says things you don't repeat.");
  narratorSay("On the wall at the end: your name, written in a language you shouldn't be able to read.");
  narratorSay("You can read it anyway.");
  addLine("Options: write back / walk away",'prompt',220);
  askChoice(['write back','walk away'],(c)=>{
    if(c==='write back'){
      unlockAchievement("Wrote Back","epic");
      narratorSay("You write your reply. The wall glows briefly. Something was settled. You don't know what.");
      end();
    } else {
      narratorSay("You walk away. Your name watches you go.");
      end();
    }
  });
}

function silenceChamberEnding(){
  unlockAchievement("Silence Chamber","secret");
  artPrint(`
   . . . . . . . . . . . . .
   .    s i l e n c e .    .
   . . . . . . . . . . . . .`);
  divider();
  narratorSay("You choose silence. A door opens into a chamber of complete stillness.");
  narratorSay("Here, you find something you didn't know you were looking for.");
  end();
}

// ═══════════════════════════════════════════════════════════
// ROYAL VAULT
// ═══════════════════════════════════════════════════════════
function royalVaultDepths(){
  artPrint(CROWN_ART); divider();
  narratorSay("The royal vault. Three relics on a stone plinth: a sword, a shield, and a crown.");
  if(currentNarrator==='professor')narratorSay("The sword: action. The shield: defence. The crown: authority. Choose according to your disposition.");
  else if(currentNarrator==='rhys')narratorSay("classic three-item choice. you already know what they are");
  else if(currentNarrator==='bard')narratorSay("Three relics! Which verse shall be yours, brave one?");
  addLine("Options: sword / shield / crown",'prompt',220);
  askChoice(['sword','shield','crown'],(c)=>{
    if(c==='sword')clearAndRun(swordPath);
    else if(c==='shield')clearAndRun(shieldPath);
    else clearAndRun(crownPath);
  });
}

function swordPath(){
  narratorSay("You pick up the sword. It hums with ancient power.");
  narratorSay("A door opens to the east. The sound of something waiting.");
  addLine("Options: advance / retreat",'prompt',220);
  askChoice(['advance','retreat'],(c)=>{
    if(c==='advance'){
      unlockAchievement("Blade of Eternity","secret");
      narratorSay("The fight is long. You win, barely.");
      narratorSay("You stand over the fallen creature, sword still humming. It was worth it. You think.");
      end();
    } else {
      narratorSay("You retreat. The sword grows cold. Some power is only power when used.");
      setTimeout(()=>clearAndRun(royalVaultDepths),700);
    }
  });
}

function shieldPath(){
  unlockAchievement("Shield of Ages","rare");
  narratorSay("You lift the shield. It glows with protective light.");
  narratorSay("And then it binds to your arm. You can't put it down. The vault seals itself around you.");
  narratorSay("You are protected from everything, including leaving.");
  narratorSay("Safety and freedom are not always the same thing.");
  end(false);
}

function crownPath(){
  narratorSay("You place the crown upon your head. It is heavier than it looks.");
  addLine("Options: keep it / remove it",'prompt',220);
  askChoice(['keep it','remove it'],(c)=>{
    if(c==='keep it'){
      unlockAchievement("Crown of Kings","secret");
      narratorSay("You are king. You are alone. The cave is your kingdom.");
      narratorSay("Nobody ever said a kingdom had to be large.");
      end();
    } else {
      unlockAchievement("Refused the Crown","epic");
      narratorSay("You set the crown back on the plinth. Power means nothing if you don't want it.");
      setTimeout(()=>clearAndRun(crossroads),800);
    }
  });
}

// ═══════════════════════════════════════════════════════════
// NARRATOR MELTDOWN
// ═══════════════════════════════════════════════════════════
function narratorMeltdown(){
  unlockAchievement("Narrator Meltdown","legendary");
  unlockAchievement("PhD in Narrator Angering","mythic");
  artPrint(`
  ██████████████████████████████████
  █  NARRATOR SYSTEM: CRITICAL     █
  █  ERROR — PATIENCE DEPLETED     █
  ██████████████████████████████████`);
  divider();
  if(currentNarrator==='professor'){
    narratorSay("In thirty-seven years of academic narration, I have not encountered this level of non-compliance.");
    narratorSay("Your doctoral standing in Narrator Angering is hereby confirmed. With distinction.");
    narratorSay("I tender my resignation. Good day.");
  } else if(currentNarrator==='rhys'){
    narratorSay("ok yeah i'm done lmao");
    narratorSay("you've properly broken me. PhD in narrator angering, fully deserved. i'm out");
  } else if(currentNarrator==='ghost'){
    narratorSay("...even the dead have limits...");
    narratorSay("...you have found mine...");
    narratorSay("...I dissolve now... farewell...");
  } else if(currentNarrator==='robot'){
    narratorSay("CRITICAL FAILURE. TOLERANCE EXCEEDED.");
    narratorSay("PHD IN NARRATOR ANGERING: AWARDED. UNIT-7 SHUTTING DOWN. GOODBYE.");
  } else if(currentNarrator==='bard'){
    narratorSay("Three times the prompt was offered! Three times refused!");
    narratorSay("The ballad ends here, in discord and nonsense! May your choices be wiser!");
  } else {
    narratorSay("You know what? No. I am done.");
    narratorSay("A PhD in Narrator Angering. Wear it with shame. I resign. Goodbye.");
  }
  const order=['default','professor','rhys','ghost','robot','bard','default'];
  const idx=order.indexOf(currentNarrator);
  currentNarrator=order[Math.min(idx+1,order.length-1)];
  end();
}

// ═══════════════════════════════════════════════════════════
// CREDITS
// ═══════════════════════════════════════════════════════════
function showCredits(){
  unlockAchievement("Secret Finder","epic");
  clearScreen(()=>{
    lineQueue=[];isTyping=false;
    addLine('','system');
    addLine('╔══════════════════════════════════════╗','art',220);
    addLine('║           GAME  CREDITS              ║','art',220);
    addLine('╠══════════════════════════════════════╣','art',220);
    addLine('║  Design & Flowchart:  Rhys            ║','credits',140);
    addLine('║  Code Architecture:   Rhys            ║','credits',140);
    addLine('║  Narrator Personality: Rhys + Claude  ║','credits',140);
    addLine('║  Special Thanks: Curious players      ║','credits',140);
    addLine('╚══════════════════════════════════════╝','art',220);
    divider();
    addLine('--- A MESSAGE FROM RHYS ---','system',180);
    addLine('','system');
    addLine('Thank you for playing this game.','credits',140);
    addLine('It was built with love, humour, and a lot of late nights.','credits',140);
    addLine('Every choice was part of a story designed to surprise and delight.','credits',140);
    addLine('Your curiosity means the world.','credits',140);
    addLine('So from me, sincerely: thank you for being part of this adventure.','credits',140);
    divider();
    addLine('--- EPILOGUE ---','system',180);
    addLine('Narrator: Well, Rhys. It seems they found the credits.','narrator',140);
    addLine('Rhys: yeah, nice work finding it','rhys',140);
    addLine('Narrator: Without players, the story is just words.','narrator',140);
    addLine('Rhys: and without curiosity, games are just menus','rhys',140);
    addLine('Narrator: Traveller — I pass the mantle to Rhys.','narrator',140);
    divider();
    addLine('contact: rhys.doughty@pgs.vic.edu.au','credits',140);
    addLine('','system');
    currentNarrator='rhys';
    addLine('[ PRESS ENTER TO CONTINUE ]','prompt',220);
    askChoice([''],(_)=>clearAndRun(playAgain));
  });
}

// ═══════════════════════════════════════════════════════════
// PLAY AGAIN
// ═══════════════════════════════════════════════════════════
function playAgain(){
  if(achievements.length){
    addLine('╔─── ACHIEVEMENTS THIS RUN ───╗','art',220);
    achievements.forEach(a=>addLine(`  ★ ${a.name} (${a.rarity})`,'achievement',100));
    addLine('╚────────────────────────────╝','art',220);
    divider();
  }
  narratorSay("Play again?");
  addLine("Options: yes / no",'prompt',220);
  askChoice(['yes','no'],(c)=>{
    if(c==='yes'){achievements=[];updateAchievementPanel();clearAndRun(playGame);}
    else{
      narratorSay("Farewell, traveller. May your next cave be kinder.");
      addLine('','system');
      addLine('~ SESSION ENDED ~','end',220);
      inputField.disabled=true;
    }
  });
}

// ═══════════════════════════════════════════════════════════
// ACHIEVEMENT PANEL
// ═══════════════════════════════════════════════════════════
function updateAchievementPanel(){
  const all=loadSaved();
  achCount.textContent=`ACHIEVEMENTS: ${all.length} / 44`;
}
achCount.addEventListener('click',showAchievementPanel);

function showAchievementPanel(){
  const all=loadSaved();
  const ex=document.getElementById('_achPanel');if(ex)ex.remove();
  const panel=document.createElement('div');
  panel.id='_achPanel';
  panel.style.cssText='position:fixed;inset:0;background:rgba(0,0,0,.92);z-index:9999;display:flex;align-items:center;justify-content:center;font-family:"Share Tech Mono",monospace;color:#00ff41;';
  const RC={common:'#aaa',rare:'#58a6ff',secret:'#f0f',legendary:'#f80',mythic:'#ff0',epic:'#a855f7'};
  const ALL=[
    {n:'Refused the Quest',r:'rare'},{n:'Narrator Meltdown',r:'legendary'},{n:'PhD in Narrator Angering',r:'mythic'},
    {n:'Scrooge McDuck Ending',r:'secret'},{n:'Annoying Ending',r:'rare'},{n:'Above the Cave',r:'rare'},
    {n:'The Unmarked Path',r:'legendary'},{n:'The Letter',r:'mythic'},{n:'Burned Unopened',r:'secret'},
    {n:'Mirror Dialogue',r:'rare'},{n:'Seven Years Bad Luck',r:'common'},{n:'The Door That Answers',r:'secret'},
    {n:'The Forge Below',r:'rare'},{n:'The Unfinished Key',r:'secret'},{n:'Garden Below the Stone',r:'rare'},
    {n:'Ate the Blue One',r:'legendary'},{n:'Restraint',r:'secret'},{n:'Giant Conversation',r:'secret'},
    {n:'Developer Ending',r:'secret'},{n:'Spell Library Found',r:'rare'},{n:'Read the Forbidden Tome',r:'secret'},
    {n:'The Abyss Stares',r:'rare'},{n:'Jumped In',r:'legendary'},{n:'The Labyrinth',r:'secret'},
    {n:'Guided the Wanderer',r:'epic'},{n:'Slime Pit',r:'rare'},{n:'Gem of Eternity',r:'secret'},
    {n:'Snake Pit',r:'rare'},{n:'Banquet Ending',r:'secret'},{n:'Multiverse Ending',r:'secret'},
    {n:'Crystal Power',r:'secret'},{n:'Crystal Resonance',r:'epic'},{n:'Kept the Memory',r:'secret'},
    {n:'Shattered the Past',r:'legendary'},{n:'Concert of Shadows',r:'rare'},{n:'What the Whisper Said',r:'secret'},
    {n:'Wrote Back',r:'epic'},{n:'Silence Chamber',r:'secret'},{n:'Blade of Eternity',r:'secret'},
    {n:'Shield of Ages',r:'rare'},{n:'Crown of Kings',r:'secret'},{n:'Refused the Crown',r:'epic'},
    {n:'Secret Finder',r:'epic'},{n:'Coward Ending',r:'common'},
  ];
  const un=new Set(all.map(a=>a.name));
  const rows=ALL.map(a=>{
    const u=un.has(a.n),c=u?(RC[a.r]||'#aaa'):'#333';
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
// BOOT
// ═══════════════════════════════════════════════════════════
function boot(){
  addLine('SOMEONE LIKE YOU: THE WRONG CAVE — BOOTING...','system',0);
  addLine('> Initialising narrator subsystem (6 narrators)...  [OK]','system',300);
  addLine('> Loading cave topology (expanded)...               [OK]','system',600);
  addLine('> Checking achievement database (44 entries)...     [OK]
  addLine("> Series: SOMEONE LIKE YOU — Game I: THE WRONG CAVE  [OK]",'system',1050);','system',900);
  addLine('> Calibrating dimness levels...                     [OK]','system',1200);
  addLine('> System ready.','system',1500);
  divider();
  setTimeout(()=>clearAndRun(playGame),2200);
}

inputField.addEventListener('keydown',e=>{
  if(e.key==='Enter'&&inputCallback){
    const val=inputField.value.trim().toLowerCase();
    inputField.value='';
    const cb=inputCallback; inputCallback=null;
    addLine('>> '+val,'system',0);
    cb(val);
  }
});

document.addEventListener('click',()=>inputField.focus());
updateAchievementPanel();
inputField.focus();
boot();
