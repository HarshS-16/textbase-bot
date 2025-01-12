import { useState } from 'react';
import { IContent } from '../types/message';
import axios from 'axios';
import fs from 'fs';
import { ReactMediaRecorder } from 'react-media-recorder';

interface IProps {
  onMessage: (message: IContent) => void;
  uploadFile: (file: File, fileType: string) => Promise<string | null> | null;
  botName: string;
}

export default function InputBar({ onMessage, botName, uploadFile }: IProps) {
  const [value, setValue] = useState('');
  

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setValue(e.target.value);
  };

  const handleSubmit = () => {
    if (value === '') {
      return;
    }
    const message = {
      data_type: 'STRING',
      value: value,
    };
    onMessage(message);
    setValue('');
  };


  const handleAudioTranscription = async (mediaBlobUrl: string) => {
    console.log(mediaBlobUrl)
    const blob = await fetch(mediaBlobUrl).then(r => r.blob());
    const file = new File([blob], 'recorded_audio.mp3', { type: blob.type });
    console.log(12);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('model', 'whisper-1');
    formData.append('response_format', 'text');
    const OPEN_API_KEY = process.env.REACT_APP_OPEN_API_KEY;
    const response = await axios.post(
      'https://api.openai.com/v1/audio/transcriptions',
      formData,
      {
        headers: {
          Authorization: `Bearer ${OPEN_API_KEY}`,
          'Content-Type': 'multipart/form-data',
        },
      },
    );
    console.log(response.data);
    const message = {
      data_type: 'STRING',
      value: response.data,
    };
    onMessage(message);
    // handle the response as needed
  };

  const handleUpload = (files: FileList | null, type: string) => {
    console.log(files, files?.length);
    if (files && files.length > 0) {
      const file = files[0];

      uploadFile(file, type)?.then(url => {
        if (url) {
          let dataType = 'IMAGE_URL';
          if (type === 'document') {
            dataType = 'FILE_URL';
          } else if (type === 'audio') {
            dataType = 'AUDIO_URL';
          } else if (type === 'video') {
            dataType = 'VIDEO_URL';
          }

          if (file.name.match(/\.(jpg|jpeg|png|gif|webp)$/i)) {
            dataType = 'IMAGE_URL';
          }

          if (file.name.match(/\.(mp3|wav)$/i)) {
            dataType = 'AUDIO_URL';
          }

          if (file.name.match(/\.(webm|mp4|ogg)$/i)) {
            dataType = 'VIDEO_URL';
          }

          const message = {
            data_type: dataType,
            value: url,
          };
          onMessage(message);
        }
      });
    }
  };

  return (
    <div className="w-full flex justify-center bg-[#141414] rounded-b-2xl py-4">
      <div className="w-1/6 flex justify-around items-center">
        <div className="h-fit">
          <form>
            <label className="cursor-pointer rounded-full bg-white">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="white"
                className="w-6 h-6"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z"
                />
              </svg>
              <input
                className="hidden"
                onChange={e => handleUpload(e.target.files, 'image')}
                type="file"
                name="image"
                accept="image/*"
              />
            </label>
          </form>
        </div>
        <div className="h-fit">
          <form>
            <label className="cursor-pointer rounded-full bg-white">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="white"
                className="w-6 h-6"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12.75 8.25v7.5m6-7.5h-3V12m0 0v3.75m0-3.75H18M9.75 9.348c-1.03-1.464-2.698-1.464-3.728 0-1.03 1.465-1.03 3.84 0 5.304 1.03 1.464 2.699 1.464 3.728 0V12h-1.5M4.5 19.5h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5z"
                />
              </svg>
              <input
                className="hidden"
                type="file"
                onChange={e => handleUpload(e.target.files, 'gif')}
                name="gif"
                accept="image/gif"
              />
            </label>
          </form>
        </div>
        <div className="h-fit">
          <form>
            <label className="cursor-pointer rounded-full bg-white">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="white"
                className="w-6 h-6"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"
                />
              </svg>

              <input
                className="hidden"
                onChange={e => handleUpload(e.target.files, 'document')}
                type="file"
                name="file"
              />
            </label>
          </form>
        </div>
        <div className="h-fit">
          <ReactMediaRecorder
            audio
            render={({
              status,
              startRecording,
              stopRecording,
              mediaBlobUrl,
              muteAudio,
            }) => (
              <div className="text-white mx-1">
                <p className="text-xs">{status}</p>

                <button onClick={startRecording}>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    className="w-6 h-6 text-white"
                  >
                    <path d="M8.25 4.5a3.75 3.75 0 117.5 0v8.25a3.75 3.75 0 11-7.5 0V4.5z" />
                    <path d="M6 10.5a.75.75 0 01.75.75v1.5a5.25 5.25 0 1010.5 0v-1.5a.75.75 0 011.5 0v1.5a6.751 6.751 0 01-6 6.709v2.291h3a.75.75 0 010 1.5h-7.5a.75.75 0 010-1.5h3v-2.291a6.751 6.751 0 01-6-6.709v-1.5A.75.75 0 016 10.5z" />
                  </svg>
                </button>

                <button
                  onClick={async () => {
                     stopRecording();
                  
                  }}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    className="w-6 h-6 text-white"
                  >
                    <path
                      fill-rule="evenodd"
                      d="M4.5 7.5a3 3 0 013-3h9a3 3 0 013 3v9a3 3 0 01-3 3h-9a3 3 0 01-3-3v-9z"
                      clip-rule="evenodd"
                    />
                  </svg>{' '}
                </button>
                <audio src={mediaBlobUrl} controls={false} onCanPlay={() => mediaBlobUrl && handleAudioTranscription(mediaBlobUrl)} />
              </div>
            )}
          />
        </div>
      </div>
      <div className="w-4/6">
        <form
          onSubmit={e => {
            e.preventDefault();
            handleSubmit();
          }}
        >
          <input
            type="text"
            autoFocus
            onChange={handleChange}
            value={value}
            className="appearance-none bg-black w-full py-2 px-3 text-white leading-tight focus:outline-none focus:shadow-outline rounded-2xl"
            id="message"
            placeholder={`Chat with ${botName}`}
          />
        </form>
      </div>
      <div className="flex align-center mx-2 px-2 bg-white rounded-full">
        <button
          className={`px-4 py-2 font-bold  ${
            value === '' ? 'text-gray-300' : 'text-black'
          }`}
          disabled={value === ''}
          onClick={handleSubmit}
        >
          {/* <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={`${value === ''? 'text-gray-400': 'text-white'} w-6 h-6`}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
                    </svg> */}
          <span>Send</span>
        </button>
      </div>
    </div>
  );
}
