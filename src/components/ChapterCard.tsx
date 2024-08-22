// "use client";
// import { cn } from "@/lib/utils";
// import { Chapter } from "@prisma/client";
// import { useMutation } from "@tanstack/react-query";
// import axios from "axios";
// import React from "react";
// import { useToast } from "./ui/use-toast";
// import { Loader2 } from "lucide-react";

// type Props = {
//   chapter: Chapter;
//   chapterIndex: number;
//   completedChapters: Set<String>;
//   setCompletedChapters: React.Dispatch<React.SetStateAction<Set<String>>>;
// };

// export type ChapterCardHandler = {
//   triggerLoad: () => void;
// };

// const ChapterCard = React.forwardRef<ChapterCardHandler, Props>(
//   ({ chapter, chapterIndex, setCompletedChapters, completedChapters }, ref) => {
//     const { toast } = useToast();
//     const [success, setSuccess] = React.useState<boolean | null>(null);
//     const { mutate: getChapterInfo, isLoading } = useMutation({
//       mutationFn: async () => {
//         console.log("ia a ma uabdjhbsiu");
//         console.log(chapter.id);
//         const response = await axios.post(
//           "http://localhost:3000/api/chapter/getinfo",
//           {
//             chapterId: chapter.id,
//           }
//         );
//         // console.log(response.data);
//         return response.data;
//       },
//     });
//     console.log(chapter);
//     const addChapterIdToSet = React.useCallback(() => {
//       setCompletedChapters((prev) => {
//         const newSet = new Set(prev);
//         newSet.add(chapter.id);
//         return newSet;
//       });
//     }, [chapter.id, setCompletedChapters]);

//     React.useEffect(() => {
//       if (chapter.videoId) {
//         setSuccess(true);
//         addChapterIdToSet;
//       }
//     }, [chapter, addChapterIdToSet]);

//     React.useImperativeHandle(ref, () => ({
//       async triggerLoad() {
//         if (chapter.videoId) {
//           addChapterIdToSet();
//           return;
//         }
//         getChapterInfo(undefined, {
//           onSuccess: () => {
//             setSuccess(true);
//             addChapterIdToSet();
//           },
//           onError: (error) => {
//             console.error(error);
//             setSuccess(false);
//             toast({
//               title: "Error",
//               description: "There was an error loading your chapter",
//               variant: "destructive",
//             });
//             addChapterIdToSet();
//           },
//         });
//       },
//     }));
//     return (
//       <div
//         key={chapter.id}
//         className={cn("px-4 py-2 mt-2 rounded flex justify-between", {
//           "bg-secondary": success === null,
//           "bg-red-500": success === false,
//           "bg-green-500": success === true,
//         })}
//       >
//         <h5>{chapter.name}</h5>
//         {isLoading && <Loader2 className="animate-spin" />}
//       </div>
//     );
//   }
// );

// ChapterCard.displayName = "ChapterCard";

// export default ChapterCard;

"use client";
import { cn } from "@/lib/utils";
import { Chapter } from "@prisma/client";
import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import React from "react";
import { useToast } from "./ui/use-toast";
import { Loader2 } from "lucide-react";

type Props = {
  chapter: Chapter;
  chapterIndex: number;
  completedChapters: Set<String>;
  setCompletedChapters: React.Dispatch<React.SetStateAction<Set<String>>>;
};

export type ChapterCardHandler = {
  triggerLoad: () => void;
};

const ChapterCard = React.forwardRef<ChapterCardHandler, Props>(
  ({ chapter, chapterIndex, setCompletedChapters, completedChapters }, ref) => {
    const { toast } = useToast();
    const [success, setSuccess] = React.useState<boolean | null>(null);
    const { mutate: getChapterInfo, isLoading } = useMutation({
      mutationFn: async () => {
        const response = await axios.post(
          "http://localhost:3000/api/chapter/getinfo",
          {
            chapterId: chapter.id,
          }
        );
        return response.data;
      },
    });

    const addChapterIdToSet = React.useCallback(() => {
      setCompletedChapters((prev) => {
        const newSet = new Set(prev);
        newSet.add(chapter.id);
        return newSet;
      });
    }, [chapter.id, setCompletedChapters]);

    React.useEffect(() => {
      if (chapter.videoId) {
        setSuccess(true);
        addChapterIdToSet;
      }
    }, [chapter, addChapterIdToSet]);

    React.useImperativeHandle(ref, () => ({
      async triggerLoad() {
        if (chapter.videoId) {
          addChapterIdToSet();
          return;
        }
        getChapterInfo(undefined, {
          onSuccess: () => {
            setSuccess(true);
            addChapterIdToSet();
          },
          onError: (error) => {
            console.error(error);
            setSuccess(false);
            toast({
              title: "Error",
              description: "There was an error loading your chapter",
              variant: "destructive",
            });
            addChapterIdToSet();
          },
        });
      },
    }));
    return (
      <div
        key={chapter.id}
        className={cn("px-4 py-2 mt-2 rounded flex justify-between", {
          "bg-secondary": success === null,
          "bg-red-500": success === false,
          "bg-green-500": success === true,
        })}
      >
        <h5>{chapter.name}</h5>
        {isLoading && <Loader2 className="animate-spin" />}
      </div>
    );
  }
);

ChapterCard.displayName = "ChapterCard";

export default ChapterCard;
