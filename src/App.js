import React from "react";
import { BrowserRouter as Router, Switch, Route } from "react-router-dom";
import CategoriesPage from "./pages/CategoriesPage";
import ChartPage from "./pages/ChartPage";

function App() {
  return (
    <Router>
      <div className="app">
        <Switch>
          <Route exact path="/" component={CategoriesPage} />
          <Route path="/chart/:symbol" component={ChartPage} />
        </Switch>
      </div>
    </Router>
  );
}

export default App;
