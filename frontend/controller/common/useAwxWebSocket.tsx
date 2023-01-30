import {
  createContext,
  Dispatch,
  ReactNode,
  SetStateAction,
  useContext,
  useEffect,
  useState,
} from 'react';
import useReactWebSocket from 'react-use-websocket';
import { JsonValue, WebSocketHook } from 'react-use-websocket/dist/lib/types';
import { useAutomationServers } from '../../automation-servers/contexts/AutomationServerProvider';
import { getCookie } from '../../Data';

interface Subscriptions {
  [group: string]: { [event: string]: number };
}
type IWebSocket = WebSocketHook<JsonValue | null, MessageEvent<unknown> | null> & {
  setSubscriptions: Dispatch<SetStateAction<Subscriptions>>;
};

const WebSocketContext = createContext<IWebSocket>(null as unknown as IWebSocket);

function useWebSocket() {
  return useContext(WebSocketContext);
}

export function WebSocketProvider(props: { children?: ReactNode }) {
  const { automationServer } = useAutomationServers();
  const [webSocketUrl, setWebSocketUrl] = useState<string | null>(null);
  const webSocket = useReactWebSocket(webSocketUrl, { shouldReconnect: () => true });
  const [subscriptions, setSubscriptions] = useState<Subscriptions>({});

  useEffect(() => {
    if (automationServer) {
      const loc = window.location;
      let new_uri: string;
      if (loc.protocol === 'https:') {
        new_uri = 'wss:';
      } else {
        new_uri = 'ws:';
      }
      new_uri += '//' + loc.host;
      new_uri += `/websocket/`;
      setWebSocketUrl(new_uri);
    } else {
      setWebSocketUrl(null);
    }
  }, [automationServer]);

  const { sendMessage } = webSocket;

  useEffect(() => {
    const csrftoken = getCookie('csrftoken');
    if (csrftoken) {
      const groups = Object.keys(subscriptions).reduce<{ [group: string]: string[] }>(
        (groups, group) => {
          groups[group] = Object.keys(subscriptions[group]);
          return groups;
        },
        {}
      );
      sendMessage(JSON.stringify({ groups, xrftoken: csrftoken }));
    }
  }, [sendMessage, subscriptions]);

  return (
    <WebSocketContext.Provider value={{ ...webSocket, setSubscriptions }}>
      {props.children}
    </WebSocketContext.Provider>
  );
}

export function useAwxWebSocketSubscription(events: { [group: string]: string[] }) {
  const [evts] = useState(() => events);
  const { sendMessage, lastMessage, readyState, setSubscriptions } = useWebSocket();
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
          }
          if (Object.keys(subscriptionsEvents).length === 0) {
            delete subscriptions[group];
          }
        }
        return subscriptions;
      });
    };
  }, [evts, setSubscriptions]);

  return { sendMessage, lastMessage, readyState };
}
