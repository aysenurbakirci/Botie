// Checks API example
// See: https://developer.github.com/v3/checks/ to learn more

/**
 * This is the main entrypoint to your Probot app
 * @param {import('probot').Probot} app
 */

export default (app) => {
  // PR açıldığında veya güncellendiğinde çalışacak
  app.on(["pull_request.opened", "pull_request.synchronize"], async (context) => {
    const pr = context.payload.pull_request;
    const owner = context.payload.repository.owner.login;
    const repo = context.payload.repository.name;
    const prNumber = pr.number;

    // PR'daki değişiklikleri al
    const { data: files } = await context.octokit.pulls.listFiles({
      owner,
      repo,
      pull_number: prNumber,
    });

    // Toplam eklenen ve çıkarılan satırları hesapla
    let additions = 0;
    let deletions = 0;
    files.forEach(file => {
      additions += file.additions;
      deletions += file.deletions;
    });

    const totalChanges = additions + deletions;

    // PR boyutunu yorum olarak ekle
    const commentBody = `This PR has ${totalChanges} changes (${additions} additions and ${deletions} deletions).`;

    await context.octokit.issues.createComment({
      owner,
      repo,
      issue_number: prNumber,
      body: commentBody,
    });
  });
};