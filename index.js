import React from 'react';
import AppViews from './views/AppViews';
import DeployerViews from './views/DeployerViews';
import AttacherViews from './views/AttacherViews';
import { renderDOM, renderView } from './views/render';
import './index.css';
import * as backend from './build/index.main.mjs';
import * as reach from '@reach-sh/stdlib/ETH';

const { standardUnit } = reach;

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = { view: 'ConnectAccount', ...defaults };
  }
  async componentDidMount() {
    // Shell account
    const acc = await reach.getDefaultAccount();

    // Get default balance and format it
    const balAtomic = await reach.balanceOf(acc);
    const bal = reach.formatCurrency(balAtomic, 4);

    // var acc = bal
    this.setState({ acc, bal });
    // Reach devNet stuff
    try {
      const faucet = await reach.getFaucet();
      this.setState({ view: 'FundAccount', faucet });
    } catch (e) {
      // * This will be Observer or Player
      this.setState({ view: 'ObserverOrPlayer' });
    }
  }
  // faucet func for devnet
  async fundAccount(fundAmount) {
    await reach.transfer(this.state.faucet, this.state.acc, reach.parseCurrency(fundAmount));
    this.setState({ view: 'ObserverOrPlayer' });
  }
  async skipFundAccount() { this.setState({ view: 'ObserverOrPlayer' }); }
  // * selectObserver / selectPlayer
  selectPlayer() { this.setState({ view: 'Wrapper', ContentView: Player }); }
  selectObserver() { this.setState({ view: 'Wrapper', ContentView: Observer }); }
  render() { return renderView(this, AppViews); }
}

class Player extends React.Component {
  constructor(props) {
    super(props);
    this.state = { view: 'Attach' };
  }
  attach(ctcInfoStr) {
    const ctc = this.props.acc.attach(backend, JSON.parse(ctcInfoStr));
    this.setState({ view: 'Attaching' });
    backend.Player(ctc, this);
  }
  /**
   * confirm if player wants to make a move
   * if yes, return a tuple starting with true
   * else return a tuple starting with false
   */
  async acceptMove(payoutPerDuration) {
    const response = await new Promise(resolveResponseP => {
      this.setState({ view: 'AcceptMove', cost: payoutPerDuration, resolveResponseP });
    });
    return response;
  }

  async getMove() {
    const move = await new Promise(resolveMoveP => {
      this.setState({ view: 'GetMove', resolveMoveP });
    });
    return move;
  }

  async getName() {
    const name = await new Promise(resolveNameP => {
      this.setState({ view: 'GetName', resolveMoveP: resolveNameP });
    });
    return name;
  }
  // seeOutcome(i) { this.setState({view: 'Done', outcome: intToOutcome[i]}); }
  // informTimeout() { this.setState({view: 'Timeout'}); }
  // playMove(move) { this.state.playedMove(move); }
}

class Observer extends React.Component {
  constructor(props) {
    super(props);
    this.state = { view: 'SetGame' }
  }
  async deploy() {
    const ctc = this.props.acc.deploy(backend);
    this.setState({ view: 'Deploying', ctc });
    this.wager = reach.parseCurrency(this.state.wager); // UInt
    backend.Observer(ctc, this);
    const ctcInfoStr = JSON.stringify(await ctc.getInfo(), null, 2);
    this.setState({ view: 'WaitingForPlayer', ctcInfoStr });
  }

  // ? Observer Interface Methods

  async getParams() {
    const params = await new Promise(resolveParamsP => {
      this.setState({ view: 'GetParams', resolveParamsP });
      return params;
    });
  }

  observeMove(move, duration, toPay, name) {
    console.log(`Move received.\nReceived move is: ${move}, (${duration}-${toPay}-${name})`);
    this.setState({
      view: 'ObserveMove',
      move: move,
      duration: duration,
      toPay: toPay,
      name: name
    });
  }

  observeGameFinish() {
    this.setState({ view: 'GameFinish' });
  }

  observeTurnStart(turnNum) {
    this.setState({ view: 'TurnStart', turnNum: turnNum });
  }
}

renderDOM(<App />);