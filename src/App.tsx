/* eslint-disable @typescript-eslint/ban-ts-comment */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */

import './App.css'
import { providers } from "near-api-js"
import "regenerator-runtime/runtime"
import { useState, useEffect } from "react"
import Big from "big.js"
import Form from "./components/Form"
import SignIn from "./components/SignIn"
import Messages from "./components/Message"

interface CurrentUser {
  accountId: any
  balance: string
}

interface AppProps {
  currentUser: CurrentUser
  nearConfig: any
  selector: any
}

const SUGGESTED_DONATION = "0"
const BOATLOAD_OF_GAS = Big(3)
  .times(10 ** 13)
  .toFixed()


function App({
  currentUser,
  nearConfig,
  selector,
}: AppProps) {
  const [messages, setMessages] = useState<string[]>([])

  const provider = new providers.JsonRpcProvider({
    url: selector.network.nodeUrl,
  })


  useEffect(() => {
    provider
      .query({
        request_type: "call_function",
        account_id: selector.getContractId(),
        method_name: "getMessages",
        args_base64: "",
        finality: "optimistic",
      })
      .then((res) =>
        //@ts-ignore
        setMessages(JSON.parse(Buffer.from(res.result).toString()))
      )
  }, [])

  const onSubmit = (e: any) => {
    e.preventDefault()

    const { fieldset, message, donation } = e.target.elements

    fieldset.disabled = true

    // TODO: optimistically update page with new message,
    // update blockchain data in background
    // add uuid to each message, so we know which one is already known

    selector
      .signAndSendTransaction({
        //@ts-ignore
        signerId: window.accountId,
        actions: [
          {
            type: "FunctionCall",
            params: {
              methodName: "add_message",
              args: {
                text: message.value,
              },
              //@ts-ignore
              gas: BOATLOAD_OF_GAS,
              deposit: Big(donation.value || "0")
                .times(10 ** 24)
                .toFixed(),
            },
          },
        ],
      })
      .catch((err: unknown) => {
        alert("Something went wrong")
        throw err
      })
      .then(() => {
        provider
          .query({
            request_type: "call_function",
            account_id: selector.getContractId(),
            method_name: "getMessages",
            args_base64: "",
            finality: "optimistic",
          })
          .then((res) => {
            // @ts-ignore
            setMessages(JSON.parse(Buffer.from(res.result).toString()))
            message.value = ""
            donation.value = SUGGESTED_DONATION
            fieldset.disabled = false
            message.focus()
          })
      })
  }

  const signIn = () => {
    console.log("clicked")
    selector.show()
  }

  const signOut = () => {
    selector.signOut()
  }


  return (
    <main>
      {currentUser ? (
        <button className="user__btn" onClick={signOut}>
          Log out
        </button>
      ) : (
        <button className="user__btn" onClick={signIn}>
          Log in
        </button>
      )}
      <h1>NEAR Guest Book</h1>
      {currentUser ? (
        //@ts-ignore
        <Form onSubmit={onSubmit} currentUser={currentUser} />
      ) : (
        <SignIn onClick={signIn} />
      )}
      {!!currentUser && !!messages.length && <Messages messages={messages} />}
    </main>
  )
}

export default App
