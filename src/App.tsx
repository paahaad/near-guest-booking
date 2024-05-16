/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { Fragment, useCallback, useEffect, useState } from "react"
import { providers, utils } from "near-api-js"
import type {
  AccountView,
  CodeResult,
} from "near-api-js/lib/providers/provider"
import type {
  SignedMessage,
  SignMessageParams,
  Transaction,
} from "@near-wallet-selector/core"
import { verifyFullKeyBelongsToUser } from "@near-wallet-selector/core"
import { verifySignature } from "@near-wallet-selector/core"
import BN from "bn.js"
import "@near-wallet-selector/modal-ui/styles.css"

import type { Account, Message } from "./interfaces"
import { useWalletSelector } from "./context/WalletSelectorContext"
import SignIn from "./components/SignIn"
import Form from "./components/Form"
import Messages from "./components/Message"

type Submitted = SubmitEvent & {
  target: { elements: { [key: string]: HTMLInputElement } }
}

const SUGGESTED_DONATION = "0"
const BOATLOAD_OF_GAS = utils.format.parseNearAmount("0.00000000003")!

interface GetAccountBalanceProps {
  provider: providers.Provider
  accountId: string
}

const getAccountBalance = async ({
  provider,
  accountId,
}: GetAccountBalanceProps) => {
  try {
    const { amount } = await provider.query<AccountView>({
      request_type: "view_account",
      finality: "final",
      account_id: accountId,
    })
    const bn = new BN(amount)
    return { hasBalance: !bn.isZero() }
  } catch {
    return { hasBalance: false }
  }
}

const Content: React.FC = () => {
  const { selector, modal, accountId } = useWalletSelector()
  const [account, setAccount] = useState<Account | null>(null)
  const [messages, setMessages] = useState<Array<Message>>([])
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [yourMessage, setYourMessage] = useState<Array<Message>>([])
  const [loading, setLoading] = useState<boolean>(false)

  const getAccount = useCallback(async (): Promise<Account | null> => {
    if (!accountId) {
      return null
    }

    const { network } = selector.options
    const provider = new providers.JsonRpcProvider({ url: network.nodeUrl })

    const { hasBalance } = await getAccountBalance({
      provider,
      accountId,
    })

    if (!hasBalance) {
      window.alert(
        `Account ID: ${accountId} has not been founded. Please send some NEAR into this account.`
      )
      const wallet = await selector.wallet()
      await wallet.signOut()
      return null
    }

    return provider
      .query<AccountView>({
        request_type: "view_account",
        finality: "final",
        account_id: accountId,
      })
      .then((data) => ({
        ...data,
        account_id: accountId,
      }))
  }, [accountId, selector])

  const getMessages = useCallback(() => {
    const { network } = selector.options
    const provider = new providers.JsonRpcProvider({ url: network.nodeUrl })

    return provider
      .query<CodeResult>({
        request_type: "call_function",
        account_id: "guest-book2.niskarsh31.testnet",
        method_name: "get_messages",
        args_base64: Buffer.from(
          JSON.stringify({ offset: 0, limit: 10 })
        ).toString("base64"),
        finality: "optimistic",
      })
      .then((res) => JSON.parse(Buffer.from(res.result).toString()))
  }, [selector])

  const getYourMessage = useCallback(() => {
    const { network } = selector.options
    const provider = new providers.JsonRpcProvider({ url: network.nodeUrl })

    return provider
      .query<CodeResult>({
        request_type: "call_function",
        account_id: "guest-book2.niskarsh31.testnet",
        method_name: "messages_by_signed_in_user",
        args_base64: Buffer.from(
          JSON.stringify({ offset: 0, limit: 10 })
        ).toString("base64"),
        finality: "optimistic",
      })
      .then((res) => JSON.parse(Buffer.from(res.result).toString()))
  }, [selector])

  useEffect(() => {
    // TODO: don't just fetch once; subscribe!
    getMessages().then(setMessages)
    getYourMessage().then(setYourMessage)

    const timeoutId = setTimeout(() => {
      verifyMessageBrowserWallet()
    }, 500)

    return () => {
      clearTimeout(timeoutId)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (!accountId) {
      return setAccount(null)
    }

    setLoading(true)

    getAccount().then((nextAccount) => {
      setAccount(nextAccount)
      setLoading(false)
    })
  }, [accountId, getAccount])

  const handleSignIn = () => {
    modal.show()
  }

  const handleSignOut = async () => {
    const wallet = await selector.wallet()

    wallet.signOut().catch((err) => {
      console.log("Failed to sign out")
      console.error(err)
    })
  }



  const addMessages = useCallback(
    async (message: string, donation: string, multiple: boolean) => {
      console.log("MESSAGE from submit", message, donation)
      const { contract } = selector.store.getState()
      const wallet = await selector.wallet()
      if (!multiple) {
        return wallet
          .signAndSendTransaction({
            signerId: accountId!,
            actions: [
              {
                type: "FunctionCall",
                params: {
                  methodName: "add_message",
                  args: { message: message },
                  gas: BOATLOAD_OF_GAS,
                  deposit: utils.format.parseNearAmount(donation)!,
                },
              },
            ],
          })
          .catch((err) => {
            alert("Failed to add message")
            console.log("Failed to add message")

            throw err
          })
      }

      const transactions: Array<Transaction> = []

      for (let i = 0; i < 2; i += 1) {
        transactions.push({
          signerId: accountId!,
          receiverId: contract!.contractId,
          actions: [
            {
              type: "FunctionCall",
              params: {
                methodName: "get_messages",
                args: {
                  text: `${message} (${i + 1}/2)`,
                },
                gas: BOATLOAD_OF_GAS,
                deposit: utils.format.parseNearAmount(donation)!,
              },
            },
          ],
        })
      }

      return wallet.signAndSendTransactions({ transactions }).catch((err) => {
        alert("Failed to add messages exception " + err)
        console.log("Failed to add messages")

        throw err
      })
    },
    [selector, accountId]
  )


  const verifyMessage = async (
    message: SignMessageParams,
    signedMessage: SignedMessage
  ) => {
    const verifiedSignature = verifySignature({
      message: message.message,
      nonce: message.nonce,
      recipient: message.recipient,
      publicKey: signedMessage.publicKey,
      signature: signedMessage.signature,
      callbackUrl: message.callbackUrl,
    })
    const verifiedFullKeyBelongsToUser = await verifyFullKeyBelongsToUser({
      publicKey: signedMessage.publicKey,
      accountId: signedMessage.accountId,
      network: selector.options.network,
    })

    const isMessageVerified = verifiedFullKeyBelongsToUser && verifiedSignature

    const alertMessage = isMessageVerified
      ? "Successfully verified"
      : "Failed to verify"

    alert(
      `${alertMessage} signed message: '${
        message.message
      }': \n ${JSON.stringify(signedMessage)}`
    )
  }

  const verifyMessageBrowserWallet = useCallback(async () => {
    const urlParams = new URLSearchParams(
      window.location.hash.substring(1) // skip the first char (#)
    )
    const accId = urlParams.get("accountId") as string
    const publicKey = urlParams.get("publicKey") as string
    const signature = urlParams.get("signature") as string

    if (!accId && !publicKey && !signature) {
      return
    }

    const message: SignMessageParams = JSON.parse(
      localStorage.getItem("message")!
    )

    const signedMessage = {
      accountId: accId,
      publicKey,
      signature,
    }

    await verifyMessage(message, signedMessage)

    const url = new URL(location.href)
    url.hash = ""
    url.search = ""
    window.history.replaceState({}, document.title, url)
    localStorage.removeItem("message")
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleSubmit = useCallback(
    async (e: Submitted) => {
      e.preventDefault()
      console.log("inside form")
      const { fieldset, message, donation, multiple } = e.target.elements

      // fieldset.disabled = true

      return addMessages(message.value, donation.value || "0", multiple?.checked)
        .then(() => {
          return getMessages()
            .then((nextMessages) => {
              setMessages(nextMessages)
              message.value = ""
              donation.value = SUGGESTED_DONATION
              // fieldset.disabled = false
              // multiple.checked = false
              message.focus()
            })
            .catch((err) => {
              alert("Failed to refresh messages")
              console.log("Failed to refresh messages")

              throw err
            })
        })
        .catch((err) => {
          console.error(err)

          fieldset.disabled = false
        })
    },
    [addMessages, getMessages]
  )


  if (loading) {
    return null
  }

  if (!account) {
    return (
      <Fragment>
        <SignIn onClick={handleSignIn} />
      </Fragment>
    )
  }

  console.log("messages", yourMessage)
  return (
    <Fragment>
      <header className="flex items-center justify-between px-4 py-3 md:px-6 border rounded-lg">
        <div className="w-[150px]">
          <a className="flex items-center" href="#">
            <div className="text-lg font-bold bold"> Near Guest</div>
            <span className="sr-only">Near Guest</span>
          </a>
        </div>
        <button
          onClick={handleSignOut}
          className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="mr-2 h-4 w-4"
          >
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
            <polyline points="16 17 21 12 16 7"></polyline>
            <line x1="21" x2="9" y1="12" y2="12"></line>
          </svg>
          Logout
        </button>
      </header>
      <main className="flex flex-1 items-center justify-center py-6 md:py-12">
        <div className="space-y-2 text-center">
          <h1 className="text-1xl font-bold tracking-tighter md:text-2xl">
            GM {account.account_id.toLocaleUpperCase()}!
          </h1>
        </div>
      </main>

      {/* <div className="flex m-4 p-4 justify-evenly ">
        <button onClick={handleSignOut}>Log out</button>
        <button onClick={handleSwitchWallet}>Switch Wallet</button>
        <button onClick={handleVerifyOwner}>Verify Owner</button>
        <button onClick={handleSignMessage}>Sign Message</button>
        {accounts.length > 1 && (
          <button onClick={handleSwitchAccount}>Switch Account</button>
        )}
      </div> */}

      <div className="flex flex-col md:flex-row-reverse px-10 gap-3 justify-between">
        <Form
          account={account}
          onSubmit={(e) => handleSubmit(e as unknown as Submitted)}
        />
        <Messages messages={messages} myMessage={yourMessage} />
      </div>
    </Fragment>
  )
}

export default Content
