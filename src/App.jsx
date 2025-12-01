import Header from './components/Header';
import Main from './components/pages/Main';
import Footer from './components/Footer';
import AdvancedSearch from './components/pages/AdvancedSearch';

import './assets/css/style.css';

import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.min.js';
import 'bootstrap-icons/font/bootstrap-icons.css';

import {Routes, Route} from "react-router-dom";

function App() {
  return (
    <>
    <Header />

    <Routes>
      <Route path={"/"} element={<Main />} />
      <Route path={"/advancedsearch"} element={<AdvancedSearch />}/>
    </Routes>
    <Footer />
    </>
  );
}

export default App;