import { Router, Route, Navigate } from "@solidjs/router";
import Index from "./components/Index";
import Dashboard from "./components/Dashboard";
import Login from "./components/auth/Login";
import Logout from "./components/auth/Logout";
import Overview from "./components/dashboard/Overview";
import Information from "./components/dashboard/Information";
import Sensor from "./components/dashboard/Sensor";
import Analysis from "./components/dashboard/Analysis";
import { darkTheme, authServer, resourceServer } from "./store";

function App() {

  // get api servers definition
  fetch("/data/api.json")
    .then(async (response) => {
      /** @type {{ auth: { address:string }, resource: { address:string, id:string }[] }} */
      const api = await response.json();
      authServer.setAddress(api.auth.address);
      for (const res of api.resource) {
        resourceServer.setAddress(res.id, res.address);
      }
    });

  return (
    <div classList={{ dark: darkTheme() }} class="drawer md:drawer-open h-[100vh] overflow-hidden">
      <Router>
        <Route path="/" component={() => <Navigate href="/login" />} />
        <Route path="/" component={Index}>
          <Route path="/login" component={Login} />
          <Route path="/logout" component={Logout} />
        </Route>
        <Route path="/dashboard" component={Dashboard} />
        <Route path="/dashboard" component={Dashboard}>
          <Route path="/:name" component={Overview} />
          <Route path="/:name/overview" component={Overview} />
          <Route path="/:name/information" component={Information} />
          <Route path="/:name/information/:submenu" component={Information} />
          <Route path="/:name/sensor" component={Sensor} />
          <Route path="/:name/sensor/:submenu" component={Sensor} />
          <Route path="/:name/sensor/:submenu/*rest" component={Sensor} />
          <Route path="/:name/analysis" component={Analysis} />
          <Route path="/:name/analysis/:submenu" component={Analysis} />
          <Route path="/:name/analysis/:submenu/*rest" component={Analysis} />
        </Route>
      </Router>
    </div>
  );
}

export default App;
