import { getAllPosts } from "@/lib/post";
import { notFound } from "next/navigation";

import MarkdownIt from "markdown-it";

// Define types for the post data
interface PostFrontmatter {
  title: string;
  date: string; // or Date if you prefer to handle it as a Date object
  [key: string]: any; // any other frontmatter data
}

interface Post {
  slug: string;
  content: string;
  title: string;
  date: string; // You can convert this to Date if needed
  [key: string]: any;
}

const md = new MarkdownIt();

// Function to fetch the post by slug
async function fetchPosts(slug: string): Promise<Post | undefined> {
  const posts = getAllPosts();
  return posts.find((post) => post.slug === slug);
}

interface PostPageProps {
  params: {
    slug: string;
  };
}

export default async function Post({ params }: PostPageProps) {
  const post = await fetchPosts(params.slug);

  if (!post) notFound();

  const htmlConverter = md.render(post.content);

  return (
    <article className="max-w-3xl mx-auto p-6 bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-lg rounded-lg">
      <h1 className="text-4xl font-extrabold mb-4 text-center">{post.title}</h1>
      <div className="mb-8 text-sm text-gray-500 dark:text-gray-400 text-center">
        <p className="post-meta">{new Date(post.date).toLocaleDateString()}</p>
      </div>
      <div
        className="post-content prose dark:prose-dark max-w-none"
        dangerouslySetInnerHTML={{ __html: htmlConverter }}
      />
    </article>
  );
}
