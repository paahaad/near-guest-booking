import type { FormEventHandler } from "react"
import React from "react"
import Big from "big.js"

import type { Account } from "../interfaces"

interface FormProps {
  account: Account
  onSubmit: FormEventHandler
}

const Form: React.FC<FormProps> = ({ account, onSubmit }) => {
  return (
    <form onSubmit={onSubmit}>
      <div className="mx-auto max-w-md p-6 md:p-12 border w-full">
        <div className="space-y-2 text-center">
          <p className="text-gray-400">
            Have a question or feedback? Send us a message.
          </p>
        </div>
        <div className="space-y-4">
          <div className="grid gap-2">
            <label
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              htmlFor="message"
            >
              Your Message
            </label>
            <textarea
              className="flex w-full rounded-md border border-input bg-black px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 min-h-[120px]"
              id="message"
              placeholder="Type your message here..."
            ></textarea>
          </div>
          <div className="grid grid-cols-[1fr_auto] items-center gap-4">
            <input
              className="flex h-10 w-full rounded-md border border-input bg-black px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              id="donation"
              placeholder="Enter donation amount"
              min="0"
              step="0.01"
              type="number"
              defaultValue={"0"}
              max={Big(account.amount)
                .div(10 ** 24)
                .toString()}
            />
            <button
              className="inline-flex items-center bg-white text-black justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2 w-full"
              type="submit"
            >
              Donate
            </button>
          </div>
          <button
            className="inline-flex items-center justify-center bg-white text-black whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2 w-full"
            type="submit"
          >
            Sign
          </button>
        </div>
      </div>
    </form>
  )
}

export default Form
