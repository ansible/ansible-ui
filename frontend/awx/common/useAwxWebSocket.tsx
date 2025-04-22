import { getCookie } from '@ansible/common-ui/crud/cookie';
import {
  createContext,
  Dispatch,
  ReactNode,
  SetStateAction,
  useContext,
  useEffect,
  useState,
} from 'react';
import useReactWebSocket, { ReadyState } from 'react-use-websocket';
import { WebSocketHook } from 'react-use-websocket/dist/lib/types';
import { usePageAlertToaster } from '@ansible/ansible-ui-framework';
import { useTranslation } from 'react-i18next';
import { AlertProps } from '@patternfly/react-core';

interface Subscriptions {
  [group: string]: { [event: string]: number };
}
type IWebSocket = WebSocketHook<unknown, MessageEvent<unknown> | null> & {
  setSubscriptions: Dispatch<SetStateAction<Subscriptions>>;
};

const WebSocketContext = createContext<IWebSocket>({
  sendMessage: () => null,
  sendJsonMessage: () => null,
  lastMessage: null,
  lastJsonMessage: null,
  readyState: ReadyState.UNINSTANTIATED,
  getWebSocket: () => null,
  setSubscriptions: () => null,
});

function useWebSocket() {
  return useContext(WebSocketContext);
}

export function WebSocketProvider(props: { children?: ReactNode }) {
  const [webSocketUrl, setWebSocketUrl] = useState<string | null>(null);
  const webSocket = useReactWebSocket(webSocketUrl, { shouldReconnect: () => true });
  const [subscriptions, setSubscriptions] = useState<Subscriptions>({});

  useEffect(() => {
    const loc = window.location;
    let new_uri: string;
    if (loc.protocol === 'https:') {
      new_uri = 'wss:';
    } else {
      new_uri = 'ws:';
    }
    new_uri += '//' + loc.host;
    new_uri += process.env.AWX_WEBSOCKET_PREFIX;
    setWebSocketUrl(new_uri);
  }, []);

  const { sendMessage, readyState } = webSocket;

  useEffect(() => {
    const csrftoken = getCookie('csrftoken');
    if (csrftoken && readyState === ReadyState.OPEN) {
      const groups = Object.keys(subscriptions).reduce<{ [group: string]: string[] }>(
        (groups, group) => {
          groups[group] = Object.keys(subscriptions[group]);
          return groups;
        },
        {}
      );
      sendMessage(JSON.stringify({ groups, xrftoken: csrftoken }));
    }
  }, [sendMessage, subscriptions, readyState]);

  return (
    <WebSocketContext.Provider value={{ ...webSocket, setSubscriptions }}>
      {props.children}
    </WebSocketContext.Provider>
  );
}

export function useAwxWebSocketSubscription(
  events: { [group: string]: string[] | number[] },
  onMessage: (message: unknown) => void,
  // fallback for when a websocket is not available
  // returns a function to call to stop the fallback
  fallback?: () => () => void
) {
  const alertToaster = usePageAlertToaster();
  const { t } = useTranslation();
  const [evts] = useState(() => events);
  const { sendMessage, lastJsonMessage, lastMessage, readyState, setSubscriptions } =
    useWebSocket();

  useEffect(() => {
    setSubscriptions((subscriptions) => {
      subscriptions = { ...subscriptions };
      for (const group of Object.keys(evts)) {
        let subscriptionsEvents = subscriptions[group];
        if (!subscriptionsEvents) {
          subscriptionsEvents = {};
          subscriptions[group] = subscriptionsEvents;
        }
        for (const event of evts[group]) {
          subscriptionsEvents[event] = (subscriptionsEvents[event] ?? 0) + 1;
        }
      }
      return subscriptions;
    });
    return () => {
      setSubscriptions((subscriptions) => {
        subscriptions = { ...subscriptions };
        for (const group of Object.keys(evts)) {
          const subscriptionsEvents = subscriptions[group];
          if (subscriptionsEvents) {
            for (const event of evts[group]) {
              subscriptionsEvents[event] = (subscriptionsEvents[event] ?? 0) - 1;
              if (subscriptionsEvents[event] === 0) {
                delete subscriptionsEvents[event];
              }
            }
            if (Object.keys(subscriptionsEvents).length === 0) {
              delete subscriptions[group];
            }
          }
        }
        return subscriptions;
      });
    };
  }, [evts, setSubscriptions]);

  useEffect(() => {
    onMessage(lastJsonMessage);
  }, [lastJsonMessage, onMessage]);

  const [connected, setConnected] = useState(false);
  useEffect(() => {
    setConnected(readyState === ReadyState.OPEN);
  }, [readyState]);

  // create a use effect to monitor the readyState and if it stays UNINSTANTIATED for 5 seconds
  // then we can to assume the websocket is not available and we can call the fallback
  useEffect(() => {
    let timeout: NodeJS.Timeout;
    let resetFallback: () => void | undefined;
    const alertNoWS: AlertProps = {
      variant: 'warning',
      title: t(`Websocket unavailable. You may experience degraded logging performance.`),
    };
    const alertWS: AlertProps = {
      variant: 'success',
      title: t(`Websocket Reconnected`),
      timeout: 5000,
    };
    if (!connected && fallback) {
      timeout = setTimeout(() => {
        resetFallback = fallback();
        alertToaster.addAlert(alertNoWS);
      }, 5000);
    }
    if (connected) {
      alertToaster.replaceAlert(alertNoWS, alertWS);
    }
    return () => {
      clearTimeout(timeout);
      resetFallback?.();
    };
  }, [alertToaster, connected, fallback, t]);

  return { sendMessage, lastMessage, readyState };
}
