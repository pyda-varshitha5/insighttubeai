export async function recordQuizCompletion(
  userId: string
): Promise<boolean> {
  if (
    typeof userId !== "string" ||
    userId.trim() === ""
  ) {
    console.error(
      "Cannot record quiz completion: user ID is missing."
    );

    return false;
  }

  try {
    const response = await fetch(
      "/api/progress",
      {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          userId,
          action: "quiz_completed",
        }),
      }
    );

    /*
     * Read response safely.
     */
    const data = await response.json();

    if (!response.ok) {
      console.error(
        "Failed to record quiz completion:",
        data
      );

      return false;
    }

    /*
     * Tell the dashboard that progress changed.
     */
    if (
      typeof window !== "undefined"
    ) {
      window.dispatchEvent(
        new Event("progress-updated")
      );
    }

    console.log(
      "Quiz completion recorded."
    );

    console.log(
      "Quizzes completed:",
      data.quizzesCompleted
    );

    return true;
  } catch (error) {
    console.error(
      "Quiz completion error:",
      error
    );

    return false;
  }
}