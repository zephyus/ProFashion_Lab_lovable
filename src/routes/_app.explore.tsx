import { createFileRoute } from "@tanstack/react-router";
import ExploreQuiz from "../components/ExploreQuiz";
import { useNavigate } from "@tanstack/react-router";

export const Route = createFileRoute("/_app/explore")({
  head: () => ({ meta: [{ title: "發現小秘 me · ProFashion Lab" }] }),
  component: ExplorePage,
});

function ExplorePage() {
  const navigate = useNavigate();
  return <ExploreQuiz onBack={() => navigate({ to: "/" })} />;
}
