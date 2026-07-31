import { Emptier } from "components/ui";
import { EmptyAccountIcon } from "components/icons";

export const AccountPage = () => {
  return (
    <main className="min-h-screen bg-background-main px-5 pt-8">
      <Emptier
        icon={<EmptyAccountIcon />}
        title="Tài khoản"
        description="Thông tin cá nhân, đơn hàng và địa chỉ sẽ được mở rộng sau."
      />
    </main>
  );
};
