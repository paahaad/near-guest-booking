import React from "react";
import type { Message } from "../interfaces";

interface MessagesProps {
  messages: Array<Message>
  myMessage: Array<Message>
}


const Messages: React.FC<MessagesProps> = ({ messages, myMessage }) => {
  return (
    <div className="container m-auto px-4 md:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-2 gap-12">
      <div className="border h-[500px] overflow-y-scroll p-4">
        <h2 className="text-2xl font-bold sticky">All Messages</h2>
        {messages.map((e) => (
          <div className="space-y-6">
            <div className="flex items-start gap-6">
              <span className="relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full">
                <span className="flex h-full w-full items-center justify-center rounded-full bg-muted">
                  {`${e.id.charAt(0)}${e.id.charAt(1)}`}
                </span>
              </span>
              <div className="flex-1">
                <div className="font-medium">{e.id}</div>
                <div
                  className="rounded-lg border bg-card text-card-foreground shadow-sm mt-3"
                  data-v0-t="card"
                >
                  <div className="p-4">
                    <p>{e.message}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="space-y-6 border">
        <h2 className="text-2xl font-bold m-4">Your Messages</h2>
        {myMessage.map((e, i) => (
          <div key={i} className="space-y-6">
            <>{JSON.stringify(e)}</>
            <div className="flex items-start gap-6 justify-end">
              <div className="flex-1">
                <div
                  className="rounded-lg border shadow-sm mt-3 bg-gray-900 text-gray-50"
                  data-v0-t="card"
                >
                  <div className="p-4">
                    <p>
                      Hey team, just wanted to provide an update on the project
                      timeline. We're on track to have the MVP ready by the end
                      of the month.
                    </p>
                  </div>
                </div>
                <div className="text-right font-medium">You</div>
              </div>
              <span className="relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full">
                <span className="flex h-full w-full items-center justify-center rounded-full bg-muted">
                  YO
                </span>
              </span>
            </div>
            <div className="flex items-start gap-6 justify-end">
              <div className="flex-1">
                <div
                  className="rounded-lg border shadow-sm mt-3 bg-gray-900 text-gray-50"
                  data-v0-t="card"
                >
                  <div className="p-4">
                    <p>
                      Sounds good, let's plan a quick meeting to discuss the
                      next steps. I'm available anytime this afternoon.
                    </p>
                  </div>
                </div>
                <div className="text-right font-medium">You</div>
              </div>
              <span className="relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full">
                <span className="flex h-full w-full items-center justify-center rounded-full bg-muted">
                  YO
                </span>
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
};

export default Messages;