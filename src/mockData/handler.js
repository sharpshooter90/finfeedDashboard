// mocks/handler.js
import { rest } from "msw";

export const handlers = [
  rest.get("https://api.example.com/news", (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({
        data: [
          "The bear market in U.S. stocks isn't over yet: Here are 4 reasons why investors should brace for more pain ahead.\t2023-04-08T15:33:00Z"
        ]
      })
    );
  })
];
