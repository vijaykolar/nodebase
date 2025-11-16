import { Button } from "@/components/ui/button";
import { requireAuth } from "@/lib/auth-utils";
import { caller } from "@/trpc/server";

const Home = async () => {
  await requireAuth();

  const data = await caller.getUsers();

  return (
    <div className="h-screen flex justify-center items-center flex-col gap-y-6">
      Protected <div>{JSON.stringify(data)}</div>
      <Button>Submit</Button>
    </div>
  );
};

export default Home;
