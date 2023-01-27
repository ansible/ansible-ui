import { useEffect } from 'react';
import useWebSocket, { ReadyState } from 'react-use-websocket';
import { getCookie } from '../../Data';

export function useAwxWebSocket() {
  const loc = window.location;
  let new_uri: string;
  if (loc.protocol === 'https:') {
    new_uri = 'wss:';
  } else {
    new_uri = 'ws:';
  }
  new_uri += '//' + loc.host;
  new_uri += '/websocket/';

  const { sendMessage, lastMessage, readyState } = useWebSocket(new_uri);

  // const [messageHistory, setMessageHistory] = useState([]);
  // useEffect(() => {
  //   if (lastMessage !== null) {
  //     setMessageHistory((prev) => prev.concat(lastMessage.data));
  //   }
  // }, [lastMessage, setMessageHistory]);

  useEffect(() => {
    if (readyState === ReadyState.OPEN) {
      const csrftoken = getCookie('csrftoken');
      if (csrftoken) {
        sendMessage(
          JSON.stringify({
            xrftoken: csrftoken,
            groups: {
              control: ['limit_reached_1'],
              jobs: ['status_changed'],
            },
          })
        );
      }
    }
  }, [readyState, sendMessage]);
}

// Contexts
// - Server
// - User
// - Websocket
