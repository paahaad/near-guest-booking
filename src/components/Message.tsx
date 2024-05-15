export default function Message({ messages }: { messages: string[] }) {
  return <div>Message: {JSON.stringify(messages)}</div>
}
