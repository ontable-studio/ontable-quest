"use client";

import { useState, useEffect } from "react";

export function useUserId() {
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Generate or retrieve user ID on client side only
    const initUserId = () => {
      try {
        let storedUserId = localStorage.getItem("ontable-user-id");

        if (!storedUserId) {
          // Generate a new unique ID
          const newUserId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
          localStorage.setItem("ontable-user-id", newUserId);
          storedUserId = newUserId;
        }

        setUserId(storedUserId);
      } catch (error) {
        console.error("Failed to get/create user ID:", error);
        // Fallback to session-based ID if localStorage fails
        const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        setUserId(sessionId);
      } finally {
        setLoading(false);
      }
    };

    initUserId();
  }, []);

  return { userId, loading };
}