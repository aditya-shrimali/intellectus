import { Button } from "@/components/ui/button";
import Link from "next/link";
import Head from "next/head";

export default function Home() {
  return (
    <div className="min-h-[90vh] flex flex-col items-center justify-center">
      <Head>
        <title>INTELLECTUS</title>
        <meta
          name="description"
          content="INTELLECTUS - Your AI-powered education assistant"
        />
      </Head>

      <main className="flex flex-col items-center justify-center flex-1 w-full px-4 text-center">
        <h1 className="text-5xl font-bold text-black mb-8 dark:text-white">
          Welcome to{" "}
          <span className="text-indigo-600">
            <Link href="/create" className="text-centertext-purple-800">
              INTELLECTUS
            </Link>
          </span>
        </h1>

        <p className="text-xl text-gray-400 mb-12">
          Your AI-powered education assistant
        </p>

        <div className="flex space-x-4">
          <a
            href="/create"
            className="px-6 py-3 bg-indigo-600 text-white font-semibold rounded-lg shadow-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
          >
            Create Course
          </a>
          <a
            href="/gallery"
            className="px-6 py-3 bg-gray-600 text-white font-semibold rounded-lg shadow-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
          >
            View Gallery
          </a>
        </div>
      </main>
      <footer className="w-full h-6 flex items-center justify-center border-t">
        <p className="text-gray-600">
          &copy; {new Date().getFullYear()} INTELLECTUS. All rights reserved.
        </p>
      </footer>
    </div>
  );
}
