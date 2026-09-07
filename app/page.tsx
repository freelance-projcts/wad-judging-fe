import { redirect } from "next/navigation";

import ROUTES from "@/constants/routes";

const Home = () => {
  redirect(ROUTES.LOGIN);
};

export default Home;