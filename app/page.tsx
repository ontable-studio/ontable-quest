"use client";

import React, { memo, useMemo, useCallback } from "react";
import { QuestionForm } from "@/components/forms/question-form";
import { SimpleScrollList } from "@/components/questions/questions-list-main";
import { Suspense } from "react";
import QuestionsLoading from "@/app/questions/loading";
import { useSession } from "next-auth/react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  MessageSquare,
  Users,
  TrendingUp,
  Star,
  Sword,
  Sparkles,
  PartyPopper,
  Zap,
  Trophy,
  Target,
  Flame,
  Rocket,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

// Pre-computed icon array for better performance
const ICONS = [
  Sparkles,
  Star,
  Zap,
  Trophy,
  Target,
  Flame,
  Rocket,
  Sword,
  MessageSquare,
  Users,
  TrendingUp,
  PartyPopper,
];

// Animation variants - memoized for performance
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: [0.25, 0.1, 0.25, 1] as const,
    },
  },
};

const textVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      duration: 0.8,
      staggerChildren: 0.05,
      delayChildren: 0.3,
    },
  },
};

const wordVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
      ease: [0.25, 0.1, 0.25, 1] as const,
    },
  },
};

const statsVariants = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.6,
      ease: [0.25, 0.1, 0.25, 1] as const,
    },
  },
};

// FAQ data memoized to prevent recreation on every render
const FAQ_DATA = [
  {
    value: "item-1",
    question: "How do I ask a good question?",
    answer:
      "Be specific and provide context about your problem. Include what you've tried, any error messages, and your goal. The more details you provide, the better the community can help you. Choose the most appropriate category to reach the right experts.",
  },
  {
    value: "item-2",
    question: "Can I create custom categories?",
    answer:
      "Yes! When asking a question, you can select from predefined categories or create your own custom category if none of the existing ones fit your topic. This helps organize questions and ensures they reach the right audience.",
  },
  {
    value: "item-3",
    question: "Are questions updated in real-time?",
    answer:
      "Absolutely! Questions and answers are updated automatically every few seconds without needing to refresh the page. You'll see new questions appear instantly as they're submitted by other users.",
  },
  {
    value: "item-4",
    question: "Is my name required when asking questions?",
    answer:
      "No, your name is optional. You can ask questions anonymously if you prefer. Your name helps the community know who they're helping, but it's completely optional to encourage participation.",
  },
  {
    value: "item-5",
    question: "What topics can I ask about?",
    answer:
      "You can ask questions about any topic! We have categories for Programming, Design, Marketing, 3D, Unity, Project Management, Data Science, Machine Learning, DevOps, and more. If your topic doesn't fit existing categories, you can create a custom one.",
  },
];

// Main heading text array memoized
const HEADING_LINES = ["Ask Questions.", "Get Answers.", "Learn Together."];

// Optimized deterministic random function
const fastRandom = (seed: number) => {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
};

// Memoized icon animation component
const IconAnimation = memo(({ index }: { index: number }) => {
  const Icon = ICONS[index % ICONS.length];

  const leftValues = useMemo(() => {
    const random1 = fastRandom(index * 9301 + 49297);

    return {
      size: 0.8 + random1 * 1.2,
      y: -200 + random1 * 400,
      x: -450 - index * 30 - random1 * 20,
      duration: 2 + random1 * 2,
      delay: (index + 1) * 0.1 + random1 * 0.3,
      rotation: 360 + random1 * 180,
    };
  }, [index]);

  const rightValues = useMemo(() => {
    const random1 = fastRandom((index + 100) * 9301 + 49297);

    return {
      size: 0.8 + random1 * 1.2,
      y: -200 + random1 * 400,
      x: 450 + index * 30 + random1 * 20,
      duration: 2 + random1 * 2,
      delay: (index + 1) * 0.1 + random1 * 0.3 + 0.5,
      rotation: 360 + random1 * 180,
    };
  }, [index]);

  // Pre-calculate dimensions to avoid hydration mismatches
  const leftWidth = useMemo(
    () => Math.round(16 * leftValues.size),
    [leftValues.size],
  );
  const leftHeight = useMemo(
    () => Math.round(16 * leftValues.size),
    [leftValues.size],
  );
  const rightWidth = useMemo(
    () => Math.round(16 * rightValues.size),
    [rightValues.size],
  );
  const rightHeight = useMemo(
    () => Math.round(16 * rightValues.size),
    [rightValues.size],
  );

  // Use a dynamic import approach to prevent server-side rendering of animations
  // This avoids hydration mismatches while keeping animations on client
  const [isClient, setIsClient] = React.useState(false);

  React.useEffect(() => {
    setIsClient(true);
  }, []);

  // Don't render animations on server to prevent hydration mismatch
  if (!isClient) {
    return (
      <React.Fragment key={`icon-pair-${index}`}>
        <div
          className="absolute left-1/2 top-1/2 hidden lg:block"
          style={{ zIndex: 1, opacity: 0 }}
        />
        <div
          className="absolute left-1/2 top-1/2 hidden lg:block"
          style={{ zIndex: 1, opacity: 0 }}
        />
      </React.Fragment>
    );
  }

  return (
    <React.Fragment key={`icon-pair-${index}`}>
      <motion.div
        className="absolute left-1/2 top-1/2 hidden lg:block"
        initial={{
          x: -250,
          y: 0,
          opacity: 0,
          scale: leftValues.size * 0.3,
          rotate: 0,
        }}
        animate={{
          x: [-250, leftValues.x, -250],
          y: [0, leftValues.y, 0],
          opacity: [0, 1, 0],
          scale: [
            leftValues.size * 0.3,
            leftValues.size,
            leftValues.size * 0.3,
          ],
          rotate: [0, leftValues.rotation, 0],
        }}
        transition={{
          duration: leftValues.duration,
          repeat: Infinity,
          repeatType: "loop",
          delay: leftValues.delay + 1,
          ease: [0.25, 0.1, 0.25, 1] as const,
          type: "tween",
          times: [0, 0.5, 1],
        }}
        style={{ zIndex: 1, willChange: "transform" }}
      >
        <Icon
          className="text-primary opacity-70"
          width={leftWidth}
          height={leftHeight}
        />
      </motion.div>

      <motion.div
        className="absolute left-1/2 top-1/2 hidden lg:block"
        initial={{
          x: 250,
          y: 0,
          opacity: 0,
          scale: rightValues.size * 0.3,
          rotate: 0,
        }}
        animate={{
          x: [250, rightValues.x, 250],
          y: [0, rightValues.y, 0],
          opacity: [0, 1, 0],
          scale: [
            rightValues.size * 0.3,
            rightValues.size,
            rightValues.size * 0.3,
          ],
          rotate: [0, -rightValues.rotation, 0],
        }}
        transition={{
          duration: rightValues.duration,
          repeat: Infinity,
          repeatType: "loop",
          delay: rightValues.delay + 1,
          ease: [0.25, 0.1, 0.25, 1] as const,
          type: "tween",
          times: [0, 0.5, 1],
        }}
        style={{ zIndex: 1, willChange: "transform" }}
      >
        <Icon
          className="text-primary opacity-70"
          width={rightWidth}
          height={rightHeight}
        />
      </motion.div>
    </React.Fragment>
  );
});

IconAnimation.displayName = "IconAnimation";

// Memoized background effects - optimized with blur filter
const BackgroundEffects = memo(() => (
  <>
    <motion.div
      className="absolute inset-0 bg-linear-to-r from-primary/2 via-primary/4 to-primary/2"
      animate={{
        opacity: [0.1, 0.2, 0.1],
        scale: [0.98, 1.02, 0.98],
      }}
      transition={{
        duration: 4,
        repeat: Infinity,
        repeatType: "reverse",
        ease: "easeInOut",
      }}
      style={{
        filter: "blur(40px)",
        zIndex: 0,
        willChange: "transform, opacity",
      }}
    />
    <motion.div
      className="absolute inset-0 bg-linear-to-l from-secondary/2 via-secondary/4 to-secondary/2"
      animate={{
        opacity: [0.08, 0.15, 0.08],
        scale: [1.02, 0.98, 1.02],
      }}
      transition={{
        duration: 5,
        repeat: Infinity,
        repeatType: "reverse",
        ease: "easeInOut",
      }}
      style={{
        filter: "blur(60px)",
        zIndex: 0,
        willChange: "transform, opacity",
      }}
    />
  </>
));

BackgroundEffects.displayName = "BackgroundEffects";

// Memoized central pulse effect - optimized with blur filter
const CentralPulse = memo(() => (
  <motion.div
    className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
    animate={{
      scale: [1, 1.2, 1],
      opacity: [0.15, 0.08, 0.15],
    }}
    transition={{
      duration: 3,
      repeat: Infinity,
      repeatType: "reverse",
      ease: "easeInOut",
    }}
    style={{
      willChange: "transform, opacity",
    }}
  >
    <div
      className="w-96 h-96 rounded-full bg-linear-to-r from-primary/8 via-primary/12 to-primary/8"
      style={{
        filter: "blur(80px)",
      }}
    />
  </motion.div>
));

CentralPulse.displayName = "CentralPulse";

// Memoized FAQ section
const FAQSection = memo(() => (
  <motion.section
    initial={{ opacity: 0, y: 50 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.8, delay: 1.8 }}
    style={{ willChange: "transform" }}
  >
    <motion.div
      whileHover={{ y: -2 }}
      transition={{ duration: 0.3 }}
      style={{ willChange: "transform" }}
    >
      <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2 }}
        >
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <motion.div
                animate={{ rotate: [0, 360] }}
                transition={{
                  duration: 20,
                  repeat: Infinity,
                  ease: "linear",
                }}
                style={{ willChange: "transform" }}
              >
                <MessageSquare className="h-5 w-5" />
              </motion.div>
              Frequently Asked Questions
            </CardTitle>
            <CardDescription>
              Learn more about how OnTable Quest works and how to get the most
              out of it.
            </CardDescription>
          </CardHeader>
        </motion.div>
        <CardContent>
          <Accordion type="single" collapsible className="w-full">
            {FAQ_DATA.map((item, index) => (
              <motion.div
                key={item.value}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 2.2 + index * 0.1 }}
              >
                <AccordionItem value={item.value}>
                  <AccordionTrigger className="text-left hover:text-primary transition-colors">
                    {item.question}
                  </AccordionTrigger>
                  <AccordionContent>{item.answer}</AccordionContent>
                </AccordionItem>
              </motion.div>
            ))}
          </Accordion>
        </CardContent>
      </Card>
    </motion.div>
  </motion.section>
));

FAQSection.displayName = "FAQSection";

export default function Home() {
  const router = useRouter();
  const { data: session } = useSession();
  const userId = session?.user?.id;

  // Memoized callbacks to prevent recreation on every render
  const scrollToForm = useCallback(() => {
    const formElement = document.getElementById("question-form");
    formElement?.scrollIntoView({ behavior: "smooth", block: "center" });
  }, []);

  const scrollToQuestions = useCallback(() => {
    // Navigate to the dedicated questions page for a better browsing experience
    router.push("/questions");
  }, [router]);

  // Function to refresh the questions list after submission

  // Memoized icon animations array - reduced from 15 to 6 for better performance
  const iconAnimations = useMemo(
    () => Array.from({ length: 6 }, (_, i) => i),
    [],
  );

  return (
    <div className="min-h-screen bg-background font-sans overflow-hidden">
      <main className="container mx-auto py-8 px-4">
        <div className="space-y-8 relative">
          {/* Hero Section with Animation */}
          <div className="relative">
            {/* Spreading Icons Animation - Behind heading */}
            <div className="absolute inset-x-0 top-0 h-[50vh] pointer-events-none z-10">
              <motion.div
                className="absolute inset-0 bg-linear-to-r from-primary/2 via-primary/4 to-primary/2"
                animate={{
                  opacity: [0.1, 0.2, 0.1],
                  scale: [0.98, 1.02, 0.98],
                }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  repeatType: "reverse",
                  ease: "easeInOut",
                }}
                style={{
                  filter: "blur(40px)",
                  zIndex: 0,
                  willChange: "transform, opacity",
                }}
              />
              <motion.div
                className="absolute inset-0 bg-linear-to-l from-secondary/2 via-secondary/4 to-secondary/2"
                animate={{
                  opacity: [0.08, 0.15, 0.08],
                  scale: [1.02, 0.98, 1.02],
                }}
                transition={{
                  duration: 5,
                  repeat: Infinity,
                  repeatType: "reverse",
                  ease: "easeInOut",
                }}
                style={{
                  filter: "blur(60px)",
                  zIndex: 0,
                  willChange: "transform, opacity",
                }}
              />

              <motion.div
                className="relative w-full h-full"
                style={{ zIndex: 1 }}
              >
                <CentralPulse />
                {/* Optimized Icons spreading animation */}
                {iconAnimations.map((i) => (
                  <IconAnimation key={i} index={i} />
                ))}
              </motion.div>
            </div>

            {/* Hero Section Content */}
            <motion.section
              className="text-center space-y-4 relative z-20"
              initial="hidden"
              animate="visible"
              variants={containerVariants}
            >
              <motion.div className="space-y-6" variants={itemVariants}>
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Badge variant="secondary" className="inline-flex">
                    Community Q&A Platform
                  </Badge>
                </motion.div>

                {/* Enhanced Header with Decorative Icons */}
                <motion.div className="relative py-12" variants={textVariants}>
                  {/* Subtle Background Glow - optimized */}
                  <motion.div
                    className="absolute inset-0 bg-linear-to-r from-primary/3 via-primary/6 to-primary/3 rounded-2xl -z-10"
                    animate={{ opacity: [0.3, 0.5, 0.3] }}
                    transition={{
                      duration: 6,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                    style={{
                      willChange: "opacity",
                      filter: "blur(80px)",
                    }}
                  />

                  {/* Main Heading */}
                  <motion.h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-center text-foreground relative z-20">
                    {/* Top subtle accent line */}
                    <motion.div
                      className="flex justify-center items-center gap-2 mb-6"
                      initial={{ opacity: 0, y: -20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.4, duration: 0.6 }}
                    >
                      <motion.div
                        className="h-0.5 w-32 bg-linear-to-r from-transparent to-primary"
                        animate={{ scaleX: [0, 1, 1] }}
                        transition={{ duration: 1.5, delay: 0.5 }}
                        style={{
                          transformOrigin: "left",
                          willChange: "transform",
                        }}
                      />
                      <motion.div
                        animate={{ scale: [1, 1.1, 1] }}
                        transition={{
                          duration: 3,
                          repeat: Infinity,
                          delay: 0.8,
                        }}
                        style={{ willChange: "transform" }}
                      >
                        <Star className="h-4 w-4 text-primary" />
                      </motion.div>
                      <motion.div
                        className="h-0.5 w-32 bg-linear-to-l from-transparent to-primary"
                        animate={{ scaleX: [0, 1, 1] }}
                        transition={{ duration: 1.5, delay: 0.7 }}
                        style={{
                          transformOrigin: "right",
                          willChange: "transform",
                        }}
                      />
                    </motion.div>

                    {/* Main animated text */}
                    {HEADING_LINES.map((line, index) => (
                      <motion.div
                        key={index}
                        variants={wordVariants}
                        className="mb-2"
                      >
                        {line.split(" ").map((word, wordIndex) => (
                          <motion.span
                            key={`${index}-${wordIndex}`}
                            className="inline-block mr-2 transition-all duration-200 hover:scale-105 hover:text-primary"
                          >
                            {word}
                          </motion.span>
                        ))}
                      </motion.div>
                    ))}

                    {/* Bottom subtle accent line */}
                    <motion.div
                      className="flex justify-center items-center gap-2 mt-6"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 1.2, duration: 0.6 }}
                    >
                      <motion.div
                        className="h-0.5 w-32 bg-linear-to-r from-transparent to-primary"
                        animate={{ scaleX: [0, 1, 1] }}
                        transition={{ duration: 1.5, delay: 1.3 }}
                        style={{
                          transformOrigin: "left",
                          willChange: "transform",
                        }}
                      />
                      <motion.div
                        animate={{ scale: [1, 1.1, 1] }}
                        transition={{
                          duration: 3,
                          repeat: Infinity,
                          delay: 1.6,
                        }}
                        style={{ willChange: "transform" }}
                      >
                        <Sparkles className="h-4 w-4 text-primary" />
                      </motion.div>
                      <motion.div
                        className="h-0.5 w-32 bg-linear-to-l from-transparent to-primary"
                        animate={{ scaleX: [0, 1, 1] }}
                        transition={{ duration: 1.5, delay: 1.5 }}
                        style={{
                          transformOrigin: "right",
                          willChange: "transform",
                        }}
                      />
                    </motion.div>
                  </motion.h1>
                </motion.div>
              </motion.div>
              <motion.p
                className="mx-auto max-w-[700px] text-muted-foreground text-lg"
                variants={itemVariants}
              >
                Join our community of learners and experts. Ask questions about
                programming, design, business, and more. Get help from people
                who&apos;ve been there.
              </motion.p>
              <motion.div
                className="flex flex-wrap gap-4 justify-center"
                variants={itemVariants}
              >
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  tabIndex={-1}
                >
                  <Button
                    size="lg"
                    className="gap-2 transition-all hover:scale-105 hover:shadow-lg dark:hover:shadow-primary/25"
                    onClick={scrollToForm}
                  >
                    <MessageSquare className="h-4 w-4" />
                    Ask a Question
                  </Button>
                </motion.div>
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  tabIndex={-1}
                >
                  <Button
                    variant="outline"
                    size="lg"
                    className="gap-2 transition-all hover:scale-105 hover:bg-primary hover:text-primary-foreground dark:hover:bg-primary dark:hover:text-primary-foreground"
                    onClick={scrollToQuestions}
                  >
                    <Users className="h-4 w-4" />
                    Browse Questions
                  </Button>
                </motion.div>
              </motion.div>
            </motion.section>
          </div>

          {/* Stats Section */}
          <motion.section
            className="grid gap-4 md:grid-cols-3"
            initial="hidden"
            animate="visible"
            transition={{ delay: 0.8 }}
          >
            <motion.div
              variants={statsVariants}
              whileHover={{ y: -5 }}
              style={{ willChange: "transform" }}
            >
              <Card className="text-center border-2 hover:border-primary/20 transition-colors">
                <CardContent className="pt-6">
                  <div className="flex flex-col items-center space-y-2">
                    <motion.div
                      animate={{ rotate: [0, 10, -10, 0] }}
                      transition={{
                        duration: 4,
                        repeat: Infinity,
                        ease: "linear",
                      }}
                      style={{ willChange: "transform" }}
                    >
                      <TrendingUp className="h-8 w-8 text-primary" />
                    </motion.div>
                    <div className="text-2xl font-bold">Real-time</div>
                    <p className="text-sm text-muted-foreground">
                      Live question updates
                    </p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
            <motion.div
              variants={statsVariants}
              whileHover={{ y: -5 }}
              style={{ willChange: "transform" }}
            >
              <Card className="text-center border-2 hover:border-primary/20 transition-colors">
                <CardContent className="pt-6">
                  <div className="flex flex-col items-center space-y-2">
                    <motion.div
                      animate={{ scale: [1, 1.1, 1] }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: "easeInOut",
                      }}
                      style={{ willChange: "transform" }}
                    >
                      <Users className="h-8 w-8 text-primary" />
                    </motion.div>
                    <div className="text-2xl font-bold">Community</div>
                    <p className="text-sm text-muted-foreground">
                      Get answers from experts
                    </p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
            <motion.div
              variants={statsVariants}
              whileHover={{ y: -5 }}
              style={{ willChange: "transform" }}
            >
              <Card className="text-center border-2 hover:border-primary/20 transition-colors">
                <CardContent className="pt-6">
                  <div className="flex flex-col items-center space-y-2">
                    <motion.div
                      animate={{ rotate: [0, 180, 360] }}
                      transition={{
                        duration: 6,
                        repeat: Infinity,
                        ease: "linear",
                      }}
                      style={{ willChange: "transform" }}
                    >
                      <Star className="h-8 w-8 text-primary" />
                    </motion.div>
                    <div className="text-2xl font-bold">Categories</div>
                    <p className="text-sm text-muted-foreground">
                      Programming, Design, Business & more
                    </p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </motion.section>

          {/* Main Q&A Section */}
          <motion.section
            className="flex flex-col gap-8 lg:flex-row lg:items-start"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1.2 }}
            style={{ willChange: "transform" }}
          >
            {/* Question Form */}
            <motion.div
              className="lg:w-1/2"
              id="question-form"
              whileHover={{ y: -2 }}
              transition={{ duration: 0.3 }}
              style={{ willChange: "transform" }}
            >
              <Card className="flex flex-col w-full shadow-lg hover:shadow-xl transition-shadow duration-300 h-[527]">
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 1.4 }}
                >
                  <CardHeader className="shrink-0">
                    <CardTitle className="flex items-center gap-2">
                      <motion.div
                        animate={{ rotate: [0, 5, -5, 0] }}
                        transition={{
                          duration: 2,
                          repeat: Infinity,
                          ease: "easeInOut",
                        }}
                      >
                        <MessageSquare className="h-5 w-5" />
                      </motion.div>
                      Ask Your Question
                    </CardTitle>
                    <CardDescription>
                      Need help? Our community is here to assist you with
                      programming, design, business, and any other topics.
                    </CardDescription>
                  </CardHeader>
                </motion.div>
                <CardContent className="flex flex-col flex-1 min-h-0">
                  <QuestionForm enableScrolling={true} />
                </CardContent>
              </Card>
            </motion.div>

            {/* Questions List */}
            <motion.div
              className="lg:w-1/2"
              whileHover={{ y: -2 }}
              transition={{ duration: 0.3 }}
              style={{ willChange: "transform" }}
            >
              <Card className="flex flex-col w-full shadow-lg hover:shadow-xl transition-shadow duration-300 h-[527]">
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 1.6 }}
                >
                  <CardHeader className="shrink-0">
                    <CardTitle className="flex items-center justify-between h-5">
                      <span className="flex items-center gap-2">
                        <Users className="h-5 w-5" />
                        Recent Questions
                      </span>
                      <motion.div
                        animate={{ scale: [1, 1.1, 1] }}
                        transition={{ duration: 2, repeat: Infinity }}
                      >
                        <Badge variant="outline" className="animate-pulse">
                          Live
                        </Badge>
                      </motion.div>
                    </CardTitle>
                    <CardDescription>
                      See what the community is asking about. Questions are
                      updated in real-time.
                    </CardDescription>
                  </CardHeader>
                </motion.div>
                <CardContent className="flex flex-col flex-1 min-h-0 px-6">
                  <Suspense fallback={<QuestionsLoading />}>
                    <SimpleScrollList
                      autoRefresh={false}
                      currentUserId={userId}
                      showHeader={false}
                      showSearch={false}
                    />
                  </Suspense>
                </CardContent>
              </Card>
            </motion.div>
          </motion.section>

          {/* FAQ Section */}
          <FAQSection />
        </div>
      </main>
    </div>
  );
}
