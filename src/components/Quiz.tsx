import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  Award,
  BedDouble,
  Brain,
  CheckCircle2,
  Clock3,
  Dumbbell,
  Headphones,
  LoaderCircle,
  MessageCircle,
  Moon,
  ShieldCheck,
  Sparkles,
  Utensils,
  Wine,
  Zap,
} from "lucide-react";
import magnesioDimalatoImg from "@/assets/magnesio-dimalato.png";
import magnesioPaImg from "@/assets/magnesio-pa.png";
import magnesioTreonatoImg from "@/assets/magnesio-treonato.png";
import logoImg from "@/assets/amevit-logo.png";

type SignalCategory = "overload" | "focus" | "rest";
type ResultCategory = SignalCategory | "balanced";

type Option = {
  label: string;
  category: SignalCategory;
  weight: number;
  signal: string;
};

type Question = {
  id: string;
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  subtitle: string;
  options: Option[];
};

type Stage = "intro" | "questions" | "loading" | "result";

const QUESTIONS: Question[] = [
  {
    id: "daily-feeling",
    icon: Brain,
    title: "Nos últimos dias, você tem sentido isso com frequência?",
    subtitle: "Cansaço mental",
    options: [
      {
        label: "Minha cabeça vive cansada",
        category: "overload",
        weight: 3,
        signal: "Sua cabeça parece cansar antes mesmo do dia terminar",
      },
      {
        label: "Acordo sem energia",
        category: "rest",
        weight: 3,
        signal: "Você acorda como se não tivesse recuperado de verdade",
      },
      {
        label: "Me sinto sobrecarregado(a)",
        category: "overload",
        weight: 2,
        signal: "As tarefas simples parecem pesar mais do que deveriam",
      },
      {
        label: "Me sinto normal",
        category: "focus",
        weight: 0,
        signal: "Seu dia parece mais estável na maior parte do tempo",
      },
    ],
  },
  {
    id: "memory",
    icon: Sparkles,
    title: "Você tem esquecido coisas simples?",
    subtitle: "Memória no dia a dia",
    options: [
      {
        label: "Esqueço direto",
        category: "focus",
        weight: 3,
        signal: "Você se pega esquecendo recados, nomes ou pequenas tarefas",
      },
      {
        label: "Às vezes acontece",
        category: "focus",
        weight: 2,
        signal: "Alguns esquecimentos aparecem quando a rotina aperta",
      },
      {
        label: "Quase nunca",
        category: "rest",
        weight: 0,
        signal: "Sua memória parece funcionar bem na maior parte dos dias",
      },
    ],
  },
  {
    id: "attention",
    icon: Zap,
    title: "Como está seu foco?",
    subtitle: "Atenção e produtividade",
    options: [
      {
        label: "Me distraio fácil",
        category: "focus",
        weight: 3,
        signal: "Você começa uma coisa e logo percebe que foi puxado(a) para outra",
      },
      {
        label: "Tenho dificuldade pra manter o foco",
        category: "focus",
        weight: 2,
        signal: "Manter atenção por muito tempo tem exigido esforço extra",
      },
      {
        label: "Meu foco é normal",
        category: "rest",
        weight: 0,
        signal: "Seu foco parece acompanhar bem sua rotina",
      },
    ],
  },
  {
    id: "sleep",
    icon: Moon,
    title: "Como anda seu sono?",
    subtitle: "Descanso mental",
    options: [
      {
        label: "Durmo e acordo cansado",
        category: "rest",
        weight: 3,
        signal: "Mesmo dormindo, você acorda com sensação de bateria baixa",
      },
      {
        label: "Demoro pra dormir",
        category: "rest",
        weight: 2,
        signal: "Sua mente demora para desligar quando chega a hora de descansar",
      },
      {
        label: "Durmo bem",
        category: "overload",
        weight: 0,
        signal: "Seu sono parece estar ajudando na recuperação",
      },
    ],
  },
  {
    id: "sleep-hours",
    icon: BedDouble,
    title: "Quantas horas você dorme por dia?",
    subtitle: "Quantidade de descanso",
    options: [
      {
        label: "Durmo entre 7 e 8 horas",
        category: "rest",
        weight: 0,
        signal: "Você costuma dar ao corpo uma boa janela de descanso",
      },
      {
        label: "Durmo cerca de 6 horas",
        category: "focus",
        weight: 1,
        signal: "Seu descanso pode estar ficando um pouco abaixo do ideal",
      },
      {
        label: "Durmo menos de 6 horas",
        category: "rest",
        weight: 3,
        signal: "Poucas horas de sono podem pesar na energia e na clareza mental",
      },
      {
        label: "Meu horário de sono varia muito",
        category: "overload",
        weight: 2,
        signal: "Sua rotina de sono pode estar oscilando mais do que o corpo gostaria",
      },
    ],
  },
  {
    id: "nutrition",
    icon: Utensils,
    title: "Como é sua alimentação?",
    subtitle: "Rotina nutricional",
    options: [
      {
        label: "Me alimento bem na maior parte dos dias",
        category: "focus",
        weight: 0,
        signal: "Sua alimentação parece apoiar bem sua rotina mental",
      },
      {
        label: "Tento manter minha alimentação boa",
        category: "focus",
        weight: 1,
        signal: "Você tenta cuidar da alimentação, mesmo com alguns altos e baixos",
      },
      {
        label: "Minha alimentação oscila bastante",
        category: "overload",
        weight: 2,
        signal: "Sua alimentação muda bastante conforme a rotina aperta",
      },
      {
        label: "Pulo refeições ou como no automático",
        category: "rest",
        weight: 3,
        signal: "Sua alimentação pode estar sofrendo quando o dia fica corrido",
      },
    ],
  },
  {
    id: "alcohol",
    icon: Wine,
    title: "Como é sua relação com o álcool?",
    subtitle: "Hábitos e recuperação",
    options: [
      {
        label: "Quase não bebo",
        category: "rest",
        weight: 0,
        signal: "O álcool parece ter pouca influência na sua rotina de recuperação",
      },
      {
        label: "Bebo socialmente e tento manter controle",
        category: "overload",
        weight: 1,
        signal: "Você tenta manter o álcool dentro de uma rotina controlada",
      },
      {
        label: "Bebo para relaxar em alguns dias",
        category: "overload",
        weight: 2,
        signal: "Às vezes você usa o álcool como válvula de escape para aliviar a rotina",
      },
      {
        label: "Percebo que o álcool atrapalha meu sono",
        category: "rest",
        weight: 3,
        signal: "O álcool pode estar interferindo na qualidade do seu descanso",
      },
    ],
  },
  {
    id: "pressure",
    icon: Headphones,
    title: "Quando sua rotina aperta, o que mais aparece?",
    subtitle: "Pressão da rotina",
    options: [
      {
        label: "Fico mentalmente travado(a)",
        category: "overload",
        weight: 3,
        signal: "Sob pressão, parece que sua mente trava ou fica lenta",
      },
      {
        label: "Perco o ritmo e procrastino",
        category: "focus",
        weight: 2,
        signal: "Você tenta render, mas se perde entre distrações e atrasos",
      },
      {
        label: "Sinto o corpo pesado",
        category: "rest",
        weight: 2,
        signal: "O corpo pesa junto com a mente nos dias mais puxados",
      },
      {
        label: "Consigo lidar bem",
        category: "overload",
        weight: 0,
        signal: "Você ainda sente controle mesmo em dias movimentados",
      },
    ],
  },
  {
    id: "activity",
    icon: Dumbbell,
    title: "Com que frequência você realiza atividades físicas?",
    subtitle: "Movimento e energia",
    options: [
      {
        label: "Me movimento com frequência",
        category: "focus",
        weight: 0,
        signal: "O movimento já parece fazer parte do seu cuidado com energia e disposição",
      },
      {
        label: "Tento me exercitar durante a semana",
        category: "focus",
        weight: 1,
        signal: "Você tenta manter atividade física mesmo quando a rotina aperta",
      },
      {
        label: "Faço atividade só quando dá",
        category: "overload",
        weight: 2,
        signal: "Sua frequência de movimento pode cair quando o dia fica mais cheio",
      },
      {
        label: "Estou sedentário(a) no momento",
        category: "rest",
        weight: 3,
        signal: "A falta de movimento pode estar contribuindo para cansaço e baixa disposição",
      },
    ],
  },
];

const RESULTS: Record<
  ResultCategory,
  {
    title: string;
    headline: string;
    explanation: string;
    reassurance: string;
    recommendation: "pa" | "dimalato" | "treonato";
    identityTitle?: string;
    identityPrompt?: string;
    identityClosing?: string;
  }
> = {
  balanced: {
    title: "Mente em equilíbrio",
    headline: "Seu resultado mostra baixa intensidade de sinais no momento.",
    explanation:
      "Suas respostas indicam uma rotina mental mais estável, com bons sinais de foco, memória e recuperação.",
    reassurance:
      "Mesmo assim, manter esse equilíbrio exige cuidado contínuo, sono de qualidade e suporte nutricional adequado.",
    recommendation: "treonato",
    identityTitle: "Identificamos bons sinais de equilíbrio mental e físico no seu dia a dia.",
    identityPrompt: "Olha só o que apareceu nas suas respostas:",
    identityClosing:
      "Seu resultado indica baixa intensidade de sinais. O foco agora é manter essa clareza e proteger sua rotina mental.",
  },
  overload: {
    title: "Mente sobrecarregada",
    headline: "Sua mente pode estar funcionando em modo alerta por tempo demais.",
    explanation:
      "Quando a rotina acumula, é comum sentir a cabeça cheia, esquecer coisas simples e terminar o dia sem aquela sensação de pausa real.",
    reassurance:
      "A boa notícia: pequenos ajustes e o suporte certo podem ajudar seu corpo a recuperar um ritmo mais leve.",
    recommendation: "pa",
  },
  focus: {
    title: "Foco comprometido",
    headline: "Seu maior sinal parece estar na clareza e na atenção.",
    explanation:
      "As respostas apontam para distração fácil, dificuldade de manter constância e aquela sensação de começar várias coisas sem conseguir finalizar bem.",
    reassurance:
      "Isso não significa falta de vontade. Muitas vezes o corpo só precisa de mais suporte para sustentar energia mental.",
    recommendation: "treonato",
  },
  rest: {
    title: "Descanso mental insuficiente",
    headline: "Seu corpo pode não estar descansando como deveria.",
    explanation:
      "Mesmo quando você dorme, a mente pode continuar acelerada. Aí surgem cansaço ao acordar, baixa energia e sensação de estar sempre no limite.",
    reassurance:
      "Com uma rotina mais favorável e nutrientes adequados, é possível melhorar a qualidade desse descanso.",
    recommendation: "pa",
  },
};

const MAGNESIUM_OPTIONS = {
  pa: {
    name: "Magnésio PA",
    image: magnesioPaImg,
    previousPrice: 42.84,
    price: 29.99,
    fit: "Geralmente é o mais indicado para quem vive sob pressão.",
    bullets: [
      "Ajuda no relaxamento mental",
      "Pode contribuir para uma rotina com menos tensão e estresse",
      "Contribui para a qualidade do sono",
      "Boa absorção e costuma ser suave para o intestino",
    ],
  },
  dimalato: {
    name: "Magnésio dimalato",
    image: magnesioDimalatoImg,
    previousPrice: 57.13,
    price: 39.99,
    fit: "Faz mais sentido quando o principal incômodo é energia baixa e cansaço físico.",
    bullets: [
      "Ajuda mais na energia e redução da fadiga",
      "Bom para cansaço físico e dores musculares",
      "Menos focado na parte calmante",
    ],
  },
  treonato: {
    name: "Magnésio treonato",
    image: magnesioTreonatoImg,
    previousPrice: 78.56,
    price: 54.99,
    fit: "Combina mais com quem busca foco, memória e clareza mental.",
    bullets: [
      "Tem ação mais voltada para o cérebro",
      "Pode ajudar em foco, memória e clareza mental",
      "Mais caro e menos comum",
    ],
  },
} as const;

const WHATSAPP_PHONE = "558694876425";
const OFFER_DURATION_MS = 5 * 60 * 60 * 1000;
const LOADING_PHASES = [
  "Analisando suas respostas...",
  "Cruzando padrões de comportamento...",
  "Identificando sinais de sobrecarga mental...",
  "Montando uma recomendação com base no seu perfil...",
  "Isso pode explicar muita coisa que você vem sentindo.",
];

function formatPrice(value: number) {
  return value.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

function formatOfferTime(milliseconds: number) {
  const totalSeconds = Math.max(0, Math.floor(milliseconds / 1000));
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return [hours, minutes, seconds].map((value) => String(value).padStart(2, "0")).join(":");
}

declare global {
  interface Window {
    fbq?: (...args: unknown[]) => void;
  }
}

function trackEvent(event: string, params?: Record<string, unknown>) {
  window.fbq?.("track", event, params);
}

function trackCustomEvent(event: string, params?: Record<string, unknown>) {
  window.fbq?.("trackCustom", event, params);
}

export function Quiz() {
  const [stage, setStage] = useState<Stage>("intro");
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Option[]>([]);
  const resultTimeoutRef = useRef<number | null>(null);
  const shouldReduceMotion = useReducedMotion();
  const startQuestions = useCallback(() => setStage("questions"), []);

  const totalScore = useMemo(
    () => answers.reduce((sum, answer) => sum + answer.weight, 0),
    [answers],
  );
  const maxScore = QUESTIONS.length * 3;
  const intensity = Math.max(18, Math.round((totalScore / maxScore) * 100));

  const result = useMemo<ResultCategory>(() => {
    if (answers.length === QUESTIONS.length && intensity <= 18) {
      return "balanced";
    }

    const scores: Record<SignalCategory, number> = { overload: 0, focus: 0, rest: 0 };
    answers.forEach((answer) => {
      scores[answer.category] += answer.weight;
    });

    return Object.entries(scores).sort((a, b) => b[1] - a[1])[0][0] as SignalCategory;
  }, [answers, intensity]);

  useEffect(() => {
    if (stage === "questions") {
      if (step === 0) trackEvent("ViewContent", { content_name: "Quiz iniciado" });
      trackCustomEvent(`Etapa_${step + 1}`, {
        etapa: step + 1,
        pergunta: QUESTIONS[step].subtitle,
      });
    }
    if (stage === "result") {
      trackEvent("ViewContent", { content_name: "Resultado exibido" });
    }
  }, [stage, step]);

  const handleAnswer = useCallback(
    (option: Option) => {
      const nextAnswers = [...answers, option];
      setAnswers(nextAnswers);

      if (step + 1 < QUESTIONS.length) {
        setStep(step + 1);
        return;
      }

      setStage("loading");
      resultTimeoutRef.current = window.setTimeout(() => setStage("result"), 5600);
    },
    [answers, step],
  );

  const handleBack = useCallback(() => {
    if (step === 0) {
      setStage("intro");
      setAnswers([]);
      return;
    }

    setStep(step - 1);
    setAnswers(answers.slice(0, -1));
  }, [answers, step]);

  const reset = useCallback(() => {
    if (resultTimeoutRef.current !== null) {
      window.clearTimeout(resultTimeoutRef.current);
      resultTimeoutRef.current = null;
    }

    setAnswers([]);
    setStep(0);
    setStage("intro");
  }, []);

  useEffect(() => {
    return () => {
      if (resultTimeoutRef.current !== null) {
        window.clearTimeout(resultTimeoutRef.current);
      }
    };
  }, []);

  const progress = ((step + (stage === "questions" ? 0 : 1)) / QUESTIONS.length) * 100;

  return (
    <main className="relative min-h-screen overflow-hidden">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -top-32 left-1/2 h-80 w-80 -translate-x-1/2 rounded-full bg-brand/25 blur-3xl sm:h-[520px] sm:w-[520px] sm:blur-[90px]" />
        <div className="absolute bottom-0 right-0 h-72 w-72 rounded-full bg-brand-red/15 blur-3xl sm:h-[440px] sm:w-[440px] sm:blur-[100px]" />
      </div>

      <header className="relative z-10 mx-auto flex max-w-6xl items-center justify-between px-6 py-6">
        <img src={logoImg} alt="Amevit" className="h-7 opacity-90" />
        <span className="hidden text-xs uppercase tracking-[0.3em] text-muted-foreground sm:block">
          Análise personalizada
        </span>
      </header>

      <section className="relative z-10 mx-auto flex min-h-[calc(100vh-100px)] max-w-3xl items-center justify-center px-6 pb-16">
        <AnimatePresence mode="wait">
          {stage === "intro" && (
            <Intro key="intro" reducedMotion={shouldReduceMotion} onStart={startQuestions} />
          )}

          {stage === "questions" && (
            <Questions
              key={`q-${step}`}
              reducedMotion={shouldReduceMotion}
              question={QUESTIONS[step]}
              step={step}
              total={QUESTIONS.length}
              progress={progress}
              onAnswer={handleAnswer}
              onBack={handleBack}
            />
          )}

          {stage === "loading" && <Loading key="loading" reducedMotion={shouldReduceMotion} />}

          {stage === "result" && (
            <Result
              key="result"
              reducedMotion={shouldReduceMotion}
              answers={answers}
              category={result}
              intensity={intensity}
              onRestart={reset}
            />
          )}
        </AnimatePresence>
      </section>
    </main>
  );
}

const Intro = memo(function Intro({
  reducedMotion,
  onStart,
}: {
  reducedMotion: boolean | null;
  onStart: () => void;
}) {
  return (
    <motion.div
      initial={reducedMotion ? { opacity: 0 } : { opacity: 0, y: 30 }}
      animate={reducedMotion ? { opacity: 1 } : { opacity: 1, y: 0 }}
      exit={reducedMotion ? { opacity: 0 } : { opacity: 0, y: -20 }}
      transition={{ duration: reducedMotion ? 0.2 : 0.6 }}
      className="w-full text-center"
    >
      <motion.div
        initial={reducedMotion ? { opacity: 0 } : { scale: 0.8, opacity: 0 }}
        animate={reducedMotion ? { opacity: 1 } : { scale: 1, opacity: 1 }}
        transition={reducedMotion ? { duration: 0.2 } : { delay: 0.2 }}
        className="mx-auto mb-8 inline-flex items-center gap-2 rounded-full border border-brand/40 bg-brand/10 px-4 py-2 text-xs uppercase tracking-[0.25em] text-brand-glow backdrop-blur"
      >
        <Sparkles className="h-3.5 w-3.5" />
        Quiz Amevit · 60 segundos
      </motion.div>

      <h1 className="font-display text-5xl leading-[0.95] sm:text-7xl md:text-8xl">
        Sua mente anda cansada o tempo todo? <span className="inline-block"></span>
      </h1>

      <p className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-xl">
        Você esquece coisas simples, perde o foco fácil e parece que sua cabeça nunca descansa...
      </p>

      <p className="mx-auto mt-5 max-w-xl text-lg font-semibold text-foreground sm:text-2xl">
        Responda e descubra o que pode estar por trás disso.
      </p>

      <motion.button
        whileHover={reducedMotion ? undefined : { scale: 1.03 }}
        whileTap={reducedMotion ? undefined : { scale: 0.97 }}
        onClick={onStart}
        className="group mt-10 inline-flex transform-gpu items-center gap-3 rounded-full bg-gradient-to-r from-brand via-brand-glow to-brand-red px-9 py-5 text-base font-semibold uppercase tracking-wide text-white shadow-[0_0_48px_-12px] shadow-brand-red-glow transition-all hover:shadow-[0_0_58px_-14px] hover:shadow-brand-red-glow"
      >
        Começar agora
        <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
      </motion.button>

      <div className="mt-12 flex flex-wrap items-center justify-center gap-6 text-xs uppercase tracking-widest text-muted-foreground">
        <span className="flex items-center gap-2">
          <ShieldCheck className="h-4 w-4 text-brand-glow" /> 100% gratuito
        </span>
        <span className="flex items-center gap-2">
          <Clock3 className="h-4 w-4 text-brand-glow" /> Respostas rápidas
        </span>
        <span className="flex items-center gap-2">
          <Award className="h-4 w-4 text-brand-glow" /> Recomendação personalizada
        </span>
      </div>
    </motion.div>
  );
});

const Questions = memo(function Questions({
  reducedMotion,
  question,
  step,
  total,
  progress,
  onAnswer,
  onBack,
}: {
  reducedMotion: boolean | null;
  question: Question;
  step: number;
  total: number;
  progress: number;
  onAnswer: (option: Option) => void;
  onBack: () => void;
}) {
  const Icon = question.icon;

  return (
    <motion.div
      initial={reducedMotion ? { opacity: 0 } : { opacity: 0, x: 40 }}
      animate={reducedMotion ? { opacity: 1 } : { opacity: 1, x: 0 }}
      exit={reducedMotion ? { opacity: 0 } : { opacity: 0, x: -40 }}
      transition={{ duration: reducedMotion ? 0.18 : 0.4 }}
      className="w-full"
    >
      <div className="mb-10">
        <div className="mb-3 flex items-center justify-between text-xs uppercase tracking-[0.25em] text-muted-foreground">
          <button
            onClick={onBack}
            className="flex items-center gap-2 transition hover:text-foreground"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> Voltar
          </button>
          <span>
            {String(step + 1).padStart(2, "0")} / {String(total).padStart(2, "0")}
          </span>
        </div>
        <div className="h-1.5 overflow-hidden rounded-full bg-white/5">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: reducedMotion ? 0.2 : 0.6, ease: "easeOut" }}
            className="h-full rounded-full bg-gradient-to-r from-brand to-brand-red shadow-[0_0_14px] shadow-brand-red-glow"
          />
        </div>
      </div>

      <div className="mb-8 flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand/15 text-brand-glow">
          <Icon className="h-6 w-6" />
        </div>
        <span className="text-xs uppercase tracking-[0.3em] text-muted-foreground">
          {question.subtitle}
        </span>
      </div>

      <h2 className="font-display mb-10 text-4xl leading-tight sm:text-5xl">{question.title}</h2>

      <div className="grid gap-3">
        {question.options.map((option, index) => (
          <motion.button
            key={option.label}
            initial={reducedMotion ? { opacity: 0 } : { opacity: 0, y: 20 }}
            animate={reducedMotion ? { opacity: 1 } : { opacity: 1, y: 0 }}
            transition={reducedMotion ? { duration: 0.15 } : { delay: 0.06 + index * 0.04 }}
            whileHover={reducedMotion ? undefined : { scale: 1.01, x: 4 }}
            whileTap={reducedMotion ? undefined : { scale: 0.99 }}
            onClick={() => onAnswer(option)}
            className="glass group flex transform-gpu items-center justify-between rounded-2xl px-6 py-5 text-left transition-all hover:border-brand-glow/50 hover:bg-brand/10"
          >
            <span className="text-base font-medium sm:text-lg">{option.label}</span>
            <ArrowRight className="h-5 w-5 text-muted-foreground transition-all group-hover:translate-x-1 group-hover:text-brand-glow" />
          </motion.button>
        ))}
      </div>
    </motion.div>
  );
});

const Loading = memo(function Loading({ reducedMotion }: { reducedMotion: boolean | null }) {
  const [phaseIndex, setPhaseIndex] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setPhaseIndex((current) => (current + 1) % LOADING_PHASES.length);
    }, 1050);

    return () => clearInterval(id);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="flex w-full flex-col items-center justify-center text-center"
    >
      <div className="relative mb-10 h-32 w-32">
        <motion.div
          className="absolute inset-0 rounded-full border-2 border-brand/30"
          animate={reducedMotion ? undefined : { rotate: 360 }}
          transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
        />
        <motion.div
          className="absolute inset-2 rounded-full border-t-2 border-brand-glow"
          animate={reducedMotion ? undefined : { rotate: -360 }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
        />
        <motion.div
          className="absolute inset-0 flex items-center justify-center"
          animate={reducedMotion ? undefined : { scale: [1, 1.1, 1] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        >
          <Brain className="h-10 w-10 text-brand-glow" />
        </motion.div>
      </div>

      <h3 className="font-display text-3xl sm:text-4xl">Análise inteligente em andamento</h3>
      <AnimatePresence mode="wait">
        <motion.p
          key={phaseIndex}
          initial={reducedMotion ? { opacity: 0 } : { opacity: 0, y: 8 }}
          animate={reducedMotion ? { opacity: 1 } : { opacity: 1, y: 0 }}
          exit={reducedMotion ? { opacity: 0 } : { opacity: 0, y: -8 }}
          className="mt-3 text-sm uppercase tracking-[0.25em] text-brand-glow"
        >
          {LOADING_PHASES[phaseIndex]}
        </motion.p>
      </AnimatePresence>
    </motion.div>
  );
});

const Result = memo(function Result({
  reducedMotion,
  answers,
  category,
  intensity,
  onRestart,
}: {
  reducedMotion: boolean | null;
  answers: Option[];
  category: ResultCategory;
  intensity: number;
  onRestart: () => void;
}) {
  const result = RESULTS[category];
  const recommendation = MAGNESIUM_OPTIONS[result.recommendation];
  const identitySignals = useMemo(() => {
    const weightedAnswers = answers.filter((answer) => answer.weight > 0);

    return (
      weightedAnswers.length > 0 ? weightedAnswers : answers.filter((answer) => answer.weight === 0)
    ).slice(0, 4);
  }, [answers]);
  const [benefitState, setBenefitState] = useState<"hidden" | "loading" | "revealed">("hidden");
  const [offerEndsAt] = useState(() => Date.now() + OFFER_DURATION_MS);
  const formattedPreviousPrice = useMemo(
    () => formatPrice(recommendation.previousPrice),
    [recommendation.previousPrice],
  );
  const formattedPrice = useMemo(() => formatPrice(recommendation.price), [recommendation.price]);
  const whatsappUrl = useMemo(() => {
    const whatsappMessage = [
      "Olá! Fiz o quiz da Amevit e quero falar com um especialista.",
      "",
      `Magnésio indicado: ${recommendation.name}`,
      "Desconto liberado no quiz: 30%",
      `Preço com desconto: ${formattedPrice}`,
    ].join("\n");

    return `https://wa.me/${WHATSAPP_PHONE}?text=${encodeURIComponent(whatsappMessage)}`;
  }, [formattedPrice, recommendation.name]);

  function revealBenefit() {
    if (benefitState !== "hidden") {
      return;
    }

    setBenefitState("loading");
    window.setTimeout(() => setBenefitState("revealed"), 1500);
  }

  return (
    <motion.div
      initial={reducedMotion ? { opacity: 0 } : { opacity: 0, y: 30 }}
      animate={reducedMotion ? { opacity: 1 } : { opacity: 1, y: 0 }}
      className="w-full"
    >
      <div className="mb-6 text-center">
        <span className="inline-flex items-center gap-2 rounded-full border border-brand/40 bg-brand/10 px-4 py-1.5 text-[10px] uppercase tracking-[0.3em] text-brand-glow">
          <CheckCircle2 className="h-3 w-3" /> Resultado concluído
        </span>
        <h2 className="font-display mt-5 text-4xl leading-tight sm:text-6xl">
          Seu resultado:{" "}
          <span className="bg-gradient-to-r from-brand to-brand-glow bg-clip-text text-transparent">
            {result.title}
          </span>
        </h2>
      </div>

      <div className="glass mb-6 rounded-3xl p-6">
        <div className="mb-5">
          <div className="mb-2 flex items-center justify-between text-xs uppercase tracking-[0.25em] text-muted-foreground">
            <span>Intensidade dos sinais</span>
            <span className="text-brand-glow">{intensity}%</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-white/5">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${intensity}%` }}
              transition={{ duration: reducedMotion ? 0.25 : 1, ease: "easeOut" }}
              className="h-full rounded-full bg-gradient-to-r from-brand to-brand-red shadow-[0_0_14px] shadow-brand-red-glow"
            />
          </div>
        </div>

        <p className="text-xs uppercase tracking-[0.3em] text-brand-glow">
          Com base nas suas respostas
        </p>
        <h3 className="font-display mt-3 text-3xl leading-tight sm:text-4xl">
          {result.identityTitle ??
            "Identificamos alguns sinais comuns de sobrecarga mental e física no seu dia a dia."}
        </h3>
        <p className="mt-5 text-lg font-semibold">
          {result.identityPrompt ?? "Agora me diz... você se identifica com isso?"}
        </p>

        <ul className="mt-5 space-y-3">
          {identitySignals.map((answer) => (
            <li
              key={`${answer.label}-${answer.signal}`}
              className="flex items-start gap-3 text-sm sm:text-base"
            >
              <CheckCircle2 className="mt-0.5 h-5 w-5 flex-shrink-0 text-brand-glow" />
              <span>{answer.signal}</span>
            </li>
          ))}
        </ul>

        <p className="mt-5 rounded-2xl border border-brand/30 bg-brand/10 p-4 text-sm font-medium text-foreground">
          {result.identityClosing ??
            "Se você marcou mentalmente 2 ou mais pontos... seu corpo pode estar pedindo suporte."}
        </p>
      </div>

      <div className="glass relative overflow-hidden rounded-3xl p-8 sm:p-10">
        <div className="absolute -right-16 -top-16 h-56 w-56 rounded-full bg-brand-red/18 blur-3xl" />
        <div className="relative grid gap-8 sm:grid-cols-[1fr_auto] sm:items-center">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-brand-glow">
              O que pode ajudar no seu caso
            </p>
            <h3 className="font-display mt-2 text-4xl leading-none sm:text-5xl">
              {recommendation.name}
            </h3>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              Com base no seu perfil, essa é uma das opções mais indicadas.
            </p>
            <p className="mt-2 text-sm font-semibold text-foreground">{recommendation.fit}</p>

            <ul className="mt-6 space-y-2.5">
              {recommendation.bullets.map((benefit) => (
                <li key={benefit} className="flex items-start gap-3 text-sm sm:text-base">
                  <CheckCircle2 className="mt-0.5 h-5 w-5 flex-shrink-0 text-brand-glow" />
                  <span>{benefit}</span>
                </li>
              ))}
            </ul>
          </div>

          <motion.div
            initial={reducedMotion ? { opacity: 0 } : { scale: 0.9, opacity: 0 }}
            animate={reducedMotion ? { opacity: 1 } : { scale: 1, opacity: 1 }}
            transition={reducedMotion ? { duration: 0.2 } : { delay: 0.2, type: "spring" }}
            className="relative mx-auto"
          >
            <div className="absolute inset-0 rounded-full bg-brand-glow/30 blur-2xl" />
            <img
              src={recommendation.image}
              alt={recommendation.name}
              className="relative w-56 drop-shadow-[0_20px_60px_rgba(210,35,45,0.35)] sm:w-64"
            />
          </motion.div>
        </div>
      </div>

      <div className="mt-6 rounded-3xl border border-brand-red/40 bg-brand-red/10 p-6 text-center shadow-[0_24px_80px_-40px] shadow-brand-red-glow">
        <AnimatePresence mode="wait">
          {benefitState === "revealed" ? (
            <motion.div
              key="revealed-benefit"
              initial={{ opacity: 0, y: 12, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.35 }}
            >
              <p className="text-xs uppercase tracking-[0.3em] text-brand-red-glow">
                Condição exclusiva liberada
              </p>
              <h3 className="font-display mt-2 text-4xl text-brand-red-glow sm:text-5xl">
                30% de desconto
              </h3>
              <div className="mx-auto mt-4 max-w-md rounded-2xl border border-white/15 bg-black/20 p-5">
                <p className="text-xs uppercase tracking-[0.25em] text-white/55">
                  {recommendation.name}
                </p>
                <div className="mt-3 flex flex-wrap items-end justify-center gap-x-4 gap-y-2">
                  <span className="text-sm font-semibold text-white/55 line-through decoration-brand-red-glow decoration-2">
                    {formattedPreviousPrice}
                  </span>
                  <span className="font-display text-5xl leading-none text-white sm:text-6xl">
                    {formattedPrice}
                  </span>
                </div>
                <p className="mt-2 text-xs font-semibold uppercase tracking-[0.2em] text-brand-red-glow">
                  Oferta válida apenas pelas próximas 5 horas
                </p>
                <div className="mx-auto mt-3 inline-flex items-center gap-2 rounded-full border border-brand-red/40 bg-brand-red/15 px-4 py-2 font-mono text-lg font-bold text-white tabular-nums">
                  <Clock3 className="h-4 w-4 text-brand-red-glow" />
                  <OfferCountdown endsAt={offerEndsAt} />
                </div>
              </div>
              <p className="mx-auto mt-2 max-w-lg text-sm text-white/80">
                Válido para quem falar com o especialista agora e confirmar a recomendação
                personalizada Amevit.
              </p>
            </motion.div>
          ) : (
            <motion.div
              key="hidden-benefit"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.3 }}
            >
              <p className="text-xs uppercase tracking-[0.3em] text-brand-red-glow">
                Você deu um passo importante para sua saúde
              </p>
              <h3 className="font-display mt-2 text-3xl text-white sm:text-4xl">
                Tem uma condição especial esperando por você.
              </h3>
              <p className="mx-auto mt-2 max-w-lg text-sm text-white/80">
                Como você concluiu sua análise, a Amevit pode liberar um benefício exclusivo para
                começar seu cuidado com mais facilidade.
              </p>
              <motion.button
                whileHover={
                  benefitState === "hidden" && !reducedMotion ? { scale: 1.03 } : undefined
                }
                whileTap={benefitState === "hidden" && !reducedMotion ? { scale: 0.97 } : undefined}
                onClick={revealBenefit}
                disabled={benefitState === "loading"}
                className="mt-5 inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-gradient-to-r from-brand-red to-brand-red-glow px-6 py-3 text-sm font-semibold text-white shadow-[0_0_45px_-14px] shadow-brand-red-glow transition hover:brightness-110 disabled:cursor-wait disabled:opacity-80"
              >
                {benefitState === "loading" ? (
                  <>
                    <LoaderCircle className="h-4 w-4 animate-spin" />
                    Liberando benefício...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4" />
                    Revelar minha condição
                  </>
                )}
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="mt-8 text-center">
        {benefitState === "revealed" ? (
          <motion.a
            whileHover={reducedMotion ? undefined : { scale: 1.03 }}
            whileTap={reducedMotion ? undefined : { scale: 0.97 }}
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => {
              trackEvent("Lead", { content_name: "WhatsApp especialista" });
              trackEvent("Contact", { content_name: "WhatsApp especialista" });
            }}
            className="inline-flex items-center gap-3 rounded-full bg-gradient-to-r from-brand to-brand-red px-8 py-5 text-base font-semibold text-white shadow-[0_0_50px_-10px] shadow-brand-red-glow transition-all hover:shadow-[0_0_70px_-5px] hover:shadow-brand-red-glow"
          >
            <MessageCircle className="h-5 w-5" />
            Falar com o especialista
          </motion.a>
        ) : (
          <button
            type="button"
            disabled
            className="inline-flex cursor-not-allowed items-center gap-3 rounded-full bg-white/10 px-8 py-5 text-base font-semibold text-muted-foreground opacity-70"
          >
            <MessageCircle className="h-5 w-5" />
            Revele sua condição para falar com o especialista
          </button>
        )}
        <p className="mt-3 text-xs text-muted-foreground">
          A recomendação é personalizada pelo quiz e pode ser confirmada no atendimento.
        </p>

        <button
          onClick={onRestart}
          className="mt-8 text-xs uppercase tracking-[0.25em] text-muted-foreground transition hover:text-foreground"
        >
          Refazer o quiz
        </button>
      </div>
    </motion.div>
  );
});

const OfferCountdown = memo(function OfferCountdown({ endsAt }: { endsAt: number }) {
  const [remainingOfferTime, setRemainingOfferTime] = useState(() =>
    Math.max(0, endsAt - Date.now()),
  );

  useEffect(() => {
    const updateRemainingTime = () => {
      setRemainingOfferTime(Math.max(0, endsAt - Date.now()));
    };

    updateRemainingTime();
    const interval = window.setInterval(updateRemainingTime, 1000);

    return () => window.clearInterval(interval);
  }, [endsAt]);

  return <span>{formatOfferTime(remainingOfferTime)}</span>;
});
