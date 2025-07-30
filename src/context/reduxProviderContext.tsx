'use client';

import { Provider } from 'react-redux';
import store from '@/redux/store';
import { SidebarProvider } from './SidebarContext';
import { ThemeProvider } from './ThemeContext';

export default function ClientProviders({ children }: { children: React.ReactNode }) {
  return (
    <Provider store={store}>
      <ThemeProvider>
        <SidebarProvider>{children}</SidebarProvider>
      </ThemeProvider>
    </Provider>
  );
}
