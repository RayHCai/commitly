import { Router } from "express";
import { serviceOnly } from "../middleware/auth";

import {
  getRepos,
  getRepoCommits,
  getCommitDetail,
} from "../controllers/github.controller";

export const githubRoutes = Router();

githubRoutes.get("/repos", serviceOnly, getRepos);
githubRoutes.get("/repos/:owner/:repo/commits", serviceOnly, getRepoCommits);
githubRoutes.get(
  "/repos/:owner/:repo/commits/:sha",
  serviceOnly,
  getCommitDetail
);
