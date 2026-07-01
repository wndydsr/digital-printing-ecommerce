  import ChatDesainer from "@/components/Chat/chat";

  type Props = {
    params: Promise<{ orderId: string }>;
    searchParams: Promise<{ item?: string }>; // 🆕 searchParams didaftarkan sebagai Promise agar tipe datanya valid
  };

  export const metadata = {
    title: "Diskusi Desain | Pesanan Saya",
  };

  const ChatDesainerPage = async ({ params, searchParams }: Props) => {
    // 🛠️ Menunggu resolve data params dan searchParams sebelum diakses komponen
    const { orderId } = await params;
    const resolvedSearchParams = await searchParams;
    const orderItemId = resolvedSearchParams.item || "";

    // 100% Mengikuti tipe bawaan ChatDesainer yang hanya menerima orderId secara mutlak,
    // namun kita sematkan data item melalui query string bawaan atau properti opsional jika ada
    return <ChatDesainer orderId={orderId} orderItemId={orderItemId} />;
  };

  export default ChatDesainerPage;