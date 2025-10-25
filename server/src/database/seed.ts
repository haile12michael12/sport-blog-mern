import { storage } from "./storage";
import { hashPassword } from "../modules/user/user.controller";

/**
 * Utility function to create URL-friendly slugs
 */
function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/--+/g, "-")
    .trim();
}

// Asset paths for seeded content
const basketballImage = "/src/assets/generated_images/Basketball_action_featured_post_18bf51a6.png";
const soccerImage = "/src/assets/generated_images/Soccer_celebration_post_thumbnail_d7ed8be6.png";
const baseballImage = "/src/assets/generated_images/Baseball_pitcher_action_shot_b2e0d44d.png";
const tennisImage = "/src/assets/generated_images/Tennis_serve_action_thumbnail_0564dc01.png";
const avatarImage = "/src/assets/generated_images/Professional_author_avatar_4f0495ba.png";

/**
 * Seeds the database with initial data for development
 * Checks if data already exists to prevent duplicate seeding
 */
export async function seedDatabase() {
  console.log("Checking if database needs seeding...");
  
  // Check if database is already seeded by looking for existing users
  const existingUsers = await storage.getUsers();
  if (existingUsers.length > 0) {
    console.log("Database already seeded, skipping...");
    return;
  }

  console.log("Seeding database with initial data...");

  // Create admin user
  const adminPassword = await hashPassword("admin123");
  const admin = await storage.createUser({
    username: "admin",
    email: "admin@sportsblog.com",
    password: adminPassword,
    displayName: "Admin User",
    role: "admin",
  });
  await storage.updateUser(admin.id, { avatar: avatarImage, bio: "Sports Blog Administrator" });

  // Create author users
  const authorPassword = await hashPassword("author123");
  
  const author1 = await storage.createUser({
    username: "johndoe",
    email: "john@sportsblog.com",
    password: authorPassword,
    displayName: "John Doe",
    role: "author",
  });
  await storage.updateUser(author1.id, {
    avatar: avatarImage,
    bio: "Senior Sports Journalist with 10 years of experience covering major leagues.",
  });

  const author2 = await storage.createUser({
    username: "janesmith",
    email: "jane@sportsblog.com",
    password: authorPassword,
    displayName: "Jane Smith",
    role: "author",
  });
  await storage.updateUser(author2.id, {
    avatar: avatarImage,
    bio: "Basketball analyst and former college player. Passionate about the game.",
  });

  // Create reader user
  const readerPassword = await hashPassword("reader123");
  const reader = await storage.createUser({
    username: "reader",
    email: "reader@sportsblog.com",
    password: readerPassword,
    displayName: "Sports Fan",
    role: "reader",
  });

  // Create sample posts
  const post1 = await storage.createPost({
    title: "The Rise of Young Stars in Basketball",
    slug: slugify("The Rise of Young Stars in Basketball"),
    content: `The basketball world has been witnessing an unprecedented surge of young talent in recent years. Players in their early twenties are not just making appearances; they're dominating the court and redefining what it means to be a superstar in the modern era.

This new generation brings a unique blend of athleticism, basketball IQ, and versatility that we've never seen before. They're not confined to traditional positions or playing styles. These young athletes are comfortable handling the ball, shooting from deep, and defending multiple positions.

What's particularly fascinating is how quickly they adapt to the professional level. Unlike previous generations who needed several years to develop, today's young stars are making immediate impacts. They're leading their teams in scoring, assists, and even defensive metrics from day one.

The coaching staffs and front offices have also evolved. They're building systems that maximize these players' unique skill sets rather than forcing them into conventional roles. This symbiotic relationship between young talent and progressive coaching is creating some of the most exciting basketball we've ever witnessed.

Looking ahead, the future of basketball appears brighter than ever. With so many talented young players emerging from different parts of the world, the global game is expanding rapidly. International players are no longer just role players; they're franchise cornerstones and league MVPs.`,
    excerpt: "Exploring how the new generation of basketball players is transforming the game with unprecedented skill and athleticism.",
    featuredImage: basketballImage,
    authorId: author2.id,
    status: "published",
    category: "Basketball",
    tags: ["Basketball", "NBA", "Young Players", "Analysis"],
    isFeatured: true,
    metaDescription: "An in-depth look at how young basketball stars are changing the game with their unique skills and versatility.",
  });
  await storage.updatePost(post1.id, { viewCount: 1250, likeCount: 89 });

  const post2 = await storage.createPost({
    title: "Champions League Final: A Tactical Masterclass",
    slug: slugify("Champions League Final: A Tactical Masterclass"),
    content: `Last night's Champions League final was nothing short of spectacular. Both managers demonstrated tactical brilliance, adjusting their strategies on the fly and making crucial decisions that shaped the outcome of the match.

The game started with an intense pressing system from both sides. The high defensive line created numerous opportunities for counter-attacks, keeping fans on the edge of their seats throughout the first half. The midfield battle was particularly intriguing, with both teams trying to control the tempo.

What stood out was the tactical flexibility displayed by both coaches. When one team pressed high, the other would drop deep and look for long balls. When possession was the focus, we saw intricate passing patterns that dissected defensive lines. This chess match between two tactical geniuses produced some unforgettable moments.

The substitutions in the second half proved decisive. Fresh legs brought new energy and different tactical wrinkles that the opposition struggled to handle. The winning goal came from a perfectly executed set piece, showing that even in modern football, dead-ball situations can be game-changers.

This match will be studied for years to come. It showcased everything beautiful about football: individual brilliance, collective effort, tactical intelligence, and raw passion. Both teams deserve immense credit for delivering such a memorable spectacle.`,
    excerpt: "A detailed analysis of the tactical brilliance displayed in last night's thrilling Champions League final.",
    featuredImage: soccerImage,
    authorId: author1.id,
    status: "published",
    category: "Soccer",
    tags: ["Soccer", "Champions League", "Tactics", "Analysis"],
    isFeatured: true,
    metaDescription: "Tactical breakdown of the Champions League final showcasing strategic brilliance from both teams.",
  });
  await storage.updatePost(post2.id, { viewCount: 2100, likeCount: 156 });

  const post3 = await storage.createPost({
    title: "Baseball's Evolution: Analytics vs. Traditional Scouting",
    slug: slugify("Baseball's Evolution: Analytics vs. Traditional Scouting"),
    content: `The ongoing debate between analytics and traditional scouting in baseball has reached new heights. Modern front offices are trying to find the perfect balance between data-driven decisions and the human element of player evaluation.

Advanced metrics have revolutionized how we understand player performance. Statistics like WAR, OPS+, and exit velocity provide insights that weren't possible a decade ago. Teams are making roster decisions based on these numbers, sometimes controversially so.

However, traditional scouts argue that numbers don't tell the whole story. They point to intangibles like leadership, work ethic, and mental toughness that can't be quantified. A player's character and ability to perform under pressure often make the difference in crucial moments.

The most successful organizations are finding ways to integrate both approaches. They use analytics to identify undervalued talent and optimize strategies, while relying on scouts to assess personality, makeup, and potential for growth.

This evolution is changing baseball at every level. From how players train in the offseason to in-game decision-making, data has become an integral part of the sport. Yet the human element remains irreplaceable.`,
    excerpt: "Examining how baseball teams are balancing advanced analytics with traditional scouting methods.",
    featuredImage: baseballImage,
    authorId: author1.id,
    status: "published",
    category: "Baseball",
    tags: ["Baseball", "Analytics", "MLB", "Scouting"],
    isFeatured: false,
    metaDescription: "The modern baseball debate: how analytics and traditional scouting work together to build championship teams.",
  });
  await storage.updatePost(post3.id, { viewCount: 890, likeCount: 67 });

  const post4 = await storage.createPost({
    title: "Tennis Grand Slam Preview: Who Will Prevail?",
    slug: slugify("Tennis Grand Slam Preview: Who Will Prevail?"),
    content: `As we approach the next Grand Slam tournament, the tennis world is buzzing with anticipation. Several compelling storylines are developing that could make this one of the most memorable tournaments in recent years.

The favorite enters with incredible momentum, having won the last two tournaments convincingly. Their serve has been nearly unstoppable, and their baseline game is firing on all cylinders. However, the pressure of maintaining a winning streak can be overwhelming.

Several dark horses could upset the established order. Young players are showing remarkable maturity and fearlessness. They're not intimidated by big names or big stages. Their aggressive style of play could trouble even the most experienced opponents.

The conditions at this particular venue favor certain playing styles. Players who can adapt their game to the surface and weather will have a significant advantage. Court speed, ball bounce, and altitude all play crucial roles.

Injuries and fatigue are always factors in Grand Slams. The grueling best-of-five format tests both physical and mental endurance. Players who have managed their schedules wisely and stayed healthy will have the best chance of going deep into the tournament.`,
    excerpt: "A comprehensive preview of the upcoming Grand Slam tournament with key players and storylines to watch.",
    featuredImage: tennisImage,
    authorId: author2.id,
    status: "published",
    category: "Tennis",
    tags: ["Tennis", "Grand Slam", "Preview", "Analysis"],
    isFeatured: false,
    metaDescription: "Everything you need to know about the upcoming Grand Slam tournament, including favorites and dark horses.",
  });
  await storage.updatePost(post4.id, { viewCount: 654, likeCount: 45 });

  // Create sample comments
  await storage.createComment({
    postId: post1.id,
    authorId: reader.id,
    parentId: null,
    content: "Great analysis! I totally agree about the versatility of modern players. The game has evolved so much.",
  });

  const comment2 = await storage.createComment({
    postId: post1.id,
    authorId: author1.id,
    parentId: null,
    content: "Excellent article! The point about coaching adaptation is spot on.",
  });

  await storage.createComment({
    postId: post1.id,
    authorId: author2.id,
    parentId: comment2.id,
    content: "Thanks! I think the coach-player relationship is crucial to developing young talent properly.",
  });

  // Create sample teams
  await storage.createTeam({
    name: "Los Angeles Lakers",
    slug: slugify("Los Angeles Lakers"),
    sport: "Basketball",
    bio: "One of the most successful franchises in NBA history with 17 championship titles.",
    foundedYear: 1947,
  });

  await storage.createTeam({
    name: "Manchester United",
    slug: slugify("Manchester United"),
    sport: "Soccer",
    bio: "English football club with a rich history and global fan base.",
    foundedYear: 1878,
  });

  // Create sample players
  await storage.createPlayer({
    name: "LeBron James",
    slug: slugify("LeBron James"),
    sport: "Basketball",
    position: "Forward",
    bio: "Four-time NBA champion and one of the greatest basketball players of all time.",
    stats: JSON.stringify({ ppg: 27.2, apg: 7.4, rpg: 7.5 }),
  });

  // Create sample live commentary
  await storage.createLiveCommentary({
    matchId: "match-001",
    teamHome: "Lakers",
    teamAway: "Warriors",
    scoreHome: 98,
    scoreAway: 95,
    commentary: "LeBron James hits a crucial three-pointer with 2 minutes remaining! The crowd goes wild!",
    matchTime: "Q4 10:00",
    isActive: true,
  });

  await storage.createLiveCommentary({
    matchId: "match-001",
    teamHome: "Lakers",
    teamAway: "Warriors",
    scoreHome: 95,
    scoreAway: 95,
    commentary: "Timeout called by Warriors. This is getting intense!",
    matchTime: "Q4 12:30",
    isActive: true,
  });

  console.log("Database seeding completed successfully!");
  console.log("\nTest accounts:");
  console.log("Admin: admin@sportsblog.com / admin123");
  console.log("Author: john@sportsblog.com / author123");
  console.log("Reader: reader@sportsblog.com / reader123");
}