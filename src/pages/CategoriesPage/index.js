import React, { Component } from "react";
import { withRouter } from "react-router-dom";
import binanceAPI from "../../services/api";
import "./index.scss";

class CategoriesPage extends Component {
  constructor() {
    super();
    this.state = {
      allMarketsData: [],
      hotMarkets: [],
      topGainers: [],
      topLosers: [],
      activeCategory: "hot",
      sortConfig: { key: null, direction: "asc" },
      loading: true,
      error: null,
    };
    this.binanceApi = new binanceAPI({ debug: false });
  }

  async componentDidMount() {
    await this.fetchMarketData();
  }

  fetchMarketData = async () => {
    this.setState({ loading: true, error: null });
    try {
      const tickerData = await this.binanceApi.get24hrTicker();

      const filteredData = tickerData.filter((market) => {
        return (
          parseFloat(market.quoteVolume) > 1000000 &&
          market.symbol.endsWith("USDT")
        );
      });

      const listLength = 20;

      const sortedByVolume = [...filteredData].sort(
        (a, b) => parseFloat(b.quoteVolume) - parseFloat(a.quoteVolume),
      );
      const sortedByGainers = [...filteredData].sort(
        (a, b) =>
          parseFloat(b.priceChangePercent) - parseFloat(a.priceChangePercent),
      );
      const sortedByLosers = [...filteredData].sort(
        (a, b) =>
          parseFloat(a.priceChangePercent) - parseFloat(b.priceChangePercent),
      );

      this.setState({
        allMarketsData: filteredData,
        hotMarkets: sortedByVolume.slice(0, listLength),
        topGainers: sortedByGainers.slice(0, listLength),
        topLosers: sortedByLosers.slice(0, listLength),
        loading: false,
      });
    } catch (error) {
      console.error("Error fetching market data:", error);
      this.setState({ error: "Failed to load market data.", loading: false });
    }
  };

  handleCategoryClick = (category) => {
    this.setState({
      activeCategory: category,
      sortConfig: { key: null, direction: "asc" },
    });
  };

  formatPrice = (price) => {
    const p = parseFloat(price);
    if (isNaN(p)) return "-";
    if (p >= 1000) return p.toFixed(2);
    if (p >= 100) return p.toFixed(3);
    if (p >= 10) return p.toFixed(4);
    if (p >= 1) return p.toFixed(5);
    return p.toFixed(8);
  };

  requestSort = (key) => {
    let direction = "asc";
    if (
      this.state.sortConfig.key === key &&
      this.state.sortConfig.direction === "asc"
    ) {
      direction = "desc";
    }
    this.setState({ sortConfig: { key, direction } });
  };

  getSortedMarkets = () => {
    const { activeCategory, sortConfig } = this.state;
    let markets = [];

    switch (activeCategory) {
      case "hot":
        markets = [...this.state.hotMarkets];
        break;
      case "gainers":
        markets = [...this.state.topGainers];
        break;
      case "losers":
        markets = [...this.state.topLosers];
        break;
      default:
        markets = [...this.state.hotMarkets];
    }

    if (sortConfig.key !== null) {
      markets.sort((a, b) => {
        const valA = parseFloat(a[sortConfig.key]);
        const valB = parseFloat(b[sortConfig.key]);

        if (valA < valB) return sortConfig.direction === "asc" ? -1 : 1;
        if (valA > valB) return sortConfig.direction === "asc" ? 1 : -1;
        return 0;
      });
    }
    return markets;
  };

  getSortIcon = (key) => {
    const { sortConfig } = this.state;
    if (sortConfig.key === key) {
      return sortConfig.direction === "asc" ? " ▲" : " ▼";
    }
    return " ↕";
  };

  handleRowClick = (symbol) => {
    this.props.history.push(`/chart/${symbol}`);
  };

  renderMarketTable = () => {
    const markets = this.getSortedMarkets();

    if (this.state.loading)
      return <p className="loading-message">Loading markets...</p>;
    if (this.state.error)
      return <p className="error-message">{this.state.error}</p>;
    if (markets.length === 0)
      return (
        <p className="no-data-message">
          No markets available for this category.
        </p>
      );

    return (
      <div className="market-table-container">
        <p className="hint-text">
          Click any row to open the chart for that coin.
        </p>
        <table className="market-table">
          <thead>
            <tr>
              <th>Coin Name</th>
              <th
                onClick={() => this.requestSort("priceChangePercent")}
                className="sortable-header"
              >
                % Change (24h) {this.getSortIcon("priceChangePercent")}
              </th>
              <th
                onClick={() => this.requestSort("lastPrice")}
                className="sortable-header"
              >
                Price ($) {this.getSortIcon("lastPrice")}
              </th>
            </tr>
          </thead>
          <tbody>
            {markets.map((market) => (
              <tr
                key={market.symbol}
                onClick={() => this.handleRowClick(market.symbol)}
                className="market-row"
              >
                <td>{market.symbol}</td>
                <td
                  className={
                    parseFloat(market.priceChangePercent) >= 0 ? "gain" : "loss"
                  }
                >
                  {parseFloat(market.priceChangePercent).toFixed(2)}%
                </td>
                <td>{this.formatPrice(market.lastPrice)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  render() {
    const { activeCategory } = this.state;

    return (
      <div className="categories-page-container">
        <h1 className="page-title">Crypto Market Overview</h1>
        <div className="tabs-container">
          <button
            className={`tab ${activeCategory === "hot" ? "active" : ""}`}
            onClick={() => this.handleCategoryClick("hot")}
          >
            Hot Markets
          </button>
          <button
            className={`tab ${activeCategory === "gainers" ? "active" : ""}`}
            onClick={() => this.handleCategoryClick("gainers")}
          >
            Top Gainers
          </button>
          <button
            className={`tab ${activeCategory === "losers" ? "active" : ""}`}
            onClick={() => this.handleCategoryClick("losers")}
          >
            Top Losers
          </button>
        </div>

        {this.renderMarketTable()}
      </div>
    );
  }
}

export default withRouter(CategoriesPage);
