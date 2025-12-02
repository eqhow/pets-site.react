import Header from './components/Header';
import Main from './components/pages/Main';
import Footer from './components/Footer';
import AdvancedSearch from './components/pages/AdvancedSearch';
import AddPet from './components/pages/AddPet';
import SignIn from './components/pages/SignIn';
import Registration from './components/pages/Registration';

import './assets/css/style.css';

import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.min.js';
import 'bootstrap-icons/font/bootstrap-icons.css';

import { Routes, Route } from "react-router-dom";

function App() {
  return (
    <div className="d-flex flex-column min-vh-100">
      <Header />
      <main className="flex-grow-1">
        <Routes>
          <Route path={"/"} element={<Main />} />
          <Route path={"/advancedsearch"} element={<AdvancedSearch />} />
          <Route path={"/add-pet"} element={<AddPet />} />
          <Route path={"/sign-in"} element={<SignIn />} />
          <Route path={"/registration"} element={<Registration />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}

export default App;