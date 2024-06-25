import { Router, Route } from "@solidjs/router";
import Index from "./components/Index";
import Dashboard from "./components/Dashboard";
import { darkTheme } from "./store";

function App() {
  return (
    <div id="root" classList={{ dark: darkTheme() }} class="drawer md:drawer-open">
      <Router>
        <Route path="/" component={Index} />
        <Route path="/dashboard" component={Dashboard} />
        <Route path="/dashboard/:id" component={Dashboard} />
        <Route path="/dashboard/:id/:menu" component={Dashboard} />
        <Route path="/dashboard/:id/:menu/:submenu" component={Dashboard} />
        <Route path="/dashboard/:id/:menu/:submenu/*rest" component={Dashboard} />
      </Router>
    </div>
  );
}

export default App;
