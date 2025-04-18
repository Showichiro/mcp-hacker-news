## Hacker News Trending Stories Tool Design

**1. Tool Name:** `getHnTrendingStories`

**2. Description:** Fetches trending stories from the Hacker News API based on
relevance, points, and number of comments.

**3. Input Schema:**

```json
{
  "type": "object",
  "properties": {
    "query": {
      "type": "string",
      "description": "The search query (e.g., 'javascript', 'AI'). Optional. If not provided, returns the most popular stories."
    },
    "hitsPerPage": {
      "type": "integer",
      "description": "Number of results per page. Defaults to 10.",
      "default": 10
    },
    "page": {
      "type": "integer",
      "description": "Page number to retrieve. Defaults to 0.",
      "default": 0
    }
  },
  "required": []
}
```

**4. Output:**

The tool will return a JSON object containing an array of trending stories. Each
story object will include the following fields:

- `title`: The title of the story.
- `url`: The URL of the story.
- `author`: The author of the story.
- `points`: The number of points the story has.
- `num_comments`: The number of comments the story has.
- `comments`: An array of comment objects, each containing the comment text and
  author.
- `objectID`: The unique ID of the story.

**5. Implementation Details:**

- The tool will use the `https://hn.algolia.com/api/v1/search` endpoint to fetch
  trending stories.
- The tool will use the `query` parameter to filter stories based on a search
  query.
- The tool will use the `hitsPerPage` parameter to specify the number of results
  per page.
- The tool will use the `page` parameter to specify the page number to retrieve.
- For each story, the tool will fetch the comment content from the Hacker News
  API using the story's `objectID`. The comment content will include the comment
  text and author. The API endpoint for retrieving comments is
  `https://hn.algolia.com/api/v1/search?tags=comment&story_id=記事ID&hitsPerPage=20`,
  where `記事ID` is the `objectID` of the story.
- The tool will handle potential errors, such as network errors or invalid API
  responses.

**6. Error Handling:**

- If the API request fails, the tool will return an error message.
- If the API response is invalid, the tool will return an error message.

**7. Example Usage:**

```json
{
  "query": "javascript",
  "hitsPerPage": 20,
  "page": 0
}
```

**8. API Endpoint:**

`https://hn.algolia.com/api/v1/search`

**9. Notes:**

- The tool will sort the stories by relevance, then points, then number of
  comments, as specified in the API documentation.
- The tool will adhere to the API rate limits.
