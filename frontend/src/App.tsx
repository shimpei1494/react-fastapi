import { AppShell } from '@mantine/core';
import { Outlet } from 'react-router-dom';
import ModeSidebar from './components/layout/ModeSidebar';

function App() {
  return (
    <AppShell
      navbar={{ width: 60, breakpoint: 0 }}
      padding={0}
      styles={{
        main: { height: '100dvh', display: 'flex' },
      }}
    >
      <AppShell.Navbar>
        <ModeSidebar />
      </AppShell.Navbar>
      <AppShell.Main>
        <Outlet />
      </AppShell.Main>
    </AppShell>
  );
}

export default App;
