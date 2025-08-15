import { useParams, useNavigate } from "react-router-dom";
import HotDealsChat from "@/components/marketplace/HotDealsChat";

const HotDealsChatPage = () => {
  const { dealId } = useParams<{ dealId: string }>();
  const navigate = useNavigate();

  const handleClose = () => {
    navigate('/hot-deals-hub');
  };

  if (!dealId) {
    navigate('/hot-deals-hub');
    return null;
  }

  return (
    <HotDealsChat
      dealId={parseInt(dealId)}
      onClose={handleClose}
    />
  );
};

export default HotDealsChatPage;