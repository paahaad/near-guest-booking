// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default function SignIn({ onClick }: {onClick : any}) {
  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <div className="max-w-lg w-full space-y-6 text-center">
        <h1 className="text-4xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
          Welcome to Near Guest Book
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-400">
          Connect your near wallet and start exploring the world of near guest
          book.
        </p>
        <button
          onClick={onClick}
          className="w-1/2 md:w-full bg-white text-black font-bold py-2 px-4 rounded"
        >
          Connect Wallet
        </button>
      </div>
    </div>
  )
}
