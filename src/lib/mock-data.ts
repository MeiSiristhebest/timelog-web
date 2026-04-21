import type { StoryListItem } from "@/features/stories/queries";
import type { AuditEventView } from "@/features/audit/queries";
import type { InteractionItem } from "@/features/interactions/presentation";

interface MockFamilyMember {
  id: string;
  email: string;
  role: string;
  family_id: string;
  status: string;
  display_name: string | null;
  avatar_url: string | null;
  created_at: string;
}

interface MockDevice {
  id: string;
  name: string;
  platform: string;
  created_at: string;
  last_activeAt: string;
  revoked_at: string | null;
  verification_code: string;
  os_version: string;
  app_version: string;
}

export const mockStories: StoryListItem[] = [
  {
    id: "story-001",
    title: "1980s Old Beijing Memories",
    speakerLabel: "Grandpa",
    startedAtLabel: "March 15, 2026",
    durationLabel: "23m 45s",
    syncStatus: "synced",
    transcriptPreview: "It was winter 1984 when we moved out of the hutong to a new apartment building...",
    commentCount: 3,
    reactionCount: 5,
    isFavorite: true,
  },
  {
    id: "story-002",
    title: "Military Service Years in Northeast",
    speakerLabel: "Grandpa",
    startedAtLabel: "March 10, 2026",
    durationLabel: "45m 20s",
    syncStatus: "synced",
    transcriptPreview: "In winter 1968, I answered the call to serve in the northeast army...",
    commentCount: 2,
    reactionCount: 8,
    isFavorite: false,
  },
  {
    id: "story-003",
    title: "How I Met Your Grandpa",
    speakerLabel: "Grandma",
    startedAtLabel: "March 5, 2026",
    durationLabel: "18m 30s",
    syncStatus: "synced",
    transcriptPreview: "I met your grandpa in 1975 at a factory dance party...",
    commentCount: 5,
    reactionCount: 12,
    isFavorite: true,
  },
  {
    id: "story-004",
    title: "Family Migration History",
    speakerLabel: "Grandpa",
    startedAtLabel: "February 28, 2026",
    durationLabel: "32m 15s",
    syncStatus: "synced",
    transcriptPreview: "Our Zhou family originally came from Shandong province as refugees...",
    commentCount: 1,
    reactionCount: 3,
    isFavorite: false,
  },
  {
    id: "story-005",
    title: "Childhood in Xisi Hutong",
    speakerLabel: "Dad",
    startedAtLabel: "February 20, 2026",
    durationLabel: "15m 50s",
    syncStatus: "synced",
    transcriptPreview: "I grew up in Xisi Hutong playing jump rope and marbles with other kids...",
    commentCount: 4,
    reactionCount: 7,
    isFavorite: true,
  },
  {
    id: "story-006",
    title: "First Day at Factory",
    speakerLabel: "Dad",
    startedAtLabel: "February 15, 2026",
    durationLabel: "28m 10s",
    syncStatus: "synced",
    transcriptPreview: "My first day working at the state-owned factory was in 1992...",
    commentCount: 2,
    reactionCount: 4,
    isFavorite: false,
  },
  {
    id: "story-007",
    title: "Traditional Chinese Cooking",
    speakerLabel: "Grandma",
    startedAtLabel: "February 10, 2026",
    durationLabel: "20m 35s",
    syncStatus: "synced",
    transcriptPreview: "Let me teach you how to make my famous braised pork...",
    commentCount: 3,
    reactionCount: 6,
    isFavorite: true,
  },
  {
    id: "story-008",
    title: "Wedding Day Memories",
    speakerLabel: "Grandpa",
    startedAtLabel: "February 5, 2026",
    durationLabel: "35m 00s",
    syncStatus: "synced",
    transcriptPreview: "Our wedding was a simple ceremony in the courtyard...",
    commentCount: 4,
    reactionCount: 9,
    isFavorite: true,
  },
  {
    id: "story-009",
    title: "School Years in Beijing",
    speakerLabel: "Mom",
    startedAtLabel: "January 28, 2026",
    durationLabel: "22m 45s",
    syncStatus: "synced",
    transcriptPreview: "I attended primary school near Dongzhimen in the 1970s...",
    commentCount: 2,
    reactionCount: 5,
    isFavorite: false,
  },
  {
    id: "story-010",
    title: "Ancient Temple Visit",
    speakerLabel: "Grandpa",
    startedAtLabel: "January 20, 2026",
    durationLabel: "12m 20s",
    syncStatus: "synced",
    transcriptPreview: "The whole family visited the old temple during Spring Festival 1995...",
    commentCount: 1,
    reactionCount: 2,
    isFavorite: true,
  },
];

export const mockFamilyMembers: MockFamilyMember[] = [
  {
    id: "member-001",
    email: "zhangsan@example.com",
    role: "owner",
    family_id: "family-001",
    status: "active",
    display_name: "Zhang Ming (Owner)",
    avatar_url: null,
    created_at: "2026-01-15T10:00:00Z",
  },
  {
    id: "member-002",
    email: "lisi@example.com",
    role: "listener",
    family_id: "family-001",
    status: "active",
    display_name: "Li Si (Daughter)",
    avatar_url: null,
    created_at: "2026-01-20T10:00:00Z",
  },
  {
    id: "member-003",
    email: "wangwu@example.com",
    role: "listener",
    family_id: "family-001",
    status: "active",
    display_name: "Wang Wu (Son)",
    avatar_url: null,
    created_at: "2026-02-01T10:00:00Z",
  },
  {
    id: "member-004",
    email: "zhaoliu@example.com",
    role: "contributor",
    family_id: "family-001",
    status: "pending",
    display_name: "Zhao Liu (Cousin)",
    avatar_url: null,
    created_at: "2026-03-10T10:00:00Z",
  },
  {
    id: "member-005",
    email: "sunqi@example.com",
    role: "listener",
    family_id: "family-001",
    status: "active",
    display_name: "Sun Qi (Niece)",
    avatar_url: null,
    created_at: "2026-03-15T10:00:00Z",
  },
  {
    id: "member-006",
    email: "zhouba@example.com",
    role: "listener",
    family_id: "family-001",
    status: "active",
    display_name: "Zhou Ba (Grandson)",
    avatar_url: null,
    created_at: "2026-03-20T10:00:00Z",
  },
  {
    id: "member-007",
    email: "wujiu@example.com",
    role: "contributor",
    family_id: "family-001",
    status: "pending",
    display_name: "Wu Jiu (Uncle)",
    avatar_url: null,
    created_at: "2026-04-01T10:00:00Z",
  },
  {
    id: "member-008",
    email: "zhengshi@example.com",
    role: "listener",
    family_id: "family-001",
    status: "inactive",
    display_name: "Zheng Shi (Ex-member)",
    avatar_url: null,
    created_at: "2025-12-01T10:00:00Z",
  },
];

export const mockDevices: MockDevice[] = [
  {
    id: "device-001",
    name: "iPhone 15 Pro",
    platform: "ios",
    created_at: "2026-01-10T10:00:00Z",
    last_activeAt: "2026-04-20T15:30:00Z",
    revoked_at: null,
    verification_code: "123456",
    os_version: "17.4",
    app_version: "1.0.0",
  },
  {
    id: "device-002",
    name: "Xiaomi 14 Ultra",
    platform: "android",
    created_at: "2026-01-15T10:00:00Z",
    last_activeAt: "2026-04-19T10:00:00Z",
    revoked_at: null,
    verification_code: "789012",
    os_version: "14",
    app_version: "1.0.0",
  },
  {
    id: "device-003",
    name: "iPad Pro 12.9",
    platform: "ios",
    created_at: "2026-02-01T10:00:00Z",
    last_activeAt: "2026-04-15T08:00:00Z",
    revoked_at: "2026-04-18T12:00:00Z",
    verification_code: "345678",
    os_version: "17.3",
    app_version: "0.9.5",
  },
  {
    id: "device-004",
    name: "Huawei Mate 60",
    platform: "android",
    created_at: "2026-02-10T10:00:00Z",
    last_activeAt: "2026-04-10T14:00:00Z",
    revoked_at: null,
    verification_code: "456789",
    os_version: "13",
    app_version: "1.0.0",
  },
  {
    id: "device-005",
    name: "Samsung S24 Ultra",
    platform: "android",
    created_at: "2026-02-20T10:00:00Z",
    last_activeAt: "2026-04-05T09:00:00Z",
    revoked_at: null,
    verification_code: "567890",
    os_version: "14",
    app_version: "1.0.0",
  },
  {
    id: "device-006",
    name: "iPhone 14",
    platform: "ios",
    created_at: "2025-11-01T10:00:00Z",
    last_activeAt: "2026-03-20T16:00:00Z",
    revoked_at: "2026-03-25T12:00:00Z",
    verification_code: "678901",
    os_version: "17.2",
    app_version: "0.8.0",
  },
  {
    id: "device-007",
    name: "Xiaomi Pad 6",
    platform: "android",
    created_at: "2026-03-01T10:00:00Z",
    last_activeAt: "2026-04-01T11:00:00Z",
    revoked_at: null,
    verification_code: "789012",
    os_version: "13",
    app_version: "1.0.0",
  },
  {
    id: "device-008",
    name: "OPPO Find X7",
    platform: "android",
    created_at: "2026-03-10T10:00:00Z",
    last_activeAt: "2026-03-28T10:00:00Z",
    revoked_at: null,
    verification_code: "890123",
    os_version: "14",
    app_version: "0.9.8",
  },
];

export const mockAuditEvents: AuditEventView[] = [
  {
    id: "audit-001",
    kind: "Story",
    actorLabel: "Li Si",
    summary: 'Commented on "1980s Old Beijing Memories"',
    detail: "Those hutong days were really special. I miss the neighbors!",
    timestampLabel: "April 20, 2026",
    status: "unread",
    storyId: "story-001",
  },
  {
    id: "audit-002",
    kind: "Reaction",
    actorLabel: "Wang Wu",
    summary: 'Reacted with Heart to "Military Service Years"',
    detail: "heart",
    timestampLabel: "April 19, 2026",
    status: "read",
    storyId: "story-002",
  },
  {
    id: "audit-003",
    kind: "Story",
    actorLabel: "Zhang Ming",
    summary: 'Uploaded new story "Family Migration History"',
    detail: "Audio synced successfully to cloud storage",
    timestampLabel: "April 18, 2026",
    status: "read",
    storyId: "story-004",
  },
  {
    id: "audit-004",
    kind: "Device",
    actorLabel: "System",
    summary: "New device iPhone 15 Pro verified",
    detail: "Device verification successful - IP address verified",
    timestampLabel: "April 15, 2026",
    status: "read",
    storyId: null,
  },
  {
    id: "audit-005",
    kind: "Reaction",
    actorLabel: "Zhao Liu",
    summary: 'Reacted with Heart to "Grandmas Youth Stories"',
    detail: "heart",
    timestampLabel: "April 14, 2026",
    status: "read",
    storyId: "story-003",
  },
  {
    id: "audit-006",
    kind: "Story",
    actorLabel: "Sun Qi",
    summary: 'Commented on "Traditional Chinese Cooking"',
    detail: "Can you share the sauce recipe please?",
    timestampLabel: "April 12, 2026",
    status: "unread",
    storyId: "story-007",
  },
  {
    id: "audit-007",
    kind: "Reaction",
    actorLabel: "Zhang Ming",
    summary: 'Reacted with Heart to "Wedding Day Memories"',
    detail: "heart",
    timestampLabel: "April 10, 2026",
    status: "read",
    storyId: "story-008",
  },
  {
    id: "audit-008",
    kind: "Family",
    actorLabel: "System",
    summary: "New member Sun Qi joined family",
    detail: "Invitation accepted - now active member",
    timestampLabel: "April 8, 2026",
    status: "read",
    storyId: null,
  },
  {
    id: "audit-009",
    kind: "Story",
    actorLabel: "Li Si",
    summary: 'Commented on "School Years in Beijing"',
    detail: "I went to a similar school in Chaoyang District!",
    timestampLabel: "April 5, 2026",
    status: "read",
    storyId: "story-009",
  },
  {
    id: "audit-010",
    kind: "Device",
    actorLabel: "System",
    summary: "Device iPad Pro 12.9 revoked",
    detail: "Device access revoked by administrator",
    timestampLabel: "April 3, 2026",
    status: "read",
    storyId: null,
  },
];

export const mockInteractions: InteractionItem[] = [
  {
    id: "inter-001",
    storyId: "story-001",
    storyTitle: "1980s Old Beijing Memories",
    actorLabel: "Actor Li Si",
    kind: "Comment",
    body: "Those hutong days were really special. I miss the neighbors!",
    timestampLabel: "April 20, 2026",
    sortValue: "2026-04-20T00:00:00.000Z",
  },
  {
    id: "inter-002",
    storyId: "story-001",
    storyTitle: "1980s Old Beijing Memories",
    actorLabel: "Actor Wang Wu",
    kind: "Reaction",
    body: "Heart",
    timestampLabel: "April 19, 2026",
    sortValue: "2026-04-19T00:00:00.000Z",
  },
  {
    id: "inter-003",
    storyId: "story-002",
    storyTitle: "Military Service Years",
    actorLabel: "Actor Zhang Ming",
    kind: "Comment",
    body: "Thank you for your service to the country!",
    timestampLabel: "April 18, 2026",
    sortValue: "2026-04-18T00:00:00.000Z",
  },
  {
    id: "inter-004",
    storyId: "story-003",
    storyTitle: "Grandma's Youth Stories",
    actorLabel: "Actor Zhao Liu",
    kind: "Reaction",
    body: "Heart",
    timestampLabel: "April 14, 2026",
    sortValue: "2026-04-14T00:00:00.000Z",
  },
  {
    id: "inter-005",
    storyId: "story-005",
    storyTitle: "Childhood in Xisi Hutong",
    actorLabel: "Actor Li Si",
    kind: "Comment",
    body: "Xisi Hutong! I played there too as a child!",
    timestampLabel: "April 10, 2026",
    sortValue: "2026-04-10T00:00:00.000Z",
  },
  {
    id: "inter-006",
    storyId: "story-007",
    storyTitle: "Traditional Chinese Cooking",
    actorLabel: "Actor Sun Qi",
    kind: "Comment",
    body: "Can you share the sauce recipe please?",
    timestampLabel: "April 12, 2026",
    sortValue: "2026-04-12T00:00:00.000Z",
  },
  {
    id: "inter-007",
    storyId: "story-008",
    storyTitle: "Wedding Day Memories",
    actorLabel: "Actor Zhang Ming",
    kind: "Reaction",
    body: "Heart",
    timestampLabel: "April 10, 2026",
    sortValue: "2026-04-10T00:00:00.000Z",
  },
  {
    id: "inter-008",
    storyId: "story-009",
    storyTitle: "School Years in Beijing",
    actorLabel: "Actor Li Si",
    kind: "Comment",
    body: "I went to a similar school in Chaoyang District!",
    timestampLabel: "April 5, 2026",
    sortValue: "2026-04-05T00:00:00.000Z",
  },
  {
    id: "inter-009",
    storyId: "story-004",
    storyTitle: "Family Migration History",
    actorLabel: "Actor Wang Wu",
    kind: "Reaction",
    body: "Heart",
    timestampLabel: "April 3, 2026",
    sortValue: "2026-04-03T00:00:00.000Z",
  },
  {
    id: "inter-010",
    storyId: "story-002",
    storyTitle: "Military Service Years",
    actorLabel: "Actor Zhou Ba",
    kind: "Comment",
    body: "Grandpa is a real hero!",
    timestampLabel: "April 1, 2026",
    sortValue: "2026-04-01T00:00:00.000Z",
  },
];

export interface MockStoryDetail {
  id: string;
  title: string;
  speakerLabel: string;
  startedAtLabel: string;
  durationLabel: string;
  syncStatus: string;
  transcriptPreview: string;
  transcript: string;
  commentCount: number;
  reactionCount: number;
  comments: Array<{
    id: string;
    content: string;
    createdAtLabel: string;
    actorLabel: string;
  }>;
  reactions: Array<{
    type: string;
    label: string;
    count: number;
  }>;
  viewerHasHearted: boolean;
  playback: {
    isReady: boolean;
    signedUrl: string | null;
    expiresAtEpochMs: number | null;
  };
  isFavorite: boolean;
}

export const mockStoryDetails: Record<string, MockStoryDetail> = {
  "story-001": {
    id: "story-001",
    title: "1980s Old Beijing Memories",
    speakerLabel: "Grandpa",
    startedAtLabel: "March 15, 2026",
    durationLabel: "23m 45s",
    syncStatus: "synced",
    transcriptPreview: "It was winter 1984 when we moved out of the hutong to a new apartment building...",
    transcript: `It was winter 1984 when we moved out of the hutong to a new apartment building. The old courtyard had been our home for three generations.

I remember the day we packed our things. My grandmother was reluctant to leave - she had lived there since she was a young bride. But the city was modernizing, and the old hutongs were being replaced with tall buildings.

The new apartment was on the 6th floor. When we first moved in, I was afraid to look down from the window. The ground seemed so far away! But gradually, we all got used to it.

The neighbors were different too. In the hutong, everyone knew everyone. Here, we had to knock on doors to introduce ourselves. Some things were lost, but new conveniences were gained.

I still visit the site sometimes. The hutong is gone now, replaced by a shopping mall. But the memories remain.`,
    commentCount: 3,
    reactionCount: 5,
    comments: [
      {
        id: "comment-001",
        content: "Those hutong days were really special. I miss the neighbors!",
        createdAtLabel: "April 20, 2026",
        actorLabel: "Li Si"
      },
      {
        id: "comment-002",
        content: "Can you tell us more about the old courtyard?",
        createdAtLabel: "April 18, 2026",
        actorLabel: "Wang Wu"
      },
      {
        id: "comment-003",
        content: "My grandmother lived in a similar hutong!",
        createdAtLabel: "April 15, 2026",
        actorLabel: "Sun Qi"
      }
    ],
    reactions: [
      { type: "heart", label: "Heart", count: 3 },
      { type: "laugh", label: "Laugh", count: 1 },
      { type: "think", label: "Think", count: 1 }
    ],
    viewerHasHearted: false,
    playback: {
      isReady: true,
      signedUrl: null,
      expiresAtEpochMs: null
    },
    isFavorite: true
  },
  "story-002": {
    id: "story-002",
    title: "Military Service Years in Northeast",
    speakerLabel: "Grandpa",
    startedAtLabel: "March 10, 2026",
    durationLabel: "45m 20s",
    syncStatus: "synced",
    transcriptPreview: "In winter 1968, I answered the call to serve in the northeast army...",
    transcript: `In winter 1968, I answered the call to serve in the northeast army. I was just 18 years old.

The train took three days to reach our garrison. The cold was unbelievable - minus 30 degrees! We had to wear everything we owned to stay warm.

Basic training was harsh. We woke up at 5 AM, ran 10 kilometers, then returned for breakfast. By noon, the sun would melt the ice on our eyelashes.

I made lifelong friends there. We shared everything - food, letters from home, and the burden of service. One friend from Zhejiang became my best man at my wedding.

The discipline taught me self-reliance. Whatever challenges life brings, I can handle them. That army service made me who I am.`,
    commentCount: 2,
    reactionCount: 8,
    comments: [
      {
        id: "comment-004",
        content: "Thank you for your service to the country!",
        createdAtLabel: "April 18, 2026",
        actorLabel: "Zhang Ming"
      },
      {
        id: "comment-005",
        content: "The friendship sounds amazing!",
        createdAtLabel: "April 16, 2026",
        actorLabel: "Zhou Ba"
      }
    ],
    reactions: [
      { type: "heart", label: "Heart", count: 5 },
      { type: "clap", label: "Clap", count: 2 },
      { type: "salute", label: "Salute", count: 1 }
    ],
    viewerHasHearted: true,
    playback: {
      isReady: true,
      signedUrl: null,
      expiresAtEpochMs: null
    },
    isFavorite: false
  },
  "story-003": {
    id: "story-003",
    title: "How I Met Your Grandpa",
    speakerLabel: "Grandma",
    startedAtLabel: "March 5, 2026",
    durationLabel: "18m 30s",
    syncStatus: "synced",
    transcriptPreview: "I met your grandpa in 1975 at a factory dance party...",
    transcript: `I met your grandpa in 1975 at a factory dance party. He was so shy that evening - wouldn't even ask me to dance!

Your grandfather was working in the machinery department. I was in quality control. We would see each other in the cafeteria but never spoke.

Then came the annual Spring Festival celebration. The factory organized a big party with music and dancing. His friend finally pushed him toward me.

He said, "Would you like to dance?" I could see his hands were shaking. I laughed and said yes.

We danced three songs that night. His dancing was terrible, but his sincerity was charming. From that night on, we were inseparable.

We got married the following year. The wedding was simple - just close family and coworkers. But I was the happiest bride in the world.`,
    commentCount: 5,
    reactionCount: 12,
    comments: [
      {
        id: "comment-006",
        content: "What a romantic story!",
        createdAtLabel: "April 14, 2026",
        actorLabel: "Li Si"
      },
      {
        id: "comment-007",
        content: "Grandpa dancing sounds hilarious!",
        createdAtLabel: "April 13, 2026",
        actorLabel: "Wang Wu"
      },
      {
        id: "comment-008",
        content: "They've been together for almost 50 years!",
        createdAtLabel: "April 12, 2026",
        actorLabel: "Zhao Liu"
      }
    ],
    reactions: [
      { type: "heart", label: "Heart", count: 8 },
      { type: "laugh", label: "Laugh", count: 3 },
      { type: "celebrate", label: "Celebrate", count: 1 }
    ],
    viewerHasHearted: true,
    playback: {
      isReady: true,
      signedUrl: null,
      expiresAtEpochMs: null
    },
    isFavorite: true
  },
  "story-004": {
    id: "story-004",
    title: "Family Migration History",
    speakerLabel: "Grandpa",
    startedAtLabel: "February 28, 2026",
    durationLabel: "32m 15s",
    syncStatus: "synced",
    transcriptPreview: "Our Zhou family originally came from Shandong province as refugees...",
    transcript: `Our Zhou family originally came from Shandong province as refugees during the famine years of the 1940s.

My grandfather was just a boy when they left their ancestral village. The Japanese invasion had destroyed everything. With nothing but the clothes on their backs, they walked south.

The journey took three months. Many from our village didn't survive. But my grandfather's family pressed on, hoping to find work and a new life.

They finally settled in Beijing when the city was being rebuilt after the war. My grandfather started as a street vendor, selling small goods from a wooden cart.

Through hard work and perseverance, he eventually opened a small shop. Then another. He married, had children, and built a home.

That's why I always say: no matter how far you travel, home is where your roots are. Our roots are here in Beijing, but our story spans provinces.`,
    commentCount: 1,
    reactionCount: 3,
    comments: [
      {
        id: "comment-009",
        content: "What an incredible journey!",
        createdAtLabel: "April 10, 2026",
        actorLabel: "Zhang Ming"
      }
    ],
    reactions: [
      { type: "heart", label: "Heart", count: 2 },
      { type: "think", label: "Think", count: 1 }
    ],
    viewerHasHearted: false,
    playback: {
      isReady: true,
      signedUrl: null,
      expiresAtEpochMs: null
    },
    isFavorite: false
  },
  "story-005": {
    id: "story-005",
    title: "Childhood in Xisi Hutong",
    speakerLabel: "Dad",
    startedAtLabel: "February 20, 2026",
    durationLabel: "15m 50s",
    syncStatus: "synced",
    transcriptPreview: "I grew up in Xisi Hutong playing jump rope and marbles with other kids...",
    transcript: `I grew up in Xisi Hutong playing jump rope and marbles with other kids from the neighborhood.

Every afternoon after school, we would gather in the courtyard. There must have been 20 of us kids, ranging from 6 to 14 years old.

We played all kinds of games: Chinese jump rope made from rubber bands, marbles, shuttlecock kicking, and hide and seek.

The summers were the best. We would run through the hutongs with water guns, spray each other from the public tap, and drink iced barley water sold by the old man on the corner.

My grandmother would call me home for dinner with her distinctive whistle. The whole hutong could hear her!

I miss those simple days. No smartphones, no screens - just friends, laughter, and the sound of ping pong balls echoing through the alleys.`,
    commentCount: 4,
    reactionCount: 7,
    comments: [
      {
        id: "comment-010",
        content: "Xisi Hutong! I played there too as a child!",
        createdAtLabel: "April 10, 2026",
        actorLabel: "Li Si"
      },
      {
        id: "comment-011",
        content: "The simple joys of childhood!",
        createdAtLabel: "April 8, 2026",
        actorLabel: "Sun Qi"
      }
    ],
    reactions: [
      { type: "heart", label: "Heart", count: 4 },
      { type: "laugh", label: "Laugh", count: 2 },
      { type: "miss", label: "Miss", count: 1 }
    ],
    viewerHasHearted: false,
    playback: {
      isReady: true,
      signedUrl: null,
      expiresAtEpochMs: null
    },
    isFavorite: true
  },
  "story-006": {
    id: "story-006",
    title: "First Day at Factory",
    speakerLabel: "Dad",
    startedAtLabel: "February 15, 2026",
    durationLabel: "28m 10s",
    syncStatus: "synced",
    transcriptPreview: "My first day working at the state-owned factory was in 1992...",
    transcript: `My first day working at the state-owned factory was in 1992. I was 22 years old and nervous beyond words.

The factory employed over 3,000 workers. The main assembly line stretched for half a kilometer. Everything was massive and intimidating.

My mentor was a veteran worker named Uncle Wang. He had been at the factory since it opened in 1965. He taught me everything I know.

"Follow the procedures exactly," he said. "There's no room for shortcuts in industrial work. One mistake can endanger everyone."

I started as a line worker, checking component quality. Every day was the same routine. But there was pride in that routine.

The factory was like a small city. We had our own dormitories, cafeteria, clinic, and even a cinema. Many workers spent their entire careers there.

When the factory restructured in 2005, I was one of the lucky ones who kept their job. But many friends weren't so fortunate. Change is inevitable, but it doesn't make it easier.`,
    commentCount: 2,
    reactionCount: 4,
    comments: [
      {
        id: "comment-012",
        content: "Factory life sounds like a different world!",
        createdAtLabel: "April 5, 2026",
        actorLabel: "Wang Wu"
      },
      {
        id: "comment-013",
        content: "Uncle Wang sounds like a great mentor.",
        createdAtLabel: "April 4, 2026",
        actorLabel: "Zhou Ba"
      }
    ],
    reactions: [
      { type: "heart", label: "Heart", count: 2 },
      { type: "clap", label: "Clap", count: 1 },
      { type: "think", label: "Think", count: 1 }
    ],
    viewerHasHearted: false,
    playback: {
      isReady: true,
      signedUrl: null,
      expiresAtEpochMs: null
    },
    isFavorite: false
  },
  "story-007": {
    id: "story-007",
    title: "Traditional Chinese Cooking",
    speakerLabel: "Grandma",
    startedAtLabel: "February 10, 2026",
    durationLabel: "20m 35s",
    syncStatus: "synced",
    transcriptPreview: "Let me teach you how to make my famous braised pork...",
    transcript: `Let me teach you how to make my famous braised pork, hong shao rou. This recipe has been passed down from my mother.

First, you need good pork belly. Cut it into 3-centimeter cubes. Don't use lean meat - the fat is essential for the flavor.

Blanch the pork in boiling water for 5 minutes. This removes impurities and ensures the meat stays tender. Then drain and set aside.

Now for the sauce. In a wok, heat oil and add rock sugar. Stir until it melts and turns golden. Be patient - rushing this step will make the sauce bitter.

Add the pork and stir-fry until coated with the caramelized sugar. Then add soy sauce, Shaoxing wine, ginger, and star anise.

Pour in enough water to cover the meat. Bring to a boil, then simmer on low heat for 90 minutes. The longer you cook, the more tender the meat becomes.

Finally, reduce the sauce until it's thick and glossy. The pork should be reddish-brown and melt in your mouth.

Remember: good cooking takes time and love. Never rush a recipe passed down through generations.`,
    commentCount: 3,
    reactionCount: 6,
    comments: [
      {
        id: "comment-014",
        content: "Can you share the sauce recipe please?",
        createdAtLabel: "April 12, 2026",
        actorLabel: "Sun Qi"
      },
      {
        id: "comment-015",
        content: "My mouth is watering!",
        createdAtLabel: "April 11, 2026",
        actorLabel: "Li Si"
      }
    ],
    reactions: [
      { type: "heart", label: "Heart", count: 4 },
      { type: "laugh", label: "Laugh", count: 2 }
    ],
    viewerHasHearted: true,
    playback: {
      isReady: true,
      signedUrl: null,
      expiresAtEpochMs: null
    },
    isFavorite: true
  },
  "story-008": {
    id: "story-008",
    title: "Wedding Day Memories",
    speakerLabel: "Grandpa",
    startedAtLabel: "February 5, 2026",
    durationLabel: "35m 00s",
    syncStatus: "synced",
    transcriptPreview: "Our wedding was a simple ceremony in the courtyard...",
    transcript: `Our wedding was a simple ceremony in the courtyard of my parents' home. It was January 1976, and the air was crisp and cold.

I woke up before dawn, nervous and excited. My best man helped me dress in my new suit - the first new clothes I'd owned in years.

The ceremony was traditional. We bowed to heaven and earth, to our parents, and to each other. Your grandmother wore a red dress that her mother had sewn by hand.

About 50 guests attended - family and close friends. The food was simple but abundant: dumplings, noodles, and plenty of rice wine.

Your grandmother's father gave a speech. He said, "I'm entrusting my daughter to you. Treat her well, and she'll be your treasure. Hurt her, and she'll be your regret."

I promised him I would. Fifty years later, I can say I've kept that promise every single day.

The celebration lasted until midnight. We danced, sang, and shared stories. By the end, everyone was family.

That was the best day of my life - not because of the ceremony, but because I gained a partner for life.`,
    commentCount: 4,
    reactionCount: 9,
    comments: [
      {
        id: "comment-016",
        content: "This is so beautiful!",
        createdAtLabel: "April 10, 2026",
        actorLabel: "Zhang Ming"
      },
      {
        id: "comment-017",
        content: "A love story for the ages!",
        createdAtLabel: "April 9, 2026",
        actorLabel: "Zhao Liu"
      },
      {
        id: "comment-018",
        content: "50 years of marriage - goals!",
        createdAtLabel: "April 8, 2026",
        actorLabel: "Sun Qi"
      }
    ],
    reactions: [
      { type: "heart", label: "Heart", count: 7 },
      { type: "celebrate", label: "Celebrate", count: 2 }
    ],
    viewerHasHearted: true,
    playback: {
      isReady: true,
      signedUrl: null,
      expiresAtEpochMs: null
    },
    isFavorite: true
  },
  "story-009": {
    id: "story-009",
    title: "School Years in Beijing",
    speakerLabel: "Mom",
    startedAtLabel: "January 28, 2026",
    durationLabel: "22m 45s",
    syncStatus: "synced",
    transcriptPreview: "I attended primary school near Dongzhimen in the 1970s...",
    transcript: `I attended primary school near Dongzhimen in the 1970s. The school was an old courtyard building that had been converted into a school.

Every morning, I would walk 20 minutes to school with my neighbors. We wore blue cotton uniforms and carried our books in a canvas bag.

The classroom had wooden desks with ink stains from years of use. We wrote with fountain pens - ballpoints were a luxury we couldn't afford.

Our teacher, Ms. Li, was strict but fair. She made us recite poems and practice calligraphy every morning. I still remember the smell of ink on rice paper.

After class, we would play in the schoolyard. Girls jumped rope while boys played basketball. The older students would help the younger ones with homework.

The Cultural Revolution had just ended, so school was serious but hopeful. We knew education was our ticket to a better future.

I graduated top of my class in 1982. That achievement opened doors that would have been closed otherwise.

Education changed my life. Even now, at my age, I still read every night. Learning never stops.`,
    commentCount: 2,
    reactionCount: 5,
    comments: [
      {
        id: "comment-019",
        content: "I went to a similar school in Chaoyang District!",
        createdAtLabel: "April 5, 2026",
        actorLabel: "Li Si"
      },
      {
        id: "comment-020",
        content: "Ms. Li sounds like an amazing teacher!",
        createdAtLabel: "April 3, 2026",
        actorLabel: "Wang Wu"
      }
    ],
    reactions: [
      { type: "heart", label: "Heart", count: 3 },
      { type: "clap", label: "Clap", count: 1 },
      { type: "think", label: "Think", count: 1 }
    ],
    viewerHasHearted: false,
    playback: {
      isReady: true,
      signedUrl: null,
      expiresAtEpochMs: null
    },
    isFavorite: false
  },
  "story-010": {
    id: "story-010",
    title: "Ancient Temple Visit",
    speakerLabel: "Grandpa",
    startedAtLabel: "January 20, 2026",
    durationLabel: "12m 20s",
    syncStatus: "synced",
    transcriptPreview: "The whole family visited the old temple during Spring Festival 1995...",
    transcript: `The whole family visited the old temple during Spring Festival 1995. It was our annual tradition, a pilgrimage to seek blessings for the new year.

The temple was over 500 years old. Its bronze bells dated from the Ming Dynasty. When the monks rang them at midnight, the sound traveled for miles.

We arrived at dawn to avoid the crowds. The temple grounds were covered in morning frost. Incense smoke curled into the cold air.

First, we lit incense sticks and knelt before the Buddha statues. I prayed for health, prosperity, and happiness for our family.

Then we fed the temple cats - there were always a dozen or so lounging in the sun. Your grandmother believed that feeding animals brought good karma.

We ended at the fortune-telling booth. I shook the bamboo sticks until one fell out. The monk read my fortune: "A year of growth and unexpected joy awaits."

Looking back, he was right. That was the year we moved to our new apartment and welcomed your father into our family.

Traditions connect us to our ancestors. Every incense stick I light reminds me of those who came before.`,
    commentCount: 1,
    reactionCount: 2,
    comments: [
      {
        id: "comment-021",
        content: "What a meaningful tradition!",
        createdAtLabel: "April 1, 2026",
        actorLabel: "Zhang Ming"
      }
    ],
    reactions: [
      { type: "heart", label: "Heart", count: 1 },
      { type: "think", label: "Think", count: 1 }
    ],
    viewerHasHearted: false,
    playback: {
      isReady: true,
      signedUrl: null,
      expiresAtEpochMs: null
    },
    isFavorite: true
  }
};

export function getMockStoryById(id: string): MockStoryDetail | undefined {
  return mockStoryDetails[id];
}

export function getAllMockStoryIds(): string[] {
  return mockStories.map(s => s.id);
}