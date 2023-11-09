import { useEffect, useState } from 'react';
import { Helmet, HelmetProvider } from 'react-helmet-async';
import './App.css';
import InputBar from './components/inputBar';
import MessageBox from './components/messageBox';
import { IContent, IMessage } from './types/message';
import Header from './components/header';
import { botDetailsV2, sendMessage, upload } from './actions/sendMessage';
import { getAPIURL } from './helpers';

function App() {
  const [botState, setBotState] = useState({});
  const [messages, setMessages] = useState<IMessage[]>([]);
  const [botName, setBotName] = useState('');
  const [botDetailsLoading, setBotDetailsLoading] = useState(false);
  const [botId, setBotId] = useState<number | null>(1);
  const [botStatus, setBotStatus] = useState('');
  const [fetching, setFetching] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [botError, setBotError] = useState<string | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [botInfo, setBotInfo] = useState('Start Conversation with bot');

  useEffect(() => {
    const path = window.location.pathname;
    const pathParts = path.split('/');
    const { url, devMode } = getAPIURL();
    if (pathParts.length === 3) {
      const userName = pathParts[1];
      const botName = pathParts[2];
      if (devMode === 'prod') {
        setBotDetailsLoading(true);
        botDetailsV2(url, botName, userName)
          .then((resp: any) => {
            setBotDetailsLoading(false);
            if (resp.data) {
              if (resp.data.data) {
                setBotName(resp.data.data.name);
                setBotInfo(
                  `Start Conversation with bot - ${resp.data.data.name}`,
                );
                setBotStatus(resp.data.data.state);
                setBotId(resp.data.data.id);
              } else {
                setBotError(resp.data.error);
                setBotStatus('INDETERMINATE');
              }
            } else {
              setBotError('Failed to fetch bot details');
              setBotStatus('INDETERMINATE');
            }
          })
          .catch((e: Error) => {
            setBotDetailsLoading(false);
            setBotError(e.message);
            setBotStatus('INDETERMINATE');
          });
      } else {
        setBotName('Local Test');
      }
    } else if (devMode === 'local') {
      setBotId(123);
    } else {
      // Show Error
      setBotError('Wrong URL');
    }
  }, []);

  const uploadFile = (file: File, fileType: string) => {
    if (!botId) {
      setError('No Bot Id');
      return null;
    }

    setUploading(true);
    return upload(botId, file, fileType)
      .then(url => {
        setUploading(false);
        return url;
      })
      .catch(e => {
        setUploading(false);
        setBotError(e.message);
        return null;
      });
  };

  const onMessage = (message: IContent) => {
    if (!botId) {
      setError('No Bot Id');
      return;
    }
    const userMessage: IMessage = {
      role: 'user',
      content: [message],
    };

    messages.push(userMessage);
    setMessages([...messages]);

    const { url, devMode } = getAPIURL();

    setFetching(true);
    setError(null);

    sendMessage(url, messages, botState, botId, devMode, sessionId)
      .then((resp: any) => {
        console.log(resp);
        setFetching(false);
        if (resp.data.error) {
          setError(resp.data.error);
        } else {
          if (devMode === 'local') {
            const newMessage: IMessage = {
              role: 'assistant',
              content: resp.data.new_message,
            };
            if (resp.session_id && !sessionId) {
              setSessionId(resp.session_id);
            }
            setBotState(resp.data.state);
            setMessages([...messages, newMessage]);
          } else {
            const newMessage: IMessage = {
              role: 'assistant',
              content: resp.data.data.new_message,
            };
            if (resp.data.session_id && !sessionId) {
              setSessionId(resp.data.session_id);
            }
            setBotState(resp.data.data.state);
            setMessages([...messages, newMessage]);
          }
        }
      })
      .catch((error: Error) => {
        setError(error.message);
        setFetching(false);
      });
  };

  const restart = () => {
    setMessages([]);
    setError(null);
    setBotState({});
  };

  return (
    <div className="flex  bg-gradient-to-r from-amber-500 to-pink-500">
      <div className='mx-6 my-10 flex flex-col gap-2 w-[550px] text-xs'>
        <div className="border bg-white px-4 py-5 sm:px-4 bg-gray-100 border-[#141414] rounded-2xl">
          <h3 className="text-base font-semibold leading-6 text-gray-900">
            Your Overall Progress Report
          </h3>
          <p>
            <img className='h-40 w-80' src='./stats.png'/>
          </p>
          <p className="mt-1 text-sm text-gray-500">
            Your score is 7/15 .
          </p>
          <p className="mt-1 text-sm text-gray-500">
            Weak Topics : You have to work on IOT data protocols such as MQTT and AQMP.
          </p>
          <p className="mt-1 text-sm text-gray-500">
            Strong Topics : You have a very strong hold on topics such as SDN and have a basic understanding of IOT .
          </p>
        </div>
        <div className="border bg-white px-4 py-5 sm:px-6 border-[#141414] rounded-2xl">
        <h3 className="text-base font-semibold leading-6 text-gray-900">
            Topic Summary
          </h3>
          <p className="mt-1 text-sm text-gray-500">
          This summary provides a high-level view of the course content ranging from the foundational concepts, historical background, and practical applications of IoT, to the challenges and evolution of this rapidly growing field. The information is displayed in the application as a part of the user interface. The relevant code block for this is a part of the App function component in React and it uses JSX to render the summary on the screen. The summary is hard-coded in this case, but in a real-world application, it could be fetched from a server or a database.
          </p>
        </div>

      </div>
      {botName && botId && (
        <HelmetProvider>
          <Helmet>
            <title>Bot - {botName}</title>
            <link rel="apple-touch-icon" href={`/avatars/${botId % 5}.png`} />
            <link rel="icon" href={`/favicons/${botId % 5}.ico`} />
          </Helmet>
        </HelmetProvider>
      )}
      <div className="w-full md:max-w-screen-md h-screen py-10 border-[#141414] rounded-2xl justify-between flex flex-col mb-2">
        <Header
          botName={botName}
          status={botStatus}
          restart={restart}
          error={botError}
          botId={botId}
          loading={botDetailsLoading}
        />
        <MessageBox
          messages={messages}
          loading={fetching}
          userLoading={uploading}
          error={error}
          botInfoMessage={botInfo}
        />
        <InputBar
          onMessage={onMessage}
          botName={botName}
          uploadFile={uploadFile}
        />
      </div>
    </div>
  );
}

export default App;
