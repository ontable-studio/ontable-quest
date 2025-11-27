"use client";

import { Suspense } from "react";
import { QuestionForm } from "@/components/forms/question-form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { QuestionsList } from "@/components/questions/questions-list";
import { InfiniteQuestionsList } from "@/components/questions/infinite-questions-list";
import { Badge } from "@/components/ui/badge";
import { MessageSquare, Users } from "lucide-react";
import QuestionsLoading from "./loading";
import { motion } from "framer-motion";
import { useUserId } from "@/hooks/use-user-id";

export const dynamic = "force-dynamic";

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1,
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

const cardVariants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.5,
      ease: [0.25, 0.1, 0.25, 1] as const,
    },
  },
};

const sectionVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.7,
      ease: [0.25, 0.1, 0.25, 1] as const,
    },
  },
};

export default function QuestionsPage() {
  const { userId } = useUserId();
  // No height management needed - using fixed heights with scrolling

  return (
    <div className="min-h-screen bg-background font-sans overflow-hidden">
      <main className="container mx-auto py-8 px-4">
        <motion.section
          className="flex flex-col gap-8 lg:flex-row lg:items-start"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Question Form */}
          <motion.div
            className="lg:w-1/2"
            variants={cardVariants}
            whileHover={{ y: -2 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="flex flex-col w-full shadow-lg hover:shadow-xl transition-shadow duration-300 h-[527]">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
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
            variants={cardVariants}
            whileHover={{ y: -2 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="flex flex-col w-full shadow-lg hover:shadow-xl transition-shadow duration-300 h-[527]">
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
              >
                <CardHeader className="shrink-0">
                  <CardTitle className="flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <motion.div
                        animate={{ scale: [1, 1.1, 1] }}
                        transition={{ duration: 2, repeat: Infinity }}
                      >
                        <Users className="h-5 w-5" />
                      </motion.div>
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
                  <QuestionsList
                    autoRefresh={false}
                    refreshInterval={5000}
                    currentUserId={userId || undefined}
                  />
                </Suspense>
              </CardContent>
            </Card>
          </motion.div>
        </motion.section>

        {/* Full Questions List with Infinite Scroll */}
        <motion.section
          className="mt-12 pt-8 border-t"
          variants={sectionVariants}
          initial="hidden"
          animate="visible"
          transition={{ delay: 0.5 }}
        >
          <Suspense fallback={<QuestionsLoading />}>
            <InfiniteQuestionsList
              autoRefresh={false}
              refreshInterval={10000}
              currentUserId={userId || undefined}
            />
          </Suspense>
        </motion.section>
      </main>
    </div>
  );
}
