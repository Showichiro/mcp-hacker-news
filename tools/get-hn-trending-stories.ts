import type { Module } from "../types.ts";
import { $number, $object, $optional, $string } from "@showichiro/validators";
import { fetcher } from "@showichiro/fetcher";

interface Comment {
  text: string;
  author: string;
}

interface Hit {
  title: string;
  url: string;
  author: string;
  points: number;
  num_comments: number;
  objectID: string;
  comments?: Comment[];
}

interface HackerNewsResponse {
  hits: Hit[];
}

interface ItemResponse {
  id: number;
  created_at: string;
  author: string;
  text: string;
  points: number;
  children: ItemResponse[];
}

async function fetchComments(storyId: string): Promise<Comment[]> {
  const url = `https://hn.algolia.com/api/v1/items/${storyId}`;
  try {
    const response = await fetcher(url);
    if (response.ok) {
      const data = response.data as ItemResponse;
      const traverse = (item: ItemResponse) => {
        if (item.text && item.author) {
          comments.push({ text: item.text, author: item.author });
        }
        if (item.children) {
          item.children.forEach(traverse);
        }
      };
      const comments: Comment[] = [];
      traverse(data);
      return comments.slice(0, 3);
    } else {
      console.error("Failed to fetch comments:", response.error);
      return [];
    }
  } catch (error) {
    console.error("Error fetching comments:", error);
    return [];
  }
}

export const GetHnTrendingStoriesModule: Module = {
  tool: {
    name: "getHnTrendingStories",
    description:
      "Fetches trending stories from the Hacker News API based on relevance, points, and number of comments.",
    inputSchema: {
      type: "object",
      properties: {
        query: {
          type: "string",
          description:
            "The search query (e.g., 'javascript', 'AI'). Optional. If not provided, returns the most popular stories.",
        },
        hitsPerPage: {
          type: "integer",
          description: "Number of results per page. Defaults to 10.",
          default: 10,
        },
        page: {
          type: "integer",
          description: "Page number to retrieve. Defaults to 0.",
          default: 0,
        },
      },
      required: [],
    },
  },
  handler: async (args: unknown) => {
    const $param = $object(
      {
        query: $optional($string),
        hitsPerPage: $optional($number),
        page: $optional($number),
      },
      false,
    );

    if ($param(args)) {
      const { query, hitsPerPage = 10, page = 0 } = args;

      const url = new URL("https://hn.algolia.com/api/v1/search");
      if (query) {
        url.searchParams.append("query", query);
      }
      url.searchParams.append("hitsPerPage", String(hitsPerPage));
      url.searchParams.append("page", String(page));

      try {
        const response = await fetcher<HackerNewsResponse>(url.toString());

        if (response.ok) {
          const data = response.data;

          const stories = await Promise.all(
            data.hits.map(async (hit) => {
              const comments = await fetchComments(hit.objectID);
              return {
                title: hit.title,
                url: hit.url,
                author: hit.author,
                points: hit.points,
                num_comments: hit.num_comments,
                objectID: hit.objectID,
                comments: comments,
              };
            }),
          );

          return {
            content: stories.map((story) => ({
              type: "text",
              text: JSON.stringify(story),
            })),
            isError: false,
          };
        } else {
          console.error("API request failed:", response.error, response);
          return {
            content: [{ type: "text", text: "API request failed." }],
            isError: true,
          };
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        return {
          content: [{ type: "text", text: "Error fetching data." }],
          isError: true,
        };
      }
    } else {
      return {
        content: [{ type: "text", text: "Invalid input parameters." }],
        isError: true,
      };
    }
  },
};
