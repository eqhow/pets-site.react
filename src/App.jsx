import Header from './components/Header';
import Main from './components/pages/Main';
import Footer from './components/Footer';
import AdvancedSearch from './components/pages/AdvancedSearch';

import './assets/css/style.css';

import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.min.js';
import 'bootstrap-icons/font/bootstrap-icons.css';

import {Routes, Route} from react-router-dom;

function App() {
  return (
    <>
    <Routes>
      <Route path={"./components/pages/AdvancedSearch.jsx"} element={<AdvancedSearch/>}/>
    </Routes>

    <Header />
    <Main />
    <Footer />
    </>
  );
}

export default App;