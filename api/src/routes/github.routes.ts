import { Router } from "express";
import { serviceOnly } from "../middleware/auth.js";

import {
  getRepos,
  getRepoCommits,
  getCommitDetail,
} from "../controllers/github.controller.js";

export const githubRoutes = Router();

githubRoutes.get("/repos", serviceOnly, getRepos);
githubRoutes.get("/repos/:owner/:repo/commits", serviceOnly, getRepoCommits);
githubRoutes.get(
  "/repos/:owner/:repo/commits/:sha",
  serviceOnly,
  getCommitDetail
);
