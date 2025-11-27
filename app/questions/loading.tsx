"use client";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { MessageSquare, Users, Sparkles } from "lucide-react";

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

// Background effects component
const BackgroundEffects = () => (
  <>
    <motion.div
      className="absolute inset-0 bg-gradient-to-r from-primary/2 via-primary/4 to-primary/2"
      animate={{
        opacity: [0.1, 0.2, 0.1],
        scale: [0.95, 1.05, 0.95],
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
      }}
    />
    <motion.div
      className="absolute inset-0 bg-gradient-to-l from-secondary/2 via-secondary/4 to-secondary/2"
      animate={{
        opacity: [0.08, 0.15, 0.08],
        scale: [1.05, 0.95, 1.05],
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
      }}
    />
  </>
);

export default function QuestionsLoading() {
  return (
    <div className="min-h-screen bg-background font-sans overflow-x-hidden">
      <BackgroundEffects />
      <main className="container mx-auto py-8 px-4 relative z-10">
        <div className="space-y-8">
          {/* Hero Section */}
          <motion.div
            className="relative"
            initial="hidden"
            animate="visible"
            variants={containerVariants}
          >
            <motion.section className="text-center space-y-4 relative z-20">
              <motion.div className="space-y-6" variants={itemVariants}>
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Badge variant="secondary" className="inline-flex">
                    <MessageSquare />
                    Loading Questions
                  </Badge>
                </motion.div>

                <motion.div className="relative py-12" variants={itemVariants}>
                  {/* Background Glow */}
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-primary/3 via-primary/6 to-primary/3 rounded-2xl blur-2xl -z-10"
                    animate={{ opacity: [0.3, 0.5, 0.3] }}
                    transition={{
                      duration: 6,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                  />

                  {/* Main Heading */}
                  <motion.h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-center text-foreground relative z-20">
                    Questions & Answers
                  </motion.h1>
                  <motion.p
                    className="mx-auto max-w-[700px] text-muted-foreground text-lg mt-4"
                    variants={itemVariants}
                  >
                    Discover questions from our community. Loading the latest
                    discussions for you...
                  </motion.p>
                </motion.div>
              </motion.div>

              <motion.div
                className="flex justify-center"
                variants={itemVariants}
              >
                <motion.div
                  animate={{ scale: [1, 1.05, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <Badge variant="outline" className="animate-pulse">
                    <Sparkles />
                    Loading...
                  </Badge>
                </motion.div>
              </motion.div>
            </motion.section>
          </motion.div>

          {/* Main Q&A Section Skeleton */}
          <motion.section
            className="flex flex-col gap-8 lg:flex-row lg:items-start"
            initial="hidden"
            animate="visible"
            variants={containerVariants}
            transition={{ delay: 0.2 }}
          >
            {/* Question Form Skeleton */}
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
                    <div className="flex items-center gap-2">
                      <motion.div
                        animate={{ rotate: [0, 5, -5, 0] }}
                        transition={{
                          duration: 2,
                          repeat: Infinity,
                          ease: "easeInOut",
                        }}
                      >
                        <MessageSquare className="h-5 w-5 text-muted-foreground" />
                      </motion.div>
                      <Skeleton className="h-6 w-32" />
                    </div>
                    <Skeleton className="h-4 w-full mt-2" />
                  </CardHeader>
                </motion.div>
                <CardContent className="flex flex-col flex-1 min-h-0">
                  <div className="space-y-4">
                    <Skeleton className="h-4 w-16" />
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-4 w-24" />
                    <div className="space-y-2">
                      <Skeleton className="h-10 w-full" />
                      <Skeleton className="h-32 w-full" />
                    </div>
                    <Skeleton className="h-4 w-32" />
                  </div>
                  <div className="mt-auto pt-4 border-t">
                    <Skeleton className="h-10 w-32 mx-auto" />
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Questions List Skeleton */}
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
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <motion.div
                          animate={{ scale: [1, 1.1, 1] }}
                          transition={{ duration: 2, repeat: Infinity }}
                        >
                          <Users className="h-5 w-5 text-muted-foreground" />
                        </motion.div>
                        <Skeleton className="h-6 w-32" />
                      </div>
                      <div className="h-6 w-12 bg-muted rounded animate-pulse" />
                    </div>
                    <Skeleton className="h-4 w-full mt-2" />
                  </CardHeader>
                </motion.div>
                <CardContent className="flex flex-col flex-1 min-h-0 px-6">
                  <div className="flex items-center justify-between text-sm text-muted-foreground flex-shrink-0 mb-4">
                    <Skeleton className="h-4 w-16" />
                    <div className="flex items-center gap-2">
                      <motion.div
                        className="h-2 w-2 bg-muted rounded-full"
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ duration: 2, repeat: Infinity }}
                      />
                      <Skeleton className="h-4 w-8" />
                      <Skeleton className="h-8 w-8" />
                    </div>
                  </div>

                  {/* Enhanced Questions List Skeleton */}
                  <div className="flex-1 min-h-0 overflow-hidden">
                    <ScrollArea variant="card" className="h-full">
                      <div className="space-y-4">
                        {[...Array(6)].map((_, i) => (
                          <motion.div
                            key={i}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.4 + i * 0.1 }}
                            whileHover={{ scale: 1.02, y: -2 }}
                          >
                            <Card className="border hover:border-primary/20 transition-colors">
                              <CardHeader>
                                <div className="flex justify-between items-start">
                                  <div className="flex items-center gap-2">
                                    <motion.div
                                      className="w-16 h-6 bg-muted rounded animate-pulse"
                                      animate={{ scale: [1, 1.05, 1] }}
                                      transition={{
                                        duration: 2,
                                        repeat: Infinity,
                                        delay: i * 0.2,
                                      }}
                                    />
                                    <motion.div
                                      className="w-20 h-5 bg-muted rounded animate-pulse"
                                      animate={{ scale: [1, 1.05, 1] }}
                                      transition={{
                                        duration: 2,
                                        repeat: Infinity,
                                        delay: i * 0.3,
                                      }}
                                    />
                                  </div>
                                  <Skeleton className="h-4 w-16" />
                                </div>
                              </CardHeader>
                              <CardContent>
                                <div className="space-y-2">
                                  <Skeleton className="h-4 w-full" />
                                  <Skeleton className="h-4 w-3/4" />
                                  <div className="flex items-center gap-2 pt-2">
                                    <Skeleton className="h-3 w-16" />
                                    <div className="flex items-center gap-4">
                                      <Skeleton className="h-3 w-8" />
                                      <Skeleton className="h-3 w-8" />
                                    </div>
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          </motion.div>
                        ))}
                      </div>
                    </ScrollArea>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </motion.section>

          {/* Full Questions List with Infinite Scroll Skeleton */}
          <motion.section
            className="mt-12 pt-8 border-t"
            initial="hidden"
            animate="visible"
            variants={containerVariants}
            transition={{ delay: 0.5 }}
          >
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              className="text-center space-y-4"
            >
              <motion.div
                animate={{ rotate: [0, 5, -5, 0] }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              >
                <MessageSquare className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              </motion.div>
              <div className="h-8 w-48 bg-muted rounded animate-pulse mx-auto" />
              <div className="h-4 w-96 bg-muted rounded animate-pulse mx-auto" />

              {/* Question cards skeleton */}
              <div className="max-w-4xl mx-auto space-y-4 pt-8">
                {[...Array(8)].map((_, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.8 + i * 0.1 }}
                    whileHover={{ scale: 1.01, y: -2 }}
                  >
                    <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300">
                      <CardHeader>
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <motion.div
                                className="w-20 h-6 bg-muted rounded animate-pulse"
                                animate={{ scale: [1, 1.05, 1] }}
                                transition={{
                                  duration: 2,
                                  repeat: Infinity,
                                  delay: i * 0.2,
                                }}
                              />
                              <motion.div
                                className="w-24 h-5 bg-muted rounded animate-pulse"
                                animate={{ scale: [1, 1.05, 1] }}
                                transition={{
                                  duration: 2,
                                  repeat: Infinity,
                                  delay: i * 0.3,
                                }}
                              />
                            </div>
                            <div className="space-y-2">
                              <Skeleton className="h-5 w-4/5" />
                              <Skeleton className="h-4 w-full" />
                              <Skeleton className="h-4 w-2/3" />
                            </div>
                          </div>
                          <div className="flex flex-col items-end gap-2">
                            <Skeleton className="h-4 w-24" />
                            <div className="flex items-center gap-4">
                              <Skeleton className="h-4 w-12" />
                              <Skeleton className="h-4 w-12" />
                            </div>
                          </div>
                        </div>
                      </CardHeader>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </motion.section>
        </div>
      </main>
    </div>
  );
}
