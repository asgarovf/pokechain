import {loadStdlib} from '@reach-sh/stdlib';
import * as backend from './build/index.main.mjs';

const moves = ['Forwards', 'Backwards', 'Left', 'Right', 'A Button'];
const numOfPlayers = 10;
var gameList = [];

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
        console.log(`Observer observed the moveList with length ${gameList.length}"`);       
        // TODO: API call POST(move) setMove
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
        const move = (Math.floor(Math.random() * 5)+1);
        console.log(`Player ${i} played to move "${moves[move-1]}"`);
        gameList.push(move);
        // TODO: For now API Call is here
        return [true, move, 5, 5*move];
      }
    });
  })));



  console.log('[DEBUG] Game has finished.');
})();
