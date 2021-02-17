import {loadStdlib} from '@reach-sh/stdlib';
import * as backend from './build/index.main.mjs';

const moves = ['Forwards', 'Backwards', 'Left', 'Right', 'A Button'];

(async () => {
  const stdlib = await loadStdlib();
  const startingBalance = stdlib.parseCurrency(100);

  const observer = await stdlib.newTestAccount(startingBalance);
  const player = await stdlib.newTestAccount(startingBalance);

  const ctcObserver = observer.deploy(backend);
  const ctcPlayer = player.attach(backend, ctcObserver.getInfo());

  await Promise.all([
    backend.Observer(ctcObserver, {
      getParams: ({
        payoutPerDuration: 5,
        moveLimit: 20
      }),
      observeMove: (move) => {
        console.log(`Move: ${moves[move-1]}`);
      },  
      observeGameFinish: () => {
        console.log("Game has finished");
      }
    }),
    backend.Player(ctcPlayer, {
      confirmMove: (payoutPerDuration) => {
        const move = (Math.floor(Math.random() * 5)+1);
        // confirmMove = Fun([UInt], Tuple(Bool, (move) UInt, (duration) UInt, (toPay) UInt))
        return [true, move, 5, 5*move];
      }
    }),
  ]);

  console.log('[DEBUG] Game has finished.');
})();
