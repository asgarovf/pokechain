import {loadStdlib} from '@reach-sh/stdlib';
import * as backend from './build/index.main.mjs';

const moves = ['Forwards', 'Backwards', 'Left', 'Right', 'A Button'];
const numOfPlayers = 10;
var gameList = [];
var nameList = {
  0: "Glenda",
  1: "Florence",
  2: "Lionel",
  3: "Tiffany",
  4: "Orson",
  5: "Todd",
  6: "Ronny",
  7: "Margaretta",
  8: "Alice",
  9: "Bob",
};

(async () => {
  const stdlib = await loadStdlib();
  const startingBalance = stdlib.parseCurrency(100);

  const observer = await stdlib.newTestAccount(startingBalance);
  const playerArray = await Promise.all(
    Array.from({length:10 }, () => stdlib.newTestAccount(startingBalance))
  );

  const ctcObserver = observer.deploy(backend);

  await Promise.all([
    backend.Observer(ctcObserver, {
      getParams: ({
        payoutPerDuration: 5,
        moveLimit: 20
      }),
      observeMove: (movesList) => {
        // * Operate on array here * //
        // TODO: API call POST(move) setMove
        console.log(`\n-----\nObserver observed the moveList with length ${gameList.length}"`);  
        console.log(`Moves in UInt: ${gameList} \n-----\n`);     
        gameList = [];
      },  
      observeGameFinish: () => {
        console.log("Game has finished");
        // TODO: API call POST() gameFinish
      }
    })
  ].concat(playerArray.map((player, i) => {
    const ctcPlayer = player.attach(backend, ctcObserver.getInfo());

    return backend.Player(ctcPlayer, {
      confirmMove: (payoutPerDuration) => {
        const name = (i in nameList) ? nameList[i] : "Make a function here";
        if(Math.random() < 0.2){
          console.log(`${name} (Player ${i}) refused to make a move`);
          return [false, 0, 1, 0];
        }

        const move = (Math.floor(Math.random() * 5)+1);
        console.log(`${name} (Player ${i}) played to move "${moves[move-1]}"`);
        gameList.push(move);
        return [true, move, 5, 5*move];
      }
    });
  })));



  console.log('[DEBUG] Game has finished.');
})();
