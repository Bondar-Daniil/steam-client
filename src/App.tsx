
import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import styled from "styled-components";

import HomePage from "./pages/HomePage";
import FavoritesPage from "./pages/FavoritesPage";
import GameDetailsPage from "./pages/GameDetailsPage";

const Container = styled.div`
  min-height: 100vh;
  background-color: #171a21;
  color: #c7d5e0;
  font-family: Arial, sans-serif;
`;

const Header = styled.header`
  background-color: #171a21;
  padding: 20px 40px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 20px;
  border-bottom: 1px solid #2a475e;
`;

const Logo = styled(Link)`
  color: #66c0f4;
  font-size: 26px;
  font-weight: bold;
  text-decoration: none;
`;

const Navigation = styled.nav`
  display: flex;
  gap: 24px;

  a {
    color: #c7d5e0;
    text-decoration: none;
    font-size: 16px;
  }

  a:hover {
    color: #66c0f4;
  }
`;

const Main = styled.main`
  max-width: 1200px;
  margin: 0 auto;
  padding: 40px 20px;
`;

function App() {
  return (
    <BrowserRouter>
      <Container>
        <Header>
          <Logo to="/">STEAM CLIENT</Logo>

          <Navigation>
            <Link to="/">Store</Link>
            <Link to="/favorites">Favorites</Link>
          </Navigation>
        </Header>

        <Main>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/favorites" element={<FavoritesPage />} />
            <Route path="/game/:id" element={<GameDetailsPage />} />
          </Routes>
        </Main>
      </Container>
    </BrowserRouter>
  );
}

export default App;
