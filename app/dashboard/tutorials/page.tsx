import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { VideoCard } from "@/components/dashboard/video-card";
import type { VideoTutorial } from "@/components/dashboard/video-card";

const tutorials: VideoTutorial[] = [
  {
    id: "1",
    title: "Getting Started with Microsoft Word",
    description:
      "Learn the basics of Microsoft Word — creating documents, formatting text, inserting images, and saving your work properly.",
    duration: "12:34",
    instructor: "Phoebe France",
    pillar: "Digital Literacy",
    pillarColor: "bg-sky-100 text-sky-700 dark:bg-sky-900/40 dark:text-sky-300",
    youtubeId: "S-nHYzK-BVg",
  },
  {
    id: "2",
    title: "Excel Basics: Formulas & Spreadsheets",
    description:
      "Understand cells, rows, and columns. Learn how to enter data, create simple formulas, and format spreadsheets for clarity.",
    duration: "15:20",
    instructor: "Phoebe France",
    pillar: "Digital Literacy",
    pillarColor: "bg-sky-100 text-sky-700 dark:bg-sky-900/40 dark:text-sky-300",
    youtubeId: "k1VUZEVuDJ8",
  },
  {
    id: "3",
    title: "Presentation Design: Slides That Stand Out",
    description:
      "Full presentation-design skills: Google Slides or PowerPoint, layout, colour, visuals, and storytelling — as in the dedicated Career Readiness course.",
    duration: "10:45",
    instructor: "Phoebe France",
    pillar: "Career Readiness",
    pillarColor: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300",
    youtubeId: "K3GYMunreorganized",
  },
  {
    id: "4",
    title: "Introduction to Prompt Engineering",
    description:
      "Discover how to communicate effectively with AI tools like ChatGPT. Learn prompt structure, context setting, and iterative refinement.",
    duration: "8:52",
    instructor: "Phoebe France",
    pillar: "Career Readiness",
    pillarColor: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300",
    youtubeId: "hhvBmFV4MZk",
  },
  {
    id: "5",
    title: "Graphic Design with Canva",
    description:
      "Create posters, social media graphics, and simple logos using Canva's free tools. Perfect for building a personal brand.",
    duration: "14:10",
    instructor: "Phoebe France",
    pillar: "Career Readiness",
    pillarColor: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300",
    youtubeId: "rMj4SL9aAPQ",
  },
  {
    id: "6",
    title: "Professional Etiquette in the Workplace",
    description:
      "Learn the unwritten rules of professional life — how to greet, communicate, dress, and conduct yourself with confidence.",
    duration: "9:30",
    instructor: "Phoebe France",
    pillar: "Life Skills",
    pillarColor: "bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-300",
    youtubeId: "8rVF0gHjScE",
  },
  {
    id: "7",
    title: "Typing Speed & Accuracy Practice",
    description:
      "Improve your typing speed with structured exercises. Learn proper finger placement and build muscle memory for the keyboard.",
    duration: "7:15",
    instructor: "Phoebe France",
    pillar: "Digital Literacy",
    pillarColor: "bg-sky-100 text-sky-700 dark:bg-sky-900/40 dark:text-sky-300",
    youtubeId: "MesrrYyuOS4",
  },
  {
    id: "8",
    title: "The Power of African Storytelling",
    description:
      "Explore the rich tradition of oral storytelling in African culture. Understand how narratives shape identity, values, and community.",
    duration: "11:40",
    instructor: "Phoebe France",
    pillar: "Cultural Identity",
    pillarColor: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300",
    youtubeId: "XjhfeU1sMIM",
  },
  {
    id: "9",
    title: "Resume Writing & Job Applications",
    description:
      "Build a professional resume from scratch. Learn what employers look for and how to present your skills and experience clearly.",
    duration: "13:25",
    instructor: "Phoebe France",
    pillar: "Career Readiness",
    pillarColor: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300",
    youtubeId: "Tt08KmFfIYQ",
  },
];

const pillarFilters = [
  "All",
  "Digital Literacy",
  "Career Readiness",
  "Life Skills",
  "Cultural Identity",
];

export default function TutorialsPage() {
  return (
    <>
      <DashboardHeader heading="Video Tutorials" />
      <div className="flex-1 space-y-6 p-6">
        <div>
          <h2 className="text-lg font-semibold">Learn at Your Own Pace</h2>
          <p className="text-sm text-muted-foreground">
            Watch video lessons from our instructors across all four curriculum
            pillars. Click on any video to start learning.
          </p>
        </div>

        {/* Pillar filter chips */}
        <div className="flex flex-wrap gap-2">
          {pillarFilters.map((filter) => (
            <span
              key={filter}
              className="cursor-default rounded-full border bg-muted px-3 py-1 text-xs font-medium text-muted-foreground"
            >
              {filter}
            </span>
          ))}
        </div>

        {/* Video grid */}
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {tutorials.map((video) => (
            <VideoCard key={video.id} video={video} />
          ))}
        </div>
      </div>
    </>
  );
}
