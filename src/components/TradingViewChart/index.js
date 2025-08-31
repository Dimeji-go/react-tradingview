import React, { Component } from "react";
import binanceAPI from "../../services/api";
import "./index.scss";

export default class TradingViewChart extends Component {
  constructor({ chartProperties, onSymbolChangeCallback }) {
    super();
    this.state = {
      isChartReady: false,
    };
    this.bfAPI = new binanceAPI({ debug: false });
    this.widgetOptions = {
      container_id: "chart_container",
      datafeed: this.bfAPI,
      library_path: "/scripts/charting_library/",
      disabled_features: ["timeframes_toolbar", "header_undo_redo"],
      ...chartProperties,
    };
    this.tradingViewWidget = null;
    this.chartObject = null;
    this.onSymbolChangeCallback = onSymbolChangeCallback;
  }

  chartReady = () => {
    if (!this.tradingViewWidget) return;

    this.tradingViewWidget.onChartReady(() => {
      this.chartObject = this.tradingViewWidget.activeChart();
      this.setState({ isChartReady: true });

      // Subscribe to symbol changes within TradingView Chart
      if (this.onSymbolChangeCallback && this.chartObject) {
        this.chartObject.onSymbolChanged().subscribe(null, (newSymbolData) => {
          // --- THIS IS THE CRUCIAL FIX ---
          // newSymbolData is typically an object returned by the datafeed's resolveSymbol
          // We need to extract the actual symbol string, which is usually in 'name' or 'ticker'
          let actualSymbol = newSymbolData; // Default to the value if it's already a string

          if (typeof newSymbolData === "object" && newSymbolData !== null) {
            // Prioritize 'name' or 'ticker' from the object
            if (newSymbolData.name) {
              actualSymbol = newSymbolData.name;
            } else if (newSymbolData.ticker) {
              actualSymbol = newSymbolData.ticker;
            }
            if (
              typeof actualSymbol === "string" &&
              actualSymbol.includes(":")
            ) {
              actualSymbol = actualSymbol.split(":")[1];
            }
          }

          if (typeof actualSymbol === "string") {
            this.onSymbolChangeCallback(actualSymbol);
          } else {
            console.error(
              "TradingView symbol change returned an unexpected format:",
              newSymbolData,
            );
          }
        });
      }
    });
  };

  componentDidMount() {
    if (window.TradingView && window.TradingView.widget) {
      this.tradingViewWidget = window.tvWidget = new window.TradingView.widget(
        this.widgetOptions,
      );
      this.chartReady();
    } else {
      console.warn("TradingView widget script not loaded.");
    }
  }

  componentDidUpdate(prevProps) {
    if (
      this.props.chartProperties.symbol !== prevProps.chartProperties.symbol
    ) {
      if (this.chartObject) {
        this.chartObject.setSymbol(this.props.chartProperties.symbol);
      } else {
        console.warn(
          "TradingView chartObject not ready for setSymbol. Consider re-initializing if necessary.",
        );
        // This 'key' prop on TradingViewChart in ChartPage is designed to handle this by re-creating it.
      }
    }
  }

  componentWillUnmount() {
    if (this.tradingViewWidget) {
      // You might need to explicitly unsubscribe if onSymbolChanged returns a subscription object
      // For simple callbacks, just removing the widget usually suffices.
      this.tradingViewWidget.remove();
      this.tradingViewWidget = null;
    }
    this.chartObject = null;
    window.tvWidget = null; // Clear global reference if set
  }

  render() {
    return <div id="chart_container"></div>;
  }
}
