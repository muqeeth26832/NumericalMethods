import { getAllPosts } from "@/lib/post";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function Article() {
  const posts = getAllPosts();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black text-white py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-4xl font-extrabold text-center mb-12 bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-600">
          Numerical Blogs
        </h2>
        <div className="grid gap-8 md:grid-cols-2">
          {posts.map((post) => (
            <Link
              key={post.slug}
              href={`/posts/${post.slug}`}
              className="group block"
            >
              <div className="bg-gray-800 rounded-xl overflow-hidden shadow-lg transition-all duration-300 ease-in-out transform hover:scale-105 hover:shadow-2xl">
                <div className="p-6">
                  <h3 className="text-xl font-semibold text-gray-100 group-hover:text-purple-400 transition-colors duration-300 mb-2">
                    {post.slug}
                  </h3>
                  <p className="text-sm text-gray-400 mb-4">
                    {new Date(post.date).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </p>
                  <div className="flex items-center text-purple-400 group-hover:text-pink-500 transition-colors duration-300">
                    <span className="text-sm font-medium">Read more</span>
                    <ArrowRight className="ml-2 h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
