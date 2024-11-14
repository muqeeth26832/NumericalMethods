import fs from "fs";
import path from "path";
import matter from "gray-matter";

// Define the structure of the frontmatter data (meta data) in the markdown files
interface PostFrontmatter {
  title: string;
  date: string; // Date in string format (can be converted to Date)
  [key: string]: any; // Additional dynamic keys in frontmatter
}

// Define the structure of the post
interface Post {
  slug: string;
  content: string;
  title: string;
  date: Date; // Date type
  [key: string]: any; // Additional dynamic properties
}

const postDir = path.join(process.cwd(), "src/posts");

export const getAllPosts = (): Post[] => {
  try {
    // Ensure the posts directory exists
    if (!fs.existsSync(postDir)) {
      throw new Error(`Posts directory not found at ${postDir}`);
    }

    const fileNames = fs.readdirSync(postDir);

    // Process each post file
    const posts = fileNames.map((fileName) => {
      const slug = fileName.replace(/\.md$/, "");
      const filePath = path.join(postDir, fileName);

      // Check if it's a valid markdown file
      if (!fileName.endsWith(".md")) {
        return null; // Ignore non-markdown files
      }

      const fileContents = fs.readFileSync(filePath, "utf-8");

      const { content, data } = matter(fileContents);

      // Type assertion for the frontmatter (as we know it should match the PostFrontmatter interface)
      const frontmatter = data as PostFrontmatter;

      // Add post date sorting based on the frontmatter date
      const post: Post = {
        slug,
        content,
        title: frontmatter.title,
        date: frontmatter.date ? new Date(frontmatter.date) : new Date(), // Default to current date if no date exists
        ...frontmatter,
      };

      return post;
    }).filter((post): post is Post => post !== null); // TypeScript filter to narrow down the type

    // Sort posts by date (newest first)
    posts.sort((a, b) => b.date.getTime() - a.date.getTime());

    return posts;
  } catch (error) {
    console.error("Error reading posts:", (error as Error).message);
    return []; // Return an empty array in case of error
  }
};


