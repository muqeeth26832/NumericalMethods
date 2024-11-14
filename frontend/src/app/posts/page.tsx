import { getAllPosts } from "@/lib/post";
import Link from "next/link";

export default function Article() {
  const posts = getAllPosts();

  return (
    <div className="bg-black text-white min-h-screen py-12 px-4">
      <div className="max-w-3xl mx-auto">
        <h2 className="text-3xl font-extrabold text-center mb-6">
          Numerical Blogs
        </h2>
        <ul className="space-y-6">
          {posts.map((post) => (
            <li
              key={post.slug}
              className="bg-gray-800 p-6 rounded-lg shadow-lg hover:bg-gray-700 transition-all"
            >
              <Link href={`/posts/${post.slug}`} className="text-xl font-semibold text-blue-400 hover:text-blue-500 transition-all">
                 
                {post.slug}
              </Link>
              <p className="mt-2 text-sm text-gray-400">
                {new Date(post.date).toLocaleDateString()}
              </p>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}



