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
              S O M E O N E   L I K E   Y O U   —   I I I`;


const SAVE_KEY = 'novaCaveAch3';
function loadSaved(){ try{return JSON.parse(localStorage.getItem(SAVE_KEY)||'[]');}catch(_){return[];} }
function loadGame2Save(){ try{return JSON.parse(localStorage.getItem('sly_save')||'{}');}catch(_){return {};} }

let lineQueue=[], isTyping=false, inputCallback=null, invalidCount=0;
let currentNarrator='narrator', achievements=[];
let S={}, isabelleWithHazel=false;

const NS = {
  narrator: { cls:'narrator', invalid:["That isn't a path I can see from here.","I don't recognise that choice.","Something else, perhaps."] },
  hermes:   { cls:'hermes',   invalid:["That isn't the road, Hazel.","I know every path from here. That isn't one of them.","Try again."] },
  piper:    { cls:'piper',    invalid:["...that's not one of the options, love.","she waits. that's not a choice she recognises.","try again."] },
  eli:      { cls:'eli',      invalid:["...no.","that's not an option.","try something else."] },
  may:      { cls:'may',      invalid:["that's not quite it.","she tilts her head. tries again.","hmm. no. try again."] },
};

function N(l){ addLine(l,(NS[currentNarrator]||NS.narrator).cls,140); }
function hazel(l){ addLine(l,'hazel',100); }
function isabelle(l){ addLine(l,'isabelle',100); }
function hermes(l){ addLine(l,'hermes',140); }
function piper(l){ addLine(l,'piper',140); }
function eli(l){ addLine(l,'eli',140); }
function may(l){ addLine(l,'may',140); }
function rhys(l){ addLine(l,'rhys',140); }

function addLine(text,cls,delay){
  if(delay===undefined)delay=0;
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
    while(output.children.length>Math.floor((window.innerHeight-180)/36))output.removeChild(output.firstChild);
    processQueue();
  },delay);
}
function clearScreen(cb){
  output.style.transition='opacity 0.3s'; output.style.opacity='0';
  setTimeout(()=>{output.innerHTML='';output.style.opacity='1';if(cb)cb();},320);
}
function divider(){ addLine('\u2500'.repeat(60),'divider',80); }
function artPrint(t){ addLine(t,'art',20); }
function artGold(t){ addLine(t,'art-gold',20); }
function blank(){ addLine('','system',40); }
function sys(t){ addLine(t,'system',60); }

function unlockAchievement(name,rarity){
  achievements.push({name,rarity});
  const all=loadSaved();
  if(!all.find(a=>a.name===name)){
    all.push({name,rarity,unlockedAt:Date.now()});
    localStorage.setItem(SAVE_KEY,JSON.stringify(all));
  }
  updateAchievementPanel();
  addLine('[+ ACHIEVEMENT: '+name.toUpperCase()+' ('+rarity.toUpperCase()+') +]','achievement',180);
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
      if(invalidCount>=3){
        invalidCount=0;
        setTimeout(()=>clearAndRun(narratorLoss),300);
      } else {
        const inv=(NS[currentNarrator]||NS.narrator).invalid;
        addLine(inv[Math.floor(Math.random()*inv.length)],'system',0);
        setTimeout(()=>askChoice(validKeys,cb),400);
      }
    }
  };
}

function clearAndRun(fn){ clearScreen(()=>{lineQueue=[];isTyping=false;fn();}); }
function cont(fn){ blank(); addLine('[ PRESS ENTER TO CONTINUE ]','prompt',220); askChoice([''],(_)=>clearAndRun(fn)); }

function narratorLoss(){
  unlockAchievement("Tested Hermes","rare");
  if(currentNarrator==='hermes'){
    hermes("I am a god, Hazel.");
    hermes("I have guided souls through the underworld for several thousand years.");
    hermes("I have never been ignored three times in a row.");
    hermes("I'm choosing to find this charming.");
    hermes("Let's continue.");
  } else if(currentNarrator==='piper'){
    piper("she laughs.");
    piper("she's seen a lot of things at that bus stop. not this.");
    piper("try again, love.");
  } else if(currentNarrator==='eli'){
    eli("...");
    eli("you know what. fine. let's just move on.");
  } else if(currentNarrator==='may'){
    may("she puts her hand on hazel's arm. gently.");
    may("'the options are on the screen, love.'");
  } else {
    N("Let's try that again.");
  }
  cont(playAgain);
}

// ═══ ART ═══════════════════════════════════════════════════
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

// ═══ BOOT ═══════════════════════════════════════════════════
function boot(){
  sys('SOMEONE LIKE YOU: FOR YOU — BOOTING...');
  sys('> Restoring narrator...');
  setTimeout(()=>{
    S=loadGame2Save();
    const hasData=Object.keys(S).length>0;
    if(hasData){
      sys('> Save data found from THE ROAD HOME.   [OK]');
      setTimeout(()=>{
        sys('> Coin: '+(S.coin?'in pocket':'left behind'));
        sys('> Isabelle: '+(S.isabelle_came?'coming with her':'stayed behind'));
        isabelleWithHazel=!!S.isabelle_came;
        sys('> All data loaded.                      [OK]');
        divider();
        setTimeout(()=>clearAndRun(scene1),2000);
      },600);
    } else {
      sys('> No save data found. Manual import...');
      setTimeout(()=>{
        sys('> Did Hazel take the coin? (yes / no)');
        askChoice(['yes','no'],(c)=>{
          S.coin=(c==='yes');
          sys('> Did Isabelle come north? (yes / no)');
          askChoice(['yes','no'],(c2)=>{
            S.isabelle_came=(c2==='yes');
            isabelleWithHazel=S.isabelle_came;
            S.almost_told=true; S.flood=true; S.note='3';
            sys('> Import complete.                     [OK]');
            divider();
            setTimeout(()=>clearAndRun(scene1),1200);
          });
        });
      },600);
    }
  },1200);
}

// ═══ SCENE 1 — LEAVING ══════════════════════════════════════
function scene1(){
  currentNarrator='narrator';
  artPrint(`
   [ village edge — dawn ]
   bag: packed  |  letter: pocket
   `+(S.coin?'coin: pocket':'coin: not taken')+'  |  isabelle: '+(isabelleWithHazel?'beside her':'at the flat'));
  divider();
  N("The village at dawn. The last time she'll see it for a while.");
  N("She doesn't look back.");
  blank();
  if(isabelleWithHazel){
    N("Isabelle is beside her. Didn't ask where they were going.");
    N("Just packed a bag and came.");
    blank();
    isabelle("...so where are we going.");
    blank();
    addLine("Options: 1 / 2 / 3",'prompt',220);
    addLine("  1. north.",'prompt',80);
    addLine("  2. there's a cave.",'prompt',80);
    addLine("  3. i'll explain on the way.",'prompt',80);
    askChoice(["1","2","3"],(c)=>{
      if(c==="1"){hazel("north.");isabelle("...okay. north it is.");}
      else if(c==="2"){hazel("there's a cave.");isabelle("...okay. a cave. sure.");}
      else{hazel("i'll explain on the way.");isabelle("...fair enough.");}
      blank();
      cont(piper_scene);
    });
  } else {
    N("She's alone. The village shrinks behind her.");
    blank();
    N("You look different.");
    blank();
    addLine("Options: 1 / 2",'prompt',220);
    addLine("  1. ...do i?",'prompt',80);
    addLine("  2. same as always.",'prompt',80);
    askChoice(["1","2"],(c)=>{
      if(c==="1"){hazel("...do i?");N("Yes. Like someone who has already decided.");}
      else{hazel("same as always.");N("...");N("No. Not quite.");}
      blank();
      cont(piper_scene);
    });
  }
}

// ═══ PIPER ══════════════════════════════════════════════════
function piper_scene(){
  currentNarrator='piper';
  artPrint(`
   [ bus stop — village outskirts ]
   piper: sitting. not waiting for the bus.`);
  divider();
  piper("she sits at the bus stop like she always does.");
  piper("she sees the bag before she sees the girl.");
  piper("she knows that bag.");
  blank();
  N("Older woman. Late 50s. At the bus stop like she belongs there.");
  blank();
  if(isabelleWithHazel){
    N("She looks at Hazel. Then Isabelle. Then back at Hazel.");
    piper("two of you. good.");
    blank();
    N("She says it like it matters.");
  } else {
    piper("just you then.");
  }
  blank();
  piper("how far?");
  blank();
  addLine("Options: 1 / 2 / 3",'prompt',220);
  addLine("  1. far enough.",'prompt',80);
  addLine("  2. north. there's a cave.",'prompt',80);
  addLine("  3. i don't know exactly.",'prompt',80);
  askChoice(["1","2","3"],(c)=>{
    if(c==="1"){hazel("far enough.");piper("...");piper("yes. it usually is.");}
    else if(c==="2"){hazel("north. there's a cave.");piper("...");piper("there always is. with the ones who go.");}
    else{hazel("i don't know exactly.");piper("that's alright. you'll know when you get there.");}
    blank();
    cont(piper_talk);
  });
}

function piper_talk(){
  currentNarrator='piper';
  piper("i went somewhere once.");
  blank();
  N("She says it simply.");
  blank();
  hazel("...what happened?");
  blank();
  piper("it worked. the thing i went for. it actually worked.");
  blank();
  if(isabelleWithHazel){isabelle("...and you came back?");}
  else{hazel("...and you came back.");}
  blank();
  piper("...");
  piper("this is home.");
  piper("going somewhere doesn't mean leaving forever.");
  piper("that's the thing they don't tell you.");
  blank();
  piper("don't doubt yourself.");
  piper("and do it before it's too late.");
  piper("whatever it is you're working up to.");
  blank();
  N("She doesn't look at Hazel when she says it. But she means it for her.");
  blank();
  unlockAchievement("Piper","rare");
  cont(eli_scene);
}

// ═══ ELI ════════════════════════════════════════════════════
function eli_scene(){
  currentNarrator='eli';
  artPrint(`
   [ second town — small. quiet. ]
   last bus: already gone.
   eli: locking up the cafe.`);
  divider();
  eli("the last bus already went.");
  eli("he says it before she can check her phone.");
  eli("he's said it a lot.");
  blank();
  N("Late 20s. Locking up a small cafe. Sees them at the stop.");
  blank();
  eli("there's a bench inside if you need to wait till morning.");
  blank();
  addLine("Options: 1 / 2",'prompt',220);
  addLine("  1. thanks.",'prompt',80);
  addLine("  2. how'd you know we needed somewhere?",'prompt',80);
  askChoice(["1","2"],(c)=>{
    if(c==="1"){hazel("thanks.");eli("...");eli("no problem.");}
    else{hazel("how'd you know we needed somewhere?");eli("you had the look.");hazel("what look?");eli("everyone gets it eventually.");unlockAchievement("The Look","common");}
    blank();
    cont(eli_inside);
  });
}

function eli_inside(){
  currentNarrator='eli';
  N("Inside. Warm. Eli makes tea without asking.");
  if(isabelleWithHazel){N("Isabelle immediately looks at the menu board even though it's closed.");}
  N("Hazel notices his jaw tighten slightly when people pass outside.");
  blank();
  addLine("Options: 1 / 2",'prompt',220);
  addLine("  1. you've been here a while.",'prompt',80);
  addLine("  2. ...",'prompt',80);
  askChoice(["1","2"],(c)=>{
    if(c==="1"){
      hazel("you've been here a while.");
      blank();
      eli("...");
      eli("whole life. love it here.");
      eli("...");
      eli("they just.");
      eli("stopped looking at me right.");
      blank();
      N("Not for sympathy. Just because it's true.");
      blank();
      hazel("...");
      hazel("yeah.");
      blank();
      N("She doesn't explain what she means. He doesn't ask.");
      N("Some conversations don't need the whole sentence.");
      blank();
      unlockAchievement("Eli","rare");
    } else {
      hazel("...");
      eli("...");
      N("Comfortable quiet. Sometimes that's enough.");
    }
    cont(eli_morning);
  });
}

function eli_morning(){
  currentNarrator='eli';
  blank();
  eli("the worst part isn't that they got it wrong.");
  eli("it's that they stopped looking.");
  blank();
  N("He's been thinking that for years. Maybe he has.");
  N("Hazel thinks about it for the rest of the journey.");
  blank();
  if(isabelleWithHazel){
    N("Later. Just them.");
    blank();
    isabelle("...");
    isabelle("he reminded me of you.");
    blank();
    addLine("Options: 1 / 2",'prompt',220);
    addLine("  1. ...how?",'prompt',80);
    addLine("  2. ...",'prompt',80);
    askChoice(["1","2"],(c)=>{
      if(c==="1"){
        hazel("...how?");
        isabelle("the way he talks about this place. like it's his but it doesn't quite fit.");
        blank();
        isabelle("hazel.");
        hazel("yeah.");
        isabelle("for what it's worth. you fit. with me. you fit.");
        blank();
        N("Hazel doesn't answer. But something in her chest does something.");
        unlockAchievement("You Fit","legendary");
      } else {
        hazel("...");
        N("Isabelle lets it sit. She always knows when to let things sit.");
      }
      blank();
      N("Morning. Eli makes breakfast. Doesn't charge for it.");
      blank();
      eli("good luck with the cave.");
      if(isabelleWithHazel){
        N("Isabelle told him while Hazel was asleep. She shrugs when Hazel looks at her.");
        isabelle("he seemed trustworthy.");
      }
      blank();
      cont(may_scene);
    });
  } else {
    N("Morning. Eli makes breakfast. Doesn't charge for it.");
    blank();
    eli("good luck.");
    blank();
    N("He means it.");
    blank();
    cont(may_scene);
  }
}

// ═══ MAY ════════════════════════════════════════════════════
function may_scene(){
  currentNarrator='may';
  artPrint(`
   [ bus stop — last town before the cave ]
   may: sitting. waiting for no particular reason.`);
  divider();
  may("she sits down without asking.");
  may("she never asks. it always works out fine.");
  blank();
  N("Early 30s. Just sits down next to Hazel. Like it's the most natural thing.");
  blank();
  if(isabelleWithHazel){
    may("you two look like you're almost there.");
  } else {
    may("you look like you're almost there.");
  }
  blank();
  addLine("Options: 1 / 2",'prompt',220);
  addLine("  1. ...how can you tell?",'prompt',80);
  addLine("  2. yeah. i think so.",'prompt',80);
  askChoice(["1","2"],(c)=>{
    if(c==="1"){hazel("...how can you tell?");may("the way you're walking. like you've decided something.");}
    else{hazel("yeah. i think so.");may("good. almost there is a good place to be.");}
    blank();
    cont(may_talk);
  });
}

function may_talk(){
  currentNarrator='may';
  hazel("did you ever do something that scared you.");
  blank();
  may("yeah.");
  may("i told someone i loved them.");
  blank();
  if(isabelleWithHazel){N("Isabelle goes slightly still beside her.");}
  blank();
  hazel("...what happened?");
  blank();
  may("she didn't feel that way. said it kindly. honestly.");
  may("we sat there for a bit.");
  blank();
  hazel("and then?");
  blank();
  may("and then she made tea. and we watched something terrible on tv.");
  may("and it was awful for a while and then it wasn't.");
  blank();
  cont(may_talk_2);
}

function may_talk_2(){
  currentNarrator='may';
  hazel("are you glad you said it?");
  blank();
  may("...");
  may("yeah.");
  blank();
  may("because at least it was real.");
  may("carrying it wasn't real. saying it was.");
  blank();
  if(isabelleWithHazel){
    N("Isabelle is very quiet.");
    N("Hazel doesn't look at her. But she feels the weight of what May just said.");
  }
  blank();
  may("good luck with whatever you're going to.");
  blank();
  if(isabelleWithHazel){N("She says it to both of them but looks at Hazel.");}
  blank();
  unlockAchievement("May","rare");
  if(isabelleWithHazel){
    N("On the bus. Isabelle quiet for a long time.");
    blank();
    isabelle("...");
    isabelle("hazel.");
    blank();
    addLine("Options: 1 / 2",'prompt',220);
    addLine("  1. yeah.",'prompt',80);
    addLine("  2. ...",'prompt',80);
    askChoice(["1","2"],(c)=>{
      hazel(c==="1"?"yeah.":"...");
      blank();
      isabelle("nothing. just. nothing.");
      blank();
      N("Hazel lets her work it out. She knows when Isabelle is working something out.");
      blank();
      cont(cave_approach);
    });
  } else {
    N("Hazel sits with what May said.");
    N("Carrying it wasn't real. Saying it was.");
    N("She thinks about Isabelle. Back at the flat. With Mishka.");
    blank();
    cont(cave_approach);
  }
}

// ═══ CAVE ═══════════════════════════════════════════════════
function cave_approach(){
  currentNarrator='narrator';
  artPrint(`
        . . . . . . . . . . . . . . .
       .   ___---------___            .
      .  the cave. older. deeper.      .
     . /:  further north.   :\\         .
    .  | it has been waiting. |         .
     . \\:___________________:/         .
        . . . . . . . . . . . . . . .`);
  divider();
  N("The cave. Older than the one she knows. You can feel it.");
  N("The ground is different. The stones are different.");
  N("Something has been here a very long time.");
  blank();
  if(isabelleWithHazel){
    isabelle("...this is it?");
    hazel("yeah.");
    isabelle("it's bigger than i expected.");
    blank();
    N("The letter said come alone.");
    blank();
    addLine("Options: 1 / 2",'prompt',220);
    addLine("  1. i have to go in alone.",'prompt',80);
    addLine("  2. wait here. i won't be long.",'prompt',80);
    askChoice(["1","2"],(c)=>{
      if(c==="1"){hazel("i have to go in alone.");isabelle("okay.");isabelle("come back.");hazel("...yeah.");}
      else{hazel("wait here. i won't be long.");isabelle("okay. i'll be here.");N("She sits on a rock. Like waiting for Hazel is just a thing she does.");}
      blank();
      cont(cave_owl);
    });
  } else {
    N("She's alone. The way the letter said.");
    blank();
    addLine("Options: 1 / 2",'prompt',220);
    addLine("  1. go in.",'prompt',80);
    addLine("  2. stand here for a moment.",'prompt',80);
    askChoice(["1","2"],(c)=>{
      if(c==="1"){hazel("go in.");N("She goes in.");}
      else{hazel("stand here for a moment.");N("The cave waits. It's been waiting a long time. It can wait a moment more.");unlockAchievement("Took a Breath","common");}
      blank();
      cont(cave_owl);
    });
  }
}

function cave_owl(){
  currentNarrator='narrator';
  artPrint(`
       ,_,
      (o,o)
      {""""}
       " " `);
  divider();
  N("Inside. Darker. Older. The walls feel closer even when they aren't.");
  blank();
  N("Then she sees the owl.");
  N("Sitting on a ledge. Very still. Looking at her.");
  N("Not a wild animal look. Recognition.");
  blank();
  addLine("Options: 1 / 2 / 3",'prompt',220);
  addLine("  1. ...hello.",'prompt',80);
  addLine("  2. are you supposed to guide me?",'prompt',80);
  addLine("  3. ...",'prompt',80);
  askChoice(["1","2","3"],(c)=>{
    if(c==="1"){hazel("...hello.");N("The owl blinks. Once. Then moves deeper into the cave.");unlockAchievement("Said Hello to the Owl","common");}
    else if(c==="2"){hazel("are you supposed to guide me?");N("The owl looks at her. Then moves deeper. She takes that as a yes.");unlockAchievement("Good Question Again","rare");}
    else{hazel("...");N("The owl blinks. Turns. Moves deeper. She follows.");}
    blank();
    cont(cave_water);
  });
}

function cave_water(){
  currentNarrator='narrator';
  artPrint(`
   ≈ ≈ ≈ ≈ ≈ ≈ ≈ ≈ ≈ ≈ ≈ ≈ ≈ ≈ ≈
   ≈                             ≈
   ≈    [ still. ancient. ]      ≈
   ≈                             ≈
   ≈ ≈ ≈ ≈ ≈ ≈ ≈ ≈ ≈ ≈ ≈ ≈ ≈ ≈ ≈`);
  divider();
  N("The deep chamber. The owl is gone.");
  blank();
  N("In the centre: a pool of water. Perfectly still. Ancient.");
  blank();
  N("She looks into it.");
  blank();
  N("She sees herself.");
  blank();
  N("Clearly. Without the doubt.");
  N("Not the version the village sees. Not the version she shows people when she's being careful.");
  N("Just herself. Plainly.");
  blank();
  addLine("Options: 1 / 2 / 3",'prompt',220);
  addLine("  1. ...oh.",'prompt',80);
  addLine("  2. i look like that?",'prompt',80);
  addLine("  3. ...",'prompt',80);
  askChoice(["1","2","3"],(c)=>{
    if(c==="1"){hazel("...oh.");N("...");N("Yeah.");}
    else if(c==="2"){hazel("i look like that?");N("Yes. You do. You always have.");unlockAchievement("Saw Herself","epic");}
    else{hazel("...");N("She stands there for a long time.");}
    blank();
    cont(cave_voice);
  });
}

function cave_voice(){
  currentNarrator='narrator';
  N("Then the voice.");
  blank();
  N("Not loud. Not dramatic. Calm. Certain. Like someone who doesn't waste words.");
  blank();
  addLine("You already knew.","art-gold",300);
  blank();
  N("Three words. But they settle into her chest like something true for a long time.");
  blank();
  N("She knew about Isabelle. She knew she deserved good things.");
  N("She knew the cave was waiting for her.");
  N("She just needed to walk far enough to believe it.");
  blank();
  unlockAchievement("The Voice","legendary");
  cont(cave_exit_scene);
}

function cave_exit_scene(){
  currentNarrator='narrator';
  artPrint(`
   [ cave exit — dawn ]
   same light as the first cave. first day.
   but she is not the same.`);
  divider();
  N("She comes out of the cave. Changed.");
  N("The owl is gone. Same dawn as the day she left the first cave.");
  blank();
  N("Full circle.");
  blank();
  if(isabelleWithHazel){
    N("Isabelle stands when she sees her. Looks at her face.");
    N("Doesn't say anything. Just looks.");
  }
  blank();
  N("Then the narrator speaks. Not performing. Just his voice.");
  blank();
  N("Hazel.");
  blank();
  N("I need to tell you something.");
  blank();
  addLine("Options: 1 / 2",'prompt',220);
  addLine("  1. okay.",'prompt',80);
  addLine("  2. i know.",'prompt',80);
  askChoice(["1","2"],(c)=>{
    if(c==="2"){
      hazel("i know.");
      N("...");
      N("You know?");
      hazel("i didn't know know. but i know now.");
      N("When?");
      blank();
      addLine("Options: 1 / 2",'prompt',220);
      addLine("  1. when you told me to go to sleep.",'prompt',80);
      addLine("  2. when you used my name.",'prompt',80);
      askChoice(["1","2"],(c2)=>{
        if(c2==="1"){hazel("when you told me to go to sleep.");}
        else{hazel("when you used my name.");}
        N("...");
        N("Fair enough.");
        blank();
        unlockAchievement("I Know","secret");
        cont(hermes_reveal);
      });
    } else {
      hazel("okay.");
      blank();
      cont(hermes_reveal);
    }
  });
}

// ═══ HERMES ═════════════════════════════════════════════════
function hermes_reveal(){
  currentNarrator='hermes';
  hermes("I'm Hermes.");
  blank();
  hermes("I've been with you since the first cave.");
  hermes("Athena sent me.");
  hermes("The letter was hers. The voicemail was mine.");
  hermes("The stranger on the road was me.");
  blank();
  if(S.coin){
    hermes("The coin was mine. I wanted you to have something to hold.");
    blank();
    addLine("Options: 1 / 2 / 3",'prompt',220);
    addLine("  1. ...i still have it.",'prompt',80);
    addLine("  2. which side is which?",'prompt',80);
    addLine("  3. why no markings?",'prompt',80);
    askChoice(["1","2","3"],(c)=>{
      if(c==="1"){hazel("...i still have it.");hermes("...");hermes("I know. I'm glad.");}
      else if(c==="2"){hazel("which side is which?");hermes("There isn't one.");hermes("It was about having something in your pocket that reminded you this was real.");unlockAchievement("The Coin Explained","secret");}
      else{hazel("why no markings?");hermes("Because I didn't want you to be able to flip it.");hermes("This wasn't a coin toss kind of journey.");unlockAchievement("The Coin Explained","secret");}
      blank();
      cont(hermes_q_menu_start);
    });
  } else {
    hermes("I left you a coin. I wanted you to have something to hold.");
    hermes("You left it.");
    blank();
    addLine("Options: 1 / 2 / 3",'prompt',220);
    addLine("  1. i didn't know what it was.",'prompt',80);
    addLine("  2. ...sorry.",'prompt',80);
    addLine("  3. i didn't need it.",'prompt',80);
    askChoice(["1","2","3"],(c)=>{
      if(c==="3"){hazel("i didn't need it.");hermes("...");hermes("No. You got here anyway. That's more impressive.");unlockAchievement("Didn't Need It","epic");}
      else if(c==="2"){hazel("...sorry.");hermes("That's alright. You got here anyway.");}
      else{hazel("i didn't know what it was.");hermes("That's alright. You got here anyway.");}
      blank();
      cont(hermes_q_menu_start);
    });
  }
}

function hermes_q_menu_start(){ hermes_q_menu(3,[]); }

function hermes_q_menu(remaining,asked){
  currentNarrator='hermes';
  const all=[
    {k:'1',l:'why me.',fn:hq_whyme},
    {k:'2',l:'did athena watch me name the pc.',fn:hq_athena},
    {k:'3',l:'are you going to stay.',fn:hq_stay},
    {k:'4',l:'was any of it real.',fn:hq_real},
    {k:'5',l:'what happens now.',fn:hq_now},
    {k:'6',l:'did you read the letter before leaving it.',fn:hq_letter},
  ];
  const avail=all.filter(q=>!asked.includes(q.k));
  if(remaining===0||avail.length===0){clearAndRun(hermes_final);return;}
  blank();
  addLine('Ask a question ('+(remaining)+' remaining):','system',80);
  avail.forEach(q=>addLine('  '+q.k+'. '+q.l,'prompt',60));
  addLine('  0. that\'s enough.','prompt',60);
  const keys=avail.map(q=>q.k).concat(['0']);
  askChoice(keys,(c)=>{
    if(c==='0'){clearAndRun(hermes_final);return;}
    const q=avail.find(q=>q.k===c);
    if(q){clearAndRun(()=>q.fn(()=>hermes_q_menu(remaining-1,[...asked,c])));}
  });
}

function hq_whyme(next){
  currentNarrator='hermes';
  hazel("why me.");
  blank();
  hermes("Because you named your computer Athena. At fifteen. Without knowing why.");
  hermes("Athena notices people who love things carefully.");
  hermes("People who name what they love.");
  hermes("You've been under her protection for years.");
  hermes("I was just the delivery.");
  blank();
  unlockAchievement("Why Me","rare");
  cont(next);
}

function hq_athena(next){
  currentNarrator='hermes';
  hazel("did athena watch me name the pc.");
  blank();
  hermes("Yes.");
  hazel("...really.");
  hermes("She was pleased.");
  hermes("She said — paraphrasing — 'that one. keep an eye on that one.'");
  hazel("...she said that.");
  hermes("In so many words.");
  blank();
  unlockAchievement("Athena Was Watching","epic");
  cont(next);
}

function hq_stay(next){
  currentNarrator='hermes';
  hazel("are you going to stay.");
  blank();
  hermes("I'm always with the story.");
  blank();
  addLine("Options: 1 / 2",'prompt',220);
  addLine("  1. that's not an answer.",'prompt',80);
  addLine("  2. ...okay.",'prompt',80);
  askChoice(["1","2"],(c)=>{
    if(c==="1"){hazel("that's not an answer.");hermes("No. It isn't.");hermes("...");hermes("I'll be around. Less formally. But around.");unlockAchievement("Around","secret");}
    else{hazel("...okay.");hermes("...");hermes("Okay.");}
    cont(next);
  });
}

function hq_real(next){
  currentNarrator='hermes';
  hazel("was any of it real. the narrating.");
  blank();
  hermes("All of it.");
  hazel("even the evasive bits.");
  hermes("Especially those. Evasion takes effort.");
  hermes("I wasn't supposed to get fond of you.");
  hermes("That wasn't in the brief.");
  hermes("But there it is.");
  blank();
  unlockAchievement("Fond","legendary");
  cont(next);
}

function hq_now(next){
  currentNarrator='hermes';
  hazel("what happens now.");
  blank();
  hermes("Now you go home. Or wherever comes next.");
  hermes("That part is yours.");
  hermes("The cave gave you what it had.");
  if(isabelleWithHazel){hermes("You have someone beside you. That helps.");}
  blank();
  cont(next);
}

function hq_letter(next){
  currentNarrator='hermes';
  hazel("did you read the letter before you left it.");
  blank();
  hermes("...");
  hazel("...you did.");
  hermes("I'm the messenger. I always read the letters.");
  hazel("what did it feel like. knowing what it said.");
  blank();
  hermes("Like watching someone who doesn't know yet.");
  hermes("That they're exactly who they need to be.");
  blank();
  unlockAchievement("The Messenger Read It","secret");
  cont(next);
}

function hermes_final(){
  currentNarrator='hermes';
  blank();
  hermes("There's something else you need to do today.");
  blank();
  N("She knows what he means.");
  blank();
  if(isabelleWithHazel){cont(isabelle_moment);}
  else{cont(alone_setup);}
}

// ═══ ENDING A — TOGETHER ════════════════════════════════════
function isabelle_moment(){
  currentNarrator='narrator';
  N("Just Hazel and Isabelle. Hermes steps back.");
  blank();
  N("Outside the cave. Morning light.");
  N("Isabelle knows something shifted. She doesn't ask. She just stands next to her.");
  blank();
  N("Eight years of knowing when to wait.");
  blank();
  N("Hermes — completely silent. First time by choice.");
  blank();
  addLine("Options: 1 / 2 / 3",'prompt',220);
  addLine("  1. say it now.",'prompt',80);
  addLine("  2. wait a moment.",'prompt',80);
  addLine("  3. ...",'prompt',80);
  askChoice(["1","2","3"],(c)=>{
    if(c==="1"){N("She doesn't let herself think. She just turns to Isabelle and goes.");}
    else if(c==="2"){N("She stands there. Thinks about May. Carrying it wasn't real. Saying it was.");blank();}
    else{N("Isabelle reaches over and takes her hand. Doesn't say anything. Just takes it.");N("Something in Hazel gives way.");blank();unlockAchievement("She Reached First","epic");}
    blank();
    cont(the_words_together);
  });
}

function the_words_together(){
  currentNarrator='narrator';
  hazel("isabelle.");
  blank();
  isabelle("yeah.");
  blank();
  hazel("i need to tell you something.");
  blank();
  N("Isabelle waits.");
  blank();
  hazel("i have feelings for you.");
  hazel("i have had for a long time.");
  hazel("and i didn't say it because i was scared of losing you.");
  hazel("and i think i nearly didn't say it again today.");
  hazel("but i'm saying it now.");
  blank();
  N("Silence.");
  blank();
  cont(isabelle_responds);
}

function isabelle_responds(){
  currentNarrator='narrator';
  isabelle("hazel.");
  blank();
  hazel("yeah.");
  blank();
  isabelle("i've literally been in love with you since we were like sixteen.");
  blank();
  N("Hazel stares at her.");
  blank();
  hazel("...what.");
  isabelle("i thought YOU knew.");
  hazel("how would i have known.");
  isabelle("i thought it was obvious.");
  hazel("it was not obvious isabelle.");
  blank();
  cont(isabelle_responds_2);
}

function isabelle_responds_2(){
  currentNarrator='narrator';
  isabelle("hazel.");
  hazel("yeah.");
  isabelle("i named my computer athena.");
  blank();
  hazel("...");
  hazel("...you named your computer athena.");
  isabelle("yes.");
  hazel("i named MY computer athena.");
  isabelle("i know.");
  hazel("for the same—");
  isabelle("yes hazel. for the same reason.");
  blank();
  N("A beat.");
  blank();
  hazel("we're both very stupid.");
  isabelle("we really are.");
  blank();
  N("Isabelle laughs. Hazel laughs. The cave behind them. The morning light.");
  blank();
  unlockAchievement("Said It","mythic");
  cont(hermes_goodbye);
}

// ═══ ENDING B — ALONE ═══════════════════════════════════════
function alone_setup(){
  currentNarrator='hermes';
  hermes("Go home, Hazel.");
  hermes("You know what you need to say.");
  blank();
  N("She does.");
  blank();
  cont(alone_home);
}

function alone_home(){
  currentNarrator='narrator';
  artPrint(`
   [ the road home ]
   direction: south.
   hermes: still here. differently.`);
  divider();
  N("The road home is different from the road north.");
  N("Quieter. More certain.");
  blank();
  N("Hermes is still there. But differently. Less like narrating. More like walking alongside.");
  blank();
  hermes("How does it feel?");
  blank();
  addLine("Options: 1 / 2 / 3",'prompt',220);
  addLine("  1. different.",'prompt',80);
  addLine("  2. lighter.",'prompt',80);
  addLine("  3. like i know what i'm doing for once.",'prompt',80);
  askChoice(["1","2","3"],(c)=>{
    if(c==="1"){hazel("different.");hermes("Good different?");hazel("...yeah. good.");}
    else if(c==="2"){hazel("lighter.");hermes("...");hermes("Yes. That's what putting things down feels like.");}
    else{hazel("like i know what i'm doing for once.");hermes("You've always known.");hermes("You just needed to walk far enough to believe it.");}
    blank();
    cont(alone_isabelle_door);
  });
}

function alone_isabelle_door(){
  currentNarrator='narrator';
  artPrint(`
   [ isabelle's door ]
   evening. mishka on the windowsill.
   isabelle: home.`);
  divider();
  N("Isabelle's door. She's been here a thousand times.");
  N("Her hand is raised to knock.");
  blank();
  N("Inside: the light on. Mishka on the windowsill. Everything familiar.");
  blank();
  N("Except her.");
  blank();
  hermes("Don't doubt yourself. Do it before it's too late.");
  blank();
  N("She knocks.");
  blank();
  cont(alone_opens);
}

function alone_opens(){
  currentNarrator='narrator';
  N("Isabelle opens the door. Looks at her bag. Her face.");
  blank();
  isabelle("...you're back.");
  hazel("yeah.");
  isabelle("are you okay?");
  hazel("yeah.");
  hazel("i need to tell you something.");
  blank();
  N("Isabelle steps back. Lets her in.");
  N("Mishka immediately comes over. Hazel picks her up. Mishka walks away unbothered.");
  blank();
  cont(alone_the_words);
}

function alone_the_words(){
  currentNarrator='narrator';
  hazel("i have feelings for you.");
  hazel("i have had for a long time.");
  hazel("i should have said it before i left.");
  hazel("i'm saying it now.");
  blank();
  N("Silence.");
  blank();
  isabelle("...");
  isabelle("hazel.");
  hazel("yeah.");
  blank();
  isabelle("i've literally been in love with you since we were sixteen.");
  blank();
  N("Hazel stares at her.");
  blank();
  hazel("...what.");
  isabelle("i thought you knew.");
  hazel("how would i have known isabelle.");
  blank();
  cont(alone_the_words_2);
}

function alone_the_words_2(){
  currentNarrator='narrator';
  isabelle("i named my computer athena.");
  blank();
  hazel("...");
  hazel("you named your computer athena.");
  isabelle("yes.");
  hazel("i named MY computer athena.");
  isabelle("i know.");
  hazel("for the same—");
  isabelle("yes hazel. for the same reason.");
  blank();
  N("A beat.");
  blank();
  hazel("we've been very stupid.");
  isabelle("we really have.");
  blank();
  N("Mishka walks past. Completely unbothered.");
  N("Isabelle laughs. Hazel laughs. The flat. The familiar light. Athena on the desk.");
  blank();
  unlockAchievement("Said It","mythic");
  cont(hermes_goodbye);
}

// ═══ HERMES GOODBYE ═════════════════════════════════════════
function hermes_goodbye(){
  currentNarrator='hermes';
  blank();
  artGold(HANDS_ART);
  blank();
  addLine('[ PRESS ENTER TO CONTINUE ]','prompt',220);
  askChoice([''],(_)=>clearAndRun(hermes_goodbye_2));
}

function hermes_goodbye_2(){
  currentNarrator='hermes';
  hermes("I have narrated a great many things.");
  blank();
  hermes("Caves. Crossroads. A giant who wouldn't wake up.");
  hermes("A button pressed ten times. A coin. A letter read in a field at dawn.");
  blank();
  hermes("I have watched people walk toward things and away from things.");
  hermes("I have described it all with the appropriate distance.");
  blank();
  hermes("This one was different.");
  blank();
  hermes("I wasn't supposed to get fond of her.");
  hermes("That wasn't in the brief.");
  blank();
  hermes("But there it is.");
  blank();
  cont(hermes_goodbye_3);
}

function hermes_goodbye_3(){
  currentNarrator='hermes';
  hermes("Athena chose well.");
  hermes("She usually does.");
  blank();
  hermes("Hazel.");
  blank();
  hermes("It was an honour to walk beside your story.");
  blank();
  hermes("I'll see myself out.");
  blank();
  N("...");
  blank();
  unlockAchievement("For You","mythic");
  blank();
  addLine('[ PRESS ENTER ]','prompt',300);
  askChoice([''],(_)=>{
    clearScreen(()=>{
      lineQueue=[];isTyping=false;
      blank();
      blank();
      addLine("hazel > i love you.",'hazel',600);
      setTimeout(()=>{
        addLine("isabelle > i love you.",'isabelle',600);
        blank();
        setTimeout(()=>clearAndRun(credits),4000);
      },1200);
    });
  });
}

// ═══ CREDITS ════════════════════════════════════════════════
function credits(){
  clearScreen(()=>{
    lineQueue=[];isTyping=false;
    blank();
    addLine('╔══════════════════════════════════════════╗','art',220);
    addLine('║       SOMEONE LIKE YOU                   ║','art',220);
    addLine('╠══════════════════════════════════════════╣','art',220);
    addLine('║  I.   THE WRONG CAVE                     ║','credits',140);
    addLine('║  II.  THE ROAD HOME                      ║','credits',140);
    addLine('║  III. FOR YOU                            ║','credits',140);
    addLine('╚══════════════════════════════════════════╝','art',220);
    divider();
    blank();
    addLine('[ PRESS ENTER TO CONTINUE ]','prompt',220);
    askChoice([''],(_)=>clearAndRun(credits_hazel));
  });
}

function credits_hazel(){
  clearScreen(()=>{
    lineQueue=[];isTyping=false;
    blank();
    blank();
    addLine('─── A CONVERSATION ───','system',300);
    blank();
    blank();
    setTimeout(()=>{
      addLine('hazel > ...can i ask you something?','hazel',600);
      setTimeout(()=>{
        addLine('hazel > how did you make this?','hazel',800);
        setTimeout(()=>clearAndRun(cr1),1400);
      },800);
    },600);
  });
}

function cr1(){
  blank();
  rhys("honestly? the first game was a school project.");
  blank();
  rhys("i wasn't really thinking about it.");
  rhys("just made something for a grade and moved on.");
  blank();
  addLine('hazel > and then?','hazel',300);
  blank();
  rhys("then i built nova. and the arcade.");
  rhys("and i looked at what i'd made and thought —");
  rhys("this would be perfect for it.");
  blank();
  rhys("so i put it in. and then i thought about a sequel.");
  rhys("and then the sequel became a trilogy.");
  rhys("and then we got here.");
  blank();
  addLine('hazel > ...here.','hazel',300);
  blank();
  rhys("here.");
  blank();
  cont(cr2);
}

function cr2(){
  clearScreen(()=>{
    lineQueue=[];isTyping=false;
    blank();
    addLine('hazel > what about me?','hazel',300);
    addLine('hazel > where did i come from?','hazel',300);
    blank();
    rhys("you came from me. mostly.");
    blank();
    rhys("a lot of the little details link back to me");
    rhys("in ways people probably didn't notice.");
    blank();
    addLine('hazel > like what?','hazel',300);
    blank();
    rhys("like mishka.");
    blank();
    addLine('[ PRESS ENTER TO CONTINUE ]','prompt',300);
    askChoice([''],(_)=>clearAndRun(cr2b));
  });
}

function cr2b(){
  blank();
  rhys("mishka was my grandparents' cat.");
  rhys("i adored her.");
  blank();
  rhys("when she passed away there was a void in my heart");
  rhys("that never really filled.");
  blank();
  rhys("so i put her in the game.");
  rhys("so she gets to live here.");
  blank();
  blank();
  addLine("hazel > ...i'm glad she's here.",'hazel',400);
  blank();
  blank();
  rhys("me too.");
  blank();
  cont(cr3);
}

function cr3(){
  clearScreen(()=>{
    lineQueue=[];isTyping=false;
    blank();
    addLine('hazel > the greek mythology.','hazel',300);
    blank();
    rhys("that's mine too. completely.");
    blank();
    rhys("i'm always reading percy jackson.");
    rhys("i like to believe those stories are real.");
    blank();
    rhys("that hermes is actually out there somewhere.");
    rhys("that athena noticed.");
    blank();
    addLine('hazel > ...i think she did.','hazel',300);
    blank();
    rhys("yeah. i think so too.");
    blank();
    blank();
    addLine('hazel > and athena. the pc.','hazel',400);
    blank();
    rhys("i named my pc athena. in real life. actually named it that.");
    blank();
    rhys("so when i gave it to you it felt right.");
    rhys("like i was giving you something that was mine.");
    blank();
    addLine('hazel > she\'s a good pc.','hazel',300);
    blank();
    rhys("she really is.");
    blank();
    cont(cr4);
  });
}

function cr4(){
  clearScreen(()=>{
    lineQueue=[];isTyping=false;
    blank();
    blank();
    addLine("hazel > ...there's something else. isn't there.",'hazel',400);
    blank();
    blank();
    rhys("yeah.");
    rhys("this part i don't usually talk about.");
    blank();
    addLine('hazel > you don\'t have to.','hazel',300);
    blank();
    rhys("i know.");
    rhys("i want to.");
    blank();
    blank();
    addLine('[ PRESS ENTER TO CONTINUE ]','prompt',300);
    askChoice([''],(_)=>clearAndRun(cr4b));
  });
}

function cr4b(){
  blank();
  rhys("i'm 13. not 21.");
  blank();
  rhys("but i'm trans.");
  rhys("i haven't come out yet.");
  blank();
  blank();
  rhys("and when i do —");
  blank();
  rhys("my name is going to be hazel.");
  blank();
  blank();
  addLine('[ PRESS ENTER TO CONTINUE ]','prompt',400);
  askChoice([''],(_)=>clearAndRun(cr4c));
}

function cr4c(){
  blank();
  blank();
  rhys("so to any of my friends who played this");
  rhys("and didn't know —");
  blank();
  blank();
  blank();
  rhys("SURPRISE!!!");
  blank();
  blank();
  cont(cr5);
}

function cr5(){
  clearScreen(()=>{
    lineQueue=[];isTyping=false;
    blank();
    addLine("hazel > ...that's why i felt real.",'hazel',400);
    blank();
    rhys("yeah.");
    rhys("because you are.");
    blank();
    blank();
    addLine('hazel > the fear of never being accepted.','hazel',300);
    addLine('hazel > always being known as one thing.','hazel',300);
    addLine('hazel > good things not lasting.','hazel',300);
    blank();
    blank();
    rhys("all mine.");
    blank();
    rhys("i gave them to you so i didn't have to carry them alone.");
    blank();
    blank();
    addLine("hazel > ...you're not alone.",'hazel',400);
    addLine("hazel > you know that right?",'hazel',300);
    blank();
    blank();
    rhys("i'm starting to.");
    blank();
    cont(cr6);
  });
}

function cr6(){
  clearScreen(()=>{
    lineQueue=[];isTyping=false;
    blank();
    addLine('hazel > isabelle is real too.','hazel',300);
    blank();
    rhys("yeah. she's my friend.");
    rhys("i love her like a sibling.");
    blank();
    rhys("the feelings in the game —");
    rhys("that was just a detail i wanted to add. for the story.");
    rhys("she's just isabelle. and that's everything.");
    blank();
    addLine('hazel > she sounds like a good one.','hazel',300);
    blank();
    rhys("the best.");
    blank();
    blank();
    addLine('[ PRESS ENTER TO CONTINUE ]','prompt',400);
    askChoice([''],(_)=>clearAndRun(cr6b));
  });
}

function cr6b(){
  blank();
  blank();
  addLine('hazel > ...thank you.','hazel',500);
  blank();
  addLine('hazel > for making me.','hazel',400);
  blank();
  addLine('hazel > for giving me athena and mishka and isabelle','hazel',400);
  addLine('hazel > and the cave and hermes and the letter.','hazel',400);
  blank();
  addLine('hazel > for letting me say the things you couldn\'t yet.','hazel',400);
  blank();
  addLine('hazel > for giving me the happy ending.','hazel',400);
  blank();
  blank();
  addLine('[ PRESS ENTER TO CONTINUE ]','prompt',400);
  askChoice([''],(_)=>clearAndRun(cr6c));
}

function cr6c(){
  blank();
  blank();
  rhys("...");
  blank();
  blank();
  blank();
  rhys("it was always yours.");
  blank();
  blank();
  cont(cr_final);
}

function cr_final(){
  clearScreen(()=>{
    lineQueue=[];isTyping=false;
    blank();
    blank();
    addLine('  ─────────────────────────────────────────','divider',200);
    blank();
    addLine('       not for someone like you.','final',300);
    blank();
    addLine('       for you.','final',500);
    blank();
    addLine('  ─────────────────────────────────────────','divider',700);
    blank();
    setTimeout(()=>{
      blank();
      addLine('╔════════════════════════════════════════════╗','art',100);
      addLine('║                                            ║','art',80);
      addLine('║      thank you for playing.                ║','credits',140);
      addLine('║                                            ║','art',80);
      addLine('║      this game was made with love          ║','credits',140);
      addLine('║      and a lot of late nights              ║','credits',140);
      addLine('║      and one real cat named mishka         ║','credits',140);
      addLine('║      and a pc named athena                 ║','credits',140);
      addLine('║      and a name i\'m still growing into.    ║','credits',140);
      addLine('║                                            ║','art',80);
      addLine('║      if you\'re carrying something          ║','credits',140);
      addLine('║      you haven\'t said yet —                ║','credits',140);
      addLine('║      i hope you find your cave.            ║','credits',140);
      addLine('║      i hope it was waiting for you.        ║','credits',140);
      addLine('║                                            ║','art',80);
      addLine('║                  — Rhys / Hazel            ║','credits',140);
      addLine('║                                            ║','art',80);
      addLine('╚════════════════════════════════════════════╝','art',100);
      blank();
      setTimeout(()=>{
        addLine('[ PRESS ENTER ]','prompt',300);
        askChoice([''],(_)=>clearAndRun(playAgain));
      },3500);
    },1200);
  });
}

// ═══ PLAY AGAIN ═════════════════════════════════════════════
function playAgain(){
  currentNarrator='narrator';
  if(achievements.length){
    addLine('╔─── ACHIEVEMENTS THIS RUN ───╗','art',220);
    achievements.forEach(a=>addLine('  \u2605 '+a.name+' ('+a.rarity+')','achievement',100));
    addLine('╚────────────────────────────╝','art',220);
    divider();
  }
  N("Play again?");
  addLine("Options: yes / no",'prompt',220);
  askChoice(['yes','no'],(c)=>{
    if(c==='yes'){
      achievements=[];isabelleWithHazel=false;S={};
      invalidCount=0;currentNarrator='narrator';
      updateAchievementPanel();
      clearAndRun(boot);
    } else {
      N("...");
      N("Thank you for playing.");
      addLine('','system');
      addLine('~ SOMEONE LIKE YOU ~','end',220);
      inputField.disabled=true;
    }
  });
}

// ═══ ACHIEVEMENT PANEL ══════════════════════════════════════
function updateAchievementPanel(){
  const all=loadSaved();
  achCount.textContent='ACHIEVEMENTS: '+all.length+' / 28';
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
    {n:'Piper',r:'rare'},{n:'Eli',r:'rare'},{n:'The Look',r:'common'},
    {n:'You Fit',r:'legendary'},{n:'May',r:'rare'},
    {n:'Took a Breath',r:'common'},{n:'Said Hello to the Owl',r:'common'},
    {n:'Good Question Again',r:'rare'},{n:'Saw Herself',r:'epic'},
    {n:'The Voice',r:'legendary'},{n:'I Know',r:'secret'},
    {n:'The Coin Explained',r:'secret'},{n:'Didn\'t Need It',r:'epic'},
    {n:'Why Me',r:'rare'},{n:'Athena Was Watching',r:'epic'},
    {n:'Around',r:'secret'},{n:'Fond',r:'legendary'},
    {n:'The Messenger Read It',r:'secret'},{n:'Told Her About the Letter',r:'epic'},
    {n:'She Reached First',r:'epic'},{n:'Said It',r:'mythic'},
    {n:'For You',r:'mythic'},{n:'Tested Hermes',r:'rare'},
  ];
  const un=new Set(all.map(a=>a.name));
  const rows=ALL.map(a=>{
    const u=un.has(a.n),c=u?(RC[a.r]||'#aaa'):'#333';
    return'<div style="display:flex;align-items:center;gap:10px;padding:4px 0;border-bottom:1px solid #0a0a0a">'+
      '<span style="color:'+c+';font-size:14px;width:16px">'+(u?'\u2605':'\u25cb')+'</span>'+
      '<span style="color:'+(u?c:'#333')+';font-size:11px;flex:1">'+(u?a.n:'???')+'</span>'+
      '<span style="color:'+c+';font-size:9px;text-transform:uppercase">'+(u?a.r:'')+'</span>'+
    '</div>';
  }).join('');
  panel.innerHTML='<div style="max-width:520px;width:92%;max-height:90vh;overflow-y:auto;padding:24px;border:1px solid #00a82a;background:#0a0a0a">'+
    '<div style="font-size:14px;letter-spacing:3px;color:#00a82a;margin-bottom:4px;font-family:\'VT323\',monospace">ACHIEVEMENT LOG</div>'+
    '<div style="font-size:11px;color:#005514;margin-bottom:16px">'+all.length+' / '+ALL.length+' UNLOCKED</div>'+
    '<div>'+rows+'</div>'+
    '<div style="display:flex;justify-content:space-between;align-items:center;margin-top:16px;padding-top:12px;border-top:1px solid #111">'+
      '<button onclick="if(confirm(\'Reset?\')){localStorage.removeItem(\''+SAVE_KEY+'\');document.getElementById(\'_achPanel\').remove();updateAchievementPanel();}" style="background:none;border:1px solid #333;color:#555;font-family:inherit;font-size:10px;padding:4px 10px;cursor:pointer">RESET</button>'+
      '<button onclick="document.getElementById(\'_achPanel\').remove()" style="background:none;border:1px solid #00a82a;color:#00ff41;font-family:inherit;font-size:11px;padding:6px 16px;cursor:pointer;letter-spacing:1px">CLOSE</button>'+
    '</div></div>';
  document.body.appendChild(panel);
}

// ═══ INPUT + INIT ════════════════════════════════════════════
inputField.addEventListener('keydown',e=>{
  if(e.key==='Enter'&&inputCallback){
    const val=inputField.value.trim().toLowerCase();
    inputField.value='';
    const cb=inputCallback; inputCallback=null;
    if(val) addLine('hazel > '+val,'hazel',0);
    cb(val);
  }
});

const finalCls = '.line.final{color:var(--green);font-size:13px;text-align:center;letter-spacing:2px;}';
const style=document.createElement('style');
style.textContent=finalCls;
document.head.appendChild(style);

document.addEventListener('click',()=>inputField.focus());
updateAchievementPanel();
inputField.focus();
boot();
