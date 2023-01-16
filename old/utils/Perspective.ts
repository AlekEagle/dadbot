import fetch from 'node-fetch';

const API_URL = `https://commentanalyzer.googleapis.com/v1alpha1/comments:analyze?key=${process.env.perspectiveKey}`;

export interface AttributeOptions {
  scoreType?: 'PROBABILITY';
  scoreThreshold?: number;
}

export interface AnalyzeCommentBody {
  comment: {
    text: string;
    type?: 'PLAIN_TEXT' | 'HTML';
  };
  context?: {
    entries: {
      text: string;
      type?: 'PLAIN_TEXT' | 'HTML';
    }[];
  };
  requestedAttributes: {
    [key in Attributes]?: AttributeOptions;
  };
  languages?: string[];
  doNotStore?: boolean;
  clientToken?: string;
  sessionId?: string;
  communityId?: string;
}

export interface AnalyzeCommentResponse {
  attributeScores: {
    [key in Attributes]: {
      summaryScore: {
        value: number;
        type: 'PROBABILITY';
      };
      spanScores: {
        begin: number;
        end: number;
        value: number;
        type: 'PROBABILITY';
      }[];
    };
  };
  languages: string[];
  clientToken: string[];
}

export enum Attributes {
  TOXICITY = 'TOXICITY',
  SEVERE_TOXICITY = 'SEVERE_TOXICITY',
  IDENTITY_ATTACK = 'IDENTITY_ATTACK',
  INSULT = 'INSULT',
  PROFANITY = 'PROFANITY',
  THREAT = 'THREAT',
  SEXUALLY_EXPLICIT = 'SEXUALLY_EXPLICIT',
  FLIRTATION = 'FLIRTATION',
  SPAM = 'SPAM',
  UNSUBSTANTIAL = 'UNSUBSTANTIAL'
}

export type Attribute = { name: Attributes; options?: AttributeOptions };

export async function analyzeComment(
  text: string,
  attrs: Attribute[]
): Promise<AnalyzeCommentResponse> {
  if (attrs.length < 1)
    throw new Error('Must include at least one attribute to score.');

  const body: AnalyzeCommentBody = {
    comment: { text },
    requestedAttributes: {},
    languages: ['en']
  };

  attrs.forEach(a => {
    body.requestedAttributes[a.name] = a.options || {};
  });

  let res = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(body)
  });

  if (res.ok) {
    let data = (await res.json()) as AnalyzeCommentResponse;
    return data;
  } else {
    throw new Error(`Error ${res.status}: ${res.statusText}`);
  }
}

export default {
  analyzeComment
};
