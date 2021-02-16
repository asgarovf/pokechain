'reach 0.1';

/*
  * Problem Analysis
  - Who involved in this application
  1. step: 1 observer and 10 players
  2. step: 1 observer and N players

  - What info do they know at start?
  Observer has the game and knows the payout for duration
  Players know the moves and duration they will play

  - What info they will know in the application?
  Players will learn the payout for every duration.
  They will decide the move and decision and send it to Observer, paying the amount
  Observer will learn players moves and durations.

  - What funds will change ownership?
  1. step: duration * payoutPerDuration is transactioned every time.
  At the end of the game balance is transferred to a charity.

  2. step: duration * payoutPerDuration is transactioned every time.
  Every time an important step happens in game, the last move maker takes the money.

  * Data Definition
  duration: UInt
  move: UInt
  payoutPerDonation: UInt
  moveLimit: UInt

  * Participate Interfaces
  ? Observer 
  {
    getParams = {
      payoutPerDuration: UInt,
      moveLimit = UInt
    }
  }

  ? Player 
  {
    confirmMove = Fun([UInt], Tuple(Bool, (move) UInt, (duration) UInt))
  }

  * Communication Construction
  -> Observer sets the payoutPerDuration and moveLimit,
  -> While total moves are less than moveLimit:
    -> Ask particioant to play a move
    -> If player accepts:
      -> Pay the price to consensus, publish the move
    -> Else
      -> Let others know player refuses

  -> Pay the balance to observer.
  Finish the program
  
*/

const Observer = {
  getParams : {
    payoutPerDuration: UInt,
    moveLİmit: UInt,
  }
};

const Player = {
  confirmMove: Fun([UInt], Tuple(Bool, UInt, UInt))
};

export const main = Reach.App(
  {}, [['Observer', Observer], ['Player', Player]], (Alice, Bob) => {
    
  }
);
