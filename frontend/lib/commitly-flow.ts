export const COMMITLY_FLOW_KEY = "commitly_flow" as const;

export const COMMITLY_GENERATED_SLUG_KEY = "commitly_generated_slug" as const;

/** Core fields persisted for the connect flow */
export type CommitlyFlowData = {
  jobUrl: string;
  jobDescription: string;
  githubConnected: boolean;
};

/** Includes wizard step so refresh restores the correct screen */
export type CommitlyFlowState = CommitlyFlowData & {
  step: 1 | 2;
};

export const defaultCommitlyFlowState = (): CommitlyFlowState => ({
  jobUrl: "",
  jobDescription: "",
  githubConnected: false,
  step: 1,
});

export function parseCommitlyFlow(raw: string | null): CommitlyFlowState | null {
  if (!raw) return null;
  try {
    const data = JSON.parse(raw) as Partial<CommitlyFlowState>;
    const jobUrl = typeof data.jobUrl === "string" ? data.jobUrl : "";
    const jobDescription =
      typeof data.jobDescription === "string" ? data.jobDescription : "";
    const githubConnected = Boolean(data.githubConnected);
    let step: 1 | 2 = data.step === 2 ? 2 : 1;
    if (
      step === 2 &&
      !jobUrl.trim() &&
      !jobDescription.trim()
    ) {
      step = 1;
    }
    return {
      jobUrl,
      jobDescription,
      githubConnected,
      step,
    };
  } catch {
    return null;
  }
}

export function serializeCommitlyFlow(state: CommitlyFlowState): string {
  const payload: CommitlyFlowData & { step: 1 | 2 } = {
    jobUrl: state.jobUrl,
    jobDescription: state.jobDescription,
    githubConnected: state.githubConnected,
    step: state.step,
  };
  return JSON.stringify(payload);
}
