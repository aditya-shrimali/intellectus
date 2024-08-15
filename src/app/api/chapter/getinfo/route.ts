// import { prisma } from "@/lib/db";
// import { strict_output } from "@/lib/gpt";
// import {
//   getQuestionsFromTranscript,
//   getTranscript,
//   searchYoutube,
// } from "@/lib/youtube";
// import { NextResponse } from "next/server";

// import { z } from "zod";

// const bodyParser = z.object({
//   chapterId: z.string(),
// });

// export async function POST(req: Request, res: Response) {
//   // console.log("here");
//   try {
//     const body = await req.json();
//     console.log(body);
//     const { chapterId } = bodyParser.parse(body);
//     // console.log("jabdhsckadjoaldjpwojfwopejfdopw-------------");
//     // console.log(chapterId);
//     const chapter = await prisma.chapter.findUnique({
//       where: { id: chapterId },
//     });

//     if (!chapter) {
//       return NextResponse.json(
//         {
//           success: false,
//           error: "chapter not found",
//         },
//         {
//           status: 404,
//         }
//       );
//     }
//     console.log(chapter);
//     const videoId = await searchYoutube(chapter.youtubeSearchQuery);
//     let transcript = await getTranscript(videoId);
//     let maxLength = 500;
//     transcript = transcript.split(" ").slice(0, maxLength).join(" ");
//     // for summary
//     const { summary }: { summary: string } = await strict_output(
//       "you are an AI capable of summarizing a youtube transcript ",
//       "summarize in 250 words or less and do not talk of the sponsors or anything unrelated to the main topic,also do not introduce what the summary is about .\n" +
//         transcript,
//       { summary: "summary of the transcript" }
//     );
//     const questions = await getQuestionsFromTranscript(
//       transcript,
//       chapter.name
//     );

//     await prisma.question.createMany({
//       data: questions.map((question) => {
//         let options = [
//           question.answer,
//           question.option1,
//           question.option2,
//           question.option3,
//         ];
//         options = options.sort(() => Math.random() - 0.5);
//         return {
//           question: question.question,
//           answer: question.answer,
//           options: JSON.stringify(options),
//           chapterId: chapterId,
//         };
//       }),
//     });

//     await prisma.chapter.update({
//       where: { id: chapterId },
//       data: {
//         videoId: videoId,
//         summary: summary,
//       },
//     });
//     console.log(chapter);

//     return NextResponse.json({ success: true });
//   } catch (error) {
//     if (error instanceof z.ZodError) {
//       return NextResponse.json(
//         {
//           success: false,
//           error: "invalid body",
//         },
//         {
//           status: 400,
//         }
//       );
//     } else {
//       return NextResponse.json(
//         {
//           success: false,
//           error: "unknown",
//         },
//         {
//           status: 500,
//         }
//       );
//     }
//   }
// }

// //-------------------------//

import { prisma } from "../../../../lib/db";
import { strict_output } from "../../../../lib/gpt";
import {
  getQuestionsFromTranscript,
  getTranscript,
  searchYoutube,
} from "../../../../lib/youtube";
import { NextResponse } from "next/server";
import { z } from "zod";

const bodyParser = z.object({
  chapterId: z.string(),
});

export async function POST(req: Request, res: Response) {
  try {
    const body = await req.json();

    const { chapterId } = bodyParser.parse(body);
    const chapter = await prisma.chapter.findUnique({
      where: {
        id: chapterId,
      },
    });

    if (!chapter) {
      return NextResponse.json(
        {
          success: false,
          error: "Chapter not found",
        },
        { status: 404 }
      );
    }

    const videoId = await searchYoutube(chapter.youtubeSearchQuery);

    let transcript = await getTranscript(videoId);
    console.log("Transcript:", transcript);

    let maxLength = 500;
    transcript = transcript.split(" ").slice(0, maxLength).join(" ");

    const summaryPrompt = `
Summarize the following transcript in about 250 words. Focus on the main topics and key points. 
Do not mention sponsors or unrelated content. Do not introduce what the summary is about.

Transcript: "${transcript}"

Course Title: "${chapter.name}"
`;

    let summary: string;
    try {
      const summaryResult = await strict_output(
        "You are an AI assistant specialized in summarizing educational content.",
        summaryPrompt,
        { summary: "string (about 250 words)" }
      );

      console.log("Summary result:", summaryResult); // Log the result for debugging

      if (typeof summaryResult.summary !== "string") {
        throw new Error("Invalid summary format from Gemini");
      }

      summary = summaryResult.summary;
    } catch (error) {
      console.error("Error generating summary:", error);
      summary = "Unable to generate summary.";
    }

    // const summaryResult = await strict_output(
    //   "You are an AI capable of summarising a youtube transcript",
    //   "summarise in 250 words or less and do not talk of the sponsors or anything unrelated to the main topic, also do not introduce what the summary is about.\n" +
    //     transcript,
    //   { summary: "summary of the transcript" }
    // );

    // const summary = summaryResult.summary;

    const questions = await getQuestionsFromTranscript(
      transcript,
      chapter.name
    );

    await prisma.question.createMany({
      data: questions.map((question) => {
        let options = [
          question.answer,
          question.option1,
          question.option2,
          question.option3,
        ];
        options = options.sort(() => Math.random() - 0.5);
        return {
          question: question.question,
          answer: question.answer,
          options: JSON.stringify(options),
          chapterId: chapterId,
        };
      }),
    });

    await prisma.chapter.update({
      where: { id: chapterId },
      data: {
        videoId: videoId,
        summary: summary,
      },
    });

    return NextResponse.json({ success: true, chapter });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid body",
        },
        { status: 400 }
      );
    } else {
      return NextResponse.json(
        {
          success: false,
          error: "unknown",
        },
        { status: 500 }
      );
    }
  }
}
