import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User, UserRole } from '../users/user.entity';
import { Feedback, FeedbackCategory, FeedbackStatus } from '../feedback/feedback.entity';
import { Vote } from '../votes/vote.entity';
import { Comment } from '../comments/comment.entity';

@Injectable()
export class SeedService {
  constructor(
    @InjectRepository(User) private users: Repository<User>,
    @InjectRepository(Feedback) private feedback: Repository<Feedback>,
    @InjectRepository(Vote) private votes: Repository<Vote>,
    @InjectRepository(Comment) private comments: Repository<Comment>,
    private dataSource: DataSource,
  ) {}

  async seed() {
    const existing = await this.users.count();
    if (existing > 0) {
      console.log('Database already seeded, skipping.');
      return;
    }

    console.log('Seeding database...');

    const hash = await bcrypt.hash('Admin123!', 10);
    const userHash = await bcrypt.hash('User123!', 10);

    const adminNames = [
      { name: 'Alex Morgan', email: 'admin@feedbackhub.dev' },
      { name: 'Jordan Lee', email: 'jordan@feedbackhub.dev' },
      { name: 'Sam Rivera', email: 'sam@feedbackhub.dev' },
    ];

    const userNames = [
      { name: 'Emily Chen', email: 'emily@example.com' },
      { name: 'Marcus Johnson', email: 'marcus@example.com' },
      { name: 'Priya Patel', email: 'priya@example.com' },
      { name: 'Lucas Oliveira', email: 'lucas@example.com' },
      { name: 'Sofia Andersen', email: 'sofia@example.com' },
      { name: 'Amir Hassan', email: 'amir@example.com' },
      { name: 'Yuki Tanaka', email: 'yuki@example.com' },
      { name: 'user@feedbackhub.dev'.split('@')[0], email: 'user@feedbackhub.dev' },
      { name: 'Chloe Martin', email: 'chloe@example.com' },
      { name: 'Ravi Sharma', email: 'ravi@example.com' },
      { name: 'Nina Kowalski', email: 'nina@example.com' },
      { name: 'Owen Brooks', email: 'owen@example.com' },
      { name: 'Fatima Al-Rashid', email: 'fatima@example.com' },
      { name: 'Daniel Kim', email: 'daniel@example.com' },
      { name: 'Isabel Ferreira', email: 'isabel@example.com' },
    ];

    const savedAdmins = await this.users.save(
      adminNames.map(u => this.users.create({
        ...u,
        password_hash: hash,
        role: UserRole.ADMIN,
        avatar_url: `https://ui-avatars.com/api/?name=${encodeURIComponent(u.name)}&background=7c3aed&color=fff&size=128`,
      }))
    );

    const savedUsers = await this.users.save(
      userNames.map(u => this.users.create({
        ...u,
        password_hash: userHash,
        role: UserRole.USER,
        avatar_url: `https://ui-avatars.com/api/?name=${encodeURIComponent(u.name)}&background=4f46e5&color=fff&size=128`,
      }))
    );

    const allUsers = [...savedAdmins, ...savedUsers];

    const feedbackData = [
      { title: 'Dark mode support', description: 'Please add a dark mode option. Many users (including myself) prefer using apps in low-light environments. This would greatly improve the user experience during night-time usage.', category: FeedbackCategory.UX, status: FeedbackStatus.PLANNED, rating: 5, daysAgo: 85 },
      { title: 'Two-factor authentication', description: 'Add 2FA support for improved account security. Supporting TOTP apps like Google Authenticator or Authy would be a great addition.', category: FeedbackCategory.FEATURE, status: FeedbackStatus.IN_REVIEW, rating: 5, daysAgo: 78 },
      { title: 'Login button unresponsive on mobile', description: 'The login button sometimes does not respond on iOS Safari. Happens intermittently — tapping multiple times usually works but it is frustrating.', category: FeedbackCategory.BUG, status: FeedbackStatus.RESOLVED, rating: 4, daysAgo: 72 },
      { title: 'Bulk export to CSV', description: 'Allow exporting all feedback data to CSV for offline analysis and reporting. This is critical for our quarterly reviews.', category: FeedbackCategory.FEATURE, status: FeedbackStatus.OPEN, rating: 4, daysAgo: 70 },
      { title: 'Page load takes 8+ seconds', description: 'The dashboard takes over 8 seconds to load on a standard broadband connection. Investigated network tab and it seems there are too many unoptimized API calls firing sequentially.', category: FeedbackCategory.PERFORMANCE, status: FeedbackStatus.IN_REVIEW, rating: 2, daysAgo: 65 },
      { title: 'Slack integration for notifications', description: 'We would love to get real-time notifications in our Slack workspace when new feedback is submitted or status changes occur.', category: FeedbackCategory.INTEGRATION, status: FeedbackStatus.OPEN, rating: 5, daysAgo: 62 },
      { title: 'API documentation is outdated', description: 'Several API endpoints documented in the docs no longer exist or have different parameters. Specifically the /v1/export and /v1/webhooks sections are wrong.', category: FeedbackCategory.DOCS, status: FeedbackStatus.RESOLVED, rating: 3, daysAgo: 60 },
      { title: 'Email notification for status updates', description: 'When the status of my submitted feedback changes, I should receive an email notification. Currently I have to manually check back.', category: FeedbackCategory.FEATURE, status: FeedbackStatus.PLANNED, rating: 4, daysAgo: 58 },
      { title: 'Search functionality across feedback', description: 'A search bar to quickly find specific feedback items would be very helpful. Currently you need to scroll through hundreds of items.', category: FeedbackCategory.FEATURE, status: FeedbackStatus.OPEN, rating: 5, daysAgo: 55 },
      { title: 'Keyboard shortcuts for power users', description: 'Add keyboard shortcuts for common actions — J/K for navigation, V for voting, C for commenting, S for status change in admin panel.', category: FeedbackCategory.UX, status: FeedbackStatus.OPEN, rating: 3, daysAgo: 52 },
      { title: 'File attachment support', description: 'Allow attaching screenshots and files when submitting feedback. It is hard to describe UI bugs without being able to show them visually.', category: FeedbackCategory.FEATURE, status: FeedbackStatus.IN_REVIEW, rating: 4, daysAgo: 50 },
      { title: 'Memory leak in Chrome extension', description: 'The companion Chrome extension gradually increases memory usage over time and eventually causes the browser tab to crash after ~2 hours of use.', category: FeedbackCategory.BUG, status: FeedbackStatus.IN_REVIEW, rating: 1, daysAgo: 48 },
      { title: 'GitHub integration for linking issues', description: 'Ability to link feedback items to GitHub issues would streamline our engineering workflow considerably.', category: FeedbackCategory.INTEGRATION, status: FeedbackStatus.OPEN, rating: 5, daysAgo: 45 },
      { title: 'Custom status labels', description: 'Allow administrators to define custom statuses beyond the defaults. Different teams have different workflows.', category: FeedbackCategory.FEATURE, status: FeedbackStatus.DECLINED, rating: 3, daysAgo: 44 },
      { title: 'Mobile app — native iOS and Android', description: 'A native mobile app would be amazing. The mobile web version is functional but lacks push notifications and offline capabilities.', category: FeedbackCategory.FEATURE, status: FeedbackStatus.OPEN, rating: 5, daysAgo: 42 },
      { title: 'Getting started guide is missing', description: 'New users have no onboarding guide. When I first signed up I had no idea how to get started. A step-by-step walkthrough would help greatly.', category: FeedbackCategory.DOCS, status: FeedbackStatus.RESOLVED, rating: 4, daysAgo: 40 },
      { title: 'Jira integration', description: 'Bidirectional sync with Jira would allow our team to manage feedback-driven tasks directly from our existing project management setup.', category: FeedbackCategory.INTEGRATION, status: FeedbackStatus.PLANNED, rating: 4, daysAgo: 38 },
      { title: 'Duplicate detection on submission', description: 'When submitting feedback, automatically check for similar existing items and suggest them to prevent duplicates before they are submitted.', category: FeedbackCategory.FEATURE, status: FeedbackStatus.OPEN, rating: 4, daysAgo: 36 },
      { title: 'Filter by date range', description: 'Add ability to filter feedback by a specific date range. Useful for quarterly analysis and trend identification.', category: FeedbackCategory.FEATURE, status: FeedbackStatus.OPEN, rating: 3, daysAgo: 35 },
      { title: 'Avatar upload broken', description: 'Uploading a custom avatar gives a 500 error every time. Tested on Chrome, Firefox, and Safari. The file is a standard JPG under 1MB.', category: FeedbackCategory.BUG, status: FeedbackStatus.RESOLVED, rating: 2, daysAgo: 34 },
      { title: 'Webhook support for custom integrations', description: 'Add webhook support so we can build custom integrations with our internal tools. Standard payload format with HMAC signing preferred.', category: FeedbackCategory.INTEGRATION, status: FeedbackStatus.IN_REVIEW, rating: 5, daysAgo: 33 },
      { title: 'Improve contrast ratios for accessibility', description: 'Several UI elements fail WCAG AA contrast requirements. The grey text on light backgrounds is particularly hard to read for users with vision impairments.', category: FeedbackCategory.UX, status: FeedbackStatus.RESOLVED, rating: 3, daysAgo: 31 },
      { title: 'Batch status update for admins', description: 'Allow selecting multiple feedback items and updating their status at once. Currently doing this one-by-one is very tedious.', category: FeedbackCategory.FEATURE, status: FeedbackStatus.PLANNED, rating: 4, daysAgo: 29 },
      { title: 'RSS feed for feedback board', description: 'An RSS feed would allow users to subscribe to updates using their preferred feed reader without logging in.', category: FeedbackCategory.FEATURE, status: FeedbackStatus.DECLINED, rating: 2, daysAgo: 28 },
      { title: 'Public roadmap view', description: 'A public-facing roadmap page showing PLANNED and IN_REVIEW items would help users see what is coming without logging in.', category: FeedbackCategory.FEATURE, status: FeedbackStatus.OPEN, rating: 5, daysAgo: 27 },
      { title: 'Sorting does not persist on page refresh', description: 'When I sort by "Most Recent" and refresh the page, it reverts back to "Most Voted". The preference should be saved.', category: FeedbackCategory.BUG, status: FeedbackStatus.OPEN, rating: 3, daysAgo: 26 },
      { title: 'API rate limiting documentation', description: 'The rate limits for the public API are not documented anywhere. Hit a 429 error unexpectedly in production.', category: FeedbackCategory.DOCS, status: FeedbackStatus.RESOLVED, rating: 3, daysAgo: 25 },
      { title: 'Team collaboration features', description: 'Allow multiple team members to collaborate on a response. Internal comments and assignment to specific team members would be very useful.', category: FeedbackCategory.FEATURE, status: FeedbackStatus.IN_REVIEW, rating: 4, daysAgo: 24 },
      { title: 'Performance on large datasets', description: 'When there are more than 500 feedback items, the admin panel becomes very slow. Virtualization or better pagination would fix this.', category: FeedbackCategory.PERFORMANCE, status: FeedbackStatus.IN_REVIEW, rating: 2, daysAgo: 23 },
      { title: 'Zapier integration', description: 'A Zapier connector would allow non-technical users to connect FeedbackHub with hundreds of other tools without writing code.', category: FeedbackCategory.INTEGRATION, status: FeedbackStatus.OPEN, rating: 4, daysAgo: 22 },
      { title: 'Comment threading / replies', description: 'Allow replies to specific comments to create threaded discussions rather than a flat comment list.', category: FeedbackCategory.FEATURE, status: FeedbackStatus.OPEN, rating: 3, daysAgo: 21 },
      { title: 'Broken link in welcome email', description: 'The "confirm your email" link in the welcome email gives a 404 error. Verified this with multiple fresh registrations.', category: FeedbackCategory.BUG, status: FeedbackStatus.RESOLVED, rating: 1, daysAgo: 20 },
      { title: 'Sentiment analysis on feedback', description: 'Automatically analyze the sentiment of feedback text and display a sentiment score. Would help prioritize urgent negative feedback.', category: FeedbackCategory.FEATURE, status: FeedbackStatus.OPEN, rating: 4, daysAgo: 19 },
      { title: 'Changelog / release notes page', description: 'A changelog page where users can see what has been built based on their feedback would close the loop and build trust.', category: FeedbackCategory.DOCS, status: FeedbackStatus.PLANNED, rating: 5, daysAgo: 18 },
      { title: 'Embed widget for external sites', description: 'A small embeddable widget that can be added to any website to collect feedback without requiring users to visit this platform.', category: FeedbackCategory.FEATURE, status: FeedbackStatus.OPEN, rating: 5, daysAgo: 17 },
      { title: 'Drag and drop priority ordering', description: 'Allow admins to drag and drop feedback items to manually set priority order beyond just vote count.', category: FeedbackCategory.UX, status: FeedbackStatus.OPEN, rating: 3, daysAgo: 16 },
      { title: 'Charts not rendering in Firefox', description: 'The analytics dashboard charts are completely blank in Firefox 120+. Works fine in Chrome and Edge.', category: FeedbackCategory.BUG, status: FeedbackStatus.IN_REVIEW, rating: 2, daysAgo: 15 },
      { title: 'IP geolocation for feedback analytics', description: 'Show a world map heatmap of where feedback is coming from. Useful for understanding global user distribution.', category: FeedbackCategory.FEATURE, status: FeedbackStatus.DECLINED, rating: 3, daysAgo: 14 },
      { title: 'Notion integration', description: 'Sync feedback to Notion databases for teams that use Notion as their central knowledge base and project tracker.', category: FeedbackCategory.INTEGRATION, status: FeedbackStatus.OPEN, rating: 4, daysAgo: 13 },
      { title: 'Forgot password flow broken on mobile', description: 'The reset password email link opens in the default browser instead of the app on mobile, causing the token to be invalid by the time users log in.', category: FeedbackCategory.BUG, status: FeedbackStatus.RESOLVED, rating: 1, daysAgo: 12 },
      { title: 'User impersonation for admins', description: 'Allow admins to temporarily view the platform as a specific user for debugging and support purposes.', category: FeedbackCategory.FEATURE, status: FeedbackStatus.OPEN, rating: 3, daysAgo: 11 },
      { title: 'Color-blind friendly status badges', description: 'The current status badge colors (red/green) are indistinguishable for users with red-green color blindness. Add icons or patterns.', category: FeedbackCategory.UX, status: FeedbackStatus.RESOLVED, rating: 4, daysAgo: 10 },
      { title: 'Monthly digest email', description: 'Send a monthly summary email showing new features shipped based on user feedback, top voted items, and overall stats.', category: FeedbackCategory.FEATURE, status: FeedbackStatus.OPEN, rating: 4, daysAgo: 9 },
      { title: 'API docs examples are incorrect', description: 'Several code examples in the API documentation have syntax errors. The Python and JavaScript examples in the authentication section are wrong.', category: FeedbackCategory.DOCS, status: FeedbackStatus.RESOLVED, rating: 2, daysAgo: 8 },
      { title: 'Anonymous feedback option', description: 'Some users are hesitant to submit feedback under their real name. An anonymous submission option would increase participation.', category: FeedbackCategory.FEATURE, status: FeedbackStatus.OPEN, rating: 4, daysAgo: 7 },
      { title: 'Add tags/labels to feedback', description: 'Beyond categories, allow adding multiple free-form tags to feedback for more granular organization and filtering.', category: FeedbackCategory.FEATURE, status: FeedbackStatus.OPEN, rating: 3, daysAgo: 6 },
      { title: 'Input validation missing on feedback form', description: 'The feedback submission form accepts HTML tags in the description field. This is a potential XSS vulnerability that should be addressed immediately.', category: FeedbackCategory.BUG, status: FeedbackStatus.RESOLVED, rating: 1, daysAgo: 5 },
      { title: 'Infinite scroll vs pagination toggle', description: 'Some users prefer infinite scroll while others prefer pagination. Offering both as a user preference would be ideal.', category: FeedbackCategory.UX, status: FeedbackStatus.OPEN, rating: 3, daysAgo: 4 },
      { title: 'Microsoft Teams integration', description: 'Post feedback notifications to Microsoft Teams channels. Many enterprise teams use Teams instead of Slack.', category: FeedbackCategory.INTEGRATION, status: FeedbackStatus.OPEN, rating: 4, daysAgo: 3 },
      { title: 'Custom branding / white-label', description: 'Allow organizations to customize the logo, colors, and domain to match their brand identity. White-labeling is essential for enterprise sales.', category: FeedbackCategory.FEATURE, status: FeedbackStatus.IN_REVIEW, rating: 5, daysAgo: 2 },
      { title: 'Vote count decrements incorrectly', description: 'When un-voting a feedback item, the vote count sometimes goes below the correct number. Appears to be a race condition with concurrent requests.', category: FeedbackCategory.BUG, status: FeedbackStatus.IN_REVIEW, rating: 2, daysAgo: 2 },
      { title: 'AI-powered feedback summarization', description: 'Use AI to automatically summarize groups of similar feedback items so admins can quickly understand common themes without reading every submission.', category: FeedbackCategory.FEATURE, status: FeedbackStatus.OPEN, rating: 5, daysAgo: 1 },
      { title: 'SSO / SAML support', description: 'Enterprise customers need Single Sign-On support. SAML 2.0 and OAuth-based SSO would be essential for our procurement team to approve this tool.', category: FeedbackCategory.FEATURE, status: FeedbackStatus.OPEN, rating: 5, daysAgo: 1 },
      { title: 'Dashboard layout is not customizable', description: 'Admins should be able to rearrange and resize dashboard widgets to match their personal workflow preferences.', category: FeedbackCategory.UX, status: FeedbackStatus.OPEN, rating: 3, daysAgo: 1 },
      { title: 'Response time SLA tracking', description: 'Track and display how long feedback items have been open without a response. SLA breach alerts would help maintain accountability.', category: FeedbackCategory.FEATURE, status: FeedbackStatus.OPEN, rating: 4, daysAgo: 0 },
      { title: 'Broken image thumbnails in email', description: 'Thumbnail images attached to feedback are broken in the email notifications. The URLs are using internal server paths instead of public CDN URLs.', category: FeedbackCategory.BUG, status: FeedbackStatus.OPEN, rating: 2, daysAgo: 0 },
      { title: 'Product tour for new users', description: 'An interactive product tour on first login would help new users discover key features instead of them having to explore blindly.', category: FeedbackCategory.UX, status: FeedbackStatus.PLANNED, rating: 4, daysAgo: 0 },
      { title: 'GraphQL API option', description: 'Offer a GraphQL API in addition to the existing REST API. This would allow clients to fetch exactly the data they need in fewer round trips.', category: FeedbackCategory.INTEGRATION, status: FeedbackStatus.OPEN, rating: 4, daysAgo: 0 },
      { title: 'Offline mode support', description: 'Allow users to draft feedback offline and have it sync when connectivity is restored. Critical for users in areas with unreliable internet.', category: FeedbackCategory.FEATURE, status: FeedbackStatus.OPEN, rating: 3, daysAgo: 0 },
      { title: 'Audit log for admin actions', description: 'Maintain an audit trail of all admin actions (status changes, merges, deletions). Required for compliance in regulated industries.', category: FeedbackCategory.FEATURE, status: FeedbackStatus.OPEN, rating: 4, daysAgo: 0 },
    ];

    const voteDistribution = [28, 24, 22, 21, 19, 18, 17, 16, 15, 15, 14, 13, 13, 12, 12, 11, 11, 10, 10, 9, 9, 8, 8, 8, 7, 7, 6, 6, 6, 5, 5, 5, 5, 4, 4, 4, 4, 3, 3, 3, 3, 3, 2, 2, 2, 2, 2, 2, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0];

    const now = new Date();
    const savedFeedback: Feedback[] = [];

    for (let i = 0; i < feedbackData.length; i++) {
      const fd = feedbackData[i];
      const createdAt = new Date(now.getTime() - fd.daysAgo * 86400000 - Math.random() * 3600000);
      const author = allUsers[i % allUsers.length];
      const fb = this.feedback.create({
        title: fd.title,
        description: fd.description,
        category: fd.category,
        status: fd.status,
        rating: fd.rating,
        vote_count: voteDistribution[i] || 0,
        author,
        created_at: createdAt,
        updated_at: createdAt,
      });
      const saved = await this.feedback.save(fb);
      savedFeedback.push(saved);
    }

    // Insert votes to match vote_count
    const votesToInsert: Partial<Vote>[] = [];
    for (let i = 0; i < savedFeedback.length; i++) {
      const count = voteDistribution[i] || 0;
      const voterPool = allUsers.filter(u => u.id !== savedFeedback[i].author?.id);
      for (let v = 0; v < Math.min(count, voterPool.length); v++) {
        votesToInsert.push({ feedback_id: savedFeedback[i].id, user_id: voterPool[v].id });
      }
    }
    if (votesToInsert.length) await this.votes.save(this.votes.create(votesToInsert as any[]));

    const adminReplies = [
      'Thanks for the detailed report! We have reproduced this and assigned it to our team.',
      'This is a great suggestion — adding it to our Q3 roadmap.',
      'We have fixed this in v2.1.4. Please update and let us know if the issue persists.',
      'Appreciate the feedback! This aligns with our upcoming feature set.',
      'This has been resolved. The fix will be included in the next release.',
      'We have escalated this to our engineering team for investigation.',
      'Great suggestion — we will consider this for a future update.',
    ];

    const userComments = [
      'I completely agree with this request. Would be a game changer for our workflow.',
      'Has there been any update on this? We really need this feature.',
      '+1 to this. Our whole team has been waiting for this.',
      'This is causing major issues for us in production. Please prioritize.',
      'Same issue here. Happens on every browser I have tested.',
      'Would love to see this happen. Happy to beta test if needed.',
      'This would save us hours every week. Please consider prioritizing.',
      'We switched from a competitor specifically for this feature. Would love to see it added.',
    ];

    const commentData: Partial<Comment>[] = [];
    for (let i = 0; i < savedFeedback.length; i++) {
      if (i % 2 === 0) {
        commentData.push({
          feedback_id: savedFeedback[i].id,
          body: adminReplies[i % adminReplies.length],
          is_internal: false,
          author: savedAdmins[i % savedAdmins.length],
        });
      }
      if (i % 3 === 0) {
        commentData.push({
          feedback_id: savedFeedback[i].id,
          body: userComments[i % userComments.length],
          is_internal: false,
          author: allUsers[(i + 5) % allUsers.length],
        });
      }
      if (i % 4 === 0) {
        commentData.push({
          feedback_id: savedFeedback[i].id,
          body: `[Internal] Priority: ${i < 15 ? 'High' : i < 35 ? 'Medium' : 'Low'}. Assigned to sprint ${Math.floor(i / 10) + 1}.`,
          is_internal: true,
          author: savedAdmins[i % savedAdmins.length],
        });
      }
    }

    await this.comments.save(this.comments.create(commentData as any[]));

    console.log(`Seeded: ${savedAdmins.length} admins, ${savedUsers.length} users, ${savedFeedback.length} feedback items, ${votesToInsert.length} votes, ${commentData.length} comments`);
  }
}
