import { ReactNode } from 'react';
import { BrowserRouter } from 'react-router-dom';
import styled from 'styled-components';

import GlobalStyles from '../components/GlobalStyles';
import {
  SecurityContextProvider,
  SecurityContextContextProps,
} from '../components/SecurityContext/SecurityContextProvider';
import { AppContextProvider } from '../components/AppContext';

const StyledWrapper = styled.div`
  background-color: var(--layout-body-background);
  min-height: 100vh;
`;

type PlaygroundWrapperProps = {
  identifier?: string;
  children: ReactNode;
} & Pick<SecurityContextContextProps, 'getToken'>;

export default function PlaygroundWrapper({
  identifier,
  getToken,
  children,
}: PlaygroundWrapperProps) {
  return (
    <StyledWrapper>
      <BrowserRouter>
        <AppContextProvider identifier={identifier}>
          <SecurityContextProvider getToken={getToken}>
            {children}
          </SecurityContextProvider>
        </AppContextProvider>

        <GlobalStyles />
      </BrowserRouter>
    </StyledWrapper>
  );
}
