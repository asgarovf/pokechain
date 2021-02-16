import {loadStdlib} from '@reach-sh/stdlib';
import * as backend from './build/index.main.mjs';

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
        console.log(`Move: ${move}`);
      },  
      observeGameFinish: () => {
        console.log("Game has finished");
      }
    }),
    backend.Player(ctcPlayer, {
      confirmMove: (payoutPerDuration) => {
        return [true, 2, 5, 10];
      }
    }),
  ]);

  console.log('Hello, Alice and Bob!');
})();
