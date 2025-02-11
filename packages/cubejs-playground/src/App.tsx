/* eslint-disable no-undef,react/jsx-no-target-blank */
import { Component, useEffect } from 'react';
import '@ant-design/compatible/assets/index.css';
import { Layout, Alert } from 'antd';
import { fetch } from 'whatwg-fetch';
import { RouteComponentProps, withRouter } from 'react-router';
import styled from "styled-components";

import Header from './components/Header';
import GlobalStyles from './components/GlobalStyles';
import { CubeLoader } from './atoms';
import {
  event,
  setAnonymousId,
  setTracker,
  setTelemetry,
  trackImpl,
} from './events';
import { useAppContext } from './components/AppContext';
import './index.less';

const selectedTab = (pathname) => {
  if (pathname === '/template-gallery') {
    return ['/dashboard'];
  } else {
    return [pathname];
  }
};

const StyledLayoutContent = styled(Layout.Content)`
  height: 100%;
  
  & > div {
    background: var(--layout-body-background);
  }
`

export type PlaygroundContext = {
  anonymousId: string;
  apiUrl: string;
  cubejsToken: string;
  basePath: string;
  isDocker: boolean;
  extDbType: string | null;
  dbType: string;
  telemetry: boolean;
  shouldStartConnectionWizardFlow: boolean;
  dockerVersion: string | null;
  livePreview?: boolean;
};

type AppState = {
  fatalError: Error | null;
  context: PlaygroundContext | null;
  showLoader: boolean;
};

class App extends Component<RouteComponentProps, AppState> {
  static getDerivedStateFromError(error) {
    return { fatalError: error };
  }

  state: AppState = {
    fatalError: null,
    context: null,
    showLoader: false,
  };

  async componentDidMount() {
    const { history } = this.props;

    setTimeout(() => this.setState({ showLoader: true }), 700);

    window.addEventListener('unhandledrejection', (promiseRejectionEvent) => {
      const error = promiseRejectionEvent.reason;
      console.log(error);
      const e = (error.stack || error).toString();
      event('Playground Error', {
        error: e,
      });
    });

    const res = await fetch('/playground/context');
    const context = await res.json();

    setTelemetry(context.telemetry);
    setTracker(trackImpl);
    setAnonymousId(context.anonymousId, {
      coreServerVersion: context.coreServerVersion,
      projectFingerprint: context.projectFingerprint,
      isDocker: Boolean(context.isDocker),
      dockerVersion: context.dockerVersion,
    });

    this.setState({ context }, () => {
      if (context.shouldStartConnectionWizardFlow) {
        history.push('/connection');
      }
    });
  }

  componentDidCatch(error, info) {
    event('Playground Error', {
      error: (error.stack || error).toString(),
      info: info.toString(),
    });
  }

  render() {
    const { context, fatalError, showLoader } = this.state;
    const { location, children } = this.props;

    if (!showLoader) {
      return null;
    }

    if (context == null) {
      return <CubeLoader />;
    }

    if (fatalError) {
      console.log(fatalError.stack);
    }

    return (
      <Layout>
        <GlobalStyles />

        <Header selectedKeys={selectedTab(location.pathname)} />

        <StyledLayoutContent>
          {fatalError ? (
            <Alert
              message="Error occured while rendering"
              description={fatalError.stack || ''}
              type="error"
            />
          ) : (
            children
          )}
        </StyledLayoutContent>

        <ContextSetter context={context} />
      </Layout>
    );
  }
}

type ContextSetterProps = {
  context: PlaygroundContext;
};

function ContextSetter({ context }: ContextSetterProps) {
  const { setContext } = useAppContext();

  useEffect(() => {
    if (context !== null) {
      setContext({ playgroundContext: context });
    }
  }, [context]);

  return null;
}

export default withRouter(App);
