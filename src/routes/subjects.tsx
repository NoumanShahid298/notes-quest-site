import { createFileRoute } from '@tanstack/react-router';
import { SubjectCards } from '@/components/study/cards';
import { pageHead } from '@/lib/study-data';
export const Route = createFileRoute('/subjects')({ head: () => pageHead('Explore Subjects', 'Explore study materials for Computer Science, Mathematics, English, Physics, Artificial Intelligence, and Data Science.'), component: Subjects });
function Subjects() { return <><section className="page-intro"><div className="site-container"><span className="eyebrow">Find your focus</span><h1>Explore Subjects</h1><p className="text-muted-foreground">Six paths to a deeper understanding. Where will you start?</p></div></section><section className="section min-h-[550px]"><div className="site-container"><SubjectCards /></div></section></>; }
