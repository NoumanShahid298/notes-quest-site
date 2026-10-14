import { Code2, Sigma, BookOpen, Atom, BrainCircuit, ChartNoAxesCombined } from 'lucide-react';

export const subjects = [
  { id: 'computer-science', name: 'Computer Science', description: 'From your first line of code to complex algorithms.', icon: Code2, tone: 'blue' },
  { id: 'mathematics', name: 'Mathematics', description: 'Make sense of numbers, equations, and everything in between.', icon: Sigma, tone: 'violet' },
  { id: 'english', name: 'English', description: 'Build stronger language, writing, and literary skills.', icon: BookOpen, tone: 'amber' },
  { id: 'physics', name: 'Physics', description: 'Understand the principles that shape our universe.', icon: Atom, tone: 'green' },
  { id: 'artificial-intelligence', name: 'Artificial Intelligence', description: 'Explore intelligent systems and the future of technology.', icon: BrainCircuit, tone: 'rose' },
  { id: 'data-science', name: 'Data Science', description: 'Turn data into insights with statistics and analytics.', icon: ChartNoAxesCombined, tone: 'cyan' },
] as const;
export const notes = [
  { id: 'data-structures', subject: 'computer-science', title: 'Data Structures & Algorithms', description: 'A clear guide to arrays, linked lists, sorting, and algorithm complexity.', minutes: 8, level: 'Intermediate', sections: [
    { title: 'Choosing a data structure', text: 'Arrays store elements in indexed positions, making access by index O(1). Inserting into the middle usually takes O(n), because elements must shift. A linked list connects nodes through references; finding a position takes O(n), but inserting after a known node takes O(1).' },
    { title: 'Stacks and queues', text: 'A stack follows last in, first out (LIFO) and is useful for undo operations and function calls. A queue follows first in, first out (FIFO) and is useful for scheduling. Both can support O(1) insertion and removal with an appropriate implementation.' },
    { title: 'Time complexity', text: 'Big O describes how resource use grows with input size. Binary search takes O(log n) on a sorted array. Merge sort takes O(n log n) time and O(n) extra space. Always state whether a bound is worst-case, average-case, or amortized.' },
    { title: 'Check your understanding', text: 'Why must an array be sorted before binary search? At each step, the ordering tells us which half can be discarded. Without it, eliminating a half could discard the target.' },
  ] },
  { id: 'calculus', subject: 'mathematics', title: 'Calculus: Limits & Derivatives', description: 'Understand limits, differentiation rules, and their real-world applications.', minutes: 7, level: 'Beginner', sections: [
    { title: 'Limits', text: 'The limit of f(x) as x approaches a is the value f(x) approaches, whether or not f(a) is defined. A two-sided limit exists only when the left-hand and right-hand limits agree. For example, sin(x)/x approaches 1 as x approaches 0, with angles in radians.' },
    { title: 'The derivative', text: 'The derivative is the instantaneous rate of change: f′(x) = lim as h → 0 of [f(x + h) − f(x)] / h. Geometrically, it is the slope of the tangent line. The power rule gives d(xⁿ)/dx = nxⁿ⁻¹ wherever the expression is defined.' },
    { title: 'Essential rules', text: 'Product rule: (uv)′ = u′v + uv′. Chain rule: (f(g(x)))′ = f′(g(x))g′(x). Example: if y = (3x + 1)², then y′ = 2(3x + 1) × 3 = 18x + 6.' },
    { title: 'Exam reminder', text: 'A stationary point has f′(x) = 0, but is not necessarily a maximum or minimum. Check the sign of the derivative on both sides, or use the second derivative test when applicable.' },
  ] },
  { id: 'academic-writing', subject: 'english', title: 'Essentials of Academic Writing', description: 'Structure compelling essays with clear arguments, evidence, and citations.', minutes: 6, level: 'Beginner', sections: [
    { title: 'A focused thesis', text: 'A thesis makes a specific, arguable claim rather than merely announcing a topic. Introduce the issue, explain why it matters, and state your position. Each main paragraph should advance that position.' },
    { title: 'Building a paragraph', text: 'Use a topic sentence, relevant evidence, and analysis that explains how the evidence supports your argument. Finish by linking the point to the overall thesis. Evidence should not be left to speak for itself.' },
    { title: 'Citation and revision', text: 'Credit direct quotations and paraphrased ideas using the required citation style. A paraphrase changes both wording and structure while preserving meaning. Revise first for argument and organization, then edit for grammar and clarity.' },
  ] },
  { id: 'newtons-laws', subject: 'physics', title: 'Newton’s Laws of Motion', description: 'Explore forces, motion, and free-body diagrams with practical examples.', minutes: 5, level: 'Beginner', sections: [
    { title: 'First law: inertia', text: 'In an inertial reference frame, an object remains at rest or moves at constant velocity unless acted on by a nonzero net external force. Zero net force means zero acceleration, not necessarily zero velocity.' },
    { title: 'Second law: force and acceleration', text: 'For constant mass, the vector sum of external forces is F = ma. Draw a free-body diagram and resolve forces along your chosen axes. A 2 kg object experiencing a net force of 6 N has an acceleration of 3 m/s² in the force direction.' },
    { title: 'Third law: interaction pairs', text: 'If object A exerts a force on object B, B exerts an equal and opposite force on A. The two forces act on different objects, so they do not cancel in a free-body diagram for one object.' },
  ] },
  { id: 'machine-learning', subject: 'artificial-intelligence', title: 'Introduction to Machine Learning', description: 'Get familiar with learning models, training data, and model evaluation.', minutes: 9, level: 'Beginner', sections: [
    { title: 'Types of learning', text: 'Supervised learning uses labeled examples for prediction, such as classifying emails or predicting prices. Unsupervised learning finds patterns in unlabeled data, such as clusters. Reinforcement learning learns actions through rewards from interaction with an environment.' },
    { title: 'Training and generalization', text: 'Training adjusts model parameters to reduce a loss. Use separate training, validation, and test sets. Overfitting occurs when a model learns training-specific patterns and performs poorly on unseen data. Regularization and simpler models can help.' },
    { title: 'Evaluating predictions', text: 'Accuracy can mislead when classes are imbalanced. Precision measures the fraction of positive predictions that are correct; recall measures the fraction of actual positives detected. Choose metrics based on the costs of different mistakes.' },
  ] },
  { id: 'statistics', subject: 'data-science', title: 'Statistics for Data Science', description: 'Master descriptive statistics, probability, and the basics of inference.', minutes: 8, level: 'Intermediate', sections: [
    { title: 'Describing data', text: 'The mean is the sum of values divided by their count. The median is the middle value after sorting and is less sensitive to outliers. Variance measures squared spread around the mean, and standard deviation is its square root.' },
    { title: 'Probability and sampling', text: 'A representative sample supports more reliable conclusions about a population. Selection bias can distort results even with a large sample. For independent events A and B, P(A and B) = P(A)P(B).' },
    { title: 'Inference', text: 'A p-value is the probability, under the null hypothesis and model assumptions, of results at least as extreme as those observed. It is not the probability that the null hypothesis is true. Statistical significance does not establish practical importance or causation.' },
  ] },
];
export const getSubject = (id: string) => subjects.find(s => s.id === id);
export const filterNotes = (query: string, subject = 'all') => notes.filter(n => (subject === 'all' || n.subject === subject) && `${n.title} ${getSubject(n.subject)?.name}`.toLowerCase().includes(query.trim().toLowerCase()));
export const pageHead = (title: string, description: string) => ({ meta: [{ title: `${title} | StudyNotes Hub` }, { name: 'description', content: description }, { property: 'og:title', content: `${title} | StudyNotes Hub` }, { property: 'og:description', content: description }, { property: 'og:type', content: 'website' }, { name: 'twitter:card', content: 'summary_large_image' }] });
