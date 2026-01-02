
import React from 'react';
import { Message } from '../types';

interface ChatMessageProps {
  message: Message;
}

const ChatMessage: React.FC<ChatMessageProps> = ({ message }) => {
  const isAssistant = message.role === 'assistant';

  return (
    <div className={`flex w-full mb-6 ${isAssistant ? 'justify-start' : 'justify-end'}`}>
      <div className={`flex gap-4 max-w-[85%] ${isAssistant ? 'flex-row' : 'flex-row-reverse'}`}>
        <div className={`w-8 h-8 rounded-full shrink-0 flex items-center justify-center ${
          isAssistant ? 'bg-indigo-600' : 'bg-slate-700'
        }`}>
          {isAssistant ? (
             <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-white" viewBox="0 0 20 20" fill="currentColor">
               <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clipRule="evenodd" />
             </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-slate-300" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
            </svg>
          )}
        </div>
        
        <div className="flex flex-col gap-2">
          <div className={`px-5 py-3 rounded-2xl text-sm leading-relaxed ${
            isAssistant 
              ? 'bg-slate-800 text-slate-200 border border-slate-700/50' 
              : 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/10'
          }`}>
            <p className="whitespace-pre-wrap">{message.content}</p>
            
            {message.attachments && message.attachments.length > 0 && (
              <div className="mt-3 flex gap-2">
                {message.attachments.map((url, i) => (
                  <img key={i} src={url} alt="Attachment" className="max-w-[200px] rounded-lg border border-slate-700" />
                ))}
              </div>
            )}
          </div>
          
          {message.groundingSources && message.groundingSources.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-2">
              <span className="text-[10px] text-slate-500 uppercase font-bold w-full mb-1">Sources</span>
              {message.groundingSources.map((source, i) => (
                <a
                  key={i}
                  href={source.uri}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[11px] bg-slate-800/80 hover:bg-slate-700 border border-slate-700 text-indigo-400 px-2 py-1 rounded transition-colors"
                >
                  {source.title.length > 30 ? source.title.substring(0, 30) + '...' : source.title}
                </a>
              ))}
            </div>
          )}
          
          <span className="text-[10px] text-slate-600 px-1">
            {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>
      </div>
    </div>
  );
};

export default ChatMessage;
