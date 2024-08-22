import { NextResponse } from "next/server";
import { createChaptersSchema } from "@/validators/course";
import { ZodError } from "zod";
import { strict_output } from "../../../../lib/gpt";
import { getUnsplashImage } from "@/lib/unsplash";
import { prisma } from "@/lib/db";

// export async function POST(req: Request) {
//   try {
//     const body = await req.json();
//     const { title, units } = createChaptersSchema.parse(body);

//     type OutputUnits = {
//       title: string;
//       chapters: {
//         youtube_search_query: string;
//         chapter_title: string;
//       }[];
//     }[];

//     let output_units: OutputUnits = await strict_output_gemini(
//       "You are an AI capable of curating course content, coming up with relevant chapter titles, and finding relevant YouTube videos for each chapter.",
//       new Array(units.length).fill(
//         `It is your job to create a course about ${title}. The user has requested to create chapters for each of the units. Then, for each chapter provide a detailed YouTube search query that can be used to find an informative educational video for each chapter. Each query should give an educational informative course on YouTube.`
//       ),
//       {
//         title: "title of the unit",
//         chapters:
//           "an array of chapters, each chapter should have a youtube_search_query and a chapter_title key in the JSON object",
//       }
//     );

//     const imageSearchTerm = await strict_output_gemini(
//       "You are an AI capable of finding the most relevant image for a course.",
//       `Please provide a good image search term for the title of a course about ${title}. This search term will be fed into the Unsplash API, so make sure it is a good search term that will return good results.`,
//       {
//         image_search_term: "a good search term for the title of the course",
//       }
//     );

//     const course_image = await getUnsplashImage(
//       imageSearchTerm.image_search_term
//     );

//     const course = await prisma.course.create({
//       data: {
//         name: title,
//         image: course_image,
//       },
//     });

//     for (const unit of output_units) {
//       const prismaUnit = await prisma.unit.create({
//         data: {
//           name: unit.title,
//           courseId: course.id,
//         },
//       });

//       await prisma.chapter.createMany({
//         data: unit.chapters.map((chapter) => ({
//           name: chapter.chapter_title,
//           youtubeSearchQuery: chapter.youtube_search_query,
//           unitId: prismaUnit.id,
//         })),
//       });
//     }

//     return new NextResponse(JSON.stringify({ course_id: course.id }), {
//       status: 200,
//     });
//   } catch (error) {
//     console.error(error);
//     if (error instanceof ZodError) {
//       return new NextResponse(JSON.stringify(error), { status: 400 });
//     }

//     // Catch-all error handler
//     return new NextResponse("An unexpected error occurred", { status: 500 });
//   }
// }

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { title, units } = createChaptersSchema.parse(body);

    console.log("title", title);
    console.log("unit", units);

    type OutputUnits = {
      title: string;
      chapters: {
        youtube_search_query: string;
        chapter_title: string;
      }[];
    }[];

    // Generate the chapters and YouTube search queries using Gemini
    let output_units: OutputUnits = await strict_output(
      "You are an AI capable of curating course content, coming up with relevant chapter titles, and finding relevant YouTube videos for each chapter. Output only the JSON structure specified without additional text.",
      new Array(units.length).fill(
        `Create a course about "${title}". Generate 3 chapters for each unit and provide a YouTube search query for each chapter. The output should be in JSON format with each unit containing a 'title' and 'chapters' where each chapter has a 'youtube_search_query' and 'chapter_title'.`
      ),
      {
        title: "title of the unit",
        chapters:
          "an array of 3 chapters, each chapter should have a youtube_search_query and a chapter_title key in the JSON object",
      }
    );

    // Ensure that each unit has a title and each chapter has a title
    if (!output_units || output_units.length === 0) {
      throw new Error("AI failed to generate units and chapters");
    }

    for (const unit of output_units) {
      console.log("unit", unit);
      if (!unit.title || unit.title.trim() === "") {
        throw new Error("Generated unit is missing a title.");
      }

      for (const chapter of unit.chapters) {
        if (!chapter.chapter_title || chapter.chapter_title.trim() === "") {
          throw new Error(
            `Generated chapter in unit "${unit.title}" is missing a title.`
          );
        }
      }
    }

    // Generate a search term for Unsplash
    let imageSearchTerm = await strict_output(
      "You are an AI capable of finding the most relevant image for a course. Output only the JSON structure specified without additional text.",
      `Generate a good image search term for a course titled "${title}". The output should be a JSON object with a single key 'image_search_term'.`,
      {
        image_search_term: "a good search term for the title of the course",
      }
    );

    // Fallback to course title if the search term is empty or invalid
    if (
      !imageSearchTerm?.image_search_term ||
      imageSearchTerm.image_search_term.trim() === ""
    ) {
      imageSearchTerm = { image_search_term: title };
    }

    // Fetch the course image from Unsplash using the generated search term
    const course_image = await getUnsplashImage(
      imageSearchTerm.image_search_term
    );

    // Create the course in the database
    const course = await prisma.course.create({
      data: {
        name: title,
        image: course_image,
      },
    });

    // Create units and chapters in the database
    for (const unit of output_units) {
      const prismaUnit = await prisma.unit.create({
        data: {
          name: unit.title,
          courseId: course.id,
        },
      });

      await prisma.chapter.createMany({
        data: unit.chapters.map((chapter) => ({
          name: chapter.chapter_title,
          youtubeSearchQuery: chapter.youtube_search_query,
          unitId: prismaUnit.id,
        })),
      });
    }

    return new NextResponse(JSON.stringify({ course_id: course.id }), {
      status: 200,
    });
  } catch (error) {
    console.error(error);

    if (error instanceof ZodError) {
      return new NextResponse(JSON.stringify(error), { status: 400 });
    }

    // Catch-all error handler
    return new NextResponse("An unexpected error occurred", { status: 500 });
  }
}
