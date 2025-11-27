import { fetchQuestions } from "@/lib/api/questions";
import { Question } from "@/types/common";

interface QuestionsResource {
  read(): Question[];
}

let questionsCache: Question[] | null = null;
let questionsPromise: Promise<Question[]> | null = null;

function fetchQuestionsData(): QuestionsResource {
  if (!questionsPromise) {
    questionsPromise = fetchQuestions()
      .then(response => {
        if (!response.success || !response.data) {
          throw new Error(response.error?.message || "Failed to fetch questions");
        }
        questionsCache = response.data;
        questionsPromise = null;
        return response.data;
      })
      .catch(error => {
        questionsPromise = null;
        throw error;
      });
  }

  return {
    read(): Question[] {
      if (questionsCache !== null) {
        return questionsCache;
      }
      throw questionsPromise;
    }
  };
}

export function createFreshQuestionsResource(): QuestionsResource {
  // Invalidate cache and create fresh resource
  questionsCache = null;
  questionsPromise = null;
  return fetchQuestionsData();
}

export function createQuestionsResource(): QuestionsResource {
  return fetchQuestionsData();
}