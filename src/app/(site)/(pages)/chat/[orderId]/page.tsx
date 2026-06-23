import ChatDesainer from "@/components/Chat/chat";

type Props = {
  params: Promise<{ orderId: string }>; // Params sekarang adalah Promise
};

export const metadata = {
  title: "Diskusi Desain | Pesanan Saya",
};

const ChatDesainerPage = async ({ params }: Props) => {
  // Tunggu params sebelum diakses
  const { orderId } = await params;
  
  return <ChatDesainer orderId={orderId} />;
};

export default ChatDesainerPage;