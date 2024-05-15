import { useState, useEffect, useCallback } from "react";
import useWebSocket, { ReadyState } from "react-use-websocket";

const socketUrl =
  "wss://hospitable-absorbing-dirigible.glitch.me/handleMessages";

function App() {
  const [message, setMessage] = useState("");
  const [counter, setCounter] = useState(0);
  const [lastRandomMessage, setLastRandomMessage] = useState("");
  const [connections, setConnections] = useState(null);
  const [messagesLength, setMessagesLength] = useState(0);
  const { sendMessage, lastMessage, readyState } = useWebSocket(socketUrl);

  useEffect(() => {
    sendMessage(JSON.stringify({ event: "connect" }));

    window.addEventListener("beforeunload", function () {
      sendMessage(JSON.stringify({ event: "disconnect" }));
    });
  }, []);

  useEffect(() => {
    if (lastMessage?.data) {
      const parsedData = JSON.parse(lastMessage.data);
      setMessagesLength(parsedData?.messages ?? 0);
      setConnections(parsedData?.connections ?? 0);
      setLastRandomMessage(parsedData?.randomMessage);
      setCounter(parsedData?.counter);
    }
  }, [lastMessage]);

  const handleClickSendMessage = useCallback(() => {
    sendMessage(JSON.stringify({ event: "add", message }));
    setMessage("");
  }, [message]);

  const handlePressEnter = useCallback(
    (e) => {
      if (event.keyCode === 13) {
        handleClickSendMessage();
      }
    },
    [handleClickSendMessage]
  );

  const connectionStatus = {
    [ReadyState.CONNECTING]: "Connecting",
    [ReadyState.OPEN]: "Open",
    [ReadyState.CLOSING]: "Closing",
    [ReadyState.CLOSED]: "Closed",
    [ReadyState.UNINSTANTIATED]: "Uninstantiated",
  }[readyState];

  return (
    <div className="box">
      {connections === null ? (
        <div className="loader"><b>Loading...</b></div>
      ) : (
        <>
          <div className="randomMessage">
            <b>An anonym messenger said:</b> {lastRandomMessage}
          </div>
          <div className="input">
            <div>
              <b>{connections}</b> messengers online
            </div>
            <div>
              <input
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyUp={handlePressEnter}
              />
              <button onClick={handleClickSendMessage}>SEND</button>
            </div>
            <div>
              {readyState === ReadyState.CONNECTING
                ? `${connectionStatus}...`
                : `${messagesLength} messages sent`}
            </div>
            <div>
              <b>Next random message will be picked in:</b> {counter} seconds
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default App;
