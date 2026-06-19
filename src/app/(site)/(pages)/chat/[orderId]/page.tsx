import React from "react";
import ChatDesainer from "@/components/Chat/chat";

type Props = {
  params: { orderId: string };
};

export const metadata = {
  title: "Diskusi Desain | Pesanan Saya",
};

const ChatDesainerPage = ({ params }: Props) => {
  return <ChatDesainer orderId={params.orderId} />;
};

export default ChatDesainerPage;