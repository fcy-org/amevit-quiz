import { createFileRoute } from "@tanstack/react-router";
import { Quiz } from "@/components/Quiz";

export const Route = createFileRoute("/")({
  component: Quiz,
  head: () => ({
    meta: [
      { title: "Amevit · Teste de cansaço mental" },
      {
        name: "description",
        content:
          "Responda ao quiz Amevit e descubra sinais de sobrecarga mental, foco comprometido ou descanso insuficiente com uma recomendação personalizada.",
      },
      { property: "og:title", content: "Amevit · Teste de cansaço mental" },
      {
        property: "og:description",
        content: "Quiz rápido com resultado personalizado e desconto especial para falar com um especialista.",
      },
    ],
  }),
});
