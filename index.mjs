import {loadStdlib} from '@reach-sh/stdlib';
import * as backend from './build/index.main.mjs';
import { ask, yesno, done } from '@reach-sh/stdlib/ask.mjs';


// ! A range check is necessary
const moves = ['Up', 'Down', 'Left', 'Right', 'A Button', 'B Button'];
const numOfPlayers = 10;

var moveList = [];

function printSplash() {
  console.log("────────▄███████████▄─────────────────────────────────────");
  console.log("─────▄███▓▓▓▓▓▓▓▓▓▓▓███▄ ─────────────────────────────────");
  console.log("────███▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓███                                 ");
  console.log("───██▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓██                                ");
  console.log("──██▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓██                               ");
  console.log("─██▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓██                              ");
  console.log("██▓▓▓▓▓▓▓▓▓███████▓▓▓▓▓▓▓▓▓██                             ");
  console.log("██▓▓▓▓▓▓▓▓██░░░░░██▓▓▓▓▓▓▓▓██                             ");
  console.log("██▓▓▓▓▓▓▓██░░███░░██▓▓▓▓▓▓▓██                             ");
  console.log("███████████░░███░░███████████        POKÉCHAIN APP        ");
  console.log("██░░░░░░░██░░███░░██░░░░░░░██     written with Reach      ");
  console.log("██░░░░░░░░██░░░░░██░░░░░░░░██                             ");
  console.log("██░░░░░░░░░███████░░░░░░░░░██                             ");
  console.log("─██░░░░░░░░░░░░░░░░░░░░░░░██                              ");
  console.log("──██░░░░░░░░░░░░░░░░░░░░░██                               ");
  console.log("───██░░░░░░░░░░░░░░░░░░░██                                ");
  console.log("────███░░░░░░░░░░░░░░░███                                 ");
  console.log("─────▀███░░░░░░░░░░░███▀ ─────────────────────────────────");
  console.log("────────▀███████████▀─────────────────────────────────────\n\n");
}

function printMoves () {
  console.log("\n\n,-------------------------.");
  console.log("(_\\                       \\");
  console.log("   |     Moves List:      |");
  console.log("   |                      |");
  console.log("   |    1 - Up            |");
  console.log("   |    2 - Down          |");
  console.log("   |    3 - Left          |");
  console.log("   |    4 - Right         |");
  console.log("   |    5 - A Button      |");
  console.log("   |    6 - B Button      |");
  console.log(" (_/______________________/\n");
}

async function getName () {
  let name = await ask("Please enter your name", ((x) => x));
  return name;
}

(async () => {
  printSplash();
  console.log("Starting iteration v1.07");
  const stdlib = await loadStdlib();

  const isObserver = await ask(
    `Are you the Observer?`,
    yesno
  );
  const who = isObserver ? 'Observer' : 'Player';

  console.log(`\nStarting Pokéchain as ${who}`);

  let acc = null;
  const createAcc = await ask(
    `\nWould you like to create an account? (only possible on devnet)`,
    yesno
  );
  if (createAcc) {
    acc = await stdlib.newTestAccount(stdlib.parseCurrency(1000));
  } else {
    const secret = await ask(
      `What is your account secret?`,
      (x => x)
    );
    acc = await stdlib.newAccountFromSecret(secret);
  }

  let ctc = null;
  const deployCtc = await ask(
    `\nDo you want to deploy the contract? (y/n)`,
    yesno
  );
  if (deployCtc) {
    ctc = acc.deploy(backend);
    const info = await ctc.getInfo();
    console.log(`\nThe contract is deployed as = ${JSON.stringify(info)}`);
  } else {
    const info = await ask(
      `\nPlease paste the contract information:`,
      JSON.parse
    );
    ctc = acc.attach(backend, info);
  }
  
  const fmt = (x) => stdlib.formatCurrency(x, 4);
  const getBalance = async () => fmt(await stdlib.balanceOf(acc));

  const before = await getBalance();
  console.log(`\nYour balance is ${before}`);

  const interact = {};

  if(isObserver) {
    interact.getParams = async () => {
        const moveLimit = await ask("How many turns there will be?", parseInt);
        const payoutPerDuration = await ask("What is the unit cost of the move?", stdlib.parseCurrency);
        return ({
            payoutPerDuration: payoutPerDuration,
            moveLimit: moveLimit
        });
    };

    interact.getMoves = (totalPlayers) => {
      if(moveList.length == []) {
          console.log("[DEBUG] moveList length is 0");
          for (let i = 0; i < totalPlayers; i++) {
            moveList.push(0);
          }
          return moveList;
      } 
      console.log("[DEBUG] moveList is populated");
      return moveList;
    };

    interact.observeLoopFinish = () => console.log("[DEBUG] Loop finish");

    // TODO: Change name and var type
    interact.observeMove = (move) => {
        // TODO: moveList.push(move)
        moveList.push(move);
        // TODO: Print move
        console.log(`\n-----\nObserver observed the move ${moves[move-1]}.\n-----`);
        // TODO: Send move to the API 
        // moveList = movesList;
        // // * Operate on array here * //
        // // TODO: API call POST(move) setMove
        // console.log(`\n-----\nMoves List: \n${movesList}\n-----`);
    };

    interact.observeGameFinish = () => {
        console.log("Game has finished");
        // TODO: API call POST() gameFinish
    };

    interact.observeTurnStart = (turnNum) => {
        console.log(`\n-----\nStart of Turn ${turnNum}\n-----\n`);
    };
  } else {
    const name = await getName();
    interact.acceptMove = async (payoutPerDuration) => {
        const response = await ask(
          `\nYou need to pay ${stdlib.formatCurrency(payoutPerDuration, 7)} ALGO for every second of input.\nDo you want to make a move? (y/n)\n>> `,
          yesno
        );

        if (!response) {
          console.log(`\n${name} refused to make a move.`);
        }

        return response;
    };
    interact.getMove = async () => {
        // TODO: Make a function here        
        printMoves();

        const move = await ask(
          "Which move do you want to play?",
          parseInt
        );
        
        // TODO: Range check
        const duration = await ask(
          "How long do you want your input to be?",
          parseInt
        );

        console.log(`${name} played to move "${moves[move-1]}"`);
        return [move, duration, duration*move];
    };
  }

  const part = isObserver ? backend.Observer : backend.Player;
  await part(ctc, interact);

  const after = await getBalance();
  console.log(`Your balance is now ${after}`);

  done();

  console.log('[DEBUG] Game has finished.');
})();

// #################################################

//   const startingBalance = stdlib.parseCurrency(100);

//   const observer = await stdlib.newTestAccount(startingBalance);
//   const playerArray = await Promise.all(
//     Array.from({length:10 }, () => stdlib.newTestAccount(startingBalance))
//   );

//   const ctcObserver = observer.deploy(backend);
  
//   printSplash();

//   await Promise.all([
//     backend.Observer(ctcObserver, {
//       getParams: async () => {
//         const moveLimit = await ask("How many turns there will be?", parseInt);
//         const payoutPerDuration = await ask("What is the unit cost of the move?", parseFloat);
//         return ({
//           payoutPerDuration: Math.floor(stdlib.parseCurrency(payoutPerDuration)),
//           moveLimit: moveLimit
//         });
//       },
//       observeMoves: (movesList) => {
//         // * Operate on array here * //
//         // TODO: API call POST(move) setMove
//         console.log(`\n-----\nObserver observed the moveList with length ${gameList.length}"`);  
//         console.log(`Moves in UInt: ${gameList} \n-----\n`);     
//         gameList = [];
//       },  
//       observeGameFinish: () => {
//         console.log("Game has finished");
//         // TODO: API call POST() gameFinish
//       },
//       observeTurnStart: (turnNum) => {
//         console.log(`\n-----\nStart of Turn ${turnNum+1}\n-----\n`);
//       }
//     })
//   ].concat(playerArray.map((player, i) => {
//     const ctcPlayer = player.attach(backend, ctcObserver.getInfo());

//     return backend.Player(ctcPlayer, {
//       acceptMove: async (payoutPerDuration) => {
//         const response = await ask(
//           `You need to pay ${stdlib.formatCurrency(payoutPerDuration, 7)} ALGO for every second of input.\nDo you want to make a move? (y/n)\n>> `,
//           yesno
//         );

//         if (!response) {
//           const name = (i in nameList) ? nameList[i] : "Make a function here";
//           console.log(`\n${name} (Player ${i}) refused to make a move.`);
//         }

//         return response;
//       },
//       getMove: async () => {
//         // TODO: Make a function here
//         const name = (i in nameList) ? nameList[i] : "Make a function here";
        
//         printMoves();

//         const move = await ask(
//           "Which move do you want to play?",
//           parseInt
//         );
        
//         // TODO: Range check
//         const duration = await ask(
//           "How long do you want your input to be?",
//           parseInt
//         );

//         console.log(`${name} (Player ${i}) played to move "${moves[move-1]}"`);
//         gameList.push(move);
//         return [move, duration, duration*move];
//       }
//     });
//   })));