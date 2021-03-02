import ReactDOM from "react-dom";
import React from "react";
import {BrowserRouter as Router, Route, Switch} from "react-router-dom";
import 'semantic-ui-css/semantic.min.css'
import "./style.css";
import AreaPage from "./pages/AreaPage";
import SelectPage from "./pages/SelectPage";
import Layout from "./components/Layout";

const App = () => {
  return (
    <Router>
      <Layout>
        <Switch>
          <Route path="/area/:sid" component={AreaPage}/>
          <Route path="/area" component={AreaPage}/>
          <Route path="/" component={SelectPage} exact/>
        </Switch>
      </Layout>
    </Router>
  );
};

ReactDOM.render(<App/>, document.getElementById("root"));
