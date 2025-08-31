import React, { Component } from "react";
import { withRouter } from "react-router-dom";
import TradingViewChart from "../../components/TradingViewChart";
import "./index.scss";

function getLocalLanguage() {
  return navigator.language.split("-")[0] || "en";
}

class ChartPage extends Component {
  constructor(props) {
    super(props);
    const initialSymbol = props.match.params.symbol || "BTCUSDT";

    this.state = {
      currentSymbol: initialSymbol,
    };

    this.cOptions = {
      locale: getLocalLanguage(),
      debug: false,
      fullscreen: false,
      symbol: initialSymbol,
      interval: "60",
      theme: "light",
      allow_symbol_change: true,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      autosize: true,
    };
  }

  // Lifecycle method to update state if URL param changes while component is mounted
  componentDidUpdate(prevProps) {
    if (this.props.match.params.symbol !== prevProps.match.params.symbol) {
      this.setState({ currentSymbol: this.props.match.params.symbol });
    }
  }

  // Callback from TradingViewChart when its internal symbol changes
  handleTradingViewSymbolChange = (newSymbol) => {
    // Check if the symbol actually changed to avoid unnecessary history pushes
    if (newSymbol && newSymbol !== this.state.currentSymbol) {
      this.props.history.push(`/chart/${newSymbol}`);
      this.setState({ currentSymbol: newSymbol });
    }
  };

  render() {
    const { currentSymbol } = this.state;

    // Use a key on TradingViewChart to force re-render if currentSymbol changes
    const chartKey = `tv-chart-${currentSymbol}`;

    return (
      <div className="chart-page-container">
        <button
          className="back-button"
          onClick={() => this.props.history.push("/")}
        >
          &larr; Back to Categories
        </button>
        <h2 className="chart-title">Live Chart for {currentSymbol}</h2>
        <div className="chart-wrapper">
          <TradingViewChart
            chartProperties={{ ...this.cOptions, symbol: currentSymbol }}
            onSymbolChangeCallback={this.handleTradingViewSymbolChange}
            key={chartKey}
          />
        </div>
      </div>
    );
  }
}

export default withRouter(ChartPage);
