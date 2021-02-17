import {loadStdlib} from '@reach-sh/stdlib';
import * as backend from './build/index.main.mjs';

const moves = ['Forwards', 'Backwards', 'Left', 'Right', 'A Button'];
const numOfPlayers = 10;

(async () => {
  const stdlib = await loadStdlib();
  const startingBalance = stdlib.parseCurrency(100);

  const observer = await stdlib.newTestAccount(startingBalance);
  const playerArray = await Promise.all(
    Array.from({length:10 }, () => stdlib.newTestAccount(startingBalance))
  );

  const ctcObserver = observer.deploy(backend);
  //const ctcPlayer = player.attach(backend, ctcObserver.getInfo());

  await Promise.all([
    backend.Observer(ctcObserver, {
      getParams: ({
        payoutPerDuration: 5,
        moveLimit: 20
      }),
      observeMove: (move) => {
        console.log(`Move: ${moves[move-1]}`);
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
        // confirmMove = Fun([UInt], Tuple(Bool, (move) UInt, (duration) UInt, (toPay) UInt))
        return [true, move, 5, 5*move];
      }
    });
  })));



  console.log('[DEBUG] Game has finished.');
})();
