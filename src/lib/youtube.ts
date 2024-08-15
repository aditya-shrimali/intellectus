// import axios from "axios";
// import { YoutubeTranscript } from "youtube-transcript";
// import { strict_output } from "./gpt";

// export async function searchYoutube(searchQuery: string) {
//   // hello world => hello+world
//   searchQuery = encodeURIComponent(searchQuery);
//   const { data } = await axios.get(
//     `https://www.googleapis.com/youtube/v3/search?key=${process.env.YOUTUBE_API_KEY}&q=${searchQuery}&videoDuration=medium&videoEmbeddable=true&type=video&maxResults=5`
//   );
//   console.log(data.items);
//   if (!data) {
//     console.log("youtube fail");
//     return null;
//   }
//   if (data.items[0] == undefined) {
//     console.log("youtube fail");
//     return null;
//   }
//   console.log(data.items[0].id.videoId);
//   return data.items[0].id.videoId;
// }

// export async function getTranscript(videoId: string) {
//   try {
//     console.log(videoId);
//     let transcript_arr = await YoutubeTranscript.fetchTranscript(videoId, {
//       lang: "en",
//       country: "EN",
//     });
//     let transcript = "";
//     for (let t of transcript_arr) {
//       transcript += t.text + " ";
//     }
//     return transcript.replaceAll("\n", "");
//   } catch (error) {
//     return "";
//   }
// }

// export async function getQuestionsFromTranscript(
//   transcript: string,
//   course_title: string
// ) {
//   type Question = {
//     question: string;
//     answer: string;
//     option1: string;
//     option2: string;
//     option3: string;
//   };

//   const questions: Question[] = await strict_output(
//     "You are a helpful AI that is able to generate mcq questions and answers, the length of each answer should not be more than 15 words",
//     new Array(5).fill(
//       `You are to generate a random hard mcq question about ${course_title} with context of the following transcript: ${transcript}`
//     ),
//     {
//       question: "question",
//       answer: "answer with max length of 15 words",
//       option1: "option1 with max length of 15 words",
//       option2: "option2 with max length of 15 words",
//       option3: "option3 with max length of 15 words",
//     }
//   );
//   console.log("asnckjbsdkjcbksjb");
//   console.log(questions);
//   return questions;
// `https://www.googleapis.com/youtube/v3/search?key=${process.env.YOUTUBE_API_KEY}&q=${searchQuery}&videoDuration=medium&videoEmbeddable=true&type=video&maxResults=5`

// }

import axios from "axios";
import { YoutubeTranscript } from "youtube-transcript";
import { strict_output } from "./gpt"; // Assuming we've renamed the file

export async function searchYoutube(searchQuery: string) {
  searchQuery = encodeURIComponent(searchQuery);
  const { data } = await axios.get(
    `https://www.googleapis.com/youtube/v3/search?key=${process.env.YOUTUBE_API_KEY}&q=${searchQuery}&videoDuration=medium&videoEmbeddable=true&type=video&maxResults=5`
  );

  if (!data || !data.items[0]) {
    console.log("YouTube search failed");
    return null;
  }
  return data.items[0].id.videoId;
}

// export async function getTranscript(videoId: string) {
//   try {
//     let transcript_arr = await YoutubeTranscript.fetchTranscript(videoId, {
//       lang: "en",
//       country: "EN",
//     });
//     let transcript = transcript_arr.map((t) => t.text).join(" ");
//     return transcript.replace(/\n/g, "");
//   } catch (error) {
//     console.error("Error fetching transcript:", error);
//     return "";
//   }
// }
export async function getTranscript(videoId: string) {
  try {
    let transcript_arr = await YoutubeTranscript.fetchTranscript(videoId, {
      lang: "en",
      country: "EN",
    });
    console.log("Transcript array:", transcript_arr);

    if (!transcript_arr || transcript_arr.length === 0) {
      console.error("Transcript array is empty or invalid.");
      return "";
    }

    let transcript = transcript_arr.map((t) => t.text).join(" ");
    return transcript.replace(/\n/g, "");
  } catch (error) {
    console.error("Error fetching transcript:", error);
    return "";
  }
}

export async function getQuestionsFromTranscript(
  transcript: string,
  course_title: string
) {
  type Question = {
    question: string;
    answer: string;
    option1: string;
    option2: string;
    option3: string;
  };

  const questions: Question[] = await strict_output(
    "You are a helpful AI that is able to generate mcq questions and answers, the length of each answer should not be more than 15 words",
    new Array(5).fill(
      `Generate a random hard mcq question about ${course_title} with context of the following transcript: ${transcript}`
    ),
    {
      question: "question",
      answer: "answer with max length of 15 words",
      option1: "option1 with max length of 15 words",
      option2: "option2 with max length of 15 words",
      option3: "option3 with max length of 15 words",
    }
  );

  return questions;
}
