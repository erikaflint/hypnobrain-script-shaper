import { getUncachableGitHubClient } from '../server/github-client';

async function setupRepository() {
  try {
    const octokit = await getUncachableGitHubClient();
    
    // Get authenticated user
    const { data: user } = await octokit.rest.users.getAuthenticated();
    console.log(`Creating repository for user: ${user.login}`);
    
    // Create the repository
    const { data: repo } = await octokit.rest.repos.createForAuthenticatedUser({
      name: 'hypnobrain-script-shaper',
      description: 'HypnoBrain Script Shaper v2.0 - A Positive Language Generator for hypnotherapists featuring Erika Flint\'s 8-Dimensional Hypnosis Framework',
      private: false,
      auto_init: false,
    });
    
    console.log(`✅ Repository created: ${repo.html_url}`);
    console.log(`📦 Clone URL: ${repo.clone_url}`);
    console.log(`🔐 SSH URL: ${repo.ssh_url}`);
    
    return repo;
  } catch (error: any) {
    if (error.status === 422) {
      console.log('Repository already exists, fetching details...');
      const octokit = await getUncachableGitHubClient();
      const { data: user } = await octokit.rest.users.getAuthenticated();
      const { data: repo } = await octokit.rest.repos.get({
        owner: user.login,
        repo: 'hypnobrain-script-shaper',
      });
      console.log(`✅ Found existing repository: ${repo.html_url}`);
      return repo;
    }
    throw error;
  }
}

setupRepository()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Error:', error.message);
    process.exit(1);
  });
