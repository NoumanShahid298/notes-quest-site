export const reviewSessionKey = 'studynotes-review-prompt';
export const reviewOpenEvent = 'studynotes-open-review';
export const reviewSubmittedEvent = 'studynotes-review-submitted';

export function shouldPromptReview(suppressed: boolean, elapsedMs: number, mobile: boolean, scrollProgress: number) {
  if (suppressed) return false;
  return mobile ? elapsedMs >= 45000 && scrollProgress >= 0.6 : elapsedMs >= 20000;
}