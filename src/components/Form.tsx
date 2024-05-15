/* eslint-disable @typescript-eslint/ban-ts-comment */
import React from "react"
import Big from "big.js"

interface User {
  accountId: string
  balance: string
}

interface FormProps {
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void
  currentUser: User
}

export default function Form({
  onSubmit,
  currentUser,
}: FormProps): JSX.Element {
  return (
    <form onSubmit={onSubmit}>
      <fieldset id="fieldset">
        <p>Sign the guest book, {currentUser.accountId}!</p>
        <p className="highlight">
          <label htmlFor="message">
            <h3>Message:</h3>
          </label>
          <input autoComplete="off" autoFocus id="message" required />
        </p>
        <p>
          <label htmlFor="donation">
            <h3>Donation (optional):</h3>
          </label>
          <input
            autoComplete="off"
            defaultValue={"0"}
            id="donation"
            // @ts-ignore
            max={Big(currentUser.balance).div(10 ** 24)}
            min="0"
            step="0.01"
            type="number"
          />
          <span title="NEAR Tokens">Ⓝ</span>
        </p>
        <button
          style={{ backgroundColor: "aliceblue", color: "black" }}
          type="submit"
        >
          Sign
        </button>
      </fieldset>
    </form>
  )
}
