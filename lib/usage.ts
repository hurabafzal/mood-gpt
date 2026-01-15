import {
  doc,
  getDoc,
  setDoc,
  increment,
  serverTimestamp,
  Firestore
} from "firebase/firestore"

function isSameCalendarDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

export async function incrementPromptCount(db: Firestore, userId: string): Promise<number> {
  const usageRef = doc(db, "users", userId, "usage", "prompt_counter")
  const snap = await getDoc(usageRef);

  let newCount: number;

  if (!snap.exists()) {
    // No doc yet → first prompt ever
    newCount = 1;
    await setDoc(
      usageRef,
      {
        total: 1,
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    );
  } else {
    const data = snap.data();
    const prevTotal = data.total || 0;
    const prevUpdated = data.updatedAt || null;
    const prevDate = prevUpdated ? prevUpdated.toDate() : null;
    const today = new Date();

    if (!prevDate || !isSameCalendarDay(prevDate, today)) {
      // It's a new calendar day → reset to 1
      newCount = 1;
      await setDoc(
        usageRef,
        {
          total: 1,
          updatedAt: serverTimestamp(),
        },
        { merge: true }
      );
    } else {
      // Same day → just increment
      newCount = prevTotal + 1;
      await setDoc(
        usageRef,
        {
          total: increment(1),
          updatedAt: serverTimestamp(),
        },
        { merge: true }
      );
    }
  }

  return newCount;
}