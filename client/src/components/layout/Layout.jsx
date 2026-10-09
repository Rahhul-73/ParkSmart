/**
 * Layout Wrapper — wraps pages with Navbar + Footer
 */
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';

const Layout = () => {
  return (
    <div className="min-h-screen flex flex-col bg-dark-950 bg-mesh">
      <Navbar />
      <main className="flex-1 pt-20 pb-8">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

export default Layout;
